import React from 'react';
import { Form, Input, DatePicker, InputNumber, Select } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import {EmployeeSimpleInfoResponse} from "@/api/usermanagement";

interface ProjectInfoFormProps {
  form: FormInstance;
  employeeList: EmployeeSimpleInfoResponse[];
}

const { TextArea } = Input;
const { Option } = Select;

const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({ form, employeeList }) => {
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
        label="项目名称"
        name="name"
        rules={[{ required: true, message: '请输入项目名称' }]}
      >
        <Input placeholder="请输入项目名称" />
      </Form.Item>

      <Form.Item label="类型" name="type">
        <Input placeholder="请输入项目类型" />
      </Form.Item>

      <Form.Item label="施工单位" name="constructionOrganization">
        <Input placeholder="请输入施工单位" />
      </Form.Item>

      <Form.Item label="流水号" name="serialNumber">
        <InputNumber style={{ width: '100%' }} placeholder="请输入流水号" />
      </Form.Item>

      <Form.Item label="地区" name="region">
        <Input placeholder="请输入地区" />
      </Form.Item>

      <Form.Item label="项目地址" name="projectAddress">
        <Input placeholder="请输入项目地址" />
      </Form.Item>

      <Form.Item label="总投资" name="totalInvestment">
        <Input placeholder="请输入总投资" />
      </Form.Item>

      <Form.Item label="建造成本" name="buildingCost">
        <Input placeholder="请输入建造成本" />
      </Form.Item>

      <Form.Item label="计划工期" name="plannedDuration">
        <InputNumber style={{ width: '100%' }} placeholder="请输入计划工期（天）" />
      </Form.Item>

      <Form.Item label="投资类型" name="investmentType">
        <Input placeholder="请输入投资类型" />
      </Form.Item>

      <Form.Item
        label="开始日期"
        name="startDate"
        rules={[
          { required: true, message: '请选择开始日期' },
          { validator: validateStartEndDate },
        ]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="结束日期"
        name="endDate"
        rules={[
          { required: true, message: '请选择结束日期' },
          { validator: validateStartEndDate },
        ]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="项目描述" name="projectDescription">
        <TextArea placeholder="请输入项目描述" rows={3} />
      </Form.Item>

      <Form.Item label="合同日期" name="contractDate">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="工商注册地址" name="businessRegistrationAddress">
        <Input placeholder="请输入工商注册地址" />
      </Form.Item>

      <Form.Item label="项目状态" name="projectStatus">
        <Select placeholder="请选择项目状态">
          <Option value="未开始">未开始</Option>
          <Option value="进行中">进行中</Option>
          <Option value="已完成">已完成</Option>
        </Select>
      </Form.Item>

      <Form.Item label="监管级别" name="regulatoryLevel">
        <Input placeholder="请输入监管级别" />
      </Form.Item>

      <Form.Item label="技术级别" name="techLevel">
        <Input placeholder="请输入技术级别" />
      </Form.Item>

      <Form.Item label="位置" name="location">
        <Input placeholder="请输入位置" />
      </Form.Item>

      <Form.Item label="管理员列表" name="adminList">
        <Select
          mode="multiple"
          placeholder="请选择管理员"
          optionLabelProp="label"
          labelInValue
        >
          {employeeList.map((admin) => (
            <Option key={admin.id} value={admin.id} label={admin.name}>
              {admin.name}
            </Option>
          ))}
        </Select>
      </Form.Item>


      <Form.Item label="附件列表" name="attachmentList">
        {/* 可以使用上传组件 */}
        {/* <Upload ... /> */}
        <Input placeholder="请输入附件URL，用逗号分隔" />
      </Form.Item>
    </Form>
  );
};

export default ProjectInfoForm;
