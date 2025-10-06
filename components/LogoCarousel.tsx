import React from 'react';

const logos = [
  'https://i.ibb.co/b3b03zY/UM-Logo-Vector-01.png',
  'https://i.ibb.co/C0bQ0OR/logo-cheng-shin-tire-cst-vector-logo.png',
  'https://i.ibb.co/hKz7xPz/original-be910972626c8e31b79f225574581f3b.png',
  'https://i.ibb.co/wRkL4M8/honda-powersports-logo-wings-decal-sticker-motorcycle-atv-sxs-powersports-png-z.png',
  'https://logos-world.net/wp-content/uploads/2020/07/Yamaha-Logo.png',
  'https://i.ibb.co/k3P4rGv/motorino-logo.png',
  'https://i.ibb.co/3YYxM0t/shinko-tire-logo.png',
  'https://i.ibb.co/yQJg9Qx/Logo-2-removebg-preview.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2017.svg/2560px-Suzuki_logo_2017.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/KTM-Logo.svg/2560px-KTM-Logo.svg.png'
];

const LogoCarousel: React.FC = () => {
  return (
    <div
      role="group"
      aria-label="Our Brands"
      className="w-full flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      <ul className="flex flex-shrink-0 items-center justify-start [&_li]:mx-8 [&_img]:max-w-none animate-slide">
        {logos.map((logo, index) => (
          <li key={`logo-a-${index}`}>
            <img src={logo} alt={`Brand Logo ${index + 1}`} className="h-10 object-contain" />
          </li>
        ))}
      </ul>
      <ul className="flex flex-shrink-0 items-center justify-start [&_li]:mx-8 [&_img]:max-w-none animate-slide" aria-hidden="true">
        {logos.map((logo, index) => (
          <li key={`logo-b-${index}`}>
            <img src={logo} alt={`Brand Logo ${index + 1}`} className="h-10 object-contain" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogoCarousel;