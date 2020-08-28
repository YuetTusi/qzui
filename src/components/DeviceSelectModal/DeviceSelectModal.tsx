import React, { FC, useRef, useState } from 'react';
import moment from 'moment';
import Select from 'antd/lib/select';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import './DeviceSelectModal.less';
import CCaseInfo from '@src/schema/CCaseInfo';
import Db from '@utils/db';
import { useMount } from '@src/hooks';
import { TableName } from '@src/schema/db/TableName';
import DeviceSelector from './DeviceSelector';
import DeviceType from '@src/schema/socket/DeviceType';

interface Prop {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 确定handle
     */
    okHandle: (pathList: string[]) => void;
    /**
     * 取消handle
     */
    cancelHandle: () => void;
};

const { Option } = Select;

/**
 * 设备选择框
 * @param props 
 */
const DeviceSelectModal: FC<Prop> = (props) => {


    const [caseData, setCaseData] = useState<CCaseInfo[]>([]);
    const [deviceData, setDeviceData] = useState<DeviceType[]>([]);
    const selectedPath = useRef<string[]>([]);

    useMount(async () => {
        const db = new Db<CCaseInfo>(TableName.Case);
        try {
            let data: CCaseInfo[] = await db.find(null);
            setCaseData(data);
        } catch (error) {
            message.error('案件数据查询失败');
        }
    });

    /**
     * 渲染Options
     */
    const renderOptions = (caseData: CCaseInfo[]) => {
        return caseData.map(i => {
            const [caseName] = i.m_strCaseName.split('_');
            return <Option
                value={i._id}
                key={i._id}>
                {`${caseName}（${moment(i.createdAt).format('YYYY-MM-DD HH:mm:ss')}）`}
            </Option>
        });
    };

    /**
     * 案件SelectChange事件
     */
    const caseChange = async (id: string) => {
        selectedPath.current = [];
        const db = new Db<DeviceType>(TableName.Device);
        try {
            let data: DeviceType[] = await db.find({ caseId: id });
            setDeviceData(data);
        } catch (error) {
            message.error('查询设备数据失败');
        }
    };

    return <Modal
        visible={props.visible}
        closable={false}
        width={800}
        onOk={() => props.okHandle(selectedPath.current)}
        onCancel={() => {
            selectedPath.current = [];
            setDeviceData([]);
            props.cancelHandle();
        }}
        destroyOnClose={true}
        okText="确定"
        cancelText="取消"
        className="device-select-modal-root">
        <div>
            <div>
                <Select
                    onChange={caseChange}
                    style={{ width: '100%' }}
                    placeholder="请选择案件">
                    {renderOptions(caseData)}
                </Select>
            </div>
            <hr />
            <div>
                <DeviceSelector
                    data={deviceData}
                    selectHandle={(pathList: string[]) => {
                        selectedPath.current = pathList;
                    }} />
            </div>
        </div>
    </Modal>;
};

DeviceSelectModal.defaultProps = {
    visible: false
};

export default DeviceSelectModal;
