import React, { Component, MouseEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import nunjucks from 'nunjucks';
import $ from 'jquery';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import { CrimeState } from '@src/model/settings/Word/Crime';
import { helper } from '@src/utils/helper';
import { template } from '../../template/crime';
import { message } from 'antd';

interface Prop {
    /**
     * StoreState
     */
    crime?: CrimeState
    /**
     * 派发方法
     */
    dispatch?: Dispatch<any>;
}

interface State {
    html: string | null;
}

/**
 * 涉案词配置
 */
class Crime extends Component<Prop, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            html: null
        }
    }
    componentDidMount() {
        this.readFile();

    }
    async readFile() {

        let json = [];

        let exist = await helper.existFile('E:\\work\\qzui\\data\\word.json');

        if (exist) {
            json = await helper.readJSONFile('E:\\work\\qzui\\data\\word.json');
        }
        let html = nunjucks.renderString(template, { data: json });
        this.setState({ html }, () => {
            $('.crime-root').on('click', '[data-fn="delSort"]', (e) => {
                $(e.target).parents('.sort').remove();
            });
            $('.crime-root').on('click', '[data-fn="addChild"]', (e) => {
                $(e.target).parents('.sort').find('.children').append(`
                    <div class="child-item">
                        <input type="text" value="" class="az-input" />
                        <button type="button" data-fn="delChild" class="az-button">删除</button>
                    </div>
                `);
            });
            $('.crime-root').on('click', '[data-fn="delChild"]', (e) => {
                $(e.target).parent().remove();
            });
        });
    }
    /**
     * 保存Click
     */
    saveClick = (e: MouseEvent<HTMLButtonElement>) => {
        let data: any[] = [];
        $('.sort').each((i, el) => {
            let $el = $(el);
            let item: any = {};
            item.id = $el.attr('data-id');
            item.sort = $el.find('.bar input').val();
            item.children = [];

            $el.find('.children input').each((j, input) => {
                item.children.push($(input).val());
            });

            data.push(item);
        });
        helper.writeJSONfile('E:\\work\\qzui\\data\\word.json', data)
            .then((success) => {
                console.log(success);
                message.success('保存成功');
            })
            .catch((err) => {
                console.log(err);
            });
    }
    render(): JSX.Element {
        return <div className="scroll-panel">
            <div className="top-bar">
                <div>
                    <Button type="primary" onClick={this.saveClick}>保存</Button>
                    <Button type="primary" onClick={() => {
                        let newId = uuid();
                        $('.crime-root').append(`
                        <div class="sort" data-id="${newId}">
                        <div class="bar">
                            <label>分类：</label>
                            <input type="text" data-id="${newId}" class="az-input" />
                            <button type="button" data-fn="addChild" class="az-button">添加关键词</button>
                            <button type="button" data-fn="delSort" class="az-button">删除</button>
                        </div>
                        <div class="children">
                        </div>
                    </div>
                    `);
                    }}>添加分类</Button>
                </div>

            </div>
            {this.state.html === null ? <Empty description="暂无数据" /> : <div
                className="crime-root"
                dangerouslySetInnerHTML={{ __html: this.state.html }}>
            </div>}
        </div>;
    }
}

export default connect((state: any) => ({ crime: state.crime }))(Crime);