<?php

use Model\PageBuilder\Renderer;

/** @var array    $config */
/** @var string[] $children */     // per-item HTML (one entry per bound data item)
/** @var string   $extraClasses */

// The slider is an iterating container: the renderer has already rendered the
// authored child template once per bound item, so $children is the per-item HTML
// array. We wrap each item as a direct child <div> of .zkslide — the markup the
// slider's runtime JS (zkCheckSlides) expects. No data / no provider → no slides
// (the contract's "no fallbacks for unavailable data" stance).

$attrs = ' class="zkslide' . ($extraClasses !== '' ? ' ' . $extraClasses : '') . '"';

$type = (isset($config['type']) and $config['type'] === 'fade') ? 'fade' : 'slide';
$attrs .= ' data-type="' . Renderer::escapeAttr($type) . '"';

$direction = (isset($config['direction']) and $config['direction'] === 'v') ? 'v' : 'o';
$attrs .= ' data-direction="' . Renderer::escapeAttr($direction) . '"';

$visible = (isset($config['visible']) and is_numeric($config['visible']) and (int)$config['visible'] > 0) ? (int)$config['visible'] : 1;
$attrs .= ' data-visible="' . $visible . '"';

$step = (isset($config['step']) and is_numeric($config['step']) and (int)$config['step'] > 0) ? (int)$config['step'] : 1;
$attrs .= ' data-step="' . $step . '"';

$interval = (isset($config['interval']) and is_numeric($config['interval'])) ? (int)$config['interval'] : 0;
if ($interval > 0)
	$attrs .= ' data-interval="' . $interval . '"';

$forceWidth = (!isset($config['forceWidth']) or $config['forceWidth']);
$attrs .= ' data-force-width="' . ($forceWidth ? 'true' : 'false') . '"';

$forceHeight = (!isset($config['forceHeight']) or $config['forceHeight']);
$attrs .= ' data-force-height="' . ($forceHeight ? 'true' : 'false') . '"';

$width = (isset($config['width']) and is_string($config['width'])) ? trim($config['width']) : '';
if ($width !== '')
	$attrs .= ' data-width="' . Renderer::escapeAttr($width) . '"';

$height = (isset($config['height']) and is_string($config['height'])) ? trim($config['height']) : '';
if ($height !== '')
	$attrs .= ' data-height="' . Renderer::escapeAttr($height) . '"';

echo '<div' . $attrs . '>';
foreach ($children as $slide)
	echo '<div>' . $slide . '</div>';
echo '</div>';
