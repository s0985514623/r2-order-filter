import { useState } from 'react'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import { OrdersDataArray } from '@/pages/OrderPage/type'
import dayjs from 'dayjs'
export const exportCSV = () => {
	const [
		loading,
		setLoading,
	] = useState(false)
	const handleExportCSV = (selectedRowsArray: OrdersDataArray[]) => () => {
		setLoading(true)
		const today = dayjs().format('YYYY-MM-DD')
		const productName = selectedRowsArray[0].product_name
		const series = selectedRowsArray[0].series
		const sessions = selectedRowsArray[0].sessions
		const ladder = selectedRowsArray[0].ladder
		const filenameStr = `${today} ${productName} ${series}-${sessions}-${ladder} 篩選資料`
		// 转换数据，将嵌套的对象转换为适合CSV的字符串

		const transformedData = selectedRowsArray.map((order) => ({
			'姓名': order.child_name,
			'年級': order.grade,
			'健康/飲食': order.child_dietary,
			'身分證': order.child_id_number,
			'出生年月日': order.child_dob,
			'家長': order.adult_name,
			'聯絡電話': order.adult_phone,
			'Email': order.adult_email,
			'訂單編號': order.number,
			'繳費狀態': order.status_label,
		}))
		const csvConfig = mkConfig({
			filename: filenameStr,
			useKeysAsHeaders: true,
		})
		const csv = generateCsv(csvConfig)(transformedData)
		download(csvConfig)(csv)

		setLoading(false)
	}
	return { loading, handleExportCSV }
}
