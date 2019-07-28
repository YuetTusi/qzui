import React, { PropsWithChildren, ReactElement } from 'react';
import Nav from '../nav/Nav';

interface IProp{}

/**
 * @description 布局组件 
 * @param props 
 */
function Layout(props: PropsWithChildren<IProp>): ReactElement {
    return <div>
        <Nav></Nav>
        <div>{props.children}</div>
    </div>;
}

export default Layout;