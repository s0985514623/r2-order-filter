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
		$params               = $request->get_query_params() ?? [];
		$params               = WP::sanitize_text_field_deep( $params, false );
		$variable_product_ids =isset($params['variable_product_ids'])?$params['variable_product_ids']:0;
		$initial_date         =isset($params['initial_date'])?$params['initial_date']:null;
		$final_date           =isset($params['final_date'])?$params['final_date']:null;
		// 使用 wc_get_orders 取得所有商品
		$args = [
			'limit'  => isset($params['posts_per_page'])?$params['posts_per_page']:-1, // -1 表示取得所有商品
			'paged'  => isset($params['page'])?$params['page']:1,
			'status' => [ 'completed', 'processing' ],
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
			if ($variable_product_ids === 0) {
				$get_orders = $orders;
			} else {
				foreach ($orders as $order) {
					// 取得商品資料
					/** @var \WC_Order_Item_Product $item */
					foreach ($order->get_items() as $item_id => $item) {
						// 取得商品物件
						/** @var \WC_Product $product */
						$product = $item->get_product();
						// 檢查商品是否為變化商品
						if ($product && $product->is_type('variation')) {
							// 取得變化商品的主商品 (父商品) ID
							$parent_id = $product->get_parent_id();
							// 如果商品符合，則記錄訂單並跳出迴圈
							if ($parent_id === (int) $variable_product_ids) {
								$get_orders[] = $order;
								break;

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
			$order_number             = $order->get_order_number();
			$formate_orders[ $index ] = [
				'key'       => $order_number,
				'number'    => $order_number,
				'edit_link' =>get_edit_post_link($order->get_id()), // 取得編輯連結
				'date'      => $order->get_date_created()?$order->get_date_created()->date('Y-m-d'):'null',
				'total'     => $order->get_total(),
				'note'      => $order->get_customer_note(),
				// 取得 Billing 欄位資料
				'billing'   =>[
					'billing_kid_name_one'            =>$order->get_meta('billing_kid_name_one'),
					'billing_gender_one'              =>$order->get_meta('billing_gender_one'),
					'billing_grade_one'               =>$order->get_meta('billing_grade_one'),
					'billing_birthday_one'            =>$order->get_meta('billing_birthday_one'),
					'billing_kid_id_one'              =>$order->get_meta('billing_kid_id_one'),
					'billing_food_preferences_one'    =>$order->get_meta('billing_food_preferences_one'),
					'billing_emergency_contact_name'  =>$order->get_meta('billing_emergency_contact_name'),
					'billing_emergency_contact_phone' =>$order->get_meta('billing_emergency_contact_phone'),
					'billing_parent_line_id'          =>$order->get_meta('billing_parent_line_id'),
					'billing_line_name'               =>$order->get_meta('billing_line_name'),
					'billing_is_group_registration'   =>$order->get_meta('billing_is_group_registration'),
					'billing_source'                  =>$order->get_meta('billing_source'),
					'billing_kid_name_two'            =>$order->get_meta('billing_kid_name_two'),
					'billing_gender_two'              =>$order->get_meta('billing_gender_two'),
					'billing_grade_two'               =>$order->get_meta('billing_grade_two'),
					'billing_birthday_two'            =>$order->get_meta('billing_birthday_two'),
					'billing_kid_id_two'              =>$order->get_meta('billing_kid_id_two'),
					'billing_food_preferences_two'    =>$order->get_meta('billing_food_preferences_two'),
					'billing_kid_name_three'          =>$order->get_meta('billing_kid_name_three'),
					'billing_gender_three'            =>$order->get_meta('billing_gender_three'),
					'billing_grade_three'             =>$order->get_meta('billing_grade_three'),
					'billing_birthday_three'          =>$order->get_meta('billing_birthday_three'),
					'billing_kid_id_three'            =>$order->get_meta('billing_kid_id_three'),
					'billing_food_preferences_three'  =>$order->get_meta('billing_food_preferences_three'),
				],
			];
			// 取得商品資料
			/** @var \WC_Order_Item_Product $item */
			foreach ($order->get_items() as $item_id => $item) {
				// 取得商品物件
				/** @var \WC_Product|\WC_Product_Variation $product */
				$product    = $item->get_product();
				$product_id = $product->get_id();
				// 改成只取得篩選的活動商品
				$parent_id = $product->get_parent_id();
				switch (true) {
					// 如果是大人或小孩，則記錄在parent_variation_id欄位上
					case $product_id === 3943 || $product->get_name() === '小孩':
						$parent_product_id = $item->get_meta('parent_product_id');
						if ( $variable_product_ids === $parent_product_id) {
							$formate_orders[ $index ]['addChild'] = ( $formate_orders[ $index ]['addChild'] ?? 0 ) + $item->get_quantity();
						}
						break;
					case $product_id === 3941 || $product->get_name() === '大人':
						$parent_product_id = $item->get_meta('parent_product_id');
						if ( $variable_product_ids === $parent_product_id) {
							$formate_orders[ $index ]['addGrownUp'] = ( $formate_orders[ $index ]['addGrownUp'] ?? 0 )+$item->get_quantity();
						}
						break;
					// 取得訂單資料與商品資料
					default:
						if ($parent_id && (int) $variable_product_ids === $parent_id && $product->is_type( 'variation' )) {
							$parent_product = wc_get_product( $parent_id );
							// 取得變體屬性
							$attributes        = $product->get_attributes();
							$attributes_values =[];
							foreach ($attributes as $key => $value) {
								$attributes_values[] = $value;
							}
							$attributes_string = \implode( ', ', $attributes_values );
							// 記錄商品資料
							$formate_orders[ $index ]['products'][] = [
								'id'                => $product_id,
								'name'              => $parent_product->get_name(),
								'attributes_string' => $attributes_string,
								'qty'               => $item->get_quantity(),
							];
						}

						break;
				}
			}
			++$index;
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
}
