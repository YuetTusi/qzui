import React, { PropsWithChildren } from 'react';
import Nav from '../nav/Nav';
import '@src/global.less';

interface IProp { }

/**
 * @description 布局组件 
 * @param props 
 */
function Layout(props: PropsWithChildren<IProp>): JSX.Element {
    return <>
        <div><Nav /></div>
        <div className="bottom-root">{props.children}</div>
    </>;
}

export default Layout;