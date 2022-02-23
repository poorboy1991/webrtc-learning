const webpack =  require('webpack')
const {merge} = require('webpack-merge')
const ip = require('ip');
const baseConfig = require('./webpack.base.config')
const PORT = '8000'
const PUBLIC_PATH = "/"; // 基础路径

module.exports = merge(baseConfig, {
    mode: 'development',
    entry: [
        './src/index.js' // 入口文件
    ],
    output: {
        path: __dirname + "/", // 将打包好的文件放在此路径下，dev模式中，只会在内存中存在，不会真正的打包到此路径
        publicPath: PUBLIC_PATH, // 文件解析路径，index.html中引用的路径会被设置为相对于此路径
        filename: "bundle-[contenthash].js", // 编译后的文件名字
    },
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

        new webpack.HotModuleReplacementPlugin(), // 热更新插件

    ]

})