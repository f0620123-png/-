import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { wardrobe } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 400 });

  const openai = new OpenAI({ apiKey });

  const response = await openai.responses.create({
    model: process.env.OPENAI_TEXT_MODEL || "gpt-5",
    input: [
      {
        role: "user",
        content: `你是穿搭顧問。請根據以下衣櫃與情境，給 2 套穿搭方案，每套包含：上衣/外套/下身/鞋/配件，以及 1 句理由與 1 個注意事項。\n\n${wardrobe}`
      }
    ]
  });

  const advice = response.output_text || "";
  return Response.json({ advice });
}
