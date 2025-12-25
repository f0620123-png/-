import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in environment variables." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const prompt =
      typeof body?.prompt === "string" && body.prompt.trim()
        ? body.prompt.trim()
        : "Generate a realistic outfit flat-lay photo with clean background.";

    const client = new OpenAI({ apiKey });

    // 官方 Images API：client.images.generate({ model, prompt, size, ... })
    const img = await client.images.generate({
      model: "gpt-image-1.5",
      prompt,
      size: "1024x1024"
    });

    const b64 = img.data?.[0]?.b64_json;
    if (!b64) {
      return Response.json({ error: "No image returned from OpenAI." }, { status: 502 });
    }

    const imageDataUrl = `data:image/png;base64,${b64}`;
    return Response.json({ imageDataUrl });
  } catch (err: any) {
    // 把錯誤訊息帶回前端方便你排查（不要把 apiKey 印出來）
    return Response.json(
      { error: err?.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}