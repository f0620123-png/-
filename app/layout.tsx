import "./globals.css";

export const metadata = {
  title: "Wardrobe AI",
  description: "衣櫃管理 + 每日穿搭推薦（Vercel）"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <div className="appShell">
          <header className="topBar">
            <div className="brand">
              <div className="brandTitle">Wardrobe AI</div>
              <div className="brandSub">衣櫃管理 · 每日推薦</div>
            </div>
          </header>

          <main className="container">{children}</main>

          <footer className="footer">
            <span>LocalStorage 儲存（不含雲端同步）</span>
          </footer>
        </div>
      </body>
    </html>
  );
}