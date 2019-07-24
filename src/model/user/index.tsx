import { IModel } from '@type/model';

let model: IModel = {
    namespace: 'user',
    state: {
        data: [{
            id: 1001,
            name: 'Tom'
        }, {
            id: 1002,
            name: 'Jack'
        }, {
            id: 1003,
            name: 'Peter'
        },{
            id: 1004,
            name: 'Kate'
        }]
    }
};

export default model;