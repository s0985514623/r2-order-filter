import React from 'react'
import { Collapse, Form, Select, Button, DatePicker } from 'antd'
import type { TimeRangePickerProps } from 'antd'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const rangePresets: TimeRangePickerProps['presets'] = [
	{ label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
	{ label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
	{ label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
	{ label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
]
const index: React.FC<{ onFilter: (values: any) => void }> = ({ onFilter }) => {

	const [form] = Form.useForm()
	const handleOnFinish = (values: any) => {
		onFilter(values)
	}
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
				<Form.Item label="分類" name="products_cat">
					<Select placeholder="選擇分類"
					 options={[
						{ value: 'camp', label: '營隊' },
						{ value: 'course', label: '週末課程' },
					]} />
				</Form.Item>
			</div>
			<Form.Item className="mt-6">
				<Button type="primary" htmlType="submit" className="w-full">
					送出
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
							Step1 取得訂單
						</span>
					),
					children,
				},
			]}
		/>
	)
}

export default index
