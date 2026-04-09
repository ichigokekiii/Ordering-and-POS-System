<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Account Locked</title>
  <style>
    body {
      margin: 0; padding: 0;
      background-color: #f9fafb;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #374151;
    }
    .wrapper {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .header {
      background-color: #0f1b2d;
      padding: 32px 32px 24px;
      text-align: center;
    }
    .header h1 { margin: 0; font-size: 22px; color: #ffffff; font-weight: 700; letter-spacing: -0.3px; }
    .header p  { margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.7); }
    .badge {
      display: inline-block;
      background: #fef3c7; color: #d97706;
      border: 1px solid #fcd34d;
      font-size: 11px; font-weight: 700;
      padding: 3px 12px; border-radius: 999px;
      letter-spacing: 1px; text-transform: uppercase;
      margin-top: 14px;
    }
    .body { padding: 28px 32px; }
    .greeting { font-size: 15px; margin-bottom: 20px; color: #374151; }
    .notice {
      background: #fffbeb; border-left: 4px solid #f59e0b;
      border-radius: 8px; padding: 14px 18px;
      font-size: 13px; color: #92400e;
      margin: 20px 0; line-height: 1.6;
    }
    .reason-box {
      background: #f9fafb;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .reason-box .label {
      font-size: 10px; text-transform: uppercase;
      letter-spacing: 0.6px; color: #9ca3af; margin-bottom: 8px;
    }
    .reason-box ul {
      margin: 0; padding-left: 18px;
      font-size: 13px; color: #374151; line-height: 1.8;
    }
    .steps {
      margin: 20px 0;
      font-size: 13px;
      color: #374151;
      line-height: 1.8;
    }
    .steps ol {
      padding-left: 18px; margin: 8px 0 0;
    }
    .cta {
      text-align: center;
      margin: 28px 0 20px;
    }
    .cta a {
      display: inline-block;
      background-color: #0f1b2d;
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 999px;
      text-decoration: none;
      letter-spacing: 0.3px;
    }
    .footer {
      background: #f9fafb; padding: 20px 32px;
      text-align: center; font-size: 12px; color: #9ca3af;
      border-top: 1px solid #f3f4f6;
    }
    .footer a { color: #0f1b2d; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <h1>Account Locked</h1>
      <p>Action is required to restore access to your account.</p>
      <span class="badge">Fraud Lock</span>
    </div>

    <div class="body">
      <p class="greeting">Hi <strong>{{ $user->first_name }}</strong>,</p>
      <p style="font-size:13px; color:#6b7280; line-height:1.7; margin-bottom: 20px;">
        Your Petal Express account has been <strong style="color:#d97706;">locked</strong> because repeated order cancellations triggered our fraudulent buying protection rules.
      </p>

      <div class="reason-box">
        <div class="label">Reason for Lock</div>
        <ul>
          <li>Exceeded the allowed limit for consecutive order cancellations</li>
          <li>Repeated cancellations affect our ability to serve other customers</li>
          <li>This is an automated fraud-protection lock</li>
        </ul>
      </div>

      <div class="notice">
        <strong>This account is locked.</strong> Please contact IT support so the team can review your activity and restore access if appropriate.
      </div>

      <div class="steps">
        <strong>What to do next:</strong>
        <ol>
          <li>Reach out to IT support via email below</li>
          <li>Provide your registered email and order details if applicable</li>
          <li>Our team will review and respond with next steps within 1–2 business days</li>
        </ol>
      </div>

      <div class="cta">
        <a href="mailto:support@petalexpress.ph">Contact Support</a>
      </div>

      <p style="font-size:13px; color:#6b7280; line-height:1.7;">
        You can also email us directly at
        <a href="mailto:support@petalexpress.ph" style="color:#0f1b2d; font-weight:600;">support@petalexpress.ph</a>.
        Please include your registered email address and we'll get
