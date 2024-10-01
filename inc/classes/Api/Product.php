<?php
/**
 * Product Api Register
 */

declare(strict_types=1);

namespace J7\R2OrderFilter\Api;

use J7\R2OrderFilter\Plugin;
use J7\WpUtils\Classes\WP;

/**
 * Class Product
 */
final class Product {
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
				'endpoint'            => 'products',
				'method'              => 'get',
				'permission_callback' => '__return_true', // TODO 應該是特定會員才能看
			],
		];
	}

	/**
	 * Register products API
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
	 * Get Product Callback
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 * @phpstan-ignore-next-line
	 */
	public function get_products_callback( $request ) {
		// phpcs:@phpstan-ignore-next-line
		$params = $request->get_query_params() ?? [];
		$params = WP::sanitize_text_field_deep( $params, false );

		// 使用 WP_Query 取得所有商品
		$args = [
			'post_type'      => 'product',
			'posts_per_page' => isset($params['posts_per_page'])?$params['posts_per_page']:-1, // -1 表示取得所有商品
			'post_status'    => 'publish',
		];

		$products   = new \WP_Query($args);
		$posts_data = [];
		// 檢查是否有商品
		if ($products->have_posts()) {
			$index = 0;
			while ($products->have_posts()) {
				$products->the_post();
				// 取得商品物件
				$product = wc_get_product(get_the_ID());
				if ( ! $product ) {
					continue;
				}
				// 如果商品為小孩或大人商品則跳過
				if ( $product->get_id() === 3943 || $product->get_name() === '小孩' ||$product->get_id() === 3941 || $product->get_name() === '大人') {
					continue;
				}

				$posts_data[ $index ] = [
					'id'    => get_the_ID(),
					'title' => $product->get_title(),
				];
				++$index;
			}
			wp_reset_postdata();
		}
		$response = new \WP_REST_Response(  $posts_data  );
		return $response;
	}
}
