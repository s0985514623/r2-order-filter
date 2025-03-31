import { useState } from 'react'
import { apiUrl } from '@/utils'
import queryString from 'query-string'
import axios from 'axios'
import { kebab } from '@/utils/env'
/**
 * 透過 WordPress REST API 取得列表資料
 */
const wpApiSettings = window?.wpApiSettings || {}
const { stringify } = queryString
// 定義物件類型
type GetListParams = {
	resource: string
}
type fetchParams = {
	filter?: {
		initial_date?: string
		final_date?: string
		search_product_id?: string[]
		search_product_cat?: string
	}
	pagination?: {
		current: number
		pageSize?: number
		mode?: 'server' | 'client'
	}
}
export const useGetList = <T = any>({ resource }: GetListParams) => {
	const [data, setData] = useState<T[]>([])// 使用泛型 T
	const [total, setTotal] = useState<number>(0)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null) // 若需要處理錯誤狀態

	const fetchData = async ({ filter = {}, pagination }: fetchParams={}) => {
		// console.log("🚀 ~ fetchData ~ filter:", filter)
		setIsLoading(true) // 開始載入，設定 isLoading 為 true
		setError(null) // 每次呼叫時重置錯誤
		try {
			const url = `${apiUrl}/${kebab}/${resource}`

			const { current = 1, pageSize = 10, mode = 'server' } = pagination ?? {}

			const query: {
				page?: number
				posts_per_page?: number
			} = {}

			if (mode === 'server') {
				query.page = current
				query.posts_per_page = pageSize
			}

			const { data, headers } = await axios.get(
				`${url}?${stringify(query)}&${stringify(filter,{arrayFormat: 'bracket'})}`,
				{
					headers: {
						'X-WP-Nonce': wpApiSettings?.nonce || '',
						'Content-Type': 'application/json',
					},
				},
			)
			const total = headers?.['x-wp-total'] || data.length
			setData(data)
			setTotal(total)
		} catch (error) {
			setError('An error occurred while fetching data') // 捕捉錯誤
			console.error(error)
		} finally {
			setIsLoading(false) // 資料載入完畢，設定 isLoading 為 false
		}
	}

	return { data, total, isLoading, error, fetchData }
}
