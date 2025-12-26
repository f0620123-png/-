export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    textModel: process.env.OPENAI_TEXT_MODEL || null,
    imageModel: process.env.OPENAI_IMAGE_MODEL || null,
    ts: Date.now(),
  });
}
