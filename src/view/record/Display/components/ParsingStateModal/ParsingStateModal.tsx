import React, { PropsWithChildren, useEffect, useState } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Tag from 'antd/lib/tag';
import Modal from 'antd/lib/modal';
import './ParsingModal.less';

interface IProp {
    /**
     * 是否显示
     */
    visible: boolean;
    /**
     * 案件名称
     */
    caseName: string;
    /**
     * 当前详情手机名
     */
    phoneName: string;
    /**
     * 弹框取消
     */
    cancelHandle: () => void;
}

/**
 * 当前解析详情框
 */
function ParsingStateModal(props: PropsWithChildren<IProp>): JSX.Element {

    const [message, setMessage] = useState<string>('');

    console.log(props);

    useEffect(() => {
        ipcRenderer.on('receive-parsing-detail', receiveHandle);
        return () => {
            ipcRenderer.removeListener('receive-parsing-detail', receiveHandle);
        }
    }, []);

    if (props.visible) {
        ipcRenderer.send('parsing-detail', { ...props });
    } else {
        ipcRenderer.send('parsing-detail', null);
    }

    /**
     * 接收当前解析状态Handle
     * @param event 事件对象
     * @param args 解析消息
     */
    function receiveHandle(event: IpcRendererEvent, args: string) {
        setMessage(args);
    }

    return <Modal
        visible={props.visible}
        title="解析状态"
        destroyOnClose={true}
        maskClosable={false}
        onCancel={props.cancelHandle}
        footer={[
            <Button type="default" onClick={props.cancelHandle} icon="close-circle">取消</Button>
        ]}>
        <div className="parsing-state-modal">
            <div className="parsing-panel">
                <div className="box">
                    <div className="title">
                        <Icon type="mobile" />
                        <span>{props.caseName}</span>
                    </div>
                    <div className="phone-info">
                        <span className="txt">手机：{props.phoneName}</span>
                        <Tag color="green">
                            <Icon type="sync" spin={true} />
                            <span className="st">正在解析</span>
                        </Tag>
                    </div>
                </div>
                <div className="box">
                    <div className="title">
                        <Icon type="file-sync" />
                        <span>解析详情</span>
                    </div>
                    <div className="content">
                        <div>{message}</div>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
}

export default ParsingStateModal;