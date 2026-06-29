var zkSlides = {};

function zkCheckSlides() {
	const sliders = document.querySelectorAll('.zkslide');
	for (let slider of sliders) {
		if (slider.getAttribute('data-zkslide-set')) continue;

		let k;
		if (slider.getAttribute('data-id')) {
			k = slider.getAttribute('data-id');
			if (parseInt(k).toString() === k) {
				alert('The slide id cannot be numeric.');
				continue;
			}
			if (typeof zkSlides[k] !== 'undefined') {
				console.error('Duplicated slide id ' + k + '.');
				delete zkSlides[k];
			}
		} else {
			k = 1;
			while (typeof zkSlides[k] !== 'undefined')
				k++;
		}

		const options = {
			'width': null,
			'height': null,
			'type': 'slide',
			'direction': 'o',
			'force-width': 'true',
			'force-height': 'true',
			'visible': 1,
			'interval': false,
			'step': 1,
			'callback': false,
			'start': 1,
			'show-dots': false,
			'dots-mode': 'page',
			'dots-color': '',
		};

		for (let opt in options) {
			if (!options.hasOwnProperty(opt)) continue;
			if (slider.getAttribute('data-' + opt)) {
				switch (opt) {
					case 'visible':
						options[opt] = JSON.parse(slider.getAttribute('data-' + opt));
						if (typeof options[opt] === 'object') {
							if (typeof options[opt]['default'] === 'undefined') {
								console.error('Default value, in the slider option "visible", must be present');
								options[opt] = 1;
							}
						}
						break;
					case 'callback':
						eval("options[opt] = " + slider.getAttribute('data-' + opt));
						break;
					default:
						options[opt] = slider.getAttribute('data-' + opt);
						if (['step', 'start'].includes(opt))
							options[opt] = parseInt(options[opt]);
						break;
				}
			}
		}

		slider.style.display = 'block';
		if (slider.offsetParent === null) {
			slider.style.display = 'none';
			continue;
		}

		const subslides = [];
		while (typeof slider.children[0] !== 'undefined')
			subslides.push(slider.removeChild(slider.children[0]));

		let cont;
		switch (options['type']) {
			case 'slide':
				cont = document.createElement('div');
				switch (options['direction']) {
					case 'o':
						cont.className = 'zkslide-inner horizontal';
						break;
					case 'v':
						cont.className = 'zkslide-inner vertical';
						break;
				}
				cont.setAttribute('data-default-class', cont.className);
				cont.style.top = '0px';
				cont.style.left = '0px';
				cont = slider.appendChild(cont);
				break;
			case 'fade':
				cont = slider;
				break;
		}

		if (options['width'] !== null)
			slider.style.width = options['width'];
		if (options['height'] !== null)
			slider.style.height = options['height'];

		zkSlides[k] = {
			mainCont: slider,
			cont,
			options,
			slides: subslides,
			current: options.start,
			queue: [],
			moving: false,
			interval: false,
			dots: null,
			dotsCount: 0,
		};

		slider.setAttribute('data-zkslide-set', k);

		zkBuildDots(k);

		zkFillStaticSlide(k, zkSlides[k].current);

		if (zkSlides[k].options['callback'])
			zkSlides[k].options['callback'].call(zkSlides[k], zkSlides[k].current);

		zkSlideSetInterval(k);
	}
}

window.addEventListener('DOMContentLoaded', zkCheckSlides);
if (typeof window.onHtmlChange !== 'undefined')
	onHtmlChange(zkCheckSlides);

window.addEventListener('resize', zkSlideDebounce(function () {
	for (let k in zkSlides) {
		if (!zkSlides.hasOwnProperty(k)) continue;
		zkFillStaticSlide(k, zkSlides[k].current);
	}
}, 100));

function zkSlideSetOptions(k, options) {
	if (typeof zkSlides[k] === 'undefined')
		return false;

	for (let i in options) {
		if (!options.hasOwnProperty(i)) continue;
		zkSlides[k].options[i] = options[i];
	}

	zkSlideResize(k, []);
	zkFillStaticSlide(k, zkSlides[k].current);
}

function zkMoveSlide(k, n, resetInterval) {
	if (typeof zkSlides[k] === 'undefined')
		return false;

	if (typeof resetInterval === 'undefined')
		resetInterval = true;
	if (resetInterval)
		zkSlideSetInterval(k);

	zkSlides[k].queue.push(n);
	zkCheckMoveQueue();
}

function zkActualMoveSlide(k, n) {
	if (typeof n === 'number' && n < 0)
		n = n.toString();

	let forceType = false;
	if (typeof n == 'string') {
		let current = zkSlides[k].current;
		if (n.charAt(0) === '-') {
			forceType = '-';
			const moveBy = parseInt(n.substring(1));
			if (isNaN(moveBy))
				return false;
			current -= moveBy;
		} else if (n.charAt(0) === '+') {
			forceType = '+';
			const moveBy = parseInt(n.substring(1));
			if (isNaN(moveBy))
				return false;
			current += moveBy;
		} else {
			return false;
		}

		n = current;
	}

	n = zkNormalizeN(k, n);
	if (n === zkSlides[k].current)
		return true;

	let type;
	switch (zkSlides[k].options['type']) {
		case 'slide':
			switch (zkSlides[k].options['direction']) {
				case 'o':
					if (forceType === '+') type = 'right';
					else if (forceType === '-') type = 'left';
					else if (n < zkSlides[k].current) type = 'left';
					else type = 'right';
					break;
				case 'v':
					if (forceType === '+') type = 'down';
					else if (forceType === '-') type = 'up';
					else if (n < zkSlides[k].current) type = 'up';
					else type = 'down';
					break;
				default:
					return;
			}
			break;
		case 'fade':
			type = 'fade';
			break;
		default:
			return false;
	}

	zkSlides[k].moving = true;

	const prep = zkPrepareToMove(k, n, type);
	let forResize = prep;

	switch (type) {
		case 'fade':
			for (let i in prep) {
				if (!prep.hasOwnProperty(i)) continue;
				prep[i].style.opacity = 1;
			}

			const currents = zkSlides[k].mainCont.querySelectorAll('[data-zkslide-' + k + '-current]');
			for (let i in currents) {
				if (!currents.hasOwnProperty(i)) continue;
				currents[i].style.opacity = 0;
			}
			break;

		case 'left':
		case 'up':
			zkSlides[k].cont.className = zkSlides[k].cont.getAttribute('data-default-class') + ' animate';
			if (type === 'up')
				zkSlides[k].cont.style.top = '0px';
			else
				zkSlides[k].cont.style.left = '0px';
			break;

		case 'right':
		case 'down':
			zkSlides[k].cont.className = zkSlides[k].cont.getAttribute('data-default-class') + ' animate';
			let w = 0, c = 0;
			forResize = []
			for (let i in zkSlides[k].cont.children) {
				if (!zkSlides[k].cont.children.hasOwnProperty(i)) continue;
				c++;
				if (c < prep)
					w += type === 'down' ? zkSlides[k].cont.children[i].offsetHeight : zkSlides[k].cont.children[i].offsetWidth;
				if (c >= prep)
					forResize.push(zkSlides[k].cont.children[i]);
			}

			if (type === 'down')
				zkSlides[k].cont.style.top = (-w) + 'px';
			else
				zkSlides[k].cont.style.left = (-w) + 'px';
			break;
	}

	zkSlideResize(k, forResize);

	setTimeout((function (k, n) {
		return function () {
			zkFillStaticSlide(k, n);
			if (zkSlides[k].options['callback'])
				zkSlides[k].options['callback'].call(zkSlides[k], n);
			if (zkSlides[k].options['type'] === 'slide') {
				zkSlides[k].cont.className = zkSlides[k].cont.getAttribute('data-default-class');
				zkSlides[k].cont.style.left = '0px';
				zkSlides[k].cont.style.top = '0px';
			}
			zkSlides[k].moving = false;
			zkCheckMoveQueue();
		};
	})(k, n), 700);
}

function zkCheckMoveQueue() {
	for (let k in zkSlides) {
		if (!zkSlides.hasOwnProperty(k)) continue;
		if (zkSlides[k].moving) continue;
		if (zkSlides[k].queue.length > 0) {
			const n = zkSlides[k].queue.shift();
			zkActualMoveSlide(k, n);
		}
	}
}

function zkFillStaticSlide(k, from) {
	if (typeof zkSlides[k] === 'undefined')
		return false;

	const divsForResize = [];

	let offset = 0;
	zkSlides[k].cont.innerHTML = '';

	const min = Math.min(zkGetVisibleSlides(k), zkSlides[k].slides.length);
	for (let i = 0; i < min; i++) {
		let n = zkNormalizeN(k, from + i),
			div = zkGetSlideDiv(k, n, offset);

		div = zkSlides[k].cont.appendChild(div);
		div.setAttribute('data-zkslide-' + k + '-current', i);
		div.setAttribute('data-zkslide-' + k + '-n', n);
		divsForResize.push(div);
		offset += div.offsetWidth;
	}

	zkSlideResize(k, divsForResize);

	if (zkSlides[k].options['type'] === 'fade') {
		for (let div of divsForResize)
			div.style.position = 'absolute';
	}

	zkSlides[k].current = from;

	zkUpdateDots(k);
}

// --- Pagination dots ------------------------------------------------------------
// Optional dots row rendered below the slider, centered. Activated only when the
// carousel.php template emits data-show-dots (additive: every existing .zkslide on
// other sites has no `dots` ref and is untouched). In `page` mode one dot covers a
// page of `visible` slides (ceil(total/visible)); in `slide` mode one dot per slide.

function zkSlideDotsCount(k) {
	const slides = zkSlides[k].slides.length;
	if (slides === 0)
		return 0;
	if (zkSlides[k].options['dots-mode'] === 'slide')
		return slides;
	return Math.ceil(slides / zkGetVisibleSlides(k));
}

function zkBuildDots(k) {
	if (String(zkSlides[k].options['show-dots']) !== 'true')
		return;

	const count = zkSlideDotsCount(k);
	if (count <= 1) // Nothing to paginate
		return;

	const dots = document.createElement('div');
	dots.className = 'zkslide-dots';
	if (zkSlides[k].options['dots-color'])
		dots.style.setProperty('--zkslide-dots-color', zkSlides[k].options['dots-color']);

	zkSlides[k].mainCont.parentNode.insertBefore(dots, zkSlides[k].mainCont.nextSibling);
	zkSlides[k].dots = dots;
	zkFillDots(k, count);
}

function zkFillDots(k, count) {
	const dots = zkSlides[k].dots;
	dots.innerHTML = '';
	for (let i = 0; i < count; i++) {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'zkslide-dot';
		btn.setAttribute('aria-label', 'Slide ' + (i + 1));
		btn.addEventListener('click', (function (k, i) {
			return function () {
				if (zkSlides[k].options['dots-mode'] === 'slide')
					zkMoveSlide(k, i + 1);
				else
					zkMoveSlide(k, i * zkGetVisibleSlides(k) + 1);
			};
		})(k, i));
		dots.appendChild(btn);
	}
	zkSlides[k].dotsCount = count;
}

function zkUpdateDots(k) {
	if (!zkSlides[k] || !zkSlides[k].dots)
		return;

	// In page mode a responsive `visible` change alters the page count: rebuild.
	const count = zkSlideDotsCount(k);
	if (count <= 1) {
		zkSlides[k].dots.innerHTML = '';
		zkSlides[k].dotsCount = 0;
	} else if (count !== zkSlides[k].dotsCount) {
		zkFillDots(k, count);
	}

	// Keep the centered row the same width as the slider, so it lines up under it.
	zkSlides[k].dots.style.width = zkSlides[k].mainCont.offsetWidth + 'px';

	const current = zkNormalizeN(k, zkSlides[k].current);
	const active = zkSlides[k].options['dots-mode'] === 'slide'
		? current - 1
		: Math.floor((current - 1) / zkGetVisibleSlides(k));

	const buttons = zkSlides[k].dots.children;
	for (let i = 0; i < buttons.length; i++)
		buttons[i].className = i === active ? 'zkslide-dot active' : 'zkslide-dot';
}

function zkSlideResize(k, divs) {
	if (typeof zkSlides[k] === 'undefined')
		return false;

	let w = zkSlides[k].options['width'], h = zkSlides[k].options['height'], totalW = 0, totalH = 0, maxW = 0, maxH = 0;

	const prevW = zkSlides[k].mainCont.offsetWidth,
		prevH = zkSlides[k].mainCont.offsetHeight;

	if (w === null)
		zkSlides[k].mainCont.style.width = 'auto';
	if (h === null) {
		zkSlides[k].mainCont.style.marginBottom = zkSlides[k].mainCont.offsetHeight + 'px';
		zkSlides[k].mainCont.style.height = 'auto';
	}

	for (const div of divs) {
		totalW += div.offsetWidth;
		totalH += div.offsetHeight;
		maxW = Math.max(maxW, div.offsetWidth);
		maxH = Math.max(maxH, div.offsetHeight);

		for (const img of Array.from(div.querySelectorAll('img'))) {
			img.addEventListener('load', zkSlideDebounce(() => {
				zkSlideResize(k, divs);
			}, 200));
		}
	}

	let width = w;
	if (width === null)
		width = (zkSlides[k].options['type'] === 'fade' || zkSlides[k].options['direction'] === 'o') ? totalW + 'px' : maxW + 'px';

	let height = h;
	if (height === null) {
		zkSlides[k].mainCont.style.marginBottom = '0';
		height = (zkSlides[k].options['type'] === 'fade' || zkSlides[k].options['direction'] === 'o') ? maxH + 'px' : totalH + 'px';
	}

	if (prevW)
		zkSlides[k].mainCont.style.width = prevW + 'px';
	if (prevH)
		zkSlides[k].mainCont.style.height = prevH + 'px';
	zkSlides[k].mainCont.offsetWidth; // Reflow
	zkSlides[k].mainCont.style.width = width;
	zkSlides[k].mainCont.style.height = height;
	if (zkSlides[k].options['type'] === 'slide') {
		zkSlides[k].cont.style.minWidth = width;
		zkSlides[k].cont.style.minHeight = height;
	}
}

function zkGetSlideDiv(k, n, offset) {
	if (typeof zkSlides[k] === 'undefined')
		return false;
	if (typeof zkSlides[k].slides[n - 1] === 'undefined')
		return false;
	if (typeof offset === 'undefined')
		offset = 0;

	const div = document.createElement('div');
	div.className = 'zkslide-single';
	div.innerHTML = zkSlides[k].slides[n - 1].innerHTML;
	if (zkSlides[k].options['type'] === 'fade') {
		div.style.top = '0px';
		div.style.left = offset + 'px';
		div.style.opacity = 1;
	}

	const dimension = zkGetSingleSlideDimension(k);
	if (dimension.w !== null)
		div.style.width = dimension.w;
	if (dimension.h !== null)
		div.style.height = dimension.h;

	return div;
}

function zkPrepareToMove(k, from, type) {
	if (typeof zkSlides[k] === 'undefined')
		return false;

	switch (type) {
		case 'fade': {
			let offset = 0, divs = [];
			for (i = 0; i < zkGetVisibleSlides(k); i++) {
				let n = zkNormalizeN(k, from + i),
					div = zkGetSlideDiv(k, n, offset);

				div.style.zIndex = -1;
				div.style.opacity = 0;
				div = zkSlides[k].cont.appendChild(div);
				div.style.position = 'absolute';
				divs.push(div);
				offset += div.offsetWidth;
			}
			return divs;
		}

		case 'left':
		case 'up': {
			// To scroll towards the left/upperwards, I just add as many slide as needed to cover the range from the requested slide to the last slide in the view
			let end_vis = zkNormalizeN(k, zkSlides[k].current + zkGetVisibleSlides(k) - 1), n = parseInt(from);
			zkSlides[k].cont.innerHTML = '';

			let last_one = false, n_found = false, w = 0, divs = [];
			do {
				let div = zkGetSlideDiv(k, n);
				div = zkSlides[k].cont.appendChild(div);

				if (n === zkSlides[k].current)
					n_found = true;
				else if (!n_found)
					w += type === 'up' ? div.offsetHeight : div.offsetWidth;

				if (divs.length < zkGetVisibleSlides(k))
					divs.push(div);

				if (last_one)
					break;
				n = zkNormalizeN(k, n + 1);
				if (n == end_vis)
					last_one = true;
			} while (true);

			if (type === 'up') {
				zkSlides[k].cont.style.top = (-w) + 'px';
			} else {
				zkSlides[k].cont.style.left = (-w) + 'px';
			}
			zkSlides[k].cont.offsetWidth; // Reflow

			return divs;
		}

		case 'right':
		case 'down': {
			// To move towards the right/downwards...
			let n = parseInt(from), scrollTo = 0;

			// I need to add, at the end of the sliders, as many as slides are needed to reach the end of the new slider state
			let c = zkSlides[k].current, end_vis = zkNormalizeN(k, zkSlides[k].current + zkGetVisibleSlides(k) - 1),
				end_vis_reached = false, new_end = null, avoidInfiniteLoops = 0;
			while (true) {
				if (end_vis_reached) {
					let div = zkGetSlideDiv(k, c);
					div = zkSlides[k].cont.appendChild(div);
				}

				if (c === end_vis)
					end_vis_reached = true;

				if (new_end === null)
					scrollTo++;

				if (c === n) {
					new_end = zkNormalizeN(k, c + zkGetVisibleSlides(k) - 1);
				}

				if (c === new_end)
					break;

				c = zkNormalizeN(k, c + 1);

				avoidInfiniteLoops++;
				if (avoidInfiniteLoops === 1000) // Security measure
					return 0;
			}

			return scrollTo;
		}
	}
}

function zkNormalizeN(k, n) {
	if (typeof zkSlides[k] === 'undefined')
		return false;
	if (zkSlides[k].slides.length === 0)
		return n;

	while (n < 1)
		n += zkSlides[k].slides.length;
	while (n > zkSlides[k].slides.length)
		n -= zkSlides[k].slides.length;
	return n;
}

function zkGetSingleSlideDimension(k) {
	if (typeof zkSlides[k] === 'undefined')
		return false;

	let w, h;
	if (zkSlides[k].options['force-width'] === 'true' && zkSlides[k].options['width'] !== null && (zkSlides[k].options['type'] === 'fade' || zkSlides[k].options['direction'] === 'o'))
		w = Math.floor(zkSlides[k].mainCont.offsetWidth / zkGetVisibleSlides(k)) + 'px';
	else
		w = null;

	if (zkSlides[k].options['force-height'] === 'true' && zkSlides[k].options['height'] !== null && (zkSlides[k].options['type'] === 'fade' || zkSlides[k].options['direction'] === 'v'))
		h = Math.floor(zkSlides[k].mainCont.offsetHeight / zkGetVisibleSlides(k)) + 'px';
	else
		h = null;

	return {w, h};
}

function zkSlideSetInterval(k) {
	if (zkSlides[k].options['interval']) {
		if (zkSlides[k].interval)
			clearInterval(zkSlides[k].interval);

		zkSlides[k].interval = setInterval((function (k) {
			return function () {
				zkMoveSlide(k, zkSlides[k].options['step'] > 0 ? '+' + zkSlides[k].options['step'] : zkSlides[k].options['step'], false);
			};
		})(k), zkSlides[k].options['interval']);
	}
}

function zkSlideDebounce(func, wait, immediate) {
	let timeout;
	return function () {
		let context = this, args = arguments;
		let later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = (immediate && !timeout);
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function zkGetVisibleSlides(k) {
	if (typeof zkSlides[k] === 'undefined')
		return 1;

	if (typeof zkSlides[k].options['visible'] === 'object') {
		let sizes = Object.keys(zkSlides[k].options['visible']).sort(function (a, b) {
			a = parseInt(a);
			b = parseInt(b);

			if (isNaN(a))
				return 1;
			if (isNaN(b))
				return -1;
			if (a > b)
				return 1;
			if (a < b)
				return -1;
			return 0;
		});

		let toReturn = null;
		sizes.forEach(function (s) {
			if (toReturn !== null)
				return;

			var numericS = parseInt(s);

			if (s === 'default' || window.innerWidth < numericS)
				toReturn = parseInt(zkSlides[k].options['visible'][s]);
		});

		return (toReturn && !isNaN(toReturn)) ? toReturn : 1;
	} else {
		return parseInt(zkSlides[k].options['visible']);
	}
}
