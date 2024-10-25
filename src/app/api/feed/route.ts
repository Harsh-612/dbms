import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const userId = cookies().get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query(
      `SELECT p.id, p.content, p.created_at, 
              u.id as user_id, u.username, u.full_name, u.avatar_url,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
              EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id IN (SELECT followed_id FROM follows WHERE follower_id = $1)
          OR p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 20`,
      [userId]
    )

    const posts = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      user: {
        id: row.user_id,
        username: row.username,
        fullName: row.full_name,
        avatarUrl: row.avatar_url
      },
      likeCount: parseInt(row.like_count),
      commentCount: parseInt(row.comment_count),
      isLiked: row.is_liked
    }))

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}