// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Let's Build a Compiler — Modern UI",
  description: "Modern viewer and AI-modernizer for Let’s Build a Compiler"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800">
        <div className="min-h-screen">
          <header className="bg-white shadow p-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-xl font-semibold">Let's Build a Compiler — Modern UI</h1>
            </div>
          </header>
          <main className="max-w-5xl mx-auto p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
