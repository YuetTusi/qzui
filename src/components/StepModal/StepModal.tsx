import React, { FC, useState } from 'react';
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
    /**
     * 标题
     */
    title: string,
    /**
     * 步骤描述
     */
    description?: string,
    /**
     * 本页内容
     */
    content: string | JSX.Element
}

/**
 * 组件属性
 */
interface Prop {
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
    //标题
    title?: string;
}

const StepModal: FC<Prop> = (props) => {

    const [current, setCurrent] = useState<number>(0);
    const [hasPrev, setHasPrev] = useState<boolean>(false);

    /**
     * 上一步
     */
    const prev = () => {
        setCurrent(current - 1);
        setHasPrev(current - 1 !== 0);
    };

    /**
     * 下一步
     */
    const next = () => {
        const { steps, finishHandle } = props;
        if (current + 1 === steps.length) {
            Modal.confirm({
                title: '请确认',
                content: '是否已按步骤操作完成？',
                okText: '是',
                cancelText: '否',
                centered: true,
                onOk() {
                    if (finishHandle) {
                        finishHandle();
                    }
                    setCurrent(0);
                    setHasPrev(false);
                }
            });
        } else {
            setCurrent(current + 1);
            setHasPrev(current + 1 !== 0);
        }
    }

    /**
     * 渲染完成按钮
     */
    const renderFinishButton = (): JSX.Element => {
        const { length } = props.steps;
        if (current === length - 1) {
            return <Button
                key="next"
                type="primary"
                icon="check"
                onClick={next}>
                完成
            </Button>;
        } else {
            return <Button
                onClick={next}
                key="next"
                type="primary"
                icon="arrow-right">
                下一步
            </Button>;
        }
    }

    /**
     * 步骤点击切换Change
     * @param current 当前步
     */
    const stepChange = (current: number) => {
        setCurrent(current);
    }

    const cancelClick = () => {
        setCurrent(0);
        setHasPrev(false);
        props.cancelHandle!();
    }

    return <Modal
        visible={props.visible}
        width={props.width}
        title={props.title}
        onCancel={cancelClick}
        maskClosable={true}
        closable={true}
        footer={[
            <Button
                disabled={!hasPrev}
                onClick={prev}
                key="prev"
                icon="arrow-left">
                上一步
                </Button>,
            renderFinishButton()
        ]}>
        <div className="steps-root">
            <div className="steps-panel">
                <Steps
                    current={current}
                    onChange={stepChange}
                    progressDot={true}
                    size={"small"}
                    direction="vertical">
                    {props.steps.length === 0 ? '' : props.steps.map((item: OneStepData) => (
                        <Step key={helper.getKey()} title={item.title} description={item.description} />
                    ))}
                </Steps>
            </div>
            <div className="steps-content">{props.steps.length === 0 ? '' : props.steps[current].content}</div>
        </div>
    </Modal>;
};

StepModal.defaultProps = {
    width: 500,
    visible: false,
    finishHandle: () => { },
    cancelHandle: () => { }
};

export default StepModal;