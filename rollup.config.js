import babel from 'rollup-plugin-babel'
import configs from './build/configs'

const genConfig = (config) => {
  return {
    input: 'src/index.js',
    output: {
      name: 'Queuery',
      sourcemap: false,
      exports: 'named',
      ...config
    },
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
      ...(config.plugins || [])
    ]
  }
}

export default configs.map(genConfig)
