#!/usr/bin/env node
import sharp from "sharp";
import { resolve } from "node:path";

const publicDir = resolve(process.cwd(), "public");

const jobs = [
  {
    inFile: "fallowfpv-brand-logo.png",
    outFile: "fallowfpv-brand-logo.webp",
    resize: { width: 420 },
  },
  { inFile: "fallow-logo-180.png", outFile: "fallow-logo-180.webp" },
  { inFile: "a2cofc-badge.png", outFile: "a2cofc-badge.webp" },
];

for (const job of jobs) {
  const input = resolve(publicDir, job.inFile);
  const output = resolve(publicDir, job.outFile);
  let pipeline = sharp(input);
  if (job.resize) {
    pipeline = pipeline.resize({
      width: job.resize.width,
      withoutEnlargement: true,
    });
  }
  await pipeline.webp({ quality: 84, effort: 6 }).toFile(output);
  console.log("Wrote", job.outFile);
}
