import "./globals.css";

export const metadata = {
  title: "Wardrobe AI",
  description: "AI outfit helper"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}