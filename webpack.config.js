const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelOptions = {

};

const nowEnv = process.env.NODE_ENV || 'delelopment';
const isProd = nowEnv === 'production';

let config = {
    mode: isProd ? 'production' : 'development',
    entry: './lib/index.ts',
    output: {
        filename: 'formBuffer.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'FormBuffer',
        libraryTarget: 'umd',
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: [".ts", ".js"]
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        disableHostCheck: true,
        port: 8080,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelOptions,
                    }
                ]
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
                    }
                ]
            }
        ]
    },
    plugins: isProd ? [
        new CleanWebpackPlugin(),
    ] : [
        new HtmlWebpackPlugin()
    ],
};

if (nowEnv === 'test') {
    config = Object.assign(config, {
        mode: 'development',
        target: 'node',
        devtool: 'inline-cheap-source-map',
        output: {
            devtoolModuleFilenameTemplate: '[absolute-resource-path]'
        }
    })
}

module.exports = config;