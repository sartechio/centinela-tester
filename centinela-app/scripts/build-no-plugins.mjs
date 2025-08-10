// scripts/build-no-plugins.mjs
import esbuild from 'esbuild';

console.log('🔧 Testing esbuild without plugins...');

try {
  await esbuild.build({
    entryPoints: ['src/main.tsx'],
    outfile: 'dist/bundle.js',
    bundle: true,
    sourcemap: true,
    platform: 'browser',
    logLevel: 'debug',
    metafile: true,
    plugins: [],
  });
  
  console.log('✅ Build without plugins completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}