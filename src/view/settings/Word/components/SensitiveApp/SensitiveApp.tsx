import path from 'path';
import { remote } from 'electron';
import React, { Component, MouseEvent } from 'react';
import nunjucks from 'nunjucks';
import $ from 'jquery';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import { helper } from '@src/utils/helper';
import { template } from '../../template/sensitiveApp';
import './SensitiveApp.less';

let jsonSavePath = '';
if (process.env['NODE_ENV'] === 'development') {
    jsonSavePath = path.join(remote.app.getAppPath(), './data/apps.json');
} else {
    jsonSavePath = path.join(remote.app.getAppPath(), '../data/apps.json');
}

interface Prop {}

interface State {
    html: string | null;
}

/**
 * 敏感应用配置
 */
class SensitiveApp extends Component<Prop, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            html: null
        };
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
            let $root = $('.sensitive-app-root');
            $root.on('click', '[data-fn="delSort"]', (e) => {
                $(e.target).parents('.sort').remove();
                let count = $root.find('.sort').length;
                if (count === 0) {
                    $root.append(`<div class="sort">
                    <div class="empty-data">暂无数据</div>
                    </div>`);
                }
            });
            $root.on('click', '[data-fn="addChild"]', (e) => {
                $(e.target).parents('.sort').find('.children').append(`
                <div class="child-item">
                    <div>
                        <label>App名称：</label>
                        <input type="text" data-fn="app" class="az-input" />
                    </div>
                    <div>
                        <label>App包名：</label>
                        <input type="text" data-fn="package" class="az-input" />
                    </div>
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
        if ($('.sensitive-app-root .empty-data').length === 0) {
            $('.sensitive-app-root .sort').each((i, el) => {
                let $el = $(el);
                let item: any = {};
                item.id = $el.attr('data-id');
                item.sort = $el.find('.sort-bar input').val();
                item.level = $el.find('.sort-bar select').val();
                item.children = [];
                $el.find('.child-item').each((i, child) => {
                    let $child = $(child);
                    let app = $child.find('input[data-fn="app"]').val();
                    let pkg = $child.find('input[data-fn="package"]').val();
                    item.children.push({ app, package: pkg });
                });
                data.push(item);
            });
        }
        // console.log(data);
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
                                $('.sensitive-app-root .sort')
                                    .find('.empty-data')
                                    .parent()
                                    .remove();
                                $('.sensitive-app-root').append(`
                        <div class="sort" data-id="${newId}">
                            <div class="sort-bar">
                                <label>分类：</label>
                                <input type="text" data-id="${newId}" class="az-input" />
                                <label>风险级别：</label>
                                <select data-id="${newId}" class="az-select">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                                <button type="button" data-fn="addChild" class="az-button">添加应用</button>
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
                    className="sensitive-app-root"
                    dangerouslySetInnerHTML={{ __html: this.state.html! }}
                ></div>
            </div>
        );
    }
}

export default SensitiveApp;
