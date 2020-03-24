export default class Post {
	constructor(title, img) {
		this.title = title
		this.date = new Date()
		this.img = img
	}
	// в каждом посте метод toString будет сериализовать данные этого поста
	toString() {
		return JSON.stringify({
			title: this.title,
			// встроенный в Date метод toJSON() возвращает строку типа "2020-03-22T16:58:13.688Z"
			date: this.date.toJSON(),
			img: this.img
		}, null, 2) // replacer: null, количество пробелов: 2
	}

	get uppercaseTitle() {
		return this.title.toUpperCase()
	}
}