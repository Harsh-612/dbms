import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const { username, email, password, fullName } = await request.json()

    // Validate input
    if (!username || !email || !password || !fullName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Insert new user
      const userResult = await client.query(
        'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id',
        [username, email, passwordHash, fullName]
      )

      const userId = userResult.rows[0].id

      // Create session
      const token = uuidv4()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 

      await client.query('COMMIT')

      // Set session cookie
      const response = NextResponse.json({ message: 'User created successfully' }, { status: 201 })
      response.cookies.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: expiresAt
      })
      response.cookies.set('userId',userId,{
        httpOnly:true,
        expires:expiresAt,
      })

      return response
    } catch (error:any) {
      await client.query('ROLLBACK')
      if (error.code === '23505') { // unique_violation
        return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 })
      }
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in signup:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}