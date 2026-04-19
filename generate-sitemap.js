const fs = require('fs');

const KANDAS = [
  'BalaKanda', 'AyodhyaKanda', 'AranyaKanda', 'KishkindhaKanda', 
  'SundaraKanda', 'YuddhaKanda', 'UttaraKanda'
];

let urls = [
  '<url><loc>https://prashanthbhat203.github.io/ramayana_hymns/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>'
];

KANDAS.forEach(kanda => {
  urls.push(`<url><loc>https://prashanthbhat203.github.io/ramayana_hymns/#kanda/${kanda}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
  
  const data = JSON.parse(fs.readFileSync(`data/${kanda}.json`));
  const sargas = [...new Set(data.map(v => v.sarga))];
  
  sargas.forEach(sarga => {
    urls.push(`<url><loc>https://prashanthbhat203.github.io/ramayana_hymns/#read/${kanda}/${sarga}</loc><changefreq>yearly</changefreq><priority>0.6</priority></url>`);
  });
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n  ')}
</urlset>`;

fs.writeFileSync('sitemap.xml', sitemap);
console.log('Sitemap generated successfully with', urls.length, 'URLs.');
