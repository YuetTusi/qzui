import React, { Component, Fragment } from 'react';
import { IComponent, IObject } from '@type/model';
import { connect } from 'dva';
import Layout from '@src/components/Layout';
import { NavLink, Route } from 'dva/router';
import { helper } from '@utils/helper';

interface IProp extends IComponent {
    user: any;
}

class List extends Component<IProp>{
    renderTable(): React.ReactElement {
        const { data } = this.props.user;
        return data.map((item: any) => {
            return <tr key={helper.getKey()}>
                <td>{item.id}</td>
                <td>{item.name}</td>
            </tr>
        });
    }
    render(): React.ReactElement {
        return <Fragment>
            <h1>用户查询</h1>
            <hr />
            <table>
                <thead>
                    <tr>
                        <th>id</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderTable()}
                </tbody>
            </table>
        </Fragment>;
    }
}

export default connect((state: IObject): IObject => ({ user: state.user }))(List);