import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;
  const userId = cookies().get('userId')?.value

  try {
    const postQuery = `
      SELECT 
        p.id, p.content, p.created_at,
        u.id AS user_id, u.username, u.full_name, u.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2) AS is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    const postResult = await pool.query(postQuery, [postId,userId ]);

    if (postResult.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = postResult.rows[0];

    // Fetch comments for the post
    const commentsQuery = `
      SELECT 
        c.id, c.content, c.created_at,
        u.id AS user_id, u.username, u.full_name, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
    `;
    const commentsResult = await pool.query(commentsQuery, [postId]);

    // Construct the response object
    const response = {
      id: post.id,
      content: post.content,
      createdAt: post.created_at,
      likeCount: parseInt(post.like_count),
      commentCount: parseInt(post.comment_count),
      user: {
        id: post.user_id,
        username: post.username,
        fullName: post.full_name,
        avatarUrl: post.avatar_url,
      },
      isLiked: post.is_liked,
      comments: commentsResult.rows.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        user: {
          id: comment.user_id,
          username: comment.username,
          fullName: comment.full_name,
          avatarUrl: comment.avatar_url,
        },
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}