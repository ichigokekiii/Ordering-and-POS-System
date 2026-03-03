@component('mail::message')
# Thank you for your order, {{ $userName }}!

Your order has been placed successfully.

| Detail | Info |
|---|---|
| Order ID | {{ $orderId }} |
| Payment ID | {{ $paymentId }} |
| Total | ₱{{ number_format($totalAmount, 2) }} |
| Delivery | {{ ucfirst($deliveryMethod) }} |

@component('mail::button', ['url' => 'http://localhost:5173'])
View Our Shop
@endcomponent

Thanks,
{{ config('app.name') }}
@endcomponent