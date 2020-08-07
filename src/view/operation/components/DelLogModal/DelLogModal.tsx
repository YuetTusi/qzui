import React, { FC, memo, useState, ReactElement } from 'react';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import { withModeButton } from '@src/components/enhance';
import { Prop, DelLogType } from './ComponentType';
import './DelLogModal.less';

const ModeButton = withModeButton()(Button);

/**
 * 清理日志弹框
 * @param props 
 */
const DelLogModal: FC<Prop> = (props) => {

    const [delTime, setDelTime] = useState<DelLogType>(DelLogType.TwoYearsAgo);
    const { Option } = Select;

    const selectChange = (value: DelLogType, option: ReactElement<any> | ReactElement<any>[]) => {
        setDelTime(value);
    };

    return <Modal
        visible={props.visible}
        title="日志清理"
        onCancel={props.cancelHandle}
        footer={[
            <ModeButton
                type="default"
                onClick={() => {
                    setDelTime(DelLogType.TwoYearsAgo);
                    props.cancelHandle!();
                }
                }>
                <Icon type="stop" />
                <span>取消</span>
            </ModeButton>,
            <ModeButton type="primary"
                onClick={() => {
                    Modal.confirm({
                        title: '确认清理',
                        content: '日志删除不可恢复，确认清理日志吗？',
                        iconType: 'info-circle',
                        okText: '是',
                        cancelText: '否',
                        onOk() {
                            props.okHandle!(delTime);
                        }
                    });

                }
                }>
                <Icon type="delete" />
                <span>清理</span>
            </ModeButton>
        ]}>
        <div className="del-log-modal-root">
            <label>清理时段：</label>
            <Select<DelLogType>
                value={delTime}
                onChange={selectChange}
                style={{ width: 260 }}>
                <Option value={DelLogType.TwoYearsAgo}>两年前</Option>
                <Option value={DelLogType.OneYearAgo}>一年前</Option>
                <Option value={DelLogType.SixMonthsAgo}>六个月前</Option>
            </Select>
        </div>
    </Modal>;
};

DelLogModal.defaultProps = {
    visible: false,
    cancelHandle: () => { },
    okHandle: (arg0: DelLogType) => { }
};

export default memo(DelLogModal);
