<?php
/**
 * RoboFlow - Classroom Tournament Leaderboard API
 * Standalone, self-hosted on cPanel PHP with SQLite3 / JSON fallback.
 * Ranks students primarily by Net Profit ($).
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$sqliteFile = $dataDir . '/leaderboard.sqlite';
$jsonFile = $dataDir . '/leaderboard.json';

// Initialize SQLite if available, otherwise fallback to JSON
$useSqlite = class_exists('SQLite3');
$db = null;

if ($useSqlite) {
    try {
        $db = new SQLite3($sqliteFile);
        $db->busyTimeout(5000);
        $db->exec('PRAGMA journal_mode = WAL;');
        $db->exec('CREATE TABLE IF NOT EXISTS leaderboard (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            name TEXT NOT NULL,
            email TEXT,
            avatar TEXT,
            school_class TEXT,
            net_profit REAL NOT NULL,
            total_revenue REAL NOT NULL,
            total_expenses REAL NOT NULL,
            on_time_rate REAL NOT NULL,
            orders_delivered INTEGER NOT NULL,
            target_orders INTEGER NOT NULL,
            duration_ticks INTEGER NOT NULL,
            city_id TEXT NOT NULL,
            prompt_snippet TEXT,
            created_at TEXT NOT NULL
        )');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_profit ON leaderboard(net_profit DESC, on_time_rate DESC);');
        $db->exec('CREATE INDEX IF NOT EXISTS idx_user ON leaderboard(user_id);');
    } catch (Exception $e) {
        $useSqlite = false;
        $db = null;
    }
}

// --------------------------------------------------------------------------
// GET Request: Fetch Leaderboard Rankings
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $city = isset($_GET['city']) ? trim($_GET['city']) : 'all';
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50;

    $entries = [];

    if ($useSqlite && $db) {
        $query = 'SELECT * FROM leaderboard ';
        if ($city !== 'all' && !empty($city)) {
            $stmt = $db->prepare('SELECT * FROM leaderboard WHERE city_id = :city ORDER BY net_profit DESC, on_time_rate DESC, duration_ticks ASC LIMIT :limit');
            $stmt->bindValue(':city', $city, SQLITE3_TEXT);
            $stmt->bindValue(':limit', $limit, SQLITE3_INTEGER);
            $result = $stmt->execute();
        } else {
            $stmt = $db->prepare('SELECT * FROM leaderboard ORDER BY net_profit DESC, on_time_rate DESC, duration_ticks ASC LIMIT :limit');
            $stmt->bindValue(':limit', $limit, SQLITE3_INTEGER);
            $result = $stmt->execute();
        }

        $rank = 1;
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $row['rank'] = $rank++;
            $row['net_profit'] = (float)$row['net_profit'];
            $row['total_revenue'] = (float)$row['total_revenue'];
            $row['total_expenses'] = (float)$row['total_expenses'];
            $row['on_time_rate'] = (float)$row['on_time_rate'];
            $row['orders_delivered'] = (int)$row['orders_delivered'];
            $row['target_orders'] = (int)$row['target_orders'];
            $row['duration_ticks'] = (int)$row['duration_ticks'];
            $entries[] = $row;
        }

        // Global statistics
        $countResult = $db->querySingle('SELECT COUNT(*) as cnt, MAX(net_profit) as max_profit, AVG(on_time_rate) as avg_ontime FROM leaderboard', true);
        $stats = [
            'totalParticipants' => (int)($countResult['cnt'] ?? 0),
            'topProfit' => (float)($countResult['max_profit'] ?? 0),
            'avgOnTimeRate' => round((float)($countResult['avg_ontime'] ?? 0), 1)
        ];
    } else {
        // Fallback: Read from JSON file
        $all = [];
        if (file_exists($jsonFile)) {
            $content = file_get_contents($jsonFile);
            $all = json_decode($content, true) ?: [];
        }

        if ($city !== 'all' && !empty($city)) {
            $all = array_filter($all, fn($item) => ($item['city_id'] ?? '') === $city);
        }

        usort($all, function($a, $b) {
            if ($b['net_profit'] !== $a['net_profit']) {
                return $b['net_profit'] <=> $a['net_profit'];
            }
            return $b['on_time_rate'] <=> $a['on_time_rate'];
        });

        $sliced = array_slice($all, 0, $limit);
        $rank = 1;
        foreach ($sliced as $item) {
            $item['rank'] = $rank++;
            $entries[] = $item;
        }

        $stats = [
            'totalParticipants' => count($all),
            'topProfit' => !empty($all) ? (float)$all[0]['net_profit'] : 0,
            'avgOnTimeRate' => !empty($all) ? round(array_sum(array_column($all, 'on_time_rate')) / count($all), 1) : 0
        ];
    }

    echo json_encode([
        'success' => true,
        'count' => count($entries),
        'stats' => $stats,
        'entries' => $entries,
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// --------------------------------------------------------------------------
// POST Request: Submit Student Tournament Result
// --------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!$payload || !is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload']);
        exit;
    }

    // Sanitize and extract payload
    $name = trim(strip_tags($payload['name'] ?? 'Anonymous Student'));
    if (empty($name)) {
        $name = 'RoboArchitect #' . rand(100, 999);
    }

    $userId = trim($payload['userId'] ?? ($payload['email'] ?? md5($name)));
    $email = isset($payload['email']) ? trim(filter_var($payload['email'], FILTER_SANITIZE_EMAIL)) : '';
    $avatar = isset($payload['avatar']) ? trim($payload['avatar']) : '';
    $schoolClass = isset($payload['schoolClass']) ? trim(strip_tags($payload['schoolClass'])) : '';
    
    $netProfit = round((float)($payload['netProfit'] ?? 0), 2);
    $totalRevenue = round((float)($payload['totalRevenue'] ?? 0), 2);
    $totalExpenses = round((float)($payload['totalExpenses'] ?? 0), 2);
    $onTimeRate = round(max(0, min(100, (float)($payload['onTimeRate'] ?? 100))), 1);
    $ordersDelivered = (int)($payload['ordersDelivered'] ?? 100);
    $targetOrders = (int)($payload['targetOrders'] ?? 100);
    $durationTicks = (int)($payload['durationTicks'] ?? 0);
    $cityId = trim($payload['cityId'] ?? 'singapore');
    $promptSnippet = isset($payload['promptSnippet']) ? mb_substr(trim(strip_tags($payload['promptSnippet'])), 0, 300) : '';

    $id = 'rb_' . substr(md5($userId . '_' . $cityId . '_' . time()), 0, 16);
    $now = date('c');

    $finalEntry = [
        'id' => $id,
        'user_id' => $userId,
        'name' => $name,
        'email' => $email,
        'avatar' => $avatar,
        'school_class' => $schoolClass,
        'net_profit' => $netProfit,
        'total_revenue' => $totalRevenue,
        'total_expenses' => $totalExpenses,
        'on_time_rate' => $onTimeRate,
        'orders_delivered' => $ordersDelivered,
        'target_orders' => $targetOrders,
        'duration_ticks' => $durationTicks,
        'city_id' => $cityId,
        'prompt_snippet' => $promptSnippet,
        'created_at' => $now
    ];

    $assignedRank = 1;

    if ($useSqlite && $db) {
        // Check if student already has a personal best record for this city
        $checkStmt = $db->prepare('SELECT id, net_profit FROM leaderboard WHERE user_id = :uid AND city_id = :city');
        $checkStmt->bindValue(':uid', $userId, SQLITE3_TEXT);
        $checkStmt->bindValue(':city', $cityId, SQLITE3_TEXT);
        $existing = $checkStmt->execute()->fetchArray(SQLITE3_ASSOC);

        if ($existing) {
            // Keep personal best: only update if new score is higher or equal
            if ($netProfit >= (float)$existing['net_profit']) {
                $upStmt = $db->prepare('UPDATE leaderboard SET 
                    name = :name, email = :email, avatar = :avatar, school_class = :school_class,
                    net_profit = :net_profit, total_revenue = :total_revenue, total_expenses = :total_expenses,
                    on_time_rate = :on_time_rate, orders_delivered = :orders_delivered, duration_ticks = :duration_ticks,
                    prompt_snippet = :prompt_snippet, created_at = :created_at
                    WHERE id = :id');
                $upStmt->bindValue(':id', $existing['id'], SQLITE3_TEXT);
                $upStmt->bindValue(':name', $name, SQLITE3_TEXT);
                $upStmt->bindValue(':email', $email, SQLITE3_TEXT);
                $upStmt->bindValue(':avatar', $avatar, SQLITE3_TEXT);
                $upStmt->bindValue(':school_class', $schoolClass, SQLITE3_TEXT);
                $upStmt->bindValue(':net_profit', $netProfit, SQLITE3_FLOAT);
                $upStmt->bindValue(':total_revenue', $totalRevenue, SQLITE3_FLOAT);
                $upStmt->bindValue(':total_expenses', $totalExpenses, SQLITE3_FLOAT);
                $upStmt->bindValue(':on_time_rate', $onTimeRate, SQLITE3_FLOAT);
                $upStmt->bindValue(':orders_delivered', $ordersDelivered, SQLITE3_INTEGER);
                $upStmt->bindValue(':duration_ticks', $durationTicks, SQLITE3_INTEGER);
                $upStmt->bindValue(':prompt_snippet', $promptSnippet, SQLITE3_TEXT);
                $upStmt->bindValue(':created_at', $now, SQLITE3_TEXT);
                $upStmt->execute();
                $finalEntry['id'] = $existing['id'];
            }
        } else {
            // Insert new record
            $insStmt = $db->prepare('INSERT INTO leaderboard (
                id, user_id, name, email, avatar, school_class,
                net_profit, total_revenue, total_expenses, on_time_rate,
                orders_delivered, target_orders, duration_ticks, city_id,
                prompt_snippet, created_at
            ) VALUES (
                :id, :user_id, :name, :email, :avatar, :school_class,
                :net_profit, :total_revenue, :total_expenses, :on_time_rate,
                :orders_delivered, :target_orders, :duration_ticks, :city_id,
                :prompt_snippet, :created_at
            )');
            foreach ($finalEntry as $k => $v) {
                $insStmt->bindValue(':' . $k, $v);
            }
            $insStmt->execute();
        }

        // Calculate student rank
        $rankStmt = $db->prepare('SELECT COUNT(*) as higher FROM leaderboard WHERE net_profit > :profit OR (net_profit = :profit AND on_time_rate > :ontime)');
        $rankStmt->bindValue(':profit', $netProfit, SQLITE3_FLOAT);
        $rankStmt->bindValue(':ontime', $onTimeRate, SQLITE3_FLOAT);
        $higherCount = (int)$rankStmt->execute()->fetchArray(SQLITE3_ASSOC)['higher'];
        $assignedRank = $higherCount + 1;

        $totalCount = (int)$db->querySingle('SELECT COUNT(*) FROM leaderboard');
    } else {
        // Fallback JSON handling
        $all = [];
        if (file_exists($jsonFile)) {
            $all = json_decode(file_get_contents($jsonFile), true) ?: [];
        }

        $foundIdx = -1;
        foreach ($all as $idx => $row) {
            if (($row['user_id'] ?? '') === $userId && ($row['city_id'] ?? '') === $cityId) {
                $foundIdx = $idx;
                break;
            }
        }

        if ($foundIdx >= 0) {
            if ($netProfit >= (float)$all[$foundIdx]['net_profit']) {
                $finalEntry['id'] = $all[$foundIdx]['id'];
                $all[$foundIdx] = $finalEntry;
            } else {
                $finalEntry = $all[$foundIdx];
            }
        } else {
            $all[] = $finalEntry;
        }

        usort($all, fn($a, $b) => $b['net_profit'] <=> $a['net_profit']);
        @file_put_contents($jsonFile, json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

        foreach ($all as $idx => $row) {
            if ($row['id'] === $finalEntry['id']) {
                $assignedRank = $idx + 1;
                break;
            }
        }
        $totalCount = count($all);
    }

    $finalEntry['rank'] = $assignedRank;

    echo json_encode([
        'success' => true,
        'message' => 'Tournament result saved successfully!',
        'rank' => $assignedRank,
        'totalParticipants' => $totalCount,
        'entry' => $finalEntry
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
