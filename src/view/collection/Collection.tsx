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
interface IState {
    userName: string;
}

/**
 * @description 数据采集
 */
class Collection extends Component<IProp, IState>{
    constructor(props: any) {
        super(props);
        this.state = {
            userName: ''
        }
    }
    userNameChange = (e: any) => {
        this.setState({ userName: e.target.value });
    }
    invokeHelloClick = (e: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'collection/invokeHello', payload: this.state.userName });
    }
    invokeAddClick = (e: any) => {
        this.props.dispatch({ type: 'collection/invokeAdd', payload: { n1: 100, n2: 200 } });
    }
    invokeRndClick = (e: any) => {
        this.props.dispatch({ type: 'collection/invokeRnd' });
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
            <div>Data:{this.props.collection.data}</div>
            <div>Result:{this.props.collection.result}</div>
            <div>Rnd:{this.props.collection.rnd}</div>
            <input type="text" value={this.state.userName} onChange={this.userNameChange} />
            <hr />
            <Button type="primary" icon="return" onClick={this.invokeHelloClick} loading={loading}>
                <span>请求7777端口hello方法</span>
            </Button>
            <Button type="primary" icon="return" onClick={this.invokeAddClick} loading={loading}>
                <span>请求7777端口add方法</span>
            </Button>
            <Button type="primary" icon="return" onClick={this.invokeRndClick} loading={loading}>
                <span>请求7777端口rnd方法</span>
            </Button>
        </Fragment>
    }
}
export default connect((state: IObject) => ({ collection: state.collection }))(Collection);