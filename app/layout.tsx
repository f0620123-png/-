import "./globals.css";

export const metadata = {
  title: "My Wardrobe",
  description: "衣櫃管理 + 日常穿搭推薦",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}