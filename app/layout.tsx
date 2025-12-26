import "./globals.css";

export const metadata = {
  title: "Wardrobe AI",
  description: "衣櫃管理 + 日常穿搭推薦",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <div className="appShell">
          <header className="topBar">
            <div className="brand">
              <div className="logoDot" />
              <div>
                <div className="brandTitle">Wardrobe AI</div>
                <div className="brandSub">衣櫃管理 / 日常推薦搭配</div>
              </div>
            </div>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">
            <span className="muted">Vercel + Next.js</span>
          </footer>
        </div>
      </body>
    </html>
  );
}