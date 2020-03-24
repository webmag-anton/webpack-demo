import * as $ from 'jquery' // импортировать все как $ из библиотеки jquery; т.к. она в node_modules путь не пишется

// будем считать клики по документу
function createAnalytics() {
	let counter = 0
	let isDestroyed = false

	const listener = () => counter++

	$(document).on('click', listener)

	return {
		destroy() {
			$(document).off('click', listener)
			isDestroyed = true
		},
		getClicks() {
			if (isDestroyed) {
				return `Analytics is destroyed. Total clicks = ${counter}`
			}
			return counter
		}
	}
}

window.analytics = createAnalytics()