import path from 'path';
import { remote } from 'electron';
import React, { Component, MouseEvent } from 'react';
import nunjucks from 'nunjucks';
import $ from 'jquery';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import { helper } from '@src/utils/helper';
import { template } from '../../template/browser';
import './Browser.less';

let jsonSavePath = '';
if (process.env['NODE_ENV'] === 'development') {
    jsonSavePath = path.join(remote.app.getAppPath(), './data/browser.json');
} else {
    jsonSavePath = path.join(remote.app.getAppPath(), '../data/browser.json');
}

interface Prop {}

interface State {
    html: string | null;
}

/**
 * 浏览器配置
 */
class Browser extends Component<Prop, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            html: null
        };
    }
    componentDidMount() {
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
            let $root = $('.browser-root');
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
                        <label>内容：</label>
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
        if ($('.browser-root .empty-data').length === 0) {
            $('.browser-root .sort').each((i, el) => {
                let $el = $(el);
                let item: any = {};
                item.id = $el.attr('data-id');
                item.sort = $el.find('.sort-bar input').val();
                item.level = $el.find('.sort-bar select').val();
                item.children = [];

                $el.find('.children input').each((j, input) => {
                    if ($(input).val()?.toString().trim() !== '') {
                        item.children.push($(input).val());
                    }
                });
                data.push(item);
            });
        }

        helper
            .writeJSONfile(jsonSavePath, data)
            .then((success) => {
                console.log(success);
                message.success('保存成功');
            })
            .catch((err) => {
                console.log(err);
            });
    };
    render(): JSX.Element {
        return (
            <div className="scroll-panel">
                <div className="top-bar">
                    <div>
                        <Button type="primary" onClick={this.saveClick}>
                            保存
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                let newId = uuid();
                                $('.browser-root .sort').find('.empty-data').parent().remove();
                                $('.browser-root').append(`
                                    <div class="sort" data-id="${newId}">
                                        <div class="sort-bar">
                                            <label>浏览器分类：</label>
                                            <input type="text" data-id="${newId}" class="az-input" />
                                            <label>风险级别：</label>
                                            <select data-id="${newId}" class="az-select">
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                            </select>
                                            <button type="button" data-fn="addChild" class="az-button">添加内容</button>
                                            <button type="button" data-fn="delSort" class="az-button">删除</button>
                                        </div>
                                        <hr/>
                                        <div class="children">
                                        </div>
                                    </div>
                                `);
                            }}
                        >
                            添加分类
                        </Button>
                    </div>
                </div>
                <div
                    className="browser-root"
                    dangerouslySetInnerHTML={{ __html: this.state.html! }}
                ></div>
            </div>
        );
    }
}

export default Browser;
