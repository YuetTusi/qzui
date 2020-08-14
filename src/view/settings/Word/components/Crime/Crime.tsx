import React, { Component, ChangeEvent, MouseEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import { CrimeState } from '@src/model/settings/Word/Crime';
import { helper } from '@src/utils/helper';


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

/**
 * 涉案词配置
 */
class Crime extends Component<Prop> {
    constructor(props: any) {
        super(props);
    }
    sortAdd = (e: MouseEvent<HTMLButtonElement>) => {
        const { dispatch } = this.props;
        dispatch!({
            type: 'crime/addSort', payload: {
                id: uuid(),
                sort: '',
                children: []
            }
        });
    }
    /**
     * 分类名称Change
     */
    sortChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { dispatch } = this.props;
        const { id } = e.target.dataset;
        const { value } = e.target;
        dispatch!({
            type: 'crime/updateSort', payload: {
                id,
                sort: value
            }
        });
    };
    /**
     * 删除分类
     */
    sortDelete = (e: MouseEvent<HTMLButtonElement>) => {
        const { dispatch } = this.props;
        const { id } = (e.target as any).dataset;
        dispatch!({
            type: 'crime/deleteSort', payload: id
        });
    }
    /**
     * 增加分类下的关键词
     */
    childAdd = (e: MouseEvent<HTMLButtonElement>) => {
        const { dispatch } = this.props;
        const { id } = (e.target as any).dataset;
        dispatch!({
            type: 'crime/addChild', payload: {
                id,
                value: ''
            }
        });
    }
    /**
     * 关键词Change
     */
    childBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const { dispatch } = this.props;
        const { id, index } = e.target.dataset;
        const { value } = e.target;
        // console.log(e.target);
        dispatch!({
            type: 'crime/updateChild', payload: {
                id, index, value
            }
        });
    }
    /**
     * 删除关键词
     */
    deleteChild = (e: MouseEvent<HTMLButtonElement>) => {
        const { dispatch } = this.props;
        const { id, index } = (e.target as any).dataset;
        dispatch!({
            type: 'crime/deleteChild', payload: {
                id, index
            }
        });
    }
    renderCrime = () => {
        const { crimes } = this.props.crime!;
        return crimes.map(i => <div>
            <div>
                <label>分类：</label>
                <Input
                    onChange={this.sortChange}
                    data-id={i.id}
                    key={i.id}
                    defaultValue={i.sort} />
                <Button data-id={i.id} onClick={this.childAdd} icon="plus-circle" type="primary">添加关键词</Button>
                <Button data-id={i.id} onClick={this.sortDelete} icon="minus-circle" type="primary">删除分类</Button>
            </div>
            <hr />
            <div>
                {this.renderChild(i.children, i.id)}
            </div>
        </div>);
    }
    /**
     * 渲染分类下的关键词
     * @param children 关键词Array
     * @param sortId 分类id
     */
    renderChild = (children: string[], sortId: string) => {
        return children.map((child, i) => <div key={helper.getKey()}>
            <Input
                //onChange={this.childChange}
                onBlur={this.childBlur}
                defaultValue={child}
                data-id={sortId}
                data-index={i} />
            <Button
                data-id={sortId}
                data-index={i}
                onClick={this.deleteChild}
                icon="minus-circle"
                type="primary" />
        </div>);
    }
    render(): JSX.Element {
        console.log(this.props.crime?.crimes);
        return <div>
            <div>
                <Button onClick={() => {
                    console.log(this.props.crime?.crimes);
                }}>OK</Button>
            </div>
            <div>
                <Button
                    onClick={this.sortAdd}
                    icon="plus-circle"
                    type="primary">添加分类</Button>
            </div>
            {this.renderCrime()}
        </div>
    }
}

export default connect((state: any) => ({ crime: state.crime }))(Crime);