import React, { Component, ReactElement } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, IComponent } from '@src/type/model';
import Title from '@src/components/title/Title';
import './Dynamic.less';

interface IProp extends IComponent { }

/**
 * @description 动态
 */
class Dynamic extends Component<IProp> {
    constructor(props: IProp) {
        super(props);
    }
    render(): ReactElement {
        return <div className="dynamic-panel">
            <Title returnText="返回"
                onReturn={() => this.props.dispatch(routerRedux.push('/record/case-info'))}>
                动态
            </Title>
            <div className="msg-list">
                <ul>
                    <li>
                        <div className="name">
                            Doni(张楠)
                        </div>
                        <div>
                            朋友圈内容，朋友圈内容，<a>朋友圈内容，</a>朋友圈内容，朋友圈内容，朋友圈内容，朋友圈内容.....
                        </div>
                        <div className="images">
                            <img src="#" />
                            <img src="#" />
                            <img src="#" />
                        </div>
                        <time>2019-08-25 10:32:36</time>
                    </li>
                    <li>
                        <div className="name">
                            Doni(张楠)
                        </div>
                        <div>
                            朋友圈内容，朋友圈内容，<a>朋友圈内容，</a>朋友圈内容，朋友圈内容，朋友圈内容，朋友圈内容.....
                        </div>
                        <div className="images">
                            <img src="#" />
                            <img src="#" />
                            <img src="#" />
                        </div>
                        <time>2019-08-25 10:32:36</time>
                    </li>
                    <li>
                        <div className="name">
                            Doni(张楠)
                        </div>
                        <div>
                            朋友圈内容，朋友圈内容，<a>朋友圈内容，</a>朋友圈内容，朋友圈内容，朋友圈内容，朋友圈内容.....
                        </div>
                        <div className="images">
                            <img src="#" />
                            <img src="#" />
                            <img src="#" />
                        </div>
                        <time>2019-08-25 10:32:36</time>
                    </li>
                </ul>
            </div>
        </div>
    }
}
export default connect((state: IObject) => ({ state }))(Dynamic);