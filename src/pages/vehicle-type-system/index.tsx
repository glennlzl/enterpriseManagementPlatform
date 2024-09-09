import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import type { VehicleType } from "@/model/vehicle-management-system";
import {addVehicleType, deleteVehicleType, queryVehicleTypes} from "@/api/vihicle-system";
import _ from "lodash";

const VehicleTypeManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const types = _.uniqBy(vehicleTypes.map(item => ({ text: item.vehicleType, value: item.vehicleType })), 'value');
  const serialsNumber = _.uniqBy(vehicleTypes.map(item => ({ text: item.vehicleSerialNumber, value: item.vehicleSerialNumber })), 'value');
  const brands = _.uniqBy(vehicleTypes.map(item => ({ text: item.vehicleBrand, value: item.vehicleBrand })), 'value');
  const capacities = _.uniqBy(vehicleTypes.map(item => ({ text: item.approvedLoadCapacity, value: item.approvedLoadCapacity })), 'value');


  // useEffect 用于初次加载数据
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      setLoading(true);
      try {
        const data = await queryVehicleTypes();
        setVehicleTypes(data);
      } catch (error) {
        message.error('加载数据失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleTypes();
  }, []);

  // 在新增或删除后重新加载数据
  const reloadTableData = async () => {
    setLoading(true);
    try {
      const data = await queryVehicleTypes();
      setVehicleTypes(data);
    } catch (error) {
      message.error('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicleType(id);
      message.success('删除成功');
      reloadTableData(); // 删除后重新加载数据
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await addVehicleType(values);
      message.success('新增成功');
      setModalVisible(false);
      form.resetFields();
      reloadTableData(); // 添加后重新加载数据
    } catch (error) {
      message.error('新增失败，请重试');
    }
  };

  const columns: ProColumns<VehicleType>[] = [
    {
      title: '车辆类型',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      filters: types,
      onFilter: (value, record) => record.vehicleType === value,
      filterSearch: true,
    },
    {
      title: '车辆型号',
      dataIndex: 'vehicleSerialNumber',
      key: 'vehicleSerialNumber',
      filters: serialsNumber,
      onFilter: (value, record) => record.vehicleSerialNumber === value,
      filterSearch: true,
    },
    {
      title: '车辆品牌',
      dataIndex: 'vehicleBrand',
      key: 'vehicleBrand',
      filters: brands,
      onFilter: (value, record) => record.vehicleBrand === value,
      filterSearch: true,
    },
    {
      title: '核定载质量',
      dataIndex: 'approvedLoadCapacity',
      key: 'approvedLoadCapacity',
      filters: capacities,
      onFilter: (value, record) => record.approvedLoadCapacity === value,
      filterSearch: true,
    },
    {
      title: '保养里程',
      dataIndex: 'maintenanceInterval',
      key: 'maintenanceInterval',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record) => (
          <a onClick={async () => {
            await handleDelete(record.id);
          }}>删除</a>
      ),
    },
  ];

  return (
    <>
      <ProTable<VehicleType>
        columns={columns}
        dataSource={vehicleTypes}
        loading={loading}
        actionRef={actionRef}
        rowKey="vehicleType"
        search={false}
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => setModalVisible(true)}
          >
            <PlusOutlined /> 新增车辆类型
          </Button>,
        ]}
      />

      <Modal
        title="新增车辆类型"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAdd}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="车辆类型"
            name="vehicleType"
            rules={[{ required: true, message: '请输入车辆类型' }]}
          >
            <Input placeholder="请输入车辆类型" />
          </Form.Item>
          <Form.Item
            label="车辆型号"
            name="vehicleSerialNumber"
            rules={[{ required: true, message: '请输入车辆型号' }]}
          >
            <Input placeholder="请输入车辆型号" />
          </Form.Item>
          <Form.Item
            label="车辆品牌"
            name="vehicleBrand"
            rules={[{ required: true, message: '请输入车辆品牌' }]}
          >
            <Input placeholder="请输入车辆品牌" />
          </Form.Item>
          <Form.Item
            label="核定载质量"
            name="approvedLoadCapacity"
          >
            <Input placeholder="请输入核定载质量" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VehicleTypeManagement;
