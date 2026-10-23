<?php
/**
 * RoboFlow GitHub -> cPanel Live Auto-Sync Endpoint
 * Verifies cryptographic token and pulls latest roboflow-cpanel.zip from GitHub main branch
 */
header('Content-Type: application/json; charset=utf-8');

$expectedHash = 'c445ec329b9d3d81d2e11881e1880b826d712fb93065d25c62ff0df862be1342';

$providedToken = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? ($_POST['token'] ?? ($_GET['token'] ?? ''));
if (empty($providedToken) || hash('sha256', trim($providedToken)) !== $expectedHash) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized deploy token']);
    exit;
}

$targetDir = '/home2/makerklu/eduagent.makerkluang.com';
if (!is_dir($targetDir)) {
    $targetDir = dirname(__DIR__, 2);
}

$zipUrl = 'https://raw.githubusercontent.com/JohnTan86/Ai_Agent_Edu_Game/main/roboflow-cpanel.zip?t=' . time();
$tmpZip = $targetDir . '/.roboflow_sync_tmp.zip';

$ch = curl_init($zipUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Cache-Control: no-cache, no-store, must-revalidate',
    'User-Agent: RoboFlow-cPanel-Deployer/1.0'
]);
$zipData = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($httpCode !== 200 || empty($zipData)) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Failed to fetch latest build bundle from GitHub',
        'httpCode' => $httpCode,
        'details' => $curlErr
    ]);
    exit;
}

if (file_put_contents($tmpZip, $zipData) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write temporary zip to disk']);
    exit;
}

$extracted = false;
if (class_exists('ZipArchive')) {
    $zip = new ZipArchive();
    if ($zip->open($tmpZip) === true) {
        $zip->extractTo($targetDir);
        $zip->close();
        $extracted = true;
    }
}

if (!$extracted && function_exists('shell_exec')) {
    @shell_exec('unzip -o ' . escapeshellarg($tmpZip) . ' -d ' . escapeshellarg($targetDir));
    $extracted = true;
}

@unlink($tmpZip);

if (!$extracted) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not extract archive (neither ZipArchive nor unzip available)']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Successfully synced latest build from GitHub to ' . $targetDir,
    'timestamp' => gmdate('Y-m-d\TH:i:s\Z')
]);
