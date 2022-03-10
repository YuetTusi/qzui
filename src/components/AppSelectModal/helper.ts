import { App, AppCategory } from "@src/schema/AppConfig";
import { ITreeNode } from "@src/type/ztree";
import { CloudTips } from './componentType';

/**
 * 将yaml中JSON数据转为zTree格式
 * @param arg0 属性
 */
function toAppTreeData(treeData: AppCategory[], selectedKeys: string[], isMulti: boolean = true) {

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

function getNodeText(node: App) {
    const { app_id, desc, tips, ext } = node;
    let $em = '';
    if (ext === undefined || ext.length === 0) {
        return desc;
    }
    if (tips?.note && tips.note[0] !== '无') {
        $em = `<em class="note" title="${desc}">${tips.note.join(',')}</em>`;
    }
    return `<span title='${desc}'>${desc}</span>
        <a 
            title='${desc}参数设置'
            data-id='${app_id}' 
            data-desc='${desc}' 
            data-ext='${JSON.stringify(ext)}' 
            class='ext'
        >参数</a>${$em}`;
}

/**
 * 将yaml中JSON应用数据转为zTree结点
 * @param data App
 */
function toAppTreeNode(data: App[], selectedKeys: string[] = []) {

    let nodes: ITreeNode[] = [];

    if (data && data.length > 0) {
        nodes = data.map((item) => ({
            name: getNodeText(item),
            appName: item.name,
            appDesc: item.desc,
            packages: item.packages,
            appKey: item.key,
            id: item.app_id,
            tips: item.tips,
            ext: item.ext,
            iconSkin: `app_${item.app_id}`,
            checked: selectedKeys.find(i => i == item.app_id) !== undefined
        }));
    }
    return nodes;
}

/**
 * 返回应用说明DOM
 * @param tips 应用提示文案
 */
function tipsDom(tips: CloudTips) {

    let noteDom = '';
    let contentDom = '';

    if (tips && tips.note) {
        noteDom = '<dt>无痕情况：</dt>' + tips.note.reduce((total, current) => {
            total += `<dd>${current}</dd>`;
            return total;
        }, noteDom);
    }
    if (tips && tips.content) {
        contentDom = '<dt>获取内容：</dt>' + tips.content.reduce((total, current) => {
            total += `<dd>${current}</dd>`;
            return total;
        }, contentDom);
    }
    return [noteDom, contentDom];
}

/**
 * 树node悬停添加浮层DOM
 * @param treeId 节点id
 * @param treeNode 节点
 */
function addHoverDom(treeId: string, treeNode: ITreeNode) {
    let current = $("#" + treeNode.tId + "_a");
    let [noteDom, contentDom] = tipsDom(treeNode.tips);
    let { scrollTop = 0, scrollHeight = 1 } = $('.center-box')[0];
    let isAlignTop = scrollHeight - scrollTop > 540;
    let len = current.find('.tree-node-tip').length;
    if (len > 0 || noteDom === '' && contentDom === '') { return; }
    var appTip = `<div style="${isAlignTop ? 'top:-3px' : 'bottom:0'}" id="app_tip_${treeNode.tId}" class="tree-node-tip">
        <h6>${treeNode.appDesc}</h6>
        <dl>${noteDom}${contentDom}</dl>
    </div>`;
    current.append(appTip);
};

/**
 * 树node悬停移除浮层DOM
 * @param treeId 节点id
 * @param treeNode 节点
 */
function removeHoverDom(treeId: string, treeNode: ITreeNode) {
    $("#app_tip_" + treeNode.tId).remove('.tree-node-tip');
};

export { toAppTreeData, addHoverDom, removeHoverDom };