@php
    $peso = '&#8369;';
    $theme = $theme ?? ['accent' => '#4f6fa5', 'soft' => '#eaf2ff', 'deep' => '#1d4ed8'];
    $reportVariant = $reportVariant ?? 'section';
    $summaryCards = $summaryCards ?? [];
    $supportingCards = $supportingCards ?? [];
    $visualBlocks = $visualBlocks ?? [];
    $detailTables = $detailTables ?? [];
    $focusCard = $focusCard ?? null;
    $palette = ['#4f6fa5', '#e76f51', '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6'];

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

    $getDistributionTotal = function ($points, $key) {
        return array_sum(array_map(function ($point) use ($key) {
            return (float) ($point[$key] ?? 0);
        }, $points));
    };

    $cardsToRender = !empty($summaryCards) ? $summaryCards : $supportingCards;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $sectionName }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DejaVu Sans', sans-serif; color: #1e293b; font-size: 11px; line-height: 1.5; background: #ffffff;">
    <div style="padding: 28px 34px 34px;">
        <div style="border: 1px solid #e2e8f0; border-top: 6px solid {{ $theme['accent'] }}; border-radius: 22px; overflow: hidden; margin-bottom: 24px;">
            <div style="background: {{ $theme['soft'] }}; padding: 22px 24px 18px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="vertical-align: top;">
                            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: {{ $theme['deep'] }}; margin-bottom: 10px;">
                                Petal Express Analytics
                            </div>
                            <div style="font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">{{ $sectionName }}</div>
                            <div style="margin-top: 10px;">
                                <span style="display: inline-block; border-radius: 999px; background: #ffffff; border: 1px solid {{ $theme['accent'] }}; color: {{ $theme['deep'] }}; padding: 6px 12px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em;">
                                    {{ $sectionLabel ?? 'Analytics' }} • {{ $reportVariant === 'single' ? 'Focused Export' : 'Section Report' }}
                                </span>
                            </div>
                        </td>
                        <td style="vertical-align: top; text-align: right; font-size: 11px; color: #64748b;">
                            Generated on {{ now()->format('M d, Y h:i A') }}
                        </td>
                    </tr>
                </table>
            </div>
            <div style="padding: 18px 24px 22px;">
                <p style="margin: 0; font-size: 12px; color: #475569;">
                    {{ $reportDescription ?? 'Structured analytics summary for the selected export.' }}
                </p>
            </div>
        </div>

        @if($reportVariant === 'single')
            <div style="margin-bottom: 22px; border-radius: 20px; background: #ffffff; border: 1px solid #dbeafe; overflow: hidden;">
                <div style="background: {{ $theme['accent'] }}; color: #ffffff; padding: 12px 18px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em;">
                    Focus Snapshot
                </div>
                <div style="padding: 22px 20px;">
                    @if(!empty($focusCard))
                        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #64748b; margin-bottom: 8px;">
                            {{ $focusCard['label'] ?? 'Selected Metric' }}
                        </div>
                        <div style="font-size: 30px; font-weight: 700; color: #0f172a; letter-spacing: -0.03em;">
                            {!! $formatValue($focusCard['value'] ?? 0, $focusCard['format'] ?? 'number') !!}
                        </div>
                        @if(isset($focusCard['change']) && $focusCard['change'] !== null)
                            <div style="margin-top: 10px; display: inline-block; border-radius: 999px; background: {{ $theme['soft'] }}; color: {{ $theme['deep'] }}; padding: 4px 10px; font-size: 9px; font-weight: 700;">
                                {{ $focusCard['change'] > 0 ? '+' : '' }}{{ number_format((float) $focusCard['change'], 1) }}% change
                            </div>
                        @endif
                        @if(!empty($focusCard['description']))
                            <p style="margin: 14px 0 0; font-size: 11px; color: #475569;">
                                {{ $focusCard['description'] }}
                            </p>
                        @endif
                    @else
                        <div style="font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">{{ $sectionName }}</div>
                        <p style="margin: 12px 0 0; font-size: 11px; color: #475569;">
                            {{ $reportDescription ?? 'Focused export prepared from the current analytics selection.' }}
                        </p>
                    @endif
                </div>
            </div>
        @endif

        @if(!empty($cardsToRender))
            <div style="margin: 18px 0 12px; font-size: 18px; font-weight: 700; color: #0f172a;">
                {{ $reportVariant === 'single' ? 'Supporting Metrics' : 'Section Highlights' }}
            </div>

            <table style="width: 100%; border-collapse: separate; border-spacing: 10px 10px; margin: 0 0 22px -10px;">
                @foreach(array_chunk($cardsToRender, 4) as $row)
                    <tr>
                        @foreach($row as $card)
                            <td style="width: 25%; vertical-align: top;">
                                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; min-height: 96px;">
                                    <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: {{ $theme['deep'] }}; margin-bottom: 8px;">
                                        {{ $card['label'] }}
                                    </div>
                                    <div style="font-size: 16px; font-weight: 700; color: #0f172a;">
                                        {!! $formatValue($card['value'] ?? 0, $card['format'] ?? 'number') !!}
                                    </div>
                                    @if(!empty($card['description']))
                                        <div style="margin-top: 8px; font-size: 10px; color: #64748b;">
                                            {{ $card['description'] }}
                                        </div>
                                    @endif
                                </div>
                            </td>
                        @endforeach
                        @for($i = count($row); $i < 4; $i++)
                            <td style="width: 25%;"></td>
                        @endfor
                    </tr>
                @endforeach
            </table>
        @endif

        @if(!empty($visualBlocks))
            <div style="margin: 18px 0 12px; font-size: 18px; font-weight: 700; color: #0f172a;">Visual Summary</div>

            <table style="width: 100%; border-collapse: separate; border-spacing: 12px 12px; margin-left: -12px;">
                @foreach(array_chunk($visualBlocks, 2) as $chartRow)
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
                                                    stroke="{{ $series['color'] ?? $theme['accent'] }}"
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
                                                        <circle cx="4" cy="4" r="4" fill="{{ $series['color'] ?? $theme['accent'] }}" />
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
                                                                            <td style="height: 8px; border-radius: 999px; background: {{ $chart['color'] ?? $theme['accent'] }};"></td>
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
                                    @elseif(($chart['type'] ?? '') === 'distribution' && !empty($chart['points']))
                                        @php
                                            $seriesKey = $chart['seriesKey'] ?? 'value';
                                            $totalValue = $getDistributionTotal($chart['points'], $seriesKey);
                                        @endphp
                                        <table style="width: 100%; border-collapse: collapse; margin-top: 4px;">
                                            @foreach($chart['points'] as $index => $point)
                                                @php
                                                    $rawValue = (float) ($point[$seriesKey] ?? 0);
                                                    $share = $totalValue > 0 ? ($rawValue / $totalValue) * 100 : 0;
                                                    $color = $palette[$index % count($palette)];
                                                @endphp
                                                <tr>
                                                    <td style="width: 32%; padding: 7px 0; font-size: 10px; color: #475569;">
                                                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 999px; background: {{ $color }}; margin-right: 6px;"></span>
                                                        {{ $point['name'] ?? $point['label'] ?? 'Item' }}
                                                    </td>
                                                    <td style="width: 38%; padding: 7px 10px 7px 0;">
                                                        <table style="width: 100%; border-collapse: collapse;">
                                                            <tr>
                                                                <td style="height: 8px; border-radius: 999px; background: #e2e8f0; overflow: hidden;">
                                                                    <table width="{{ max(6, $share) }}%" style="border-collapse: collapse;">
                                                                        <tr>
                                                                            <td style="height: 8px; border-radius: 999px; background: {{ $color }};"></td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td style="width: 14%; padding: 7px 0; text-align: right; font-size: 10px; color: #64748b;">
                                                        {{ number_format($share, 1) }}%
                                                    </td>
                                                    <td style="width: 16%; padding: 7px 0; text-align: right; font-size: 10px; font-weight: 700; color: #0f172a;">
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

        @if(!empty($detailTables))
            <div style="margin: 24px 0 12px; font-size: 18px; font-weight: 700; color: #0f172a;">Detailed Records</div>

            @foreach($detailTables as $table)
                <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                    <div style="background: {{ $theme['soft'] }}; padding: 14px 16px; border-bottom: 1px solid #dbeafe;">
                        <div style="font-size: 13px; font-weight: 700; color: #334155;">{{ $table['title'] }}</div>
                        @if(!empty($table['subtitle']))
                            <div style="margin-top: 4px; font-size: 10px; color: #64748b;">{{ $table['subtitle'] }}</div>
                        @endif
                    </div>

                    @if(!empty($table['rows']))
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    @foreach($table['columns'] as $column)
                                        <th style="background: #ffffff; color: #475569; text-align: left; padding: 12px 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">
                                            {{ $column['label'] }}
                                        </th>
                                    @endforeach
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($table['rows'] as $row)
                                    <tr>
                                        @foreach($table['columns'] as $column)
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
                    @else
                        <div style="padding: 24px 18px; text-align: center; color: #94a3b8; font-size: 10px;">
                            {{ $table['emptyMessage'] ?? 'No detailed rows available for this report.' }}
                        </div>
                    @endif
                </div>
            @endforeach
        @endif

        <div style="margin-top: 26px; text-align: center; font-size: 9px; color: #94a3b8;">
            Petal Express Analytics Studio • Confidential Internal Document
        </div>
    </div>
</body>
</html>
