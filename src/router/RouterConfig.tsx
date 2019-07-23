import React from 'react';
import { Router, Switch, Route } from 'dva/router';
import { dynamicRoute } from './DynamicRoute';
import Default from '@src/view/Default';
// import profileModel from '@src/model/profile';

interface IConfig {
    app: any;
    history: any;
}

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
                path="/profile"
                exact={true}
                render={() => {
                    // app.model(profileModel); //注册Model
                    const Dynamic = dynamicRoute(() => import('../view/Profile'))
                    return <Dynamic />
                }
                }
            />
            <Route
                path="/test"
                exact={true}
                render={() => {
                    const Dynamic = dynamicRoute(() => import('../view/Test'))
                    return <Dynamic />
                }
                }
            />
        </Switch>

    </Router>
}

export { RouterConfig };