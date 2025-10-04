'use client'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              ООО «Алмазгеобур»
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Ведущий российский производитель буровых станков, инструмента и запасных частей для горной отрасли
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-gray-700">
                Алмазгеобур осуществляет деятельность с <strong>2013 года</strong> и за это время зарекомендовала себя как стабильно развивающееся предприятие на мировом рынке с репутацией надежного и добросовестного поставщика.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Production Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Наше производство
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>В составе конструкторского бюро высококвалифицированные ИТР:</strong><br />
                  выпускники МГТУ им. Н.Э.Баумана, МАИ, МФТИ.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Сотрудничество с зарубежными производителями</strong> высококачественных комплектующих (механика, гидравлика, пневматика, электрика) более 8 лет.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Более 300 проектов по замещению импортной продукции</strong> с сохранением полной взаимозаменяемости, отвечающей международным стандартам.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Уникальная методика подбора</strong> сотрудников рабочих специальностей.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Полностью автоматизированные</strong> производственные процессы.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  <strong>Конечный и промежуточный контроль качества.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Technology Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Технологические возможности производства
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Фрезерная обработка</h3>
                <p className="text-gray-600">Возможная длина обработки более 600 мм, 5-ти осевая обработка.</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Токарная обработка</h3>
                <p className="text-gray-600">Максимальный диаметр обработки более 810 мм.</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Электроэрозионная обработка</h3>
                <p className="text-gray-600">Прошивные, проволочные станки. 5-ти осевая обработка. Производство зубчатых колес: модульных, питчевых и др.</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Химико-термическая обработка</h3>
                <p className="text-gray-600">Азотирование, цементация, нитроцементация.</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Сварочные работы</h3>
                <p className="text-gray-600">Оборудование ведущих мировых производителей (сварочные аппараты KEMPPI, столы и оснастка SIEGMUND) - сварка конструкционных сталей, нержавеющих сталей, алюминиевых сплавов.</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">Электромонтажные работы</h3>
                <p className="text-gray-600">Производство РВД. Промышленная автоматизация технологических процессов.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Экспорт
          </h2>
          <div className="text-center mb-6">
            <p className="text-lg text-gray-600 mb-4">
              <strong>Компания Алмазгеобур поставляет запасные части собственного производства в регионы по всему миру.</strong>
            </p>
            <p className="text-gray-600 mb-4">
              В их числе Сербия, Зимбабве, Замбия, Гвинея, Филиппины, Монголия, Перу, Сенегал.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Зимбабве</h3>
              <p className="text-gray-600">
                <strong>В Зимбабве уже введены в эксплуатацию наши флагманские модели RS-90D и RS-230.</strong>
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Планы развития</h3>
              <p className="text-gray-600">
                <strong>В начале 2024 г. планируется открытие первой производственной площадки в г. Хараре.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-md p-8 mt-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Вместе мы свернем горы!</h2>
          <p className="text-xl">
            Компания ООО «Алмазгеобур» обеспечивает комплексную поставку бурового оборудования и инструмента для предприятий горнодобывающей отрасли.
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Контактная информация
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Телефон</h3>
              <p className="text-gray-600 text-xl">+7 495 229 82 94</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 text-xl">contact@almazgeobur.ru</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Центральный офис</h3>
            <p className="text-gray-600">Москва, Ленинский проспект, 111/1, офис 317</p>
          </div>
        </div>
      </div>
    </div>
  )
}
