import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { PropsWithChildren, useEffect } from 'react';
import Table from 'antd/lib/table';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import { getColumns } from './column';
import { IProp } from './PropsType';
import './InnerPhoneList.less';

//ReportReader/ReportReader.exe
let publishPath = 'C:\\';

/**
 * 案件下手机列表
 */
function InnerPhoneList(props: PropsWithChildren<IProp>): JSX.Element {

    useEffect(() => {
        ipcRenderer.send('publish-path');
        ipcRenderer.on('receive-publish-path', receivePublishPathHandle);
        return function () {
            ipcRenderer.removeListener('receive-publish-path', receivePublishPathHandle)
        }
    }, []);

    function receivePublishPathHandle(event: IpcRendererEvent, args: string) {
        publishPath = args;
    }

    return <div className="inner-phone-list">
        <Table<UIRetOneInfo>
            columns={getColumns(props, publishPath, props.isRunning)}
            dataSource={props.data}
            pagination={false}
            bordered={true}
            size="middle"
            rowClassName={(record: UIRetOneInfo, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'} />
    </div>;
}

export default InnerPhoneList;