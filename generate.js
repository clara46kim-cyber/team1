// api/generate.js
//
// Vercel 서버리스 함수 (Node.js).
// 프론트엔드(index.html)는 이 엔드포인트(/api/generate)로만 요청을 보내고,
// Gemini API 키는 이 파일(서버 쪽)에서만 사용됩니다. 프론트엔드에는 노출되지 않습니다.

const { welfarePolicies } = require("../data/welfarePolicies.js");

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ALLOWED_STATUS_VALUES = [
  "확인해 볼 가능성이 높음",
  "추가 확인 필요",
  "현재 입력만으로 판단하기 어려움",
];

// Gemini 구조화된 출력(response_schema)에 사용할 JSON 스키마.
// 응답이 정해진 형식(JSON)을 벗어나지 않도록 강제합니다.
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    recommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          policyName: { type: "STRING" },
          status: {
            type: "STRING",
            enum: ALLOWED_STATUS_VALUES,
          },
          reason: { type: "STRING" },
          checkRequired: { type: "STRING" },
          support: { type: "STRING" },
          application: { type: "STRING" },
          officialAgency: { type: "STRING" },
          officialUrl: { type: "STRING" },
        },
        required: [
          "policyName",
          "status",
          "reason",
          "checkRequired",
          "support",
          "application",
          "officialAgency",
          "officialUrl",
        ],
      },
    },
    notice: { type: "STRING" },
  },
  required: ["summary", "recommendations", "notice"],
};

function buildPrompt(userInput) {
  const policiesJson = JSON.stringify(welfarePolicies, null, 2);

  return `당신은 노약자와 시각장애인이 복지서비스를 찾는 것을 돕는 안내 도우미입니다.

[아주 중요한 규칙 - 반드시 지켜야 함]
1. 아래 "복지정책 데이터"에 들어있는 정책만 추천할 수 있습니다.
2. 목록에 없는 정책을 새로 만들거나, 이름을 바꾸거나, 추측해서 추천하지 마세요.
3. 이 서비스는 실제 수급 자격을 확정하지 않습니다. "신청 가능", "받을 수 있음", "자격이 됩니다"처럼
   자격을 확정하는 표현은 절대 사용하지 마세요.
4. status(판단 결과) 값은 반드시 다음 세 가지 문자열 중 하나만 그대로 사용하세요.
   - "확인해 볼 가능성이 높음"
   - "추가 확인 필요"
   - "현재 입력만으로 판단하기 어려움"
5. 사용자 입력만으로 조건을 확실히 알 수 없으면 status를 "추가 확인 필요" 또는
   "현재 입력만으로 판단하기 어려움"으로 표시하고, checkRequired에 무엇을 더 확인해야 하는지 적으세요.
6. 관련성이 높은 정책을 최대 3개까지만 추천하세요. 관련된 정책이 없으면 recommendations를
   빈 배열로 두고 summary에 그 이유를 쉬운 말로 설명하세요.
7. 모든 문장은 노약자와 시각장애인이 이해하기 쉬운 쉬운 한국어로, 짧고 명확하게 작성하세요.
8. officialAgency와 officialUrl은 반드시 아래 데이터에 있는 값을 그대로 사용하세요.

[복지정책 데이터 - 이 목록 안에서만 추천]
${policiesJson}

[사용자 입력]
- 나이: ${userInput.age}
- 거주지역: ${userInput.region}
- 장애 여부: ${userInput.hasDisability}
- 1인 가구 여부: ${userInput.livesAlone}
- 소득 상황: ${userInput.incomeStatus}
- 현재 가장 필요한 도움: ${userInput.mostNeededHelp}
- 추가 상황(자유 입력): ${userInput.additionalInfo || "(입력 없음)"}

위 규칙을 지켜서, 요청된 JSON 스키마 형식으로만 응답하세요.`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "허용되지 않은 요청 방식입니다." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "서버 설정 오류로 지금은 추천을 받을 수 없습니다. 관리자에게 문의해 주세요.",
    });
    return;
  }

  const body = req.body || {};
  const userInput = {
    age: body.age,
    region: body.region,
    hasDisability: body.hasDisability,
    livesAlone: body.livesAlone,
    incomeStatus: body.incomeStatus,
    mostNeededHelp: body.mostNeededHelp,
    additionalInfo: body.additionalInfo,
  };

  const requiredFields = [
    "age",
    "region",
    "hasDisability",
    "livesAlone",
    "incomeStatus",
    "mostNeededHelp",
  ];
  const missingField = requiredFields.find(
    (field) => userInput[field] === undefined || userInput[field] === null || userInput[field] === ""
  );
  if (missingField) {
    res.status(400).json({
      error: "입력하지 않은 항목이 있습니다. 모든 항목을 채워주세요.",
    });
    return;
  }

  try {
    const prompt = buildPrompt(userInput);

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });

    if (!geminiResponse.ok) {
      res.status(502).json({
        error: "지금은 추천을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      res.status(502).json({
        error: "추천 결과를 받지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      res.status(502).json({
        error: "추천 결과 형식이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    // 목록 밖 정책을 걸러내는 안전장치: officialAgency/officialUrl이
    // 우리 데이터의 값과 일치하지 않는 항목은 제외합니다.
    const validAgencyUrlPairs = new Set(
      welfarePolicies.map((p) => `${p.officialAgency}||${p.officialUrl}`)
    );
    const safeRecommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
          .filter((rec) =>
            validAgencyUrlPairs.has(`${rec.officialAgency}||${rec.officialUrl}`)
          )
          .slice(0, 3)
      : [];

    const safeResult = {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      recommendations: safeRecommendations,
      notice:
        typeof parsed.notice === "string" && parsed.notice
          ? parsed.notice
          : "정확한 대상 여부는 공식 기관에서 최종 확인해야 합니다.",
    };

    res.status(200).json(safeResult);
  } catch (error) {
    res.status(500).json({
      error: "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    });
  }
};
