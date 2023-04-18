import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: { bundle: "./src/server.ts" },
    bundle: true,
    platform: "node",
    packages: "external",
    format: "esm",
    outdir: "build",
    sourcemap: true,
    minify: process.env.NODE_ENV === "production",
  })
  .catch(() => process.exit(1));
