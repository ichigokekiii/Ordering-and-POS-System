<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #3B5BDB; padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .header p { color: #c5d0f5; margin: 6px 0 0; font-size: 14px; }

    /* ── Status Banner ── */
    .status-banner { margin: 24px 24px 0; border-radius: 10px; padding: 20px 24px; text-align: center; }
    .status-Pending    { background: #fefce8; border: 1px solid #fde047; color: #854d0e; }
    .status-Processing { background: #eff6ff; border: 1px solid #93c5fd; color: #1e40af; }
    .status-Shipped    { background: #f5f3ff; border: 1px solid #c4b5fd; color: #5b21b6; }
    .status-Delivered  { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
    .status-Cancelled  { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
    .status-banner .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 6px; }
    .status-banner .value { font-size: 24px; font-weight: 800; }

    .body { padding: 24px; }
    .section { margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
    .section-title { background: #f9fafb; padding: 10px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
    .section-body { padding: 16px; font-size: 14px; color: #374151; }
    .section-body p { margin: 4px 0; }
    .section-body .label { color: #9ca3af; font-size: 12px; }

    .item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .item-row:last-child { border-bottom: none; }
    .item-name { font-weight: 600; font-size: 14px; color: #111827; }
    .item-meta { font-size: 12px; color: #9ca3af; margin-top: 2px; }
    .item-price { font-weight: 700; color: #3B5BDB; font-size: 14px; text-align: right; }

    .total-row { display: flex; justify-content: space-between; padding: 16px 0 0; font-size: 16px; font-weight: 800; color: #111827; border-top: 2px solid #e5e7eb; margin-top: 8px; }
    .total-row span:last-child { color: #3B5BDB; }

    /* ── Feedback Section ── */
    .feedback-section { margin: 0 24px 24px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; text-align: center; }
    .feedback-section .emoji { font-size: 32px; margin-bottom: 8px; }
    .feedback-section h3 { margin: 0 0 6px; font-size: 16px; color: #166534; font-weight: 700; }
    .feedback-section p { margin: 0 0 16px; font-size: 13px; color: #4b7a5a; line-height: 1.5; }
    .feedback-btn { display: inline-block; background: #166534; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.3px; }

    .footer { text-align: center; padding: 24px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="wrapper">

    {{-- Header --}}
    <div class="header">
      <h1>Order Status Update</h1>
      <p>Your order {{ $orderId }} has been updated</p>
    </div>

    {{-- Status Banner --}}
    <div class="status-banner status-{{ $newStatus }}">
      <div class="label">Current Status</div>
      <div class="value">{{ $newStatus }}</div>
    </div>

    <div class="body">

      <p style="font-size:14px; color:#6b7280; margin: 0 0 20px;">
        Hi {{ $userName }}, here's a summary of your order along with the updated status.
      </p>

      {{-- Order Info --}}
      <div class="section">
        <div class="section-title">Order Info</div>
        <div class="section-body">
          <p><span class="label">Order ID</span><br>{{ $orderId }}</p>
          <p style="margin-top:8px"><span class="label">Delivery Method</span><br>{{ ucfirst($deliveryMethod) }}</p>
        </div>
      </div>

      {{-- Items --}}
      <div class="section">
        <div class="section-title">Items Ordered</div>
        <div class="section-body">
          @foreach($items as $item)
            <div class="item-row">
              <div>
                <div class="item-name">{{ $item['product_name'] }}</div>
                <div class="item-meta">Qty: {{ $item['quantity'] }}</div>
                @if(!empty($item['special_message']))
                  <div class="item-meta">Message: {{ $item['special_message'] }}</div>
                @endif
              </div>
              <div class="item-price">₱{{ number_format($item['price_at_purchase'], 2) }}</div>
            </div>
          @endforeach

          <div class="total-row">
            <span>Total</span>
            <span>₱{{ number_format($totalAmount, 2) }}</span>
          </div>
        </div>
      </div>

    </div>

    {{-- Feedback Section (only shown when Delivered) --}}
    @if($newStatus === 'Delivered')
    <div class="feedback-section">
      <div class="emoji">🌸</div>
      <h3>How was your experience?</h3>
      <p>
        We hope your order brought a smile! We'd love to hear your thoughts —
        it only takes a minute and helps us serve you better.
      </p>
      {{-- ✏️ Replace the href below with your actual feedback page URL --}}
      <a href="http://localhost:5173/feedback" class="feedback-btn">
        Leave a Review
      </a>
    </div>
    @endif

    <div class="footer">
      This is an automated message from Petal Express PH.<br>
      Please do not reply to this email.
    </div>

  </div>
</body>
</html>