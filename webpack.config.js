const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const babelOptions = {};

const nowEnv = process.env.NODE_ENV || 'delelopment';
const isProd = nowEnv === 'production';
const isCoverage = process.env.NODE_ENV === 'coverage';
const isTest = isCoverage || process.env.NODE_ENV === 'test';

let config = {
    mode: isProd ? 'production' : 'development',
    entry: './lib/index.ts',
    output: {
        filename: 'formBuffer.umd.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'FormBuffer',
        libraryTarget: 'umd',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]',
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, './lib'),
        },
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        disableHostCheck: true,
        port: 8080,
    },
    module: {
        rules: [
            ...(isCoverage
                ? [
                      {
                          test: /\.ts$/,
                          include: path.resolve(__dirname, './lib/'),
                          exclude: /node_modules/,
                          enforce: 'post',
                          use: [
                              {
                                  loader: 'istanbul-instrumenter-loader',
                                  options: {
                                      esModules: true,
                                  },
                              },
                          ],
                      },
                  ]
                : []),
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelOptions,
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelOptions,
                    },
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
    plugins: isProd
        ? [
              // new BundleAnalyzerPlugin(),
              new CleanWebpackPlugin(),
          ]
        : [new HtmlWebpackPlugin()],
};

if (isTest) {
    config = Object.assign(config, {
        mode: 'development',
        target: 'node',
        devtool: 'inline-cheap-module-source-map',
    });
}

module.exports = config;
