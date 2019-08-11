import React, { Component, ReactElement, MouseEvent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Input, Row, Col, Icon } from 'antd';
import { IComponent, IObject } from '@type/model';
import Title from '@src/components/title/Title';
import './Display.less';

interface IProp extends IComponent {

}

class Display extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="display">
            <Title>采集记录</Title>
            <div className="input-panel">
                <Input placeholder="请输入关键字" style={{ width: '300px' }} />
            </div>
            <div className="rec">
                <div className="bar">
                    2019年8月 共采集1部手机 12345条数据
                    </div>
                <div className="rec-row">
                    <Row gutter={8}>
                        <Col span={6}>
                            <div className="item" onClick={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                                <div className="drop" title="删除记录">
                                    <Icon type="delete" style={{ fontSize: '22px' }} />
                                </div>
                                <div className="ico">
                                    <i className="phone-type iphone"></i>
                                </div>
                                <div className="info">
                                    <div className="txt">Case_20190801</div>
                                    <div className="name">apple iPhone 8 plus</div>
                                    <div className="num">共提取<em>12345678</em>条数据</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    }
}

export default connect((state: IObject) => ({ state }))(Display);