import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, theme } from 'antd';
import React from 'react';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({ title, href, index, desc }) => {
  const { useToken } = theme;

  const { token } = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      <a href={href} target="_blank" rel="noreferrer">
        了解更多 {'>'}
      </a>
    </div>
  );
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            欢迎使用 Rohhana 企业资产管理平台
          </div>
          <p
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            欢迎使用 Rohhana 企业资产管理平台 是一个整合了 人员管理，文件审批，资产管理等的企业级平台，帮助企业提高工作效率，降低管理成本。
          </p>
          {/*<div*/}
          {/*  style={{*/}
          {/*    display: 'flex',*/}
          {/*    flexWrap: 'wrap',*/}
          {/*    gap: 16,*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <InfoCard*/}
          {/*    index={1}*/}
          {/*    href="https://umijs.org/docs/introduce/introduce"*/}
          {/*    title="了解 umi"*/}
          {/*    desc="umi 是一个可扩展的企业级前端应用框架,umi 以路由为基础的，同时支持配置式路由和约定式路由，保证路由的功能完备，并以此进行功能扩展。"*/}
          {/*  />*/}
          {/*  <InfoCard*/}
          {/*    index={2}*/}
          {/*    title="了解 ant design"*/}
          {/*    href="https://ant.design"*/}
          {/*    desc="antd 是基于 Ant Design 设计体系的 React UI 组件库，主要用于研发企业级中后台产品。"*/}
          {/*  />*/}
          {/*  <InfoCard*/}
          {/*    index={3}*/}
          {/*    title="了解 Pro Components"*/}
          {/*    href="https://procomponents.ant.design"*/}
          {/*    desc="ProComponents 是一个基于 Ant Design 做了更高抽象的模板组件，以 一个组件就是一个页面为开发理念，为中后台开发带来更好的体验。"*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
