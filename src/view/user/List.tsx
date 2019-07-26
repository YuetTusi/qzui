import React, { Component, Fragment } from 'react';
import { IComponent, IObject } from '@type/model';
import { connect } from 'dva';
import { Button } from 'antd';
import { helper } from '@utils/helper';
const { dialog } = window.require('electron').remote;
const { Rpc } = window;

let client = new Rpc({ uri: 'http://127.0.0.1:3000', methods: ['getUser'] });

interface IProp extends IComponent {
    user: any;
}

class List extends Component<IProp>{
    renderTable(): React.ReactElement {
        return <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                {this.props.user.data.map((item: any) => {
                    return <tr key={helper.getKey()}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                    </tr>
                })}
            </tbody>
        </table>
    }
    render(): React.ReactElement {
        return <Fragment>
            <Button onClick={() => {
                dialog.showMessageBox({ title: "提示", message: '消息' });
            }}>OK</Button>
            <Button onClick={() => {
                this.props.dispatch({ type: "user/getUser", payload: null });
            }}>Rpc调用</Button>
            <hr />
            {this.renderTable()}
        </Fragment>;
    }
}

export default connect((state: IObject): IObject => ({ user: state.user }))(List);