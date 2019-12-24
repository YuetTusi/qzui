import React, { Component, ReactElement } from 'react';
import Title from '@src/components/title/Title';
import { IObject, StoreComponent } from '@type/model';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import './BcpUpload.less';

interface IProp extends StoreComponent { }

/**
 * @description BCP上传
 */
class BcpUpload extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {
        return <div className="bcp-upload">
            <Title returnText="返回" onReturn={() => this.props.dispatch(routerRedux.push('/tools'))}>BCP上传</Title>
        </div>
    }
}
export default connect((state: IObject) => ({ state }))(BcpUpload);