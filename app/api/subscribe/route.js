// app/api/subscribe/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate unsubscribe token
function generateUnsubscribeToken(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'your-secret-key';
  return crypto
    .createHmac('sha256', secret)
    .update(email + Date.now().toString())
    .digest('hex');
}

// Email transporter setup (using Resend or other email service)
// For Resend.com (recommended for Next.js)
async function sendResendEmail(to, subject, html) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Weather Alerts <alerts@libertyweather.com>',
      to,
      subject,
      html,
    }),
  });

  return response.json();
}

// Welcome email template
function getWelcomeEmailTemplate(email, location, unsubscribeToken) {
 const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(email)}`;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Weather Alerts</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .location-badge { display: inline-block; background: #f1f3f9; padding: 8px 16px; border-radius: 20px; font-family: monospace; margin: 5px 0; }
        .warning { color: #e74c3c; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">⚡ Weather Alerts</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Stay safe with real-time weather notifications</p>
        </div>
        
        <div class="content">
          <h2>Welcome aboard!</h2>
          <p>Hello,</p>
          <p>You've successfully subscribed to <strong>Liberty Weather Alerts</strong>. We'll notify you immediately when severe weather threatens your area.</p>
          
          <div class="alert-box">
            <h3 style="margin-top: 0;">📍 Your Alert Location</h3>
            <div class="location-badge">
              ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}
            </div>
            <p>You'll receive alerts for severe weather within 50 miles of this location.</p>
          </div>
          
          <h3>🔔 What to expect:</h3>
          <ul>
            <li><strong>Severe Thunderstorm Warnings</strong> ⛈️</li>
            <li><strong>Tornado Warnings</strong> 🌪️</li>
            <li><strong>Flash Flood Warnings</strong> 🌊</li>
            <li><strong>Winter Storm Warnings</strong> ❄️</li>
            <li><strong>Hurricane Warnings</strong> 🌀</li>
          </ul>
          
          <div class="alert-box">
            <p class="warning">⚠️ IMPORTANT: Our alerts are supplemental to official warnings. Always follow instructions from local authorities during emergencies.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="button">View Current Alerts</a>
          </div>
          
          <p>Need to make changes?</p>
          <p>
            <a href="${unsubscribeUrl}" style="color: #e74c3c; text-decoration: none;">
              🛑 Unsubscribe from all alerts
            </a>
          </p>
        </div>
        
        <div class="footer">
          <p>Liberty Weather Alerts &copy; ${new Date().getFullYear()}</p>
          <p>This is an automated service. Please do not reply to this email.</p>
          <p>Our mailing address: Liberty Hail, Weather Alert System</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/privacy" style="color: #666; text-decoration: none;">Privacy Policy</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/terms" style="color: #666; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Alert email template
function getAlertEmailTemplate(alert, email, unsubscribeToken) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(email)}`;
  const severityColors = {
    'Extreme': '#e74c3c',
    'Severe': '#e67e22',
    'Moderate': '#f1c40f',
    'Minor': '#3498db'
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weather Alert: ${alert.event}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert-header { background: ${severityColors[alert.severity] || '#e74c3c'}; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .severity-badge { display: inline-block; background: ${severityColors[alert.severity] || '#e74c3c'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .info-box { background: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; }
        .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .button { display: inline-block; background: ${severityColors[alert.severity] || '#e74c3c'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .timestamp { color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="alert-header">
          <h1 style="margin: 0; font-size: 24px;">🚨 ${alert.event}</h1>
          <p style="margin: 10px 0 0; opacity: 0.9; font-size: 18px;">${alert.headline}</p>
        </div>
        
        <div class="content">
          <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            <span class="severity-badge">${alert.severity}</span>
            <span class="severity-badge" style="background: #e67e22;">${alert.urgency} Urgency</span>
            <span class="severity-badge" style="background: #2ecc71;">${alert.certainty} Certainty</span>
          </div>
          
          <div class="info-box">
            <p><strong>⏰ Effective:</strong> ${new Date(alert.start).toLocaleString()}</p>
            <p><strong>⏰ Expires:</strong> ${new Date(alert.end).toLocaleString()}</p>
            ${alert.areaDesc ? `<p><strong>📍 Affected Areas:</strong> ${alert.areaDesc}</p>` : ''}
          </div>
          
          <h3>📋 Description</h3>
          <p style="white-space: pre-line;">${alert.description}</p>
          
          ${alert.instruction ? `
            <div class="warning-box">
              <h3 style="margin-top: 0; color: #e74c3c;">⚠️ RECOMMENDED ACTIONS</h3>
              <p style="white-space: pre-line; font-weight: bold;">${alert.instruction}</p>
            </div>
          ` : ''}
          
          <div class="warning-box">
            <h3 style="margin-top: 0;">ℹ️ Safety Reminder</h3>
            <p>This is an automated weather alert. Always follow instructions from local emergency services and authorities. Have an emergency plan ready.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="button">View All Active Alerts</a>
          </div>
          
          <div class="timestamp">
            Alert sent: ${new Date().toLocaleString()}
          </div>
        </div>
        
        <div class="footer">
          <p>You received this alert because you subscribed to weather alerts for your location.</p>
          <p>
            <a href="${unsubscribeUrl}" style="color: #e74c3c; text-decoration: none;">
              🛑 Unsubscribe from all alerts
            </a>
          </p>
          <p>Liberty Weather Alerts &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, location } = body;

    // Validate input
    if (!email || !location || !location.lat || !location.lon) {
      return NextResponse.json(
        { error: 'Email and location are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate unsubscribe token
    const unsubscribeToken = generateUnsubscribeToken(email);

    // Check if already subscribed
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (existingSubscriber) {
      // Update existing subscription
      const { error } = await supabase
        .from('subscribers')
        .update({
          location: location,
          unsubscribe_token: unsubscribeToken,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) throw error;
    } else {
      // Create new subscription
      const { error } = await supabase
        .from('subscribers')
        .insert([
          {
            email: email,
            location: location,
            unsubscribe_token: unsubscribeToken,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    }

    // Send welcome email
    const welcomeEmailHtml = getWelcomeEmailTemplate(email, location, unsubscribeToken);
    const emailResult = await sendResendEmail(email, 'Welcome to Weather Alerts! ⚡', welcomeEmailHtml);

    if (emailResult.error) {
      console.warn('Failed to send welcome email:', emailResult.error);
      // Continue even if email fails - subscription is still saved
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to weather alerts',
      emailSent: !emailResult.error
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}