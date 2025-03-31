import React, { useState, useEffect } from 'react'
import { Table, Button, Typography  } from 'antd'
import Filter from 'components/Filter2'
import { exportCSV } from 'hooks/useExportAccCSV'
import { useGetList } from '@/hooks/useGetList'
import type { AccountingDataArray} from './type'
import { columnsSetting } from './TableColumns'
import type {Dayjs} from 'dayjs'


const MemberPage: React.FC = () => {
	// 訂單資料
	const [filteredData, setFilteredData] = useState<AccountingDataArray[]>([])
	// 紀錄時間
	const [dateRange, setDateRange] = useState<[Dayjs,Dayjs]|null>(null)
	// 取得訂單資料
	const {
		fetchData,
		data: ordersData,
		isLoading,
	} = useGetList<AccountingDataArray>({
		resource: 'accounting_orders',
	})
		// console.log("🚀 ~ accounting_orders:", ordersData)

	// 選擇的資料
	const [
		selectedRowKeys,
		setSelectedRowKeys,
	] = useState<React.Key[]>([])
	const [
		selectedRowsArray,
		setSelectedRowsArray,
	] = useState<AccountingDataArray[]>([])

	//匯出CSV處理
	const { loading, handleExportCSV } = exportCSV()

	//處理Table選擇，選擇的資料存入selectedRowKeys、selectedRowsArray以供匯出CSV使用
	const onSelectChange = (
		newSelectedRowKeys: React.Key[],
		selectedRows: AccountingDataArray[],
	) => {
		console.log("🚀 ~ newSelectedRowKeys:", newSelectedRowKeys)
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
		setDateRange(newFilter.dateRange)
		fetchData({
			pagination: {
				current: 1,
				pageSize: -1,
			},
			filter: {
				initial_date: newFilter.dateRange[0].format('YYYY-MM-DD'),
				final_date: newFilter.dateRange[1].format('YYYY-MM-DD'),
				search_product_cat: newFilter.products_cat ?? undefined,
			},
		})
	}

	// Table 分頁、排序、篩選
	const handleTableChange = (pagination: any, filters: any, sorter: any) => {}
	// 當ordersData有變動時,setFilteredData
	useEffect(() => {
		setFilteredData(ordersData)
	}, [ordersData])

	return (
		<div className="w-full relative">
			<h1>會計報表</h1>
			<div className="pr-5 flex flex-col gap-10">
				<Filter onFilter={handleFilterChange} />
				<Table
					columns={columnsSetting}
					rowSelection={rowSelection}
					dataSource={filteredData}
					pagination={false}
					onChange={handleTableChange}
					loading={isLoading}
					scroll={{ x: 'max-content' }}
					// summary={(filteredData) => {
					// 	let totalChild = 0
					// 	let totalAdult = 0
					// 	filteredData.forEach((order) => {
					// 		if(order?.child_name){
					// 			totalChild +=1
					// 		}
					// 		if(order?.adult_name){
					// 			totalAdult +=1
					// 		}
					// 	})
					// 	return (
					// 		<>
					// 			<Table.Summary.Row>
					// 				<Table.Summary.Cell index={0}>總計</Table.Summary.Cell>
					// 				<Table.Summary.Cell index={1}>小孩</Table.Summary.Cell>
					// 				<Table.Summary.Cell index={2} colSpan={4}>
					// 					<Text>{totalChild}</Text>
					// 				</Table.Summary.Cell>
					// 				<Table.Summary.Cell index={6}>大人</Table.Summary.Cell>
					// 				<Table.Summary.Cell index={7}>
					// 					<Text>{totalAdult}</Text>
					// 				</Table.Summary.Cell>
					// 			</Table.Summary.Row>
					// 		</>
					// 	);
					// }}
				></Table>
			</div>
			<div className="exportMember" style={{ marginBottom: 16, marginTop: 16 }}>
				<Button
					type="primary"
					onClick={handleExportCSV(selectedRowsArray,dateRange)}
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
