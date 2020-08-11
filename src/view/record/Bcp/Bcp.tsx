import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { IpcRendererEvent, ipcRenderer, remote, OpenDialogReturnValue } from 'electron';
import React, { useRef, useState } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import Title from '@src/components/title/Title';
import Loading from '@src/components/loading/Loading';
import { useMount, useSubscribe } from '@src/hooks';
import localStore, { LocalStoreKey } from '@src/utils/localStore';
import { helper } from '@src/utils/helper';
import { BcpEntity } from '@src/schema/socket/BcpEntity';
import { Prop, FormValue } from './componentType';
import { UnitRecord } from './componentType';
import CaseDesc from './CaseDesc';
import GeneratorForm from './GeneratorForm';
import './Bcp.less';

/**
 * 生成BCP
 */
const Bcp = Form.create<Prop>({ name: 'bcpForm' })((props: Prop) => {


    let deviceId = useRef<string>('');//当前设备id
    let unitName = useRef<string>('');//采集单位名称
    let dstUnitName = useRef<string>('');//目的检验单位名称
    let officerName = useRef<string>('');//采集人员
    let currentUnitName = useRef<string | null>(null); //当前采集单位名称（用户设置）
    let currentUnitNo = useRef<string | null>(null);//当前采集单位编号（用户设置）
    let currentDstUnitName = useRef<string | null>(null);//当前目的检验单位名称（用户设置）
    let currentDstUnitNo = useRef<string | null>(null);//当前目的检验单位编号（用户设置）
    let bcpFormRef = useRef<any>(null); //表单ref

    const [unitData, setUnitData] = useState<UnitRecord[]>([]);    //采集单位 
    const [dstUnitData, setDstUnitData] = useState<UnitRecord[]>([]);//目的检验单位
    const [disableExport, setDisableExport] = useState<boolean>(false); //禁用导出

    const queryUnitHandle = (event: IpcRendererEvent, result: Record<string, any>) => {
        const { data } = result;
        if (data.rows && data.rows.length > 0) {
            setUnitData(data.rows);
            setDstUnitData(data.rows);
        }
    };
    /**
     * 获取当前设备数据
     * @param id 设备id
     */
    const getDevice = (id: string) => {
        const { caseData } = props.bcp;
        if (helper.isNullOrUndefined(caseData)) {
            return null;
        } else {
            let device = caseData.devices.find(i => i.id === id);
            if (device === undefined) {
                return null;
            } else {
                return device;
            }
        }
    };

    useSubscribe('query-db-result', queryUnitHandle);

    useMount(() => {
        const { dispatch } = props;
        const { cid, did } = props.match.params;
        deviceId.current = did;
        dispatch({ type: 'bcp/queryCaseById', payload: cid });
        dispatch({ type: 'bcp/queryOfficerList' });
    });

    useMount(() => {
        currentUnitNo.current = localStore.get(LocalStoreKey.UnitCode);
        currentUnitName.current = localStore.get(LocalStoreKey.UnitName);
        currentDstUnitNo.current = localStore.get(LocalStoreKey.DstUnitCode);
        currentDstUnitName.current = localStore.get(LocalStoreKey.DstUnitName);

        if (helper.isNullOrUndefinedOrEmptyString(currentUnitNo.current)) {
            Modal.info({
                title: '提示',
                content: <div><div>尚未设置「采集单位」信息</div><div>可在「设置 ➜ 采集单位」中进行配置</div></div>,
                okText: '确定'
            });
        } else if (helper.isNullOrUndefinedOrEmptyString(currentDstUnitNo.current)) {
            Modal.info({
                title: '提示',
                content: <div><div>尚未设置「目的检验单位」信息</div><div></div>可在「设置 ➜ 目的检验单位」中进行配置</div>,
                okText: '确定'
            });
        }
    });

    useMount(() => {
        let device = getDevice(deviceId.current);
        if (device === null) {
            setDisableExport(true);
        } else {
            try {
                const bcpPath = path.join(device?.phonePath!);
                fs.accessSync(bcpPath);
                let dirs: string[] = fs.readdirSync(bcpPath);
                setDisableExport(!dirs.includes('BCP'));
            } catch (error) {
                setDisableExport(true);
            }
        }
    });

    /**
     * 按关键字查询单位
     * @param {string} keyword 关键字
     */
    const queryUnitByKeyword = throttle((keyword: string) => {
        ipcRenderer.send('query-db', keyword, 1);
    }, 500);

    /**
     * 绑定采集人员Options
     */
    const bindOfficerList = () => {
        const { officerList } = props.bcp;
        const { Option } = Select;
        return officerList.map(i => <Option
            data-name={i.name}
            value={i.no}
            key={helper.getKey()}>
            {`${i.name}（${i.no}）`}
        </Option>);
    };

    /**
     * 绑定采集单位Options
     */
    const bindUnitSelect = () => {
        const { Option } = Select;
        let list: JSX.Element[] = unitData.map(i => <Option
            data-name={i.PcsName}
            value={i.PcsCode}>
            {i.PcsName}
        </Option>);
        if (!helper.isNullOrUndefinedOrEmptyString(currentUnitNo.current)
            && unitData.find(i => i.PcsCode === currentUnitNo.current) === undefined) {
            list.push(<Option
                value={currentUnitNo.current!}
                key={helper.getKey()}>{currentUnitName.current}</Option>);
        }
        return list;
    };

    /**
     * 绑定目的检验单位Options
     */
    const bindDstUnitSelect = () => {
        const { Option } = Select;
        let list: JSX.Element[] = dstUnitData.map(i => <Option
            data-name={i.PcsName}
            value={i.PcsCode}>
            {i.PcsName}
        </Option>);
        if (!helper.isNullOrUndefinedOrEmptyString(currentDstUnitNo.current)
            && dstUnitData.find(i => i.PcsCode === currentDstUnitNo.current) === undefined) {
            list.push(<Option
                value={currentDstUnitNo.current!}
                key={helper.getKey()}>{currentDstUnitName.current}</Option>);
        }
        return list;
    };

    /**
     * 下拉Search事件(所有单位下拉共用此回调)
     */
    const selectSearch = (keyword: string) => {
        queryUnitByKeyword(keyword);
    }

    /**
     * 采集人员ChangeEvent
     * @param value 人员编号（6位警号）
     * @param options 下拉Element数据
     */
    const officerChange = (value: string, options: Record<string, any>) => {
        officerName.current = options.props['data-name'];
    };
    /**
     * 采集单位ChangeEvent
     * @param value 单位编号
     * @param options 下拉Element数据
     */
    const unitChange = (value: string, options: Record<string, any>) => {
        unitName.current = options.props['data-name'];
    };
    /**
     * 目的检验单位ChangeEvent
     * @param value 单位编号
     * @param options 下拉Element数据
     */
    const dstUnitChange = (value: string, options: Record<string, any>) => {
        dstUnitName.current = options.props['data-name'];
    };

    /**
     * 导出BCP_Click
     */
    const exportBcpClick = debounce(() => {
        let device = getDevice(deviceId.current);
        if (device === null) {
            message.error('读取设备数据失败');
        } else {
            const bcpPath = path.join(device?.phonePath!);
            let dirs: string[] = fs.readdirSync(bcpPath);
            remote.dialog.showOpenDialog({
                title: '导出BCP',
                properties: ['openFile'],
                defaultPath: dirs.includes('BCP') ? path.join(bcpPath, 'BCP') : bcpPath,
                filters: [{ name: 'BCP文件', extensions: ['zip'] }]
            }).then((value: OpenDialogReturnValue) => {
                if ((value.filePaths as string[]).length > 0) {
                    window.location.href = value.filePaths[0];
                }
            });
        }
    }, 600, { leading: true, trailing: false });

    /**
     * 生成Click
     */
    const bcpCreateClick = debounce(() => {
        const { validateFields } = bcpFormRef.current;
        const publishPath = remote.app.getAppPath();
        validateFields((errors: Error, values: FormValue) => {
            if (errors) {
                return;
            } else {
                const bcp = new BcpEntity();
                bcp.attachment = values.attachment;
                bcp.unitNo = values.unit;
                bcp.unitName = unitName.current ? unitName.current : currentUnitName.current!;
                bcp.dstUnitNo = values.dstUnit;
                bcp.dstUnitName = dstUnitName.current ? dstUnitName.current : currentDstUnitName.current!;
                bcp.officerNo = values.officer;
                bcp.officerName = officerName.current;
                bcp.mobileHolder = values.mobileHolder;
                bcp.credentialType = values.credentialType;
                bcp.credentialNo = values.credentialNo;
                bcp.credentialEffectiveDate = values.credentialEffectiveDate ? values.credentialEffectiveDate.format('YYYY-MM-DD') : undefined;
                bcp.credentialExpireDate = values.credentialExpireDate ? values.credentialExpireDate.format('YYYY-MM-DD') : undefined;
                bcp.credentialOrg = values.credentialOrg;
                bcp.credentialAvatar = values.credentialAvatar;
                bcp.gender = values.gender;
                bcp.nation = values.nation;
                bcp.birthday = values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined;
                bcp.address = values.address;
                bcp.securityCaseNo = values.securityCaseNo;
                bcp.securityCaseType = values.securityCaseType;
                bcp.securityCaseName = values.securityCaseName;
                bcp.handleCaseNo = values.handleCaseNo;
                bcp.handleCaseType = values.handleCaseType;
                bcp.handleCaseName = values.handleCaseName;
                bcp.handleOfficerNo = values.handleOfficerNo;
                //参数
                const params = [
                    bcp.attachment ? '1' : '0',
                    bcp.unitNo,
                    bcp.unitName,
                    bcp.dstUnitNo,
                    bcp.dstUnitName,
                    bcp.officerNo,
                    bcp.officerName,
                    bcp.mobileHolder,
                    bcp.credentialType,
                    bcp.credentialNo,
                    bcp.credentialEffectiveDate!,
                    bcp.credentialExpireDate!,
                    bcp.credentialOrg,
                    bcp.credentialAvatar,
                    bcp.gender,
                    bcp.nation,
                    bcp.birthday!,
                    bcp.address,
                    bcp.securityCaseNo,
                    bcp.securityCaseType,
                    bcp.securityCaseName,
                    bcp.handleCaseNo,
                    bcp.handleCaseType,
                    bcp.handleCaseName,
                    bcp.handleOfficerNo
                ];

                const bcpExe = path.join(publishPath!, '../../../tools/BcpTools/BcpGen.exe');
                console.log(bcpExe);
                console.log(params);
                message.loading('正在生成BCP...', 0);
                const process = execFile(bcpExe, params, {
                    windowsHide: true
                });
                //#当BCP进程退出了，表示生成任务结束
                process.once('close', () => {
                    console.log('close');
                    setTimeout(() => {
                        message.destroy();
                        message.info('生成完成');
                        setDisableExport(false);
                    }, 500);
                });
                process.once('error', () => {
                    console.log('error');
                    message.destroy();
                    message.error('生成失败');
                });
            }
        });
    }, 600, { leading: true, trailing: false });

    /**
     * 渲染表单
     */
    const renderForm = () => {

        const { caseData } = props.bcp;

        return <GeneratorForm
            ref={bcpFormRef}
            caseData={caseData}
            deviceData={getDevice(deviceId.current)!}
            officerList={bindOfficerList()}
            unitList={bindUnitSelect()}
            dstUnitList={bindDstUnitSelect()}
            currentUnitNo={currentUnitNo.current!}
            currentDstUnitNo={currentDstUnitNo.current!}
            selectSearchHandle={selectSearch}
            unitChangeHandle={unitChange}
            dstUnitChangeHandle={dstUnitChange}
            officerChangeHandle={officerChange} />
    };

    /**
     * 渲染案件相关数据
     */
    const renderCaseDesc = () => {
        const { caseData } = props.bcp;
        const device = getDevice(deviceId.current);
        return <CaseDesc caseData={caseData} deviceData={device} />;
    };

    return <div className="bcp-root">
        <Title
            onReturn={() => props.dispatch(routerRedux.push('/record'))}
            returnText="返回">
            生成BCP
        </Title>
        <div className="scroll-container">
            <div className="panel">
                <div className="sort-root">
                    <div className="sort thin">
                        <Button
                            onClick={() => bcpCreateClick()}
                            icon="file-sync"
                            type="primary">生成</Button>
                        <Button
                            onClick={() => exportBcpClick()}
                            disabled={disableExport}
                            icon="download"
                            type="primary">导出</Button>
                    </div>
                    {renderCaseDesc()}
                    {renderForm()}
                </div>
            </div>
        </div>
        <Loading show={props.bcp.loading ? 'true' : 'false'} />
    </div>;

});

export default connect((state: any) => ({ bcp: state.bcp }))(Bcp);