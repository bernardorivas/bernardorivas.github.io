import sharp from "sharp";

const source = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="92" fill="#173d63" />
    <text x="256" y="273" text-anchor="middle" dominant-baseline="middle" fill="#faf9f5" font-family="Arial, Helvetica, sans-serif" font-size="218" font-weight="700" letter-spacing="-15">BR</text>
  </svg>
`);

await sharp(source)
  .resize(64, 64, { kernel: sharp.kernel.lanczos3 })
  .png({ palette: true })
  .toFile("public/favicon.png");
