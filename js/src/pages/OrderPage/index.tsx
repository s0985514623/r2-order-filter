import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag } from 'antd'
import Filter from 'components/Filter'
import { exportCSV } from 'hooks/useExportCSV'
import { useGetList } from '@/hooks/useGetList'
import dayjs from 'dayjs'
import type { OrdersDataArray, Product } from './type'

const MemberPage: React.FC = () => {
	const [filter, setFilter] = useState({
		initial_date: dayjs().add(-30, 'd').format('YYYY-MM-DD'),
		final_date: dayjs().format('YYYY-MM-DD'),
		variable_product_ids: [],
	})
	const {
		fetchData,
		data: ordersData,
		isLoading,
	} = useGetList<OrdersDataArray>({
		resource: 'orders',
	})
	const [productsFilters, setProductsFilters] = useState<any[]>([])
	const [productsSeriesFilters, setProductsSeriesFilters] = useState<any[]>([])
	console.log('🚀 ~ ordersData:', ordersData)

	const [
		selectedRowKeys,
		setSelectedRowKeys,
	] = useState<React.Key[]>([])
	const [
		selectedRowsArray,
		setSelectedRowsArray,
	] = useState<OrdersDataArray[]>([])

	//匯出CSV處理
	const { loading, handleExportCSV } = exportCSV()

	//處理Table選擇
	const onSelectChange = (
		newSelectedRowKeys: React.Key[],
		selectedRows: OrdersDataArray[],
	) => {
		// console.log("🚀 ~ newSelectedRowKeys:", newSelectedRowKeys)
		// console.log("🚀 ~ selectedRows:", selectedRows)
		setSelectedRowKeys(newSelectedRowKeys)
		setSelectedRowsArray(selectedRows)
	}
	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
	}
	const hasSelected = selectedRowKeys.length > 0

	//處理Filter返回的資料
	const handleFilterChange = (newFilter: any) => {
		// setFilter(newFilter) // 更新父组件的筛选条件
		// console.log(newFilter)
		setFilter({
			initial_date: newFilter.dateRange[0].format('YYYY-MM-DD'),
			final_date: newFilter.dateRange[1].format('YYYY-MM-DD'),
			variable_product_ids: newFilter.products ?? undefined,
		})
		fetchData({
			pagination: {
				current: 1,
				pageSize: -1,
			},
			filter: {
				initial_date: newFilter.dateRange[0].format('YYYY-MM-DD'),
				final_date: newFilter.dateRange[1].format('YYYY-MM-DD'),
				variable_product_ids: newFilter.products ?? undefined,
			},
		})
		// setFxnOrdersData(filterData)
	}
	// 從資料中獲取商品欄的唯一值 = 篩選用
	const getUniqueFilters = () => {
		// 展平了多維陣列
		const products = ordersData?.flatMap((item) =>
			item?.products?.map((product) => ({
				text: product.attributes_string,
				value: product.id,
			})),
		)
		// 使用 Map 進行去重，再用values() 取值，轉回陣列
		const uniqueProducts = [
			...new Map(products.map((product) => [product?.value, product])).values(),
		]
		return uniqueProducts.map((value) => ({
			text: value?.text,
			value: value?.value as React.Key,
		}))
	}
	// 新增系列欄位篩選值
	const getUniqueSeriesFilters = () => {
		// 展平了多維陣列
		const products = ordersData?.flatMap((item) =>
			item?.products?.map((product) => ({
				text: product.series_value,
				value: product.id,
			})),
		)
		// 使用 Map 進行去重，再用values() 取值，轉回陣列
		const uniqueProducts = [
			...new Map(products.map((product) => [product?.value, product])).values(),
		]
		return uniqueProducts.map((value) => ({
			text: value?.text,
			value: value?.value as React.Key,
		}))
	}
	// Table 分頁、排序、篩選
	const handleTableChange = (pagination: any, filters: any, sorter: any) => {}
	// 首次載入
	useEffect(() => {
		// fetchData({
		// 	pagination: pagination,
		// 	filter: filter,
		// })
	}, [])
	// 資料載入完畢後更新 pagination
	useEffect(() => {
		if (ordersData.length > 0)
		{
			setProductsFilters(getUniqueFilters())
			setProductsSeriesFilters(getUniqueSeriesFilters())
			}
	}, [isLoading])

	return (
		<div className="w-full relative">
			<h1>訂單篩選</h1>
			<div className="pr-5 flex flex-col gap-10">
				<Filter onFilter={handleFilterChange} />
				<Table
					rowSelection={rowSelection}
					dataSource={ordersData}
					pagination={false}
					onChange={handleTableChange}
					loading={isLoading}
					scroll={{ x: 'max-content' }}
					summary={(pageData) => {
						let totalGrownUp = 0
						let totalChild = 0
						let totalQty = 0
						let totalVideo = 0
						let totalPhoto = 0
						pageData.map((record) => {
							const addGrownUp = record.addGrownUp ?? 0
							const addChild = record.addChild ?? 0
							const addVideo = record.addVideo ?? 0
							const addPhoto = record.addPhoto ?? 0
							const productQty =
								record.products?.reduce(
									(accumulator: number, currentValue: Product) => {
										return accumulator + currentValue?.qty
									},
									0,
								) ?? 0
							totalGrownUp += addGrownUp
							totalChild += addChild
							totalVideo += addVideo
							totalPhoto += addPhoto
							totalQty += productQty
						})

						return (
							<Table.Summary.Row>
								<Table.Summary.Cell index={0}></Table.Summary.Cell>
								<Table.Summary.Cell index={1}>總計</Table.Summary.Cell>
								<Table.Summary.Cell index={2}></Table.Summary.Cell>
								<Table.Summary.Cell index={3}></Table.Summary.Cell>
								<Table.Summary.Cell index={4}></Table.Summary.Cell>
								<Table.Summary.Cell index={5}></Table.Summary.Cell>
								<Table.Summary.Cell index={6}>{totalQty}</Table.Summary.Cell>
								<Table.Summary.Cell index={7}>
									{totalGrownUp}
								</Table.Summary.Cell>
								<Table.Summary.Cell index={8}>{totalChild}</Table.Summary.Cell>
								<Table.Summary.Cell index={9}>{totalVideo}</Table.Summary.Cell>
								<Table.Summary.Cell index={10}>{totalPhoto}</Table.Summary.Cell>
							</Table.Summary.Row>
						)
					}}
				>
					<Table.Column title="訂單時間" dataIndex="date" width={125} />
					<Table.Column
						title="訂單編號"
						dataIndex="number"
						width={100}
						render={(number, record) => {
							return (
								<a href={`${record?.edit_link}`} target="_blank">
									{number}
								</a>
							)
						}}
					/>
					<Table.Column
						title="活動名稱"
						dataIndex="products"
						render={(products: Product[]) => {
							return (
								<Space size="small" wrap>
									{products.map((product) => (
										<Tag key={product.id}>{product.name}</Tag>
									))}
								</Space>
							)
						}}
					/>
					<Table.Column
					title="系列"
					dataIndex="products"
					render={(products: Product[]) => {
						return (
							<Space size="small" wrap>
								{products.map((product) => (
									<Tag key={product.id}>{product.series_value}</Tag>
								))}
							</Space>
						)
					}}
					filters={productsSeriesFilters}
					onFilter={(value, record) => {
						return record.products.some(
							(product: Product) => product.id === value,
						)
					}}
				/>
					<Table.Column
						title="場次梯次"
						dataIndex="products"
						render={(products: Product[]) => {
							return (
								<Space size="small" wrap>
									{products.map((product) => (
										<Tag key={product.id}>{product.attributes_string}</Tag>
									))}
								</Space>
							)
						}}
						filters={productsFilters}
						onFilter={(value, record) => {
							return record.products.some(
								(product: Product) => product.id === value,
							)
						}}
					/>
					<Table.Column
						width={125}
						title="數量"
						dataIndex="products"
						render={(products: Product[]) => {
							let totalQty = 0
							products.map((product) => {
								totalQty += product.qty
							})
							return <>{totalQty}</>
						}}
					/>
					<Table.Column
						width={125}
						title="加購商品大人"
						dataIndex="addGrownUp"
						render={(addGrownUp, record) => {
							const addGrownUpQty = addGrownUp ?? 0
							return addGrownUpQty
						}}
					/>
					<Table.Column
						width={125}
						title="加購商品小孩"
						dataIndex="addChild"
						render={(addChild, record) => {
							const addChildQty = addChild ?? 0
							return addChildQty
						}}
					/>
					<Table.Column
						width={150}
						title="加購商品活動影片"
						dataIndex="addVideo"
						render={(addChild, record) => {
							const addChildQty = addChild ?? 0
							return addChildQty
						}}
					/>
					<Table.Column
						width={150}
						title="加購商品活動相片"
						dataIndex="addPhoto"
						render={(addChild, record) => {
							const addChildQty = addChild ?? 0
							return addChildQty
						}}
					/>
					<Table.Column width={100} title="訂單金額" dataIndex="total" />
					<Table.Column
						width={125}
						title="家長LINE名稱"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_line_name
						}}
					/>
					<Table.Column
						width={125}
						title="家長LINE ID"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_parent_line_id
						}}
					/>
					<Table.Column
						width={125}
						title="家長手機號碼"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_emergency_contact_phone
						}}
					/>
					<Table.Column
						width={150}
						title="緊急聯絡人姓名"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_emergency_contact_name
						}}
					/>
					<Table.Column
						width={175}
						title="緊急聯絡人手機號碼"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_emergency_contact_phone
						}}
					/>
					<Table.Column
						width={125}
						title="小朋友1姓名"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_kid_name_one
						}}
					/>
					<Table.Column
						width={125}
						title="小朋友1性別"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_gender_one
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友1身分證號"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_kid_id_one
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友1出生年月日"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_birthday_one
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友1年級/年齡"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_grade_one
						}}
					/>
					<Table.Column
						width={150}
						title="食物需求1（葷、素、過敏食物）"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_food_preferences_one
						}}
					/>
					<Table.Column
						width={125}
						title="是否有團報"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_is_group_registration
						}}
					/>
					<Table.Column
						width={150}
						title="如何得知本活動"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_source
						}}
					/>
					<Table.Column width={200} title="備註" dataIndex="note" />
					<Table.Column
						width={125}
						title="小朋友2姓名"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_kid_name_two
						}}
					/>
					<Table.Column
						width={125}
						title="小朋友2性別"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_gender_two
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友2身分證號"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_kid_id_two
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友2出生年月日"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_birthday_two
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友2年級/年齡"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_grade_two
						}}
					/>
					<Table.Column
						width={150}
						title="食物需求2（葷、素、過敏食物）"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_food_preferences_two
						}}
					/>
					<Table.Column
						width={125}
						title="小朋友3姓名"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_kid_name_three
						}}
					/>
					<Table.Column
						width={125}
						title="小朋友3性別"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_gender_three
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友3身分證號"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_kid_id_three
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友3出生年月日"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_birthday_three
						}}
					/>
					<Table.Column
						width={150}
						title="小朋友3年級/年齡"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_grade_three
						}}
					/>
					<Table.Column
						width={150}
						title="食物需求3（葷、素、過敏食物）"
						dataIndex="billing"
						render={(billing) => {
							return billing?.billing_food_preferences_three
						}}
					/>
					{/* <Table.Summary>
						<Table.Summary.Cell index={4}>
							{ordersData.reduce((acc, cur) => {
								const addGrownUp = cur.addGrownUp ?? 0
								const addChild = cur.addChild ?? 0
								const productQty = cur.products?.reduce(
									(accumulator: number, currentValue: Product) => {
										return accumulator + currentValue?.qty
									},
									0,
								)
								return acc + addGrownUp + addChild + productQty
							}, 0)}
						</Table.Summary.Cell>
						<Table.Summary.Cell index={5}>
							{ordersData.reduce((acc, cur) => {
								const addGrownUp = cur.addGrownUp ?? 0
								const addChild = cur.addChild ?? 0
								const productQty = cur.products?.reduce(
									(accumulator: number, currentValue: Product) => {
										return accumulator + currentValue?.qty
									},
									0,
								)
								return acc + addGrownUp + addChild + productQty
							}, 0)}
						</Table.Summary.Cell>
					</Table.Summary> */}
				</Table>
			</div>
			<div className="exportMember" style={{ marginBottom: 16 }}>
				<Button
					type="primary"
					onClick={handleExportCSV(selectedRowsArray)}
					disabled={!hasSelected}
					loading={loading}
				>
					匯出訂單資料
				</Button>
				<span style={{ marginLeft: 8 }}>
					{hasSelected ? `已選擇 ${selectedRowKeys.length} 筆訂單` : ''}
				</span>
			</div>
		</div>
	)
}

export default MemberPage
