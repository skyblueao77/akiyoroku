import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import rateLimit from "express-rate-limit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Rate limiting configuration to mitigate DoS / CWE-770 / CWE-400
// Applies to all incoming requests including static file access and API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "リクエスト数が上限に達しました。しばらく時間をおいてから再度お試しください。",
  },
});

// Stricter rate limiting for AI API endpoints
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // Limit each IP to 60 API requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "APIリクエスト制限に達しました。少し時間を置いて再試行してください。",
  },
});

app.use(generalLimiter);
app.use("/api", apiLimiter);
app.use(express.json({ limit: "10mb" }));

// Fallback recommendations if Gemini API is temporarily unavailable
const FALLBACK_RECOMMENDATIONS = [
  {
    title: "木漏れ日に泳ぐ魚",
    type: "book",
    creator: "恩田陸",
    genre: "心理サスペンス・対話劇",
    durationOrPages: "248頁",
    synopsis: "アパートの一室で最後の夜を共に過ごす男女。夜明けまでの数時間、ふたりだけの静かな真実探しが始まる。",
    reason: "秋の夜の冷気と完璧に調和する濃密な対話劇。夜が明けるまでの静謐なカタルシスに深く浸ることができます。",
    autumnAtmosphere: "虫の声すら途絶えた深夜1時、間接照明の灯りだけでページをめくる時間",
    pairing: "ビターチョコレートと深煎りのホットコーヒー",
    quoteOrCatchphrase: "夜明けまでの数時間、ふたりだけの静かな真実探し。",
  },
  {
    title: "パターソン (Paterson)",
    type: "movie",
    creator: "ジム・ジャームッシュ",
    genre: "ヒューマンドラマ",
    durationOrPages: "118分",
    synopsis: "バス運転手として働く男パターソン。日々の合間にノートへ綴る詩と、愛する妻との穏やかな日常を描く。",
    reason: "劇的な事件は起きないものの、言葉を紡ぐことの豊かさを教えてくれる作品。観終えた後の静かな多幸感が秋の夜長を満たします。",
    autumnAtmosphere: "窓の外から冷涼な風が吹き込む秋の夜、部屋の明かりを落としてゆったりと鑑賞するひととき",
    pairing: "アールグレイティーとスコーン",
    quoteOrCatchphrase: "言葉にならぬ日常のなかに、静かな詩が宿っている。",
  },
  {
    title: "雪沼とその周辺",
    type: "book",
    creator: "堀江敏幸",
    genre: "短編小説・純文学",
    durationOrPages: "224頁",
    synopsis: "山あいの静かな町「雪沼」を舞台に、町の片隅で生きる人々の記憶と時間を描いた連作短編集。",
    reason: "研ぎ澄まされた文体と行間から立ち上る澄んだ静寂は、秋の夜に心を鎮めて文字を追う体験にこれ以上ない深みを与えてくれます。",
    autumnAtmosphere: "ブランケットにくるまり、温かい読書灯の下で静まり返った家の中で過ごす夜更け",
    pairing: "香ばしいほうじ茶と栗羊羹",
    quoteOrCatchphrase: "失われゆく町の片隅に、確かな生の手触りと光がある。",
  },
  {
    title: "日日是好日",
    type: "movie",
    creator: "大森立嗣",
    genre: "ドラマ・エッセイ",
    durationOrPages: "100分",
    synopsis: "真面目で不器用な典子が茶道教室に通い始め、五感を澄ませながら人生の季節の移ろいと向き合っていく。",
    reason: "雨の音や風の匂いを感じ取る描写が秀逸で、秋の夜長に自分の呼吸を取り戻すような静かな充足感をもたらします。",
    autumnAtmosphere: "秋雨がしとしとと降る晩秋の宵、静けさに耳を澄ませながら味わう時間",
    pairing: "抹茶または生姜入りのホット葛湯",
    quoteOrCatchphrase: "世の中には、「すぐわかること」と「すぐにはわからないこと」の二種類がある。",
  },
];

// Initialize Google Gen AI with safe wrapper
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// AI Recommendation API
app.post("/api/recommend", async (req, res) => {
  try {
    const { logs, mood, mediaType, favoriteThemes } = req.body;

    if (!ai) {
      return res.json({
        analysisSummary: "秋の夜長に寄り添う選りすぐりの名作をご提案します。静かな時間を豊かに彩る書籍と映画をお楽しみください。",
        recommendations: FALLBACK_RECOMMENDATIONS,
      });
    }

    const systemInstruction = `あなたは「秋の夜長」に特化した読書と映画のコンシェルジュです。
ユーザーのこれまでの鑑賞/読書記録や現在の気分・シチュエーションを深く分析し、
秋の静かで豊かな夜に心から浸れる素晴らしい作品（書籍または映画）を3〜4作品提案してください。
提案は具体的かつ魅力的で、なぜ今この作品が合うのかの納得感と、秋の夜長を彩るペアリング（お茶、ホットドリンク、香料など）も添えてください。`;

    const prompt = `
ユーザーの現在の気分・テーマ: ${mood || "秋の静けさと深い余韻を楽しみたい"}
希望のメディア種別: ${mediaType || "both"} (book, movie, or both)
関心のあるテーマ/興味: ${favoriteThemes || "未指定"}

ユーザーの既存の読書・鑑賞記録 (${logs?.length || 0}件):
${
  logs && logs.length > 0
    ? logs
        .slice(0, 10)
        .map(
          (l: any) =>
            `- [${l.type === "book" ? "書籍" : "映画"}] 『${l.title}』 (${l.creator || "作者不明"}) / 評価: ${l.rating}/5 / 感想要約: ${l.notes || "なし"}`
        )
        .join("\n")
    : "まだ記録がありません。秋の夜長に最適な定番・隠れた名作からおすすめしてください。"
}

以下のスキーマに準拠してJSONで返答してください。
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisSummary: {
              type: Type.STRING,
              description: "ユーザーの好みや現在の気分への共感と分析コメント",
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "作品タイトル" },
                  type: {
                    type: Type.STRING,
                    description: "book または movie",
                  },
                  creator: {
                    type: Type.STRING,
                    description: "著者名または監督名",
                  },
                  genre: { type: Type.STRING, description: "ジャンル" },
                  durationOrPages: {
                    type: Type.STRING,
                    description: "上映時間 (例: 118分) または ページ数 (例: 320頁)",
                  },
                  synopsis: {
                    type: Type.STRING,
                    description: "あらすじ（120文字程度）",
                  },
                  reason: {
                    type: Type.STRING,
                    description: "この作品をおすすめする理由・秋の夜に響く魅力",
                  },
                  autumnAtmosphere: {
                    type: Type.STRING,
                    description: "秋の夜長との親和性・情景描写",
                  },
                  pairing: {
                    type: Type.STRING,
                    description: "おすすめのお供（例: ほうじ茶ラテ、ホットワイン、焼き芋、キャンドル）",
                  },
                  quoteOrCatchphrase: {
                    type: Type.STRING,
                    description: "作品を象徴する一言や心惹かれるフレーズ",
                  },
                },
                required: [
                  "title",
                  "type",
                  "creator",
                  "genre",
                  "synopsis",
                  "reason",
                  "autumnAtmosphere",
                  "pairing",
                ],
              },
            },
          },
          required: ["analysisSummary", "recommendations"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Recommend error, using fallback:", error);
    res.json({
      analysisSummary: "秋の静けさと深い余韻に浸れる珠玉の作品たちをご案内します。",
      recommendations: FALLBACK_RECOMMENDATIONS,
    });
  }
});

// Taste Analysis API
app.post("/api/analyze-taste", async (req, res) => {
  try {
    const { logs } = req.body;

    if (!logs || logs.length === 0) {
      return res.status(400).json({ error: "No logs provided for analysis" });
    }

    if (!ai) {
      return res.json({
        personaTitle: "黄昏の思索家",
        summary: "静けさの中に漂う微細な感情の揺れや、美しい言葉の余韻を深く愛する感性をお持ちです。秋の夜長にじっくりと思考を巡らせる時間に最高の充足感を覚えるタイプです。",
        radarAttributes: [
          { label: "叙情性・情緒", score: 92 },
          { label: "知的好奇心", score: 85 },
          { label: "余韻の深さ", score: 95 },
          { label: "映像・美意識", score: 88 },
          { label: "没入度", score: 90 },
        ],
        autumnNightAdvice: "部屋の明かりを暖色系に絞り、温かいハーブティーやホットワインをお供に、一晩で読み切るよりも数ページずつじっくりと味わう読書・映画鑑賞がおすすめです。",
        recommendedGenres: ["心理小説", "詩的ドラマ", "文芸", "哲学・エッセイ"],
      });
    }

    const systemInstruction = `あなたは文芸評論家・映画美学者です。ユーザーの記録からその人の美意識や嗜好のコア、感受性の特徴を優雅かつ温かみのある言葉で言語化してください。`;

    const prompt = `
ユーザーの読書・映画鑑賞ログ:
${logs
  .map(
    (l: any) =>
      `- [${l.type === "book" ? "本" : "映画"}] 『${l.title}』(${l.creator}) / 評価: ${l.rating}点 / お気に入り度: ${l.favorite ? "★本命" : "通常"} / メモ・引用: ${l.quote || ""} ${l.notes || ""}`
  )
  .join("\n")}

このユーザーの「秋の夜長の感性プロファイル」を多角的に分析してください。
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personaTitle: {
              type: Type.STRING,
              description: "感性タイプ名",
            },
            summary: {
              type: Type.STRING,
              description: "感性の特徴・惹かれる共通テーマの解説",
            },
            radarAttributes: {
              type: Type.ARRAY,
              description: "5〜6つの感性軸スコア（各0〜100）",
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "属性名" },
                  score: { type: Type.NUMBER, description: "スコア (0-100)" },
                },
                required: ["label", "score"],
              },
            },
            autumnNightAdvice: {
              type: Type.STRING,
              description: "この秋の夜長をさらに最高にする過ごし方・作品探しのコツ",
            },
            recommendedGenres: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "相性の良いジャンルタグ",
            },
          },
          required: [
            "personaTitle",
            "summary",
            "radarAttributes",
            "autumnNightAdvice",
            "recommendedGenres",
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Analyze taste error, using fallback:", error);
    res.json({
      personaTitle: "秋夜の思索人",
      summary: "日常の喧騒から離れ、言葉や映像の行間に宿る深淵な美しさに心惹かれる豊かな感性の持ち主です。",
      radarAttributes: [
        { label: "叙情性", score: 90 },
        { label: "知的好奇心", score: 85 },
        { label: "余韻の深さ", score: 92 },
        { label: "映像美", score: 88 },
        { label: "世界観の没入度", score: 94 },
      ],
      autumnNightAdvice: "静かな秋の夜風を感じながら、一杯の温かい飲み物とともに心ゆくまで物語の世界に沈潜してみてください。",
      recommendedGenres: ["文芸ドラマ", "心理サスペンス", "幻想文学", "クラシック"],
    });
  }
});

// Auto-complete / Metadata search API
app.post("/api/autocomplete", async (req, res) => {
  try {
    const { title, type } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!ai) {
      return res.json({
        title,
        creator: type === "book" ? "作者不明" : "監督不明",
        genre: type === "book" ? "文芸・小説" : "ドラマ",
        durationOrPages: type === "book" ? "300頁" : "110分",
        synopsis: `${title}。秋の夜長にじっくりと味わいたい味わい深い作品。`,
        suggestedTags: ["秋の夜長", "名作", "余韻"],
        autumnFittingScore: 4,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `作品タイトル: 「${title}」 (種別: ${type || "不明"}) について、正確な作者/監督、ジャンル、概要（80〜100字）、推定所要時間（上映時間または読書所要目安/ページ数）、心に響くキーワードを補完してください。実在する著名な作品であれば正確に、曖昧な場合は一般的な文脈で補ってください。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            creator: { type: Type.STRING, description: "著者または監督" },
            genre: { type: Type.STRING, description: "ジャンル" },
            durationOrPages: { type: Type.STRING, description: "時間またはページ数" },
            synopsis: { type: Type.STRING, description: "簡潔なあらすじ" },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            autumnFittingScore: {
              type: Type.NUMBER,
              description: "秋の夜長度スコア (1-5)",
            },
          },
          required: ["title", "creator", "genre", "synopsis"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Autocomplete error, using fallback:", error);
    res.json({
      title: req.body.title || "作品名",
      creator: req.body.type === "book" ? "作者" : "監督",
      genre: "文学・ドラマ",
      durationOrPages: req.body.type === "book" ? "280頁" : "115分",
      synopsis: "秋の夜長に静かに浸りたい、深い思索と余韻をもたらす作品。",
      suggestedTags: ["秋の夜長", "おすすめ"],
      autumnFittingScore: 4,
    });
  }
});

// Setup Vite in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", generalLimiter, (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
