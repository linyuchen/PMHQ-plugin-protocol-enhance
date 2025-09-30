import cp from 'vite-plugin-cp'
import path from 'node:path'
import type { ElectronViteConfig } from 'electron-vite'

const external: string[] = [
]

function genCpModule(module: string) {
  return { src: `./node_modules/${module}`, dest: `dist/node_modules/${module}`, flatten: false }
}

const config: ElectronViteConfig = {
  main: {
    build: {
      outDir: 'dist/',
      emptyOutDir: true,
      lib: {
        formats: ['cjs'],
        entry: {
          main: 'src/main.ts',
        },
      },
      rollupOptions: {
        external,
        input: 'src/main.ts',
      },
      minify: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      cp({
        targets: [
          ...external.map(genCpModule),
          { src: './README.md', dest: 'dist' },
          { src: './manifest.json', dest: 'dist' },
          { src: './src/electron-prompts/src/static/', dest: 'dist/static/prompt' },
          { src: './src/renderer.js', dest: 'dist' },
          { src: './src/preload.cjs', dest: 'dist' },
        ],
      }),
    ],
  },
  // preload: {
  //   // vite config options
  //   build: {
  //     outDir: 'dist/preload',
  //     emptyOutDir: true,
  //     lib: {
  //       formats: ['cjs'],
  //       entry: { preload: 'src/preload.ts' },
  //     },
  //     rollupOptions: {
  //       // external: externalAll,
  //       input: 'src/preload.ts',
  //     },
  //   },
  //   resolve: {},
  // },
  renderer: {
    // vite config options
    build: {
      outDir: 'dist/',
      emptyOutDir: false,
      lib: {
        formats: ['es'],
        entry: { renderer: 'src/renderer.js' },
      },
      rollupOptions: {
        // external: externalAll,
        input: 'src/renderer.js',
      },
    },
    resolve: {},
  },
}

export default config
