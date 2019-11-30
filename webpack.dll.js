const path = require("path");
const webpack = require("webpack");

/**
 * 编译公共库的dll(仅在开发时使用)
 */
let dll = {
    mode: "production",
    entry: [
        'react',
        'react-dom',
        'typescript',
        'moment',
        'lodash',
        'axios',
        'uuid',
        'antd'],
    output: {
        filename: "library.dll.js",
        path: path.resolve(__dirname, "./dist"), //输出dll的目录
        libraryTarget: "var",
        library: "__library_dll__"
    },
    module: {
        //ts-loader配置
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [
                    { loader: 'ts-loader' }
                ],
                exclude: [path.resolve(__dirname, "./node_modules")],
                include: path.resolve(__dirname, './src')
            }
        ]
    },
    plugins: [
        new webpack.DllPlugin({
            name: "__library_dll__",
            path: path.join(__dirname, "./dist", "manifest.json")
        })
    ]
};

module.exports = dll;