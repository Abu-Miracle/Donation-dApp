import Navbar from './Navbar';

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-[url('/background.svg')] bg-cover bg-center">
      <div className="min-h-screen bg-black/50 flex flex-col">
        <Navbar />
        <div className='my-auto h-full flex flex-col items-center justify-center text-center px-4'>
          <div className="">
            <p className='text-[80px] font-bold text-white leading-[1.1] mb-0'>Empowering Donations with <br />
            <span className="block mt-2">Trust and Transparency</span></p>
            <p className="text-[55px] font-bold text-[var(--sblue)] mt-8">Powered by The Ethereum Blockchain</p>
            <p className='text-4xl font-light text-[#E9ECEB] mt-8'>Be a part of the breakthrough and make someone’s dream come true.</p>
          </div>
          <div className='mt-16'>
            <button className='bg-[var(--sblue)] text-black rounded-4xl text-3xl font-semibold p-5 px-20 cursor-pointer hover:bg-[var(--light-blue)]'>Donate Now</button>
            <button className='bg-transparent border-3 border-white text-white rounded-4xl text-3xl font-semibold p-5 px-10 ml-8 cursor-pointer hover:border-transparent hover:text-black hover:bg-[#E9ECEB]'>Create a Campaign</button>
          </div>
        </div>
      </div>
    </div>
   
  );
}