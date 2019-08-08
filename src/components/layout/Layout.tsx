import React, { PropsWithChildren, ReactElement, Fragment } from 'react';
import Nav from '../nav/Nav';
import '@src/global.less';

interface IProp { }

/**
 * @description 布局组件 
 * @param props 
 */
function Layout(props: PropsWithChildren<IProp>): ReactElement {
    return <Fragment>
        <div><Nav /></div>
        <div className="right-root">{props.children}</div>
    </Fragment>;
}

export default Layout;