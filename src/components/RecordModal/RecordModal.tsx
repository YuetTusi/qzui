import React, { FC } from 'react';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { Prop, Record } from './componentType';
import './RecordModal.less';
import { helper } from '@src/utils/helper';

const RecordModal: FC<Prop> = props => {

    const { title, visible, data, cancelHandle } = props;

    /**
     * 渲染记录数据
     */
    const renderData = () => data?.map(item => <li key={helper.getKey()}><span>{item.info}</span></li>);

    return <Modal
        visible={visible}
        footer={[
            <Button type="default" icon="close-circle" onClick={props.cancelHandle}>取消</Button>
        ]}
        onCancel={cancelHandle}
        title={title}
        width={800}
        className="record-modal-root">
        <div className="list-block">
            <ul>
                {renderData()}
            </ul>
        </div>
    </Modal>;
};

RecordModal.defaultProps = {
    visible: false,
    data: [],
    title: '采集记录',
    cancelHandle: () => { }
};

export default RecordModal;