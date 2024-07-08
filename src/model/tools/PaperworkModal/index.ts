import { Key } from 'react';
import { AntTreeNodeProps } from 'antd/lib/tree';
import { DeviceType } from '@src/schema/socket/DeviceType';
import { Model } from 'dva';
import effects from './effects';
import reducers from './reducers';

// import {
//     StepTwoFormValue,
//     StepThreeFormValue,
//     StepFourFormValue
// } from '@/view/default/tool/paperwork-modal/step-form/prop';

interface PaperworkModalState {
    /**
     * 案件树
     */
    caseTree: AntTreeNodeProps[],
    /**
     * 展开的Key
     */
    expandedKeys: Key[],
    /**
     * 选中的案件数量
     */
    selectedCaseCount: number,
    /**
     * 选中的案件名称
     */
    selectedCaseName: string,
    /**
     * 勾选的设备
     */
    checkedDevices: DeviceType[],
    /**
     * 第2步表单值
     */
    twoFormValue: any,
    /**
     * 第3步表单值
     */
    threeFormValue: any[],
    /**
     * 第4步表单值
     */
    fourFormValue: any,
    /**
     * 读取中
     */
    loading: boolean
}

const model: Model = {

    namespace: 'paperworkModal',
    state: {
        caseTree: [],
        expandedKeys: [],
        selectedCaseCount: 0,
        checkedDevices: [],
        twoFormValue: {},
        threeFormValue: [],
        fourFormValue: {},
        loading: false
    },
    effects,
    reducers
};

export { PaperworkModalState };
export default model;