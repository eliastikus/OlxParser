function applyFilter() {
    const loader = document.querySelector('.loader');
    const table = document.querySelector('#listings-table');
    const selectedOption = document.getElementById('category-dropdown').options[document.getElementById('category-dropdown').selectedIndex];
    const selectedCategory = selectedOption.dataset.urlending;
    const minPrice = parseFloat(document.getElementById('min-price').value);
    const maxPrice = parseFloat(document.getElementById('max-price').value);

    if (selectedCategory) {
        showLoader(loader, table);
        const url = 'https://www.olx.pl/elektronika/komputery/podzespoly-i-czesci/q-' + selectedCategory + '/';
        fetchListings(url, minPrice, maxPrice, loader, table);
    } else {
        clearListings(table, loader);
    }
}

function showLoader(loader, table) {
    loader.style.display = 'block';
    table.style.display = 'none';
}

function fetchListings(url, minPrice, maxPrice, loader, table) {
    fetch('/listings?link=' + encodeURIComponent(url))
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#listings-table tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                displayListing(item, minPrice, maxPrice, tbody);
            });
            hideLoader(loader, table);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayListing(item, minPrice, maxPrice, tbody) {
    const cityParts = item.city.split('-');
    const city = cityParts[0].trim();
    const priceParts = item.price.split('.')[0].trim(); 
    const priceValue = parseFloat(priceParts.replace(/[^\d.-]/g, '')); 
    if (!isNaN(priceValue) && (isNaN(minPrice) || priceValue >= minPrice) && (isNaN(maxPrice) || priceValue <= maxPrice)) {
        const price = priceParts.replace('zł', 'zł  ');
        const tr = document.createElement('tr');
        
        const link = document.createElement('a');
        link.textContent = item.title;
        link.href = item.url;

        const tdTitle = document.createElement('td');
        tdTitle.appendChild(link);
        tr.appendChild(tdTitle);

        tr.innerHTML += '<td>' + price + '</td>' +
                        '<td class="city">' + city + '</td>';
        
        tbody.appendChild(tr);
    }
}


function hideLoader(loader, table) {
    loader.style.display = 'none';
    table.style.display = 'table';
}

function clearListings(table, loader) {
    document.querySelector('#listings-table tbody').innerHTML = '';
    loader.style.display = 'none';
    table.style.display = 'table';
}

document.getElementById('apply-filter').addEventListener('click', applyFilter);
