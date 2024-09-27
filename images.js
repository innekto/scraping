const images = [
  'https://img2.ans-media.com/i/200x300/AW22-SUD0Z8-01X_F1.webp?v=1725456620 1x,\n' +
    '                     https://img2.ans-media.com/i/400x600/AW22-SUD0Z8-01X_F1.webp?v=1725456620 2x',
  'https://img2.ans-media.com/i/300x450/AW22-SUD0Z8-01X_F1.webp?v=1725456620 1x,\n' +
    '                     https://img2.ans-media.com/i/600x900/AW22-SUD0Z8-01X_F1.webp?v=1725456620 2x',
  'https://img2.ans-media.com/i/400x600/AW22-SUD0Z8-01X_F1.webp?v=1725456620 1x,\n' +
    '                     https://img2.ans-media.com/i/800x1200/AW22-SUD0Z8-01X_F1.webp?v=1725456620 2x',
  'https://img2.ans-media.com/i/628x942/AW22-SUD0Z8-01X_F1.webp?v=1725456620 1x,\n' +
    '                     https://img2.ans-media.com/i/1256x1884/AW22-SUD0Z8-01X_F1.webp?v=1725456620 2x',
];

const urls = images.map((i) => {
  const url = i.split(',').map((s) => s.trim().split(' ')[0]);
  return url;
});

console.log('urls :>> ', urls);
