
import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { Resend } from 'resend';

// Schema for incoming contact form data
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10).max(500),
});

// Schema for server environment variables to ensure they are set correctly.
const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "Resend API key is missing from .env"),
});

// Hardcode the recipient email to comply with Resend's sandbox policy.
const RESEND_RECIPIENT_EMAIL = 'spekulus.mirror@gmail.com';

export async function POST(request: NextRequest) {
  // Validate environment variables first to ensure server is configured.
  const envCheck = envSchema.safeParse(process.env);

  if (!envCheck.success) {
    console.error('Server configuration error:', envCheck.error.flatten().fieldErrors);
    return NextResponse.json({ success: false, error: 'Server is not configured for sending emails.' }, { status: 500 });
  }

  const { RESEND_API_KEY } = envCheck.data;
  const resend = new Resend(RESEND_API_KEY);

  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.' }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    const { data, error } = await resend.emails.send({
        from: 'Spekulus Vision <onboarding@resend.dev>',
        to: [RESEND_RECIPIENT_EMAIL],
        subject: `New Message from ${name} via SpekulusVision.com`,
        reply_to: email,
        html: `
            <p>You have received a new message from your website contact form.</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `,
    });

    if (error) {
      // Log the detailed error on the server for debugging
      console.error('Resend API error:', error);
      // Return a more specific error to the client for better debugging
      return NextResponse.json({ success: false, error: (error as Error).message || 'Error sending message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    console.error('Error in contact form API:', error);
    // Handle cases where the request body is not valid JSON
    if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, error: 'Invalid request format.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Server error. Please try again later.' }, { status: 500 });
  }
}
