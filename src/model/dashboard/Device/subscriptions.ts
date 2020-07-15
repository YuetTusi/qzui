import { SubscriptionAPI } from 'dva';
import Modal from 'antd/lib/modal';
import { helper } from '@src/utils/helper';
import server, { send } from '@src/service/tcpServer';
import { DeviceType } from '@src/schema/socket/DeviceType';
import CommandType, { SocketType, Command } from '@src/schema/socket/Command';
import { deviceChange, deviceOut, fetchProgress } from './listener';
import { FetchProgress } from "@src/schema/socket/FetchRecord";

const deviceCount: number = helper.readConf().max;

/**
 * 订阅
 */
export default {
    /**
     * 接收设备连接信息
     */
    receiveDevice({ dispatch }: SubscriptionAPI) {

        server.on(SocketType.Fetch, (command: Command) => {

            switch (command.cmd) {
                case CommandType.Connect:
                    let cmd: Command = {
                        type: SocketType.Fetch,
                        cmd: CommandType.ConnectOK,
                        msg: { count: deviceCount }
                    };
                    //#Socket连入后，告知采集路数
                    send(SocketType.Fetch, cmd);
                    break;
                case CommandType.DeviceIn:
                    console.log(`接收到设备连入:${JSON.stringify(command.msg)}`);
                    dispatch({ type: 'setDeviceToList', payload: command.msg });
                    break;
                case CommandType.DeviceChange:
                    console.log(`设备状态变化:${JSON.stringify(command.msg)}`);
                    deviceChange(command, dispatch);
                    break;
                case CommandType.FetchProgress:
                    console.log(`采集进度消息：${JSON.stringify(command.msg)}`);
                    fetchProgress(command, dispatch);
                    break;
                case CommandType.DeviceOut:
                    deviceOut(command, dispatch);
                    break;
                case CommandType.UserAlert:
                    Modal.destroyAll();
                    Modal.warning({
                        title: '警告',
                        content: '此手机USB冲突',
                        okText: '知道了'
                    });
                    break;
            }
        });
    },
}