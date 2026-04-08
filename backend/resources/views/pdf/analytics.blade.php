@php
    $peso = '&#8369;';

    $formatValue = function ($value, $type = 'number') use ($peso) {
        $numeric = (float) ($value ?? 0);

        if ($type === 'currency') {
            return $peso . number_format($numeric, 2);
        }

        if ($type === 'percent') {
            return number_format($numeric, 1) . '%';
        }

        if ($type === 'text') {
            return e((string) ($value ?? ''));
        }

        return number_format($numeric);
    };

    $getPolylinePoints = function ($points, $key, $width = 440, $height = 180) {
        if (empty($points)) {
            return '';
        }

        $values = array_map(function ($point) use ($key) {
            return (float) ($point[$key] ?? 0);
        }, $points);

        $maxValue = max($values);
        $maxValue = $maxValue > 0 ? $maxValue : 1;
        $count = count($points);
        $stepX = $count > 1 ? $width / ($count - 1) : $width;
        $coordinates = [];

        foreach ($points as $index => $point) {
            $value = (float) ($point[$key] ?? 0);
            $x = $index * $stepX;
            $y = $height - (($value / $maxValue) * ($height - 40)) - 20;
            $coordinates[] = round($x, 2) . ',' . round($y, 2);
        }

        return implode(' ', $coordinates);
    };

    $getMaxBarValue = function ($points, $key) {
        if (empty($points)) {
            return 1;
        }

        $values = array_map(function ($point) use ($key) {
            return (float) ($point[$key] ?? 0);
        }, $points);

        $maxValue = max($values);

        return $maxValue > 0 ? $maxValue : 1;
    };
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $sectionName }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DejaVu Sans', sans-serif; color: #1e293b; font-size: 11px; line-height: 1.5;">
    <div style="padding: 28px 34px 34px;">
        <div style="border-bottom: 2px solid #4f6fa5; padding-bottom: 16px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="vertical-align: top;">
                        <div style="font-size: 26px; font-weight: 700; color: #4f6fa5; letter-spacing: -0.02em;">Petal Express</div>
                        <div style="margin-top: 8px; font-size: 22px; font-weight: 700; color: #0f172a;">{{ $sectionName }}</div>
                    </td>
                    <td style="vertical-align: top; text-align: right; font-size: 11px; color: #64748b;">
                        Generated on {{ now()->format('M d, Y h:i A') }}
                    </td>
                </tr>
            </table>
        </div>

        <p style="margin: 0 0 18px; color: #64748b; font-size: 12px;">
            A structured summary of recorded metrics, chart highlights, and detailed records for this analytics section.
        </p>

        <table style="width: 100%; border-collapse: separate; border-spacing: 10px 10px; margin: 0 0 22px -10px;">
            @foreach(array_chunk($cards ?? [], 4) as $row)
                <tr>
                    @foreach($row as $card)
                        <td style="width: 25%; vertical-align: top;">
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; min-height: 82px;">
                                <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-bottom: 8px;">
                                    {{ $card['label'] }}
                                </div>
                                <div style="font-size: 16px; font-weight: 700; color: #0f172a;">
                                    {!! $formatValue($card['value'] ?? 0, $card['format'] ?? 'number') !!}
                                </div>
                            </div>
                        </td>
                    @endforeach
                    @for($i = count($row); $i < 4; $i++)
                        <td style="width: 25%;"></td>
                    @endfor
                </tr>
            @endforeach
        </table>

        @if(!empty($chartBlocks))
            <div style="margin: 18px 0 12px; font-size: 18px; font-weight: 700; color: #0f172a;">Visual Summary</div>

            <table style="width: 100%; border-collapse: separate; border-spacing: 12px 12px; margin-left: -12px;">
                @foreach(array_chunk($chartBlocks, 2) as $chartRow)
                    <tr>
                        @foreach($chartRow as $chart)
                            <td style="width: 50%; vertical-align: top;">
                                <div style="border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; padding: 16px;">
                                    <div style="font-size: 13px; font-weight: 700; color: #334155;">{{ $chart['title'] }}</div>
                                    <div style="font-size: 10px; color: #94a3b8; margin-top: 3px; margin-bottom: 12px;">
                                        {{ $chart['subtitle'] ?? 'Period breakdown' }}
                                    </div>

                                    @if(($chart['type'] ?? '') === 'line' && !empty($chart['points']) && !empty($chart['series']))
                                        <svg viewBox="0 0 440 180" preserveAspectRatio="none" style="width: 100%; height: 170px; display: block;">
                                            <line x1="0" y1="160" x2="440" y2="160" stroke="#e2e8f0" stroke-width="1" />
                                            <line x1="0" y1="110" x2="440" y2="110" stroke="#f1f5f9" stroke-width="1" />
                                            <line x1="0" y1="60" x2="440" y2="60" stroke="#f1f5f9" stroke-width="1" />
                                            <line x1="0" y1="10" x2="440" y2="10" stroke="#f1f5f9" stroke-width="1" />

                                            @foreach($chart['series'] as $series)
                                                <polyline
                                                    fill="none"
                                                    stroke="{{ $series['color'] ?? '#4f6fa5' }}"
                                                    stroke-width="3"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    points="{{ $getPolylinePoints($chart['points'], $series['key']) }}"
                                                />
                                            @endforeach
                                        </svg>

                                        <table style="width: 100%; border-collapse: collapse; margin-top: 6px;">
                                            <tr>
                                                @foreach($chart['points'] as $point)
                                                    <td style="font-size: 8px; color: #94a3b8; text-align: center;">
                                                        {{ $point['label'] ?? $point['name'] ?? '' }}
                                                    </td>
                                                @endforeach
                                            </tr>
                                        </table>

                                        <div style="margin-top: 10px; text-align: center;">
                                            @foreach($chart['series'] as $series)
                                                <span style="display: inline-block; margin: 0 8px; font-size: 9px; color: #64748b;">
                                                    <svg width="8" height="8" viewBox="0 0 8 8" style="display: inline-block; margin-right: 4px; vertical-align: middle;">
                                                        <circle cx="4" cy="4" r="4" fill="{{ $series['color'] ?? '#4f6fa5' }}" />
                                                    </svg>
                                                    {{ $series['label'] }}
                                                </span>
                                            @endforeach
                                        </div>
                                    @elseif(($chart['type'] ?? '') === 'bar' && !empty($chart['points']))
                                        @php
                                            $seriesKey = $chart['seriesKey'] ?? 'value';
                                            $maxValue = $getMaxBarValue($chart['points'], $seriesKey);
                                        @endphp
                                        <table style="width: 100%; border-collapse: collapse; margin-top: 4px;">
                                            @foreach($chart['points'] as $point)
                                                @php
                                                    $rawValue = (float) ($point[$seriesKey] ?? 0);
                                                    $barWidth = ($rawValue / $maxValue) * 100;
                                                @endphp
                                                <tr>
                                                    <td style="width: 28%; padding: 6px 0; font-size: 10px; color: #475569;">
                                                        {{ $point['name'] ?? $point['label'] ?? 'Item' }}
                                                    </td>
                                                    <td style="width: 50%; padding: 6px 10px 6px 0;">
                                                        <table style="width: 100%; border-collapse: collapse;">
                                                            <tr>
                                                                <td style="height: 8px; border-radius: 999px; background: #e2e8f0; overflow: hidden;">
                                                                    <table width="{{ max(6, $barWidth) }}%" style="border-collapse: collapse;">
                                                                        <tr>
                                                                            <td style="height: 8px; border-radius: 999px; background: #4f6fa5;"></td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td style="width: 22%; padding: 6px 0; text-align: right; font-size: 10px; font-weight: 700; color: #0f172a;">
                                                        {!! $formatValue($rawValue, $chart['format'] ?? 'number') !!}
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </table>
                                    @else
                                        <div style="padding: 28px 18px; border: 1px dashed #dbe3ee; border-radius: 12px; background: #f8fafc; text-align: center; color: #94a3b8; font-size: 10px;">
                                            No chart data available for this report.
                                        </div>
                                    @endif
                                </div>
                            </td>
                        @endforeach

                        @if(count($chartRow) < 2)
                            <td style="width: 50%;"></td>
                        @endif
                    </tr>
                @endforeach
            </table>
        @endif

        @if(!empty($tableRows))
            <div style="margin: 24px 0 12px; font-size: 18px; font-weight: 700; color: #0f172a;">Detailed Records</div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        @foreach($columns as $column)
                            <th style="background: #edf2f7; color: #475569; text-align: left; padding: 12px 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">
                                {{ $column['label'] }}
                            </th>
                        @endforeach
                    </tr>
                </thead>
                <tbody>
                    @foreach($tableRows as $row)
                        <tr>
                            @foreach($columns as $column)
                                <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 11px; color: #1e293b;">
                                    @php
                                        $cellValue = $row[$column['key']] ?? null;
                                    @endphp

                                    @if(($column['format'] ?? 'text') === 'currency')
                                        {!! $formatValue($cellValue, 'currency') !!}
                                    @elseif(($column['format'] ?? 'text') === 'percent')
                                        {!! $formatValue($cellValue, 'percent') !!}
                                    @elseif(($column['format'] ?? 'text') === 'number')
                                        {!! $formatValue($cellValue, 'number') !!}
                                    @else
                                        {{ $cellValue ?? 'N/A' }}
                                    @endif
                                </td>
                            @endforeach
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        <div style="margin-top: 26px; text-align: center; font-size: 9px; color: #94a3b8;">
            Petal Express Analytics Studio • Confidential Internal Document
        </div>
    </div>
</body>
</html>
