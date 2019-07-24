import React from 'react';
import { Router, Switch, Route } from 'dva/router';
import { dynamicRoute } from './DynamicRoute';
import Default from '@src/view/Default';
import userModel from '@src/model/user';
import { registerModel } from './registerModel';
// import Default from '@src/view/'
// import profileModel from '@src/model/profile';

/**
 * @description 动态路由配置
 * @param config dva配置对象
 */
function RouterConfig(props: any) {
    let { history, app } = props;

    return <Router history={history}>
        <Switch>
            <Route
                path="/"
                exact={true}
                component={Default}
            />
            <Route
                path="/user"
                render={() => {
                    registerModel(app, userModel); //注册model
                        const Dynamic = dynamicRoute(() => import('../view/user/Index'))
                        return <Dynamic />
                    }
                }
            />
            <Route
                path="/profile"
                render={() => {
                        const Dynamic = dynamicRoute(() => import('../view/Profile'))
                        return <Dynamic />
                    }
                }
            />
        </Switch>

    </Router>
}

export { RouterConfig };