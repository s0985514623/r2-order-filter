export type AccountingDataArray = {
	key?: React.Key
	product_name?: string[]
	number?: number
	vAccount?: string
	order_number?: string
	edit_link?: string
	status_label?: string
	pay_date?: string
	pay_money?: string
	variation_full_name?: string[]
	order_subtotal?: number
	order_discount?: number
	coupon_name?: string
	total?: number
	payment_source?: string
	note?: string
	school?: string[]
	child_name?: string[]
	email?: string
	billing_invoice?: string
	billing_invoice_info?: string
	[key: string]: string[] | string | number | React.Key | undefined
}

export type TAttributesFilter={
	series?: string[]
	sessions?: string[]
	ladder?: string[]
	[key: string]:string[]|undefined
}
export type Product ={
	id: number
	name: string
	qty: number
	attributes_string: string
	series_value: string
}

export type ProductDataArray ={
	id: number
	title: string
}