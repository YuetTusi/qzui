import fs from 'fs';
import path from 'path';
import moment from 'moment';
import DeviceType from "@src/schema/socket/DeviceType";
import { ITreeNode, IzTreeObj } from "@src/type/ztree";
import { helper } from '@src/utils/helper';
import { DataMode } from '@src/schema/DataMode';
import { ZTreeNode } from '../ExportReportModal/componentTypes';

/**
 * 返回zTree数据
 * @param caseName 案件名称
 * @param devices 设备数据
 */
const toTreeData = async (caseName: string, devices: DeviceType[]) => {
    let [onlyName] = (caseName ?? '').split('_');

    let deviceNodes = await mapDeviceToTree(devices);
    let rootNode: ITreeNode = {
        name: onlyName,
        open: true,
        children: deviceNodes
    };
    return rootNode;
};

/**
 * 返回设备下的报告node
 * @param devices 设备
 */
const mapDeviceToTree = async (devices: DeviceType[]) => {
    let nodes: ITreeNode[] = [];
    devices.sort((m, n) => n.createdAt!.getTime() - m.createdAt!.getTime());
    for (let i = 0; i < devices.length; i++) {
        const { id, phonePath, mobileName, mobileHolder, fetchTime, mode } = devices[i];
        const [onlyName] = mobileName!.split('_');
        const hasReport = await validReportExist(phonePath!);
        if (hasReport) {
            const children = await readTreeJson(path.join(phonePath!, './report/public/data/tree.json'));
            children[0].name = '<strong>分析报告</strong>';
            nodes = nodes.concat([
                {
                    name: `${onlyName}${mode === DataMode.ServerCloud ? '-云取' : ''}（${mobileHolder}）${moment(fetchTime).format('YYYY-MM-DD HH:mm:ss')}`,
                    deviceId: id,
                    phonePath,
                    mobileHolder,
                    mobileName,
                    children,
                    open: false
                }
            ]);
        }
    }
    return nodes;
};

/**
 * 验证路径下是否存在报告
 * @param phonePath 手机路径
 */
const validReportExist = (phonePath: string) => {
    const treeJson = path.join(phonePath, './report/public/data/tree.json');
    return helper.existFile(treeJson);
};

/**
 * 读取tree.json返回ZTree数据
 * @param src tree.json所在目录
 * @returns Promise<ITreeNode[]>
 */
const readTreeJson = (src: string) => {
    return new Promise<ITreeNode[]>((resolve, reject) => {
        fs.readFile(src, { encoding: 'utf8' }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    let startPos = data.indexOf('=') + 1;
                    let realJson = JSON.parse(data.substring(startPos));
                    resolve(realJson);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}

/**
 * 默认节点勾选
 * @param ztree ztree对象
 */
const setDefaultChecked = (ztree: IzTreeObj) => {

    let nodes = ztree.transformToArray(ztree.getNodes());
    nodes.forEach(n => {
        const { name } = n;
        if (name!.includes('数据分析') || name!.includes('图像识别') || name!.includes('微信残留关联')) {
            //note: 暂时默认不勾选`数据分析`，`图像识别`，`微信残留关联`3个结点
            ztree.checkNode(n, false, true);
        }
    });
}

/**
 * 拼接分页数据文件的页号
 * @param filePath 文件路径 如/100/fa47f6793e7a82fa047ad38df327a494-1
 * @param page 页数 (若此值为undefined无分页)
 */
const getFileByPage = (filePath: string, page?: number) => {

    if (filePath === undefined) {
        return [];
    }

    let pos = filePath.lastIndexOf('/');
    if (pos !== -1) {
        filePath = filePath.substring(pos + 1);
    }

    let files: string[] = [];
    const [md5] = filePath.split('-');
    if (page) {
        //有页数则循环拼接所有分页文件
        for (let i = 0; i < Number(page); i++) {
            files.push(`${md5}-${i + 1}.json`);
        }
    } else {
        //无分页则直接拼接.json后缀
        files.push(`${filePath}.json`);
    }
    return files;
};

/**
 * 过滤用户勾选的数据及JSON路径
 * @param data zTree数据
 * @returns 返回结构数组，需解构出数据：[勾选树结点,勾选JSON文件列表,勾选附件清单列表]
 */
const filterTree = (data?: ZTreeNode[]): [ZTreeNode[] | undefined, string[], string[]] => {
    let next: ZTreeNode[] = [];
    let jsonFiles: string[] = []; //数据文件
    let attachFiles: string[] = []; //附件清单
    if (helper.isNullOrUndefined(data) || data!.length === 0) {
        return [undefined, jsonFiles, attachFiles];
    } else {
        for (let i = 0; i < data!.length; i++) {
            if (data![i].checked) {
                let [children, files, attaches] = filterTree(data![i].children as ZTreeNode[]);
                next.push({
                    name: data![i].name,
                    path: data![i].path,
                    icon: data![i].icon,
                    type: data![i].type,
                    page: data![i].page,
                    attach: data![i].attach,
                    children: children
                });

                jsonFiles = jsonFiles
                    .concat(files)
                    .concat(getFileByPage(data![i].path, data![i].page));

                if (data![i].attach!) {
                    attachFiles = attachFiles
                        .concat(data![i].attach!)
                        .concat(attaches);
                } else {
                    attachFiles = attachFiles.concat(attaches);
                }
            }
        }
        return [next, jsonFiles, attachFiles];
    }
};


export { toTreeData, setDefaultChecked, readTreeJson, filterTree, getFileByPage };