# model/slider

Simple, yet powerful, JavaScript slider.

This is the ModEl 4 port of the legacy `ZkSlider` module. It ships the slider's CSS/JS as an
asset library declared through an `AssetsProvider`, so `model/assets` discovers and serves them
automatically — no manual file inclusion needed.

## Installation

```bash
composer require model/slider
```

## Enabling the assets

The library is registered under the name `slider` but is **not** auto-enabled. Enable it (typically
from a controller's `init`) wherever a page uses the slider:

```php
use Model\Assets\Assets;

Assets::enable('slider');
```

This adds `style.css` (in the `head`) and `js.js` (in the `foot`) to the asset render list.

## Usage

Once the assets are enabled, create a div in this form:

```html
<div class="zkslide">
	<div>First slide</div>
	<div>Second slide</div>
	<div>Third slide</div>
</div>
```

The content of the slides can be virtually anything, from simple images to complex layouts.

### Slider size

The slider is meant to constantly adapt to the content of the currently shown slides, so they have
to have a certain width and height for it to read (either implicit, by its contents, or explicit,
set with the options).

### Options

Every slider has a variety of options that can be set via `data-` attributes. So, for example, to
set the `width`:

```html
<div class="zkslide" data-width="800px">
```

The possible attributes are:

- **id**: every slider in the page (you can have as many as you want) has its own alphanumeric id.
  You can set it manually via this attribute, otherwise it will be auto-assigned as an
  auto-increment value.
- **width**: the width, in any accepted CSS unit (px, %, etc...), of the slider. If not declared,
  it will be set to auto, and the slider will try to adapt to the content of the slides.
- **height**: the height, in any accepted CSS unit, of the slider. If not declared, it will be set
  to auto, and the slider will try to adapt to the content of the slides.
- **type** (default `slide`): the type of transition; either `slide` or `fade`.
- **direction** (default `o`): in a `slide` transition, this defines the direction (`o` for
  horizontal scrolling, `v` for vertical scrolling).
- **force-width** (default `true`): if `true`, the single slide width is fixed to the width of the
  whole slider (or a fraction of it, for multiple visible slides). Otherwise, every slide can have
  its own width.
- **force-height** (default `true`): same as `force-width`, but for height.
- **visible** (default `1`): the number of slides simultaneously visible. In case of a forced width
  or height (depending on the direction), the slides are sized to a fraction of the whole. For
  example, if the slider is 800px wide and there are 2 visible slides, every slide is 400px. You can
  also pass a JSON object:
  ```
  data-visible='{"768":1,"1024":2,"default":3}'
  ```
  Meaning that up to a screen resolution of 768 one slide is visible; up to 1024px, 2 slides; from
  1024 onwards, 3 slides. You can specify as many steps as you want, but `default` must always be
  present.
- **interval** (default `false`): the number of milliseconds between one slide and the next, for
  auto-scrolling.
- **step** (default `1`): number of slides to move together in the auto-scroll, if set above.
- **callback** (default empty): a JavaScript callback called every time the slider moves (either
  manually or via the auto-interval). It takes a single parameter, the index of the slide it has
  moved to. It is also called at page load, with the index of the initial slide. Set it as
  `data-callback="function(n){ /* your code here */ }"`.

### Moving the slider

Beside setting the interval for auto-scrolling, you can manually move the slider via `zkMoveSlide`,
in three different ways:

- `zkMoveSlide(id, 3)`: move the slider to the 3rd slide.
- `zkMoveSlide(id, '+3')`: move the slider forward by 3 slides.
- `zkMoveSlide(id, '-2')`: move the slider backward by 2 slides.

### Changing options at runtime

`zkSlideSetOptions(k, options)` changes options after the slide has been initialized. For example,
you could decrease the number of visible slides if the screen resolution gets too low:

```javascript
zkSlideSetOptions('your-slide-id', {'visible': 2});
```
