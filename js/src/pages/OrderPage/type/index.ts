export type OrdersDataArray = {
	key?: React.Key
	product_name?: string
	number?: string
	edit_link?: string
	status_label?: string
	adult_name?: string
	adult_email?: string
	adult_phone?: string
	group?: number
	child_name?: string
	grade?: string
	child_dietary?: string
	child_id_number?: string
	child_dob?: string
	series?: string
	sessions?: string
	ladder?: string
	[key: string]: string | number | React.Key | undefined
}

export type TAttributesFilter={
	school?: string[]
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