import path from 'path';
import { remote } from 'electron';
import React, { Component, MouseEvent } from 'react';
import nunjucks from 'nunjucks';
import $ from 'jquery';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import { helper } from '@src/utils/helper';
import { template } from '../../template/crime';
import './Crime.less';


let jsonSavePath = '';
if (process.env['NODE_ENV'] === 'development') {
    jsonSavePath = path.join(remote.app.getAppPath(), './data/words.json');
} else {
    jsonSavePath = path.join(remote.app.getAppPath(), '../data/words.json');
}

interface Prop {
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
            let $root = $('.crime-root');
            $root.on('click', '[data-fn="delSort"]', (e) => {
                $(e.target).parents('.sort').remove();
                if ($root.find('.sort').length === 0) {
                    $root.append(`<div class="sort">
                    <div class="empty-data">暂无数据</div>
                    </div>`);
                }
            });
            $root.on('click', '[data-fn="addChild"]', (e) => {
                $(e.target).parents('.sort').find('.children').append(`
                    <div class="child-item">
                        <label>涉案词：</label>
                        <input type="text" value="" class="az-input" />
                        <button type="button" data-fn="delChild" class="az-button">删除</button>
                    </div>
                `);
            });
            $root.on('click', '[data-fn="delChild"]', (e) => {
                $(e.target).parent().remove();
            });
        });
    }
    /**
     * 保存Click
     */
    saveClick = (e: MouseEvent<HTMLButtonElement>) => {
        let data: any[] = [];
        if ($('.crime-root .empty-data').length === 0) {
            $('.crime-root .sort').each((i, el) => {
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
        }

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
                        $('.crime-root .sort').find('.empty-data').parent().remove();
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

export default Crime;