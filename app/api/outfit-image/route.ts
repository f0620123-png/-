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
    const text = String(body?.text ?? "").trim();
    if (!text) {
      return Response.json({ error: "Missing text" }, { status: 400 });
    }

    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-5";

    const prompt = [
      "請根據以下穿搭建議，生成一張『乾淨背景、偏電商商品攝影風格』的穿搭示意圖。",
      "要求：人物站姿全身、光線自然、衣物材質清楚、不要文字浮水印。",
      "",
      "穿搭內容：",
      text
    ].join("\n");

    // 使用 Responses API 的 image_generation tool 產生 base64 圖片  [oai_citation:2‡OpenAI 平台](https://platform.openai.com/docs/guides/image-generation)
    const response = await openai.responses.create({
      model,
      input: prompt,
      tools: [{ type: "image_generation" }]
    });

    const imageData = (response as any).output
      .filter((o: any) => o.type === "image_generation_call")
      .map((o: any) => o.result);

    if (!imageData?.length) {
      return Response.json({ error: "No image returned" }, { status: 500 });
    }

    return Response.json({ imageBase64: imageData[0] });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}