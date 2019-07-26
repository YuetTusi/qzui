const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let config = {
    mode: 'development',
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist')
    },
    target: 'electron-renderer',
    //启用SourceMap
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            "@root": path.resolve(__dirname, './'),
            "@src": path.resolve(__dirname, './src'),
            "@utils": path.resolve(__dirname, './src/utils'),
            "@type": path.resolve(__dirname, './src/type'),
        }
    },
    devServer: {
        contentBase: path.resolve(__dirname, './dist'),
        port: 8081,
        compress: true,
        open: false
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [
                    { loader: 'ts-loader' }
                ],
                exclude: [path.resolve(__dirname, "./node_modules")],
                include: path.resolve(__dirname, './src')
            }, {
                test: /\.js$/,
                exclude: [path.resolve(__dirname, "./node_modules")],
                use: [
                    {
                        loader: "source-map-loader"
                    }
                ],
                enforce: "pre"
            }, {
                test: /\.css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: 'css-loader' }
                ]
            }, {
                test: /\.less$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: 'css-loader' },
                    {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true
                        }
                    }
                ]
            }, {
                test: /\.(png|jpg|jpeg|gif|ico)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        outputPath: "/images",
                        limit: 10000
                    }
                }]
            }, {
                test: /\.(woff|woff2|ttf|eot|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        outputPath: "/fonts"
                    }
                }]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './template/index.html')
        }),
        new MiniCssExtractPlugin({
            filename: 'styles/[name].css'
        })
    ]
};


module.exports = config;