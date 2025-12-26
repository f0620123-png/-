import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 400 });
    }

    const body = await req.json();
    const wardrobe = body?.wardrobe;
    const context = body?.context ?? {};

    if (!Array.isArray(wardrobe)) {
      return Response.json({ error: "Invalid payload: wardrobe must be an array" }, { status: 400 });
    }

    const model = process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini";

    const system = [
      "你是專業穿搭顧問，請用繁體中文回答。",
      "只用使用者衣櫃清單中存在的單品做主要搭配；若不足，再提出缺口補強。",
      "輸出格式固定為：",
      "1) 今日推薦（內搭/上衣/下著/外套/鞋子/配件）",
      "2) 為何這樣搭（3-6點，具體、短句）",
      "3) 替代方案（至少2套）",
      "4) 補強清單（只列品項，不要品牌）",
    ].join("\n");

    const user = [
      `情境(scene)：${String(context?.scene ?? "日常")}`,
      `風格(style)：${String(context?.style ?? "隨機")}`,
      `天氣(weather)：${String(context?.weather ?? "未提供")}`,
      `備註(note)：${String(context?.note ?? "無")}`,
      "",
      "衣櫃清單（JSON）：",
      JSON.stringify(wardrobe).slice(0, 14000),
    ].join("\n");

    const r = await openai.responses.create({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    return Response.json({ text: r.output_text });
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}