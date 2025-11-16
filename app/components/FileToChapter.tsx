// components/FileToChapter.tsx
"use client"
import React, { useState, useEffect } from "react";

// --- TYPES ---
type ContentBlock = {
  type: "prose" | "code";
  content: string;
};

type Section = {
  id: string;
  title: string;
  blocks: ContentBlock[];
};

type ParsedDoc = {
  header: string;
  sections: Section[];
};

type Props = {
  rawText: string | null;
  filename?: string;
};

// --- PARSING LOGIC ---
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3) return false;
  if (!/^[A-Z\*]/.test(trimmed)) return false; 
  const hasAlpha = /[A-Z]/.test(trimmed);
  const isUpper = trimmed === trimmed.toUpperCase();
  if (!hasAlpha || !isUpper) return false;
  if (/^[\*\-=_\s]+$/.test(trimmed)) return false; 
  if (!/^[A-Z\s\*\-\(\)]*$/.test(trimmed)) return false; 
  return true;
}

function isCodeLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "") return false; 
  if (/^\s*\{/.test(line)) return true;
  if (/^\s{4,}/.test(line)) return true;
  const keywords = /\b(procedure|begin|end|case|var|const|program|else)\b/i;
  if (keywords.test(line)) return true;
  if (trimmed.endsWith(';') || line.includes(':=') || trimmed.endsWith('.')) {
    return true;
  }
  return false;
}

function parseTextToSections(text: string): ParsedDoc {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  let firstHeadingIdx = lines.findIndex(isHeadingLine);
  if (firstHeadingIdx === -1) firstHeadingIdx = 0;

  const headerLines = lines.slice(0, firstHeadingIdx);
  let headerText = "";

  const partLine = headerLines.find(line => line.trim().startsWith("Part "));
  if (partLine) {
    headerText = partLine.trim();
  } else {
    const firstLine = headerLines.find(line => line.trim() !== "");
    headerText = firstLine ? firstLine.trim() : "Document";
  }

  const sections: Section[] = [];
  let curTitle = "";
  let curContentLines: string[] = [];

  function pushCurrent() {
    if (!curTitle && curContentLines.length === 0) return;

    if (curTitle.toUpperCase().includes("COPYRIGHT")) {
      curTitle = "";
      curContentLines = [];
      return;
    }

    const title = curTitle.replace(/^[\*\s]+|[\*\s]+$/g, '') || "Untitled";
    const baseId = slugify(title || (curContentLines[0]?.slice(0, 20) || "section"));
    const id = `${baseId}-${sections.length}`;

    const blocks: ContentBlock[] = [];
    if (curContentLines.length === 0) {
      sections.push({ id, title, blocks });
      return;
    }

    let currentBlockType: "prose" | "code" = isCodeLine(curContentLines[0]) ? "code" : "prose";
    let currentBlockLines: string[] = [];

    function flushBlock() {
      if (currentBlockLines.length > 0) {
        const content = currentBlockLines.join("\n");
        if (content.trim()) {
          blocks.push({
            type: currentBlockType,
            content: currentBlockType === 'prose' ? content.trim() : content.trimEnd(),
          });
        }
        currentBlockLines = [];
      }
    }

    for (const line of curContentLines) {
      if (line.trim() === "") {
        currentBlockLines.push(line);
        continue;
      }
      const lineType = isCodeLine(line) ? "code" : "prose";
      if (lineType !== currentBlockType) {
        flushBlock();
        currentBlockType = lineType;
      }
      currentBlockLines.push(line);
    }
    
    flushBlock();
    sections.push({ id, title, blocks });
  }

  for (let i = firstHeadingIdx; i < lines.length; i++) {
    const l = lines[i];
    if (isHeadingLine(l)) {
      pushCurrent();
      curTitle = l.trim();
      curContentLines = [];
    } else {
      curContentLines.push(l);
    }
  }
  pushCurrent(); 

  if (sections.length === 0) {
    sections.push({
      id: "content-0",
      title: "Content",
      blocks: [{ type: "prose", content: lines.join("\n") }],
    });
  }

  return { header: headerText, sections };
}

// --- REACT COMPONENT ---
export default function FileToChapter({ rawText, filename }: Props) {
  const [parsed, setParsed] = useState<ParsedDoc | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // --- State for mobile TOC toggle ---
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    if (rawText) {
      const p = parseTextToSections(rawText);
      setParsed(p);
      if (p.sections.length && !selectedSection) {
        setSelectedSection(p.sections[0].id);
      }
    } else {
      setParsed(null);
    }
  }, [rawText]);

  if (!parsed) {
    return (
      <div className="p-6 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
        No text content provided.
      </div>
    );
  }

  return (
    <div className="font-sans max-w-6xl mx-auto text-gray-800 leading-relaxed">
      
      {/* --- TOC Toggle Button (Mobile Only) --- */}
      <button
        onClick={() => setIsTocOpen(!isTocOpen)}
        className="w-full px-4 py-2 mb-4 text-left font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg md:hidden"
      >
        {isTocOpen ? "Close Menu" : "Show Table of Contents"}
      </button>

      {/* --- Main Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        
        <aside 
          className={`
            ${isTocOpen ? 'block' : 'hidden'} md:block 
            sticky top-0 self-start md:border-r md:border-gray-200 md:pr-6
          `}
        >
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              {parsed.header}
            </h2>
          </div>

          <div>
            <h3 className="mt-4 mb-3 text-base font-semibold text-gray-900">
              Table of Contents
            </h3>
            <ul className="p-0 m-0 list-none">
              {parsed.sections.map((s) => (
                <li key={s.id} className="mb-1">
                  <button
                    onClick={() => {
                      setSelectedSection(s.id);
                      setIsTocOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-sm text-left text-gray-700 rounded-md transition-colors hover:bg-gray-100
                                 aria-current:bg-blue-50 aria-current:text-blue-600 aria-current:font-semibold"
                    aria-current={selectedSection === s.id ? "true" : "false"}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right: Section content */}
        <main 
          className={`
            ${isTocOpen ? 'hidden' : 'block'} md:block
            min-w-0 
          `}
        >
          {parsed.sections.map((s) => {
            if (s.id !== selectedSection) return null;
            return (
              <section key={s.id}>
                <h1 className="mt-0 mb-4 text-3xl font-bold text-gray-900 wrap-break-words">
                  {s.title}
                </h1>
                
                {s.blocks.map((block, index) => {
                  if (block.type === "code") {
                    return (
                      <pre
                        key={index}
                        className="p-4 mb-6 overflow-x-auto font-mono leading-relaxed text-gray-100 bg-gray-900 rounded-lg whitespace-pre-wrap"
                      >
                        {block.content}
                      </pre>
                    );
                  }
                  return (
                    <div
                      key={index}
                      className="mb-6 text-base text-gray-700 whitespace-pre-wrap wrap-break-words leading-relaxed"
                    >
                      {block.content}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}