import { hookUseDingTalkLogin } from '@/hooks/login/Hook.useDingTalkLogin';
import { history, useModel } from '@umijs/max';
import { Button, message } from 'antd';
import {useEffect, useState} from 'react';

const DingTalkLoginComponent = () => {
  // 使用 useModel 获取 initialState
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser, handleDingTalkLogin } = hookUseDingTalkLogin();
  const [loading, setLoading] = useState(false);

  // 监听 currentUser 的变化
  useEffect(() => {
    if (currentUser) {
      // 更新全局状态中的 currentUser
      setInitialState((prevInitialState) => ({
        ...prevInitialState,
        currentUser,
      }));

      // 显示欢迎信息并跳转
      message.success(`欢迎, ${currentUser.name}`);
      history.push('/dashboard'); // 或者跳转到你想要的页面
    }
  }, [currentUser, setInitialState, history]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {initialState?.currentUser ? (
        <div>
          <p>你好, {initialState.currentUser.name}</p>
          {/* 在这里展示更多用户信息或其他页面内容 */}
        </div>
      ) : (
        <Button type="primary" loading={loading} onClick={async () => {
          await handleDingTalkLogin();
        }}>
          使用钉钉登录
        </Button>
      )}
    </div>
  );
};

export default DingTalkLoginComponent;
