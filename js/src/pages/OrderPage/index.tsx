import React, { useState, useEffect } from 'react'
import { Table, Button, Empty } from 'antd'
import Filter from 'components/Filter'
import AttributesFilter from 'components/AttributesFilter'
import { exportCSV } from 'hooks/useExportCSV'
import { useGetList } from '@/hooks/useGetList'
import type { OrdersDataArray, TAttributesFilter } from './type'
import { columnsSetting } from './TableColumns'

const MemberPage: React.FC = () => {
	// 訂單資料
	const [filteredData, setFilteredData] = useState<OrdersDataArray[]>([])
	// 屬性篩選
	const [attributesFilter, setAttributesFilter] = useState<TAttributesFilter>({
		series: [],
		sessions: [],
		ladder: [],
	})

	// 取得訂單資料
	const {
		fetchData,
		data: ordersData,
		isLoading,
	} = useGetList<OrdersDataArray>({
		resource: 'orders',
	})

	// 選擇的資料
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

	//處理Table選擇，選擇的資料存入selectedRowKeys、selectedRowsArray以供匯出CSV使用
	const onSelectChange = (
		newSelectedRowKeys: React.Key[],
		selectedRows: OrdersDataArray[],
	) => {
		setSelectedRowKeys(newSelectedRowKeys)
		setSelectedRowsArray(selectedRows)
	}
	// Table 選擇
	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
	}
	// 是否有選擇
	const hasSelected = selectedRowKeys.length > 0

	//處理Filter返回的資料
	const handleFilterChange = (newFilter: any) => {
		fetchData({
			pagination: {
				current: 1,
				pageSize: -1,
			},
			filter: {
				initial_date: newFilter.dateRange[0].format('YYYY-MM-DD'),
				final_date: newFilter.dateRange[1].format('YYYY-MM-DD'),
				search_product_id: newFilter.products ?? undefined,
			},
		})
	}

	// 處理AttributesFilter
	const handleAttributesFilter = (values: any) => {
		if (!values.series && !values.sessions && !values.ladder)
			return setFilteredData(ordersData)

		const filtered = ordersData.filter((item) => {
			return Object.keys(values).every((key) => {
				// 如果 values[key] 為 undefined 或空陣列，跳過篩選
			if (values[key] === undefined || values[key].length === 0) return true
				return values[key]?.includes(item[key])
			})
		})
		setFilteredData(filtered)
	}
	// Table 分頁、排序、篩選
	const handleTableChange = (pagination: any, filters: any, sorter: any) => {}
	// 當ordersData有變動時,setFilteredData
	useEffect(() => {
		setFilteredData(ordersData)
		setAttributesFilter((prev) => {
			const newFilter = { ...prev }
			Object.keys(newFilter).forEach((key) => {
				ordersData.forEach((order) => {
					const value = order[key] as string
					if (value && !newFilter[key]?.includes(value)) {
						newFilter[key]?.push(value)
					}
				})
			})
			return newFilter
		})
	}, [ordersData])

	return (
		<div className="w-full relative">
			<h1>訂單篩選</h1>
			<div className="pr-5 flex flex-col gap-10">
				<Filter onFilter={handleFilterChange} />
				<AttributesFilter
					onFilter={handleAttributesFilter}
					attributesFilter={attributesFilter}
				/>
				<Table
					columns={columnsSetting}
					rowSelection={rowSelection}
					dataSource={filteredData}
					pagination={false}
					onChange={handleTableChange}
					loading={isLoading}
					scroll={{ x: 'max-content' }}
				></Table>
			</div>
			<div className="exportMember" style={{ marginBottom: 16, marginTop: 16 }}>
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
