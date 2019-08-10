import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IComponent, IObject } from '@type/model';
import { Row, Col } from 'antd';
import Title from '@src/components/title/Title';
import './CaseInfo.less';


interface IProp extends IComponent { }

/**
 * @description 采集记录-案件信息
 */
class CaseInfo extends Component<IProp> {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="case-info">
            <Title okText="确定" onOk={() => { alert('确定') }}
                returnText="返回" onReturn={() => this.props.dispatch(routerRedux.push('/record'))}>案件信息_001</Title>
            <div className="tips">
                <Row gutter={18}>
                    <Col span={6}>
                        <div className="tips-item">
                            <div className="ico">
                                <i className="iphone"></i>
                            </div>
                            <div className="info">
                                <div className="txt">apple</div>
                                <div className="num">iPhone 8 plus</div>
                            </div>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div className="tips-item">
                            <div className="ico">
                                <i className="statistical"></i>
                            </div>
                            <div className="info">
                                <div className="txt">共采集数据</div>
                                <div className="num">11111条</div>
                            </div>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div className="tips-item">
                            <div className="ico">
                                <i className="timer"></i>
                            </div>
                            <div className="info">
                                <div className="txt">共采集耗时</div>
                                <div className="num">00:27:16</div>
                            </div>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div className="tips-item">
                            <div className="ico">
                                <i className="case"></i>
                            </div>
                            <div className="info">
                                <div className="txt">案件信息</div>
                                <div className="num"><a>Case_20190812_2121323</a></div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="category">
                <div className="bar"><span>基本信息</span></div>
                <div className="box">
                    <Row>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon base"></div>
                                <div>基本信息</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon sms"></div>
                                <div>短信</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon contact"></div>
                                <div>通讯录</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon calllog"></div>
                                <div>通话记录</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon calendar"></div>
                                <div>日历</div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className="bar"><span>系统信息</span></div>
                <div className="box">
                    <Row>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon sim"></div>
                                <div>SIM卡</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon wifi"></div>
                                <div>wifi</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon bluetooth"></div>
                                <div>蓝牙</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon appins"></div>
                                <div>安装应用</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon appaccount"></div>
                                <div>虚拟身份</div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className="bar">
                    <span>多媒体</span>
                </div>
                <div className="box">
                    <Row>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon picture"></div>
                                <div>图片</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon video"></div>
                                <div>视频</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon audio"></div>
                                <div>音频</div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className="bar">
                    <span>邮箱</span>
                </div>
                <div className="box">
                    <Row>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon email"></div>
                                <div>邮箱</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon qq-email"></div>
                                <div>QQ邮箱</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon netease-email"></div>
                                <div>网易邮箱</div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon netease-master"></div>
                                <div>网易邮箱大师</div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: IObject) => (state))(CaseInfo);