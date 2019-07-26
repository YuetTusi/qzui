import React, { Component, MouseEventHandler, MouseEvent } from 'react';
import { connect } from 'dva';
import { IObject, IComponent } from '@src/type/model';
import Layout from '@src/components/layout/Layout';


interface IProp extends IComponent {
    default: any;
}

class Default extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    addClick = (event: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'default/syncAdd', payload: 1 });
    }
    addMinus = (event: MouseEvent<HTMLButtonElement>) => {
        this.props.dispatch({ type: 'default/syncMinus', payload: 1 })
    }
    render(): React.ReactElement {
        return <Layout>

            <h1>num:{this.props.default.num}</h1>
            <button type="button" onClick={this.addClick}>+</button>
            <button type="button" onClick={this.addMinus}>-</button>
        </Layout>
    }
}

export default connect((state: IObject) => {
    return { default: state.default };
})(Default);