import { isUrl } from '../utils/utils';

const menuData = [
    {
        name: 'dashboard',
        icon: 'dashboard',
        path: 'dashboard',
        children: [
            {
                name: '分析页',
                path: 'analysis',
            },
            {
                name: '监控页',
                path: 'monitor',
            },
            {
                name: '工作台',
                path: 'workplace',
                // hideInBreadcrumb: true,
                // hideInMenu: true,
            },
        ],
    },
    {
        name: '表单页',
        icon: 'form',
        path: 'form',
        children: [
            {
                name: '基础表单',
                path: 'basic-form',
            },
            {
                name: '分步表单',
                path: 'step-form',
            },
            {
                name: '高级表单',
                authority: 'admin',
                path: 'advanced-form',
            },
        ],
    },
    {
        name: '列表页',
        icon: 'table',
        path: 'list',
        children: [
            {
                name: '查询表格',
                path: 'table-list',
            },
            {
                name: '标准列表',
                path: 'basic-list',
            },
            {
                name: '卡片列表',
                path: 'card-list',
            },
            {
                name: '搜索列表',
                path: 'search',
                children: [
                    {
                        name: '搜索列表（文章）',
                        path: 'articles',
                    },
                    {
                        name: '搜索列表（项目）',
                        path: 'projects',
                    },
                    {
                        name: '搜索列表（应用）',
                        path: 'applications',
                    },
                ],
            },
        ],
    },
    {
        name: '详情页',
        icon: 'profile',
        path: 'profile',
        children: [
            {
                name: '基础详情页',
                path: 'basic',
            },
            {
                name: '高级详情页',
                path: 'advanced',
                authority: 'admin',
            },
        ],
    },
    {
        name: '结果页',
        icon: 'check-circle-o',
        path: 'result',
        children: [
            {
                name: '成功',
                path: 'success',
            },
            {
                name: '失败',
                path: 'fail',
            },
        ],
    },
    {
        name: '异常页',
        icon: 'warning',
        path: 'exception',
        children: [
            {
                name: '403',
                path: '403',
            },
            {
                name: '404',
                path: '404',
            },
            {
                name: '500',
                path: '500',
            },
            {
                name: '触发异常',
                path: 'trigger',
                hideInMenu: true,
            },
        ],
    },
    {
        name: '账户',
        icon: 'user',
        path: 'user',
        authority: 'guest',
        children: [
            {
                name: '登录',
                path: 'login',
            },
            {
                name: '注册',
                path: 'register',
            },
            {
                name: '注册结果',
                path: 'register-result',
            },
        ],
    },
];

/**
 * 完整的Path通过formatter生成的
 {
    icon:"dashboard",    //图标
    name:"dashboard",    //名称
    path:"/dashboard",   //路径
    children:[           //子集菜单集合
        {name: "分析页", path: "/dashboard/analysis"},
        {name: "监控页", path: "/dashboard/monitor"},
        {name: "工作台", path: "/dashboard/workplace"}
    ]
 }
 */

/**
 * 1.将path设置成完整的相对路径path(即父菜单的路径+子菜单的路径）
 * 2.获取当前菜单的权限，如果没有权限值，则继承父菜单的权限。其他属性保持不变。
 */
function formatter(data, parentPath = '/', parentAuthority) {
    return data.map(item => {
        let { path } = item;
        if (!isUrl(path)) {
            path = parentPath + item.path;
        }
        const result = {
            ...item,
            path,
            authority: item.authority || parentAuthority,
        };
        if (item.children) {
            result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
        }
        return result;
    });
}

export const getMenuData = () => formatter(menuData);
