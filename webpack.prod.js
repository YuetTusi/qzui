const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const themeUrl = path.resolve(__dirname, './src/theme.less'); //antd主题

let config = {
    mode: 'production',
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist')
    },
    target: 'electron-renderer',
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        alias: {
            "@root": path.resolve(__dirname, './'),
            "@src": path.resolve(__dirname, './src'),
            "@utils": path.resolve(__dirname, './src/utils'),
            "@type": path.resolve(__dirname, './src/type'),
        }
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
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            }, {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true,
                            modifyVars: {
                                hack: `true; @import "${themeUrl}";`
                            },
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|ico)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        outputPath: "/images"
                    }
                }]
            }, {
                test: /\.(woff|woff2|ttf|eot|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        outputPath: "/fonts"
                    }
                }]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './template/index.html'),
            filename: 'default.html',
            hash: true
        })
    ]
};


module.exports = config;