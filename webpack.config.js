const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 将 css 单独打包成文件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin') // 压缩 css

const PurifyCSS = require('purifycss-webpack')
const glob = require('glob-all')

module.exports = {
    entry: {
        app: './src/index.js'
    },
    output: {
        publicPath: './',
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bunble.js',
        chunkFilename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /nodes_modules/,
            use: {
                loader: 'babel-loader',
                options: { //如果有这个设置则不用再添加.babelrc文件进行配置
                    "babelrc": false, // 不采用.babelrc的配置
                    "plugins": [
                        "dynamic-import-webpack"
                    ]
                }
            }

        }, {
            test: /\.(scss|css)$/, // 针对 .css 后缀的文件设置 loader
            use: [{
                    loader: MiniCssExtractPlugin.loader
                },
                // 'style-loader',
                'css-loader',
                // 'sass-loader', // 使用 sass-loader 将 scss 转为 css
                // 'postcss-loader', //浏览器前缀
            ]
        }]
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                lodash: {
                    name: 'loadsh',
                    test: /[\\/]node_modules[\\/]lodash[\\/]/,
                    priority: 10
                },
                commons: {
                    name: 'commons',
                    minSize: 0, //表示在压缩前的最小模块大小,默认值是 30kb
                    minChunks: 2, // 最小公用次数
                    priority: 5, // 优先级
                    reuseExistingChunk: true // 公共模块必开启
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            // 打包输出HTML
            title: '自动生成 HTML',
            minify: {
                // 压缩 HTML 文件
                removeComments: true, // 移除 HTML 中的注释
                collapseWhitespace: true, // 删除空白符与换行符
                minifyCSS: true // 压缩内联 css
            },
            filename: 'index.html', // 生成后的文件名
            template: 'index.html', // 根据此模版生成 HTML 文件
            // chunks: ['app'] // entry中的 app 入口才会被打包
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'), //用于优化\最小化 CSS 的 CSS处理器，默认为 cssnano
            cssProcessorOptions: { safe: true, discardComments: { removeAll: true } }, //传递给 cssProcessor 的选项，默认为{}
            canPrint: true //布尔值，指示插件是否可以将消息打印到控制台，默认为 true
        }),
        new PurifyCSS({
            paths: glob.sync([
                // 要做 CSS Tree Shaking 的路径文件
                path.resolve(__dirname, './*.html'), // 请注意，我们同样需要对 html 文件进行 tree shaking
                path.resolve(__dirname, './src/*.js')
            ])
        })
    ]
}