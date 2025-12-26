"use client";

import React, { useEffect, useMemo, useState } from "react";

type Category = "上衣" | "下身" | "外套" | "鞋子" | "配件" | "其他";
type Season = "春" | "夏" | "秋" | "冬" | "四季";
type Occasion = "通勤" | "休閒" | "約會" | "運動" | "正式" | "不指定";

type WardrobeItem = {
  id: string;
  name: string;
  category: Category;
  color?: string;
  season?: Season;
  occasion?: Occasion;
  note?: string;
  createdAt: number;
};

const LS_KEY = "wardrobe_ai_items_v1";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function safeParseJson<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export default function Page() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "全部">("全部");

  // add form
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("上衣");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState<Season>("四季");
  const [occasion, setOccasion] = useState<Occasion>("不指定");
  const [note, setNote] = useState("");

  // recommend
  const [scene, setScene] = useState<Occasion>("通勤");
  const [weather, setWeather] = useState("");
  const [recommendText, setRecommendText] = useState<string>("");
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState<string>("");

  // image
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  // env status
  const [health, setHealth] = useState<{ ok: boolean; hasKey: boolean; ts: number } | null>(null);

  useEffect(() => {
    const saved = safeParseJson<WardrobeItem[]>(localStorage.getItem(LS_KEY));
    if (Array.isArray(saved)) setItems(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => setHealth(j))
      .catch(() => setHealth({ ok: false, hasKey: false, ts: Date.now() }));
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items
      .filter((it) => (cat === "全部" ? true : it.category === cat))
      .filter((it) => {
        if (!kw) return true;
        const hay = [it.name, it.category, it.color ?? "", it.season ?? "", it.occasion ?? "", it.note ?? ""]
          .join(" ")
          .toLowerCase();
        return hay.includes(kw);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [items, q, cat]);

  const grouped = useMemo(() => {
    const map = new Map<Category, WardrobeItem[]>();
    for (const it of filtered) {
      map.set(it.category, [...(map.get(it.category) ?? []), it]);
    }
    const order: Category[] = ["上衣", "下身", "外套", "鞋子", "配件", "其他"];
    return order
      .filter((c) => (map.get(c)?.length ?? 0) > 0)
      .map((c) => ({ category: c, items: map.get(c)! }));
  }, [filtered]);

  function addItem() {
    const n = name.trim();
    if (!n) return;

    const it: WardrobeItem = {
      id: uid(),
      name: n,
      category,
      color: color.trim() || undefined,
      season,
      occasion,
      note: note.trim() || undefined,
      createdAt: Date.now()
    };
    setItems((prev) => [it, ...prev]);

    // reset
    setName("");
    setColor("");
    setSeason("四季");
    setOccasion("不指定");
    setNote("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wardrobe-items.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = safeParseJson<WardrobeItem[]>(String(reader.result));
      if (!Array.isArray(parsed)) {
        alert("檔案格式不對：必須是 JSON array");
        return;
      }
      // basic sanitize
      const cleaned: WardrobeItem[] = parsed
        .filter((x) => x && typeof x === "object")
        .map((x: any) => ({
          id: String(x.id ?? uid()),
          name: String(x.name ?? ""),
          category: (x.category as Category) ?? "其他",
          color: x.color ? String(x.color) : undefined,
          season: (x.season as Season) ?? "四季",
          occasion: (x.occasion as Occasion) ?? "不指定",
          note: x.note ? String(x.note) : undefined,
          createdAt: Number(x.createdAt ?? Date.now())
        }))
        .filter((x) => x.name.trim().length > 0);
      setItems(cleaned);
      alert(`已匯入 ${cleaned.length} 筆`);
    };
    reader.readAsText(file);
  }

  async function recommend() {
    setRecommendError("");
    setRecommendText("");
    setImageBase64("");
    setImageError("");

    if (items.length === 0) {
      setRecommendError("你目前衣櫃是空的，先新增幾件衣物再推薦。");
      return;
    }

    setRecommendLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wardrobe: items,
          context: {
            scene,
            weather: weather.trim() || undefined
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "推薦失敗");
      setRecommendText(String(data?.text ?? ""));
    } catch (e: any) {
      setRecommendError(e?.message ?? "推薦失敗");
    } finally {
      setRecommendLoading(false);
    }
  }

  async function generateImage() {
    setImageError("");
    setImageBase64("");
    if (!recommendText.trim()) {
      setImageError("請先產生推薦內容，再生成示意圖。");
      return;
    }
    setImageLoading(true);
    try {
      const res = await fetch("/api/outfit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: recommendText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "生成圖片失敗");
      setImageBase64(String(data?.imageBase64 ?? ""));
    } catch (e: any) {
      setImageError(e?.message ?? "生成圖片失敗");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <div className="cardTitle">衣櫃管理</div>

        {health ? (
          health.hasKey ? (
            <div className="okBox">API Key：已偵測到（若仍 401，代表 Key 無效或貼錯）</div>
          ) : (
            <div className="errorBox">尚未偵測到 OPENAI_API_KEY（或部署未更新）</div>
          )
        ) : (
          <div className="notice">檢查環境中…</div>
        )}

        <div className="label">搜尋</div>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="輸入：白T、牛仔褲、黑鞋、約會…" />

        <div className="label">分類篩選</div>
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value as any)}>
          <option value="全部">全部</option>
          <option value="上衣">上衣</option>
          <option value="下身">下身</option>
          <option value="外套">外套</option>
          <option value="鞋子">鞋子</option>
          <option value="配件">配件</option>
          <option value="其他">其他</option>
        </select>

        <hr className="sep" />

        <div className="row">
          <span className="chip">總數：{items.length}</span>
          <button className="btn" onClick={() => setItems([])}>清空</button>
          <button className="btn" onClick={exportJson}>匯出 JSON</button>
          <label className="btn" style={{ cursor: "pointer" }}>
            匯入 JSON
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <hr className="sep" />

        <div className="cardTitle">新增衣物</div>

        <div className="label">名稱</div>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：白色素T、深藍直筒牛仔褲…" />

        <div className="label">分類</div>
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          <option value="上衣">上衣</option>
          <option value="下身">下身</option>
          <option value="外套">外套</option>
          <option value="鞋子">鞋子</option>
          <option value="配件">配件</option>
          <option value="其他">其他</option>
        </select>

        <div className="label">顏色（可空）</div>
        <input className="input" value={color} onChange={(e) => setColor(e.target.value)} placeholder="例：白、黑、深藍、卡其…" />

        <div className="row">
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="label">季節</div>
            <select className="select" value={season} onChange={(e) => setSeason(e.target.value as Season)}>
              <option value="四季">四季</option>
              <option value="春">春</option>
              <option value="夏">夏</option>
              <option value="秋">秋</option>
              <option value="冬">冬</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="label">場合</div>
            <select className="select" value={occasion} onChange={(e) => setOccasion(e.target.value as Occasion)}>
              <option value="不指定">不指定</option>
              <option value="通勤">通勤</option>
              <option value="休閒">休閒</option>
              <option value="約會">約會</option>
              <option value="運動">運動</option>
              <option value="正式">正式</option>
            </select>
          </div>
        </div>

        <div className="label">備註（可空）</div>
        <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例：偏寬鬆、材質薄、搭外套好看…" />

        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btnPrimary" onClick={addItem} disabled={!name.trim()}>
            新增
          </button>
        </div>

        <hr className="sep" />

        <div className="cardTitle">衣物清單</div>

        {grouped.length === 0 ? (
          <div className="notice">目前沒有符合條件的衣物。</div>
        ) : (
          <div className="list">
            {grouped.map((g) => (
              <div key={g.category}>
                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="chip">{g.category}</span>
                  <span className="muted">({g.items.length} 件)</span>
                </div>

                <div className="list">
                  {g.items.map((it) => (
                    <div className="item" key={it.id}>
                      <div>
                        <div className="itemTitle">{it.name}</div>
                        <div className="itemMeta">
                          {it.color ? <span className="chip">色：{it.color}</span> : null}
                          {it.season ? <span className="chip">季：{it.season}</span> : null}
                          {it.occasion && it.occasion !== "不指定" ? <span className="chip">場合：{it.occasion}</span> : null}
                          {it.note ? <span className="chip">備註</span> : null}
                        </div>
                        {it.note ? <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>{it.note}</div> : null}
                      </div>

                      <div className="row" style={{ justifyContent: "flex-end" }}>
                        <button className="btn btnDanger" onClick={() => removeItem(it.id)}>
                          刪除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="sep" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="cardTitle">每日穿搭推薦</div>

        <div className="notice">
          推薦會使用你現有衣櫃內容；若缺某類別（例如鞋/外套），會在結果中提醒你該補什麼。
        </div>

        <div className="label">情境</div>
        <select className="select" value={scene} onChange={(e) => setScene(e.target.value as Occasion)}>
          <option value="通勤">通勤</option>
          <option value="休閒">休閒</option>
          <option value="約會">約會</option>
          <option value="運動">運動</option>
          <option value="正式">正式</option>
        </select>

        <div className="label">天氣（可空）</div>
        <input className="input" value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="例：26°C 晴、下雨偏涼…" />

        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btnPrimary" onClick={recommend} disabled={recommendLoading}>
            {recommendLoading ? "推薦中…" : "產生今日推薦"}
          </button>

          <button className="btn" onClick={generateImage} disabled={imageLoading || !recommendText.trim()}>
            {imageLoading ? "生成中…" : "生成穿搭示意圖（可選）"}
          </button>
        </div>

        {recommendError ? <div className="errorBox" style={{ marginTop: 10 }}>{recommendError}</div> : null}
        {recommendText ? (
          <div className="card" style={{ marginTop: 10 }}>
            <div className="cardTitle">推薦結果</div>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit", color: "rgba(255,255,255,0.92)" }}>
              {recommendText}
            </pre>
          </div>
        ) : null}

        {imageError ? <div className="errorBox" style={{ marginTop: 10 }}>{imageError}</div> : null}
        {imageBase64 ? (
          <div className="imgWrap">
            <img alt="outfit" src={`data:image/png;base64,${imageBase64}`} />
          </div>
        ) : null}

        <hr className="sep" />

        <div className="cardTitle">快速測試</div>
        <div className="row">
          <a className="btn" href="/api/health" target="_blank" rel="noreferrer">
            打開 /api/health
          </a>
        </div>
      </section>
    </div>
  );
}