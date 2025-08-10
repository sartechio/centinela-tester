import type { Plugin, OnLoadArgs, OnResolveArgs } from 'esbuild';

const withTimeout = <T>(p: Promise<T>, ms: number, label: string) =>
  new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Plugin timeout: ${label} (${ms}ms)`)), ms);
    p.then(v => { clearTimeout(t); resolve(v); })
     .catch(e => { clearTimeout(t); reject(e); });
  });

export function safePlugin(plugin: Plugin, name: string, timeoutMs = 30000): Plugin {
  const wrapped: Plugin = {
    name: `safe:${name}`,
    setup(build) {
      const api = { ...build };
      
      // wrap onResolve
      const origOnResolve = build.onResolve.bind(build);
      api.onResolve = (opts, cb) => {
        return origOnResolve(opts, async (args: OnResolveArgs) => {
          try {
            console.debug(`[${name}] onResolve start:`, args.path);
            const res = await withTimeout(Promise.resolve(cb(args)), timeoutMs, `${name}:onResolve`);
            console.debug(`[${name}] onResolve done:`, args.path);
            return res ?? { errors: [{ text: `${name}:onResolve returned nothing` }] };
          } catch (e: any) {
            console.error(`[${name}] onResolve error:`, e?.message || e);
            return { errors: [{ text: `${name}:onResolve error: ${e?.message || e}` }] };
          }
        });
      };
      
      // wrap onLoad
      const origOnLoad = build.onLoad.bind(build);
      api.onLoad = (opts, cb) => {
        return origOnLoad(opts, async (args: OnLoadArgs) => {
          try {
            console.debug(`[${name}] onLoad start:`, args.path);
            const res = await withTimeout(Promise.resolve(cb(args)), timeoutMs, `${name}:onLoad`);
            console.debug(`[${name}] onLoad done:`, args.path);
            return res ?? { errors: [{ text: `${name}:onLoad returned nothing` }] };
          } catch (e: any) {
            console.error(`[${name}] onLoad error:`, e?.message || e);
            return { errors: [{ text: `${name}:onLoad error: ${e?.message || e}` }] };
          }
        });
      };
      
      // call original setup with wrapped API
      // @ts-expect-error – override build API intentionally
      plugin.setup(api);
    }
  };
  return wrapped;
}