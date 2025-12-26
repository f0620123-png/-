import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CATEGORIES = ["上衣","下著","內搭","外套","鞋子","配件","連身","背心","襪子"] as const;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 400 });

    const { imageDataUrl } = await req.json();
    const img = String(imageDataUrl || "").trim();
    if (!img.startsWith("data:image/")) return Response.json({ error: "Invalid imageDataUrl" }, { status: 400 });

    const model = process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini";

    const schema = {
      name: "extract_item",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: Array.from(CATEGORIES) },
          colors: { type: "array", items: { type: "string" } },
          season: { type: "string", enum: ["春","夏","秋","冬","四季"] },
          notes: { type: "string" }
        },
        required: ["name","category","colors","season","notes"]
      }
    };

    const r = await openai.responses.create({
      model,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: "請辨識這張衣物照片，輸出 JSON：name/category/colors/season/notes。category 請選最接近的一個。" },
          { type: "input_image", image_url: img }
        ]
      }],
      text: { format: { type: "json_schema", json_schema: schema } }
    });

    const jsonText = r.output_text?.trim() || "";
    const data = JSON.parse(jsonText);

    return Response.json({ data });
  } catch (e: any) {
    return Response.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
