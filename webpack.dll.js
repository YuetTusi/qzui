const path = require("path");
const webpack = require("webpack");

let dll = {
    mode: "development",
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
        library: "__library_dll__" //暴露到全局的名字
    },
    module: {
        //babel-loader配置
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
            name: "__library_dll__", //要和全局变量名一至
            path: path.join(__dirname, "./dist", "manifest.json") //清单文件的名称
        })
    ]
};

module.exports = dll;