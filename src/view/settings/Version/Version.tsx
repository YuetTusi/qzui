import React, { Component, ReactElement } from 'react';
import StepModal from '@src/components/StepModal/StepModal';
import steps from '@src/components/StepModal/steps/huawei/backuppc';

interface IProp { }
interface IState {
    visible: boolean;
}


/**
 * @description 版本信息
 */
class Version extends Component<IProp, IState> {
    constructor(props: any) {
        super(props);
        this.state = { visible: false };
    }
    toggleClick = () => {
        this.setState({ visible: false });
    }
    render(): ReactElement {

        return <div>
            <button onClick={() => this.setState({ visible: !this.state.visible })}>OK</button>
            <StepModal visible={this.state.visible} steps={steps} width={1150}
                finishHandle={this.toggleClick} />
        </div>
    }
}
export default Version;