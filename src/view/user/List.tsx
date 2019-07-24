import React, { Component, Fragment } from 'react';
import { IComponent, IObject } from '@type/model';
import { connect } from 'dva';
import Layout from '@src/components/Layout';
import { NavLink, Route } from 'dva/router';
import { helper } from '@utils/helper';

const { dialog } = window.require('electron').remote;

interface IProp extends IComponent {
    user: any;
}

class List extends Component<IProp>{
    render(): React.ReactElement {
        return <Fragment>
            <button onClick={() => {
                dialog.showMessageBox({ title: '', message: "abc" });
            }}>OK</button>
        </Fragment>;
    }
}

export default connect((state: IObject): IObject => ({ user: state.user }))(List);