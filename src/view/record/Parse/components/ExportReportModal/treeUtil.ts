import fs from 'fs';
import { helper } from '@src/utils/helper';
import { ZTreeNode } from './componentTypes';

/**
 * 将第n层之前的结点展开
 * @param context 树对象
 * @param nodes 树结点数据
 * @param level 展开层级
 */
function expandNodes(context: any, nodes: any[], level: number) {
    if (nodes === undefined || nodes.length === 0) {
        return;
    }
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].level < level) {
            context.expandNode(nodes[i], true);
        }
        expandNodes(context, nodes[i].children, level);
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
 *
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
                children: mapTree(data[i].children!)
            });
        }
    } else {
        treeData = [];
    }
    return treeData.length === 0 ? undefined : treeData;
};

/**
 * 批接分页数据文件的页号
 * @param filePath 文件名 如/100/fa47f6793e7a82fa047ad38df327a494-1
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
 */
const filterTree = (data?: ZTreeNode[]): [ZTreeNode[] | undefined, string[]] => {
    let next: ZTreeNode[] = [];
    let jsonFiles: string[] = [];
    if (helper.isNullOrUndefined(data) || data?.length === 0) {
        return [undefined, jsonFiles];
    } else {
        for (let i = 0; i < data!.length; i++) {
            if (data![i].checked) {
                let [children, files] = filterTree(data![i].children);
                next.push({
                    name: data![i].name,
                    path: data![i].path,
                    icon: data![i]._icon,
                    type: data![i].type,
                    page: data![i].page,
                    children: children
                });
                jsonFiles.push(...getFileByPage(data![i].path, data![i].page), ...files);
            }
        }
        return [next, jsonFiles];
    }
};

export { expandNodes, readTxtFile, mapTree, getFileByPage, filterTree };