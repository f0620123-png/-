"use client";

import { useMemo, useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState(
    "生成一張穿搭示意圖：黑色短版皮衣、白色上衣、深藍直筒牛仔褲、白色球鞋；乾淨背景；偏寫實商品攝影風格。"
  );
  const [health, setHealth] = useState<string>("");
  const [loadingHealth, setLoadingHealth] = useState(false);

  const [loadingImg, setLoadingImg] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string>("");

  const canGenerate = useMemo(() => prompt.trim().length > 0, [prompt]);

  async function onHealth() {
    setErrMsg("");
    setHealth("");
    setLoadingHealth(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = await res.json();
      setHealth(JSON.stringify(data));
    } catch (e: any) {
      setErrMsg(e?.message || "Health check failed");
    } finally {
      setLoadingHealth(false);
    }
  }

  async function onGenerate() {
    setErrMsg("");
    setImgSrc("");
    setLoadingImg(true);
    try {
      const res = await fetch("/api/outfit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Generate failed");
      }

      if (data?.imageBase64) {
        setImgSrc(`data:image/png;base64,${data.imageBase64}`);
        return;
      }
      if (data?.imageUrl) {
        setImgSrc(data.imageUrl);
        return;
      }

      throw new Error("No image returned");
    } catch (e: any) {
      setErrMsg(e?.message || "Generate failed");
    } finally {
      setLoadingImg(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="h1">Wardrobe AI（Vercel 版）</div>
          <div className="sub">
            你需要在 Vercel 設定環境變數：<b>OPENAI_API_KEY</b>
            <br />
            （可選）<b>OPENAI_IMAGE_MODEL</b>，預設使用 <b>gpt-image-1</b>
          </div>
        </div>

        <div className="row">
          <span className="pill">API：/api/outfit（POST）</span>
          <span className="pill">API：/api/health（GET）</span>
        </div>

        <div className="hr" />

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="輸入你想要的穿搭與風格描述…"
        />

        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="btn btnPrimary"
            onClick={onGenerate}
            disabled={!canGenerate || loadingImg}
          >
            {loadingImg ? "生成中…" : "生成穿搭圖片"}
          </button>

          <button className="btn" onClick={onHealth} disabled={loadingHealth}>
            {loadingHealth ? "測試中…" : "測試 /api/health"}
          </button>
        </div>

        {(errMsg || health) && (
          <div
            className={`alert ${errMsg ? "alertError" : ""}`}
            style={{ marginTop: 12 }}
          >
            {errMsg ? errMsg : `Health: ${health}`}
          </div>
        )}

        {imgSrc && (
          <div className="preview">
            <div className="imgWrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt="outfit" />
            </div>
            <div className="alert">
              如果你看到的是空白頁，代表你先前用「連結」方式打開 API。
              現在這版已改成在同頁用 fetch 顯示，不會再跳走。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}