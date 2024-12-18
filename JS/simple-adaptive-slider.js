/**
 * SimpleAdaptiveSlider by Itchief v2.0.0 (https://github.com/itchief/ui-components/tree/master/simple-adaptive-slider)
 * Copyright 2020 - 2021 Alexander Maltsev
 * Licensed under MIT (https://github.com/itchief/ui-components/blob/master/LICENSE)
 */

;(function () {
	if (typeof window.CustomEvent === 'function') return false
	function CustomEvent(event, params) {
		params = params || { bubbles: false, cancelable: false, detail: null }
		var e = document.createEvent('CustomEvent')
		e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
		return e
	}
	window.CustomEvent = CustomEvent
})()

// Р±Р°Р·РѕРІС‹Рµ РєР»Р°СЃСЃС‹ Рё СЃРµР»РµРєС‚РѕСЂС‹
var WRAPPER_SELECTOR = '.slider__wrapper'
var ITEMS_SELECTOR = '.slider__items'
var ITEM_SELECTOR = '.slider__item'
var ITEM_CLASS_ACTIVE = 'slider__item_active'
var CONTROL_SELECTOR = '.slider__control'
var CONTROL_CLASS_SHOW = 'slider__control_show'
// РёРЅРґРёРєР°С‚РѕСЂС‹
var INDICATOR_WRAPPER_ELEMENT = 'ol'
var INDICATOR_WRAPPER_CLASS = 'slider__indicators'
var INDICATOR_ITEM_ELEMENT = 'li'
var INDICATOR_ITEM_CLASS = 'slider__indicator'
var INDICATOR_ITEM_CLASS_ACTIVE = 'slider__indicator_active'
// РїРѕСЂРѕРі РґР»СЏ РїРµСЂРµРєР»СЋС‡РµРЅРёСЏ СЃР»Р°Р№РґР° (40%)
var SWIPE_THRESHOLD = 20
// РєР»Р°СЃСЃ РґР»СЏ РѕС‚РєР»СЋС‡РµРЅРёСЏ transition
var TRANSITION_NONE = 'transition-none'

function SimpleAdaptiveSlider(selector, config) {
	// .slider
	this._$root = document.querySelector(selector)
	// .slider__wrapper
	this._$wrapper = this._$root.querySelector(WRAPPER_SELECTOR)
	// .slider__items
	this._$items = this._$root.querySelector(ITEMS_SELECTOR)
	// .slider__item
	this._$itemList = this._$root.querySelectorAll(ITEM_SELECTOR)
	// С‚РµРєСѓС‰РёР№ РёРЅРґРµРєСЃ
	this._currentIndex = 0
	// СЌРєСЃС‚СЂРµРјР°Р»СЊРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ СЃР»Р°Р№РґРѕРІ
	this._minOrder = 0
	this._maxOrder = 0
	this._$itemWithMinOrder = null
	this._$itemWithMaxOrder = null
	this._minTranslate = 0
	this._maxTranslate = 0
	// РЅР°РїСЂР°РІР»РµРЅРёРµ СЃРјРµРЅС‹ СЃР»Р°Р№РґРѕРІ (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ)
	this._direction = 'next'
	// С„Р»Р°Рі, РєРѕС‚РѕСЂС‹Р№ РїРѕРєР°Р·С‹РІР°РµС‚, С‡С‚Рѕ РёРґС‘С‚ РїСЂРѕС†РµСЃСЃ СѓСЂР°РІРЅРѕРІРµС€РёРІР°РЅРёСЏ СЃР»Р°Р№РґРѕРІ
	this._balancingItemsFlag = false
	// С‚РµРєСѓС‰РµРµ Р·РЅР°С‡РµРЅРёРµ С‚СЂР°РЅСЃС„РѕСЂРјР°С†РёРё
	this._transform = 0
	// swipe РїР°СЂР°РјРµС‚СЂС‹
	this._hasSwipeState = false
	this._swipeStartPosX = 0
	// id С‚Р°Р№РјРµСЂР°
	this._intervalId = null
	// РєРѕРЅС„РёРіСѓСЂР°С†РёСЏ СЃР»Р°Р№РґРµСЂР° (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ)
	this._config = {
		loop: true,
		autoplay: false,
		interval: 5000,
		swipe: true,
	}
	// РёР·РјРµРЅСЏРµРј РєРѕРЅС„РёРіСѓСЂР°С†РёСЋ СЃР»Р°Р№РґРµСЂР° РІ СЃРѕРѕС‚РІРµС‚СЃС‚РІРёРё СЃ РїРµСЂРµРґР°РЅРЅС‹РјРё РЅР°СЃС‚СЂРѕР№РєР°РјРё
	for (var key in config) {
		if (this._config.hasOwnProperty(key)) {
			this._config[key] = config[key]
		}
	}
	// РґРѕР±Р°РІР»СЏРµРј Рє СЃР»Р°Р№РґР°Рј data-Р°С‚СЂРёР±СѓС‚С‹
	for (var i = 0, length = this._$itemList.length; i < length; i++) {
		this._$itemList[i].dataset.order = i
		this._$itemList[i].dataset.index = i
		this._$itemList[i].dataset.translate = 0
	}
	// РїРµСЂРµРјРµС‰Р°РµРј РїРѕСЃР»РµРґРЅРёР№ СЃР»Р°Р№Рґ РїРµСЂРµРґ РїРµСЂРІС‹Рј
	if (this._config.loop) {
		var count = this._$itemList.length - 1
		var translate = -this._$itemList.length * 100
		this._$itemList[count].dataset.order = -1
		this._$itemList[count].dataset.translate = -this._$itemList.length * 100
		var transformValue = 'translateX('.concat(translate, '%)')
		this._$itemList[count].style.transform = transformValue
	}
	// РґРѕР±Р°РІР»СЏРµРј РёРЅРґРёРєР°С‚РѕСЂС‹ Рє СЃР»Р°Р№РґРµСЂСѓ
	this._addIndicators()
	// РѕР±РЅРѕРІР»СЏРµРј СЌРєСЃС‚СЂРµРјР°Р»СЊРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ РїРµСЂРµРјРµРЅРЅС‹С…
	this._refreshExtremeValues()
	// РїРѕРјРµС‡Р°РµРј Р°РєС‚РёРІРЅС‹Рµ СЌР»РµРјРµРЅС‚С‹
	this._setActiveClass()
	// РЅР°Р·РЅР°С‡Р°РµРј РѕР±СЂР°Р±РѕС‚С‡РёРєРё
	this._addEventListener()
	// Р·Р°РїСѓСЃРєР°РµРј Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєСѓСЋ СЃРјРµРЅСѓ СЃР»Р°Р№РґРѕРІ
	this._autoplay()
}

// set active class
SimpleAdaptiveSlider.prototype._setActiveClass = function () {
	// slides
	var i
	var length
	var $item
	var index
	for (i = 0, length = this._$itemList.length; i < length; i++) {
		$item = this._$itemList[i]
		index = parseInt($item.dataset.index)
		if (this._currentIndex === index) {
			$item.classList.add(ITEM_CLASS_ACTIVE)
		} else {
			$item.classList.remove(ITEM_CLASS_ACTIVE)
		}
	}
	// indicators
	var $indicators = this._$root.querySelectorAll('.' + INDICATOR_ITEM_CLASS)
	if ($indicators.length) {
		for (i = 0, length = $indicators.length; i < length; i++) {
			$item = $indicators[i]
			index = parseInt($item.dataset.slideTo)
			if (this._currentIndex === index) {
				$item.classList.add(INDICATOR_ITEM_CLASS_ACTIVE)
			} else {
				$item.classList.remove(INDICATOR_ITEM_CLASS_ACTIVE)
			}
		}
	}
	// controls
	var $controls = this._$root.querySelectorAll(CONTROL_SELECTOR)
	if (!$controls.length) {
		return
	}
	if (this._config.loop) {
		for (i = 0, length = $controls.length; i < length; i++) {
			$controls[i].classList.add(CONTROL_CLASS_SHOW)
		}
	} else {
		if (this._currentIndex === 0) {
			$controls[0].classList.remove(CONTROL_CLASS_SHOW)
			$controls[1].classList.add(CONTROL_CLASS_SHOW)
		} else if (this._currentIndex === this._$itemList.length - 1) {
			$controls[0].classList.add(CONTROL_CLASS_SHOW)
			$controls[1].classList.remove(CONTROL_CLASS_SHOW)
		} else {
			$controls[0].classList.add(CONTROL_CLASS_SHOW)
			$controls[1].classList.add(CONTROL_CLASS_SHOW)
		}
	}
}

// СЃРјРµРЅР° СЃР»Р°Р№РґРѕРІ
SimpleAdaptiveSlider.prototype._move = function () {
	if (this._direction === 'none') {
		this._$items.classList.remove(TRANSITION_NONE)
		this._$items.style.transform = 'translateX('.concat(this._transform, '%)')
		return
	}
	if (!this._config.loop) {
		var condition = this._currentIndex + 1 >= this._$itemList.length
		if (condition && this._direction === 'next') {
			this._autoplay('stop')
			return
		}
		if (this._currentIndex <= 0 && this._direction === 'prev') {
			return
		}
	}
	var step = this._direction === 'next' ? -100 : 100
	var transform = this._transform + step
	if (this._direction === 'next') {
		if (++this._currentIndex > this._$itemList.length - 1) {
			this._currentIndex -= this._$itemList.length
		}
	} else {
		if (--this._currentIndex < 0) {
			this._currentIndex += this._$itemList.length
		}
	}
	this._transform = transform
	this._$items.style.transform = 'translateX('.concat(transform, '%)')
	this._setActiveClass()
}

// С„СѓРЅРєС†РёСЏ РґР»СЏ РїРµСЂРµРјРµС‰РµРЅРёСЏ Рє СЃР»Р°Р№РґСѓ РїРѕ РёРЅРґРµРєСЃСѓ
SimpleAdaptiveSlider.prototype._moveTo = function (index) {
	var currentIndex = this._currentIndex
	this._direction = index > currentIndex ? 'next' : 'prev'
	for (var i = 0; i < Math.abs(index - currentIndex); i++) {
		this._move()
	}
}

// РјРµС‚РѕРґ РґР»СЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕР№ СЃРјРµРЅС‹ СЃР»Р°Р№РґРѕРІ
SimpleAdaptiveSlider.prototype._autoplay = function (action) {
	if (!this._config.autoplay) {
		return
	}
	if (action === 'stop') {
		clearInterval(this._intervalId)
		this._intervalId = null
		return
	}
	if (this._intervalId === null) {
		this._intervalId = setInterval(
			function () {
				this._direction = 'next'
				this._move()
			}.bind(this),
			this._config.interval
		)
	}
}

// РґРѕР±Р°РІР»РµРЅРёРµ РёРЅРґРёРєР°С‚РѕСЂРѕРІ
SimpleAdaptiveSlider.prototype._addIndicators = function () {
	if (this._$root.querySelector('.' + INDICATOR_WRAPPER_CLASS)) {
		return
	}
	var $wrapper = document.createElement(INDICATOR_WRAPPER_ELEMENT)
	$wrapper.className = INDICATOR_WRAPPER_CLASS
	for (var i = 0, length = this._$itemList.length; i < length; i++) {
		var $item = document.createElement(INDICATOR_ITEM_ELEMENT)
		$item.className = INDICATOR_ITEM_CLASS
		$item.dataset.slideTo = i
		$wrapper.appendChild($item)
	}
	this._$root.appendChild($wrapper)
}

// refresh extreme values
SimpleAdaptiveSlider.prototype._refreshExtremeValues = function () {
	var $itemList = this._$itemList
	this._minOrder = parseInt($itemList[0].dataset.order)
	this._maxOrder = this._minOrder
	this._$itemWithMinOrder = $itemList[0]
	this._$itemWithMaxOrder = this._$itemWithMinOrder
	this._minTranslate = parseInt($itemList[0].dataset.translate)
	this._maxTranslate = this._minTranslate
	for (var i = 0, length = $itemList.length; i < length; i++) {
		var $item = $itemList[i]
		var order = parseInt($item.dataset.order)
		if (order < this._minOrder) {
			this._minOrder = order
			this._$itemWithMinOrder = $item
			this._minTranslate = parseInt($item.dataset.translate)
		} else if (order > this._maxOrder) {
			this._maxOrder = order
			this._$itemWithMaxOrder = $item
			this._minTranslate = parseInt($item.dataset.translate)
		}
	}
}

// balancing items
SimpleAdaptiveSlider.prototype._balancingItems = function () {
	if (!this._balancingItemsFlag) {
		return
	}
	var $wrapper = this._$wrapper
	var wrapperRect = $wrapper.getBoundingClientRect()
	var halfWidthItem = wrapperRect.width / 2
	var count = this._$itemList.length
	var translate
	var clientRect
	if (this._direction === 'next') {
		var wrapperLeft = wrapperRect.left
		var $min = this._$itemWithMinOrder
		translate = this._minTranslate
		clientRect = $min.getBoundingClientRect()
		if (clientRect.right < wrapperLeft - halfWidthItem) {
			$min.dataset.order = this._minOrder + count
			translate += count * 100
			$min.dataset.translate = translate
			$min.style.transform = 'translateX('.concat(translate, '%)')
			this._refreshExtremeValues()
		}
	} else if (this._direction === 'prev') {
		var wrapperRight = wrapperRect.right
		var $max = this._$itemWithMaxOrder
		translate = this._maxTranslate
		clientRect = $max.getBoundingClientRect()
		if (clientRect.left > wrapperRight + halfWidthItem) {
			$max.dataset.order = this._maxOrder - count
			translate -= count * 100
			$max.dataset.translate = translate
			$max.style.transform = 'translateX('.concat(translate, '%)')
			this._refreshExtremeValues()
		}
	}
	requestAnimationFrame(this._balancingItems.bind(this))
}

// adding listeners
SimpleAdaptiveSlider.prototype._addEventListener = function () {
	var $items = this._$items
	function onClick(e) {
		var $target = e.target
		this._autoplay('stop')
		if ($target.classList.contains('slider__control')) {
			e.preventDefault()
			this._direction = $target.dataset.slide
			this._move()
		} else if ($target.dataset.slideTo) {
			e.preventDefault()
			var index = parseInt($target.dataset.slideTo)
			this._moveTo(index)
		}
		if (this._config.loop) {
			this._autoplay()
		}
	}
	function onTransitionStart() {
		this._balancingItemsFlag = true
		window.requestAnimationFrame(this._balancingItems.bind(this))
	}
	function onTransitionEnd() {
		this._balancingItemsFlag = false
		this._$root.dispatchEvent(
			new CustomEvent('slider.transition.end', { bubbles: true })
		)
	}
	function onMouseEnter() {
		this._autoplay('stop')
	}
	function onMouseLeave() {
		if (this._config.loop) {
			this._autoplay()
		}
	}
	function onSwipeStart(e) {
		this._autoplay('stop')
		var event = e.type.search('touch') === 0 ? e.touches[0] : e
		this._swipeStartPosX = event.clientX
		this._swipeStartPosY = event.clientY
		this._hasSwipeState = true
		this._hasSwiping = false
	}
	function onSwipeMove(e) {
		if (!this._hasSwipeState) {
			return
		}
		var event = e.type.search('touch') === 0 ? e.touches[0] : e
		var diffPosX = this._swipeStartPosX - event.clientX
		var diffPosY = this._swipeStartPosY - event.clientY
		if (!this._hasSwiping) {
			if (Math.abs(diffPosY) > Math.abs(diffPosX)) {
				this._hasSwipeState = false
				return
			}
			this._hasSwiping = true
		}
		e.preventDefault()
		if (!this._config.loop) {
			if (this._currentIndex + 1 >= this._$itemList.length && diffPosX >= 0) {
				diffPosX = diffPosX / 4
			}
			if (this._currentIndex <= 0 && diffPosX <= 0) {
				diffPosX = diffPosX / 4
			}
		}
		var value = (diffPosX / this._$wrapper.getBoundingClientRect().width) * 100
		var translateX = this._transform - value
		this._$items.classList.add(TRANSITION_NONE)
		this._$items.style.transform = 'translateX('.concat(translateX, '%)')
	}
	function onSwipeEnd(e) {
		if (!this._hasSwipeState) {
			return
		}
		var event = e.type.search('touch') === 0 ? e.changedTouches[0] : e
		var diffPosX = this._swipeStartPosX - event.clientX
		if (!this._config.loop) {
			if (this._currentIndex + 1 >= this._$itemList.length && diffPosX >= 0) {
				diffPosX = diffPosX / 4
			}
			if (this._currentIndex <= 0 && diffPosX <= 0) {
				diffPosX = diffPosX / 4
			}
		}
		var value = (diffPosX / this._$wrapper.getBoundingClientRect().width) * 100
		this._$items.classList.remove(TRANSITION_NONE)
		if (value > SWIPE_THRESHOLD) {
			this._direction = 'next'
			this._move()
		} else if (value < -SWIPE_THRESHOLD) {
			this._direction = 'prev'
			this._move()
		} else {
			this._direction = 'none'
			this._move()
		}
		this._hasSwipeState = false
		if (this._config.loop) {
			this._autoplay()
		}
	}
	function onDragStart(e) {
		e.preventDefault()
	}
	function onVisibilityChange() {
		if (document.visibilityState === 'hidden') {
			this._autoplay('stop')
		} else if (document.visibilityState === 'visible') {
			if (this._config.loop) {
				this._autoplay()
			}
		}
	}
	// click
	this._$root.addEventListener('click', onClick.bind(this))
	// transitionstart and transitionend
	if (this._config.loop) {
		$items.addEventListener('transitionstart', onTransitionStart.bind(this))
		$items.addEventListener('transitionend', onTransitionEnd.bind(this))
	}
	// mouseenter and mouseleave
	if (this._config.autoplay) {
		this._$root.addEventListener('mouseenter', onMouseEnter.bind(this))
		this._$root.addEventListener('mouseleave', onMouseLeave.bind(this))
	}
	// swipe
	if (this._config.swipe) {
		var supportsPassive = false
		try {
			var opts = Object.defineProperty({}, 'passive', {
				get: function () {
					supportsPassive = true
				},
			})
			window.addEventListener('testPassiveListener', null, opts)
		} catch (err) {}
		this._$root.addEventListener(
			'touchstart',
			onSwipeStart.bind(this),
			supportsPassive ? { passive: false } : false
		)
		this._$root.addEventListener(
			'touchmove',
			onSwipeMove.bind(this),
			supportsPassive ? { passive: false } : false
		)
		this._$root.addEventListener('mousedown', onSwipeStart.bind(this))
		this._$root.addEventListener('mousemove', onSwipeMove.bind(this))
		document.addEventListener('touchend', onSwipeEnd.bind(this))
		document.addEventListener('mouseup', onSwipeEnd.bind(this))
	}
	this._$root.addEventListener('dragstart', onDragStart.bind(this))
	// РїСЂРё РёР·РјРµРЅРµРЅРёРё Р°РєС‚РёРІРЅРѕСЃС‚Рё РІРєР»Р°РґРєРё
	document.addEventListener('visibilitychange', onVisibilityChange.bind(this))
}

// РїРµСЂРµР№С‚Рё Рє СЃР»РµРґСѓСЋС‰РµРјСѓ СЃР»Р°Р№РґСѓ
SimpleAdaptiveSlider.prototype.next = function () {
	this._direction = 'next'
	this._move()
}

// РїРµСЂРµР№С‚Рё Рє РїСЂРµРґС‹РґСѓС‰РµРјСѓ СЃР»Р°Р№РґСѓ
SimpleAdaptiveSlider.prototype.prev = function () {
	this._direction = 'prev'
	this._move()
}

// СѓРїСЂР°РІР»РµРЅРёРµ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕР№ СЃРјРµРЅРѕР№ СЃР»Р°Р№РґРѕРІ
SimpleAdaptiveSlider.prototype.autoplay = function (action) {
	this._autoplay('stop')
}
