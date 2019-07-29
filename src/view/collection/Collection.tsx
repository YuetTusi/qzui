import React, { Component, ReactElement, Fragment, MouseEvent } from 'react';
import { IComponent, IObject } from '@src/type/model';
import { connect } from 'dva';
import { helper } from '@utils/helper';
import Loading from '@src/components/loading/Loading';

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
        return <Fragment>
            <h3>数据采集</h3>
            <button type="button" onClick={this.fetchClick}>请求数据</button>
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
            <Loading show={this.props.collection.loading ? 1 : 0} />
        </Fragment>
    }
}
export default connect((state: IObject) => ({ collection: state.collection }))(Collection);