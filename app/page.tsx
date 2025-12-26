"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type TabKey = "wardrobe" | "mix" | "inspire" | "me";

type Category =
  | "上衣"
  | "下著"
  | "內搭"
  | "外套"
  | "鞋子"
  | "配件"
  | "連身"
  | "背心"
  | "襪子";

type WardrobeItem = {
  id: string;
  name: string;
  category: Category;
  color?: string;
  note?: string;
  imageDataUrl?: string; // localStorage 保存圖片 dataURL
  createdAt: number;
};

const LS_ITEMS = "my_wardrobe_items_v2";

const CATEGORIES: Category[] = ["上衣", "下著", "內搭", "外套", "鞋子", "配件", "連身", "背心", "襪子"];

function uid() {
  return Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function Icon({ name }: { name: "closet" | "layers" | "bag" | "user" }) {
  // 簡單的 inline SVG（避免額外套件）
  const common = { className: "ico", viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "closet") {
    return (
      <svg {...common}>
        <path d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2z" />
        <path d="M9 7h.01M15 7h.01" />
        <path d="M12 3v18" />
      </svg>
    );
  }
  if (name === "layers") {
    return (
      <svg {...common}>
        <path d="M12 3 2 9l10 6 10-6-10-6z" />
        <path d="M2 15l10 6 10-6" />
      </svg>
    );
  }
  if (name === "bag") {
    return (
      <svg {...common}>
        <path d="M6 8h12l-1 13H7L6 8z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function Sheet({
  open,
  title,
  icon,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="sheetOverlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheetHeader">
          <div className="sheetTitle">
            <span className="bolt">{icon}</span>
            {title}
          </div>
          <button className="sheetClose" onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>
        <div className="sheetBody">{children}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<TabKey>("wardrobe");
  const [categoryFilter, setCategoryFilter] = useState<Category | "全部">("全部");

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  // 手動新增
  const [manualOpen, setManualOpen] = useState(false);
  const [mName, setMName] = useState("");
  const [mCategory, setMCategory] = useState<Category>("上衣");
  const [mColor, setMColor] = useState("");

  // 推薦（inspire）
  const [scene, setScene] = useState<"日常" | "上班" | "約會" | "運動" | "度假" | "派對">("日常");
  const [style, setStyle] = useState<"隨機" | "極簡" | "街頭" | "日系" | "韓系" | "復古" | "Smart Casual" | "運動風" | "老錢風" | "Gorpcore">("隨機");
  const [weather, setWeather] = useState("");
  const [note, setNote] = useState("");
  const [recText, setRecText] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [outfitImg, setOutfitImg] = useState<string>("");

  // file inputs
  const fileLibraryRef = useRef<HTMLInputElement | null>(null);
  const fileCameraRef = useRef<HTMLInputElement | null>(null);
  const fileAnyRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = safeParse<WardrobeItem[]>(localStorage.getItem(LS_ITEMS));
    if (saved && Array.isArray(saved)) setItems(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_ITEMS, JSON.stringify(items));
  }, [items]);

  const filtered = useMemo(() => {
    const base = [...items].sort((a, b) => b.createdAt - a.createdAt);
    if (categoryFilter === "全部") return base;
    return base.filter((x) => x.category === categoryFilter);
  }, [items, categoryFilter]);

  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function addFromFile(file: File, categoryGuess?: Category) {
    const dataUrl = await readAsDataURL(file);
    const name = file.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const item: WardrobeItem = {
      id: uid(),
      name: name || "未命名",
      category: categoryGuess ?? "上衣",
      imageDataUrl: dataUrl,
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
  }

  function addManual() {
    if (!mName.trim()) return;
    const item: WardrobeItem = {
      id: uid(),
      name: mName.trim(),
      category: mCategory,
      color: mColor.trim() || undefined,
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
    setMName("");
    setMColor("");
    setManualOpen(false);
    setAddOpen(false);
  }

  const presets = useMemo(
    () => [
      { name: "長袖打底（白）", category: "內搭" as Category, color: "#e8e3db" },
      { name: "長袖打底（黑）", category: "內搭" as Category, color: "#3f3b39" },
      { name: "短袖T恤（白）", category: "上衣" as Category, color: "#efeae2" },
      { name: "短袖T恤（黑）", category: "上衣" as Category, color: "#4a4543" },
      { name: "連帽外套（灰）", category: "外套" as Category, color: "#9ea0a2" },
      { name: "牛仔外套", category: "外套" as Category, color: "#7f8fa3" },
      { name: "牛仔寬褲", category: "下著" as Category, color: "#86a1b7" },
      { name: "直筒牛仔褲", category: "下著" as Category, color: "#6f93b3" },
    ],
    []
  );

  function addPreset(p: { name: string; category: Category; color: string }) {
    const item: WardrobeItem = {
      id: uid(),
      name: p.name,
      category: p.category,
      color: p.color,
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
    setQuickOpen(false);
    setTab("wardrobe");
  }

  async function genRecommend() {
    setBusy(true);
    setRecText("");
    setOutfitImg("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wardrobe: items,
          context: { scene, style, weather, note },
        }),
      });
      const data = await res.json();
      const text = String(data?.text ?? data?.result ?? data?.recommendation ?? "").trim();
      setRecText(text || "沒有取得推薦文字（請檢查 /api/recommend 回傳格式）");
    } catch (e: any) {
      setRecText("推薦呼叫失敗，請確認 Vercel 環境變數與 /api/recommend。");
    } finally {
      setBusy(false);
    }
  }

  async function genOutfitImage() {
    if (!recText.trim()) return;
    setBusy(true);
    setOutfitImg("");
    try {
      const res = await fetch("/api/outfit-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: recText }),
      });
      const data = await res.json();
      const url = String(data?.imageDataUrl ?? data?.dataUrl ?? data?.url ?? "").trim();
      setOutfitImg(url);
      if (!url) setRecText((t) => t + "\n\n（已呼叫 /api/outfit-image，但未取得 imageDataUrl/dataUrl/url）");
    } catch {
      setRecText((t) => t + "\n\n（生成圖片失敗：請確認 /api/outfit-image 與 OpenAI key）");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main className="safe">
        {tab === "wardrobe" && (
          <>
            <div className="topBrand">
              <span className="dot" />
              MY WARDROBE
            </div>
            <div className="h1">我的衣櫃日記</div>
            <div className="sub">今天收集了 {items.length} 件寶貝</div>

            <div className="rowScroll">
              <button className={categoryFilter === "全部" ? "chip chipActive" : "chip"} onClick={() => setCategoryFilter("全部")}>
                全部
              </button>
              {CATEGORIES.map((c) => (
                <button key={c} className={categoryFilter === c ? "chip chipActive" : "chip"} onClick={() => setCategoryFilter(c)}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid">
              {filtered.map((x) => (
                <div className="card" key={x.id}>
                  <div className="cardImg">
                    {x.imageDataUrl ? (
                      <img src={x.imageDataUrl} alt={x.name} />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          color: "rgba(60,58,54,.55)",
                          fontWeight: 900,
                          fontSize: 28,
                        }}
                      >
                        {x.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="badge">{x.category}</div>
                    <button className="xBtn" onClick={() => remove(x.id)} aria-label="delete">
                      ✕
                    </button>
                  </div>
                  <div className="cardBody">
                    <div className="title">{x.name}</div>
                    <div className="meta">{x.color ? `色系：${x.color}` : "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "mix" && (
          <>
            <div className="topBrand">
              <span className="dot" />
              MIX & MATCH
            </div>
            <div className="h1">自選穿搭</div>
            <div className="sub">先把衣櫃補齊，再來這裡組套裝會最順</div>

            <div className="panel" style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>選擇搭配（示意）</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <DashBox label="內搭" />
                <DashBox label="上衣" />
                <DashBox label="下著" />
                <DashBox label="外套" />
                <DashBox label="鞋子" />
                <DashBox label="配件" wide />
              </div>

              <div style={{ marginTop: 14 }} className="smallRow">
                <button className="btnGhost" onClick={() => setTab("wardrobe")}>
                  去衣櫃選單品
                </button>
                <button className="btnPrimary" onClick={() => setTab("inspire")}>
                  去看今日推薦
                </button>
              </div>
            </div>
          </>
        )}

        {tab === "inspire" && (
          <>
            <div className="topBrand">
              <span className="dot" />
              STYLE GUIDE
            </div>
            <div className="h1">穿搭靈感</div>
            <div className="sub">依情境與風格，從你的衣櫃生成建議</div>

            <div className="panel">
              <div style={{ fontWeight: 900, marginBottom: 10 }}>第一步：今天要去哪？</div>
              <div className="rowScroll">
                {(["日常", "上班", "約會", "運動", "度假", "派對"] as const).map((x) => (
                  <button key={x} className={scene === x ? "chip chipActive" : "chip"} onClick={() => setScene(x)}>
                    {x}
                  </button>
                ))}
              </div>

              <div style={{ fontWeight: 900, margin: "12px 0 10px" }}>第二步：想走什麼風格？</div>
              <div className="rowScroll">
                {(["隨機", "極簡", "街頭", "日系", "韓系", "復古", "Smart Casual", "運動風", "老錢風", "Gorpcore"] as const).map((x) => (
                  <button key={x} className={style === x ? "chip chipActive" : "chip"} onClick={() => setStyle(x)}>
                    {x}
                  </button>
                ))}
              </div>

              <div className="label">天氣（可不填）</div>
              <input className="input" value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="例如：台北 13°C 小雨" />

              <div className="label">備註（可不填）</div>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：不想太正式、需要好走的鞋" />

              <div style={{ marginTop: 12 }}>
                <button className="btnPrimary" onClick={genRecommend} disabled={busy}>
                  {busy ? "生成中…" : "生成今日穿搭建議"}
                </button>
              </div>

              {recText && (
                <div style={{ marginTop: 12 }}>
                  <div className="label">推薦結果</div>
                  <div className="panel" style={{ background: "rgba(255,255,255,.60)" }}>
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, fontWeight: 750 }}>{recText}</div>
                  </div>

                  <div style={{ marginTop: 10 }} className="smallRow">
                    <button className="btnGhost" onClick={genOutfitImage} disabled={busy}>
                      {busy ? "生成中…" : "虛擬試穿（生成圖片）"}
                    </button>
                    <button className="btnGhost" onClick={() => { setRecText(""); setOutfitImg(""); }}>
                      清除
                    </button>
                  </div>

                  {outfitImg && (
                    <div style={{ marginTop: 12 }} className="panel">
                      <div style={{ fontWeight: 900, marginBottom: 10 }}>生成圖片</div>
                      {/* 可能是 dataURL 或 URL */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={outfitImg} alt="outfit" style={{ width: "100%", borderRadius: 18, border: "1px solid rgba(60,58,54,.10)" }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "me" && (
          <>
            <div className="topBrand">
              <span className="dot" />
              PROFILE
            </div>
            <div className="h1">個人</div>
            <div className="sub">資料都存在本機 LocalStorage（目前不做雲端同步）</div>

            <div className="panel">
              <div style={{ fontWeight: 900, marginBottom: 10 }}>快速操作</div>
              <div className="smallRow">
                <button className="btnGhost" onClick={() => setQuickOpen(true)}>
                  ⚡ 快速加入基礎單品
                </button>
                <button
                  className="btnGhost"
                  onClick={() => {
                    if (!confirm("確定要清空衣櫃？")) return;
                    setItems([]);
                    setCategoryFilter("全部");
                  }}
                >
                  清空衣櫃
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FABs */}
      <div className="fabRow">
        <button className="fab fabSoft" onClick={() => setQuickOpen(true)} aria-label="quick add">
          ⚡
        </button>
        <button className="fab" onClick={() => setAddOpen(true)} aria-label="add">
          <span style={{ fontSize: 34, lineHeight: 1 }}>＋</span>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="bottomNavWrap">
        <nav className="bottomNav">
          <button className={tab === "wardrobe" ? "navItem navActive" : "navItem"} onClick={() => setTab("wardrobe")}>
            <Icon name="closet" />
            衣櫃
          </button>
          <button className={tab === "mix" ? "navItem navActive" : "navItem"} onClick={() => setTab("mix")}>
            <Icon name="layers" />
            自選
          </button>
          <button className={tab === "inspire" ? "navItem navActive" : "navItem"} onClick={() => setTab("inspire")}>
            <Icon name="bag" />
            靈感
          </button>
          <button className={tab === "me" ? "navItem navActive" : "navItem"} onClick={() => setTab("me")}>
            <Icon name="user" />
            個人
          </button>
        </nav>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileLibraryRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          await addFromFile(f);
          setAddOpen(false);
        }}
      />
      <input
        ref={fileCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          await addFromFile(f);
          setAddOpen(false);
        }}
      />
      <input
        ref={fileAnyRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          await addFromFile(f);
          setAddOpen(false);
        }}
      />

      {/* Add sheet */}
      <Sheet
        open={addOpen}
        title="加入衣櫃"
        icon={<span>＋</span>}
        onClose={() => {
          setAddOpen(false);
          setManualOpen(false);
        }}
      >
        {!manualOpen ? (
          <div className="actionList">
            <button className="actionBtn" onClick={() => fileLibraryRef.current?.click()}>
              照片圖庫 <span>選相簿照片</span>
            </button>
            <button className="actionBtn" onClick={() => fileCameraRef.current?.click()}>
              拍照 <span>直接開相機</span>
            </button>
            <button className="actionBtn" onClick={() => fileAnyRef.current?.click()}>
              選擇檔案 <span>從檔案挑選</span>
            </button>
            <button className="actionBtn" onClick={() => setManualOpen(true)}>
              手動新增 <span>不附照片</span>
            </button>
          </div>
        ) : (
          <>
            <div className="label">名稱</div>
            <input className="input" value={mName} onChange={(e) => setMName(e.target.value)} placeholder="例如：溫暖米色針織上衣" />

            <div className="label">分類</div>
            <div className="rowScroll">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={mCategory === c ? "chip chipActive" : "chip"}
                  onClick={() => setMCategory(c)}
                  type="button"
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="label">色系（可不填，例如：奶茶/灰藍/霧紫）</div>
            <input className="input" value={mColor} onChange={(e) => setMColor(e.target.value)} placeholder="莫蘭迪色描述" />

            <div style={{ marginTop: 12 }} className="smallRow">
              <button className="btnGhost" onClick={() => setManualOpen(false)}>
                返回
              </button>
              <button className="btnPrimary" onClick={addManual}>
                儲存
              </button>
            </div>
          </>
        )}
      </Sheet>

      {/* Quick add sheet */}
      <Sheet open={quickOpen} title="快速加入基礎單品" icon={<span>⚡</span>} onClose={() => setQuickOpen(false)}>
        <div className="presetGrid">
          {presets.map((p) => (
            <button key={p.name} className="preset" onClick={() => addPreset(p)} type="button">
              <div className="presetCircle" style={{ background: p.color }} />
              <div className="presetLabel">{p.name}</div>
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}

function DashBox({ label, wide }: { label: string; wide?: boolean }) {
  return (
    <div
      style={{
        gridColumn: wide ? "1 / -1" : undefined,
        border: "2px dashed rgba(60,58,54,.14)",
        borderRadius: 22,
        height: wide ? 120 : 130,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,.40)",
      }}
    >
      <div style={{ color: "rgba(60,58,54,.55)", fontWeight: 900 }}>{label}</div>
    </div>
  );
}

function readAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}