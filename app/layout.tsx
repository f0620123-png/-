import "./globals.css";

export const metadata = {
  title: "MY WARDROBE",
  description: "衣櫃管理 + 日常穿搭推薦",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}

        {/* 這個 footer 的版本字是用來「驗證你看到的是最新部署」 */}
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
          }}
        >
          v2025-12-26-1
        </footer>
      </body>
    </html>
  );
}
