import React, { Component, ReactElement } from 'react';
import StepModal from '@src/components/StepModal/StepModal';
import steps from '@src/components/StepModal/steps/huawei/backuppc';
import UsbModal from '@src/components/TipsModal/UsbModal/UsbModal';
import ApkInstallModal from '@src/components/TipsModal/ApkInstallModal/ApkInstallModal';
import PromptModal from '@src/components/TipsModal/PromptModal/PromptModal';
import DegradeFailModal from '@src/components/TipsModal/DegradeFailModal/DegradeFailModal';
import DegradeModal from '@src/components/TipsModal/DegradeModal/DegradeModal';
import AppleModal from '@src/components/TipsModal/AppleModal/AppleModal';

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
            <UsbModal visible={this.state.visible} />
        </div>
    }
}
export default Version;