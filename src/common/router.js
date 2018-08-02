import React, { createElement } from 'react';
import { Spin } from 'antd';
import pathToRegexp from 'path-to-regexp';
import Loadable from 'react-loadable';
import { getMenuData } from './menu';

let routerDataCache;
//在app_models中，model存在，不再遍历检查
//app._model含有namespace、state、reducers三个属性
const modelExisted = (app, model) => {
    return app._models.some(({ namespace }) => {
        return namespace === model.substring(model.lastIndexOf('/') + 1);
    });
};


const dynamicWrapper = (app, models, component) => {
    models.forEach(model => {
        //不存在则动态加载model
        if (!modelExisted(app, model)) {
            app.model(require(`../models/${model}`).default);
        }
    });

    // () => require('module')
    // transformed by babel-plugin-dynamic-import-node-sync
    // require引入模块
    if (component.toString().indexOf('.then(') < 0) {
        return (props) => {
            if (!routerDataCache) {
                routerDataCache = getRouterData(app);
            }
            //通过调用React原生方法createElement方法生成Component组件，并将routerData等属性注入到组件中，同时接受外部的props。
            //所有的路由组件都作为Route组件的子组件，也就是所有的路由组件都会被注入Route组件的基本属性props(match、location、history）
            //不管是通过render属性还是component属性，同时注入了routerData数据
            return createElement(component().default, {
                //传入routerData
                ...props,
                routerData: routerDataCache,
            });
        };
    }
    // () => import('module')
    //import引入模块
    return Loadable({
        loader: () => {
            if (!routerDataCache) {
                routerDataCache = getRouterData(app);
            }
            return component().then(raw => {
                const Component = raw.default || raw;
                return props =>
                    createElement(Component, {
                        ...props,
                        routerData: routerDataCache,
                    });
            });
        },
        loading: () => {
            return <Spin size="large" className="global-spin"/>;
        },
    });
};

/**
 * 1.将getMenuData()的结果(Array)转换成以path为key的对象数据（Object）
 * 2.通过递归调用，将getMenuData()的结果的父子层级结构的数据处理为平行数据。
 */
function getFlatMenuData(menus) {
    let keys = {};
    menus.forEach(item => {
        if (item.children) {
            keys[item.path] = { ...item };
            keys = { ...keys, ...getFlatMenuData(item.children) };
        } else {
            keys[item.path] = { ...item };
        }
    });
    return keys;
}


export const getRouterData = app => {
    const routerConfig = {
        '/': {
            component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
        },
        '/dashboard/analysis': {
            component: dynamicWrapper(app, ['chart'], () => import('../routes/Dashboard/Analysis')),
        },
        '/dashboard/monitor': {
            component: dynamicWrapper(app, ['monitor'], () => import('../routes/Dashboard/Monitor')),
        },
        '/dashboard/workplace': {
            component: dynamicWrapper(app, ['project', 'activities', 'chart'], () =>
                import('../routes/Dashboard/Workplace'),
            ),
            // hideInBreadcrumb: true,
            // name: '工作台',
            // authority: 'admin',
        },
        '/form/basic-form': {
            component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/BasicForm')),
        },
        '/form/step-form': {
            component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm')),
        },
        '/form/step-form/info': {
            name: '分步表单（填写转账信息）',
            component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step1')),
        },
        '/form/step-form/confirm': {
            name: '分步表单（确认转账信息）',
            component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step2')),
        },
        '/form/step-form/result': {
            name: '分步表单（完成）',
            component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/StepForm/Step3')),
        },
        '/form/advanced-form': {
            component: dynamicWrapper(app, ['form'], () => import('../routes/Forms/AdvancedForm')),
        },
        '/list/table-list': {
            component: dynamicWrapper(app, ['rule'], () => import('../routes/List/TableList')),
        },
        '/list/basic-list': {
            component: dynamicWrapper(app, ['list'], () => import('../routes/List/BasicList')),
        },
        '/list/card-list': {
            component: dynamicWrapper(app, ['list'], () => import('../routes/List/CardList')),
        },
        '/list/search': {
            component: dynamicWrapper(app, ['list'], () => import('../routes/List/List')),
        },
        '/list/search/projects': {
            component: dynamicWrapper(app, ['list'], () => import('../routes/List/Projects')),
        },
        '/list/search/applications': {
            component: dynamicWrapper(app, ['list'], () => import('../routes/List/Applications')),
        },
        '/list/search/articles': {
            component: dynamicWrapper(app, ['list'], () => import('../routes/List/Articles')),
        },
        '/profile/basic': {
            component: dynamicWrapper(app, ['profile'], () => import('../routes/Profile/BasicProfile')),
        },
        '/profile/advanced': {
            component: dynamicWrapper(app, ['profile'], () =>
                import('../routes/Profile/AdvancedProfile'),
            ),
        },
        '/result/success': {
            component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
        },
        '/result/fail': {
            component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
        },
        '/exception/403': {
            component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
        },
        '/exception/404': {
            component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
        },
        '/exception/500': {
            component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
        },
        '/exception/trigger': {
            component: dynamicWrapper(app, ['error'], () =>
                import('../routes/Exception/triggerException'),
            ),
        },
        '/user': {
            component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
        },
        '/user/login': {
            component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
        },
        '/user/register': {
            component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
        },
        '/user/register-result': {
            component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
        },
        // '/user/:id': {
        //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
        // },
    };
    //拿到菜单配置数组
    const menuData = getFlatMenuData(getMenuData());
    //循环routerConfig匹配menuData
    const routerData = {};
    Object.keys(routerConfig).forEach(path => {
        /**
         * 支持带参数的路由配置，案例如下:
         * 菜单中的path设置为/user/1,路由中的path设置为/user/:id
         * 如果直接使用 === 则判断结果为两者不匹配。
         * 需要借助path-to-regexp这个库来完成判断。
         */
        const pathRegexp = pathToRegexp(path);
        const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
        let menuItem = {};
        // If menuKey is not empty
        if (menuKey) {
            menuItem = menuData[menuKey];
        }
        let router = routerConfig[path];
        router = {
            ...router,
            name: router.name || menuItem.name,
            authority: router.authority || menuItem.authority,
            hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
        };
        routerData[path] = router;
    });
    return routerData;
};
