import OfferCard from "./offerCard.tsx";

import productImage from '../assets/msc.jpg'

export default function Home() {
  const offerts = [
    {
      id: 1,
      title: "MSC FIORDY",
      dateStart: "15.03.2025",
      dateEnd: "15.03.2025",
      price: 2499,
      image: productImage
    },
    {
      id: 2,
      title: "Karaiby z Miami",
      dateStart: "15.03.2025",
      dateEnd: "15.03.2025",
      price: 2999,
      image: productImage
    },
    {
      id: 3,
      title: "Rejs po Morzu Śródziemnym",
      dateStart: "15.03.2025",
      dateEnd: "15.03.2025",
      price: 1999,
      image: productImage
    }
  ];

  return (
    <div className="p-5 flex flex-wrap justify-center">
      {offerts.map((offer) => (
        <OfferCard
          key={offer.id}
          id={offer.id}
          title={offer.title}
          dataStart={offer.dateStart}
          dataEnd={offer.dateEnd}
          price={offer.price}
          image={offer.image}
        />
      ))}
    </div>
  )
}
