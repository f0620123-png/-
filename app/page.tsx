"use client";

import React, { useEffect, useMemo, useState } from "react";

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

const LS_KEY = "wardrobe_ai_items_v1";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function loadItems(): Garment[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveItems(items: Garment[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export default function Page() {
  const [tab, setTab] = useState<"衣櫃" | "推薦">("衣櫃");
  const [items, setItems] = useState<Garment[]>([]);
  const [ready, setReady] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("上衣");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState<Season>("四季");
  const [note, setNote] = useState("");

  // recommend state
  const [occasion, setOccasion] = useState("日常通勤");
  const [style, setStyle] = useState("乾淨俐落");
  const [constraints, setConstraints] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const loaded = loadItems();
    setItems(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveItems(items);
  }, [items, ready]);

  const grouped = useMemo(() => {
    const g: Record<Category, Garment[]> = {
      上衣: [],
      下身: [],
      外套: [],
      鞋子: [],
      配件: [],
    };
    for (const it of items) g[it.category].push(it);
    for (const k of Object.keys(g) as Category[]) {
      g[k].sort((a, b) => b.createdAt - a.createdAt);
    }
    return g;
  }, [items]);

  function addItem() {
    setErr("");
    if (!name.trim()) return setErr("請輸入衣物名稱（例如：白T、深藍直筒牛仔褲）。");
    if (!color.trim()) return setErr("請輸入顏色（例如：白、黑、深藍、卡其）。");

    const newItem: Garment = {
      id: uid(),
      name: name.trim(),
      category,
      color: color.trim(),
      season,
      note: note.trim() || undefined,
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);

    setName("");
    setColor("");
    setSeason("四季");
    setNote("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function getRecommendation() {
    setErr("");
    setResult("");
    if (items.length === 0) {
      setErr("你的衣櫃目前是空的，先新增幾件衣物再推薦會更準。");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wardrobe: items,
          occasion,
          style,
          constraints,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || `API 失敗（${res.status}）`);
        return;
      }
      setResult(data?.advice || "沒有取得建議內容。");
    } catch (e: any) {
      setErr(e?.message || "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="tabs">
          <button className={"tabBtn " + (tab === "衣櫃" ? "active" : "")} onClick={() => setTab("衣櫃")}>
            衣櫃管理
          </button>
          <button className={"tabBtn " + (tab === "推薦" ? "active" : "")} onClick={() => setTab("推薦")}>
            日常推薦搭配
          </button>
        </div>

        <span className="pill">
          API：<span className="code">/api/outfit</span>（POST） / <span className="code">/api/health</span>（GET）
        </span>
      </div>

      {err && <div className="alert">{err}</div>}

      {tab === "衣櫃" ? (
        <div className="grid2">
          <section className="card">
            <div className="cardInner stack">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>新增衣物</div>
                  <div className="hint">建議先把常穿的 10–20 件建起來，推薦會更準。</div>
                </div>
                <span className="badge">{items.length} 件</span>
              </div>

              <div className="field">
                <div className="label">衣物名稱</div>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：白色上衣、黑色短版皮衣…" />
              </div>

              <div className="row">
                <div className="field" style={{ flex: 1 }}>
                  <div className="label">分類</div>
                  <select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                    <option>上衣</option>
                    <option>下身</option>
                    <option>外套</option>
                    <option>鞋子</option>
                    <option>配件</option>
                  </select>
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <div className="label">季節</div>
                  <select className="select" value={season} onChange={(e) => setSeason(e.target.value as Season)}>
                    <option>四季</option>
                    <option>春</option>
                    <option>夏</option>
                    <option>秋</option>
                    <option>冬</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <div className="label">顏色</div>
                <input className="input" value={color} onChange={(e) => setColor(e.target.value)} placeholder="例：白、黑、深藍、卡其…" />
              </div>

              <div className="field">
                <div className="label">備註（可空白）</div>
                <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例：偏寬鬆、需要皮帶、適合正式…" />
              </div>

              <div className="row">
                <button className="btn btnPrimary" onClick={addItem}>
                  新增
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setItems([]);
                    setErr("");
                    setResult("");
                  }}
                >
                  清空衣櫃（本機）
                </button>
              </div>

              <div className="ok">
                <div style={{ fontWeight: 900, marginBottom: 6 }}>提醒</div>
                <div className="hint">
                  這版是「本機衣櫃」：資料存在你的手機瀏覽器，不會同步到別的裝置。要跨裝置同步，下一版我會幫你接 Supabase / Vercel KV。
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="cardInner stack">
              <div style={{ fontSize: 18, fontWeight: 900 }}>衣櫃清單</div>
              <div className="hint">依分類顯示；每件都可刪除。</div>

              {(Object.keys(grouped) as Category[]).map((cat) => (
                <div key={cat} className="stack" style={{ gap: 8 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span className="badge">{cat}</span>
                      <span className="hint">{grouped[cat].length} 件</span>
                    </div>
                  </div>

                  <div className="list">
                    {grouped[cat].length === 0 ? (
                      <div className="hint">（此分類尚無衣物）</div>
                    ) : (
                      grouped[cat].map((it) => (
                        <div className="item" key={it.id}>
                          <div>
                            <div className="itemTitle">{it.name}</div>
                            <div className="itemMeta">
                              {it.color} · {it.season}
                              {it.note ? ` · ${it.note}` : ""}
                            </div>
                          </div>
                          <div className="row" style={{ justifyContent: "flex-end" }}>
                            <button className="btn btnSmall btnDanger" onClick={() => removeItem(it.id)}>
                              刪除
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid2">
          <section className="card">
            <div className="cardInner stack">
              <div style={{ fontSize: 18, fontWeight: 900 }}>日常推薦搭配</div>
              <div className="hint">會把你的衣櫃內容一起送到 API，產出可執行的搭配清單。</div>

              <div className="row">
                <div className="field" style={{ flex: 1 }}>
                  <div className="label">場合</div>
                  <select className="select" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                    <option>日常通勤</option>
                    <option>休閒外出</option>
                    <option>約會</option>
                    <option>正式場合</option>
                    <option>運動/機能</option>
                  </select>
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <div className="label">風格</div>
                  <select className="select" value={style} onChange={(e) => setStyle(e.target.value)}>
                    <option>乾淨俐落</option>
                    <option>簡約韓系</option>
                    <option>美式休閒</option>
                    <option>工裝機能</option>
                    <option>正式商務</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <div className="label">限制/偏好（可空白）</div>
                <textarea
                  className="textarea"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="例：不想穿白鞋、今天偏冷想要外套、希望顯瘦…"
                />
              </div>

              <div className="row">
                <button className="btn btnPrimary" onClick={getRecommendation} disabled={loading}>
                  {loading ? "生成中…" : "生成今日推薦"}
                </button>
                <a className="btn" href="/api/health" target="_blank" rel="noreferrer">
                  測試 /api/health
                </a>
              </div>

              <div className="hint">
                若看到 401，代表 Vercel 的 <span className="code">OPENAI_API_KEY</span> 無效或未生效（需 Redeploy）。
              </div>
            </div>
          </section>

          <section className="card">
            <div className="cardInner stack">
              <div style={{ fontSize: 18, fontWeight: 900 }}>推薦結果</div>
              {!result ? (
                <div className="hint">按「生成今日推薦」後，這裡會顯示 AI 給你的搭配（含替代方案）。</div>
              ) : (
                <div className="ok">
                  <div className="code">{result}</div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}