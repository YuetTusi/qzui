import React, { Component } from 'react';
import Loading from '@src/components/loading/Loading';

interface IProp { }
interface IState {
    page: any;
}

interface ILoadParameter {
    (): Promise<any>;
}

/**
 * @description 动态路由
 * @param load 加载路由回调，返回路由Promise
 */
function dynamicRoute(load: ILoadParameter) {
    class ProxyRoute extends Component<IProp, IState> {
        constructor(props: any) {
            super(props);
            this.state = {
                page: null
            };
        }
        componentDidMount() {
            if (load) {
                load()
                    .then((m: any) => {
                        this.setState({
                            page: m.default ? m.default : m
                        });
                    })
                    .catch((err: Error) => {
                        this.setState({
                            page: null
                        });
                        console.error("路由加载失败");
                        console.log(err.message);
                    });
            }
        }
        render() {
            let { page: Page } = this.state;
            if (Page) {
                return <Page />;
            } else {
                return <Loading show="true" />;
            }
        }
    }
    return ProxyRoute;
}

export { dynamicRoute };