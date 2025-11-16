import fs from "fs/promises";
import path from "path";
import FileToChapter from "@/app/components/FileToChapter";

export default async function ChapterPage({ params }: { params: { name: any } }) {
  const { name } = await params;

  const filePath = path.join(process.cwd(), "public", "texts", `${name}.txt`);

  let content = "";
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch (e) {
    return <div>Chapter not found.</div>;
  }

  return <FileToChapter rawText={content} filename={`${name}.txt`} />;
}
