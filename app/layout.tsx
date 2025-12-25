import "./globals.css";

export const metadata = {
  title: "Wardrobe AI",
  description: "Generate outfit images via OpenAI"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}