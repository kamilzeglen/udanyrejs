import OfferCardInterface from '../interfaces/offerCard'

export default function OfferCard(offerCard: OfferCardInterface) {
  return (
    <div className="w-1/2 bg-white border-2 border-gray-200 rounded-lg shadow m-5">
      <img className="bg-auto rounded-t-lg w-full" src={offerCard.image} alt={offerCard.title} />

      <div className="p-5">
        <a href="#">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{offerCard.title}</h5>
        </a>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Data: {offerCard.dataStart} - {offerCard.dataEnd}</p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Cena: {offerCard.price} PLN</p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Zobacz szczegóły</p>
        <a href="#"
           className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
          Zobacz PDF
        </a>
      </div>
    </div>
  )
}
