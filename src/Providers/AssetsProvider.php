<?php namespace Model\Slider\Providers;

use Model\Assets\AbstractAssetsProvider;

class AssetsProvider extends AbstractAssetsProvider
{
	public static function assets(): array
	{
		return [
			[
				'name' => 'slider',
				'auto_enable' => false,
				'files' => [
					'vendor/model/slider/assets/style.css',
					[
						'path' => 'vendor/model/slider/assets/js.js',
						'withTags' => ['position' => 'foot'],
					],
				],
			],
		];
	}
}
