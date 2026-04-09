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
        $safeSectionName = preg_replace('/[^A-Za-z0-9]+/', '_', (string) $this->sectionName);
        $safeSectionName = trim((string) $safeSectionName, '_') ?: 'Analytics_Report';

        return $this->subject("Petal Express: {$this->sectionName} Report")
                    ->view('emails.analytics_notification')
                    ->attachData($this->pdfData, "Petal_Express_{$safeSectionName}.pdf", [
                        'mime' => 'application/pdf',
                    ]);
    }
}
