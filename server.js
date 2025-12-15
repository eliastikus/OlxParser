const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const querystring = require('querystring'); 

const app = express();
const port = 3001;

app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/listings', async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).send('No link provided');
  }

  try {
    let listings = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
      const queryParameters = {};
      if (currentPage > 1) queryParameters.page = currentPage;

      const queryStringified = querystring.stringify(queryParameters);
      const url = `${link}${queryStringified ? '?' + queryStringified : ''}`;

      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      if (currentPage === 1) {
        totalPages = parseInt($('.pagination-item').last().text(), 10) || 1;
      }

      $('.css-j0t2x2')
        .first()
        .find('.css-1sw7q4x')
        .each((_, element) => {
          const title = $(element).find('.css-16v5mdi.er34gjf0').text();
          const price = $(element)
            .find('.css-tyui9s.er34gjf0')
            .contents()
            .filter(function () {
              return this.type === 'text';
            })
            .text()
            .trim();
          const cityParts = $(element).find('.css-1a4brun.er34gjf0').text().split('-');
          const url = $(element).find('.css-z3gu2d').attr('href');
          const city = cityParts[0].trim();

          listings.push({
            title,
            price,
            city,
            url: 'https://www.olx.pl' + url,
          });
        });
      currentPage++;
    }

    res.json(listings);
  } catch (error) {
    console.error('Error loading page:', error);
    res.status(500).send('Error loading page');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
