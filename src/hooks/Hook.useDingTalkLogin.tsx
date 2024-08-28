/* eslint-disable */
import { loginWithAuth } from '@/services/ant-design-pro/api';
import { useModel } from '@@/exports';
import { useNavigate } from '@umijs/max';
import { message } from 'antd';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';

export const hookUseDingTalkLogin = () => {
  // 函数名称以 "use" 开头
  const { initialState, setInitialState } = useModel('@@initialState');
  const navigate = useNavigate();

  const handleDingTalkLogin = () => {
    const redirectUri = encodeURIComponent('http://127.0.0.1:8002/user/login'); // 替换为你配置的回调地址
    const client_id = 'dingwjfj1sx02steekvm';
    const url = `https://login.dingtalk.com/oauth2/auth?redirect_uri=${redirectUri}&response_type=code&client_id=${client_id}&scope=openid&state=dddd&prompt=consent`;
    window.location.href = url;
  };

  useEffect(() => {
    const urlParams = new URL(window.location.href);
    const code = urlParams.searchParams.get('authCode');
    if (code) {
      loginWithAuth(code)
        // .then((authentication) => {
        //   return initialState?.fetchUserInfo?.(authentication.userId);
        // })
        .then((userInfo) => {
          console.log('Fetched userInfo:', userInfo);
          if (userInfo) {
            flushSync(() => {
              setInitialState((s) => ({
                ...s,
                currentUser: userInfo,
              }));
            });
            message.success('登录成功！');
            navigate('/welcome'); // 使用 navigate 进行跳转
          } else {
            console.log('No userInfo returned');
          }
        })
        .catch((error) => {
          console.error('Error during login or fetching user info:', error);
        });
    }
  }, [navigate, initialState, setInitialState]);

  return { handleDingTalkLogin };
};
