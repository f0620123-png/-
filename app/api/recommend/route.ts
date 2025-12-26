import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Missing OPENAI_API_KEY in Vercel Environment Variables" }, { status: 400 });
    }

    const body = await req.json();
    const wardrobe = body?.wardrobe;
    const context = body?.context ?? {};

    if (!Array.isArray(wardrobe)) {
      return Response.json({ error: "Invalid payload: wardrobe must be an array" }, { status: 400 });
    }

    const model = process.env.OPENAI_TEXT_MODEL || "gpt-5";

    const input = [
      {
        role: "system",
        content:
          "你是專業穿搭顧問。請使用繁體中文回答。請只用使用者衣櫃中存在的單品來組合穿搭；若缺少必要類別（例如鞋子/外套/下身），請在結果中清楚指出缺口並給出補齊建議。"
      },
      {
        role: "user",
        content: [
          `情境：${String(context.scene ?? "不指定")}`,
          context.weather ? `天氣：${String(context.weather)}` : "",
          "",
          "衣櫃清單（JSON）：",
          JSON.stringify(wardrobe)
        ]
          .filter(Boolean)
          .join("\n")
      }
    ];

    const response = await openai.responses.create({
      model,
      input
    });

    // Node SDK 會提供 output_text 方便你直接取文字結果  [oai_citation:1‡OpenAI 平台](https://platform.openai.com/docs/guides/tools-image-generation?utm_source=chatgpt.com)
    const text = (response as any).output_text ?? "";

    return Response.json({ text });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
