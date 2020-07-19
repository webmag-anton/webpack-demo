// require('plugin-name') подключает встроенные модули или модули из node_modules 
const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')	
const {CleanWebpackPlugin} = require('clean-webpack-plugin')  // забираем нужный класс из объекта {деструктуризация}
const copyWebpackPlugin = require('copy-webpack-plugin')
const miniCssExtractPlugin = require('mini-css-extract-plugin')
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const terserWebpackPlugin = require('terser-webpack-plugin')
// равносильно такому подключению:  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

// значение системной переменной NODE_ENV задается в поле package.js при вызове скриптов
const isDev = process.env.NODE_ENV === 'development',
      isProd = !isDev

// в режиме development бессмысленно использовать webpack-bundle-analyzer, только в режиме production, когда все оптимизировано
const plugins = () => {
   // добавляем плагины здесь, функция вернет массив плагинов в поле plugins
   const base = [	// все плагины добавляются в массив плагинов как инстенсы
      // чтобы автоматически менять подключаемые в компилируемом html-файле имена js файлов, которые динамически меняются при 
      // изменении в этих файлах, необходим дополнительный для webpack плагин html-webpack-plugin; он создает html файлы в dist;
      new HTMLWebpackPlugin({
         template: './index.html',  // чтобы title и весь контент брался из исходного html указывается template
         minify: { 
            collapseWhitespace: isProd  // для минификации, если в режиме production
         }
      }),
      // чтобы папка dist очищалась от старых ненужных файлов (со старым [hash]) нужен плагин clean-webpack-plugin
      new CleanWebpackPlugin(),
      // копируем файл/папку в нужное место без обработки; в массиве для каждого элемента копирования указываем объект
      new copyWebpackPlugin([
         {
            from: path.resolve(__dirname, 'src/favicon.ico'),
            to: path.resolve(__dirname, 'dist')
         }
      ]),
      new miniCssExtractPlugin({
         filename: filename('css')
      }) 
   ]

   if (isProd) {
      base.push(new BundleAnalyzerPlugin())
   }

   return base
}

// минифицирование css и js происходит в поле optimization в свойстве minimizer;
// чтобы минифицировать css и js только в режиме production, нужна проверка режима
const optimization = () => { // ф-я optimization возвращает объект конфигурации поля optimization
   const config = {
      // чтобы в бандлах (если их несколько) не дублировались одни и те же библиотеки и др файлы, подключаемые в разных 
      // точках входа; webpack будет выносить общий для бандлов код (библиотеку) в отдельный файл с префиксом vendors
      splitChunks: {
         chunks: 'all'
      }
   }

   if (isProd) {
      config.minimizer = [
         new optimizeCssAssetsWebpackPlugin(),
         new terserWebpackPlugin()
      ]
   }

   return config
}

// в режиме development нет смысла в длинных названиях, поэтому паттерн [hash] будет только для production
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`


module.exports = {	// мы должны экспортировать объект, который будет являться объектом конфигурации для webpack
   // для упрощения конфига context говорит где лежат все исходники приложения, от этой папки webpack будет отталкиваться
   context: path.resolve(__dirname, 'src'),
   mode: 'development',	// режимы сборки: development - режим разработки (дефолтный), production - режим продакшена
   entry: {	// точка(и) входа; если несколько точек входа (чанков), то значение будет объектом;
      main: ['@babel/polyfill', './index.js'],  // при использовании babel сюда подключается polyfill
      analytics: './analytics.js'
   },
   output: {	 // указываем куда все складывать - точку(и) выхода
      // можно добавить паттерн имени [name] (вместо паттерна станет имя файла) чтобы для каждой точки входа, если их несколько, 
      // генерировалась своя точка выхода; если этого не сделать, то в одной точке выхода смешаются независимые файлы из входа;
      // чтобы не возникало проблем с кэшированием (после изменений в проекте бандл пересобирается, а имя файла не меняется, и оно 
      // кэшируется браузером) можно динамически менять имя шаблоном контента [hash]; он генерируется по содержимому файла
      filename: filename('js'),
      path: path.resolve(__dirname, 'dist')  // складываем в папку dist бандл(ы)
   },
   // с такой ↗ минимальной конфигурацией (entry, output) нам доступны import, export, require, module.exports в скриптах;
   // и теперь не нужно думать в каком порядке выстраивать различные скрипты и мы можем удобно декомпозировать всё приложение

   plugins: plugins(),

   // с помощью лоадеров webpack может работать не только с js файлами, но и с картиками, стилями, шрифтами...
   module: {
      rules: [
         {
            test: /\.css$/, // если webpack встречает файлы в качестве импортов с расширением как в регулярке из поля test...
            // ... то тогда ему нужно использовать такие лоадеры
            // use: ['style-loader', 'css-loader']  // порядок важен! справа-налево; сначала пропускает через css-loader -> style-loader
            // css-loader позволяет понимать импорты css файлов в js;   style-loader добавляет стили в секцию <head> в html

            // вместо style-loader лучше использовать miniCssExtractPlugin.loader (так же подключаем как плагин miniCssExtractPlugin)
            use: [
               {
                  loader: miniCssExtractPlugin.loader, // добавляет стили в секцию <head> в html
                  options: {
                     hmr: isDev,  // Hot Module Reloading; позволяет не перезагружать страницу при изменениях, если в режиме development
                     reloadAll: true
                  }
               }, 
               'css-loader'
            ]
         },
         {
            test: /\.s[ac]ss$/,
            use: [
               {
                  loader: miniCssExtractPlugin.loader,
                  options: {
                     hmr: isDev,
                     reloadAll: true
                  }
               }, 
               'css-loader',
               'sass-loader'
            ]
         },
         {
            test: /\.(png|jpg|svg|gif)$/,
            use: ['file-loader']
         },
         {
            test: /\.(ttf|eot|woff|woff2)$/,
            use: ['file-loader']
         },
         { 
            test: /\.js$/, 
            exclude: /node_modules/,  // исключаем из поиска node_modules, библиотеки не нужно компилировать
            loader: {
               loader: 'babel-loader',
               options: {
                  presets: ['@babel/preset-env'],
                  plugins: ['@babel/plugin-proposal-class-properties']
               }
            } 
         }
      ]
   },

   // добавлять исходные карты для стилей и скриптов если в режиме development
   devtool: isDev ? 'source-map' : '',
   
   devServer: {    // настройка webpack-dev-server
      port: 4200,
      hot: isDev   // без перезагрузки в режиме development
   },

   // дополнительные встроенные возможности webpack
   resolve: {
      // extensions: ['.js', '.png'], // набор разрешений, которые можно не указывать при импорте; по дефолту только .js
      alias: { // регистрируем псевдонимы для удобного указания путей
         '@': path.resolve(__dirname, 'src')
      }
   },

   // предотвращение дублирования в бандлах, минифицирование css и js в поле optimization
   optimization: optimization()

}