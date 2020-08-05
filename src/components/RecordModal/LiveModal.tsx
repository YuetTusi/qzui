import React, { FC, useEffect, useState, useRef, memo } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import moment from 'moment';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import { helper } from '@src/utils/helper';
import { useSubscribe } from '@src/hooks';
import { Prop } from './liveComponentType';
import FetchRecord, { ProgressType } from '@src/schema/socket/FetchRecord';
import './RecordModal.less';

/**
 * 采集记录框（此框用于采集时实显示进度消息）
 */
const LiveModal: FC<Prop> = props => {

    const { title, visible, cancelHandle } = props;
    const [data, setData] = useState<FetchRecord[]>([]);
    const scrollBox = useRef<HTMLDivElement>(null);

    /**
     * 接收主进程传来的采集进度数据
     */
    const receiveFetchProgress = (event: IpcRendererEvent, arg: FetchRecord[]) => {
        setData(arg);
        if (scrollBox.current) {
            const h = scrollBox.current.scrollHeight;
            scrollBox.current.scrollTo(0, h);
        }
    };

    useSubscribe('receive-fetch-progress', receiveFetchProgress);

    useEffect(() => {
        if (props.visible) {
            ipcRenderer.send('get-fetch-progress', props.usb);
        } else {
            setData([]);
        }
    }, [props.visible]);

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

        if (data.length === 0) {
            return <div className="middle">
                <Empty description="暂无记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>;
        } else {
            return <ul>
                {
                    data.map(item => {
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
        className="record-modal-root">
        <div className="list-block" ref={scrollBox}>
            {renderData()}
        </div>
    </Modal>;
};

LiveModal.defaultProps = {
    visible: false,
    title: '采集记录',
    cancelHandle: () => { }
};

export default memo(LiveModal, (prev: Prop, next: Prop) => {
    return !prev.visible && !next.visible;
});