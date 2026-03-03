<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class OrderReceipt extends Mailable
{
    public function __construct(
        public string $orderId,
        public string $paymentId,
        public float  $totalAmount,
        public string $deliveryMethod,
        public string $userName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Petal Express Order Confirmation');
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.order-receipt');
    }
}