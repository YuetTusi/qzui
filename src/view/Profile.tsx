import React, { Component } from 'react';
import Layout from '@src/components/Layout';


class Profile extends Component {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactElement {
        return <Layout><h1>Profile</h1></Layout>
    }
}

export default Profile;