import { uglify } from 'rollup-plugin-uglify'

export default [
  {
    file: 'dist/umd/index.js',
    format: 'umd',
    target: 'es5',
    env: 'development'
  },
  {
    file: 'dist/umd/index.min.js',
    format: 'umd',
    target: 'es5',
    plugins: [
      uglify()
    ],
    env: 'production'
  },
  {
    file: 'dist/esm/index.js',
    format: 'esm',
    target: 'es2015'
  },
  {
    file: 'dist/cjs/index.js',
    format: 'cjs',
    target: 'es2015'
  },
  {
    file: 'dist/iife/index.js',
    format: 'iife',
    target: 'es2015',
    env: 'development'
  },
  {
    file: 'dist/iife/index.min.js',
    format: 'iife',
    target: 'es2015',
    plugins: [
      uglify()
    ],
    env: 'production'
  }
]
