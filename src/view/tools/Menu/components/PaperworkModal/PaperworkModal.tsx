import { mapValues, uniq } from 'lodash';
import { ipcRenderer } from 'electron';
import React, { FC, useEffect, useRef, useState, MouseEvent } from "react";
import { Button, Tree, Modal, message } from 'antd';
import { connect } from 'dva';
import { StateTree } from "@src/type/model";
import { helper } from "@src/utils/helper";
import { OneStepForm } from './StepForm/OneStepForm';
import { TwoStepForm } from './StepForm/TwoStepForm';
import { ThreeStepForm } from './StepForm/ThreeStepForm';
import { FourStepForm } from './StepForm/FourStepForm';
import { PaperworkModalProp } from "./prop";
import "./PaperworkModal.less";

const { TreeNode } = Tree;
let allData: Record<string, any> = {};

const PaperworkModal: FC<PaperworkModalProp> = ({
    visible, confirmLoading, dispatch, onCancel, onOk, paperworkModal
}) => {

    let tempPath = useRef<string>();
    let oneFormRef = useRef<any>(null); //表单ref
    let twoFormRef = useRef<any>(null); //表单ref
    let threeFormRef = useRef<any>(null); //表单ref
    let fourFormRef = useRef<any>(null); //表单ref
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
    const [step, setStep] = useState<number>(0);

    useEffect(() => {
        ((async () => {
            const p = await ipcRenderer.invoke('get-path', 'temp');
            tempPath.current = p;
        }))()
    }, []);

    useEffect(() => {
        if (visible) {
            dispatch({ type: 'paperworkModal/queryCaseTree' });
        }
    }, [visible]);

    const renderTreeNodes = (data: any[]) => {
        if (helper.isNullOrUndefined(data) || data.length === 0) {
            return null;
        }

        return data.map(item => <TreeNode
            key={item.key}
            title={item.title}
            checkable={item.checkable}
            selectable={item.selectable}
            isLeaf={item.isLeaf}
            disabled={item.disabled}
            caseName={item.caseName}
            caseId={item.caseId}
            _id={item._id}
            mobileHolder={item.mobileHolder}
            mobileName={item.mobileName}
            mobileNumber={item.mobileNumber}
            model={item.model}
            serial={item.serial}>
            {renderTreeNodes(item.children)!}
        </TreeNode>);
    };

    const nextClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        switch (step) {
            case 0:
                oneFormRef.current.validateFields((err: Error, values: any) => {
                    if (err) {
                        console.warn(err);
                    } else {
                        allData = mapValues(values, (value) => value === undefined ? '' : value);
                        setStep(prev => prev + 1);
                    }
                });
                break;
            case 1:
                twoFormRef.current.validateFields((err: Error, values: any) => {
                    if (err) {
                        console.warn(err);
                    } else {
                        allData = Object.assign(allData, mapValues(values, (value) => value === undefined ? '' : value));
                        setStep(prev => prev + 1);
                    }
                });
                break;
            case 2:
                threeFormRef.current.validateFields((err: Error, _: any) => {
                    if (err) {
                        console.warn(err);
                    } else {
                        allData.devices = paperworkModal
                            .threeFormValue
                            .map(item => mapValues(item, (value) => value === undefined ? '' : value));
                        setStep(prev => prev + 1);
                    }
                });
                break;
            case 3:
                fourFormRef.current.validateFields(async (err: Error, _: any) => {
                    if (err) {
                        console.warn(err);
                    } else {
                        allData = Object.assign(
                            allData, mapValues(
                                paperworkModal.fourFormValue, (value) => value === undefined ? '' : value
                            )
                        );
                    }
                    onOk(allData);
                });
                break;
        }
    };

    const prevClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setStep(prev => prev - 1);
    };

    const onCanceClick = () => {
        oneFormRef.current.resetFields();
        twoFormRef.current.resetFields();
        threeFormRef.current.resetFields();
        fourFormRef.current.resetFields();
        setCheckedKeys([]);
        setStep(0);
        dispatch({ type: 'paperworkModal/resetValue' });
        onCancel();
    };

    return <Modal
        footer={[
            <Button
                onClick={onCanceClick}
                icon="close-circle"
                key="PM_0">取消</Button>,
            <Button
                disabled={step <= 0}
                onClick={prevClick}
                icon="swap-left"
                type="primary"
                key="PM_1">上一步</Button>,
            <Button
                onClick={nextClick}
                icon={step >= 3 ? 'check' : 'swap-right'}
                disabled={confirmLoading}
                type="primary"
                key="PM_2">{step >= 3 ? '生成' : '下一步'}</Button>
        ]}
        visible={visible}
        onCancel={onCanceClick}
        title="生成鉴定报告"
        width={1120}
        maskClosable={false}
        destroyOnClose={true}
        className="paperwork-modal-root">
        <div className="papaerwork-box">
            <div className="tree-box">
                <Tree
                    onExpand={(keys: string[]) => {
                        dispatch({ type: 'paperworkModal/setExpandedKeys', payload: keys });
                    }}
                    onCheck={(checkedKeys: string[] | {
                        checked: string[];
                        halfChecked: string[];
                    }, event) => {
                        setCheckedKeys(checkedKeys as string[]);
                        const caseIds: string[] = uniq(event.checkedNodes?.map((i: any) => i.props.caseId));
                        if (caseIds.length === 0) {
                            dispatch({ type: 'paperworkModal/setSelectedCaseName', payload: '' });
                        } else if (caseIds.length > 1) {
                            message.destroy();
                            message.info('只可选择一个案件数据');
                        } else {
                            dispatch({ type: 'paperworkModal/queryCaseName', payload: caseIds[0] });
                        }
                        dispatch({
                            type: 'paperworkModal/setSelectedCaseCount',
                            payload: caseIds.length
                        });
                        const devices = event.checkedNodes?.filter((i: any) => i.props._id !== undefined) ?? [];

                        dispatch({ type: 'paperworkModal/setCheckedDevices', payload: devices.map(i => i.props) });
                        //将勾选的设备初始化到第3步表单中，以便在此基础上编辑

                        const defaultValues: any[] = devices!.map((i: any) => ({
                            _id: i.props._id,
                            mobileHolder: i.props.mobileHolder,
                            mobileNumber: i.props.mobileNumber,
                            model: i.props.model,
                            mobileName: helper.getNameWithoutTime(i.props.mobileName),
                            imei: '',
                            frontPath: '',
                            backPath: ''
                        }));
                        dispatch({ type: 'paperworkModal/setThreeFormValue', payload: defaultValues });
                    }}
                    checkedKeys={checkedKeys}
                    expandedKeys={paperworkModal.expandedKeys as string[]}
                    checkable={true}
                    showLine={true}
                    className="hide-file-icon">
                    {renderTreeNodes(paperworkModal.caseTree)}
                </Tree>
                <div style={{ display: step === 0 ? 'none' : 'flex' }} className="forbid">
                    {/* <Icon type="stop" /> */}
                </div>
            </div>
            <div className="step-box">
                <OneStepForm
                    ref={oneFormRef}
                    visible={step === 0}
                    selectedCaseName={paperworkModal.selectedCaseName}
                    checkedDevices={paperworkModal.checkedDevices} />
                <TwoStepForm
                    visible={step === 1}
                    ref={twoFormRef}
                    paperworkModal={paperworkModal}
                    dispatch={dispatch}
                />
                <ThreeStepForm
                    ref={threeFormRef}
                    visible={step === 2}
                    dispatch={dispatch}
                    paperworkModal={paperworkModal} />
                <FourStepForm
                    ref={fourFormRef}
                    visible={step === 3}
                    dispatch={dispatch}
                    paperworkModal={paperworkModal} />
            </div>
        </div>
    </Modal>
};

export default connect((state: StateTree) => ({
    paperworkModal: state.paperworkModal
}))(PaperworkModal);