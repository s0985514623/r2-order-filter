import type { ColumnsType } from 'antd/es/table'
import type { AccountingDataArray } from './type'


export const columnsSetting: ColumnsType<AccountingDataArray> = [
	{
		title: '#',
		dataIndex: 'number',
		key: 'number',
	},
	{
		title: '訂單編號',
		dataIndex: 'order_number',
		key: 'order_number',
		// width: 200,
		render: (text, record) => (
			<a href={record.edit_link} target="_blank">
				{text}
			</a>
		),
	},
	{
		title: '虛擬繳款帳號',
		dataIndex: 'vAccount',
		key: 'vAccount',
	},
	{
		title: '總額',
		dataIndex: 'total',
		key: 'total',
	},
	{
		title: '一般抵用金支付',
		dataIndex: '',
		key: '',
	},
	{
		title: '贈送抵用金支付',
		dataIndex: '',
		key: '',
	},
	{
		title: '手續費',
		dataIndex: '',
		key: '',
	},
	{
		title: '訂單狀態',
		dataIndex: 'status_label',
		key: 'status_label',
	},
	{
		title: '付款日期',
		dataIndex: 'pay_date',
		key: 'pay_date',
	},
	{
		title: '子訂單編號',
		dataIndex: '',
		key: '',
	},
	{
		title: '課程名稱',
		dataIndex: 'product_name',
		key: 'product_name',
		render: (text, record) => text?.map((item:string) => <p>{item}</p>),
	},
	{
		title: '梯次',
		dataIndex: 'variation_full_name',
		key: 'variation_full_name',
		render: (text, record) => text?.map((item:string) => <p>{item}</p>),
	},
	{
		title: '費用',
		dataIndex: 'order_subtotal',
		key: 'order_subtotal',
	},
	{
		title: '折扣名稱',
		dataIndex: 'coupon_name',
		key: 'coupon_name',
	},
	{
		title: '折扣',
		dataIndex: 'order_discount',
		key: 'order_discount',
	},
	{
		title: '折扣後金額',
		dataIndex: 'total',
		key: 'total',
	},
	{
		title: '付款源',
		dataIndex: 'payment_source',
		key: 'payment_source',
	},
	{
		title: '總計',
		dataIndex: 'total',
		key: 'total',
	},
	{
		title: '備註',
		dataIndex: 'note',
		key: 'note',
	},
	{
		title: '加贈金額',
		dataIndex: '',
		key: '',
	},
	{
		title: '已使用一般抵用金',
		dataIndex: '',
		key: '',
	},
	{
		title: '已使用贈送抵用金',
		dataIndex: '',
		key: '',
	},
	{
		title: '校區',
		dataIndex: 'school',
		key: 'school',
		render: (text, record) => text?.map((item:string) => <p>{item}</p>),
	},
	{
		title: '小孩姓名',
		dataIndex: 'child_name',
		key: 'child_name',
		render: (text, record) => text?.map((item:string) => <p>{item}</p>),
	},
	{
		title: '統編',
		dataIndex: '',
		key: '',
	},
	{
		title: '公司名稱',
		dataIndex: '',
		key: '',
	},
	{
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
	},
	{
		title: '發票編號',
		dataIndex: '',
		key: '',
	},
	{
		title: '發票金額',
		dataIndex: '',
		key: '',
	},
	{
		title: '電子發票',
		dataIndex: 'billing_invoice',
		key: 'billing_invoice',
	},

	{
		title: '戴具編號或統一編號',
		dataIndex: 'billing_invoice_info',
		key: 'billing_invoice_info',
	},
]
