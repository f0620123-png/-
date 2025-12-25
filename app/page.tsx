export default function Page() {
  return (
    <main className="container">
      <header className="header">
        <div className="brand">MY WARDROBE</div>
        <h1>Wardrobe AI</h1>
        <p className="sub">先把網站成功部署上線，下一步再接：天氣推薦 + OpenAI 虛擬試穿。</p>
      </header>

      <section className="card">
        <h2>部署檢查</h2>
        <ol className="list">
          <li>你看到這個頁面代表 Next.js 已成功在 Vercel 跑起來。</li>
          <li>下一步我會帶你做：衣櫃 UI、快速加入、穿搭推薦、OpenAI 圖像生成。</li>
        </ol>

        <div className="actions">
          <a className="btn" href="/api/health" target="_blank" rel="noreferrer">
            測試 API（/api/health）
          </a>
        </div>
      </section>
    </main>
  );
}