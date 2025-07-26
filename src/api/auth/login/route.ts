
'use server';
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import "dotenv/config";

// Schema for incoming login data
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Schema for server environment variables to ensure they are set.
const envSchema = z.object({
  ADMIN_USERNAME: z.string().min(1, "ADMIN_USERNAME is not set in .env"),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is not set in .env"),
});

export async function POST(request: NextRequest) {
  // 1. Validate environment variables
  const envCheck = envSchema.safeParse(process.env);

  if (!envCheck.success) {
    console.error('Server configuration error:', envCheck.error.flatten().fieldErrors);
    return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 });
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD } = envCheck.data;
  
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.' }, { status: 400 });
    }

    const { username, password } = parsed.data;

    // 2. Check credentials
    // Note: In a real-world scenario, the password would be hashed and compared.
    // For this project, we compare against environment variables.
    const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;

    if (isValid) {
      // 3. Successful login
      // We don't return a token here, the client will set its own session flag.
      // This is a simplification. A real app would use JWTs or sessions.
      return NextResponse.json({ success: true, user: { username } });
    } else {
      // 4. Failed login
      // NOTE: Implementing rate limiting & IP blocking would require a database or Redis
      // to track failed attempts, which is beyond this stateless implementation.
      return NextResponse.json({ success: false, error: 'Incorrect username or password.' }, { status: 401 });
    }

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred.' }, { status: 500 });
  }
}
