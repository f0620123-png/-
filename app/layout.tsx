import "./globals.css";

export const metadata = {
  title: "Wardrobe AI",
  description: "Temperature-based outfit suggestions + AI try-on (demo)"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}