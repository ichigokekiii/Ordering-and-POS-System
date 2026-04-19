<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
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
                    Order Received
                </div>
                <h1 style="margin:16px 0 8px; font-size:28px; line-height:1.2;">Order Confirmation</h1>
                <p style="margin:0; font-size:14px; line-height:1.7; color:{{ $heroSubtextColor }};">
                    Hi {{ $userName }}, your order has been logged and is now waiting for review.
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
                                <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">{{ $orderId }}</p>
                            </div>
                        </td>
                        <td style="width:50%; vertical-align:top;">
                            <div style="height:100%; border:1px solid #e5e7eb; border-radius:18px; background:#f8fafc; padding:16px;">
                                <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">Payment ID</p>
                                <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">{{ $paymentId }}</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="width:50%; vertical-align:top;">
                            <div style="height:100%; border:1px solid #e5e7eb; border-radius:18px; background:#f8fafc; padding:16px;">
                                <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">Delivery Option</p>
                                <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">{{ ucfirst($deliveryMethod) }}</p>
                            </div>
                        </td>
                        <td style="width:50%; vertical-align:top;">
                            <div style="height:100%; border:1px solid #e5e7eb; border-radius:18px; background:#f8fafc; padding:16px;">
                                <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">Tracking Number</p>
                                <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">{{ $trackingNumber ?: 'To follow once shipped' }}</p>
                            </div>
                        </td>
                    </tr>
                </table>

                <div style="border:1px solid #e5e7eb; border-radius:20px; overflow:hidden; margin-bottom:20px;">
                    <div style="padding:14px 18px; background:#f8fafc; border-bottom:1px solid #e5e7eb;">
                        <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#94a3b8;">
                            Order Items
                        </p>
                    </div>
                    <div style="padding:0 18px; background:#ffffff;">
                        @foreach ($items as $item)
                            <div style="padding:16px 0; border-bottom:1px solid #f1f5f9;">
                                <table style="width:100%; border-collapse:collapse;">
                                    <tr>
                                        <td style="vertical-align:top;">
                                            <p style="margin:0; font-size:15px; font-weight:700; color:#111827;">{{ $item['product_name'] }}</p>
                                            <p style="margin:6px 0 0; font-size:12px; color:#6b7280;">
                                                Quantity: {{ $item['quantity'] }}
                                            </p>
                                            @if (!empty($item['special_message']))
                                                <p style="margin:8px 0 0; font-size:12px; line-height:1.7; color:#92400e;">
                                                    Message: {{ $item['special_message'] }}
                                                </p>
                                            @endif
                                        </td>
                                        <td style="vertical-align:top; text-align:right; white-space:nowrap;">
                                            <p style="margin:0; font-size:15px; font-weight:700; color:#4f6fa5;">
                                                &#8369;{{ number_format((float) ($item['price_at_purchase'] ?? 0), 2) }}
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        @endforeach
                        <div style="padding:18px 0;">
                            <table style="width:100%; border-collapse:collapse;">
                                <tr>
                                    <td style="font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#94a3b8;">Total Amount</td>
                                    <td style="text-align:right; font-size:22px; font-weight:700; color:#0f1b2d;">
                                        &#8369;{{ number_format((float) $totalAmount, 2) }}
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
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
                This is an automated confirmation from Petal Express PH. We will send another update once your order status changes.
            </div>
        </div>
    </div>
</body>
</html>
