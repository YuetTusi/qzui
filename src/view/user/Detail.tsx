import React, { Component } from 'react';
import Layout from '@src/components/layout/Layout';
import { NavLink, Route } from 'dva/router';
import { IComponent } from '@type/model';

class Detail extends Component<IComponent> {
    render(): React.ReactElement {
        return <h1>用户详情 {this.props.match.params.id}</h1>;
    }
}

export default Detail;