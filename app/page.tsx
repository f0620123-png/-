:root{
  --bg:#0b1220;
  --card:#121b2f;
  --card2:#0f172a;
  --stroke:rgba(255,255,255,.10);
  --text:rgba(255,255,255,.92);
  --muted:rgba(255,255,255,.65);
  --muted2:rgba(255,255,255,.45);
  --pri:#7c9cff;
  --pri2:#3f63ff;
  --danger:#ff5a7a;
  --ok:#37d67a;
  --shadow: 0 20px 60px rgba(0,0,0,.35);
  --r16:16px;
  --r12:12px;
  --pad:14px;
  --max: 980px;
  color-scheme: dark;
}

*{ box-sizing:border-box; }
html,body{ padding:0; margin:0; background:radial-gradient(1200px 800px at 20% 10%, rgba(124,156,255,.18), transparent 60%),
                                 radial-gradient(900px 700px at 80% 20%, rgba(55,214,122,.10), transparent 55%),
                                 var(--bg);
          color:var(--text); font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Display", "PingFang TC", "Noto Sans TC", "Segoe UI", Roboto, Arial; }

a{ color:var(--pri); text-decoration:none; }
a:hover{ text-decoration:underline; }

.appShell{ min-height:100dvh; display:flex; flex-direction:column; }
.topBar{
  position:sticky; top:0; z-index:10;
  backdrop-filter: blur(10px);
  background:rgba(11,18,32,.7);
  border-bottom:1px solid var(--stroke);
}
.brand{ max-width:var(--max); margin:0 auto; padding:14px 16px; display:flex; gap:12px; align-items:center; }
.logoDot{ width:14px; height:14px; border-radius:999px; background:linear-gradient(135deg, var(--pri), rgba(55,214,122,.9)); box-shadow:0 0 0 4px rgba(124,156,255,.10); }
.brandTitle{ font-weight:700; letter-spacing:.3px; }
.brandSub{ font-size:12px; color:var(--muted); margin-top:2px; }

.main{ width:100%; max-width:var(--max); margin:0 auto; padding:18px 16px 40px; flex:1; }
.footer{ border-top:1px solid var(--stroke); padding:14px 16px; color:var(--muted2); text-align:center; }

.card{
  background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
  border:1px solid var(--stroke);
  border-radius:var(--r16);
  box-shadow:var(--shadow);
}
.cardInner{ padding:16px; }

.grid2{ display:grid; grid-template-columns: 1.15fr .85fr; gap:14px; }
@media (max-width: 860px){
  .grid2{ grid-template-columns: 1fr; }
}

.row{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.stack{ display:flex; flex-direction:column; gap:10px; }
.muted{ color:var(--muted); }
.hint{ color:var(--muted2); font-size:12px; }

.tabs{ display:flex; gap:8px; padding:8px; border-radius:999px; border:1px solid var(--stroke); background:rgba(255,255,255,.03); width:max-content;}
.tabBtn{
  border:0; cursor:pointer;
  padding:10px 14px;
  border-radius:999px;
  background:transparent;
  color:var(--muted);
  font-weight:600;
}
.tabBtn.active{ background:rgba(124,156,255,.18); color:var(--text); border:1px solid rgba(124,156,255,.30); }

.btn{
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.06);
  color:var(--text);
  border-radius:12px;
  padding:10px 12px;
  font-weight:700;
  cursor:pointer;
}
.btn:hover{ border-color: rgba(255,255,255,.22); background:rgba(255,255,255,.08); }
.btnPrimary{
  border-color: rgba(124,156,255,.45);
  background: linear-gradient(180deg, rgba(124,156,255,.22), rgba(124,156,255,.10));
}
.btnDanger{
  border-color: rgba(255,90,122,.45);
  background: linear-gradient(180deg, rgba(255,90,122,.20), rgba(255,90,122,.08));
}
.btnSmall{ padding:8px 10px; border-radius:10px; font-weight:700; font-size:13px; }

.input, .select, .textarea{
  width:100%;
  background:rgba(255,255,255,.04);
  border:1px solid var(--stroke);
  color:var(--text);
  border-radius:12px;
  padding:10px 12px;
  outline:none;
}
.textarea{ min-height:92px; resize:vertical; }
.input:focus, .select:focus, .textarea:focus{ border-color: rgba(124,156,255,.45); box-shadow:0 0 0 4px rgba(124,156,255,.12); }

.label{ font-size:12px; color:var(--muted); margin-bottom:6px; }
.field{ display:flex; flex-direction:column; gap:6px; }

.pill{
  display:inline-flex; align-items:center; gap:8px;
  border:1px solid var(--stroke);
  background:rgba(255,255,255,.03);
  padding:8px 10px;
  border-radius:999px;
  color:var(--muted);
  font-size:12px;
}

.list{ display:flex; flex-direction:column; gap:10px; }
.item{
  border:1px solid var(--stroke);
  background:rgba(255,255,255,.03);
  border-radius:14px;
  padding:12px;
  display:flex;
  justify-content:space-between;
  gap:10px;
}
.itemTitle{ font-weight:800; }
.itemMeta{ color:var(--muted); font-size:12px; margin-top:4px; }
.badge{
  font-size:12px; font-weight:800;
  padding:6px 10px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.04);
}

.alert{
  border:1px solid rgba(255,90,122,.35);
  background:rgba(255,90,122,.10);
  border-radius:14px;
  padding:12px;
  color:rgba(255,255,255,.92);
}
.ok{
  border:1px solid rgba(55,214,122,.35);
  background:rgba(55,214,122,.08);
  border-radius:14px;
  padding:12px;
}
.code{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size:12px;
  white-space:pre-wrap;
}