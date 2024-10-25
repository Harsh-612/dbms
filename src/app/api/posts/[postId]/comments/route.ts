import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  const userId = cookies().get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = params

  try {
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Check if the post exists
      const postCheck = await client.query('SELECT id FROM posts WHERE id = $1', [postId])
      if (postCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      // Insert the new comment
      const result = await client.query(
        `INSERT INTO comments (user_id, post_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, created_at`,
        [userId, postId, content]
      )

      // Get user information
      const userResult = await client.query(
        'SELECT id, username, full_name, avatar_url FROM users WHERE id = $1',
        [userId]
      )

      await client.query('COMMIT')

      const newComment = {
        id: result.rows[0].id,
        content,
        createdAt: result.rows[0].created_at,
        user: userResult.rows[0]
      }

      return NextResponse.json(newComment, { status: 201 })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}