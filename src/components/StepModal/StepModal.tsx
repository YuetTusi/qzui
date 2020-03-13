import React, { Component } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Steps from 'antd/lib/steps';
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
    content: string | JSX.Element
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
    //取消回调
    cancelHandle?: () => void;
    //宽度，默认500
    width?: number;
}

interface IState {
    visible: boolean; //是否显示
    current: number; //当前步
    hasPrev: boolean; //是否有上一步
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
            hasPrev: false
        };
    }
    componentWillReceiveProps(nextProps: IProp) {
        this.setState({
            visible: nextProps.visible,
            hasPrev: this.state.current !== 0
        });
    }
    /**
     * ?渲染优化，开发时注释掉
     */
    shouldComponentUpdate(nextProp: IProp) {
        if (nextProp.visible) {
            return true;
        } else if (nextProp.visible !== this.state.visible) {
            return true;
        } else {
            return false;
        }
    }
    cancelClick = () => {
        this.setState({
            visible: false,
            current: 0,
        });
        if (this.props.cancelHandle) {
            this.props.cancelHandle();
        }
    }
    /**
     * 下一步
     */
    next = () => {
        const { steps, finishHandle } = this.props;
        const current = this.state.current + 1;
        const _this = this;
        if (current < steps.length) {
            const current = this.state.current + 1;
            this.setState({
                current,
                hasPrev: current !== 0
            });
        } else {
            Modal.confirm({
                title: '请确认',
                content: '采集手机是否已按步骤操作完成？',
                okText: '是',
                cancelText: '否',
                onOk() {
                    if (finishHandle) {
                        finishHandle();
                    }
                    _this.setState({
                        visible: false,
                        current: 0,
                    });
                }
            });
        }
    }
    /**
     * 上一步
     */
    prev = () => {
        const current = this.state.current - 1;
        this.setState({
            current,
            hasPrev: current !== 0
        });
    }
    renderFinishButton = (): JSX.Element => {
        const { current } = this.state;
        const { length } = this.props.steps;
        if (current === length - 1) {
            return <Button
                key="next"
                type="primary"
                icon="check"
                onClick={this.next}>
                完成
            </Button>;
        } else {
            return <Button
                onClick={this.next}
                key="next"
                type="primary"
                icon="arrow-right">
                下一步
            </Button>;
        }
    }
    render(): JSX.Element {
        const { current } = this.state;
        const { steps } = this.props;
        return (
            <Modal
                visible={this.state.visible}
                width={this.props.width ? this.props.width : 500}
                onCancel={this.cancelClick}
                maskClosable={true}
                closable={true}
                footer={[
                    <Button
                        disabled={!this.state.hasPrev}
                        onClick={this.prev}
                        key="prev"
                        icon="arrow-left">
                        上一步
                    </Button>,
                    this.renderFinishButton()
                ]}>
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