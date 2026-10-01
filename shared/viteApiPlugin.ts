import type { Plugin, ViteDevServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

/**
 * Vite Dev Plugin to execute serverless functions in api/ directory locally
 */
export function viteApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-serverless-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const pathname = urlObj.pathname; // e.g. /api/health or /api/payments/create

          // Map pathname to file in api/
          // 1. Check exact file: e.g. /api/health -> api/health.ts
          // 2. Check index file: e.g. /api/payments -> api/payments/index.ts
          let candidate = path.join(projectRoot, `${pathname}.ts`);
          if (!fs.existsSync(candidate)) {
            candidate = path.join(projectRoot, pathname, 'index.ts');
          }

          if (!fs.existsSync(candidate)) {
            return next();
          }

          // Read body for POST/PUT/PATCH/DELETE
          let body: unknown = undefined;
          let rawBody = '';
          if (req.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            rawBody = Buffer.concat(chunks).toString('utf-8');
            if (rawBody.trim()) {
              try {
                body = JSON.parse(rawBody);
              } catch {
                body = rawBody;
              }
            }
          }

          // Parse query
          const query: Record<string, string> = {};
          urlObj.searchParams.forEach((val, key) => {
            query[key] = val;
          });

          // Polyfill Vercel-like request helpers
          (req as any).body = body;
          (req as any).rawBody = rawBody;
          (req as any).query = query;

          // Polyfill Vercel-like response helpers
          if (!(res as any).status) {
            (res as any).status = function (statusCode: number) {
              res.statusCode = statusCode;
              return res;
            };
          }

          if (!(res as any).json) {
            (res as any).json = function (payload: unknown) {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(JSON.stringify(payload));
              return res;
            };
          }

          // Load & execute the handler using Vite SSR module runner
          const module = await server.ssrLoadModule(candidate);
          const handler = module.default;

          if (typeof handler === 'function') {
            await handler(req, res);
            return;
          }

          return next();
        } catch (err) {
          console.error('[API Dev Server Error]', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown backend API execution error',
              },
            }));
          }
        }
      });
    },
  };
}
