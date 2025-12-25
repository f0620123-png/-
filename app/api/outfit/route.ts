import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 給 Vercel 足夠時間（可選）
export const maxDuration = 60;

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const prompt = (body?.prompt ?? "").toString().trim();

    if (!prompt) return jsonError("Missing prompt");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return jsonError("Missing OPENAI_API_KEY on server", 500);

    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

    const openai = new OpenAI({ apiKey });

    // 產出示意圖：用 base64 回傳，前端直接用 data URL 顯示
    const result = await openai.images.generate({
      model,
      prompt,
      size: "1024x1024",
      // gpt-image-1 支援 b64_json；若你的模型不支援，SDK 可能會改用 url
      response_format: "b64_json"
    } as any);

    const first = (result as any)?.data?.[0];
    const b64 = first?.b64_json as string | undefined;
    const url = first?.url as string | undefined;

    if (b64) {
      return Response.json({
        ok: true,
        model,
        imageBase64: b64
      });
    }

    // 若拿到的是 url（某些情況/模型），也回傳給前端
    if (url) {
      return Response.json({
        ok: true,
        model,
        imageUrl: url
      });
    }

    return jsonError("Image generation returned empty result", 502);
  } catch (err: any) {
    return jsonError(err?.message || "Internal error", 500);
  }
}