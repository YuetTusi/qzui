/*
  TODO：
    1. 关闭时，显示会有闪烁。
    2. ZIndex 还需要优化，当前目标应当为最上
*/

import React from "react";
import { Modal } from "antd";
import "./DragModal.less";

// 获得随机数
const genNonDuplicateID = (length: number) => {
    return Number(
        Math.random()
            .toString()
            .substr(3, length) + Date.now()
    ).toString(36);
};

class DragModal extends React.PureComponent<any> {
    id: any;
    initLeft: any; // 初始化位置调整
    dragDom: any; // 拖拽的目标元素
    dragging: any; // 是否拖拽的开关
    tLeft: any; // ---|
    tTop: any; //  ------> 坐标轴
    constructor(props: any) {
        super(props);

        this.id = genNonDuplicateID(10);
        this.initLeft = (window.innerWidth - (props.width || 520)) / 2; // 初始化位置调整
        this.dragDom = null; // 拖拽的目标元素
        this.dragging = false; // 是否拖拽的开关
        this.tLeft = 0; // ---|
        this.tTop = 0; //  ------> 坐标轴
    }

    componentDidMount() {
        this.getDragDom();
    }

    componentDidUpdate() {
        if (!this.dragDom) {
            this.getDragDom();
        }
    }

    /*
     * 初始渲染时，直接获取 Modal 的 dom 会获取不到。
     * 设置 ref 使用 findDOMNode 也获取不到。
     * 只能在定时器中使用原生方式来获取。
     * */
    getDragDom = () => {
        setTimeout(() => {
            // 获取唯一标示元素
            const dragDom: any = document.getElementsByClassName(`d_${this.id}`)[0];
            if (dragDom) {
                dragDom.style.left = `${this.initLeft}px`;
                dragDom.style.top = "100px";
                this.dragDom = dragDom;
            }
        });
    };

    onMouseDown = (e: any) => {
        e.preventDefault();
        this.dragging = true; // 激活拖拽状态
        /*
        ** 实现点击后，当前浮层在最上面
        ** 将当前所有涉及可拖拽的浮层的 zindex = 999
        ** 将当前拖拽目标的 zindex = 1000
        **/
        const nodeList = document.getElementsByClassName("drag_modal");
        if (nodeList.length > 0) {
            Array.from(nodeList).forEach((item: any) => (item.style.zIndex = 999));
            this.dragDom.style.zIndex = 1000;
        }

        /*
        * getBoundingClientRect: 返回一个 DomRect 对象
        *   包含该元素的 top、right、bottom、left 值，对应的是到屏幕上方和左边的距离，单位 px
        * */
        const dragDomRect = this.dragDom.getBoundingClientRect();
        /*
        * e.clientX、e.clientY
        *   获取鼠标的坐标位置
        * */
        this.tLeft = e.clientX - dragDomRect.left; // 鼠标按下时和选中元素的坐标偏移:x坐标
        this.tTop = e.clientY - dragDomRect.top; // 鼠标按下时和选中元素的坐标偏移:y坐标

        this.onMouseMove(this.dragDom);
    };

    onMouseUp = (e: any) => {
        e.preventDefault();
        this.dragging = false; // 停止移动状态
        document.onmousemove = null; // 停止鼠标移动事件
    };

    onMouseMove = (node: any) => {
        document.onmousemove = e => {
            e.preventDefault();
            if (this.dragging) {
                node.style.left = `${e.clientX - this.tLeft}px`;
                node.style.top = `${e.clientY - this.tTop}px`;
            }
        };
    };

    render() {
        const { children, title = "Drag-Modal", wrapClassName = "" } = this.props;

        return (
            <Modal
                {...this.props}
                mask={true}
                wrapClassName={`drag-modal-root d_${this.id} ${wrapClassName}`}
                title={
                    <div
                        className="drag_title"
                        onMouseDown={this.onMouseDown}
                        onMouseUp={this.onMouseUp}>
                        {title}
                    </div>
                }>
                {children}
            </Modal>
        );
    }
}

export default DragModal;
