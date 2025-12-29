// app/api/unsubscribe/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Confirmation email template for unsubscribe
function getUnsubscribeConfirmationTemplate(email) {
  const resubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`;
  
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
            <a href="${resubscribeUrl}" class="button">Resubscribe to Alerts</a>
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
      // Redirect to error page if parameters are missing
      return NextResponse.redirect(new URL('/unsubscribe/error?message=missing_params', request.url));
    }

    // Verify the subscriber exists and token matches
    const { data: subscriber, error: fetchError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .eq('unsubscribe_token', token)
      .single();

    if (fetchError || !subscriber) {
      // Redirect to error page for invalid token
      return NextResponse.redirect(new URL('/unsubscribe/error?message=invalid_token', request.url));
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        cancelled_at: new Date().toISOString()
      })
      .eq('email', email);

    if (updateError) throw updateError;

    // Send confirmation email using Resend
    try {
      const confirmationHtml = getUnsubscribeConfirmationTemplate(email);
      await resend.emails.send({
        from: 'Weather Alerts <alerts@libertyweather.com>',
        to: email,
        subject: 'Unsubscribed from Weather Alerts',
        html: confirmationHtml,
      });
      console.log('Unsubscribe confirmation email sent to:', email);
    } catch (emailError) {
      console.warn('Failed to send unsubscribe confirmation email:', emailError);
      // Continue even if email fails - unsubscribe is still processed
    }

    // Redirect to success confirmation page
    return NextResponse.redirect(new URL('/unsubscribe/success', request.url));

  } catch (error) {
    console.error('Unsubscribe error:', error);
    // Redirect to error page
    return NextResponse.redirect(new URL('/unsubscribe/error?message=server_error', request.url));
  }
}