import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    otpStore.set(username.toLowerCase(), { otp, expiresAt });
    
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
    const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

    console.log(`[OTP GENERATED for ${username}]: ${otp}`);

    if (accessToken && phoneNumberId && adminPhone) {
      await axios.post(
        `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: adminPhone,
          type: 'template',
          template: {
            name: 'admin_otp_verification',
            language: { code: 'en_US' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: username },
                  { type: 'text', text: otp },
                ]
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      console.warn('Meta WhatsApp credentials missing. Skipping actual API call.');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}
