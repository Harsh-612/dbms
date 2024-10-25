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
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Check if the user has already liked the post
      const likeCheck = await client.query(
        'SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      )

      let action: 'liked' | 'unliked'

      if (likeCheck.rows.length > 0) {
        // User has already liked the post, so remove the like
        await client.query(
          'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
          [userId, postId]
        )
        action = 'unliked'
      } else {
        // User hasn't liked the post, so add a like
        await client.query(
          'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
          [userId, postId]
        )
        action = 'liked'
      }

      // Get the updated like count
      const likeCountResult = await client.query(
        'SELECT COUNT(*) as like_count FROM likes WHERE post_id = $1',
        [postId]
      )

      // Update the post's updated_at timestamp
      await client.query(
        'UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [postId]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        action,
        likeCount: parseInt(likeCountResult.rows[0].like_count),
        message: `Post ${action} successfully`
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error liking/unliking post:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}