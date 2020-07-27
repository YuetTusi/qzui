import React, { Component, ReactElement } from 'react';

/**
 * 使子组件只渲染1次
 */
class OneRenderComponent extends Component<any> {
    constructor(props: any) {
        super(props);
    }
    shouldComponentUpdate() {
        return false;
    }
    render(): ReactElement {
        return <>
            {this.props.children}
        </>
    }
}

export default OneRenderComponent;