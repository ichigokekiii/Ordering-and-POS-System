<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Schedule Booking</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">

    <h2>{{ $schedule->schedule_name }}</h2>

    <p>{{ $schedule->schedule_description }}</p>

    <p>
        <strong>Date:</strong>
        {{ \Carbon\Carbon::parse($schedule->event_date)->format('F d, Y') }}
    </p>

    <p>
        <strong>Location:</strong>
        {{ $schedule->location ?? 'Location coming soon' }}
    </p>

    <br>

    <a href="{{ $calendarUrl }}"
       style="display:inline-block;
              padding:12px 20px;
              background-color:#5C6F9E;
              color:#ffffff;
              text-decoration:none;
              border-radius:6px;">
        Add to Google Calendar
    </a>

    <p style="margin-top:20px;">
        We look forward to seeing you!
    </p>

</body>
</html>