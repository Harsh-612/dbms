import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  const client = await pool.connect()

  try {
    const trendingQuery = `
      WITH recent_content AS (
        SELECT content, created_at
        FROM (
          SELECT content, created_at
          FROM posts
          UNION ALL
          SELECT content, created_at
          FROM comments
        ) AS combined
        ORDER BY created_at DESC
        LIMIT 5
      ),
      extracted_hashtags AS (
        SELECT DISTINCT unnest(
          regexp_matches(content, '#[[:alnum:]]+', 'g')
        ) as hashtag
        FROM recent_content
      )
      SELECT 
        hashtag, 
        COUNT(*) as count
      FROM extracted_hashtags
      GROUP BY hashtag
      ORDER BY count DESC, hashtag
      LIMIT 5
    `

    const result = await client.query(trendingQuery)
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching trending topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending topics' }, 
      { status: 500 }
    )
  } finally {
    client.release()
  }
}