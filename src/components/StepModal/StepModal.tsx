import React, { Component, ReactElement } from 'react';
import { Divider, Modal, Steps, message } from 'antd';
import { helper } from '@src/utils/helper';
import './StepModal.less';

const { Step } = Steps;

/**
 * 一页的数据
 */
interface OneStepData {
    //步骤标题
    title: string,
    //描述
    description?: string,
    //内容
    content: any
}

/**
 * 组件属性
 */
interface IProp {
    //分步数据
    steps: Array<OneStepData>;
    //是否显示
    visible: boolean;
    //完成回调
    finishHandle?: () => void;
    //宽度，默认500
    width?: number;
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
            visible: nextProps.visible,
            hasPrev: this.state.current !== 0,
            nextButtonText: this.state.current === nextProps.steps.length - 1 ? '完成' : '下一步'
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
            if (finishHandle) {
                finishHandle();
            }
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
        const { steps } = this.props;
        return (
            <Modal visible={this.state.visible} cancelText={"上一步"} okText={this.state.nextButtonText}
                cancelButtonProps={{ disabled: !this.state.hasPrev }} width={this.props.width ? this.props.width : 500}
                onOk={this.next} onCancel={this.prev} maskClosable={false} closable={false}>
                <div className="steps-root">
                    <div className="steps-panel">
                        <Steps current={current} progressDot={true} size={"small"} direction="vertical">
                            {steps.length === 0 ? '' : steps.map((item: OneStepData) => (
                                <Step key={helper.getKey()} title={item.title} description={item.description} />
                            ))}
                        </Steps>
                    </div>
                    <div className="steps-content">{steps.length === 0 ? '' : this.props.steps[current].content}</div>
                </div>

            </Modal>
        );
    }
}
export default StepModal;