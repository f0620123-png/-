import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { wardrobe } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 400 });

  const openai = new OpenAI({ apiKey });

  const prompt = `
Generate a clean, full-body fashion illustration (not a photo), dark background.
Outfit must be based on this wardrobe/context:
${wardrobe}

Style: modern minimal, clear silhouette, realistic proportions, no brand logos, no text.
`;

  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) return Response.json({ error: "No image returned" }, { status: 500 });

  const dataUrl = `data:image/png;base64,${b64}`;
  return Response.json({ dataUrl });
}
