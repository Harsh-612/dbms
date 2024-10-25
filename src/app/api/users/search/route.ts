import { NextResponse } from 'next/server';
import  pool  from '@/lib/db';  


interface User {
  id: string;
  username: string;
  full_name: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ users: [] });
  }

  const query = `
    SELECT id, username, full_name FROM users
    WHERE username ILIKE $1
    LIMIT 10;
  `;

  const values = [`%${username}%`];

  try {
    const result = await pool.query<User>(query, values);
    return NextResponse.json({ users: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}
