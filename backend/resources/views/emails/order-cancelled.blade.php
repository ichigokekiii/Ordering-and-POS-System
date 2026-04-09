{{-- resources/views/emails/cancel-order-customer.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Cancelled</title>
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
      background: #fee2e2; color: #dc2626;
      border: 1px solid #fca5a5;
      font-size: 11px; font-weight: 700;
      padding: 3px 12px; border-radius: 999px;
      letter-spacing: 1px; text-transform: uppercase;
      margin-top: 14px;
    }
    .body { padding: 28px 32px; }
    .greeting { font-size: 15px; margin-bottom: 20px; color: #374151; }
    .meta-grid { display: flex; gap: 12px; margin-bottom: 24px; }
    .meta-box {
      flex: 1; background: #f9fafb;
      border-radius: 10px; padding: 12px 14px;
    }
    .meta-box .label {
      font-size: 10px; text-transform: uppercase;
      letter-spacing: 0.6px; color: #9ca3af; margin-bottom: 3px;
    }
    .meta-box .value { font-size: 13px; font-weight: 600; color: #111827; }
    .section-title {
      font-size: 12px; text-transform: uppercase;
      letter-spacing: 0.6px; color: #9ca3af; margin-bottom: 10px;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    thead th {
      font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.5px; color: #9ca3af;
      padding: 0 0 8px; text-align: left;
      border-bottom: 1px solid #f3f4f6;
    }
    thead th.right { text-align: right; }
    tbody tr td {
      padding: 10px 0; font-size: 13px;
      border-bottom: 1px solid #f3f4f6; vertical-align: top;
    }
    .item-name  { font-weight: 500; color: #111827; }
    .item-meta  { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    td.qty      { color: #6b7280; width: 40px; }
    td.price    { text-align: right; font-weight: 500; color: #111827; white-space: nowrap; }
    .totals     { margin-top: 4px; padding-top: 12px; }
    .totals .row {
      display: flex; justify-content: space-between;
      font-size: 13px; color: #6b7280; margin-bottom: 6px;
    }
    .totals .total-row {
      display: flex; justify-content: space-between;
      font-size: 16px; font-weight: 700; color: #111827;
      border-top: 2px solid #f3f4f6;
      padding-top: 12px; margin-top: 6px;
    }
    .totals .total-row span:last-child { color: #dc2626; }
    .notice {
      background: #fffbeb; border-left: 4px solid #f59e0b;
      border-radius: 8px; padding: 14px 18px;
      font-size: 13px; color: #92400e;
      margin: 20px 0; line-height: 1.6;
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
      <h1>Order Cancelled</h1>
      <p>We've processed your cancellation request.</p>
      <span class="badge">Cancelled</span>
    </div>

    <div class="body">
      <p class="greeting">Hi <strong>{{ $user->first_name }}</strong>, your order has been successfully cancelled. Here are the details for your reference.</p>

      <div class="meta-grid">
        <div class="meta-box">
          <div class="label">Order ID</div>
          <div class="value">{{ $order->order_id }}</div>
        </div>
        <div class="meta-box">
          <div class="label">Event Date</div>
          <div class="value">{{ \Carbon\Carbon::parse($schedule->event_date)->format('M j, Y') }}</div>
        </div>
        <div class="meta-box">
          <div class="label">Delivery</div>
          <div class="value" style="text-transform:capitalize;">{{ $order->delivery_method }}</div>
        </div>
      </div>

      <div class="section-title">Cancelled Order Summary</div>
      <table>
        <thead>
          <tr>
            <th>Detail</th>
            <th class="right">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><div class="item-name">Order Date</div></td>
            <td class="price">{{ \Carbon\Carbon::parse($order->order_date)->format('M j, Y') }}</td>
          </tr>
          <tr>
            <td><div class="item-name">Event</div></td>
            <td class="price">{{ $schedule->schedule_name }}</td>
          </tr>
          <tr>
            <td><div class="item-name">Status</div></td>
            <td class="price" style="color:#dc2626;">Cancelled</td>
          </tr>
        </tbody>
      </table>

      <div class="totals">
        <div class="row">
          <span>Order Total</span>
          <span>₱{{ number_format($order->total_amount, 2) }}</span>
        </div>
        <div class="total-row">
          <span>Refund Amount</span>
          <span>₱{{ number_format($order->total_amount, 2) }}</span>
        </div>
      </div>

      <div class="notice">
        <strong>Refund Notice:</strong> If a payment was made for this order, please allow 5–7 business days for any applicable refund to be processed. Contact our support team if you have any concerns.
      </div>

      <p style="font-size:13px; color:#6b7280; line-height:1.7;">
        If you did not request this cancellation, please contact us immediately at
        <a href="mailto:support@petalexpress.ph" style="color:#0f1b2d; font-weight:600;">support@petalexpress.ph</a>.
      </p>
    </div>

    <div class="footer">
      <p>This email was sent to <strong>{{ $user->email }}</strong></p>
      <p style="margin-top:6px;">© {{ date('Y') }} Petal Express PH · All rights reserved.</p>
    </div>

  </div>
</body>
</html>