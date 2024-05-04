const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3001;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
    app.use(express.static('public'));
});

app.get('/listings', async (req, res) => {
    const link = req.query.link;

    if (!link) {
        return res.status(400).send('No link provided');
    }

    let totalPages = 2;
    let currentPage = 1;

    try {
        let allListings = [];

        while (currentPage <= totalPages) {
            const response = await axios.get(`${link}?page=${currentPage}`);
            const html = response.data;
            const $ = cheerio.load(html);

            if ($('.css-pyu9k9').length > 0) {
                totalPages++;
            }

            const listings = [];

            $('.css-1sw7q4x').each((index, element) => {
                const title = $(element).find('.css-16v5mdi.er34gjf0').text();
                const price = $(element).find('.css-tyui9s.er34gjf0').text();
                const cityParts = $(element).find('.css-1a4brun.er34gjf0').text().split('-');
                const url = $(element).find('.css-z3gu2d').attr('href');
                const city = cityParts[0].trim();

                listings.push({
                    title: title,
                    price: price,
                    city: city,
                    url: "https://www.olx.pl" + url
                });
            });

            allListings = allListings.concat(listings);
            currentPage++;
        }

        res.json(allListings);
    } catch (error) {
        console.error('Error loading page:', error);
        res.status(500).send('Error loading page');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
