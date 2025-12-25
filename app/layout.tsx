import "./globals.css";

export const metadata = {
  title: "Wardrobe AI (Vercel版)",
  description: "Generate outfit mock images with OpenAI on Vercel"
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