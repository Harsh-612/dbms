import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const followerId = cookies().get('userId')?.value

    // Check if the follow relationship already exists
    const checkQuery = `
      SELECT * FROM follows
      WHERE follower_id = $1 AND followed_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [followerId, userId]);

    let isFollowing: boolean;

    if (checkResult.rows.length > 0) {
      // If the relationship exists, remove it (unfollow)
      const deleteQuery = `
        DELETE FROM follows
        WHERE follower_id = $1 AND followed_id = $2
      `;
      await pool.query(deleteQuery, [followerId, userId]);
      isFollowing = false;
    } else {
      // If the relationship doesn't exist, create it (follow)
      const insertQuery = `
        INSERT INTO follows (follower_id, followed_id)
        VALUES ($1, $2)
      `;
      await pool.query(insertQuery, [followerId, userId]);
      isFollowing = true;
    }

    // Get the updated follower count
    const countQuery = `
      SELECT COUNT(*) as follower_count
      FROM follows
      WHERE followed_id = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const followersCount = parseInt(countResult.rows[0].follower_count);

    return NextResponse.json({ isFollowing, followersCount });
  } catch (error) {
    console.error('Error in follow/unfollow:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}