const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("==> Building CyberShield frontend application...");
execSync("npm --prefix frontend run build", { stdio: "inherit" });

const src = path.join(__dirname, "frontend", ".next");
const dest = path.join(__dirname, ".next");

if (fs.existsSync(src)) {
  console.log("==> Copying build output to root .next for Vercel...");
  fs.cpSync(src, dest, { recursive: true });
}
console.log("==> CyberShield build successfully completed for Vercel.");
