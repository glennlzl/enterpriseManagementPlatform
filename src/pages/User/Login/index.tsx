import { Footer } from '@/components';
import { hookUseDingTalkLogin } from '@/hooks/login/Hook.useDingTalkLogin';
import { LoginForm } from '@ant-design/pro-components';
import { Helmet, SelectLang, useIntl } from '@umijs/max';
import { createStyles } from 'antd-style';
import React, {useState} from 'react';
import Settings from '../../../../config/defaultSettings';
import {Spin} from "antd";

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Login: React.FC = () => {
  const { styles } = useStyles();
  const { handleDingTalkLogin } = hookUseDingTalkLogin();
  const [loading, setLoading] = useState(false);  // 用于管理 Spinner 的显示
  const intl = useIntl();

  const onFinish = async () => {
    setLoading(true);  // 开始加载，显示 Spinner
    try {
      await handleDingTalkLogin();
      setLoading(false);  // 登录完成，隐藏 Spinner
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);  // 登录完成，隐藏 Spinner
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin spinning={loading}> {/* 使用 Spin 组件包裹 LoginForm */}
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: '75vw',
            }}
            logo={<img alt="logo" src="/logo.svg" />}
            title="企业资产管理平台"
            subTitle={'xxx公司'}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={onFinish}  // 在 onFinish 中处理登录逻辑
          ></LoginForm>
        </Spin>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
