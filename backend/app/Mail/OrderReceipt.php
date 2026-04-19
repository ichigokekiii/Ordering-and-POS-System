<?php

namespace App\Mail;

use App\Support\LookupCatalog;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public string $orderId;
    public string $paymentId;
    public float  $totalAmount;
    public string $deliveryMethod;
    public ?string $trackingNumber;
    public string $userName;
    public string $userEmail;
    public array  $items;
    public array  $statusMeta;
    public array  $statusLegend;

    /**
     * $items is the array of order_item rows just inserted:
     * [{ product_name, quantity, price_at_purchase, custom_id, premade_id, special_message }, ...]
     */
    public function __construct(
        string $orderId,
        string $paymentId,
        float  $totalAmount,
        string $deliveryMethod,
        ?string $trackingNumber,
        string $userName,
        string $userEmail,
        array  $items,
    ) {
        $this->orderId        = $orderId;
        $this->paymentId      = $paymentId;
        $this->totalAmount    = $totalAmount;
        $this->deliveryMethod = $deliveryMethod;
        $this->trackingNumber = $trackingNumber;
        $this->userName       = $userName;
        $this->userEmail      = $userEmail;
        $this->items          = $items;
        $this->statusMeta     = LookupCatalog::orderStatusMeta('pending');
        $this->statusLegend   = LookupCatalog::orderStatusLegend();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order Confirmation – {$this->orderId}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_receipt',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
