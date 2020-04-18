const {join, resolve} = require('path');

const root = join(resolve(__dirname), '..');
const nodeModulesDir = join(root, 'build', 'node_modules');

const ForkTsCheckerWebpackPlugin = require(join(nodeModulesDir, 'fork-ts-checker-webpack-plugin'));
const TsConfigPathsWebpackPlugin = require(join(nodeModulesDir, 'tsconfig-paths-webpack-plugin'));
const CopyPlugin = require(join(nodeModulesDir, 'copy-webpack-plugin'));
const HtmlWebpackPlugin = require(join(nodeModulesDir, 'html-webpack-plugin'));

function getBabelEnvTarget(target) {
  if (target === 'node') {
    return {node: 'current'};
  } else if (target === 'web-legacy') {
    return '> 0.25%, not dead';
  } else if (target === 'web-modern') {
    return {esmodules: true};
  } else if (target === 'chrome') {
    return 'chrome >= 78 or and_chr >= 78';
  }
  throw new Error(`Unknown target for babel: "${target}"`);
}

function getBabelLoader(target) {
  return {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
      presets: [
        [
          join(nodeModulesDir, '@babel/preset-env'),
          {
            targets: getBabelEnvTarget(target),
            bugfixes: true,
            useBuiltIns: 'usage',
            corejs: {version: 3},
          },
        ],
        [join(nodeModulesDir, '@babel/preset-react')],
        [join(nodeModulesDir, '@babel/preset-typescript')],
      ],
      plugins: [
        [
          join(nodeModulesDir, 'babel-plugin-styled-components'),
          {ssr: false, displayName: true, pure: true},
        ],
        [join(nodeModulesDir, '@babel/plugin-proposal-class-properties')],
        [join(nodeModulesDir, '@babel/plugin-proposal-object-rest-spread')],
      ],
    },
  };
}

function getWebpackConfig(directory, entryPoint, isFrontend) {
  // Safe to import here since we will have already run `npm install` from
  // within the script

  const tsConfig = join(directory, 'tsconfig.json');

  const forkTsCheckerWebpackPlugin = new ForkTsCheckerWebpackPlugin({
    tsconfig: tsConfig,
    eslint: true,
    eslintOptions: {
      fix: true,
      configFile: join(directory, '.eslintrc.js'),
      parserOptions: {
        project: tsConfig,
      },
    },
  });

  const htmlWebpackPlugin = new HtmlWebpackPlugin({
    inject: true,
    template: join(directory, 'src', 'index.html'),
    filename: join(directory, 'dist', 'index.html'),
    minify: {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  });

  const copyPlugin = new CopyPlugin([
    {from: join(directory, 'public'), to: join(directory, 'dist')},
  ]);

  return {
    mode: 'development',
    target: isFrontend ? 'web' : 'node',
    entry: {main: entryPoint},
    output: {
      path: join(directory, 'dist'),
    },
    devtool: 'source-map',

    module: {
      rules: isFrontend
        ? [getBabelLoader('web-legacy')]
        : [
            {
              test: /\.ts$/,
              loader: 'ts-loader',
              exclude: /node_modules/,
              options: {
                configFile: tsConfig,
                transpileOnly: true,
              },
            },
          ],
    },
    plugins: isFrontend
      ? [copyPlugin, forkTsCheckerWebpackPlugin, htmlWebpackPlugin]
      : [forkTsCheckerWebpackPlugin],
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      plugins: [
        new TsConfigPathsWebpackPlugin({
          configFile: tsConfig,
        }),
      ],
    },
    optimization: isFrontend
      ? {
          minimize: true,
          splitChunks: {chunks: 'all'},
        }
      : {
          minimize: true,
        },
    externals: isFrontend ? undefined : [
      function(context, request, callback) {
        if (request === entryPoint) {
          return callback();
        }
        if (['@src', '@shared'].includes(request.split('/', 2)[0])) {
          return callback();
        }
        callback(null, 'commonjs ' + request);
      },
    ],
    resolveLoader: {
      modules: [nodeModulesDir],
    },
    node: {
      __filename: false,
      __dirname: false,
    },
  };
}

module.exports = [
  getWebpackConfig(join(root, 'frontend'), join(root, 'frontend', 'src', 'index.tsx'), true),
  getWebpackConfig(join(root, 'server'), join(root, 'server', 'src', 'index.ts'), false),
];
