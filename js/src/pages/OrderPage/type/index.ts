export type OrdersDataArray = {
	key?: React.Key
	number?: string
	date?: string
	total?: string
	note?: string
	addChild?: number
	addGrownUp?: number
	addVideo?: number
	addPhoto?: number
	products?:Product[]
	billing?:{
		billing_kid_name_one?: string
		billing_kid_name_two?: string
		billing_kid_name_three?: string
		billing_gender_one?: string
		billing_gender_two?: string
		billing_gender_three?: string
		billing_grade_one?: string
		billing_grade_two?: string
		billing_grade_three?: string
		billing_birthday_one?: string
		billing_birthday_two?: string
		billing_birthday_three?: string
		billing_kid_id_one?: string
		billing_kid_id_two?: string
		billing_kid_id_three?: string
		billing_food_preferences_one?: string
		billing_food_preferences_two?: string
		billing_food_preferences_three?: string
		billing_emergency_contact_name?: string
		billing_emergency_contact_phone?: string
		billing_parent_line_id?: string
		billing_line_name?: string
		billing_is_group_registration?: string
		billing_source?: string
	}
}
export type Product ={
	id: number
	name: string
	qty: number
	attributes_string: string
}

export type ProductDataArray ={
	id: number
	title: string
}