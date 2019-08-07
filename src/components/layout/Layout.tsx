import React, { PropsWithChildren, ReactElement, Fragment } from 'react';
import Nav from '../nav/Nav';

interface IProp { }

/**
 * @description 布局组件 
 * @param props 
 */
function Layout(props: PropsWithChildren<IProp>): ReactElement {
    return <Fragment>
        <div><Nav /></div>
        <div>{props.children}</div>
    </Fragment>;
}

export default Layout;