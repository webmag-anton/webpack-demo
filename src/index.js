import Post from './Post'  // импортируем класс Post, т.к. дефолтный - без скобок; для .js расширение писать не обязательно
import './styles/styles.css'  // подключаем css
import json from './assets/json' // для .json файлов расширение писать не обязательно; фигурные скобки не нужны
// для примера, с помощью alias @ указываем не относительный (./), а абсолютный путь
import webpackLogo from '@/assets/webpack-logo.png' // импортруем картинку, фигурные скобки не нужны; возвращается её имя с расширением
import * as $ from 'jquery' // импортировать все как $ из библиотеки jquery; т.к. она в node_modules путь не пишется
import './styles/scss.scss'  // подключаем scss
import './babel'	// подключить модуль, но не присваивать его переменной



const post = new Post('Webpack post title', webpackLogo)
// используем подключеннкю jquery
$('pre').html( post.toString() )

// при импорте json файлы автоматичеси парсятся 
console.log('JSON: ', json)


