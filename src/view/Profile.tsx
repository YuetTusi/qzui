import React, { Component } from 'react';
import Layout from '@src/components/Layout';
import { connect } from 'dva';
import { IObject } from '@src/type/model';

interface IProp {
    profile: any;
}

class Profile extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactElement {
        return <Layout><h1>Profile</h1></Layout>
    }
}

export default Profile;