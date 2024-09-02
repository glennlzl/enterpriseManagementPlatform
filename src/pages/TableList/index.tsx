import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import {
  FooterToolbar,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { useModel } from '@@/exports';
import UpdateForm from './components/UpdateForm';
import { useEmployeeManagement } from "@/hooks/user-management/Hook.useEmployeeManagement";
import { EmployeeInfoAddOrUpdateRequest } from "@/api/usermanagement"; // 更新表单组件路径

const TableList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { state, setState, actionRef, handleModalOpen, handleAdd, handleUpdate, fetchUsers, handleSyncSingle, handleSyncAll} = useEmployeeManagement(
    initialState.currentUser?.id || ''
  );

  const intl = useIntl();

  const columns = [
    {
      title: <FormattedMessage id="姓名" />,
      dataIndex: 'name',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="上级" />,
      dataIndex: 'managerName',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="手机" />,
      dataIndex: 'mobile',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="座机" />,
      dataIndex: 'telephone',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="工号" />,
      dataIndex: 'jobNumber',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="职位" />,
      dataIndex: 'title',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="办公地点" />,
      dataIndex: 'workPlace',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="邮箱" />,
      dataIndex: 'email',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="组织邮箱" />,
      dataIndex: 'orgEmail',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="状态" />,
      dataIndex: 'isIncumbent',
      hideInForm: true,
      valueEnum: {
        0: {
          text: <FormattedMessage id="已离职" />,
          status: 'Default',
        },
        1: {
          text: <FormattedMessage id="在职" />,
          status: 'Success',
        },
      },
    },
    {
      title: <FormattedMessage id="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleModalOpen('updateModalOpen', true);
            setState((prevState) => ({
              ...prevState,
              currentRow: record,
            }));
          }}
        >
          <FormattedMessage id="更新" />
        </a>,
      ],
    },
    {
      title: <FormattedMessage id="钉钉同步" />,
      dataIndex: 'dingdingSync',
      valueType: 'dingdingSync',
      render: (_, record) => [
        record.isUpdated && record.role >= 1 ? (
          <a
            key="sync"
            onClick={() => handleSyncSingle(record.userId)}
            style={{ marginLeft: 8 }}
          >
            <FormattedMessage id="同步钉钉" />
          </a>
        ) : null,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          filterType: 'query',
        }}
        cardBordered
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={async() => {
              await handleSyncAll();
            }}
          >
            <FormattedMessage id='同步钉钉' defaultMessage="同步钉钉" />
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen('createModalOpen', true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={async () => {
          const data = await fetchUsers();
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
      {state.selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{state.selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                {state.selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              setState((prevState) => ({
                ...prevState,
                selectedRowsState: [],
              }));
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage id="pages.searchTable.batchDeletion" defaultMessage="Batch deletion" />
          </Button>
          <Button type="primary">
            <FormattedMessage id="pages.searchTable.batchApproval" defaultMessage="Batch approval" />
          </Button>
        </FooterToolbar>
      )}
      <UpdateForm
        onSubmit={async (value) => {
          const selectedManager = state.employeeList.find(emp => emp.id === value.managerId);
          const fullData: EmployeeInfoAddOrUpdateRequest = {
            ...value, // 这里没有 state.currentRow，因为是创建操作
            managerName: selectedManager?.name || '',
          } as EmployeeInfoAddOrUpdateRequest;
          const success = await handleAdd(fullData);
          if (success) {
            handleModalOpen('createModalOpen', false);
            actionRef.current?.reload();
          }
        }}
        onCancel={() => {
          handleModalOpen('createModalOpen', false);
        }}
        updateModalOpen={state.createModalOpen} // 使用 createModalOpen 控制 modal 的打开状态
        values={{}} // 创建操作时没有初始值
        employeeList={state.employeeList} // 传递 employeeList
        type={'create'} // 传递 type 为 update
      />

      {/* 更新表单 */}
      <UpdateForm
        onSubmit={async (value) => {
          const selectedManager = state.employeeList.find(emp => emp.id === value.managerId);
          const fullData: EmployeeInfoAddOrUpdateRequest = {
            ...state.currentRow,
            ...value,
            managerName: selectedManager?.name || '',
          } as EmployeeInfoAddOrUpdateRequest;
          const success = await handleUpdate(fullData);
          if (success) {
            handleModalOpen('updateModalOpen', false);
            setState((prevState) => ({
              ...prevState,
              currentRow: undefined,
            }));
            actionRef.current?.reload();
          }
        }}
        onCancel={() => {
          handleModalOpen('updateModalOpen', false);
          setState((prevState) => ({
            ...prevState,
            currentRow: undefined,
          }));
        }}
        updateModalOpen={state.updateModalOpen} // 使用 updateModalOpen 控制 modal 的打开状态
        values={state.currentRow || {}} // 更新操作时使用 currentRow 作为初始值
        employeeList={state.employeeList} // 传递 employeeList
        type={'update'} // 传递 type 为 update
      />
    </PageContainer>
  );
};

export default TableList;
