import React, { FC, useEffect, useRef, memo } from 'react';
import moment from 'moment';
import throttle from 'lodash/throttle';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { Prop } from './recordComponentType';
import { helper } from '@src/utils/helper';
import { ProgressType } from '@src/schema/socket/FetchRecord';
import './RecordModal.less';

/**
 * 采集记录框
 */
const RecordModal: FC<Prop> = props => {

    const { title, visible, data, cancelHandle } = props;

    /**
     * 渲染时间
     * @param time 时间对象
     */
    const renderTime = (time: Date) => {
        if (helper.isNullOrUndefined(time)) {
            return '- - -';
        } else {
            return moment(time).format('YYYY-MM-DD HH:mm:ss');
        }
    };

    /**
     * 渲染记录数据
     */
    const renderData = () => {

        if (helper.isNullOrUndefined(data) || data?.length === 0) {
            return <div className="middle">
                <Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>;
        } else {
            return <ul>
                {
                    data?.map(item => {
                        switch (item.type) {
                            case ProgressType.Normal:
                                return <li key={helper.getKey()}>
                                    <label>【{renderTime(item.time)}】</label>
                                    <span style={{ color: '#222' }}>{item.info}</span>
                                </li>;
                            case ProgressType.Warning:
                                return <li key={helper.getKey()}>
                                    <label>【{renderTime(item.time)}】</label>
                                    <span style={{ color: '#dc143c' }}>{item.info}</span>
                                </li>;
                            case ProgressType.Message:
                                return <li key={helper.getKey()}>
                                    <label>【{renderTime(item.time)}】</label>
                                    <span style={{ color: '#416eb5' }}>{item.info}</span>
                                </li>;
                            default:
                                return <li key={helper.getKey()}>
                                    <label>【{renderTime(item.time)}】</label>
                                    <span style={{ color: '#222' }}>{item.info}</span>
                                </li>;
                        }
                    })
                }
            </ul>;
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
        maskClosable={false}
        destroyOnClose={true}
        className="record-modal-root">
        <div className="list-block">
            {renderData()}
        </div>
    </Modal>;
};

RecordModal.defaultProps = {
    visible: false,
    data: [],
    title: '采集记录',
    cancelHandle: () => { }
};

export default memo(RecordModal, (prev: Prop, next: Prop) => {
    return !prev.visible && !next.visible;
});