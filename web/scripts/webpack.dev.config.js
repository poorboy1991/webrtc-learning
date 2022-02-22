const webpack =  require('webpack')
const {merge} = require('webpack-merge')
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 生成html
const ip = require('ip');

const {resolve} = require('./utils')
const baseConfig = require('./webpack.base.config')
const PUBLIC_PATH = '/'
const PORT = '8000'

module.exports = merge(baseConfig, {
    mode: 'development',
    entry: [
        './src/index.js' // 入口文件
    ],
    devServer: {
        port: PORT,
        hotOnly: true,
        open: false,
        historyApiFallback: true,
        https: true,
        proxy: {  
            '/api': {  
                target: 'https://localhost:9500/',
                secure: false,
                pathRewrite: {
                    '^/api':''
                }
            }
        },
        host: '0.0.0.0'
    },
    output: {
        path: __dirname + '/',
        publicPath: PUBLIC_PATH,
        filename: 'bundle-[contenthash].js'
    },
    devtool: 'eval-source-map',
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.ENV": "dev",
            "process.env.HOST": ip.address.toString(),
        }),
        new HtmlWebpackPlugin({
            // 根据模板插入css/js等生成最终HTML
            filename: "index.html", //生成的html存放路径，相对于 output.path
            favicon: "./public/favicon.png", // 自动把根目录下的favicon.ico图片加入html
            template: "./public/index.html", //html模板路径
            inject: true, // 是否将js放在body的末尾
          }),
        new webpack.HotModuleReplacementPlugin(), // 热更新插件

    ]

})