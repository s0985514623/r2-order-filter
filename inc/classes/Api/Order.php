<?php
/**
 * Order Api Register
 */

declare(strict_types=1);

namespace J7\R2OrderFilter\Api;

use J7\R2OrderFilter\Plugin;
use J7\WpUtils\Classes\WP;

/**
 * Class Order
 */
final class Order {
	use \J7\WpUtils\Traits\SingletonTrait;
	use \J7\WpUtils\Traits\ApiRegisterTrait;

	/**
	 * Constructor.
	 */
	public function __construct() {
		\add_action( 'rest_api_init', [ $this, 'register_api_product' ] );
	}

	/**
	 * Get APIs
	 *
	 * @return array<int, array{endpoint:string, method:string, permission_callback?:callable}>
	 * - endpoint: string
	 * - method: 'get' | 'post' | 'patch' | 'delete'
	 * - permission_callback : callable
	 */
	protected function get_apis() {
		return [
			[
				'endpoint'            => 'orders',
				'method'              => 'get',
				'permission_callback' => '__return_true', // TODO 應該是特定會員才能看
			],
			[
				'endpoint'            => 'accounting_orders',
				'method'              => 'get',
				'permission_callback' => '__return_true', // TODO 應該是特定會員才能看
			],
		];
	}

	/**
	 * Register orders API
	 *
	 * @return void
	 */
	public function register_api_product(): void {
		$this->register_apis(
		apis: $this->get_apis(),
		namespace: Plugin::$kebab,
		default_permission_callback: fn() => \current_user_can( 'manage_options' ),
		);
	}

	/**
	 * Get Order Callback
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 * @phpstan-ignore-next-line
	 */
	public function get_orders_callback( $request ) {
		// phpcs:@phpstan-ignore-next-line
		$params            = $request->get_query_params() ?? [];
		$params            = WP::sanitize_text_field_deep( $params, false );
		$search_product_id =isset($params['search_product_id'])?$params['search_product_id']:0;
		$initial_date      =isset($params['initial_date'])?$params['initial_date']:null;
		$final_date        =isset($params['final_date'])?$params['final_date']:null;
		// 使用 wc_get_orders 取得所有商品
		$args = [
			'limit'  => isset($params['posts_per_page'])?$params['posts_per_page']:-1, // -1 表示取得所有商品
			'paged'  => isset($params['page'])?$params['page']:1,
			'status' => [ 'completed', 'processing', 'on-hold' ],
		];
		// 如果有設定日期，則加入日期條件
		if ($initial_date && $final_date) {
			$args['date_created'] = $initial_date . '...' . $final_date;
		}

		// 取得訂單
		$orders =wc_get_orders($args);
		// 快速檢查符合資格的訂單
		$get_orders =[];
		// 檢查是否有商品
		if ($orders && \is_array($orders)) {
			// 如果傳入product_id，則只取得符合的訂單，否則取得所有訂單
			if ($search_product_id === 0) {
				$get_orders = $orders;
			} else {
				foreach ($orders as $order) {
					// 取得商品資料
					/** @var \WC_Order_Item_Product $item */
					foreach ($order->get_items() as $item_id => $item) {
						// 取得product_id
						$product_id = $item->get_product_id();
						if ($product_id === (int) $search_product_id) {
							$get_orders[] = $order;
							break;
						}
					}
				}
			}
		}

		// 格式化訂單資料
		$formate_orders = [];
		$index          = 0;
		foreach ($get_orders as $order) {
			// 取得商品資料 =>改寫整個迴圈
			/** @var \WC_Order_Item_Product $item */
			foreach ($order->get_items() as $item_id => $item) {

				// 取得product_id $product_id 即為parent_id
				$product_id = $item->get_product_id();
				// 取得商品資料
				$product = $item->get_product();
				// 只取得搜尋的商品資料以及加購大人小孩商品
				if ($search_product_id !== 0) {
					if ($product_id !== (int) $search_product_id&&$product->get_name() !== '大人'&&$product->get_name() !== '小孩') {
						continue;
					}
				}
				// 取得商品原始名稱
				if ($product && $product->is_type('variation')) {
					// 對於可變商品，取得父商品
					$parent_id = $product->get_parent_id();
					$parent_product = wc_get_product($parent_id);
					$original_name = $parent_product ? $parent_product->get_name() : $product->get_name();
				} else {
					// 對於一般商品直接取名稱
					$original_name = $product->get_name();
				}
				// 取得parent_product_id 和 parent_variation_id(如果為加購商品)
				$parent_product_id   = (int) $item->get_meta('parent_product_id');
				$parent_variation_id = (int) $item->get_meta('parent_variation_id');
				// 取得小孩資料
				$child_data = $this->get_child_info_array($item_id);
				// 取得大人資料
				$adult_data = $this->get_adult_info_array($item_id);
				// 取得訂單編號
				$order_number = $order->get_order_number();
				
				// 判断是否有小孩或大人数据
				$has_child_data = !empty($child_data) && count($child_data) > 0;
				$has_adult_data = !empty($adult_data) && count($adult_data) > 0;
				
				// 根据小孩資料数量创建多条记录
				if ($has_child_data) {
					foreach ($child_data as $i => $child) {
						// 格式化訂單資料
						$formate_orders[ $index ] = [
							// 訂單資料
							'product_name'    => $original_name,
							'number'          => $order_number,
							'edit_link'       => get_edit_post_link($order->get_id()), // 取得編輯連結
							'status'          => $order->get_status(),
							'status_label'    => wc_get_order_status_name($order->get_status()),
							// 家長資料
							'adult_name'      => $order->get_billing_first_name(),
							'adult_email'     => $order->get_billing_email(),
							'adult_phone'     => $order->get_billing_phone(),
							// 學員資料
							'key'             => $index,
							'group'           => $i > 0 ? 1 : 0, // 第一筆為0，其他為1
							'child_name'      => $child['child_name'] ?? '',
							'child_dietary'   => $child['child_dietary'] ?? '',
							'child_health_notes'=>$child['child_health_notes'] ?? '',
							'child_id_number' => $child['child_id_number'] ?? '',
							'child_dob'       => $child['child_dob'] ?? '',
							// 屬性資料
							'school'          => $item->get_meta('校區'),
							'series'          => $item->get_meta('pa_series'),
							'sessions'        => $item->get_meta('pa_sessions'),
							'ladder'          => $item->get_meta('pa_ladder'),
						];

						// 如果為大人及小孩商品,則更新屬性資料
						if ($product_id === 3943 || $product->get_name() === '小孩') {
							// 小孩則更新 parent 資料
							$formate_orders[ $index ]['adult_name']  = '';
							$formate_orders[ $index ]['adult_email'] = '';
							$formate_orders[ $index ]['adult_phone'] = '';
							$this->update_parent_attributes($order, $formate_orders, $index, $parent_product_id, $parent_variation_id);
						} elseif ($product_id === 3941 || $product->get_name() === '大人') {
							// 大人則更新 parent 資料
							if ($has_adult_data && isset($adult_data[0])) {
								$formate_orders[ $index ]['adult_name']  = $adult_data[0]['adult_name'] ?? '';
								$formate_orders[ $index ]['adult_email'] = $adult_data[0]['adult_email'] ?? '';
								$formate_orders[ $index ]['adult_phone'] = $adult_data[0]['adult_phone'] ?? '';
							}
							$this->update_parent_attributes($order, $formate_orders, $index, $parent_product_id, $parent_variation_id);
						}
						++$index;
					}
				} 
				// 根据大人資料数量创建多条记录
				else if ($has_adult_data) {
					foreach ($adult_data as $i => $adult) {
						// 格式化訂單資料
						$formate_orders[ $index ] = [
							// 訂單資料
							'product_name'    => $product->get_name(),
							'number'          => $order_number,
							'edit_link'       => get_edit_post_link($order->get_id()), // 取得編輯連結
							'status'          => $order->get_status(),
							'status_label'    => wc_get_order_status_name($order->get_status()),
							// 家長資料
							'adult_name'      => $adult['adult_name'] ?? '',
							'adult_email'     => $adult['adult_email'] ?? '',
							'adult_phone'     => $adult['adult_phone'] ?? '',
							// 學員資料
							'key'             => $index,
							'group'           => $i > 0 ? 1 : 0, // 第一筆為0，其他為1
							'child_name'      => '',
							'grade'           => '',
							'child_dietary'   => '',
							'child_id_number' => '',
							'child_dob'       => '',
							// 屬性資料
							'school'          => $item->get_meta('校區'),
							'series'          => $item->get_meta('pa_series'),
							'sessions'        => $item->get_meta('pa_sessions'),
							'ladder'          => $item->get_meta('pa_ladder'),
						];

						$this->update_parent_attributes($order, $formate_orders, $index, $parent_product_id, $parent_variation_id);
						++$index;
					}
				}
				else {
					// 沒有小孩資料或大人資料時，按照原有方式處理
					// 格式化訂單資料
					$formate_orders[ $index ] = [
						// 訂單資料
						'product_name'    => $product->get_name(),
						'number'          => $order_number,
						'edit_link'       => get_edit_post_link($order->get_id()), // 取得編輯連結
						'status'          => $order->get_status(),
						'status_label'    => wc_get_order_status_name($order->get_status()),
						// 家長資料
						'adult_name'      => $order->get_billing_first_name(),
						'adult_email'     => $order->get_billing_email(),
						'adult_phone'     => $order->get_billing_phone(),
						// 學員資料
						'key'             => $index,
						'group'           => 0,
						'child_name'      => '',
						'grade'           => '',
						'child_dietary'   => '',
						'child_id_number' => '',
						'child_dob'       => '',
						// 屬性資料
						'school'          => $item->get_meta('校區'),
						'series'          => $item->get_meta('pa_series'),
						'sessions'        => $item->get_meta('pa_sessions'),
						'ladder'          => $item->get_meta('pa_ladder'),
					];

					// 如果為大人及小孩商品,則更新屬性資料
					if ($product_id === 3943 || $product->get_name() === '小孩') {
						// 小孩則更新 parent 資料
						$formate_orders[ $index ]['adult_name']  = '';
						$formate_orders[ $index ]['adult_email'] = '';
						$formate_orders[ $index ]['adult_phone'] = '';
						$this->update_parent_attributes($order, $formate_orders, $index, $parent_product_id, $parent_variation_id);
					} elseif ($product_id === 3941 || $product->get_name() === '大人') {
						// 大人則更新 parent 資料
						$formate_orders[ $index ]['adult_name']  = '';
						$formate_orders[ $index ]['adult_email'] = '';
						$formate_orders[ $index ]['adult_phone'] = '';
						$this->update_parent_attributes($order, $formate_orders, $index, $parent_product_id, $parent_variation_id);
					}
					++$index;
				}
			}
		}

		// 取得 WooCommerce 訂單總數
		// $processing_orders       =wc_get_orders(
		// [
		// 'status' => [ 'completed', 'processing' ],
		// 'return' => 'ids',
		// 'limit'  => -1,
		// ]
		// );
		// $processing_orders_count = count(
		// \is_array($processing_orders) ? $processing_orders : []
		// );
		$response = new \WP_REST_Response(  $formate_orders  );
		// 設置headers x-wp-total
		// $response->header( 'X-WP-Total', strval($processing_orders_count) );
		return $response;
	}
	/**
	 * Get Accounting Orders Callback
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 * @phpstan-ignore-next-line
	 */
	public function get_accounting_orders_callback( $request ) {
		// phpcs:@phpstan-ignore-next-line
		$params             = $request->get_query_params() ?? [];
		$params             = WP::sanitize_text_field_deep( $params, false );
		$search_product_cat =isset($params['search_product_cat'])?$params['search_product_cat']:0;

		$initial_date =isset($params['initial_date'])?$params['initial_date']:null;
		$final_date   =isset($params['final_date'])?$params['final_date']:null;
		// 使用 wc_get_orders 取得所有商品
		$args = [
			'limit'  => isset($params['posts_per_page'])?$params['posts_per_page']:-1, // -1 表示取得所有商品
			'paged'  => isset($params['page'])?$params['page']:1,
			'status' => [ 'completed', 'processing', 'on-hold' ],
		];
		// 如果有設定日期，則加入日期條件
		if ($initial_date && $final_date) {
			$args['date_created'] = $initial_date . '...' . $final_date;
		}
		// 取得訂單
		$orders =wc_get_orders($args);
		// 快速檢查符合資格的訂單
		$get_orders =[];
		// 檢查是否有商品
		if ($orders && \is_array($orders)) {
			// 如果傳入search_product_cat，則只取得符合的訂單，否則取得所有訂單
			if ($search_product_cat === ''||empty($search_product_cat)) {
				$get_orders = $orders;
			} else {
				foreach ($orders as $order) {
					// 取得商品資料
					/** @var \WC_Order_Item_Product $item */
					foreach ($order->get_items() as $item_id => $item) {
						// 取得product
						$product_id = $item->get_product_id();
						$product    = wc_get_product($product_id);
						if ( $product ) {
							// 取得分類
							$terms = get_the_terms( $product_id, 'product_cat' );
							if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
								foreach ( $terms as $term ) {
									$top_category = $term;
									// 如果有父分類，開始往上查祖先
									if ( $term->parent ) {
										$ancestors = get_ancestors( $term->term_id, 'product_cat' );
										if ( ! empty( $ancestors ) ) {
											// 取得最上層的 term_id（陣列最後一個是最上層）
											$top_term_id  = end( $ancestors );
											$top_category = get_term( $top_term_id, 'product_cat' );
											if ($top_category->slug === $search_product_cat) {
												$get_orders[] = $order;
												break 2;// 跳出兩層迴圈
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		// 格式化訂單資料
		$formate_orders = [];
		$index          = 0;
		foreach ($get_orders as $order) {
			// 取得訂單編號
			$order_number = $order->get_order_number();
			// 付款日期(從訂單備註取得)
			$pay_date = '-';
			$args     = [
				'order_id' => $order->get_id(),
				'type'     => 'internal', // 只查系統/管理員備註（不含客戶備註）
			];
			$notes    = wc_get_order_notes( $args );
			foreach ( $notes as $note ) {
				// 只篩選系統新增的備註（user_id = 0）且內容包含 Vacc
				if ( $note->user_id == 0 && !is_null( $note->comment_content ) && strpos( $note->comment_content, 'Vacc' ) !== false ) {
					$pay_date = date( 'Y-m-d H:i', strtotime( $note->comment_date ) );
				}
			}
			// 訂單總額(從item->get_total()依序累加)
			$order_total = 0;
			// 訂單小計(從item->get_subtotal()依序累加)
			$order_subtotal = 0;
			// 訂單折扣(總額-小計)
			$order_discount = 0;
			// 取得折價券名稱
			$coupon_name  = '';
			$coupon_codes = $order->get_coupon_codes();
			if (!empty($coupon_codes)) {
				$coupon_name = implode( ', ', $coupon_codes );
			}

			// 小孩資料(用array儲存已利如果有多筆)
			$child_data_array = [];

			// 課程名稱(用array儲存已利如果有多筆)
			$product_name =[];

			// 屬性名稱(用array儲存已利如果有多筆)
			$variation_full_name = [];

			// 校區(用array儲存已利如果有多筆)
			$school = [];

			// 循環items
			/** @var \WC_Order_Item_Product $item */
			foreach ($order->get_items() as $item_id => $item) {
				// 取得商品資料
				$product    = $item->get_product();
				$child_data =[];
				// 如果為加購商品，則累積總額與小計
				if ($product->get_name() === '大人' || $product->get_name() === '小孩') {
					if ($product->get_name() === '小孩') {
						$child_info = $item->get_meta('_child_info');
						foreach ($child_info as $value) {
							// 轉換為 PHP 陣列
							$child_info_array = json_decode($value, true);
							$child_data[]     = $child_info_array['child_name'];
						}
					}
					$order_total    += $item->get_total();
					$order_subtotal += $item->get_subtotal();
					continue;
				}
				// 只取得符合商品分類的訂單
				if ($search_product_cat !== ''||!empty($search_product_cat)) {
					$is_conform = false;
					$product_id = $product->get_id();
					// 取得分類
					$terms = get_the_terms( $product_id, 'product_cat' );

					if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
						foreach ( $terms as $term ) {
							if ($term->slug === $search_product_cat) {
								$is_conform = true;
								break;
							}
							// 如果有父分類，則取得父分類的term
							if ( $term->parent ) {
								$ancestors = get_ancestors( $term->term_id, 'product_cat' );
								if ( ! empty( $ancestors ) ) {
									// 取得最上層的 term_id（陣列最後一個是最上層）
									$top_term_id = end( $ancestors );
									$top_term    = get_term( $top_term_id, 'product_cat' );
									if ($top_term->slug === $search_product_cat) {
										$is_conform = true;
										break;
									}
								}
							}
						}
						// 如果不符合分類，則跳過
						if (!$is_conform) {
							continue;
						}
					}
				}
				// 紀錄課程名稱
				// 如果為變化類型則取得原商品名稱
				if ($product->is_type( 'variation' ) ) {
					$parent_id      = $product->get_parent_id(); // 父商品的 ID
					$parent_product = wc_get_product( $parent_id ); // 取得父商品
					$parent_name    = $parent_product ? $parent_product->get_name() : '未知商品';

					$product_name[] =$parent_name;
				} else {
					$product_name[] = $item->get_name();
				}

				// 梯次(組合各屬性名稱)
				$variation_attributes = [];
				$meta_data            = $item->get_meta_data();
				foreach ( $meta_data as $meta ) {
					// 排除大人小孩資料
					if ( $meta->key === '_child_info'||$meta->key === '_adult_info'||$meta->key === '_reduced_stock') {
						continue;
					}
					$variation_attributes[] = $meta->value;
				}
				$variation_full_name[] = implode( ' - ', $variation_attributes );

				// 計算訂單總額
				$order_total    += $item->get_total();
				$order_subtotal += $item->get_subtotal();

				// 取得item meta 中的校區資料
				$school[] = $item->get_meta('校區');

				// 取得小孩資料
				$child_info = $item->get_meta('_child_info');

				foreach ($child_info as $value) {
					// 轉換為 PHP 陣列
					$child_info_array = json_decode($value, true);
					$child_data[]     = $child_info_array['child_name'];
				}
				$child_data_array[] =implode( ', ', $child_data );
			}
			// 格式化訂單資料
			$formate_orders[ $index ] = [
				// 訂單資料
				'key'                  => $index,
				'number'               => $index+1,
				'date'                 => $order->get_date_created()?$order->get_date_created()->date('m/d H:i'):'null',
				'order_number'         => $order_number,
				'edit_link'            => get_edit_post_link($order->get_id()), // 取得編輯連結
				'vAccount'             => get_post_meta( $order_number, '_newebpay_atm_vAccount', true ), // 藍新繳費帳號
				'total'                => $order_total, // 總額,只包含對應分類及加購商品的金額
				'pay_money'            => $order->get_total(), // (訂單總額)現金匯款支付
				'status'               => $order->get_status(),
				'status_label'         => wc_get_order_status_name($order->get_status()),
				'pay_date'             => $pay_date, // 付款日期
				'product_name'         => $product_name, // 課程名稱
				'variation_full_name'  => $variation_full_name, // 梯次
				'order_subtotal'       => $order_subtotal, // 小計(含加購商品不含折扣)
				'coupon_name'          => $coupon_name, // 折價券名稱
				'order_discount'       => $order_total - $order_subtotal, // 折扣
				'payment_source'       => $order->get_payment_method_title(), // 付款方式
				'note'                 => $order->get_customer_note(),
				'school'               => $school??'',
				'child_name'           => $child_data_array,
				'email'                => $order->get_billing_email(),
				'billing_invoice'      => $order->get_meta( 'billing_invoice' ),
				'billing_invoice_info' => $order->get_meta( 'billing_invoice_info' ),
			];
			++$index;
		}
		$response = new \WP_REST_Response(  $formate_orders );

		return $response;
	}
	/**
	 * Get Child Info Array
	 *
	 * @param int $item_id Item ID.
	 * @return array<string, string>
	 */
	public function get_child_info_array( $item_id ) {
		$child_info = wc_get_order_item_meta($item_id, '_child_info', true);
		//log
		// error_log(print_r($child_info, true));
		$child_data = [];

		if (!empty($child_info)) {
			foreach ($child_info as $value) {
				$child_info_array = json_decode($value, true);
				if (is_array($child_info_array)) {
					$child_data[] = $child_info_array;
				}
			}
		}

		return $child_data;
	}
	/**
	 * Get Adults Info Array
	 *
	 * @param int $item_id Item ID.
	 * @return array<string, string>
	 */
	public function get_adult_info_array( $item_id ) {
		$adult_info = wc_get_order_item_meta($item_id, '_adult_info', true);
		$adult_data = [];

		if (!empty($adult_info)) {
			foreach ($adult_info as $value) {
				$adult_info_array = json_decode($value, true);
				if (is_array($adult_info_array)) {
					$adult_data[] = $adult_info_array;
				}
			}
		}

		return $adult_data;
	}
	/**
	 * Update Parent Attributes(加購大人/小孩更新屬性資料)
	 *
	 * @param \WC_Order         $order Order.
	 * @param array<int, array> $formate_orders Formate Orders.參考傳遞
	 * @param int               $index Index.
	 * @param int               $parent_product_id Parent Product ID.
	 * @param int               $parent_variation_id Parent Variation ID.
	 * @return void
	 */
	public function update_parent_attributes( $order, &$formate_orders, $index, $parent_product_id, $parent_variation_id ) {
		/** @var \WC_Order_Item_Product $item */
		foreach ($order->get_items() as $item) {
			if ($item->get_product_id() === $parent_product_id && $item->get_variation_id() === $parent_variation_id) {
				$formate_orders[ $index ]['series']   = $item->get_meta('pa_series');
				$formate_orders[ $index ]['sessions'] = $item->get_meta('pa_sessions');
				$formate_orders[ $index ]['ladder']   = $item->get_meta('pa_ladder');
				break;
			}
		}
	}
}
