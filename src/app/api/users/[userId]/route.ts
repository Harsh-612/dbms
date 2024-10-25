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

    const userResult = await pool.query(
      `SELECT id, username, full_name, avatar_url, bio,
              (SELECT COUNT(*) FROM follows WHERE followed_id = $1) as followers_count,
              (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count,
              EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND followed_id = $1) as is_following
       FROM users
       WHERE id = $1`,
      [userId, currentUserId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    const postsResult = await pool.query(
      `SELECT p.id, p.content, p.created_at,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
              EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2) as is_liked
       FROM posts p
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 10`,
      [userId, currentUserId]
    )

    const userData = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      followersCount: parseInt(user.followers_count),
      followingCount: parseInt(user.following_count),
      isFollowing: user.is_following,
      posts: postsResult.rows.map(post => ({
        id: post.id,
        content: post.content,
        createdAt: post.created_at,
        likeCount: parseInt(post.like_count),
        commentCount: parseInt(post.comment_count),
        isLiked: post.is_liked
      }))
    }

    return NextResponse.json(userData, { status: 200 })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}