"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type TabKey = "closet" | "recommend" | "calendar" | "settings";
type Category = "上衣" | "下著" | "內搭" | "外套" | "鞋子" | "配件" | "連身" | "背心" | "襪子";

type WardrobeItem = {
  id: string;
  name: string;
  category: Category;
  colors?: string[];
  season?: "春" | "夏" | "秋" | "冬" | "四季";
  notes?: string;
  imageDataUrl?: string;
  createdAt: number;
};

type OutfitPlan = {
  date: string; // YYYY-MM-DD
  text: string; // 推薦文字
  imageDataUrl?: string;
  createdAt: number;
};

const LS_ITEMS = "smartcloset_items_v1";
const LS_PLANS = "smartcloset_plans_v1";

const CATEGORIES: Category[] = ["上衣","下著","內搭","外套","鞋子","配件","連身","背心","襪子"];

function uid() { return Math.random().toString(16).slice(2) + "_" + Date.now().toString(16); }
function safeParse<T>(s: string | null): T | null { try { return s ? (JSON.parse(s) as T) : null; } catch { return null; } }
function readAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="sheetOverlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheetHeader">
          <div className="sheetTitle">{title}</div>
          <button className="sheetClose" onClick={onClose}>✕</button>
        </div>
        <div className="sheetBody">{children}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState<TabKey>("closet");

  // closet
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [cat, setCat] = useState<Category | "全部">("全部");
  const [addOpen, setAddOpen] = useState(false);

  // add modes
  const [mode, setMode] = useState<"photo" | "ai" | "manual">("photo");
  const fileRef = useRef<HTMLInputElement | null>(null);

  // manual
  const [mName, setMName] = useState("");
  const [mCategory, setMCategory] = useState<Category>("上衣");
  const [mColors, setMColors] = useState("");
  const [mSeason, setMSeason] = useState<WardrobeItem["season"]>("四季");
  const [mNotes, setMNotes] = useState("");

  // ai add
  const [aiBusy, setAiBusy] = useState(false);
  const [aiPreview, setAiPreview] = useState<string>("");
  const [aiResult, setAiResult] = useState<any>(null);

  // weather & recommend
  const [wxBusy, setWxBusy] = useState(false);
  const [weatherText, setWeatherText] = useState<string>("尚未取得");
  const [scene, setScene] = useState<"日常"|"上班"|"約會"|"運動"|"度假"|"派對">("日常");
  const [style, setStyle] = useState<"隨機"|"極簡"|"街頭"|"日系"|"韓系"|"復古"|"Smart Casual"|"老錢風"|"Gorpcore">("隨機");
  const [note, setNote] = useState("");
  const [recBusy, setRecBusy] = useState(false);
  const [recText, setRecText] = useState("");
  const [imgBusy, setImgBusy] = useState(false);
  const [outfitImg, setOutfitImg] = useState("");

  // calendar
  const [plans, setPlans] = useState<OutfitPlan[]>([]);
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,"0");
  const dd = String(today.getDate()).padStart(2,"0");
  const todayKey = `${yyyy}-${mm}-${dd}`;
  const [planDate, setPlanDate] = useState(todayKey);

  useEffect(() => {
    const saved = safeParse<WardrobeItem[]>(localStorage.getItem(LS_ITEMS));
    if (saved && Array.isArray(saved)) setItems(saved);

    const savedPlans = safeParse<OutfitPlan[]>(localStorage.getItem(LS_PLANS));
    if (savedPlans && Array.isArray(savedPlans)) setPlans(savedPlans);
  }, []);

  useEffect(() => { localStorage.setItem(LS_ITEMS, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(LS_PLANS, JSON.stringify(plans)); }, [plans]);

  const filtered = useMemo(() => {
    const base = [...items].sort((a,b)=>b.createdAt-a.createdAt);
    return cat === "全部" ? base : base.filter(x=>x.category===cat);
  }, [items, cat]);

  function removeItem(id: string) { setItems(p => p.filter(x=>x.id!==id)); }

  function addManual() {
    if (!mName.trim()) return;
    const it: WardrobeItem = {
      id: uid(),
      name: mName.trim(),
      category: mCategory,
      colors: mColors.trim() ? mColors.split(/[,，、\s]+/).filter(Boolean) : undefined,
      season: mSeason,
      notes: mNotes.trim() || undefined,
      createdAt: Date.now(),
    };
    setItems(p => [it, ...p]);
    setMName(""); setMColors(""); setMNotes(""); setMSeason("四季");
    setAddOpen(false);
    setTab("closet");
  }

  async function addFromPhoto(file: File) {
    const dataUrl = await readAsDataURL(file);
    const it: WardrobeItem = {
      id: uid(),
      name: file.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i,"") || "未命名",
      category: "上衣",
      imageDataUrl: dataUrl,
      createdAt: Date.now(),
    };
    setItems(p => [it, ...p]);
  }

  async function runAiExtract() {
    if (!aiPreview) return;
    setAiBusy(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/extract-item", {
        method: "POST",
        headers: { "content-type":"application/json" },
        body: JSON.stringify({ imageDataUrl: aiPreview })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "extract failed");
      setAiResult(data.data);
    } catch (e: any) {
      setAiResult({ error: e?.message || String(e) });
    } finally {
      setAiBusy(false);
    }
  }

  function confirmAiAdd() {
    if (!aiResult || aiResult?.error) return;
    const it: WardrobeItem = {
      id: uid(),
      name: String(aiResult.name || "未命名"),
      category: aiResult.category as Category,
      colors: Array.isArray(aiResult.colors) ? aiResult.colors : undefined,
      season: aiResult.season,
      notes: String(aiResult.notes || ""),
      imageDataUrl: aiPreview || undefined,
      createdAt: Date.now()
    };
    setItems(p => [it, ...p]);
    setAiPreview("");
    setAiResult(null);
    setAddOpen(false);
    setTab("closet");
  }

  async function getWeatherByGPS() {
    setWxBusy(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000 });
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Open-Meteo 無需 key（示意：僅抓 current temp）
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code&timezone=Asia%2FTaipei`;
      const r = await fetch(url);
      const j = await r.json();

      const t = j?.current?.temperature_2m;
      const at = j?.current?.apparent_temperature;
      const p = j?.current?.precipitation;
      setWeatherText(`GPS：${t}°C（體感 ${at}°C）｜降水 ${p}（示意）`);
    } catch (e: any) {
      setWeatherText(`取得失敗：${e?.message || String(e)}（可改用手動填寫）`);
    } finally {
      setWxBusy(false);
    }
  }

  async function genRecommend() {
    setRecBusy(true);
    setRecText("");
    setOutfitImg("");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type":"application/json" },
        body: JSON.stringify({
          wardrobe: items,
          context: { scene, style, weatherText, note }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "recommend failed");
      setRecText(String(data.text || "").trim());
    } catch (e: any) {
      setRecText(`推薦失敗：${e?.message || String(e)}`);
    } finally {
      setRecBusy(false);
    }
  }

  async function genOutfitImage() {
    if (!recText.trim()) return;
    setImgBusy(true);
    setOutfitImg("");
    try {
      const res = await fetch("/api/outfit-image", {
        method: "POST",
        headers: { "content-type":"application/json" },
        body: JSON.stringify({ text: recText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "image failed");
      setOutfitImg(String(data.imageDataUrl || ""));
    } catch (e: any) {
      setRecText(t => t + `\n\n（生成示意圖失敗：${e?.message || String(e)}）`);
    } finally {
      setImgBusy(false);
    }
  }

  function savePlan() {
    if (!recText.trim()) return;
    const p: OutfitPlan = { date: planDate, text: recText, imageDataUrl: outfitImg || undefined, createdAt: Date.now() };
    setPlans(prev => [p, ...prev.filter(x => x.date !== planDate)]);
    setTab("calendar");
  }

  function deletePlan(date: string) {
    setPlans(prev => prev.filter(x => x.date !== date));
  }

  const planMap = useMemo(() => {
    const m = new Map<string, OutfitPlan>();
    for (const p of plans) m.set(p.date, p);
    return m;
  }, [plans]);

  return (
    <>
      <main className="safe">
        {tab === "closet" && (
          <>
            <div className="topBrand"><span className="dot" />SMARTCLOSET AI</div>
            <div className="h1">我的衣櫃</div>
            <div className="sub">已收集 {items.length} 件｜可依類型新增/刪除</div>

            <div className="rowScroll">
              <button className={cat==="全部" ? "chip chipActive":"chip"} onClick={()=>setCat("全部")}>全部</button>
              {CATEGORIES.map(c=>(
                <button key={c} className={cat===c ? "chip chipActive":"chip"} onClick={()=>setCat(c)}>{c}</button>
              ))}
            </div>

            <div className="grid">
              {filtered.map(x=>(
                <div className="card" key={x.id}>
                  <div className="cardImg">
                    {x.imageDataUrl ? <img src={x.imageDataUrl} alt={x.name} /> : (
                      <div style={{width:"100%",height:"100%",display:"grid",placeItems:"center",color:"rgba(63,58,53,.55)",fontWeight:1000,fontSize:28}}>
                        {x.name.slice(0,1)}
                      </div>
                    )}
                    <div className="badge">{x.category}</div>
                    <button className="xBtn" onClick={()=>removeItem(x.id)}>✕</button>
                  </div>
                  <div className="cardBody">
                    <div className="title">{x.name}</div>
                    <div className="meta">
                      {x.colors?.length ? `色系：${x.colors.join("、")}` : "—"}
                      {x.season ? `｜季節：${x.season}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "recommend" && (
          <>
            <div className="topBrand"><span className="dot" />STYLE GUIDE</div>
            <div className="h1">天氣穿搭推薦</div>
            <div className="sub">用所在地溫度 + 你的衣櫃生成方案</div>

            <div className="panel">
              <div style={{fontWeight:1000, marginBottom:10}}>天氣</div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{flex:1, fontWeight:900, color:"rgba(63,58,53,.75)"}}>{weatherText}</div>
                <button className="btnGhost" style={{width:140}} onClick={getWeatherByGPS} disabled={wxBusy}>
                  {wxBusy ? "取得中…" : "用GPS取得"}
                </button>
              </div>

              <div style={{fontWeight:1000, margin:"12px 0 10px"}}>情境</div>
              <div className="rowScroll">
                {(["日常","上班","約會","運動","度假","派對"] as const).map(x=>(
                  <button key={x} className={scene===x ? "chip chipActive":"chip"} onClick={()=>setScene(x)}>{x}</button>
                ))}
              </div>

              <div style={{fontWeight:1000, margin:"12px 0 10px"}}>風格</div>
              <div className="rowScroll">
                {(["隨機","極簡","街頭","日系","韓系","復古","Smart Casual","老錢風","Gorpcore"] as const).map(x=>(
                  <button key={x} className={style===x ? "chip chipActive":"chip"} onClick={()=>setStyle(x)}>{x}</button>
                ))}
              </div>

              <div className="label">備註（可不填）</div>
              <input className="input" value={note} onChange={(e)=>setNote(e.target.value)} placeholder="例如：不想太正式、要好走的鞋" />

              <div style={{marginTop:12}}>
                <button className="btnPrimary" onClick={genRecommend} disabled={recBusy}>
                  {recBusy ? "生成中…" : "生成推薦"}
                </button>
              </div>

              {recText && (
                <div style={{marginTop:12}}>
                  <div className="label">推薦結果</div>
                  <div className="panel" style={{background:"rgba(255,255,255,.50)"}}>
                    <div style={{whiteSpace:"pre-wrap",lineHeight:1.6,fontWeight:900}}>{recText}</div>
                  </div>

                  <div style={{marginTop:10}} className="smallRow">
                    <button className="btnGhost" onClick={genOutfitImage} disabled={imgBusy}>
                      {imgBusy ? "生成中…" : "生成全身示意圖"}
                    </button>
                    <button className="btnGhost" onClick={savePlan}>存到行事曆</button>
                  </div>

                  {outfitImg && (
                    <div style={{marginTop:12}} className="panel">
                      <div style={{fontWeight:1000, marginBottom:10}}>示意圖</div>
                      <img src={outfitImg} alt="outfit" style={{width:"100%",borderRadius:18,border:"1px solid rgba(63,58,53,.10)"}} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "calendar" && (
          <>
            <div className="topBrand"><span className="dot" />OUTFIT CALENDAR</div>
            <div className="h1">穿搭行事曆</div>
            <div className="sub">把某天的推薦存起來，之後回看</div>

            <div className="panel">
              <div className="label">選擇日期</div>
              <input className="input" type="date" value={planDate} onChange={(e)=>setPlanDate(e.target.value)} />
              <div style={{marginTop:10, color:"rgba(63,58,53,.65)", fontWeight:900, fontSize:12}}>
                你可以在「推薦」頁生成後，按「存到行事曆」。
              </div>
            </div>

            <div style={{marginTop:12}} className="panel">
              <div style={{fontWeight:1000, marginBottom:10}}>已儲存</div>

              {plans.length === 0 && <div style={{color:"rgba(63,58,53,.65)", fontWeight:900}}>尚未儲存任何穿搭。</div>}

              {plans.map(p=>(
                <div key={p.date} style={{padding:"10px 0", borderTop:"1px solid rgba(63,58,53,.10)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                    <div style={{fontWeight:1000}}>{p.date}</div>
                    <button className="btnGhost" style={{width:110}} onClick={()=>deletePlan(p.date)}>刪除</button>
                  </div>
                  <div style={{whiteSpace:"pre-wrap",lineHeight:1.6,fontWeight:900, color:"rgba(63,58,53,.80)", marginTop:8}}>
                    {p.text}
                  </div>
                  {p.imageDataUrl && (
                    <img src={p.imageDataUrl} alt="plan" style={{width:"100%",borderRadius:18,border:"1px solid rgba(63,58,53,.10)", marginTop:10}} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "settings" && (
          <>
            <div className="topBrand"><span className="dot" />SETTINGS</div>
            <div className="h1">設定</div>
            <div className="sub">目前資料存本機（LocalStorage），不做帳號登入</div>

            <div className="panel">
              <div style={{fontWeight:1000, marginBottom:10}}>測試 API</div>
              <div className="smallRow">
                <button
                  className="btnGhost"
                  onClick={async () => {
                    const r = await fetch("/api/health");
                    alert(JSON.stringify(await r.json(), null, 2));
                  }}
                >
                  /api/health
                </button>
                <button
                  className="btnGhost"
                  onClick={() => {
                    if (!confirm("確定清空衣櫃與行事曆？")) return;
                    setItems([]);
                    setPlans([]);
                    setCat("全部");
                  }}
                >
                  清空資料
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <div className="fabRow">
        <button className="fab fabSoft" onClick={()=>{ setAddOpen(true); setMode("ai"); }} aria-label="ai add">AI</button>
        <button className="fab" onClick={()=>{ setAddOpen(true); setMode("photo"); }} aria-label="add">＋</button>
      </div>

      {/* bottom nav */}
      <div className="bottomNavWrap">
        <nav className="bottomNav">
          <button className={tab==="closet" ? "navItem navActive":"navItem"} onClick={()=>setTab("closet")}>衣櫃</button>
          <button className={tab==="recommend" ? "navItem navActive":"navItem"} onClick={()=>setTab("recommend")}>推薦</button>
          <button className={tab==="calendar" ? "navItem navActive":"navItem"} onClick={()=>setTab("calendar")}>行事曆</button>
          <button className={tab==="settings" ? "navItem navActive":"navItem"} onClick={()=>setTab("settings")}>設定</button>
        </nav>
      </div>

      {/* hidden input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const dataUrl = await readAsDataURL(f);

          if (mode === "photo") {
            await addFromPhoto(f);
            setAddOpen(false);
            setTab("closet");
          } else if (mode === "ai") {
            setAiPreview(dataUrl);
            setAiResult(null);
          }
        }}
      />

      {/* add sheet */}
      <Sheet open={addOpen} title="加入衣櫃" onClose={()=>{ setAddOpen(false); setAiPreview(""); setAiResult(null); }}>
        <div className="rowScroll">
          <button className={mode==="photo" ? "chip chipActive":"chip"} onClick={()=>setMode("photo")}>照片加入</button>
          <button className={mode==="ai" ? "chip chipActive":"chip"} onClick={()=>setMode("ai")}>AI加衣</button>
          <button className={mode==="manual" ? "chip chipActive":"chip"} onClick={()=>setMode("manual")}>手動新增</button>
        </div>

        {mode === "photo" && (
          <>
            <div style={{color:"rgba(63,58,53,.65)", fontWeight:900, marginTop:8}}>
              選一張衣物照片，直接新增（你之後可再補分類）。
            </div>
            <div style={{marginTop:12}}>
              <button className="btnPrimary" onClick={()=>fileRef.current?.click()}>選擇照片</button>
            </div>
          </>
        )}

        {mode === "ai" && (
          <>
            <div style={{color:"rgba(63,58,53,.65)", fontWeight:900, marginTop:8}}>
              上傳衣物照片 → AI 自動判斷類型/顏色/季節/命名 → 一鍵加入衣櫃。
            </div>

            <div style={{marginTop:12}} className="smallRow">
              <button className="btnPrimary" onClick={()=>fileRef.current?.click()}>上傳照片</button>
              <button className="btnGhost" onClick={()=>{ setAiPreview(""); setAiResult(null); }}>清除</button>
            </div>

            {aiPreview && (
              <div style={{marginTop:12}} className="panel">
                <img src={aiPreview} alt="preview" style={{width:"100%",borderRadius:18,border:"1px solid rgba(63,58,53,.10)"}} />
                <div style={{marginTop:10}} className="smallRow">
                  <button className="btnGhost" onClick={runAiExtract} disabled={aiBusy}>
                    {aiBusy ? "辨識中…" : "AI辨識"}
                  </button>
                  <button className="btnGhost" onClick={confirmAiAdd} disabled={!aiResult || aiResult?.error}>
                    一鍵加入
                  </button>
                </div>

                {aiResult && (
                  <pre style={{marginTop:10, whiteSpace:"pre-wrap", fontWeight:900, color:"rgba(63,58,53,.80)"}}>
                    {JSON.stringify(aiResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </>
        )}

        {mode === "manual" && (
          <>
            <div className="label">名稱</div>
            <input className="input" value={mName} onChange={(e)=>setMName(e.target.value)} placeholder="例如：奶茶色針織外套" />

            <div className="label">分類</div>
            <div className="rowScroll">
              {CATEGORIES.map(c=>(
                <button key={c} className={mCategory===c ? "chip chipActive":"chip"} onClick={()=>setMCategory(c)} type="button">{c}</button>
              ))}
            </div>

            <div className="label">色系（用逗號分隔）</div>
            <input className="input" value={mColors} onChange={(e)=>setMColors(e.target.value)} placeholder="奶茶, 霧玫瑰, 暖灰（示意）" />

            <div className="label">季節</div>
            <div className="rowScroll">
              {(["春","夏","秋","冬","四季"] as const).map(s=>(
                <button key={s} className={mSeason===s ? "chip chipActive":"chip"} onClick={()=>setMSeason(s)} type="button">{s}</button>
              ))}
            </div>

            <div className="label">備註</div>
            <input className="input" value={mNotes} onChange={(e)=>setMNotes(e.target.value)} placeholder="材質/版型/穿著情境（可不填）" />

            <div style={{marginTop:12}} className="smallRow">
              <button className="btnGhost" onClick={()=>setAddOpen(false)}>取消</button>
              <button className="btnPrimary" onClick={addManual}>儲存</button>
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}