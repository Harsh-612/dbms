import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const currentUserId = cookies().get('userId')?.value

  if (!currentUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId } = params

    const result = await pool.query(
      `SELECT id, username, full_name, avatar_url, bio,
              (SELECT COUNT(*) FROM follows WHERE followed_id = $1) as followers_count,
              EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND followed_id = $1) as is_following
       FROM users
       WHERE id = $1`,
      [userId, currentUserId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result.rows[0]

    const userData = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      followersCount: parseInt(user.followers_count),
      isFollowing: user.is_following
    }

    return NextResponse.json(userData, { status: 200 })
  } catch (error) {
    console.error('Error fetching user hover data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}