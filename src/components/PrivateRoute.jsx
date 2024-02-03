import { Navigate, Outlet } from "react-router";
import { useAuthStatus } from "../hooks/useAuthStatus";
import Spinner from "./Spinner";

const PrivateRoute = () => {
  // const loggedIn = false; //We are redirected to the signin page as we manually put the log in to the false
  const { loggedIn, checkingStatus } = useAuthStatus();
  if (checkingStatus) {
    return <Spinner />;
  }
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
};
//1. outlet for adding the children inside
//2. navigate for redirect
//3. destructed two state from useAuthStatus
//4.
export default PrivateRoute;

/**
 *这段代码定义了一个名为 PrivateRoute 的函数组件，它用于保护需要登录才能访问的路由。让我们逐行解释它：

const PrivateRoute = () => { ... }: 这是一个函数组件的声明，命名为 PrivateRoute。

const { loggedIn, checkingStatus } = useAuthStatus();: 这一行使用了自定义的 useAuthStatus hook 来获取用户的登录状态 loggedIn 和检查状态 checkingStatus。根据这些状态，决定用户是否被允许访问受保护的路由。

if (checkingStatus) { return <Spinner />; }: 这个条件判断用于检查用户登录状态是否正在检查中。如果 checkingStatus 为真，表示正在检查用户的登录状态，那么就返回一个加载中的 Spinner 组件，以提示用户操作正在进行中。

return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;: 这是一个条件返回语句。如果 loggedIn 为真，表示用户已经登录，那么就渲染被保护的路由组件（通过 <Outlet />），否则就重定向用户到登录页面（通过 <Navigate to="/sign-in" />）。

总之，这段代码的作用是根据用户的登录状态决定是否允许访问受保护的路由。如果用户已登录，则允许访问，否则重定向到登录页面。在等待检查用户登录状态时，会显示一个加载中的 Spinner 组件，以提供用户友好的体验。
 */
