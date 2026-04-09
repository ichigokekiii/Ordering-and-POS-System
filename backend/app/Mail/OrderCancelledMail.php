<?php
// app/Mail/OrderCancelledMail.php

namespace App\Mail;

use App\Models\Order;
use App\Models\Schedule;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order    $order;
    public object   $user;
    public Schedule $schedule;

    public function __construct(Order $order, object $user, Schedule $schedule)
    {
        $this->order    = $order;
        $this->user     = $user;
        $this->schedule = $schedule;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Order #' . $this->order->order_id . ' Has Been Cancelled',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-cancelled',
        );
    }
}