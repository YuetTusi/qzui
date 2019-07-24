import React, { Component } from 'react';
import Layout from '@src/components/Layout';
import { connect } from 'dva';
import { IObject } from '@src/type/model';
import { helper } from '@utils/helper';

interface IProp {
    profile: any;
}

class Profile extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactElement {
        return <Layout><h1>{helper.parseDate('2010-01-01T05:06:07', 'YYYY-MM-DD HH:mm:ss')}</h1></Layout>
    }
}

export default Profile;