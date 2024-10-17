import React, {useState} from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
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
import _ from 'lodash';

const TableList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  if (!initialState?.currentUser) {
    return null; // 或者返回一个 loading 状态，或者重定向到登录页面
  }
  const { state, setState, actionRef, handleModalOpen, handleAdd, handleUpdate, fetchUsers, handleSyncSingle, handleSyncAll } = useEmployeeManagement(
    initialState.currentUser?.id || ''
  );

  const intl = useIntl();

  const [dataSource, setDataSource] = useState([]);

  const getColumns = (dataSource) => {
    const nameFilters = _.uniqBy(dataSource.map(item => ({ text: item.name, value: item.name })), 'value');
    const phoneFilters = _.uniqBy(dataSource.map(item => ({ text: item.mobile, value: item.mobile })), 'value');
    const managerNameFilters = _.uniqBy(dataSource.map(item => ({ text: item.managerName, value: item.managerName })), 'value');
    const jobNumberFilters = _.uniqBy(dataSource.map(item => ({ text: item.jobNumber, value: item.jobNumber })), 'value');
    const titleFilters = _.uniqBy(dataSource.map(item => ({ text: item.title, value: item.title })), 'value');
    const emailFilters = _.uniqBy(dataSource.map(item => ({ text: item.email, value: item.email })), 'value');
    const isIncumbentFilters = [
      { text: '在职', value: 1 },
      { text: '已离职', value: 0 },
    ];

    return [
      {
        title: <FormattedMessage id="姓名" />,
        dataIndex: 'name',
        valueType: 'textarea',
        filters: nameFilters,
        filterMultiple: true,
        filterSearch: true,
        onFilter: (value, record) => record.name === value,
        search: true,
      },
      {
        title: <FormattedMessage id="上级" />,
        dataIndex: 'managerName',
        valueType: 'textarea',
        filters: managerNameFilters,
        filterMultiple: true,
        filterSearch: true,
        onFilter: (value, record) => record.managerName === value,
        search: true,
      },
      {
        title: <FormattedMessage id="手机" />,
        dataIndex: 'mobile',
        valueType: 'textarea',
        filters: phoneFilters,
        filterMultiple: true,
        filterSearch: true,
        onFilter: (value, record) => record.mobile === value,
        search: true,
      },
      {
        title: <FormattedMessage id="工号" />,
        dataIndex: 'jobNumber',
        valueType: 'textarea',
        filters: jobNumberFilters,
        filterMultiple: true,
        filterSearch: true,
        onFilter: (value, record) => record.jobNumber === value,
        search: true,
      },
      {
        title: <FormattedMessage id="职位" />,
        dataIndex: 'title',
        valueType: 'textarea',
        filters: titleFilters,
        filterMultiple: true,
        filterSearch: true,
        onFilter: (value, record) => record.title === value,
        search: true,
      },
      {
        title: <FormattedMessage id="邮箱" />,
        dataIndex: 'email',
        valueType: 'textarea',
        filters: emailFilters,
        filterMultiple: true,
        filterSearch: true,
        onFilter: (value, record) => record.email === value,
        search: true,
      },
      {
        title: <FormattedMessage id="状态" />,
        dataIndex: 'isIncumbent',
        hideInForm: true,
        filters: isIncumbentFilters,
        filterMultiple: true,
        onFilter: (value, record) => record.isIncumbent == value,
        search: true,
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
          <FormattedMessage id="编辑" />
        </a>,
        record.isUpdated && typeof record.role !== 'undefined' && record.role >= 1 && record.userId !== null ? (
          <Tooltip
            title={
              <FormattedMessage
                id="点击同步钉钉"
                defaultMessage="当前人员信息已被管理员编辑过，如需同步选定人员最新钉钉信息，请点击按钮"
              />
            }
          >
            <a
              key="sync"
              onClick={() => {
                const employee = state.employeeList.find((emp) => emp.name === record.name);
                handleSyncSingle(employee?.userId);
              }}
              style={{ marginLeft: 8 }}
            >
              <FormattedMessage id="同步钉钉" />
            </a>
          </Tooltip>
        ) : null,
      ],
    }
  ];};

  return (
    <PageContainer>
      <ProTable
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        cardBordered
        toolBarRender={() => [
          <Tooltip title={<FormattedMessage id="点击同步钉钉" defaultMessage="当前部分人员信息已被管理员编辑过，如需同步最新钉钉信息，请点击按钮" />}>
            <Button
              type="primary"
              key="primary"
              onClick={async () => {
                await handleSyncAll(initialState.currentUser?.id || 0);
              }}
            >
              <FormattedMessage id='同步钉钉' defaultMessage="同步钉钉" />
            </Button>
          </ Tooltip>,
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
          setDataSource(data); // Store the fetched data in state
          return {
            data,
            success: true,
          };
        }}
        columns={getColumns(dataSource)}
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
