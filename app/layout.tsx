import "./globals.css";

export const metadata = {
  title: "SmartCloset AI",
  description: "衣櫃管理 + 天氣穿搭推薦 + AI示意圖",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}

        {/* 用來驗證你看到的是最新部署（避免 Vercel / Safari 快取） */}
        <footer
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "6px 10px",
            fontSize: 11,
            color: "rgba(63,58,53,.55)",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 80,
          }}
        >
          v2025-12-26-closet-1
        </footer>
      </body>
    </html>
  );
}