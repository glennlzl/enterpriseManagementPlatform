import { ProFormSelect, ProFormText, StepsForm } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Modal } from 'antd';
import React from 'react';

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
              id: '人员更新',
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
          name: props.values.name,
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
          width="md"
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
        />
        <ProFormText
          name="managerId"
          width="md"
          label={intl.formatMessage({
            id: '上级',
            defaultMessage: '上级',
          })}
          rules={[
            {
              type: 'string',
            },
          ]}
        />
        <ProFormText
          name="mobile"
          width="md"
          label={intl.formatMessage({
            id: '手机',
            defaultMessage: '手机',
          })}
        />
        <ProFormText
          name="telephone"
          width="md"
          label={intl.formatMessage({
            id: '座机',
            defaultMessage: '座机',
          })}
        />
        <ProFormText
          name="jobNumber"
          width="md"
          label={intl.formatMessage({
            id: '工号',
            defaultMessage: '工号',
          })}
        />
        <ProFormText
          name="title"
          width="md"
          label={intl.formatMessage({
            id: '职位',
            defaultMessage: '职位',
          })}
        />
        <ProFormText
          name="workPlace"
          width="md"
          label={intl.formatMessage({
            id: '办公地点',
            defaultMessage: '办公地点',
          })}
        />
        <ProFormText
          name="orgEmail"
          width="md"
          label={intl.formatMessage({
            id: '组织邮箱',
            defaultMessage: '组织邮箱',
          })}
        />
        <ProFormText
          name="email"
          width="md"
          label={intl.formatMessage({
            id: '邮箱',
            defaultMessage: '邮箱',
          })}
        />
      </StepsForm.StepForm>
      <StepsForm.StepForm
        initialValues={{
          target: '0',
          template: '0',
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
          valueEnum={{
            0: '在职',
            1: '离职',
          }}
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default UpdateForm;
