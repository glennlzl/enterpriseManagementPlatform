import React from 'react';
import { ProFormSelect } from '@ant-design/pro-components';
import { EmployeeSimpleInfoResponse } from "@/api/usermanagement";

interface ManagerSelectProps {
  employeeList: EmployeeSimpleInfoResponse[];
  name: string;
  label: string;
  required?: boolean;
  onChange?: (value: number, option: EmployeeSimpleInfoResponse) => void;
}

const ManagerSelect: React.FC<ManagerSelectProps> = ({ employeeList, name, label, required = false, onChange }) => {
  return (
    <ProFormSelect
      name={name}
      label={label}
      rules={[
        {
          required: required,
          message: `请选择${label}`,
        },
      ]}
      options={employeeList.map((employee) => ({
        label: employee.name,
        value: employee.id,
      }))}
      onChange={(value, option) => {
        const selectedManager = employeeList.find((emp) => emp.id === value);
        if (onChange && selectedManager) {
          onChange(value as number, selectedManager);
        }
      }}
    />
  );
};

export default ManagerSelect;
