import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import pool from '@/lib/db'

export async function GET() {
  const userId = cookies().get('userId')?.value

  if (!userId) {
    return NextResponse.json({ user: null })
  }

  try {
    const client = await pool.connect()
    try {
      const result = await client.query(
        `SELECT id, username, full_name, email, avatar_url, bio
         FROM users
         WHERE id = $1`,
        [userId]
      )

      if (result.rows.length === 0) {
        // User not found
        return NextResponse.json({ user: null })
      }

      const user = result.rows[0]
      return NextResponse.json({ user })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}