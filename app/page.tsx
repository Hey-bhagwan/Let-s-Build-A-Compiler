// app/page.tsx
"use client"
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [chapters, setChapters] = useState<string[] | null>(null);

  useEffect(() => {
    fetch("/texts/manifest.json")
      .then(r => r.json())
      .then(setChapters)
      .catch(() => setChapters([]));
  }, []);

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <aside className="md:col-span-1">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Chapters</h2>
          <ul>
            {chapters ? (
              chapters.map((c) => {
                const base = c.replace(/\.txt$/, "");  // remove .txt
                return (
                  <li key={c}>
                    <Link
                      className="text-blue-600 hover:underline"
                      href={`/chapter/${encodeURIComponent(base)}`}
                    >
                      {base}
                    </Link>
                  </li>
                );
              })
            ) : (
              <li>Loading…</li>
            )}
          </ul>
        </div>
      </aside>

      <section className="md:col-span-3">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Welcome</h2>
          <p className="mt-2">Select a chapter on the left to view and modernize its content.</p>
        </div>
      </section>
    </div>
  );
}
