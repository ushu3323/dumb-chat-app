import express from "express";
import { createServer as createSocketServer } from "../lib/socket-io/server";
import fs from "fs/promises";
import path from "path";
import type { ViteDevServer } from "vite";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile("./dist/index.html", "utf-8")
  : "";

async function createServer() {
  const app = express();
  const io = createSocketServer();

  app.get("/api", (_req, res) => {
    res.send("Hello!");
  });

  let vite: ViteDevServer | undefined;
  if (isProduction) {
    const compression = (await import("compression")).default;
    const sirv = (await import("sirv")).default;
    app.use(compression());
    app.use(base, sirv("./dist/", { extensions: [] }));
  } else {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      base,
    });
    app.use(vite.middlewares);
  }

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl.replace(base, "");

      let template: string;
      if (isProduction) {
        template = templateHtml;
      } else {
        template = await fs.readFile(
          path.resolve(process.cwd(), "index.html"),
          "utf-8"
        );
        template = await vite!.transformIndexHtml(url, template);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      const error = e as Error;
      vite?.ssrFixStacktrace(error);
      res.status(500).end(error.stack);
    }
  });

  const server = app.listen(port, () =>
    console.log("Server is listening at port", port)
  );
  io.attach(server);
}

createServer();
