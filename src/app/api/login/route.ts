import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Get user by email
      const userResult = await client.query(
        'SELECT id, password_hash FROM users WHERE email = $1',
        [email]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const user = userResult.rows[0]

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)

      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      // Create session
      const token = uuidv4()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now


      // Set session cookie
      const response = NextResponse.json({ message: 'Login successful' })
      response.cookies.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: expiresAt
      })

      const userId = userResult.rows[0].id
      response.cookies.set('userId',userId,{
        httpOnly:true,
        expires:expiresAt,
      })

      return response
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in login:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}