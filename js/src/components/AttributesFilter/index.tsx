import React from 'react'
import { Collapse, Form, Select, Button } from 'antd'
import type {TAttributesFilter} from '@/pages/OrderPage/type'
import { nanoid } from 'nanoid';
const { Option } = Select

const index: React.FC<{ onFilter: (values: any) => void,attributesFilter:TAttributesFilter }> = ({ onFilter,attributesFilter }) => {
	const [form] = Form.useForm()
	const handleOnFinish = (values: any) => {
		onFilter(values)
	}
	const children = (
		<Form onFinish={handleOnFinish} layout="vertical" form={form}>
			<div className="grid grid-cols-3 gap-6">
				<Form.Item label="系列" name="series">
					<Select placeholder="選擇系列" allowClear>
						{attributesFilter?.series?.map((attributes) => (
							<Option key={nanoid()} value={attributes}>
								{attributes}
							</Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="場次" name="sessions">
				<Select placeholder="選擇系列" allowClear >
						{attributesFilter?.sessions?.map((attributes) => (
							<Option key={nanoid()} value={attributes}>
								{attributes}
							</Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="梯次" name="ladder">
				<Select placeholder="選擇系列" allowClear>
						{attributesFilter?.ladder?.map((attributes) => (
							<Option key={nanoid()} value={attributes}>
								{attributes}
							</Option>
						))}
					</Select>
				</Form.Item>
			</div>
			<Form.Item className="mt-6">
				<Button type="primary" htmlType="submit" className="w-full">
					屬性篩選
				</Button>
			</Form.Item>
		</Form>
	)

	return (
		<Collapse
			bordered={false}
			className="bg-white"
			defaultActiveKey={['']}
			items={[
				{
					key: 'filters',
					label: (
						<span className="font-semibold text-base relative">
							Step2 屬性篩選
						</span>
					),
					children,
				},
			]}
		/>
	)
}

export default index
