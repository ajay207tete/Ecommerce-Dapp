// Coin icons drawn inline (simplified versions of each coin's logo).
// Usage: <CoinIcon coin="ton" size={32} />
export default function CoinIcon({ coin, size = 32 }) {
  const p = { width: size, height: size, viewBox: '0 0 32 32', role: 'img' };

  switch (coin) {
    case 'ton':
      return (
        <svg {...p} aria-label="TON">
          <circle cx="16" cy="16" r="16" fill="#0098EA" />
          <path
            d="M9.2 9.6h13.6c.8 0 1.3.9.9 1.6L17 22.6a1.1 1.1 0 0 1-2 0L8.3 11.2c-.4-.7.1-1.6.9-1.6z"
            fill="#fff"
          />
          <path d="M16 9.8V21.6" stroke="#0098EA" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'bnb':
      return (
        <svg {...p} aria-label="BNB">
          <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
          <g fill="#fff">
            <path d="M16 13.2L18.8 16L16 18.8L13.2 16Z" />
            <path d="M16 7.6L19.4 11L17.9 12.5L16 10.6L14.1 12.5L12.6 11Z" />
            <path d="M16 24.4L19.4 21L17.9 19.5L16 21.4L14.1 19.5L12.6 21Z" />
            <path d="M7.6 16L11 12.6L12.5 14.1L10.6 16L12.5 17.9L11 19.4Z" />
            <path d="M24.4 16L21 12.6L19.5 14.1L21.4 16L19.5 17.9L21 19.4Z" />
          </g>
        </svg>
      );

    case 'usdt':
      return (
        <svg {...p} aria-label="USDT">
          <circle cx="16" cy="16" r="16" fill="#26A17B" />
          <rect x="8.5" y="8" width="15" height="3.2" fill="#fff" />
          <rect x="14.4" y="11" width="3.2" height="13" fill="#fff" />
          <ellipse cx="16" cy="15.4" rx="7.6" ry="2.3" fill="none" stroke="#fff" strokeWidth="1.5" />
        </svg>
      );

    case 'btc':
      return (
        <svg {...p} aria-label="Bitcoin">
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <text
            x="16"
            y="22.2"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="#fff"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            B
          </text>
          <rect x="13" y="6.4" width="1.6" height="3" fill="#fff" />
          <rect x="17" y="6.4" width="1.6" height="3" fill="#fff" />
          <rect x="13" y="22.6" width="1.6" height="3" fill="#fff" />
          <rect x="17" y="22.6" width="1.6" height="3" fill="#fff" />
        </svg>
      );

    case 'eth':
      return (
        <svg {...p} aria-label="Ethereum">
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <g fill="#fff">
            <path d="M16 5L9.2 16.2L16 13.2Z" opacity=".6" />
            <path d="M16 5L22.8 16.2L16 13.2Z" />
            <path d="M16 13.2L9.2 16.2L16 20.1Z" opacity=".45" />
            <path d="M16 13.2L22.8 16.2L16 20.1Z" opacity=".8" />
            <path d="M9.2 17.6L16 21.5V27L9.2 17.6Z" opacity=".6" />
            <path d="M22.8 17.6L16 21.5V27L22.8 17.6Z" />
          </g>
        </svg>
      );

    case 'sol':
      return (
        <svg {...p} aria-label="Solana">
          <defs>
            <linearGradient id="th-sol-grad" x1="6" y1="22" x2="26" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#9945FF" />
              <stop offset="1" stopColor="#14F195" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="16" fill="#0B0B0F" />
          <path d="M10.5 9.6H24l-2.2 2.5H8.3Z" fill="url(#th-sol-grad)" />
          <path d="M8.3 14.7H21.8L24 17.2H10.5Z" fill="url(#th-sol-grad)" />
          <path d="M10.5 19.8H24l-2.2 2.5H8.3Z" fill="url(#th-sol-grad)" />
        </svg>
      );

    default:
      return (
        <svg {...p} aria-hidden="true">
          <circle cx="16" cy="16" r="16" fill="#262626" />
        </svg>
      );
  }
}