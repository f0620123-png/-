import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in Vercel Environment Variables." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    // 你原本送的是 { wardrobe }, 我這裡也兼容 { prompt }
    const wardrobe =
      typeof body?.wardrobe === "string" && body.wardrobe.trim()
        ? body.wardrobe.trim()
        : "";

    const prompt =
      typeof body?.prompt === "string" && body.prompt.trim()
        ? body.prompt.trim()
        : wardrobe;

    if (!prompt) {
      return Response.json({ error: "Missing wardrobe/prompt." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });

    // 用 Chat Completions：穩定、好部署
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "你是專業穿搭顧問。請用繁體中文，給出具體可執行的穿搭建議。輸出包含：整體風格、上衣/下身/鞋/外套/配件建議、顏色搭配、避免事項。"
        },
        {
          role: "user",
          content: `請根據以下需求或衣櫃內容給建議：\n${prompt}`
        }
      ]
    });

    const advice = completion.choices?.[0]?.message?.content?.trim() || "";
    return Response.json({ advice });
  } catch (err: any) {
    return Response.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}