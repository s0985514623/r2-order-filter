import type { ColumnsType } from 'antd/es/table'
import type { OrdersDataArray, Product } from './type'
import { Space, Tag } from 'antd'

export const columnsSetting: ColumnsType<OrdersDataArray> = [
	{
		title: '訂單時間',
		dataIndex: 'date',
		key: 'date',
	},
	{
		title: '訂單編號',
		dataIndex: 'number',
		key: 'number',
	},
	{
		title: '場次',
		dataIndex: 'products',
		key: 'products',
		render: (products: Product[]) => {
			return (
				<Space size="small" wrap>
					{products.map((product: any) => (
						<Tag key={product.id}>{product.name}</Tag>
					))}
				</Space>
			)
		},
	},
	{
		title: '大人',
		dataIndex: 'addGrownUp',
		key: 'addGrownUp',
		render: (addGrownUp, record) => {
			const addGrownUpQty =addGrownUp??0
			const recordQty = record?.products?.reduce(
				(accumulator, currentValue) => {
					return accumulator + currentValue?.qty
				},
				0,
			)
			return recordQty+addGrownUpQty
		},
	},
	{
		title: '小孩',
		dataIndex: 'addChild',
		key: 'addChild',
		render: (addChild, record) => {
			const addChildQty =addChild??0
			const recordQty = record?.products?.reduce(
				(accumulator, currentValue) => {
					return accumulator + currentValue?.qty
				},
				0,
			)
			return recordQty+addChildQty
		},
	},
	{
		title: '訂單金額',
		dataIndex: 'total',
		key: 'total',
	},
]
