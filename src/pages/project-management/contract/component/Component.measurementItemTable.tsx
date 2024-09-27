// MeasurementItemTable.tsx

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message } from 'antd';
import {MeasurementItemVO} from "@/model/project/Model.contract";
import {AddOrUpdateMeasurementItemRequest} from "@/model/project/Model.measurement-item";
import {
  addMeasurementItem,
  deleteMeasurementItem,
  updateMeasurementItem
} from "@/api/project-managerment/Api.measurement-item";


interface MeasurementItemTableProps {
  title: string;
  measurementItems: MeasurementItemVO[];
  onRefresh: () => void;
}


const MeasurementItemTable: React.FC<MeasurementItemTableProps> = ({
                                                                     title,
                                                                     measurementItems,
                                                                     onRefresh,
                                                                   }) => {
  const [data, setData] = useState<MeasurementItemVO[]>(measurementItems);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<MeasurementItemVO | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setData(measurementItems);
  }, [measurementItems]);

  const handleAddOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      const itemData: AddOrUpdateMeasurementItemRequest = {
        ...currentItem,
        ...values,
      }  as AddOrUpdateMeasurementItemRequest;
      if (currentItem?.id) {
        // 更新
        await updateMeasurementItem(itemData);
        message.success('更新成功');
      } else {
        // 添加
        await addMeasurementItem(itemData);
        message.success('添加成功');
      }
      // 刷新数据
      onRefresh();
      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMeasurementItem(id);
      message.success('删除成功');
      // 刷新数据
      onRefresh();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: '类型',
      dataIndex: 'itemType',
    },
    {
      title: '名称',
      dataIndex: 'itemName',
    },
    {
      title: '价格',
      dataIndex: 'itemPrice',
    },
    {
      title: '单位',
      dataIndex: 'itemUnit',
    },
    {
      title: '合同成本类型',
      dataIndex: 'contractCostType',
    },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
    },
    {
      title: '设计数量',
      dataIndex: 'designCount',
    },
    // 添加更多列
    {
      title: '操作',
      render: (_: any, record: MeasurementItemVO) => (
        <Space>
          <a
            onClick={() => {
              setCurrentItem(record);
              form.setFieldsValue(record);
              setModalOpen(true);
            }}
          >
            编辑
          </a>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id!)}>
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h3>{title}</h3>
      <Button
        type="primary"
        onClick={() => {
          setCurrentItem(null);
          form.resetFields();
          setModalOpen(true);
        }}
        style={{ marginBottom: 16 }}
      >
        添加
      </Button>
      <Table<MeasurementItemVO> columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <Modal
        title={currentItem ? '编辑' : '添加'}
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleAddOrUpdate}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="itemType" label="类型" rules={[{ required: true }]}>
            <Input placeholder="请输入类型" />
          </Form.Item>
          <Form.Item name="itemName" label="名称" rules={[{ required: true }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="itemPrice" label="价格" rules={[{ required: true }]}>
            <InputNumber placeholder="请输入价格" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="itemUnit" label="单位" rules={[{ required: true }]}>
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="contractCostType" label="合同成本类型">
            <Input placeholder="请输入合同成本类型" />
          </Form.Item>
          <Form.Item name="transactionType" label="交易类型">
            <Input placeholder="请输入交易类型" />
          </Form.Item>
          <Form.Item name="designCount" label="设计数量">
            <InputNumber placeholder="请输入设计数量" style={{ width: '100%' }} />
          </Form.Item>
          {/* 添加更多字段 */}
        </Form>
      </Modal>
    </>
  );
};

export default MeasurementItemTable;
