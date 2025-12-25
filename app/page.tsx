"use client";

import { useMemo, useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState(
    "生成一張穿搭示意圖：黑色短版皮衣、白色上衣、深藍直筒牛仔褲、白色球鞋；乾淨背景、偏寫實商品攝影風格。"
  );
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => prompt.trim().length > 0 && !loading, [prompt, loading]);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const res = await fetch("/api/outfit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Unknown error");
        return;
      }

      setImageUrl(data.imageDataUrl);
    } catch (e: any) {
      setError(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="card">
      <h1 style={{ marginTop: 0 }}>Wardrobe AI（Vercel 版）</h1>

      <p className="small" style={{ marginTop: 6 }}>
        你需要在 Vercel 設定環境變數：<b>OPENAI_API_KEY</b>
      </p>

      <div style={{ marginTop: 14 }}>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </div>

      <div className="row" style={{ marginTop: 12, alignItems: "center" }}>
        <button onClick={onGenerate} disabled={!canSubmit}>
          {loading ? "生成中…" : "生成穿搭圖片"}
        </button>

        <a className="small" href="/api/health" target="_blank" rel="noreferrer">
          測試 /api/health
        </a>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: "#ffb4b4" }}>
          <b>錯誤：</b>
          {error}
        </div>
      )}

      {imageUrl && (
        <div style={{ marginTop: 14 }}>
          <img className="img" src={imageUrl} alt="Generated outfit" />
        </div>
      )}
    </main>
  );
}