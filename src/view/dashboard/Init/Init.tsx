import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import './Init.less'
import { IObject } from '@src/type/model';

class Init extends Component {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="init">
            <div className="bg">
                <div className="panel">
                    <div className="inner-panel">
                        <div className="phone">
                            <div className="iphone">
                                <div className="phone-loading"></div>
                            </div>
                        </div>
                        <div className="info">
                            <div className="title">请将设备连接到电脑并保持连接</div>
                            {/* <div className="title success">手机正确识别，正在连接...</div> */}
                            <div className="sub-title">
                                {/* <div>设备成功连接后将可以进行数据的提取和导出</div> */}
                                <div>
                                    <i className="brand android" /><span>Android</span>
                                </div>
                            </div>
                            <div className="bar">请选择采集方式</div>
                            <div className="buttons">
                                <div className="line">
                                    <div className="btn">
                                        <Button type="primary">快速采集</Button>
                                    </div>
                                    <em>只采集基本信息、短信信息、联系人信息、通讯录信息</em>
                                </div>
                                <div className="line">
                                    <div className="btn">
                                        <Button type="primary">全面采集</Button>
                                    </div>
                                    <em>采集手机内所有信息,支持自定义勾选</em>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: IObject) => {
    return { 'dashboard': state.dashboard }
})(Init);