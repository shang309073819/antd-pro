import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';
import { getQueryPath } from './utils/utils';

const { ConnectedRouter } = routerRedux;
//获取路由权限组件
const { AuthorizedRoute } = Authorized;

//RouterConfig
function RouterConfig({ history, app }) {
    const routerData = getRouterData(app);
    const UserLayout = routerData['/user'].component;
    const BasicLayout = routerData['/'].component;
    return (
        <LocaleProvider locale={zhCN}>
            <ConnectedRouter history={history}>
                <Switch>
                    {/*user相关*/}
                    <Route path="/user" component={UserLayout}/>
                    {/*非user以外的路由*/}
                    <AuthorizedRoute
                        //其余参数与Route相同
                        path="/"
                        component={BasicLayout}
                        //没有权限登录
                        authority={['admin', 'user']}
                        //重定向
                        redirectPath={getQueryPath('/user/login', {
                            redirect: window.location.href,
                        })}
                    />
                </Switch>
            </ConnectedRouter>
        </LocaleProvider>
    );
}

export default RouterConfig;
