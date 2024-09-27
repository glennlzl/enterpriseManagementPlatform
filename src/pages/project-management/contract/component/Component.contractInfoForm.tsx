import React from 'react';
import {Form, Input, DatePicker, InputNumber, Select} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import {EmployeeSimpleInfoResponse} from "@/api/usermanagement";
import {ProjectInfoVO} from "@/model/project/Modal.project";

interface ContractInfoFormProps {
  form: FormInstance;
  employeeList: EmployeeSimpleInfoResponse[],
  projectList: ProjectInfoVO[];
}

const { TextArea } = Input;

const ContractInfoForm: React.FC<ContractInfoFormProps> = ({ form, employeeList, projectList }) => {
  // 自定义校验，确保开始日期早于结束日期
  const validateStartEndDate = (_: any, value: any) => {
    const startDate = form.getFieldValue('startDate');
    const endDate = form.getFieldValue('endDate');
    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
      return Promise.reject(new Error('开始日期不能晚于结束日期'));
    }
    return Promise.resolve();
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="合同名称"
        name="name"
        rules={[{ required: true, message: '请输入合同名称' }]}
      >
        <Input placeholder="请输入合同名称" />
      </Form.Item>

      <Form.Item label="合同编号" name="contractSerialNumber" rules={[{ required: true, message: '请输入合同编号'}]}>
        <Input placeholder="请输入合同编号" />
      </Form.Item>

      <Form.Item label="合同类型" name="type" rules={[{ required: true, message: '请输入合同类型'}]}>
        <Input placeholder="请输入合同类型" />
      </Form.Item>

      <Form.Item label="乙方" name="contractor" rules={[{ required: true, message: '请输入乙方信息'}]}>
        <Input placeholder="请输入乙方信息" />
      </Form.Item>

      <Form.Item label="合同金额" name="contractAmount" rules={[{ required: true, message: '请输入合同金额'}]}>
        <Input placeholder="请输入合同金额" />
      </Form.Item>

      <Form.Item
        label="开始日期"
        name="startDate"
        rules={[
          { validator: validateStartEndDate },
        ]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="结束日期"
        name="endDate"
        rules={[
          { validator: validateStartEndDate },
        ]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="合同序号" name="contractOrder">
        <InputNumber style={{ width: '100%' }} placeholder="请输入合同序号" />
      </Form.Item>

      <Form.Item label="合同临时价格" name="contractProvisionalPrice">
        <Input placeholder="请输入合同临时价格" />
      </Form.Item>

      <Form.Item label="合同期限类型" name="contractTermType">
        <Input placeholder="请输入合同期限类型" />
      </Form.Item>

      <Form.Item label="监理单位" name="supervisingOrganization">
        <Input placeholder="请输入监理单位" />
      </Form.Item>

      <Form.Item label="监测单位" name="monitoringOrganization">
        <Input placeholder="请输入监测单位" />
      </Form.Item>

      <Form.Item label="咨询单位" name="consultingOrganization">
        <Input placeholder="请输入咨询单位" />
      </Form.Item>

      <Form.Item label="账户名称" name="accountName">
        <Input placeholder="请输入账户名称" />
      </Form.Item>

      <Form.Item label="开户行" name="accountBank">
        <Input placeholder="请输入开户行" />
      </Form.Item>

      <Form.Item label="账号" name="accountNumber">
        <Input placeholder="请输入账号" />
      </Form.Item>


      <Form.Item label="财务负责人" name="financialResponsiblePerson">
        <Select
          placeholder="请选择财务负责人"
          optionLabelProp="label"
          labelInValue
        >
          {employeeList.map((emp) => (
            <Option key={emp.id} value={emp.mobile} label={emp.name} >
              {emp.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="关联项目ID" name="relatedProjectId" rules={[{ required: true, message: '请输入关联项目ID'}]}>
        <Select
          placeholder="请输入关联项目ID"
          optionLabelProp="label"
          labelInValue
        >
          {projectList.map((project) => (
            <Option key={project.id} value={project.id} label={project.name} >
              {project.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="合同内容" name="extend">
        <TextArea placeholder="请输入合同内容" rows={4} />
      </Form.Item>
    </Form>
  );
};

export default ContractInfoForm;
