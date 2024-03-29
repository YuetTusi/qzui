const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const themeUrl = path.resolve(__dirname, './src/styles/theme.less'); //antd主题
const { DllReferencePlugin, ProvidePlugin } = webpack;

let config = {
	mode: 'development',
	entry: './src/index.tsx',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './dist')
	},
	target: 'electron-renderer',
	//启用SourceMap
	devtool: 'source-map',
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.yaml', 'yml', '.json'],
		alias: {
			'@root': path.resolve(__dirname, './'),
			'@src': path.resolve(__dirname, './src'),
			'@utils': path.resolve(__dirname, './src/utils'),
			'@type': path.resolve(__dirname, './src/type')
		}
	},
	devServer: {
		contentBase: path.resolve(__dirname, './dist'),
		port: 8081,
		compress: true,
		open: false,
		overlay: {
			errors: true
		}
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [{ loader: 'ts-loader' }],
				exclude: [path.resolve(__dirname, './node_modules')],
				include: path.resolve(__dirname, './src')
			},
			{
				test: /\.js$/,
				exclude: [path.resolve(__dirname, './node_modules')],
				use: [
					{
						loader: 'source-map-loader'
					}
				],
				enforce: 'pre'
			},
			{
				test: /\.css$/,
				use: [{ loader: MiniCssExtractPlugin.loader }, { loader: 'css-loader' }]
			},
			{
				test: /\.less$/,
				use: [
					{ loader: MiniCssExtractPlugin.loader },
					{ loader: 'css-loader' },
					{
						loader: 'less-loader',
						options: {
							javascriptEnabled: true,
							modifyVars: {
								hack: `true; @import "${themeUrl}";`
							}
						}
					},
					{
						loader: 'style-resources-loader',
						options: {
							patterns: ['./src/styles/variable.less']
						}
					}
				]
			},
			{
				test: /\.(png|jpe?g|gif|ico)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: '/images'
						}
					}
				]
			},
			{
				test: /\.(woff2?|ttf|otf|eot|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: '/fonts'
						}
					}
				]
			},
			{
				test: /\.ya?ml$/,
				type: 'json',
				use: [
					{
						loader: 'yaml-loader'
					}
				]
			}
		]
	},
	externals: {
		archiver: "require('archiver')"
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './template/dev.html'),
			filename: 'default.html',
			hash: true
		}),
		new MiniCssExtractPlugin({
			filename: 'styles/[name].css'
		}),
		new DllReferencePlugin({
			//指向打包生成的清单文件
			manifest: require('./dist/manifest.json')
		}),
		new ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
	]
};

module.exports = config;
