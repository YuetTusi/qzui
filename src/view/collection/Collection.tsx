import React, { Component, ReactElement, Fragment, MouseEvent } from 'react';
import { IComponent, IObject } from '@src/type/model';
import { connect } from 'dva';
import { helper } from '@utils/helper';
import { Button } from 'antd';
import 'antd/lib/button/style/index.less';
import path from 'path';

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
    fetchAddClick = (e: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'collection/fetchAddData', payload: null });
    }
    renderData(): ReactElement {
        let { data } = this.props.collection;
        if (data) {
            return <h1>{data}</h1>
        } else {
            return <h1></h1>
        }
    }
    render(): ReactElement {
        const { loading } = this.props.collection;
        return <Fragment>
            <h3>数据采集</h3>
            <Button type="primary" icon="return" onClick={this.fetchAddClick} loading={loading}>
                <span>请求add数据</span>
            </Button>
            <Button type="primary" icon="mobile" onClick={this.fetchClick} loading={loading}>
                <span>请求hello数据</span>
            </Button>
            <hr />
            {this.renderData()}
        </Fragment>
    }
}
export default connect((state: IObject) => ({ collection: state.collection }))(Collection);