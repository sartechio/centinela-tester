// scripts/watch.mjs
import esbuild from 'esbuild';
import { safePlugin } from '../build/plugins/safeWrapper.js';

console.log('👀 Starting watch mode with safe plugin wrapper...');

try {
  const plugins = [
    // safePlugin(myPluginA, 'myPluginA'),
    // safePlugin(myPluginB, 'myPluginB'),
  ];

  const ctx = await esbuild.context({
    entryPoints: ['src/main.tsx'],
    outfile: 'dist/bundle.js',
    bundle: true,
    sourcemap: true,
    platform: 'browser',
    logLevel: 'info',
    metafile: true,
    plugins,
  });

  await ctx.watch();
  console.log('✅ Watch mode started successfully');
  
  // Keep the process alive
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping watch mode...');
    await ctx.dispose();
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Watch mode failed:', error);
  process.exit(1);
}