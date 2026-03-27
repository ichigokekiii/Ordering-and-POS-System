<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public string $orderId;
    public string $newStatus;
    public float  $totalAmount;
    public string $deliveryMethod;
    public string $userName;
    public string $userEmail;
    public array  $items;

    public function __construct(
        string $orderId,
        string $newStatus,
        float  $totalAmount,
        string $deliveryMethod,
        string $userName,
        string $userEmail,
        array  $items,
    ) {
        $this->orderId        = $orderId;
        $this->newStatus      = $newStatus;
        $this->totalAmount    = $totalAmount;
        $this->deliveryMethod = $deliveryMethod;
        $this->userName       = $userName;
        $this->userEmail      = $userEmail;
        $this->items          = $items;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order Update – {$this->orderId} is now {$this->newStatus}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_status_updated',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}