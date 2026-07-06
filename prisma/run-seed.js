const path = require("path");
require("ts-node").register({
  compilerOptions: { module: "CommonJS", moduleResolution: "node", esModuleInterop: true },
  transpileOnly: true,
});
require(path.join(process.cwd(), "prisma/seed.ts"));

