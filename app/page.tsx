"use client";

import { useState } from "react";

export default function Page() {
  const [wardrobe, setWardrobe] = useState("上衣：白T、黑帽T、牛仔外套\n下身：黑長褲、牛仔褲\n鞋：白球鞋\n情境：新竹，晚上要約會，偏休閒乾淨");
  const [result, setResult] = useState<string>("");
  const [imgUrl, setImgUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    setLoading(true);
    setResult("");
    setImgUrl("");
    try {
      const r = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wardrobe })
      });
      const data = await r.json();
      setResult(data?.advice || JSON.stringify(data, null, 2));
    } finally {
      setLoading(false);
    }
  }

  async function genImage() {
    setLoading(true);
    setImgUrl("");
    try {
      const r = await fetch("/api/outfit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wardrobe })
      });
      const data = await r.json();
      setImgUrl(data?.dataUrl || "");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Wardrobe AI（最小可用版）</h1>
      <p><small>先讓 Vercel 成功部署；之後再把「衣櫃管理/照片/推薦邏輯」加回來。</small></p>

      <div className="card">
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <strong>輸入你的衣櫃/情境</strong>
          <a href="/api/health" target="_blank" rel="noreferrer"><small>Health</small></a>
        </div>

        <textarea rows={8} value={wardrobe} onChange={(e) => setWardrobe(e.target.value)} style={{ width: "100%", marginTop: 10 }} />

        <div className="row" style={{ marginTop: 12 }}>
          <button onClick={askAI} disabled={loading}>拿穿搭建議</button>
          <button onClick={genImage} disabled={loading}>生成示意圖</button>
        </div>

        {result && (
          <>
            <h3>建議</h3>
            <pre>{result}</pre>
          </>
        )}

        {imgUrl && (
          <>
            <h3>示意圖</h3>
            <img src={imgUrl} alt="outfit" />
          </>
        )}
      </div>
    </div>
  );
}