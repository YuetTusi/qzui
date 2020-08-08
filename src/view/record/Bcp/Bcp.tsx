import React, { FC } from 'react';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Title from '@src/components/title/Title';
import { StoreComponent } from '@src/type/model';
import { useMount } from '@src/hooks';
import './Bcp.less';

const { Item } = Form;

interface Prop extends StoreComponent {

};

/**
 * 生成BCP
 * @param props 
 */
const Bcp: FC<Prop> = (props) => {

    useMount(() => {
        const { cid, did } = props.match.params;
        console.log(cid);
        console.log(did);
    });

    return <div className="bcp-root">
        <Title
            okText="生成"
            returnText="返回">
            生成BCP
        </Title>
        <div className="scroll-container">
            <div className="panel">
                <div className="sort-root">
                    <div className="sort">
                        <div className="title">案件相关</div>
                        <div className="content">
                            <Form>
                                <Item label="label">
                                    <Input />
                                </Item>
                            </Form>
                        </div>
                        <hr />
                        <div className="title">案件相关</div>
                        <div className="content">
                            内容区
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>;

};

export default Bcp;
