const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const groupBy = require('lodash/groupBy');
const archiver = require('archiver');
const { mkdir, copy, copyFiles, readJSONFile, writeJSONfile } = require('./helper');

/**
 * 接收main.js导出消息
 */
ipcRenderer.on('report-export', async (event, exportCondition, treeParams) => {
	const { isZip } = exportCondition;

	try {
		if (isZip) {
			await compressReport(exportCondition, treeParams);
		} else {
			await copyReport(exportCondition, treeParams);
		}
		ipcRenderer.send('report-export-finish', true, exportCondition);
	} catch (error) {
		console.error(error);
		ipcRenderer.send('report-export-finish', false, exportCondition);
	}
});

/**
 * 拷贝报告
 * @param {string} exportCondition.reportRoot 报告源路径
 * @param {string} exportCondition.saveTarget 导出路径
 * @param {string} exportCondition.reportName 导出名称
 * @param {boolean} exportCondition.isAttach 是否带附件
 * @param {boolean} exportCondition.isZip 是否压缩
 * @param {string} treeParams.tree tree.json文件内容
 * @param {string[]} treeParams.files 数据文件列表
 * @param {string[]} treeParams.attaches 附件文件列表
 */
async function copyReport(exportCondition, treeParams) {
	const { reportRoot, saveTarget, reportName, isAttach } = exportCondition;
	const { tree, files, attaches } = treeParams;

	//拷贝静态资源等必需的文件
	await Promise.allSettled([
		copyFiles(
			[
				'assert/**/*',
				'fonts/**/*',
				'public/default/**/*',
				'public/icons/**/*',
				'index.html',
				'*.js'
			],
			path.join(saveTarget, reportName),
			{
				parents: true,
				cwd: reportRoot
			}
		)
	]);

	console.log('静态文件拷贝完成...');

	await mkdir(path.join(saveTarget, reportName, 'public/data'));

	for (let i = 0, l = files.length; i < l; i++) {
		const jsonName = path.basename(files[i]);

		await copy(
			path.join(reportRoot, 'public/data', files[i]),
			path.join(saveTarget, reportName, 'public/data', jsonName)
		);
	}

	console.log('JSON数据拷贝完成...');

	await writeJSONfile(
		path.join(saveTarget, reportName, 'public/data/tree.json'),
		`;var data=${JSON.stringify(tree)}`
	);

	console.log('tree.json已写入...');

	if (isAttach) {
		await copyAttach(reportRoot, saveTarget, reportName, attaches);
	}
}

/**
 * 压缩报告
 * @param {string} exportCondition.reportRoot 报告源路径
 * @param {string} exportCondition.saveTarget 导出路径
 * @param {string} exportCondition.reportName 导出名称
 * @param {boolean} exportCondition.isAttach 是否带附件
 * @param {boolean} exportCondition.isZip 是否压缩
 * @param {string} treeParams.tree tree.json文件内容
 * @param {string[]} treeParams.files 数据文件列表
 * @param {string[]} treeParams.attaches 附件文件列表
 */
function compressReport(exportCondition, treeParams) {
	const { reportRoot, saveTarget, reportName, isAttach } = exportCondition;
	const { tree, files, attaches } = treeParams;

	const archive = archiver('zip', {
		zlib: { level: 7 } //压缩级别
	});
	const ws = fs.createWriteStream(path.join(saveTarget, `${reportName}.zip`));

	return new Promise((resolve, reject) => {
		archive.once('error', (err) => {
			console.log(err);
			reject(err);
		});
		archive.once('finish', () => resolve(void 0));
		archive.pipe(ws);
		//报告所需基本文件
		archive.glob(
			'{assert/**/*,fonts/**/*,public/default/**/*,public/icons/**/*,index.html,*.js}',
			{
				cwd: reportRoot
			}
		);
		//用户所选数据JSON
		files.forEach((f) =>
			archive.file(path.join(reportRoot, 'public/data', f), { name: `public/data/${f}` })
		);
		//筛选子树JSON
		archive.append(Buffer.from(`;var data=${JSON.stringify(tree)}`), {
			name: 'public/data/tree.json'
		});
		if (isAttach) {
			//todo: 在此处理拷贝附件
			getAttachZipPath(reportRoot, attaches)
				.then((zipPaths) => {
					//附件
					zipPaths.forEach((i) =>
						archive.file(i.from, { name: path.join(i.to, i.rename) })
					);
					//开始压缩
					archive.finalize();
				})
				.catch((err) => {
					archive.abort();
					reject(err);
				});
		} else {
			//开始压缩
			archive.finalize();
		}
	});
}

/**
 * 拷贝附件
 * @param {string} source 报告源路径
 * @param {string} distination 目标路径
 * @param {string} folderName 导出文件夹名称
 * @param {string[]} attachFiles 附件JSON文件
 */
async function copyAttach(source, distination, folderName, attachFiles) {
	let copyPath = [];
	try {
		copyPath = await Promise.all(
			attachFiles.map((f) => readJSONFile(path.join(source, 'public/data', f)))
		);
		const copyList = copyPath.flat();
		const grp = groupBy(copyList, 'to'); //分组

		//创建附件目录
		await Promise.allSettled(
			Object.keys(grp).map((dir) => {
				console.log(path.join(distination, folderName, dir));
				return mkdir(path.join(distination, folderName, dir));
			})
		);
		console.log('创建附件目录完成...');

		console.log(`开始拷贝附件，共：${copyList.length}`);

		for (let i = 0, l = copyList.length; i < l; i++) {
			const { from, to, rename } = copyList[i];
			await copy(from, path.join(distination, folderName, to, rename));
		}
		console.log('导出结束..');
	} catch (error) {
		throw error;
	}
}

/**
 * 根据附件清单返回整个附件压缩路径
 * @param {string} source 源路径
 * @param {string[]} attachFiles 附件清单JSON文件
 * @returns {CopyTo[]} 压缩附件路径Array
 */
async function getAttachZipPath(source, attachFiles) {
	let copyPath = [];
	try {
		copyPath = await Promise.all(
			attachFiles.map((f) => {
				return readJSONFile(path.join(source, 'public/data', f));
			})
		);
		return copyPath.flat();
	} catch (error) {
		console.log(
			`读取附件清单失败 @view/record/Parse/ExportReportModal/getAttachZipPath: ${error.message}`
		);
		return [];
	}
}
