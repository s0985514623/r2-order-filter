import { useState } from 'react'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import {AccountingDataArray} from '@/pages/AccountingPage/type'
import dayjs ,{Dayjs}from 'dayjs'
export const exportCSV = () => {
	const [
		loading,
		setLoading,
	] = useState(false)
	const handleExportCSV = (selectedRowsArray: AccountingDataArray[],dateRange:[Dayjs,Dayjs]|null) => () => {
		setLoading(true)
		const today = dayjs().format('YYYY-MM-DD')
		const dateRangeStr = dateRange ? `${dateRange[0].format('YYYY-MM-DD')} ~ ${dateRange[1].format('YYYY-MM-DD')}` : ''
		const filenameStr = `${dateRangeStr} 篩選資料`
		// 转换数据，将嵌套的对象转换为适合CSV的字符串

		const transformedData = selectedRowsArray.map((order) => ({
			'#': order.number,
			'訂單編號': order.order_number,
			'虛擬繳款帳號': order.vAccount,
			'總額': order.total,
			'一般抵用金支付': '',
			'贈送抵用金支付': '',
			'手續費': '',
			'訂單狀態': order.status_label,
			'付款日期': order.pay_date,
			'子訂單編號': '',
			'課程名稱': order.product_name?.map((name) => name).join('\n'),
			'梯次': order.variation_full_name?.map((name) => name).join('\n'),
			'費用': order.order_subtotal,
			'折扣名稱': order.coupon_name,
			'折扣': order.order_discount,
			'折扣後金額': order.total,
			'付款源': order.payment_source,
			'總計': order.total,
			'備註': order.note,
			'加贈金額':'',
			'已使用一般抵用金':'',
			'已使用贈送抵用金':'',
			'校區': order.school?.map((name) => name).join('\n'),
			'小孩姓名': order.child_name?.map((name) => name).join('\n'),
			'統編': '',
			'公司名稱': '',
			'Email': order.email,
			'發票編號':'',
			'發票金額':'',
			'電子發票':order.billing_invoice,
			'載具編號或統一編號':order.billing_invoice_info,
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
