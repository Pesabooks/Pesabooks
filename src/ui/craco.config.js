const webpack = require('webpack');

module.exports = {
  style: {},
  plugins: [],
  webpack: {
    resolve: {
      fallback: {
        buffer: require.resolve('buffer/'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
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
