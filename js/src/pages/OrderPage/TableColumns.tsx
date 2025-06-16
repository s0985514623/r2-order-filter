import type { ColumnsType } from 'antd/es/table'
import type { OrdersDataArray, Product } from './type'
import { Space, Tag } from 'antd'

export const columnsSetting: ColumnsType<OrdersDataArray> = [
  {
    title: '學員資料',
    children: [
      {
        title: '姓名',
        dataIndex: 'child_name',
        key: 'child_name',
        // width: 200,
      },
      // {
      //   title: '年級',
      //   dataIndex: 'grade',
      //   key: 'grade',
      // },
      {
        title: '健康/飲食',
        dataIndex: 'child_dietary',
        key: 'child_dietary',
      },
      {
        title: '健康備註',
        dataIndex: 'child_health_notes',
        key: 'child_health_notes',
      },

      {
        title: '身分證',
        dataIndex: 'child_id_number',
        key: 'child_id_number',
      },
      {
        title: '出生年月日',
        dataIndex: 'child_dob',
        key: 'child_dob',
      },
    ],
  },
  {
    title: '家長資料',
    children: [
      {
        title: '家長',
        dataIndex: 'adult_name',
        key: 'adult_name',
        // width: 200,
      },
      {
        title: '聯絡電話',
        dataIndex: 'adult_phone',
        key: 'adult_phone',
      },
      {
        title: 'Email',
        dataIndex: 'adult_email',
        key: 'adult_email',
      },
    ],
  },
  {
    title: '訂單資料',
    children: [
      {
        title: '訂單編號',
        dataIndex: 'number',
        key: 'number',
        // width: 200,
        render: (text, record) => (
          <a href={record.edit_link} target="_blank">{text}</a>
        ),
      },
      {
        title: '繳費狀態',
        dataIndex: 'status_label',
        key: 'status_label',
      },
    ]
  }

]
