import OpenAI from "openai";

export const runtime = "nodejs";

type Category = "上衣" | "下身" | "外套" | "鞋子" | "配件";
type Season = "春" | "夏" | "秋" | "冬" | "四季";

type Garment = {
  id: string;
  name: string;
  category: Category;
  color: string;
  season: Season;
  note?: string;
  createdAt: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const wardrobe: Garment[] = body?.wardrobe ?? [];
    const occasion: string = body?.occasion ?? "日常通勤";
    const style: string = body?.style ?? "乾淨俐落";
    const constraints: string = body?.constraints ?? "";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "缺少 OPENAI_API_KEY。請到 Vercel → Project Settings → Environment Variables 設定後 Redeploy。" },
        { status: 500 }
      );
    }

    // 你可以在 Vercel 設 OPENAI_TEXT_MODEL；沒設就用預設
    const model = process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini";

    const openai = new OpenAI({ apiKey });

    const prompt = `
你是穿搭顧問。請根據使用者「衣櫃清單」做出「今天可直接穿出門」的推薦。
要求：
1) 必須從衣櫃挑選（若缺某分類，可提出替代/缺口建議）
2) 輸出要包含：A.主推薦一套（上衣/下身/外套(可選)/鞋/配件(可選)），B.原因（色彩、比例、場合適配），C.替代方案2套（用衣櫃的其他單品），D.缺口建議（如果衣櫃不足）
3) 以繁體中文輸出，條列清楚，好讀可執行
4) 場合：${occasion}
5) 風格：${style}
6) 限制/偏好：${constraints || "無"}
衣櫃清單（JSON）：
${JSON.stringify(wardrobe, null, 2)}
`.trim();

    const resp = await openai.responses.create({
      model,
      input: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const advice = (resp as any)?.output_text || "";
    return Response.json({ advice });
  } catch (e: any) {
    const msg = e?.message || "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}