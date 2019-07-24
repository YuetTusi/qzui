import React from 'react';
import Nav from './Nav';

/**
 * @description 布局组件 
 * @param props 
 */
function Layout(props: any): React.ReactElement {
    return <div>
        <Nav></Nav>
        <div>{props.children}</div>
    </div>;
}

export default Layout;