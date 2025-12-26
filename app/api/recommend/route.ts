import OpenAI from "openai";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 400 });

    const { wardrobe, context } = await req.json();
    if (!Array.isArray(wardrobe)) return Response.json({ error: "wardrobe must be an array" }, { status: 400 });

    const model = process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini";

    const instructions = [
      "你是專業穿搭顧問，使用繁體中文。",
      "以使用者衣櫃為主產出穿搭；不足時再列『補強清單』。",
      "輸出固定結構：",
      "A) 今日推薦（內搭/上衣/下著/外套/鞋子/配件）",
      "B) 為何這樣搭（3-6點，短句）",
      "C) 替代方案（至少2套）",
      "D) 補強清單（只列品項，不要品牌）"
    ].join("\n");

    const user = [
      `情境：${String(context?.scene ?? "日常")}`,
      `風格：${String(context?.style ?? "隨機")}`,
      `天氣：${String(context?.weatherText ?? "未提供")}`,
      `備註：${String(context?.note ?? "無")}`,
      "",
      "衣櫃 JSON：",
      JSON.stringify(wardrobe).slice(0, 14000),
    ].join("\n");

    const r = await openai.responses.create({
      model,
      instructions,
      input: user
    });

    return Response.json({ text: r.output_text });
  } catch (e: any) {
    return Response.json({ error: e?.message || String(e) }, { status: 500 });
  }
}