
// app/api/unsubscribe/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Confirmation email template for unsubscribe
function getUnsubscribeConfirmationTemplate(email) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribed from Weather Alerts</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">📭 Unsubscribed</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">You've been unsubscribed from weather alerts</p>
        </div>
        
        <div class="content">
          <h2>We're sorry to see you go</h2>
          <p>Hello,</p>
          <p>You've successfully unsubscribed from <strong>Liberty Weather Alerts</strong>.</p>
          
          <p><strong>Email:</strong> ${email}</p>
          
          <p>You will no longer receive severe weather alerts for your location.</p>
          
          <p>If this was a mistake, or if you'd like to resubscribe, you can do so at any time by visiting our website.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="button">Resubscribe to Alerts</a>
          </div>
          
          <p>Stay safe,<br>The Liberty Weather Team</p>
        </div>
        
        <div class="footer">
          <p>Liberty Weather Alerts &copy; ${new Date().getFullYear()}</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing token or email' },
        { status: 400 }
      );
    }

    // Verify the subscriber exists and token matches
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .eq('unsubscribe_token', token)
      .single();

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 400 }
      );
    }

    // Update subscription status
    const { error } = await supabase
      .from('subscribers')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        cancelled_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) throw error;

    // Send confirmation email
    const confirmationHtml = getUnsubscribeConfirmationTemplate(email);
    // Send email using your email service (Resend, SendGrid, etc.)
    // await sendResendEmail(email, 'Unsubscribed from Weather Alerts', confirmationHtml);

    // Redirect to confirmation page or show success
    return NextResponse.redirect(new URL('/unsubscribe-confirmation', request.url));

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}