import React, { FC } from 'react';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { Prop } from './componentType';
import { helper } from '@src/utils/helper';
import { ProgressType } from '@src/schema/socket/FetchRecord';
import './RecordModal.less';

const RecordModal: FC<Prop> = props => {

    const { title, visible, data, cancelHandle } = props;

    /**
     * 渲染记录数据
     */
    const renderData = () => {
        if (helper.isNullOrUndefined(data) || data?.length === 0) {
            return <div className="list-empty">
                <Empty description="暂无记录" />
            </div>;
        } else {
            return <div className="list-block">
                <ul>
                    {
                        data?.map(item => {
                            switch (item.type) {
                                case ProgressType.Normal:
                                    return <li key={helper.getKey()}>
                                        <span style={{ color: '#222' }}>{item.info}</span>
                                    </li>;
                                case ProgressType.Warning:
                                    return <li key={helper.getKey()}>
                                        <span style={{ color: '#dc143c' }}>{item.info}</span>
                                    </li>;
                                default:
                                    return <li key={helper.getKey()}>
                                        <span style={{ color: '#222' }}>{item.info}</span>
                                    </li>;
                            }
                        })
                    }
                </ul>
            </div>;
        }
    }

    return <Modal
        visible={visible}
        footer={[
            <Button type="default" icon="close-circle" onClick={props.cancelHandle}>取消</Button>
        ]}
        onCancel={cancelHandle}
        title={title}
        width={800}
        className="record-modal-root">
        {renderData()}
    </Modal>;
};

RecordModal.defaultProps = {
    visible: false,
    data: [],
    title: '采集记录',
    cancelHandle: () => { }
};

export default RecordModal;