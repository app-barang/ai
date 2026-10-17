import sharp from "sharp";

async function main() {
  const src = "app/icon.svg";
  await sharp(src, { density: 300 }).resize(192, 192).png().toFile("public/icon-192.png");
  await sharp(src, { density: 300 }).resize(512, 512).png().toFile("public/icon-512.png");
  await sharp(src, { density: 300 }).resize(180, 180).png().toFile("public/apple-touch-icon.png");
  console.log("PWA icons generated: 192, 512, 180");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
