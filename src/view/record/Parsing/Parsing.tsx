import React, { Component } from 'react';
import { ipcRenderer, IpcMessageEvent } from 'electron';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@src/type/model';
import Title from '@src/components/title/Title';
import './Parsing.less';

interface IProp extends IComponent { }
interface IState { }

/**
 * 解析详情
 */
class Parsing extends Component<IProp, IState> {
    constructor(props: IProp) {
        super(props);
    }
    componentDidMount() {
        //LEGACY:此处在实际开发时传设备真实ID
        ipcRenderer.send('parsing-detail', `测试参数_${~~(Math.random() * 100000)}`);
        ipcRenderer.on('receive-parsing-detail', this.receiveHandle);
    }
    componentWillUnmount() {
        //NOTE:组件被销毁后，向渲染进程发送null停止轮询
        ipcRenderer.send('parsing-detail', null);
        ipcRenderer.removeListener('receive-parsing-detail', this.receiveHandle);
    }
    /**
     * IPC消息接收Handle
     */
    receiveHandle(event: IpcMessageEvent, args: any) {
        console.log(event);
        console.log(args);
    }
    render(): JSX.Element {
        const { dispatch } = this.props;
        return <div className="parsing-root">
            <Title
                returnText="返回"
                onReturn={() => dispatch(routerRedux.push('/record/phone-list'))}>解析详情</Title>
            <div className="scroll-panel">
                解析详情
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ parsing: state.parsing }))(Parsing);