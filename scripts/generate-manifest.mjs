// Node v14+ (ESM). Run: node scripts/generate-manifest.mjs
import fs from "fs/promises";
import path from "path";

const textsDir = path.join(process.cwd(), "public", "texts"); // adjust if your public path differs
const outPath = path.join(textsDir, "manifest.json");

async function main() {
  try {
    const files = await fs.readdir(textsDir);
    const txts = files.filter(f => f.toLowerCase().endsWith(".txt"));

    // optional: sort numerically if filenames like tutor1, tutor2, ...
    txts.sort((a, b) => {
      const na = a.match(/\d+/)?.[0] ?? "";
      const nb = b.match(/\d+/)?.[0] ?? "";
      return Number(na) - Number(nb) || a.localeCompare(b);
    });

    await fs.writeFile(outPath, JSON.stringify(txts, null, 2), "utf8");
    console.log(`Wrote ${txts.length} entries to ${outPath}`);
  } catch (err) {
    console.error("Error generating manifest:", err);
    process.exit(1);
  }
}

main();
