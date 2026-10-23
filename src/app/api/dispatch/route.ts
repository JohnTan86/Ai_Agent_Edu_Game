import { NextRequest, NextResponse } from 'next/server';

interface DispatchRequestBody {
  provider: 'gemini' | 'openai' | 'deepseek';
  model?: string;
  apiKey?: string;
  systemPrompt: string;
  currentTick: number;
  orders: any[];
  robots: any[];
  hubs?: any[];
  trafficHotspots: any[];
  enabledTools: string[];
  financials?: {
    balance?: number;
    totalRevenue?: number;
    totalExpenses?: number;
  };
  candidateNodes?: any[];
  environment?: {
    weather?: string;
    rushHourActive?: boolean;
    roadClosureNodeId?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: DispatchRequestBody = await req.json();
    const {
      provider = 'gemini',
      model,
      apiKey: userApiKey,
      systemPrompt,
      currentTick,
      orders,
      robots,
      hubs,
      trafficHotspots,
      enabledTools
    } = body;

    // Resolve API Key (from request or environment variable)
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
          error: `Missing API Key for provider "${provider}". Please enter your API Key in the Agent Workspace or set ${provider.toUpperCase()}_API_KEY.`
        },
        { status: 400 }
      );
    }

    // Build LLM Input Context
    const pendingOrders = orders.filter((o: any) => o.status === 'pending');
    const availableRobots = robots.filter((r: any) => r.status === 'idle');

    const promptContext = `
SIMULATION TICK: ${currentTick}

COMPANY CASH RESERVES: $${Number(body.financials?.balance ?? 200).toFixed(2)}

CITY LOGISTICS HUBS (Pickup points & charging infrastructure):
${JSON.stringify(
  (hubs || []).map((h: any) => ({
    id: h.id,
    name: h.name,
    level: h.level || 1,
    chargingBays: h.chargingBays || 2,
    chargingRatePerTick: h.chargingRatePerTick || (h.level === 3 ? 14 : (h.level === 2 ? 9 : 6)),
    position: h.position
  })),
  null,
  2
)}

CANDIDATE BUILD NODES FOR NEW HUBS (Corridors where new hubs can be constructed):
${JSON.stringify(body.candidateNodes || [], null, 2)}

CURRENT PENDING ORDERS:
${JSON.stringify(
  pendingOrders.map((o: any) => ({
    id: o.id,
    sender: o.sender,
    pickupHubId: o.pickupHubId,
    recipient: o.recipientAddress,
    deadlineTick: o.deadlineTick,
    remainingTicks: o.deadlineTick - currentTick,
    reward: o.reward,
    weightKg: o.weightKg
  })),
  null,
  2
)}

FLEET TELEMETRY:
${JSON.stringify(
  robots.map((r: any) => ({
    id: r.id,
    name: r.name,
    archetype: r.archetype || 'standard',
    maxOrdersCapacity: r.maxOrdersCapacity || (r.archetype === 'heavy' ? 2 : 1),
    carriedOrderIds: r.carriedOrderIds || [],
    status: r.status,
    position: r.position,
    batteryPct: Math.round(r.batteryPct),
    maxCapacityKg: r.maxCapacityKg,
    currentPayloadKg: r.currentPayloadKg,
    homeHubId: r.homeHubId
  })),
  null,
  2
)}

CONGESTED TRAFFIC ZONES:
${JSON.stringify(trafficHotspots || [], null, 2)}

ENVIRONMENTAL CONDITIONS:
- Weather: ${(body.environment?.weather || 'clear').toUpperCase()} (Rain: +35% battery drain; Typhoon: +75% battery drain, +25% hazard reward)
- Rush Hour Peak Congestion: ${body.environment?.rushHourActive ? 'ACTIVE (up to 4.2x travel delay on major avenues)' : 'OFF (normal traffic flow)'}
- Active Road Closures: ${body.environment?.roadClosureNodeId ? `Node "${body.environment.roadClosureNodeId}" is CLOSED for emergency roadworks` : 'None (all roads open)'}

ENABLED TOOLS:
${JSON.stringify(enabledTools || [], null, 2)}

INSTRUCTIONS & SEQUENTIAL PLANNING PROTOCOL:
You are the Autonomous Fleet Dispatcher. Follow the User's System Prompt protocol strictly.

CRITICAL DISPATCH MANDATE:
1. You must plan the ENTIRE delivery itinerary upfront for ALL pending orders!
2. Do NOT just assign 1 or 2 orders and leave other pending orders unassigned. You MUST plan EVERY pending order across available robots in dispatchActions.
3. If a single robot can fulfill multiple orders in sequence (e.g. Robot 1 delivers Order 1, then returns to Hub to pick up and deliver Order 2, then Order 3), output ALL corresponding dispatch actions in \`dispatchActions\` in their exact chronological execution sequence for that robot.
4. You MUST use the exact order IDs provided in CURRENT PENDING ORDERS (e.g. "L1-ORD-01", "L1-ORD-02", "L1-ORD-03") and the exact robot ID from FLEET TELEMETRY (e.g. "singapore-bot-01").
5. The dispatch engine will chain these actions into a continuous, zero-idle mission queue so the robot never stalls at customer dropoffs waiting for intermediate API calls.
6. In \`thoughtProcess\`, detail your complete sequential roadmap, explaining the delivery order for all pending orders.
7. MULTI-DROP BATCHING (Heavy Hauler / Cargo Expansion): Robots with archetype "heavy" or maxOrdersCapacity >= 2 can carry up to 2 packages at once! When assigning 2 orders from the same hub to a multi-capacity robot, it loads both at the hub and delivers them consecutively: Hub -> Dropoff 1 -> Dropoff 2 without returning to the hub between deliveries. Maximize this when prompt requests multi-drop or batch delivery.
8. INFRASTRUCTURE & HUB EXPANSION (build_charging_hub / upgrade_charging_hub): If the user's prompt instructs infrastructure expansion (e.g. "when balance > $X, build a new hub" or "upgrade hub when cash is sufficient"), you can output \`infrastructureActions\`:
   - Build Hub ($200): { "action": "build_hub", "nodeId": "<nodeId from CANDIDATE BUILD NODES>", "reasoning": "..." }
   - Upgrade Hub: { "action": "upgrade_hub", "hubId": "<hubId>", "targetLevel": 2 or 3, "reasoning": "..." } (Lv.2: $80, Lv.3: $160)

You MUST respond with ONLY a valid, parseable JSON object matching this schema:
{
  "thoughtProcess": "Step-by-step reasoning explaining your triage strategy, battery checks, infrastructure actions, and order prioritization.",
  "toolCalls": [
    { "tool": "check_robot_telemetry", "rationale": "Evaluated fleet telemetry and hubs" }
  ],
  "infrastructureActions": [
    {
      "action": "build_hub",
      "nodeId": "string (e.g. 'sg-n8')",
      "reasoning": "Strategic justification for constructing new hub at this corridor"
    }
  ],
  "dispatchActions": [
    {
      "orderId": "string (e.g. 'L1-ORD-01')",
      "assignedRobotId": "string (e.g. 'singapore-bot-01')",
      "priorityReasoning": "Detailed justification for assigning this specific robot to this order in this sequence position"
    }
  ]
}
`.trim();

    let rawResponseText = '';
    let tokensUsed = 0;

    // 1. Google Gemini Provider
    if (provider === 'gemini') {
      let requestedModel = model || 'gemini-2.0-flash';
      if (requestedModel === 'gemini-1.5-flash-latest') {
        requestedModel = 'gemini-1.5-flash';
      }

      // Priority candidates to test on v1beta (official endpoint for systemInstruction + JSON mode)
      const candidateList = [
        { model: requestedModel, version: 'v1beta' },
        { model: 'gemini-2.0-flash', version: 'v1beta' },
        { model: 'gemini-1.5-flash', version: 'v1beta' },
        { model: 'gemini-1.5-pro', version: 'v1beta' }
      ];

      // Deduplicate candidate attempts
      const uniqueCandidates = candidateList.filter((item, index, self) =>
        index === self.findIndex((t) => t.model === item.model && t.version === item.version)
      );

      let lastErrorText = '';
      let lastStatus = 500;
      let successfulData: any = null;

      for (const cand of uniqueCandidates) {
        const endpoint = `https://generativelanguage.googleapis.com/${cand.version}/models/${cand.model}:generateContent?key=${apiKey}`;
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            signal: AbortSignal.timeout(8000), // Fast 8s timeout to avoid stalls
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: promptContext }]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          });

          if (res.ok) {
            successfulData = await res.json();
            break;
          } else {
            lastStatus = res.status;
            lastErrorText = await res.text();
            // If it's 404 (model not found on this version/region), proceed to next candidate
            if (res.status === 404) {
              continue;
            } else {
              // 400 Bad Request, 401 Invalid Key, 403 Permission Denied
              break;
            }
          }
        } catch (e: any) {
          lastErrorText = e.message;
        }
      }

      // If all preset candidates returned 404, query ListModels dynamically to find active models for this key
      if (!successfulData && lastStatus === 404) {
        try {
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          if (listRes.ok) {
            const listData = await listRes.json();
            const available = (listData.models || [])
              .filter((m: any) =>
                m.supportedGenerationMethods?.includes('generateContent') &&
                !m.name.includes('embedding')
              )
              .map((m: any) => m.name.replace('models/', ''));

            if (available.length > 0) {
              const discoveredModel = available.find((m: string) => m.includes('flash')) || available[0];
              const dynamicEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${discoveredModel}:generateContent?key=${apiKey}`;
              const dynRes = await fetch(dynamicEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: systemPrompt }] },
                  contents: [{ role: 'user', parts: [{ text: promptContext }] }],
                  generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
                })
              });
              if (dynRes.ok) {
                successfulData = await dynRes.json();
              } else {
                lastErrorText = await dynRes.text();
                lastStatus = dynRes.status;
              }
            }
          }
        } catch (listErr: any) {
          // Ignore list error
        }
      }

      if (!successfulData) {
        return NextResponse.json(
          {
            error: `Gemini API Error (${lastStatus}): ${lastErrorText}\n\nTroubleshooting Tip:\n1. Make sure your API key was created in Google AI Studio (https://aistudio.google.com/app/apikey) rather than Vertex AI.\n2. In Google AI Studio, confirm 'Generative Language API' is enabled for your project.`
          },
          { status: lastStatus }
        );
      }

      rawResponseText = successfulData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      tokensUsed = (successfulData?.usageMetadata?.promptTokenCount || 0) + (successfulData?.usageMetadata?.candidatesTokenCount || 0);
    }
    // 2. OpenAI Provider
    else if (provider === 'openai') {
      const targetModel = model || 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: promptContext }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
          { error: `OpenAI API Error (${res.status}): ${errorText}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      rawResponseText = data?.choices?.[0]?.message?.content || '{}';
      tokensUsed = data?.usage?.total_tokens || 0;
    }
    // 3. DeepSeek Provider
    else if (provider === 'deepseek') {
      const targetModel = model || 'deepseek-chat';
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: promptContext }
          ],
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
          { error: `DeepSeek API Error (${res.status}): ${errorText}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      rawResponseText = data?.choices?.[0]?.message?.content || '{}';
      tokensUsed = data?.usage?.total_tokens || 0;
    }

    // Safe JSON Parsing with Markdown Strip Fallback
    let parsedData: any = {};
    try {
      let cleaned = rawResponseText.trim();
      // Remove markdown code fences if present
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('Direct JSON parse failed, trying regex extraction...');
      const match = rawResponseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('LLM output could not be parsed into valid JSON: ' + rawResponseText.substring(0, 200));
      }
    }

    // Fallback token calculation if provider didn't return usage
    if (!tokensUsed) {
      tokensUsed = Math.round((systemPrompt.length + promptContext.length + rawResponseText.length) / 3.8);
    }

    console.log('[API/DISPATCH] LLM RAW OUTPUT:\n', rawResponseText);
    console.log('[API/DISPATCH] PARSED ACTIONS:\n', JSON.stringify(parsedData.dispatchActions, null, 2));

    return NextResponse.json({
      success: true,
      provider,
      model,
      rawResponseText,
      thoughtProcess: parsedData.thoughtProcess || 'Dispatch actions computed successfully.',
      toolCalls: parsedData.toolCalls || [],
      infrastructureActions: Array.isArray(parsedData.infrastructureActions) ? parsedData.infrastructureActions : [],
      dispatchActions: Array.isArray(parsedData.dispatchActions) ? parsedData.dispatchActions : [],
      tokensUsed
    });
  } catch (err: any) {
    console.error('API Dispatch Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
