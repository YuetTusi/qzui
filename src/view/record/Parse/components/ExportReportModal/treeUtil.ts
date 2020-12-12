import fs from 'fs';
import { helper } from '@src/utils/helper';
import { ITreeNode, IzTreeObj } from '@src/type/ztree';
import { ZTreeNode } from './componentTypes';

/**
 * 将第n层之前的结点展开
 * @param context 树对象
 * @param nodes 树结点数据
 * @param level 展开层级
 */
function expandNodes(context: IzTreeObj, nodes: ITreeNode[], level: number) {
    if (nodes === undefined || nodes.length === 0) {
        return;
    }
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].level! < level) {
            context.expandNode(nodes[i], true);
        }
        expandNodes(context, nodes[i].children!, level);
    }
}

/**
 * 读取文件数据
 * @param filePath 文件路径
 */
const readTxtFile = (filePath: string) => {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf8' }, (err, chunk) => {
            if (err) {
                reject(err);
            } else {
                resolve(chunk);
            }
        });
    });
};

/**
 * 修改树部分属性
 * @param data zTree数据
 */
const mapTree = (data?: ZTreeNode[]) => {
    let treeData: ZTreeNode[] = [];

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            treeData.push({
                name: data[i].name,
                _icon: data[i].icon,
                type: data[i].type,
                path: data[i].path,
                page: data[i].page,
                attach: data[i].attach,
                children: mapTree(data[i].children as ZTreeNode[])
            });
        }
    } else {
        treeData = [];
    }
    return treeData.length === 0 ? undefined : treeData;
};

/**
 * 拼接分页数据文件的页号
 * @param filePath 文件路径 如/100/fa47f6793e7a82fa047ad38df327a494-1
 * @param page 页数 (若此值为undefined无分页)
 */
const getFileByPage = (filePath: string, page?: number) => {
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
                    icon: data![i]._icon,
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

export { expandNodes, readTxtFile, mapTree, getFileByPage, filterTree };