<?php

namespace App\Mail;

use App\Models\Schedule;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendScheduleBookingMail extends Mailable
{
    use Queueable, SerializesModels;

    public $schedule;
    public $calendarUrl;

    public function __construct(Schedule $schedule, $calendarUrl)
    {
        $this->schedule = $schedule;
        $this->calendarUrl = $calendarUrl;
    }

    public function build()
    {
        return $this->subject('Your Event Booking - ' . $this->schedule->schedule_name)
                    ->view('emails.schedule_booking');
    }
}