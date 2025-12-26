export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    ts: Date.now()
  });
}