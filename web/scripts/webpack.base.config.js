const webpackBar = require('webpackbar')
const copyPlugin = require('copy-webpack-plugin')
const HappyPack = require('happypack')
const antdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const speedMeasurePlugin = require('speed-measure-webpack-plugin')
const nodePolyFillPlugin = require('node-polyfill-webpack-plugin')
const webpack = require('webpack')
const {resolve} = require('./utils')


const include = resolve('src')

const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.less', '.css'],
        alias: {
            '@': resolve('src'),
            url: require.resolve('url/'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify'),
            zlib: require.resolve('browserify-zlib'),
            os: require.resolve('os-browserify/browser')
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: resolve('src'),
                exclude: /(node_modules|bower_components)/,
                use: ['happypack/loader'],
            },
            {
                test: /\.less$/,
                use: [
                  devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                  'css-loader',
                  'postcss-loader',
                  'less-loader',
                ],
            },
            {
                test: /\.css$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                ],
            },
            {
                // 文件解析
                test: /\.(eot|woff|otf|svg|ttf|woff2|appcache|mp3|mp4|pdf)(\?|$)/,
                include,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'assets/[name].[hash:4].[ext]'
                    }
                }]
            },
            {
                // 图片解析
                test: /\.(png|jpg|jpeg|gif)/,
                include,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: 'assets/[name].[hash:4].[ext]'
                    }
                }]
            }
        ]
    },
    plugins: [
        new webpackBar(),
        new speedMeasurePlugin(), // 测量构建速度
        new antdDayjsWebpackPlugin(), // dayjs 替换momentjs
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser'
        }),
        new HappyPack({
            loaders: ["babel-loader"],
        }),
        new nodePolyFillPlugin(),
        new copyPlugin({
            patterns: [
                {
                    from : './public/**/*',
                    to: './',
                    globOptions: {
                        ignore: ["**/favicon.png", "**/index.html"],
                      },
                    noErrorOnMissing: true,
                }
            ]
        })
    ]
}