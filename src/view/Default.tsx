import React, { Component } from 'react';
import { connect } from 'dva';
import { IObject, IComponent } from '@src/type/model';

interface IProp extends IComponent {
    default: any;
}

class Default extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactElement {
        console.log(this.props);
        return <div>
            <h1>num:{this.props.default.num}</h1>
            <button type="button" onClick={() => { this.props.dispatch({ type: 'default/add', payload: 1 }) }}>+</button>
            <button type="button" onClick={() => { this.props.dispatch({ type: 'default/minus', payload: 1 }) }}>-</button>
        </div>
    }
}

export default connect((state: IObject) => {
    return { default: state.default };
})(Default);