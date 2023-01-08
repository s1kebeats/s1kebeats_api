import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: { app: "./src/app.ts" },
    bundle: true,
    platform: "node",
    packages: "external",
    format: "esm",
    outdir: "./src/__tests__",
    sourcemap: true,
  })
  .catch(() => process.exit(1));
