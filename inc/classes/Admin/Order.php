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
		// 子選單 1 - 渲染原本的內容=>點名表
		add_submenu_page(
		Plugin::$kebab,           // 父選單 slug，與上面一致
		'點名表',               // 頁面標題
		'點名表',               // 子選單標題
		'manage_options',
		Plugin::$kebab,           // 子選單 slug 與主選單一致，這樣會使點主選單時預設顯示這頁
		[ $this, 'r2_order_filter_content' ]
		);
		// 子選單 2 - 渲染新的內容=>會計報表
		add_submenu_page(
		Plugin::$kebab,
		'會計報表',
		'會計報表',
		'manage_options',
		Plugin::$kebab . '_accounting', // 新的唯一 slug
		[ $this, 'r2_order_accounting_filter_content' ]
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
	/**
	 * 會計報表篩選頁面內容
	 */
	public function r2_order_accounting_filter_content(): void {
		Bootstrap::enqueue_script();
		echo '<div id="' . Plugin::$snake . '_accounting" class="my-app"></div>';
		// $this->get_order();
	}
}
