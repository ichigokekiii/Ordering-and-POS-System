<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a202c; background-color: #f7fafc; padding: 40px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #4f6fa5; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
        .content { padding: 40px; }
        .content h2 { color: #2d3748; margin-top: 0; font-size: 20px; }
        .content p { color: #4a5568; font-size: 16px; margin-bottom: 24px; }
        .button-zone { text-align: center; margin-bottom: 24px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7; }
        .footer p { margin: 0; font-size: 12px; color: #a0aec0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Petal Express</h1>
        </div>
        <div class="content">
            <h2>Analytics Report Ready</h2>
            <p>Hello, {{ $userName }}!</p>
            <p>As requested, we have generated the <strong>{{ $sectionName }}</strong> report for the Petal Express Admin Workspace.</p>
            <p>You will find the professional PDF attachment included with this email, containing the latest data visualizations and summaries.</p>
            <p>If you have any questions regarding this data, please contact the system administrator.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Petal Express Analytics Studio. All rights reserved.</p>
        </div>
    </div>
</body>
</html>