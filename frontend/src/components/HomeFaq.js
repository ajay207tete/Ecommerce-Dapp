const faqs = [
  {
    q: 'What is THRUSTER?',
    a: 'THRUSTER is a Web3 marketplace on the TON blockchain where you can buy clothing and book hotels, and pay with crypto or INR.',
  },
  {
    q: 'Which cryptocurrencies can I pay with?',
    a: 'You can pay with TON, USDT (on TON, TRON or BNB Chain), BNB, Bitcoin, Ethereum and Solana. INR payments are also accepted.',
  },
  {
    q: 'What are the NFT benefits?',
    a: 'Purchases and hotel bookings earn NFT rewards. They appear in your NFT gallery, and hotel booking NFTs include your booking details.',
  },
  {
    q: 'Do I need a crypto wallet?',
    a: 'To pay in TON and to receive and view NFTs, connect a TON wallet such as Tonkeeper or MyTonWallet. INR payments do not need a wallet.',
  },
  {
    q: 'Can I book hotels on THRUSTER?',
    a: 'Yes. Search hotels by name or location, choose your dates and guests, and pay with crypto or INR.',
  },
];

const HomeFaq = () => (
  <section className="py-16 px-1" aria-labelledby="faq-title">
    <div className="max-w-4xl mx-auto">
      <h2 id="faq-title" className="text-4xl md:text-5xl font-bold mb-8">
        Common <span className="text-[#fcee0a]">questions</span>
      </h2>

      <div className="space-y-[2px] bg-[#262626]">
        {faqs.map(({ q, a }) => (
          <details key={q} className="group bg-[#0d0d0d] p-5">
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4 text-lg font-semibold text-white">
              {q}
              <span className="text-[#fcee0a] text-2xl leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-white/70">{a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default HomeFaq;