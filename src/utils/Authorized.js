//引入antd-design-pro的权限组件
import RenderAuthorized from 'ant-design-pro/lib/Authorized';
//获取当前权限信息
import { getAuthority } from './authority';
//初始化一个Authorized实例
let Authorized = RenderAuthorized(getAuthority());
//重新加载实例
const reloadAuthorized = () => {
    Authorized = RenderAuthorized(getAuthority());
};
export { reloadAuthorized };
export default Authorized;
