<?php namespace Model\Slider\Providers;

use Model\PageBuilder\AbstractPageBuilderProvider;

/**
 * Contributes a "Carousel" component to the page-builder editor.
 *
 * Discovered automatically when both this package and the page-builder module are
 * installed (providers-finder). It registers under its own `type: 'carousel'`, so
 * it coexists with the page-builder's built-in `slider` (the native Bootstrap
 * carousel) rather than overriding it — the author can pick either. It is a
 * data-bound iterating container, like the built-in `repeat`: bind it to a data
 * source and it renders the authored child template once per item, each wrapped as
 * a slide inside the .zkslide markup (see PageBuilder/carousel.php). The public
 * side still needs the slider assets — the host enables them with
 * `\Model\Assets\Assets::enable('slider')`.
 */
class PageBuilderProvider extends AbstractPageBuilderProvider
{
	public static function components(): array
	{
		return [
			'carousel' => [
				'label' => 'Carousel',
				'category' => 'Avanzato',
				'icon' => 'fa fa-images',
				'acceptsChildren' => true,
				'iterates' => true,
				'supportsCommon' => true,
				'minWidth' => 200,
				'defaultConfig' => [
					'type' => 'slide',
					'direction' => 'o',
					'visible' => 1,
					'interval' => 0,
					'step' => 1,
					'forceWidth' => true,
					'forceHeight' => true,
				],
				'configSchema' => [
					['key' => 'type', 'type' => 'select', 'label' => 'Transizione', 'default' => 'slide',
						'options' => [
							['value' => 'slide', 'label' => 'Scorrimento'],
							['value' => 'fade', 'label' => 'Dissolvenza'],
						]],
					['key' => 'direction', 'type' => 'select', 'label' => 'Direzione', 'default' => 'o',
						'options' => [
							['value' => 'o', 'label' => 'Orizzontale'],
							['value' => 'v', 'label' => 'Verticale'],
						]],
					['key' => 'visible', 'type' => 'number', 'label' => 'Slide visibili', 'default' => 1, 'min' => 1],
					['key' => 'interval', 'type' => 'number', 'label' => 'Intervallo auto (ms)', 'default' => 0, 'min' => 0],
					['key' => 'step', 'type' => 'number', 'label' => 'Passo', 'default' => 1, 'min' => 1],
					['key' => 'forceWidth', 'type' => 'checkbox', 'label' => 'Larghezza slide uniforme', 'default' => true],
					['key' => 'forceHeight', 'type' => 'checkbox', 'label' => 'Altezza slide uniforme', 'default' => true],
					['key' => 'width', 'type' => 'text', 'label' => 'Larghezza (CSS, opzionale)'],
					['key' => 'height', 'type' => 'text', 'label' => 'Altezza (CSS, opzionale)'],
				],
				'template' => __DIR__ . '/../PageBuilder/carousel.php',
			],
		];
	}
}
