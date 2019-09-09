import React, { Component, ReactElement } from 'react';
import StepModal from '@src/components/StepModal/StepModal';

const steps = [
    {
        title: '第一页',
        content: 'First-content',
    },
    {
        title: '第二页',
        content: <img src="https://www.baidu.com/img/superlogo_c4d7df0a003d3db9b65e9ef0fe6da1ec.png?where=super" />,
    },
    {
        title: '第三页',
        content: 'Last-content',
    },
];

interface IState {
    visible: boolean;
}

/**
 * @description 版本信息
 */
class Version extends Component<{}, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            visible: false
        }
    }
    render(): ReactElement {
        return <div>
            <div>
                <button type="button" onClick={() => {
                    this.setState({
                        visible: true
                    });
                }}>打开/显示</button>
            </div>
            <StepModal steps={steps} visible={this.state.visible}
                finishHandle={() => alert(1)}></StepModal>
        </div>
    }
}
export default Version;