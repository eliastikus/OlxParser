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

app.get('/listings', (req, res) => {
    const link = req.query.link;

    if (!link) {
        return res.status(400).send('No link provided');
    }

    axios.get(link)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            const listings = []; 

            $('.css-1sw7q4x').each((index, element) => {
                const title = $(element).find('.css-16v5mdi.er34gjf0').text();
                const price = $(element).find('.css-tyui9s.er34gjf0').text();
                const cityParts = $(element).find('.css-1a4brun.er34gjf0').text().split('-');
                
                const city = cityParts[0].trim();

                listings.push({
                    title: title,
                    price: price,
                    city: city
                });
            });

            res.json(listings);
        })
        .catch(error => {
            console.error('Error loading page:', error);
            res.status(500).send('fu$k');
        });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
