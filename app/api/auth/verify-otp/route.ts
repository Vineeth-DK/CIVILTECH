import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: Request) {
  try {
    const { username, otp } = await request.json();
    const record = otpStore.get(username.toLowerCase());

    if (!record) {
      return NextResponse.json({ success: false, error: 'No OTP found or expired' }, { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(username.toLowerCase());
      return NextResponse.json({ success: false, error: 'OTP expired' }, { status: 400 });
    }

    if (record.otp === otp) {
      otpStore.delete(username.toLowerCase());
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
