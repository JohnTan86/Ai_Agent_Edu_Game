<?php
// SushiFlow AI Agent Multi-Agent Dispatch Proxy for cPanel (Apache / LiteSpeed PHP)
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

$role = isset($body['role']) ? $body['role'] : 'host';
$provider = isset($body['provider']) ? $body['provider'] : 'deepseek';
$model = isset($body['model']) ? $body['model'] : '';
$apiKey = isset($body['apiKey']) ? trim($body['apiKey']) : '';
$systemPrompt = isset($body['systemPrompt']) ? $body['systemPrompt'] : '';
$currentTick = isset($body['currentTick']) ? $body['currentTick'] : 0;
$tables = isset($body['tables']) ? $body['tables'] : [];
$customersInQueue = isset($body['customersInQueue']) ? $body['customersInQueue'] : [];
$seatedCustomers = isset($body['seatedCustomers']) ? $body['seatedCustomers'] : [];
$kitchenStations = isset($body['kitchenStations']) ? $body['kitchenStations'] : [];
$activeTickets = isset($body['activeTickets']) ? $body['activeTickets'] : [];
$inventory = isset($body['inventory']) ? $body['inventory'] : [];
$financials = isset($body['financials']) ? $body['financials'] : [];
$enabledTools = isset($body['enabledTools']) ? $body['enabledTools'] : [];

if (empty($apiKey)) {
    http_response_code(400);
    echo json_encode(['error' => "缺少 {$provider} API Key，請在 Multi-Agent 視窗中填入您的 API 金鑰。"]);
    exit;
}

$invLevels = [];
if (is_array($inventory)) {
    foreach ($inventory as $k => $v) {
        $invLevels[$k] = isset($v['currentStock']) ? $v['currentStock'] : 0;
    }
}

$ticketSummaries = [];
if (is_array($activeTickets)) {
    foreach ($activeTickets as $t) {
        $ticketSummaries[] = [
            'id' => $t['id'] ?? '',
            'recipe' => $t['recipeName'] ?? '',
            'status' => $t['status'] ?? '',
            'note' => $t['customNote'] ?? ''
        ];
    }
}

$contextPayload = [
    'tick' => $currentTick,
    'role' => $role,
    'cashBalance' => $financials['balance'] ?? 500,
    'inventoryLevels' => $invLevels,
    'queueCount' => count($customersInQueue),
    'seatedCount' => count($seatedCustomers),
    'activeTickets' => $ticketSummaries,
    'enabledTools' => $enabledTools
];

$promptText = $systemPrompt . "\n\n" .
    "CURRENT RESTAURANT STATE (TICK {$currentTick}):\n" .
    json_encode($contextPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n" .
    "INSTRUCTIONS:\n" .
    "You are role-playing as the AI Agent \"{$role}\".\n" .
    "Based on your role and rules, determine your next action, observation, reasoning, and any tool you want to invoke.\n" .
    "Output strict JSON with format:\n" .
    "{\n" .
    "  \"thought\": \"Your internal chain-of-thought reasoning\",\n" .
    "  \"toolCall\": {\n" .
    "    \"name\": \"one of enabledTools\",\n" .
    "    \"params\": {}\n" .
    "  },\n" .
    "  \"messageToTeam\": \"Optional message to post to other agents\"\n" .
    "}";

function sendCurlJson($url, $payload, $headers = ['Content-Type: application/json']) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    return [$status, $resp, $err];
}

$rawResponseText = '';

if ($provider === 'gemini') {
    $targetModel = $model ?: 'gemini-2.5-flash';
    if ($targetModel === 'gemini-2.0-flash' || $targetModel === 'gemini-2.0-flash-exp') {
        $targetModel = 'gemini-2.5-flash';
    }
    $candidates = array_values(array_unique([$targetModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro']));
    $success = false;
    $lastStatus = 500;
    $lastResp = '';
    $lastErr = '';

    foreach ($candidates as $cand) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$cand}:generateContent?key={$apiKey}";
        $payload = [
            'contents' => [['parts' => [['text' => $promptText]]]],
            'generationConfig' => [
                'temperature' => 0.3,
                'responseMimeType' => 'application/json'
            ]
        ];
        list($status, $resp, $err) = sendCurlJson($url, $payload);
        if ($status >= 200 && $status < 300) {
            $data = json_decode($resp, true);
            $rawResponseText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            $success = true;
            break;
        }
        $lastStatus = $status;
        $lastResp = $resp;
        $lastErr = $err;
        if ($status != 404) break;
    }

    if (!$success) {
        http_response_code($lastStatus ?: 500);
        echo json_encode(['error' => "Gemini API Error ({$lastStatus}): " . ($lastResp ?: $lastErr)]);
        exit;
    }
} elseif ($provider === 'deepseek' || $provider === 'openai') {
    $apiUrl = ($provider === 'deepseek')
        ? 'https://api.deepseek.com/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    $targetModel = $model;
    if (!$targetModel || $targetModel === 'local-heuristic') {
        $targetModel = ($provider === 'deepseek') ? 'deepseek-chat' : 'gpt-4o-mini';
    }

    $payload = [
        'model' => $targetModel,
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $promptText]
        ],
        'temperature' => 0.3
    ];
    if ($targetModel !== 'deepseek-reasoner') {
        $payload['response_format'] = ['type' => 'json_object'];
    }

    list($status, $resp, $err) = sendCurlJson($apiUrl, $payload, [
        'Content-Type: application/json',
        "Authorization: Bearer {$apiKey}"
    ]);

    if ($status < 200 || $status >= 300) {
        $userFriendlyMsg = "{$provider} API 呼叫失敗 (HTTP {$status}): " . ($resp ?: $err);
        if ($status === 401) {
            $userFriendlyMsg = "API Key 認證失敗 (401)：請檢查您輸入的金鑰是否正確（應無多餘前後空白）。";
        } elseif ($status === 402) {
            $userFriendlyMsg = "帳戶餘額不足 (402)：您的 {$provider} API 帳戶已無可用額度，請前往官方後台檢查儲值餘額。";
        } elseif ($status === 404) {
            $userFriendlyMsg = "模型名稱未找到 (404)：找不到模型 \"{$targetModel}\"。";
        }
        http_response_code($status ?: 500);
        echo json_encode(['error' => $userFriendlyMsg, 'raw' => $resp ?: $err]);
        exit;
    }

    $data = json_decode($resp, true);
    $rawResponseText = $data['choices'][0]['message']['content'] ?? '{}';
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
    $parsed = ['rawText' => $rawResponseText];
}

echo json_encode([
    'success' => true,
    'result' => $parsed
]);
