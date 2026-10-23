<?php
// RoboFlow AI Agent Dispatch Proxy for cPanel (Apache / LiteSpeed PHP)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

if (!$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON request body']);
    exit;
}

$provider = isset($body['provider']) ? $body['provider'] : 'gemini';
$model = isset($body['model']) ? $body['model'] : '';
$apiKey = isset($body['apiKey']) ? trim($body['apiKey']) : '';
$systemPrompt = isset($body['systemPrompt']) ? $body['systemPrompt'] : '';
$currentTick = isset($body['currentTick']) ? $body['currentTick'] : 0;
$orders = isset($body['orders']) && is_array($body['orders']) ? $body['orders'] : [];
$robots = isset($body['robots']) && is_array($body['robots']) ? $body['robots'] : [];
$hubs = isset($body['hubs']) && is_array($body['hubs']) ? $body['hubs'] : [];
$trafficHotspots = isset($body['trafficHotspots']) ? $body['trafficHotspots'] : [];
$enabledTools = isset($body['enabledTools']) ? $body['enabledTools'] : [];
$candidateNodes = isset($body['candidateNodes']) ? $body['candidateNodes'] : [];
$balance = isset($body['financials']['balance']) ? number_format((float)$body['financials']['balance'], 2, '.', '') : '200.00';
$weather = isset($body['environment']['weather']) ? strtoupper($body['environment']['weather']) : 'CLEAR';
$rushHour = !empty($body['environment']['rushHourActive']) ? 'ACTIVE (up to 4.2x travel delay on major avenues)' : 'OFF (normal traffic flow)';
$roadClosure = !empty($body['environment']['roadClosureNodeId']) ? 'Node "' . $body['environment']['roadClosureNodeId'] . '" is CLOSED for emergency roadworks' : 'None (all roads open)';

if (empty($apiKey)) {
    http_response_code(400);
    echo json_encode(['error' => "Missing API Key for provider \"{$provider}\". Please enter your API Key in the Agent Workspace."]);
    exit;
}

$pendingOrders = [];
foreach ($orders as $o) {
    if (isset($o['status']) && $o['status'] === 'pending') {
        $pendingOrders[] = [
            'id' => $o['id'] ?? '',
            'sender' => $o['sender'] ?? '',
            'pickupHubId' => $o['pickupHubId'] ?? '',
            'recipient' => $o['recipientAddress'] ?? null,
            'deadlineTick' => $o['deadlineTick'] ?? 0,
            'remainingTicks' => ($o['deadlineTick'] ?? 0) - $currentTick,
            'reward' => $o['reward'] ?? 0,
            'weightKg' => $o['weightKg'] ?? 0
        ];
    }
}

$promptContext = "SIMULATION TICK: {$currentTick}\n\n"
    . "COMPANY CASH RESERVES: \${$balance}\n\n"
    . "CITY LOGISTICS HUBS (Pickup points & charging infrastructure):\n" . json_encode($hubs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n"
    . "CANDIDATE BUILD NODES FOR NEW HUBS:\n" . json_encode($candidateNodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n"
    . "CURRENT PENDING ORDERS:\n" . json_encode($pendingOrders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n"
    . "FLEET TELEMETRY:\n" . json_encode($robots, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n"
    . "CONGESTED TRAFFIC ZONES:\n" . json_encode($trafficHotspots, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n"
    . "ENVIRONMENTAL CONDITIONS:\n"
    . "- Weather: {$weather}\n"
    . "- Rush Hour Peak Congestion: {$rushHour}\n"
    . "- Active Road Closures: {$roadClosure}\n\n"
    . "ENABLED TOOLS:\n" . json_encode($enabledTools, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n"
    . "INSTRUCTIONS & SEQUENTIAL PLANNING PROTOCOL:\n"
    . "You are the Autonomous Fleet Dispatcher. Follow the User's System Prompt protocol strictly.\n"
    . "1. Plan the ENTIRE delivery itinerary upfront for ALL pending orders across available robots in dispatchActions.\n"
    . "2. Use the exact order IDs from CURRENT PENDING ORDERS and exact robot IDs from FLEET TELEMETRY.\n"
    . "3. Respond with ONLY a valid JSON object matching this schema:\n"
    . "{\n"
    . "  \"thoughtProcess\": \"Step-by-step reasoning explaining your triage strategy, battery checks, infrastructure actions, and order prioritization.\",\n"
    . "  \"toolCalls\": [{ \"tool\": \"check_robot_telemetry\", \"rationale\": \"Evaluated fleet telemetry and hubs\" }],\n"
    . "  \"infrastructureActions\": [],\n"
    . "  \"dispatchActions\": [{ \"orderId\": \"string\", \"assignedRobotId\": \"string\", \"priorityReasoning\": \"Detailed justification\" }]\n"
    . "}";

function sendCurlJson($url, $payload, $headers = ['Content-Type: application/json']) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    return [$status, $response, $err];
}

$rawResponseText = '';
$tokensUsed = 0;

if ($provider === 'gemini') {
    $reqModel = $model ?: 'gemini-2.0-flash';
    if ($reqModel === 'gemini-1.5-flash-latest') $reqModel = 'gemini-1.5-flash';
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$reqModel}:generateContent?key={$apiKey}";
    $payload = [
        'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
        'contents' => [['role' => 'user', 'parts' => [['text' => $promptContext]]]],
        'generationConfig' => ['temperature' => 0.2, 'responseMimeType' => 'application/json']
    ];
    list($status, $resp, $err) = sendCurlJson($url, $payload);
    if ($status < 200 || $status >= 300) {
        http_response_code($status ?: 500);
        echo json_encode(['error' => "Gemini API Error ({$status}): " . ($resp ?: $err)]);
        exit;
    }
    $data = json_decode($resp, true);
    $rawResponseText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
    $tokensUsed = ($data['usageMetadata']['promptTokenCount'] ?? 0) + ($data['usageMetadata']['candidatesTokenCount'] ?? 0);
} elseif ($provider === 'openai') {
    $reqModel = $model ?: 'gpt-4o-mini';
    $url = 'https://api.openai.com/v1/chat/completions';
    $payload = [
        'model' => $reqModel,
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $promptContext]
        ],
        'temperature' => 0.2,
        'response_format' => ['type' => 'json_object']
    ];
    list($status, $resp, $err) = sendCurlJson($url, $payload, [
        'Content-Type: application/json',
        "Authorization: Bearer {$apiKey}"
    ]);
    if ($status < 200 || $status >= 300) {
        http_response_code($status ?: 500);
        echo json_encode(['error' => "OpenAI API Error ({$status}): " . ($resp ?: $err)]);
        exit;
    }
    $data = json_decode($resp, true);
    $rawResponseText = $data['choices'][0]['message']['content'] ?? '{}';
    $tokensUsed = $data['usage']['total_tokens'] ?? 0;
} elseif ($provider === 'deepseek') {
    $reqModel = $model ?: 'deepseek-chat';
    $url = 'https://api.deepseek.com/chat/completions';
    $payload = [
        'model' => $reqModel,
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $promptContext]
        ],
        'temperature' => 0.2
    ];
    list($status, $resp, $err) = sendCurlJson($url, $payload, [
        'Content-Type: application/json',
        "Authorization: Bearer {$apiKey}"
    ]);
    if ($status < 200 || $status >= 300) {
        http_response_code($status ?: 500);
        echo json_encode(['error' => "DeepSeek API Error ({$status}): " . ($resp ?: $err)]);
        exit;
    }
    $data = json_decode($resp, true);
    $rawResponseText = $data['choices'][0]['message']['content'] ?? '{}';
    $tokensUsed = $data['usage']['total_tokens'] ?? 0;
}

$cleaned = trim($rawResponseText);
if (strpos($cleaned, '```') === 0) {
    $cleaned = preg_replace('/^```(?:json)?\s*/i', '', $cleaned);
    $cleaned = preg_replace('/\s*```$/i', '', $cleaned);
    $cleaned = trim($cleaned);
}
$parsed = json_decode($cleaned, true);
if (!$parsed && preg_match('/\{[\s\S]*\}/', $rawResponseText, $m)) {
    $parsed = json_decode($m[0], true);
}
if (!$parsed) {
    $parsed = [];
}

if (!$tokensUsed) {
    $tokensUsed = round((strlen($systemPrompt) + strlen($promptContext) + strlen($rawResponseText)) / 3.8);
}

echo json_encode([
    'success' => true,
    'provider' => $provider,
    'model' => $model,
    'rawResponseText' => $rawResponseText,
    'thoughtProcess' => $parsed['thoughtProcess'] ?? 'Dispatch actions computed successfully.',
    'toolCalls' => $parsed['toolCalls'] ?? [],
    'infrastructureActions' => isset($parsed['infrastructureActions']) && is_array($parsed['infrastructureActions']) ? $parsed['infrastructureActions'] : [],
    'dispatchActions' => isset($parsed['dispatchActions']) && is_array($parsed['dispatchActions']) ? $parsed['dispatchActions'] : [],
    'tokensUsed' => $tokensUsed
], JSON_UNESCAPED_UNICODE);
