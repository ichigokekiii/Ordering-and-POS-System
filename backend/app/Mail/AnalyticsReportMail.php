<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AnalyticsReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $sectionName;
    public $pdfData;

    public function __construct($userName, $sectionName, $pdfData)
    {
        $this->userName = $userName;
        $this->sectionName = $sectionName;
        $this->pdfData = $pdfData;
    }

    public function build()
    {
        return $this->subject("Petal Express: {$this->sectionName} Report")
                    ->view('emails.analytics_notification')
                    ->attachData($this->pdfData, "Petal_Express_Report.pdf", [
                        'mime' => 'application/pdf',
                    ]);
    }
}