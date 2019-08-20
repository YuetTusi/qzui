import React, { Component, ReactElement, Fragment, MouseEvent } from 'react';
import { IComponent, IObject } from '@src/type/model';
import { connect } from 'dva';
import { helper } from '@utils/helper';
import { Button } from 'antd';
import 'antd/lib/button/style/index.less';
interface IProp extends IComponent {
    collection: any;
}
interface IState {
    userName: string;
}

/**
 * @description 数据采集
 */
class Collection extends Component<IProp, IState>{
    constructor(props: any) {
        super(props);
    }
    invokeSumClick = (e: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'collection/invokeSum', payload: { a: 100, b: 200 } });
    }
    invokeHelloClick = (e: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'collection/invokeHello', payload: 'Jack' });
    }
    invokeJSONClick = (e: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'collection/invokeJSON', payload: null });
    }
    invokeRandomClick = (e: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'collection/invokeRandom', payload: null });
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
            <div>Data:{JSON.stringify(this.props.collection.data)}</div>
            <hr />
            <Button type="primary" onClick={this.invokeSumClick} loading={loading}>
                <span>请求Sum方法</span>
            </Button>
            <Button type="primary" onClick={this.invokeHelloClick} loading={loading}>
                <span>请求Hello方法</span>
            </Button>
            <Button type="primary" onClick={this.invokeJSONClick} loading={loading}>
                <span>请求JSON方法</span>
            </Button>
            <Button type="primary" onClick={this.invokeRandomClick} loading={loading}>
                <span>请求Random方法</span>
            </Button>
        </Fragment>
    }
}
export default connect((state: IObject) => ({ collection: state.collection }))(Collection);