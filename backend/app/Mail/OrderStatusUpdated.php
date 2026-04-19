<?php

namespace App\Mail;

use App\Support\LookupCatalog;
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
    public ?string $trackingNumber;
    public string $userName;
    public string $userEmail;
    public array  $items;
    public array  $statusMeta;
    public array  $statusLegend;

    public function __construct(
        string $orderId,
        string $newStatus,
        float  $totalAmount,
        string $deliveryMethod,
        ?string $trackingNumber,
        string $userName,
        string $userEmail,
        array  $items,
    ) {
        $this->orderId        = $orderId;
        $this->newStatus      = $newStatus;
        $this->totalAmount    = $totalAmount;
        $this->deliveryMethod = $deliveryMethod;
        $this->trackingNumber = $trackingNumber;
        $this->userName       = $userName;
        $this->userEmail      = $userEmail;
        $this->items          = $items;
        $this->statusMeta     = LookupCatalog::orderStatusMeta($newStatus);
        $this->statusLegend   = LookupCatalog::orderStatusLegend();
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
