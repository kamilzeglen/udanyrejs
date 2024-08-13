import productImage from '../assets/msc.jpg'

export default function OfferCard() {
  return (
    <div className="w-1/2 bg-white border-2 border-gray-200 rounded-lg shadow m-5">
      <img className="bg-auto rounded-t-lg" src={productImage} alt=""/>

      <div className="p-5">
        <a href="#">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">MSC FIORDY</h5>
        </a>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Data: 21.02.2025 - 28.02.2025</p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Cena: 2499 PLN</p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Zobacz szczególky</p>
        <a href="#"
           className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
          Zobacz PDF
        </a>
      </div>
    </div>

  )
}