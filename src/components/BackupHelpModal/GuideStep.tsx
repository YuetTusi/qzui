import React, { FC, useState, MouseEvent } from 'react';
import Steps from 'antd/lib/steps';
import { helper } from '@src/utils/helper';

const { Step } = Steps;

interface Prop {
    /**
     * 步骤数据
     */
    data: any[];
}

/**
 * 图示组件
 * @param props 步骤图数据
 */
const GuideStep: FC<Prop> = props => {

    const [current, setCurrent] = useState<number>(0);

    /**
     * 渲染图示
     */
    const renderStep = () => {
        if (helper.isNullOrUndefined(props.data) || props.data.length === 0) {
            return '';
        } else {
            return props.data.map(item => {
                return <Step key={helper.getKey()} title={item.title} description={item.description} />;
            });
        }
    }

    const next = (e: MouseEvent<HTMLDivElement>) => {
        if (current !== props.data.length - 1) {
            setCurrent(prev => prev + 1);
        } else {
            setCurrent(0);
        }
    }

    /**
     * 步骤点击切换Change
     * @param current 当前步
     */
    const stepChange = (current: number) => {
        setCurrent(current);
    }

    return <>
        <div className="steps-panel">
            <Steps
                onChange={stepChange}
                current={current}
                progressDot={true}
                size={"small"}
                direction="vertical">
                {renderStep()}
            </Steps>
        </div>
        <div
            onClick={next}
            title="下一步"
            className="steps-content">
            {props.data[current].content}
        </div>
    </>
}

GuideStep.defaultProps = {
    data: []
}

export default GuideStep;