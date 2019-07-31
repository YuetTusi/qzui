import React, { Component, ReactElement, Fragment, MouseEvent } from 'react';
import { IComponent, IObject } from '@src/type/model';
import { connect } from 'dva';
import { helper } from '@utils/helper';
import { Button } from 'antd';
// import Loading from '@src/components/loading/Loading';

interface IProp extends IComponent {
    collection: any;
}

/**
 * @description 数据采集
 */
class Collection extends Component<IProp>{
    constructor(props: any) {
        super(props);
    }
    fetchClick = (e: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'collection/fetchTestData', payload: null });
    }
    renderData(): ReactElement {
        let { data } = this.props.collection;
        if (data) {
            return data.map((item: IObject) => {
                return <tr key={helper.getKey()}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                </tr>
            });
        } else {
            return <tr></tr>
        }
    }
    render(): ReactElement {
        const { loading } = this.props.collection;
        return <Fragment>
            <h3>数据采集</h3>
            <Button type="primary" icon="mobile" onClick={this.fetchClick} loading={loading}><span>请求数据</span>
            </Button>
            <hr />
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderData()}
                </tbody>
            </table>
        </Fragment>
    }
}
export default connect((state: IObject) => ({ collection: state.collection }))(Collection);