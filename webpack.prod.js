const path = require('path');
const { IgnorePlugin, ProvidePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const themeUrl = path.resolve(__dirname, './src/styles/theme.less'); //Antd主题

let config = {
	mode: 'production',
	entry: './src/index.tsx',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './dist')
	},
	target: 'electron-renderer',
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.yaml', 'yml', '.json'],
		alias: {
			'@root': path.resolve(__dirname, './'),
			'@src': path.resolve(__dirname, './src'),
			'@utils': path.resolve(__dirname, './src/utils'),
			'@type': path.resolve(__dirname, './src/type')
		}
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserWebpackPlugin({
				terserOptions: {
					keep_fnames: false,
					parallel: true,
					cache: true
				}
			})
		]
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				use: [{ loader: 'ts-loader' }],
				exclude: [path.resolve(__dirname, './node_modules')],
				include: path.resolve(__dirname, './src')
			},
			{
				test: /\.css$/,
				use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
			},
			{
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
				test: /\.(png|jpg|jpeg|gif|ico)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: '/images',
							publicPath: './images'
						}
					}
				]
			},
			{
				test: /\.(woff|woff2|ttf|otf|eot|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: '/fonts',
							publicPath: './fonts'
						}
					}
				]
			},
			{
				test: /\.(yml|yaml)$/,
				type: 'json',
				use: [
					{
						loader: 'yaml-loader'
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './template/index.html'),
			filename: 'default.html', //NOTE:打包后Electron入口引用此文件
			hash: true,
			minify: true
		}),
		new IgnorePlugin(/^\.\/locale$/, /moment$/),
		new CleanWebpackPlugin({
			verbose: true
		}),
		new ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
	]
};

module.exports = config;
