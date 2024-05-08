const gpuModels = [
    {
      name: '3050',
      imgURL: 'https://www.gigabyte.com/FileUpload/Global/KeyFeature/3648/innergigabyteimages/kf-img.png',
    },
    {
      name: '3060',
      imgURL: 'https://www.gigabyte.com/FileUpload/Global/KeyFeature/2160/innergigabyteimages/kf-img.png',
    },
    {
      name: '3060 Ti',
      imgURL: 'https://www.gigabyte.com/FileUpload/Global/KeyFeature/1910/innergigabyteimages/kf-img.png',
    },
    {
      name: '3070',
      imgURL:
        'https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/ampere/rtx-3070/geforce-rtx-3070-shop-600-p@2x.png',
    },
    {
      name: '3070 Ti',
      imgURL: 'https://www.gigabyte.com/FileUpload/Global/KeyFeature/1881/innergigabyteimages/kf-img.png',
    },
    {
      name: '6500 XT',
      imgURL: 'https://dlcdnwebimgs.asus.com/gain/4d7af692-c98e-43c0-8550-1573dcdde294/',
    },
    {
      name: '6600',
      imgURL: 'https://www.powercolor.com/_upload/images//2106211414120.png',
    },
    {
      name: '6600 XT',
      imgURL: 'https://www.amd.com/system/files/2021-07/910022-amd-radeon-6600XT-angle1260x709_0.png',
    },
    {
      name: '6650 XT',
      imgURL: 'https://a-power.com/app/uploads/2022/07/99873611_6303858573.png',
    },
    {
      name: '6700 XT',
      imgURL: 'https://dlcdnwebimgs.asus.com/gain/643cb170-7b45-4ce6-a59e-af140ce66c2c/w800',
    },
    {
      name: '6750 XT',
      imgURL: 'https://dlcdnwebimgs.asus.com/gain/FBB83F06-C7D1-42B5-9690-229B3A4C0A94/w717/h525',
    },
  ];
  
  let currentData = []; // Holds the current unfiltered data
  
  function showLoader(loader, table) {
    loader.style.display = 'flex';
    table.style.display = 'none';
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
  
  function changeGPUImage(gpu) {
    // Find the corresponding GPU model object
    const gpuModel = gpuModels.find((model) => model.name === gpu);
  
    // Update the image source if a corresponding GPU model is found
    if (gpuModel) {
      const imgElement = document.getElementById('gpu-img');
      imgElement.src = gpuModel.imgURL;
      imgElement.alt = 'Image of ' + gpuModel.name;
    }
  }
  
  function fetchListings(url, minPrice, maxPrice, loader, table) {
    showLoader(loader, table); // Show loader when fetching data
  
    const fullUrl = new URL(url);
  
    if (minPrice) fullUrl.searchParams.append('search[filter_float_price:from]', minPrice);
    if (maxPrice) fullUrl.searchParams.append('search[filter_float_price:to]', maxPrice);
  
    console.log('Fetching data from:', fullUrl.href);
  
    fetch(`/listings?link=${encodeURIComponent(fullUrl.href)}`)
      .then((response) => response.json())
      .then((data) => {
        currentData = data; // Store fetched data
        populateTable(data); // Populate table without filtering
        hideLoader(loader, table); // Hide loader after data is fetched
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        hideLoader(loader, table); // Hide loader if fetch fails
      });
  }
  
  function populateTable(data) {
    const tbody = document.querySelector('#listings-table tbody');
    tbody.innerHTML = ''; // Clear existing rows
    data.forEach((item) => {
      displayListing(item, tbody);
    });
  }
  
  function displayListing(item, tbody) {
    const tr = document.createElement('tr');
  
    // Add a class to the row if the item should be filtered out
    if (item.filteredOut) {
      tr.classList.add('filtered-out');
    }
  
    const link = document.createElement('a');
    link.textContent = item.title;
    link.href = item.url;
    link.target = '_blank'; // Link opens in a new tab
  
    const tdTitle = document.createElement('td');
    tdTitle.appendChild(link);
    tr.appendChild(tdTitle);
  
    const price = item.price.split('.')[0].trim();
    const priceTd = document.createElement('td');
    priceTd.textContent = price;
    priceTd.classList.add('price');
    tr.appendChild(priceTd);
  
    const cityTd = document.createElement('td');
    cityTd.classList.add('city');
    cityTd.textContent = item.city;
  
    // Check if the city name includes 'Kraków' and add the 'rainbow' class
    if (item.city.includes('Kraków')) {
      cityTd.classList.add('rainbow');
    }
  
    tr.appendChild(cityTd);
  
    tbody.appendChild(tr);
  }
  
  function applyFilter() {
    const loader = document.querySelector('.loader');
  
    const table = document.querySelector('#listings-table');
    const selectedOption =
      document.getElementById('category-dropdown').options[document.getElementById('category-dropdown').selectedIndex];
  
    changeGPUImage(selectedOption.value);
    const selectedCategory = selectedOption.dataset.urlending;
    const minPrice = parseFloat(document.getElementById('min-price').value);
    const maxPrice = parseFloat(document.getElementById('max-price').value);
  
    if (selectedCategory) {
      const url =
        'https://www.olx.pl/elektronika/komputery/podzespoly-i-czesci/karty-graficzne/q-' + selectedCategory + '/';
      fetchListings(url, minPrice, maxPrice, loader, table);
    } else {
      clearListings(table, loader);
    }
  }
  
  function filterIrrelevantResults() {
    const selectedOption = document.getElementById('category-dropdown').selectedOptions[0];
    const selectedCategory = selectedOption.value; // Using the value attribute
    const selectedModel = gpuModels.find((model) => model.name === selectedCategory).name;
  
    // Generate possible variants of the model name
  
    const allPossibleVariants = gpuModels.flatMap((model) =>
      model.name.split(' ').length > 1
        ? [model.name.split(' ').join('-'), model.name.split(' ').join(' '), model.name.split(' ').join('')].map(
            (variant) => variant.toLowerCase()
          )
        : model.name.toLowerCase()
    );
  
    const possibleSelectedVariants = [
      selectedModel.split(' ').join(''),
      selectedModel.split(' ').join('-'),
      selectedModel.split(' ').join(' '),
    ].map((variant) => variant.toLowerCase());
  
    currentData.forEach((item) => {
      const titleNormalized = item.title.toLowerCase();
  
      // Check if the title exactly matches any of the possible variants
      const isRelevant = possibleSelectedVariants.some((variant) => {
        return titleNormalized
          .match(/[a-z0-9]+/g)
          .join(' ')
          .includes(variant);
      });
  
      // Filter out entries based on the presence of other model names that could be supersets
      const includesIncorrectModel = allPossibleVariants
        .filter((variant) => possibleSelectedVariants.some((selected) => variant.includes(selected)))
        .some((model) => {
          return titleNormalized.includes(model) && !possibleSelectedVariants.includes(model);
        });
  
      // Set filteredOut status
      item.filteredOut = !isRelevant || includesIncorrectModel;
    });
  
    populateTable(currentData); // Populate the table with the updated currentData
  }
  
  document.getElementById('category-dropdown').addEventListener('change', applyFilter);
  document.getElementById('apply-filter').addEventListener('click', applyFilter);
  document.getElementById('filter-results').addEventListener('click', filterIrrelevantResults);
  