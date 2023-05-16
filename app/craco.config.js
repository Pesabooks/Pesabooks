const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require(`path`);

module.exports = {
  style: {},
  plugins: [],
  webpack: {
    alias: {
      '@pesabooks/utils': path.resolve(__dirname, 'src/utils'),
      '@pesabooks/components': path.resolve(__dirname, 'src/components'),
      '@pesabooks/data': path.resolve(__dirname, 'src/data'),
      '@pesabooks/guards': path.resolve(__dirname, 'src/guards'),
      '@pesabooks/hooks': path.resolve(__dirname, 'src/hooks'),
      '@pesabooks/types': path.resolve(__dirname, 'src/types'),
      '@pesabooks/routes': path.resolve(__dirname, 'src/routes'),
      '@pesabooks/services': path.resolve(__dirname, 'src/services'),
    },
    plugins: [
      new NodePolyfillPlugin({
        excludeAliases: ['console'],
      }),
    ],
    configure: (webpackConfig) => {
      // ts-loader is required to reference external typescript projects/files (non-transpiled)
      // usefull for @pesabooks/contracts. todo: remove if move in separate repo
      webpackConfig.module.rules.push({
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.json',
        },
      });

      return webpackConfig;
    },
  },
};
