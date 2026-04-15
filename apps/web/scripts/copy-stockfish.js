const fs = require("fs");
const path = require("path");

const stockfishPkg = path.dirname(require.resolve("stockfish/package.json"));
const src = path.join(stockfishPkg, "bin");
const dest = path.join(__dirname, "..", "public", "stockfish");

fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(
  path.join(src, "stockfish-18-single.js"),
  path.join(dest, "stockfish.js")
);
fs.copyFileSync(
  path.join(src, "stockfish-18-single.wasm"),
  path.join(dest, "stockfish.wasm")
);

console.log("✓ Stockfish files copied to public/stockfish/");
