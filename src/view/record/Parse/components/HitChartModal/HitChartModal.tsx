import { join } from 'path';
import { execFile } from 'child_process';
import { shell } from 'electron';
import React, { FC, useEffect, useRef } from 'react';
import { connect } from 'dva';
import * as echars from 'echarts/core';
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers';
import {
    TitleComponent,
    LegendComponent,
    TooltipComponent
} from 'echarts/components';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import { HitChartModalProp } from './prop';
import { StateTree } from '@src/type/model';
import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import { TableName } from '@src/schema/db/TableName';
import CCaseInfo, { CaseType } from '@src/schema/CCaseInfo';
import { ExportFile } from '../../componentType';

const cwd = process.cwd();

echars.use([
    TitleComponent,
    LegendComponent,
    TooltipComponent,
    PieChart,
    CanvasRenderer
]);


const openFileInBrowser = (target: string) => {
    shell.openPath(target);
};

/**
 * 命中数量饼图展示
 */
const HitChartModal: FC<HitChartModalProp> = ({
    hitChartModal,
    dispatch
}) => {

    const { visible, data, device } = hitChartModal;
    const currentCase = useRef<CCaseInfo>();

    useEffect(() => {

        const $target = document.getElementById('hit-pie');

        if ($target !== null && data.length > 0) {
            const charts = echars.init($target);
            charts.setOption({
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    type: 'scroll',
                    orient: 'vertical',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    formatter: (name: string) => {
                        const next = data.find((item) => item.name === name);
                        return `${name}(${next?.value ?? '0'})`;
                    }
                },
                series: [
                    {
                        name: '命中统计',
                        type: 'pie',
                        center: ['40%', '50%'],
                        data,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            });
        }

    }, [data]);

    useEffect(() => {
        if (device !== undefined) {
            (async () => {
                try {
                    const caseData = await ipcRenderer.invoke('db-find-one', TableName.Case, { _id: device.caseId });
                    currentCase.current = caseData;
                } catch (error) {
                    console.log(error);
                }
            })();
        }
        return () => currentCase.current = undefined;
    }, [device]);

    const renderChart = () => {
        if (data.length === 0) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无命中数据" />;
        } else {
            return <div id="hit-pie" style={{ width: 'auto', height: '460px' }}>
            </div>;
        }
    };

    const onDirSelect = async (exportFile: ExportFile) => {

        let exeDir = join(cwd, '../tools/create_excel_report');
        let exeName = '';

        if (currentCase.current === undefined) {
            message.destroy();
            message.warn('读取案件数据失败，无法导出报表');
            return;
        }

        const selectVal: OpenDialogReturnValue = await ipcRenderer.invoke('open-dialog', {
            title: '请选择目录',
            properties: ['openDirectory', 'createDirectory']
        });

        if (exportFile === ExportFile.Excel) {
            exeName = 'create_excel_report.exe';
        } else {
            exeName = 'create_pdf_report.exe';
        }

        if (selectVal.filePaths && selectVal.filePaths.length > 0) {
            const [saveTarget] = selectVal.filePaths; //用户所选目标目录
            const casePath = join(currentCase.current.m_strCasePath, currentCase.current.m_strCaseName);

            console.log(casePath);
            console.log(device?.phonePath);
            console.log(saveTarget);

            const handle = Modal.info({
                title: '导出',
                content: '正在导出报表，请稍等...',
                okText: '确定',
                centered: true,
                okButtonProps: { disabled: true, icon: 'loading' }
            });

            const proc = execFile(join(exeDir, exeName),
                [
                    casePath,
                    device!.phonePath!,
                    saveTarget,
                    currentCase.current!.caseType === CaseType.QuickCheck ? '1' : '2'
                ],
                {
                    cwd: exeDir,
                    windowsHide: true
                });
            proc.once('error', () => {
                handle.update({
                    title: '导出',
                    content: `报表导出失败`,
                    okText: '确定',
                    centered: true,
                    okButtonProps: { disabled: false, icon: 'check-circle' }
                });
            });
            proc.once('exit', () => {
                handle.update({
                    onOk() {
                        openFileInBrowser(saveTarget);
                    },
                    title: '导出',
                    content: `报表导出成功`,
                    okText: '确定',
                    centered: true,
                    okButtonProps: { disabled: false, icon: 'check-circle' }
                });
            });
            proc.once('close', () => {
                handle.update({
                    onOk() {
                        openFileInBrowser(saveTarget);
                    },
                    title: '导出',
                    content: `报表导出成功`,
                    okText: '确定',
                    centered: true,
                    okButtonProps: { disabled: false, icon: 'check-circle' }
                });
            });
        }
    };

    return <Modal
        footer={[
            <Button onClick={() => onDirSelect(ExportFile.Excel)}
                type="primary"
                icon="download"
                key="HCM_0">导出Excel报表</Button>,
            <Button onClick={() => onDirSelect(ExportFile.Pdf)}
                type="primary"
                icon="download"
                key="HCM_1">导出PDF报表</Button>,
            <Button onClick={() => {
                dispatch({ type: 'hitChartModal/setVisible', payload: false });
                dispatch({ type: 'hitChartModal/setData', payload: [] });
            }}
                icon="close-circle"
                key="HCM_2"
                type="default">取消</Button>
        ]}
        onCancel={() => {
            dispatch({ type: 'hitChartModal/setVisible', payload: false });
            dispatch({ type: 'hitChartModal/setData', payload: [] });
        }}
        visible={visible}
        width={880}
        centered={true}
        forceRender={true}
        destroyOnClose={true}
        maskClosable={false}
        title="命中统计">
        {renderChart()}
    </Modal>;
}

export default connect((state: StateTree) => ({ hitChartModal: state.hitChartModal }))(HitChartModal);