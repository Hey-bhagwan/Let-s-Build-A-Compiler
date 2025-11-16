// app/api/chapters/[name]/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type Params = { params: { name: string } };

export async function GET(_: Request, { params }: Params) {
  const {name} = await params;
  if (!name) {
    return NextResponse.json({ error: "Missing chapter name" }, { status: 400 });
  }

  // Adjust this to where your chapter files live.
  // Example: projectRoot/public/texts/tutor1.md
  const filePath = path.join(process.cwd(), "public", "texts", `${name}.md`);

  try {
    const content = await fs.readFile(filePath, "utf8");
    return new NextResponse(content, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    // file not found -> 404
    if (err.code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // other errors -> 500
    console.error("Error reading chapter file:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
