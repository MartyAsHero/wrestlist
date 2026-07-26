import "./globals.css";
import Header from "../components/Header";

export const metadata = {
  title: "Wrestlist — track every WWE & AEW show",
  description: "A watch tracker for WWE and AEW shows, PLEs, documentaries, and movies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-bg text-ink">
        <Header />
        <main className="max-w-6xl mx-auto px-5 py-6 pb-20">{children}</main>
      </body>
    </html>
  );
}
