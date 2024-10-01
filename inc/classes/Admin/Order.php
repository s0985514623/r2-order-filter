<?php
/**
 * Order
 */

declare(strict_types=1);

namespace J7\R2OrderFilter\Admin;

use J7\R2OrderFilter\Plugin;
use J7\R2OrderFilter\Bootstrap;

/**
 * Class Order
 */
final class Order {
	use \J7\WpUtils\Traits\SingletonTrait;

	/**
	 * Constructor
	 */
	public function __construct() {
		\add_action('admin_menu', [ $this, 'r2_order_filter_page' ]);
	}

	/**
	 * 訂單篩選頁籤
	 *
	 * @return void
	 */
	public function r2_order_filter_page(): void {
		add_menu_page(
			'訂單篩選',       // 頁面標題
			'訂單篩選',       // 菜單標題
			'manage_options',       // 權限等級
			Plugin::$kebab,       // 菜單的slug
			[ $this, 'r2_order_filter_content' ] // 回調函數，用於輸出頁面內容
		);
	}

	/**
	 * 訂單篩選頁面內容
	 */
	public function r2_order_filter_content(): void {
		Bootstrap::enqueue_script();
		echo '<div id="' . Plugin::$snake . '" class="my-app"></div>';
		// $this->get_order();
	}
}
