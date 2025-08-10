// scripts/build.mjs
import esbuild from 'esbuild';
import { safePlugin } from '../build/plugins/safeWrapper.js';

console.log('🚀 Building with safe plugin wrapper...');

try {
  // For now, we're using Vite so we don't have custom esbuild plugins
  // But this structure is ready for when we add them
  const plugins = [
    // safePlugin(myPluginA, 'myPluginA'),
    // safePlugin(myPluginB, 'myPluginB'),
  ];

  await esbuild.build({
    entryPoints: ['src/main.tsx'],
    outfile: 'dist/bundle.js',
    bundle: true,
    sourcemap: true,
    platform: 'browser',
    logLevel: 'debug',
    metafile: true,
    plugins,
  });
  
  console.log('✅ Build with safe plugins completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}