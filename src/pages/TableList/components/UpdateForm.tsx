import React from 'react';
import { ProFormSelect, ProFormText, StepsForm } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal } from 'antd';
import ManagerSelect from './ManagerSelect'; // 引入 ManagerSelect 组件
import { EmployeeSimpleInfoVO } from "@/api/usermanagement";

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.EmployeeList>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalOpen: boolean;
  values: Partial<API.EmployeeList>;
  employeeList: EmployeeSimpleInfoVO[]; // 传入 employeeList
  type: 'create'  | 'update';
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();

  return (
    <StepsForm
      stepsProps={{
        size: 'small',
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            width={640}
            styles={{
              body: {
                padding: '32px 40px 48px',
              },
            }}
            destroyOnClose
            title={intl.formatMessage({
              id: props.type === 'create' ? '人员添加' : '人员更新',
            })}
            open={props.updateModalOpen}
            footer={submitter}
            onCancel={() => {
              props.onCancel();
            }}
          >
            {dom}
          </Modal>
        );
      }}
      onFinish={props.onSubmit}
    >
      <StepsForm.StepForm
        initialValues={{
          name: props.values.name || '',
          managerId: props.values.managerId || '',
          mobile: props.values.mobile || '',
          telephone: props.values.telephone || '',
          jobNumber: props.values.jobNumber || '',
          title: props.values.title || '',
          workPlace: props.values.workPlace || '',
          orgEmail: props.values.orgEmail || '',
          email: props.values.email || '',
        }}
        title={intl.formatMessage({
          id: 'pages.searchTable.updateForm.basicConfig',
          defaultMessage: '基本信息',
        })}
      >
        <ProFormText
          name="name"
          label={intl.formatMessage({
            id: 'pages.searchTable.updateForm.ruleName.nameLabel',
            defaultMessage: '人员',
          })}
          width="xl"
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.updateForm.ruleName.nameRules"
                  defaultMessage="请输入人员名称！"
                />
              ),
              type: 'string',
            },
          ]}
          readonly={props.type === 'update'}
        />
        <ManagerSelect
          employeeList={props.employeeList}
          name="managerId"
          label={intl.formatMessage({
            id: '上级',
            defaultMessage: '上级',
          })}
          required={true}
        />
        <ProFormText
          name="mobile"
          width="xl"
          label={intl.formatMessage({
            id: '手机',
            defaultMessage: '手机',
          })}
        />
        <ProFormText
          name="telephone"
          width="xl"
          label={intl.formatMessage({
            id: '座机',
            defaultMessage: '座机',
          })}
        />
        <ProFormText
          name="jobNumber"
          width="xl"
          label={intl.formatMessage({
            id: '工号',
            defaultMessage: '工号',
          })}
        />
        <ProFormText
          name="title"
          width="xl"
          label={intl.formatMessage({
            id: '职位',
            defaultMessage: '职位',
          })}
        />
        <ProFormText
          name="workPlace"
          width="xl"
          label={intl.formatMessage({
            id: '办公地点',
            defaultMessage: '办公地点',
          })}
        />
        <ProFormText
          name="orgEmail"
          width="xl"
          label={intl.formatMessage({
            id: '组织邮箱',
            defaultMessage: '组织邮箱',
          })}
        />
        <ProFormText
          name="email"
          width="xl"
          label={intl.formatMessage({
            id: '邮箱',
            defaultMessage: '邮箱',
          })}
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        initialValues={{
          isIncumbent: props.values.isIncumbent ?? '',
        }}
        title={intl.formatMessage({
          id: '更新状态',
        })}
      >
        <ProFormSelect
          name="isIncumbent"
          width="md"
          label={intl.formatMessage({
            id: '员工状态',
          })}
          options={[
            { label: '在职', value: 1 },
            { label: '离职', value: 0 },
          ]}
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default UpdateForm;
