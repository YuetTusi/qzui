import React from 'react';
import Nav from './Nav';


function Layout(props: any): React.ReactElement {
    return <div>
        <Nav></Nav>
        <div>{props.children}</div>
    </div>;
}

export default Layout;