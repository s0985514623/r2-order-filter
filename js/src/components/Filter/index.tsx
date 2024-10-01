import React, { useEffect } from 'react'
import { Collapse, Form, Select, Button, DatePicker } from 'antd'
import type { TimeRangePickerProps } from 'antd'
import dayjs from 'dayjs'
import { useGetList } from '@/hooks/useGetList'
import type {ProductDataArray} from '@/pages/OrderPage/type'

const { Option } = Select
const { RangePicker } = DatePicker
const rangePresets: TimeRangePickerProps['presets'] = [
	{ label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
	{ label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
	{ label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
	{ label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
]
const index: React.FC<{ onFilter: (values: any) => void }> = ({ onFilter }) => {
	const {
		fetchData,
		data: productsData,
		isLoading,
	} = useGetList<ProductDataArray>({ resource: 'products' })

	const [form] = Form.useForm()
	const handleOnFinish = (values: any) => {
		onFilter(values)
	}
	useEffect(() => {
		fetchData({
			pagination: {
				current: 1,
				pageSize: -1,
			},
		})
	}, [])
	const children = (
		<Form onFinish={handleOnFinish} layout="vertical" form={form}>
			<div className="grid grid-cols-2 gap-6">
				<Form.Item
					label="日期範圍"
					name="dateRange"
					initialValue={[dayjs().add(-30, 'd'), dayjs()]}
				>
					<RangePicker presets={rangePresets} className="w-full" />
				</Form.Item>
				<Form.Item label="活動" name="products">
					<Select placeholder="選擇活動" loading={isLoading}>
						{productsData.map((product) => (
							<Option key={product.id} value={product.id}>
								{product.title}
							</Option>
						))}
					</Select>
				</Form.Item>
			</div>
			<Form.Item className="mt-6">
				<Button type="primary" htmlType="submit" className="w-full">
					篩選
				</Button>
			</Form.Item>
		</Form>
	)

	return (
		<Collapse
			bordered={false}
			className="bg-white"
			defaultActiveKey={['filters']}
			items={[
				{
					key: 'filters',
					label: (
						<span className="font-semibold text-base relative -top-0.5">
							訂單篩選
						</span>
					),
					children,
				},
			]}
		/>
	)
}

export default index
