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
		$params            = $request->get_query_params() ?? [];
		$params            = WP::sanitize_text_field_deep( $params, false );
		$search_product_id =isset($params['search_product_id'])?$params['search_product_id']:0;
		$initial_date      =isset($params['initial_date'])?$params['initial_date']:null;
		$final_date        =isset($params['final_date'])?$params['final_date']:null;
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
				// 取得商品資料
				$product = $item->get_product();
				// 取得product_id $product_id 即為parent_id
				$product_id = $item->get_product_id();
				// 取得parent_product_id 和 parent_variation_id(如果為加購商品)
				$parent_product_id   = (int) $item->get_meta('parent_product_id');
				$parent_variation_id = (int) $item->get_meta('parent_variation_id');
				// 取得小孩資料
				$child_data = $this->get_child_info_array($item_id);
				// 取得大人資料
				$adult_data = $this->get_adult_info_array($item_id);
				// 取得訂單編號
				$order_number = $order->get_order_number();
				// 格式化訂單資料
				$formate_orders[ $index ] = [
					// 訂單資料
					'product_name'    => $product->get_name(),
					'number'          => $order_number,
					'edit_link'       => get_edit_post_link($order->get_id()), // 取得編輯連結
					// 'date'      => $order->get_date_created()?$order->get_date_created()->date('Y-m-d'):'null',
					// 'total'     => $order->get_total(),
					// 'note'      => $order->get_customer_note(),
					'status'          => $order->get_status(),
					'status_label'    => wc_get_order_status_name($order->get_status()),
					// 家長資料
					'adult_name'      => $order->get_billing_first_name(),
					'adult_email'     => $order->get_billing_email(),
					'adult_phone'     => $order->get_billing_phone(),
					// 學員資料
					'key'             =>$index,
					'group'           =>0,
					'child_name'      => $child_data['child_name'] ?? '',
					'grade'           => '',
					'child_dietary'   => $child_data['child_dietary'] ?? '',
					'child_id_number' => $child_data['child_id_number'] ?? '',
					'child_dob'       => $child_data['child_dob'] ?? '',
					// 屬性資料
					'series'          => $item->get_meta('pa_series'),
					'sessions'        => $item->get_meta('pa_sessions'),
					'ladder'          => $item->get_meta('pa_ladder'),
				];

				// 如果為大人及小孩商品,則更新屬性資料
				if ($product_id === 3943 || $product->get_name() === '小孩') {
					$this->update_parent_attributes($order, $formate_orders, $index, $parent_product_id, $parent_variation_id);
				} elseif ($product_id === 3941 || $product->get_name() === '大人') {
					// 大人則更新 parent 資料
					$formate_orders[ $index ]['adult_name']  = $adult_data['adult_name'] ?? '';
					$formate_orders[ $index ]['adult_email'] = $adult_data['adult_email'] ?? '';
					$formate_orders[ $index ]['adult_phone'] = $adult_data['adult_phone'] ?? '';
					$this->update_parent_attributes($order, $formate_orders, $index, $parent_product_id, $parent_variation_id);
				}
				++$index;
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
	 * Get Child Info Array
	 *
	 * @param int $item_id Item ID.
	 * @return array<string, string>
	 */
	public function get_child_info_array( $item_id ) {
		$child_info = wc_get_order_item_meta($item_id, '_child_info', true);
		$child_data = [];

		if (!empty($child_info)) {
			foreach ($child_info as $value) {
				$child_info_array = json_decode($value, true);
				if (is_array($child_info_array)) {
					$child_data = $child_info_array;
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
					$adult_data = $adult_info_array;
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
