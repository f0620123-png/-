import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 400 });
    }

    const body = await req.json();
    const text = String(body?.text ?? "").trim();
    if (!text) return Response.json({ error: "Missing text" }, { status: 400 });

    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

    const prompt = [
      "請依下列穿搭建議，生成一張「全身人物穿搭示意圖」。",
      "風格：電商商品攝影感、柔光、背景乾淨（米白/淺灰）。",
      "限制：不要文字、不要品牌Logo、不要水印。",
      "",
      "穿搭建議：",
      text,
    ].join("\n");

    const img = await openai.images.generate({
      model,
      prompt,
      size: "1024x1024",
    });

    const b64 = img.data?.[0]?.b64_json;
    if (!b64) return Response.json({ error: "No image returned" }, { status: 500 });

    return Response.json({
      imageDataUrl: `data:image/png;base64,${b64}`,
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}