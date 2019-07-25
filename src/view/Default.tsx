import React, { Component } from 'react';
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
    render(): React.ReactElement {
        return <Layout>

            <h1>num:{this.props.default.num}</h1>
            <button type="button" onClick={() => { this.props.dispatch({ type: 'default/syncAdd', payload: 1 }) }}>+</button>
            <button type="button" onClick={() => { this.props.dispatch({ type: 'default/syncMinus', payload: 1 }) }}>-</button>
        </Layout>
    }
}

export default connect((state: IObject) => {
    return { default: state.default };
})(Default);