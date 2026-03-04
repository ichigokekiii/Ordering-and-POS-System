<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation</title>
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
      background-color: #f43f5e;
      padding: 32px 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      color: rgba(255,255,255,0.8);
    }
    .body {
      padding: 28px 32px;
    }
    .greeting {
      font-size: 15px;
      margin-bottom: 20px;
      color: #374151;
    }
    .meta-grid {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .meta-box {
      flex: 1;
      background: #f9fafb;
      border-radius: 10px;
      padding: 12px 14px;
    }
    .meta-box .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #9ca3af;
      margin-bottom: 3px;
    }
    .meta-box .value {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #9ca3af;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    thead th {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9ca3af;
      padding: 0 0 8px;
      text-align: left;
      border-bottom: 1px solid #f3f4f6;
    }
    thead th.right { text-align: right; }
    tbody tr td {
      padding: 10px 0;
      font-size: 13px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }
    .item-name { font-weight: 500; color: #111827; }
    .item-meta { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .item-greeting {
      margin-top: 5px;
      background: #fff1f2;
      border-left: 3px solid #f43f5e;
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 11px;
      color: #9f1239;
      font-style: italic;
    }
    .item-greeting .card-label {
      font-style: normal;
      font-weight: 600;
      color: #f43f5e;
      display: block;
      margin-bottom: 2px;
    }
    td.qty   { color: #6b7280; width: 40px; }
    td.price { text-align: right; font-weight: 500; color: #111827; white-space: nowrap; }
    td.free  { text-align: right; font-size: 11px; color: #9ca3af; }
    .totals {
      margin-top: 4px;
      padding-top: 12px;
    }
    .totals .row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .totals .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      border-top: 2px solid #f3f4f6;
      padding-top: 12px;
      margin-top: 6px;
    }
    .totals .total-row span:last-child { color: #f43f5e; }
    .footer {
      background: #f9fafb;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #f3f4f6;
    }
    .footer a { color: #f43f5e; text-decoration: none; }
    .badge {
      display: inline-block;
      background: #fff1f2;
      color: #f43f5e;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <h1>Order Confirmed!</h1>
      <p>Thank you for your order, {{ $userName }}.</p>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">
        Hi <strong>{{ $userName }}</strong>, your order has been received and is currently
        <span class="badge">Pending</span>. We'll notify you once it's confirmed.
      </p>

      <!-- Order meta -->
      <div class="meta-grid">
        <div class="meta-box">
          <div class="label">Order ID</div>
          <div class="value">{{ $orderId }}</div>
        </div>
        <div class="meta-box">
          <div class="label">Payment ID</div>
          <div class="value">{{ $paymentId }}</div>
        </div>
        <div class="meta-box">
          <div class="label">Delivery</div>
          <div class="value" style="text-transform: capitalize;">{{ $deliveryMethod }}</div>
        </div>
      </div>

      <!-- Items table -->
      <div class="section-title">Order Items</div>

      @php
        // Group items: premades by premade_id, customs by custom_id
        // Items with no grouping id are shown individually
        $premadeGroups = [];
        $customGroups  = [];

        foreach ($items as $item) {
            if (!is_null($item['custom_id'])) {
                $customGroups[$item['custom_id']][] = $item;
            } elseif (!is_null($item['premade_id'])) {
                $premadeGroups[$item['premade_id']][] = $item;
            }
        }
      @endphp

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="width:36px;">Qty</th>
            <th class="right">Price</th>
          </tr>
        </thead>
        <tbody>

          {{-- Premade rows --}}
          @foreach ($premadeGroups as $groupId => $rows)
            @php $row = $rows[0]; @endphp
            <tr>
              <td>
                <div class="item-name">{{ $row['product_name'] }}</div>
                <div class="item-meta">Premade Bouquet</div>
                @if (!empty($row['special_message']))
                  <div class="item-greeting">
                    <span class="card-label">Greeting Card</span>
                    {{ $row['special_message'] }}
                  </div>
                @endif
              </td>
              <td class="qty">{{ $row['quantity'] }}</td>
              <td class="price">₱{{ number_format($row['price_at_purchase'], 2) }}</td>
            </tr>
          @endforeach

          {{-- Custom bouquet rows grouped by custom_id --}}
          @foreach ($customGroups as $groupId => $rows)
            @php
              $baseRow = $rows[0]; // first row = bouquet base, holds the greeting message
              $greeting = $baseRow['special_message'] ?? null;
            @endphp
            <tr>
              <td>
                <div class="item-name">Custom Bouquet #{{ $groupId }}</div>
                <div class="item-meta">
                  @foreach ($rows as $r)
                    {{ $r['product_name'] }} ×{{ $r['quantity'] }}@if (!$loop->last), @endif
                  @endforeach
                </div>
                @if ($greeting)
                  <div class="item-greeting">
                    <span class="card-label">💌 Greeting Card</span>
                    {{ $greeting }}
                  </div>
                @endif
              </td>
              <td class="qty">1</td>
              <td class="price">
                ₱{{ number_format(collect($rows)->sum(fn($r) => $r['price_at_purchase']), 2) }}
              </td>
            </tr>
          @endforeach

        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="row">
          <span>Subtotal</span>
          <span>₱{{ number_format($totalAmount, 2) }}</span>
        </div>
        <div class="row">
          <span>Delivery fee</span>
          <span>{{ $deliveryMethod === 'pickup' ? 'Free (Pickup)' : 'Third-party courier' }}</span>
        </div>
        <div class="total-row">
          <span>Total Paid</span>
          <span>₱{{ number_format($totalAmount, 2) }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This is an automated confirmation email. Please do not reply.</p>
      <p style="margin-top:6px;">© {{ date('Y') }} Petal Express PH · All rights reserved.</p>
    </div>

  </div>
</body>
</html>