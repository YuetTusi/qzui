import { App } from "@src/schema/AppConfig";
import { ITreeNode } from "@src/type/ztree";
import { Prop } from './componentType';

/**
 * 将yaml中JSON数据转为zTree格式
 * @param arg0 属性
 */
function toTreeData({ treeData, selectedKeys, isMulti }: Prop) {

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
                open: true,
                nocheck: !isMulti
            });
        }
        rootNode.children = nodes;
        rootNode.checked = nodes.every(i => i.checked);
        rootNode.iconSkin = 'app_root';
        rootNode.nocheck = !isMulti;
        return rootNode;
    } else {
        return [];
    }
}

/**
 * 将yaml中JSON应用数据转为zTree结点
 * @param data App
 */
function toAppTreeNode(data: App[], selectedKeys: string[] = []) {

    let nodes: ITreeNode[] = [];

    if (data && data.length > 0) {
        nodes = data.map((item) => ({
            name: item.desc,
            appName: item.name,
            appDesc: item.desc,
            packages: item.packages,
            appKey: item.key,
            id: item.app_id,
            tips: item.tips,
            iconSkin: `app_${item.app_id}`,
            checked: selectedKeys.find(i => i == item.app_id) !== undefined
        }));
    }
    return nodes;
}

function tipsDom(tips: string[]) {

    if (tips) {
        let dom = '';
        return tips.reduce((total, current) => {
            total += `<dd>${current}</dd>`;
            return total;
        }, dom);
    } else {
        return '';
    }
}

function addHoverDom(treeId: string, treeNode: ITreeNode) {
    let current = $("#" + treeNode.tId + "_a");
    let dom = tipsDom(treeNode.tips);
    let { scrollTop, scrollHeight } = $('.center-box')[0];
    let isAlignTop = scrollHeight - scrollTop > 540;
    let len = current.find('.tree-node-tip').length;
    if (len > 0 || dom === '') { return; }
    var appTip = `<div style="${isAlignTop ? 'top:0' : 'bottom:0'}" id="app_tip_${treeNode.tId}" class="tree-node-tip">
        <dl>
            <dt>${treeNode.name}云取说明：</dt>
            ${dom}
        </dl>
    </div>`;
    current.append(appTip);
};

function removeHoverDom(treeId: string, treeNode: ITreeNode) {
    $("#app_tip_" + treeNode.tId).remove('.tree-node-tip');
};

export { toTreeData, addHoverDom, removeHoverDom };