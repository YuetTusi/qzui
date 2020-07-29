import React, { FC } from 'react';
import Button from 'antd/lib/button';

interface Prop {
    delHandle: () => void;
};

const ListHeader: FC<Prop> = (props) => {

    return <div className="list-header">
        <span>{props.children}</span>
        <Button
            onClick={() => props.delHandle()}
            type="danger"
            size="small"
        >清除</Button>
    </div>;

};

export default ListHeader;
