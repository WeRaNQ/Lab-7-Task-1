document.addEventListener('DOMContentLoaded', function () {
	let lastScrollTop = 0

	const header = document.querySelector('.header')
	const burger = document.getElementById('burger')
	const navLinks = document.querySelectorAll('.nav-links')

	window.addEventListener('scroll', function () {
		let scrollTop = window.pageYOffset || document.documentElement.scrollTop
		if (scrollTop > lastScrollTop) {
			// Прокрутка вниз
			header.classList.add('hidden')
		} else {
			// Прокрутка вверх
			header.classList.remove('hidden')
		}
		lastScrollTop = scrollTop <= 0 ? 0 : scrollTop // Для мобильных или прокрутки назад
	})

	burger.addEventListener('click', function () {
		header.classList.toggle('open')
		document.body.classList.toggle('no-scroll')
	})

	navLinks.forEach(link => {
		link.addEventListener('click', function () {
			header.classList.remove('open')
			document.body.classList.remove('no-scroll')
		})
	})
})
