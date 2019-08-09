import React, { Component, ReactElement } from 'react';
import './Collecting.less';
import { Button, Progress, Row, Col } from 'antd';

/**
 * @description 采集数据
 */
class Collection extends Component {
    constructor(props: any) {
        super(props);
    }
    render(): ReactElement {
        return <div className="collecting">
            <div className="header">
                <div className="phone">
                    <div className="iphone"></div>
                </div>
                <div className="info">
                    <div className="phone-info">
                        <i className="brand apple"></i>
                        <span>Apple iPhone 8 plus</span>
                    </div>
                    <div className="status">
                        正在拉取文件，已拉取文件数0
                    </div>
                </div>
                <div className="btn">
                    <Button type="primary">全选</Button>
                    <Button type="primary">开始采集</Button>
                    <Button type="primary">终止采集</Button>
                </div>
            </div>
            <div className="process">
                <Progress percent={30} />
            </div>
            <div className="category">
                <div className="bar"><span>基本信息</span><a>全选</a></div>
                <div className="box">
                    <Row>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon base"></div>
                                <div>基本信息</div>
                                <div className="mask">
                                    <div>采集中...</div>
                                    <div>10条数据</div>
                                </div>
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className="item">
                                <div className="app-icon sms"></div>
                                <div>短信</div>
                                <div className="selected"></div>
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
                <div className="bar"><span>系统信息</span><a>全选</a></div>
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
                    <span>多媒体</span><a>全选</a>
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
                    <span>邮箱</span><a>全选</a>
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
        </div>
    }
}

export default Collection;