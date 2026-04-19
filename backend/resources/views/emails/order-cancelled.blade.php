<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Cancelled</title>
</head>
@php
    $heroBackground = $statusMeta['colors']['background'] ?? '#f8fafc';
    $heroTextColor = $statusMeta['colors']['text'] ?? '#334155';
    $heroBadgeBackground = $statusMeta['colors']['border'] ?? '#cbd5e1';
    $heroSubtextColor = $heroTextColor;
@endphp
<body style="margin:0; padding:24px 12px; background:#f7f7fb; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
    <div style="max-width:640px; margin:0 auto;">
        <div style="overflow:hidden; border:1px solid #e5e7eb; border-radius:24px; background:#ffffff; box-shadow:0 12px 32px rgba(15, 23, 42, 0.08);">
            <div style="padding:28px 28px 22px; background:{{ $heroBackground }}; color:{{ $heroTextColor }};">
                <div style="display:inline-block; padding:6px 12px; border-radius:999px; background:{{ $heroBadgeBackground }}; color:{{ $heroTextColor }}; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase;">
                    Order Update
                </div>
                <h1 style="margin:16px 0 8px; font-size:28px; line-height:1.2;">Order Cancelled</h1>
                <p style="margin:0; font-size:14px; line-height:1.7; color:{{ $heroSubtextColor }};">
                    Hi {{ $user->first_name }}, your cancellation request for Order {{ $order->order_id }} has been processed.
                </p>
            </div>

            <div style="padding:28px;">
                <div style="border:1px solid {{ $statusMeta['colors']['border'] }}; border-radius:20px; background:{{ $statusMeta['colors']['background'] }}; padding:18px 20px; margin-bottom:20px;">
                    <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:{{ $statusMeta['colors']['text'] }};">
                        Current Status
                    </p>
                    <p style="margin:0; font-size:24px; font-weight:700; color:{{ $statusMeta['colors']['text'] }};">
                        {{ $statusMeta['label'] }}
                    </p>
                    <p style="margin:8px 0 0; font-size:13px; line-height:1.7; color:{{ $statusMeta['colors']['text'] }};">
                        {{ $statusMeta['description'] }}
                    </p>
                </div>

                <table style="width:100%; border-collapse:separate; border-spacing:0 12px; margin-bottom:16px;">
                    <tr>
                        <td style="width:50%; vertical-align:top;">
                            <div style="height:100%; border:1px solid #e5e7eb; border-radius:18px; background:#f8fafc; padding:16px;">
                                <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">Order ID</p>
                                <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">{{ $order->order_id }}</p>
                            </div>
                        </td>
                        <td style="width:50%; vertical-align:top;">
                            <div style="height:100%; border:1px solid #e5e7eb; border-radius:18px; background:#f8fafc; padding:16px;">
                                <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">Event Date</p>
                                <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">{{ \Carbon\Carbon::parse($schedule->event_date)->format('M j, Y') }}</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="width:50%; vertical-align:top;">
                            <div style="height:100%; border:1px solid #e5e7eb; border-radius:18px; background:#f8fafc; padding:16px;">
                                <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">Delivery Option</p>
                                <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">{{ ucfirst($order->delivery_method) }}</p>
                            </div>
                        </td>
                        <td style="width:50%; vertical-align:top;">
                            <div style="height:100%; border:1px solid #e5e7eb; border-radius:18px; background:#f8fafc; padding:16px;">
                                <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">Refund Reference</p>
                                <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">Follow support instructions if applicable</p>
                            </div>
                        </td>
                    </tr>
                </table>

                <div style="border:1px solid #e5e7eb; border-radius:20px; background:#ffffff; padding:18px 20px; margin-bottom:20px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Order Date</td>
                            <td style="padding:8px 0; text-align:right; font-size:14px; font-weight:700; color:#111827;">{{ \Carbon\Carbon::parse($order->order_date)->format('M j, Y') }}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Event</td>
                            <td style="padding:8px 0; text-align:right; font-size:14px; font-weight:700; color:#111827;">{{ $schedule->schedule_name }}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Refund Amount</td>
                            <td style="padding:8px 0; text-align:right; font-size:18px; font-weight:700; color:#0f1b2d;">&#8369;{{ number_format((float) $order->total_amount, 2) }}</td>
                        </tr>
                    </table>
                </div>

                <div style="border:1px solid #fcd34d; border-radius:20px; background:#fffbeb; padding:18px 20px; margin-bottom:20px;">
                    <p style="margin:0; font-size:13px; line-height:1.8; color:#92400e;">
                        If payment was already made, please allow 5 to 7 business days for refund handling when applicable.
                        Contact support if you need help reviewing the cancellation.
                    </p>
                </div>

                <div style="border:1px solid #e5e7eb; border-radius:20px; background:#ffffff; padding:18px 20px;">
                    <p style="margin:0 0 10px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">
                        Status Guide
                    </p>
                    @foreach ($statusLegend as $legend)
                        <div style="margin-top:{{ $loop->first ? '0' : '10px' }};">
                            <span style="display:inline-block; padding:5px 10px; border:1px solid {{ $legend['colors']['border'] }}; border-radius:999px; background:{{ $legend['colors']['background'] }}; color:{{ $legend['colors']['text'] }}; font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;">
                                {{ $legend['label'] }}
                            </span>
                            <p style="margin:6px 0 0; font-size:12px; line-height:1.7; color:#6b7280;">
                                {{ $legend['description'] }}
                            </p>
                        </div>
                    @endforeach
                </div>
            </div>

            <div style="padding:18px 28px 24px; border-top:1px solid #f1f5f9; text-align:center; font-size:12px; line-height:1.7; color:#94a3b8;">
                This message was sent to {{ $user->email }} by Petal Express PH.
            </div>
        </div>
    </div>
</body>
</html>
