const { build } = require('vite');

async function runBuild() {
  await build({
    configFile: 'vite.config.ts',
    build: {
      outDir: 'dist'
    }
  });
}

runBuild().catch(e => {
  console.error(e);
  process.exit(1);
});
