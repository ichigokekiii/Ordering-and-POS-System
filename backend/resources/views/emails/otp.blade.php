<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
</head>
@php
    $brandBlue = '#4f6fa5';
    $brandBlueDark = '#3f5b89';
    $brandBlueSoft = '#eef4ff';
@endphp
<body style="margin:0; padding:24px 12px; background:#f7f7fb; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
    <div style="max-width:600px; margin:0 auto;">
        <div style="overflow:hidden; border:1px solid #e5e7eb; border-radius:24px; background:#ffffff; box-shadow:0 12px 32px rgba(15, 23, 42, 0.08);">
            <div style="padding:28px 28px 22px; background:{{ $brandBlue }}; color:#ffffff;">
                <div style="display:inline-block; padding:6px 12px; border-radius:999px; background:rgba(255,255,255,0.18); font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">
                    One-Time Code
                </div>
                <h1 style="margin:16px 0 8px; font-size:28px; line-height:1.2;">Your OTP code</h1>
                <p style="margin:0; font-size:14px; line-height:1.7; color:rgba(255,255,255,0.9);">
                    Use this one-time code to continue your Petal Express verification request.
                </p>
            </div>

            <div style="padding:28px;">
                <div style="border:1px solid #d7e3ff; border-radius:20px; background:{{ $brandBlueSoft }}; padding:24px; text-align:center;">
                    <p style="margin:0 0 10px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#4f6fa5;">
                        One-Time Password
                    </p>
                    <div style="display:inline-block; padding:16px 22px; border:1px solid #c4d5f6; border-radius:18px; background:#ffffff; font-size:32px; font-weight:700; letter-spacing:0.35em; color:{{ $brandBlueDark }};">
                        {{ $otp }}
                    </div>
                    <p style="margin:14px 0 0; font-size:13px; line-height:1.7; color:#64748b;">
                        This OTP expires in 5 minutes.
                    </p>
                </div>

                <div style="margin-top:20px; border:1px solid #e5e7eb; border-radius:20px; background:#ffffff; padding:20px 22px;">
                    <p style="margin:0 0 10px; font-size:14px; line-height:1.7; color:#374151;">
                        Enter this one-time code only on the official Petal Express Ordering and POS System to verify your request.
                    </p>
                    <p style="margin:0; font-size:14px; line-height:1.7; color:#6b7280;">
                        If you did not request this OTP, you can safely ignore this email. No action will be completed without successful verification.
                    </p>
                </div>
            </div>

            <div style="padding:18px 28px 24px; border-top:1px solid #f1f5f9; text-align:center; font-size:12px; line-height:1.7; color:#94a3b8;">
                Petal Express PH automated security email. Never share your OTP or one-time code with anyone.
            </div>
        </div>
    </div>
</body>
</html>
