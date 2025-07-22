<?php
/**
 * Base
 */

declare (strict_types = 1);

namespace J7\R2OrderFilter\Utils;

if (class_exists('J7\R2OrderFilter\Utils\Base')) {
	return;
}
/**
 * Class Base
 */
abstract class Base {
	const BASE_URL      = '/';
	const APP1_SELECTOR = '#r2_order_filter';
	const APP2_SELECTOR = '#r2_order_filter_accounting';
	const API_TIMEOUT   = '30000';
	const DEFAULT_IMAGE = 'http://1.gravatar.com/avatar/1c39955b5fe5ae1bf51a77642f052848?s=96&d=mm&r=g';

	public static function decodeIfUtf8($str) {
		// urldecode 之前，先確認該字串是 URL 編碼格式
		$decoded = urldecode($str);
	
		// 判斷解碼後是否為 UTF-8 編碼
		if (mb_check_encoding($decoded, 'UTF-8')) {
			return $decoded;
		} else {
			return $str; // 如果不是 UTF-8，就回傳原字串
		}
	}
}
