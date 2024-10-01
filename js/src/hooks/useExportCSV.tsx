import { useState } from 'react'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import { OrdersDataArray } from '@/pages/OrderPage/type'

export const exportCSV = () => {
	const [
		loading,
		setLoading,
	] = useState(false)
	const handleExportCSV = (selectedRowsArray: OrdersDataArray[]) => () => {
		setLoading(true)

		// 转换数据，将嵌套的对象转换为适合CSV的字符串

		const transformedData = selectedRowsArray.map((order) => ({
			訂單時間: order.date,
			訂單編號: order.number,
			場次: order.products?.map((product) => product.name).join(', '),
			大人:
				(order?.addGrownUp ?? 0) +
				(order?.products?.reduce((acc, product) => acc + product.qty, 0) ?? 0),
			小孩:
				(order?.addChild ?? 0) +
				(order?.products?.reduce((acc, product) => acc + product.qty, 0) ?? 0),
			訂單金額: order.total,
			家長LINE名稱:order?.billing?.billing_line_name,
			'家長LINE ID':order?.billing?.billing_parent_line_id,
			家長手機:order?.billing?.billing_emergency_contact_phone,
			緊急聯絡人姓名:order?.billing?.billing_emergency_contact_name,
			緊急聯絡人電話:order?.billing?.billing_emergency_contact_phone,
			小朋友1姓名:order?.billing?.billing_kid_name_one,
			小朋友1性別: order?.billing?.billing_gender_one,
			小朋友1身分證號: order?.billing?.billing_kid_id_one,
			小朋友1生日: order?.billing?.billing_birthday_one,
			小朋友1年級: order?.billing?.billing_grade_one,
			小朋友1飲食需求: order?.billing?.billing_food_preferences_one,
			是否有團報: order?.billing?.billing_is_group_registration,
			如何得知本活動: order?.billing?.billing_source,
			備註: order.note,
			小朋友2姓名:order?.billing?.billing_kid_name_two,
			小朋友2性別: order?.billing?.billing_gender_two,
			小朋友2身分證號: order?.billing?.billing_kid_id_two,
			小朋友2生日: order?.billing?.billing_birthday_two,
			小朋友2年級: order?.billing?.billing_grade_two,
			小朋友2飲食需求: order?.billing?.billing_food_preferences_two,
			小朋友3姓名:order?.billing?.billing_kid_name_three,
			小朋友3性別:order?.billing?.billing_gender_three,
			小朋友3身分證號:order?.billing?.billing_kid_id_three,
			小朋友3生日:order?.billing?.billing_birthday_three,
			小朋友3年級:order?.billing?.billing_grade_three,
			小朋友3飲食需求:order?.billing?.billing_food_preferences_three,
		}))
		const csvConfig = mkConfig({
			filename: '訂單篩選資料',
			useKeysAsHeaders: true,
		})
		const csv = generateCsv(csvConfig)(transformedData)
		download(csvConfig)(csv)

		setLoading(false)
	}
	return { loading, handleExportCSV }
}
