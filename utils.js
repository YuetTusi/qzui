const path = require('path');
const fs = require('fs');
const appRoot = process.cwd();

const jsonPath =
	process.env['NODE_ENV'] === 'development'
		? path.join(appRoot, './data/manufaturer.json')
		: path.join(appRoot, './resources/data/manufaturer.json');

/**
 * 读取应用名称
 */
function readAppName() {
	try {
		const data = fs.readFileSync(jsonPath, { encoding: 'utf8' });
		const next = JSON.parse(data);
		return next.materials_name;
	} catch (error) {
		return undefined;
	}
}

module.exports = { readAppName };
