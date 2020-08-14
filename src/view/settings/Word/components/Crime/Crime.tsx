import path from 'path';
import { remote } from 'electron';
import React, { Component, MouseEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import nunjucks from 'nunjucks';
import $ from 'jquery';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import message from 'antd/lib/message';
import { CrimeState } from '@src/model/settings/Word/Crime';
import { helper } from '@src/utils/helper';
import { template } from '../../template/crime';


let jsonSavePath = '';
if (process.env['NODE_ENV'] === 'development') {
    jsonSavePath = path.join(remote.app.getAppPath(), './data/words.json');
} else {
    jsonSavePath = path.join(remote.app.getAppPath(), '../data/words.json');
}

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
        console.log(jsonSavePath);
        this.readFile();
    }
    async readFile() {

        let json: any[] = [];

        let exist = await helper.existFile(jsonSavePath);

        if (exist) {
            json = await helper.readJSONFile(jsonSavePath);
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
            item.sort = $el.find('.sort-bar input').val();
            item.children = [];

            $el.find('.children input').each((j, input) => {
                if ($(input).val()?.toString().trim() !== '') {
                    item.children.push($(input).val());
                }
            });
            data.push(item);
        });
        helper.writeJSONfile(jsonSavePath, data)
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
                        // $('.crime-root').find('#empty-div').remove();
                        $('.crime-root').append(`
                        <div class="sort" data-id="${newId}">
                        <div class="sort-bar">
                            <label>分类：</label>
                            <input type="text" data-id="${newId}" class="az-input" />
                            <button type="button" data-fn="addChild" class="az-button">添加涉案词</button>
                            <button type="button" data-fn="delSort" class="az-button">删除</button>
                        </div>
                        <hr/>
                        <div class="children">
                        </div>
                    </div>
                    `);
                    }}>添加分类</Button>
                </div>

            </div>
            <div
                className="crime-root"
                dangerouslySetInnerHTML={{ __html: this.state.html! }}>
            </div>
        </div>;
    }
}

export default connect((state: any) => ({ crime: state.crime }))(Crime);