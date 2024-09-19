import logo from '../assets/udanyrejs/logo.png'
import waveLeft from '../assets/navbar/wave-left.png'
import waveRight from '../assets/navbar/wave-right.png'

export default function Navbar() {
  return (
    <nav className="bg-b border-b-4 border-secondary">
      <div className="max-w-screen-xl flex justify-between items-end mx-auto">

        <img src={waveLeft} className="h-8 p-0" alt="Left Wave"/>

        <div className="flex justify-between p-4 items-center">
          <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse mr-8">
            <span className="self-center text-xl font-semibold whitespace-nowrap">Oferty</span>
          </a>

          <div className="flex items-center justify-center mx-28">
            <img src={logo} className="h-10 mx-4" alt="UdanyRejs Logo"/>
          </div>

          <a href="/contact" className="flex items-center space-x-3 rtl:space-x-reverse ml-8">
            <span className="self-center text-xl font-semibold whitespace-nowrap">Kontakt</span>
          </a>
        </div>


        <img src={waveRight} className="h-8" alt="Right Wave"/>
      </div>
    </nav>
  )
}
