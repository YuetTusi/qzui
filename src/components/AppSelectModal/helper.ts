import { ITreeNode } from "@src/type/ztree";
import { App } from '@src/components/AppSelectModal/componentType';
import { Prop } from './componentType';

/**
 * 将app.yaml数据转为zTree格式
 * @param arg0 属性
 */
function toTreeData({ treeData, selectedKeys }: Prop) {

    let rootNode: ITreeNode = {
        name: 'App',
        open: true
    };
    let nodes: ITreeNode[] = [];

    if (treeData && treeData.length > 0) {
        for (let i = 0, l = treeData.length; i < l; i++) {
            const childNodes = toAppTreeNode(treeData[i].app_list, selectedKeys);
            nodes.push({
                children: childNodes,
                iconSkin: `type_${treeData[i].name}`,
                name: treeData[i].desc,
                checked: childNodes.every(i => i.checked),
                open: true
            })
        }
        rootNode.children = nodes;
        rootNode.checked = nodes.every(i => i.checked);
        rootNode.iconSkin = 'app_root';
        return rootNode;
    } else {
        return [];
    }
}

/**
 * 将app.yaml应用数据转为zTree结点
 * @param data App
 */
function toAppTreeNode(data: App[], selectedKeys: string[] = []) {

    let nodes: ITreeNode[] = [];

    if (data && data.length > 0) {
        nodes = data.map((item) => ({
            name: item.desc,
            packages: item.packages,
            id: item.app_id,
            iconSkin: `app_${item.app_id}`,
            checked: selectedKeys.find(i => i == item.app_id) !== undefined
        }));
    }
    return nodes;
}

export { toTreeData };