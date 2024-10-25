import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export async function POST(request: Request) {
  const userId = cookies().get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, content)
       VALUES ($1, $2)
       RETURNING id, created_at`,
      [userId, content]
    )

    const newPost = {
      id: result.rows[0].id,
      content,
      createdAt: result.rows[0].created_at,
      user: {
        id: userId,
        // You might want to fetch the user's details here
      },
      likeCount: 0,
      commentCount: 0,
      isLiked: false
    }

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}