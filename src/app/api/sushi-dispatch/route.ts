import { NextRequest, NextResponse } from 'next/server';

interface SushiDispatchRequest {
  role: 'host' | 'chef' | 'inventory' | 'manager';
  provider: 'gemini' | 'openai' | 'deepseek';
  model?: string;
  apiKey?: string;
  systemPrompt: string;
  currentTick: number;
  tables: any[];
  customersInQueue: any[];
  seatedCustomers: any[];
  kitchenStations: any[];
  activeTickets: any[];
  inventory: any;
  financials: any;
  enabledTools: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body: SushiDispatchRequest = await req.json();
    const {
      role,
      provider = 'gemini',
      model,
      apiKey: userApiKey,
      systemPrompt,
      currentTick,
      tables,
      customersInQueue,
      seatedCustomers,
      kitchenStations,
      activeTickets,
      inventory,
      financials,
      enabledTools
    } = body;

    // Resolve API Key
    let apiKey = userApiKey;
    if (!apiKey) {
      if (provider === 'gemini') {
        apiKey = process.env.GEMINI_API_KEY;
      } else if (provider === 'openai') {
        apiKey = process.env.OPENAI_API_KEY;
      } else if (provider === 'deepseek') {
        apiKey = process.env.DEEPSEEK_API_KEY;
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: `Missing API Key for provider "${provider}". Please enter your API Key in the Multi-Agent Workspace or set ${provider.toUpperCase()}_API_KEY.`
        },
        { status: 400 }
      );
    }

    const contextPayload = {
      tick: currentTick,
      role,
      cashBalance: financials?.balance ?? 500,
      inventoryLevels: Object.fromEntries(
        Object.entries(inventory || {}).map(([k, v]: [string, any]) => [k, v.currentStock])
      ),
      queueCount: customersInQueue?.length || 0,
      seatedCount: seatedCustomers?.length || 0,
      activeTickets: (activeTickets || []).map((t: any) => ({
        id: t.id,
        recipe: t.recipeName,
        status: t.status,
        note: t.customNote
      })),
      enabledTools
    };

    const promptText = `
${systemPrompt}

CURRENT RESTAURANT STATE (TICK ${currentTick}):
${JSON.stringify(contextPayload, null, 2)}

INSTRUCTIONS:
You are role-playing as the AI Agent "${role}".
Based on your role and rules, determine your next action, observation, reasoning, and any tool you want to invoke.
Output strict JSON with format:
{
  "thought": "Your internal chain-of-thought reasoning",
  "toolCall": {
    "name": "one of enabledTools",
    "params": {}
  },
  "messageToTeam": "Optional message to post to other agents"
}
`;

    if (provider === 'gemini') {
      let targetModel = model || 'gemini-2.5-flash';
      if (targetModel === 'gemini-2.0-flash' || targetModel === 'gemini-2.0-flash-exp') {
        targetModel = 'gemini-2.5-flash';
      }
      const candidateModels = Array.from(new Set([targetModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro']));
      let successfulData: any = null;
      let lastErrText = '';

      for (const cand of candidateModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cand}:generateContent?key=${apiKey}`;
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.3,
                responseMimeType: 'application/json'
              }
            })
          });

          if (res.ok) {
            successfulData = await res.json();
            break;
          } else {
            lastErrText = await res.text();
            if (res.status === 404) continue;
            break;
          }
        } catch (e: any) {
          lastErrText = e.message;
        }
      }

      if (!successfulData) {
        return NextResponse.json({ error: `Gemini API Error: ${lastErrText}` }, { status: 502 });
      }

      const outputText = successfulData.candidates?.[0]?.content?.parts?.[0]?.text;
      let parsed = {};
      try {
        parsed = JSON.parse(outputText);
      } catch {
        parsed = { rawText: outputText };
      }

      return NextResponse.json({ success: true, result: parsed });
    }

    // OpenAI or DeepSeek (Chat Completions format)
    const apiUrl =
      provider === 'deepseek'
        ? 'https://api.deepseek.com/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    let targetModel = model;
    if (!targetModel || targetModel === 'local-heuristic') {
      targetModel = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
    }

    const requestPayload: any = {
      model: targetModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText }
      ],
      temperature: 0.3
    };

    // DeepSeek-reasoner (R1) does not support response_format: { type: 'json_object' }
    if (targetModel !== 'deepseek-reasoner') {
      requestPayload.response_format = { type: 'json_object' };
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      let userFriendlyMsg = `${provider} API 呼叫失敗 (HTTP ${res.status}): ${errText}`;
      if (res.status === 401) {
        userFriendlyMsg = `DeepSeek API Key 認證失敗 (401)：請檢查您輸入的金鑰是否正確（應為 sk- 開頭且無多餘空白）。`;
      } else if (res.status === 402) {
        userFriendlyMsg = `DeepSeek 帳戶餘額不足 (402)：您的 DeepSeek API 帳戶已無可用額度，請前往 platform.deepseek.com 檢查儲值餘額。`;
      } else if (res.status === 404) {
        userFriendlyMsg = `DeepSeek 模型名稱未找到 (404)：找不到模型 "${targetModel}"，請改用 "deepseek-chat" 或 "deepseek-reasoner"。`;
      }
      return NextResponse.json({ error: userFriendlyMsg, raw: errText }, { status: res.status });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    let parsed = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { rawText: content };
    }

    return NextResponse.json({ success: true, result: parsed });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
