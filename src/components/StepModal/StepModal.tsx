import React, { Component, ReactElement } from 'react';
import { Button, Modal, Steps, message } from 'antd';
import { helper } from '@src/utils/helper';

const { Step } = Steps;

/**
 * 一页的数据
 */
interface OneStepData {
    //步骤标题
    title: string,
    //内容
    content: any
}

/**
 * 步骤数据
 */
interface IProp {
    steps: Array<OneStepData>;
    visible: boolean; //是否显示
    finishHandle: () => void; //完成回调
}

interface IState {
    visible: boolean; //是否显示
    current: number; //当前步
    hasPrev: boolean; //是否有上一步
    nextButtonText: string; //下一步按钮文本
}

/**
 * 步骤模态框
 */
class StepModal extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
        this.state = {
            visible: false,
            current: 0,
            hasPrev: false,
            nextButtonText: '下一步'
        };
    }
    componentWillReceiveProps(nextProps: IProp) {
        this.setState({
            visible: nextProps.visible
        });
    }
    /**
     * 下一步
     */
    next = () => {
        const { steps, finishHandle } = this.props;
        const current = this.state.current + 1;
        if (current < steps.length) {
            const current = this.state.current + 1;
            this.setState({
                current,
                hasPrev: current !== 0,
                nextButtonText: current === steps.length - 1 ? '完成' : '下一步'
            });
        } else {
            finishHandle();
            this.setState({
                visible: false,
                current: 0,
            });
        }
    }
    /**
     * 上一步
     */
    prev = () => {
        const { steps } = this.props;
        const current = this.state.current - 1;
        this.setState({
            current,
            hasPrev: current !== 0,
            nextButtonText: current === steps.length - 1 ? '完成' : '下一步'
        });
    }

    render() {

        const { current } = this.state;
        return (
            <Modal visible={this.state.visible} cancelText={"上一步"} okText={this.state.nextButtonText}
                cancelButtonProps={{ disabled: !this.state.hasPrev }}
                onOk={this.next} onCancel={this.prev} maskClosable={false} closable={false}>
                <Steps current={current}>
                    {this.props.steps.map(item => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>
            </Modal>
        );
    }
}
export default StepModal;