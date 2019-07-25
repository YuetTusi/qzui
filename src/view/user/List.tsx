import React, { Component, Fragment } from 'react';
import { IComponent, IObject } from '@type/model';
import { connect } from 'dva';
import Layout from '@src/components/layout/Layout';
import { NavLink, Route } from 'dva/router';
import { helper } from '@utils/helper';
import { Button } from 'antd';
const { dialog } = window.require('electron').remote;


interface IProp extends IComponent {
    user: any;
}

class List extends Component<IProp>{
    render(): React.ReactElement {
        return <Fragment>
            <Button onClick={() => {
                dialog.showMessageBox({ title: "提示", message: '消息' });
            }}>OK</Button>
        </Fragment>;
    }
}

export default connect((state: IObject): IObject => ({ user: state.user }))(List);