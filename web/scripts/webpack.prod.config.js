const webpack = require('webpack');
const {merge} = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const copyPlugin = require("copy-webpack-plugin"); // 用于直接复制public中的文件到打包的最终文件夹中

const baseWebPackConf = require('./webpack.base.config')

let config = merge(baseWebPackConf, {
    mode: 'production',
    output: {
        publicPath: '/webrtc-learning/', // 公共路径
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:8].css',
            chunkFilename: 'chunk/[id].[contenthash:8].css',
        }),
        new webpack.ids.HashedModuleIdsPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:8].css',
            chunkFilename: 'chunk/[id].[contenthash:8].css',
        }),
        new HtmlWebpackPlugin({
            // 根据模板插入css/js等生成最终HTML
            filename: "index.html", //生成的html存放路径，相对于 output.path
            favicon: "./public/favicon.png", // 自动把根目录下的favicon.ico图片加入html
            template: "./public/index.html", //html模板路径
            inject: true, // 是否将js放在body的末尾
        }),
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
    ],
    // optimization: {
    //   splitChunks: {
    //     cacheGroups: {
    //       commons: {
    //         name: "commons",
    //         chunks: "initial",
    //         minChunks: 2
    //       }
    //     }
    //   }
    // }
    performance: {
      maxEntrypointSize: 400000,
      maxAssetSize: 800000,
    },
    optimization: {
      runtimeChunk: {
        name: 'manifest',
      },
      splitChunks: {
        chunks: 'all', // 默认只作用于异步模块，为`all`时对所有模块生效,`initial`对同步模块有效
        cacheGroups: {
          dll: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-dom-router|babel-polyfill|mobx|mobx-react|mobx-react-dom|antd|@ant-design)/,
            minChunks: 1,
            priority: 2,
            name: 'dll',
          },
          codeMirror: {
            test: /[\\/]node_modules[\\/](react-codemirror|codemirror)/,
            minChunks: 1,
            priority: 2,
            name: 'codemirror',
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            minChunks: 1,
            priority: 1,
            name: 'vendors',
          },
        },
      },
    },
  });
  
  if (process.env.npm_lifecycle_event === 'build:watch') {
    config = merge(config, {
      devtool: 'cheap-source-map',
    });
  }
  if (process.env.npm_lifecycle_event === 'build:report') {
    const BundleAnalyzerPlugin = WebpackBundleAnalyzer.BundleAnalyzerPlugin;
    config.plugins.push(new BundleAnalyzerPlugin());
  }
  
  module.exports = config;