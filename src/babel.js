async function start() {
	return await Promise.resolve('async is working')
}

start().then(console.log) 

class Util {
	static id = Date.now()
}
// без плагина @babel/plugin-proposal-class-properties babel не понимает 
// статические свойства/методы классов, т.к. это еще не стандарт языка
console.log('Util id: ', Util.id)