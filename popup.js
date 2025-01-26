document.addEventListener('DOMContentLoaded', function () {
  const competitionsDiv = document.getElementById('competitions');
  const countrySelect = document.getElementById('country');
  const fetchButton = document.getElementById('fetch');
  const savePreferenceButton = document.getElementById('save-preference');
  const changeCountriesButton = document.getElementById('change-countries');
  const countrySelectionDiv = document.getElementById('country-selection');
  const selectedCountriesDiv = document.querySelector('.selected-countries');

  let selectedCountries = [];

  competitionsDiv.style.display = 'none';

  // Fetch countries from REST Countries API
  async function fetchCountries() {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
      if (!response.ok) {
        throw new Error(`API Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return null;
    }
  }

  // Populate country dropdown
  async function populateCountryDropdown() {
    const countries = await fetchCountries();
    if (countries) {
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.cca2;
        option.textContent = country.name.common;
        countrySelect.appendChild(option);
      });
    }
  }

  // Call the function to populate the dropdown
  populateCountryDropdown();

  // Fetch competitions from the updated public JSON URL
  async function fetchCompetitions(countryCodes) {
    const allCompetitions = [];
    for (const countryCode of countryCodes) {
      try {
        const url = `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/competitions/${countryCode}.json`;
        const response = await fetch(url);
    
        if (!response.ok) {
          if (response.status === 404) {
            console.log(`No data found for country code: ${countryCode}`);
            continue;
          }
          throw new Error(`API Request failed with status ${response.status}`);
        }
    
        const data = await response.json();
        console.log(`Fetched data for ${countryCode}:`, data);
    
        if (data && data.items && Array.isArray(data.items)) {
          allCompetitions.push(...data.items);
        } else {
          throw new Error('Unexpected data structure');
        }
      } catch (error) {
        console.error(`Error fetching competitions for ${countryCode}:`, error);
      }
    }
    return allCompetitions;
  }

  // Format date based on whether it's a single-day or multi-day competition
  function formatCompetitionDate(fromDate, tillDate) {
    const options = { month: 'short', day: 'numeric' };
    const fromFormatted = fromDate.toLocaleDateString('en-US', options);
    const tillFormatted = tillDate.toLocaleDateString('en-US', { day: 'numeric' });

    if (fromDate.getTime() === tillDate.getTime()) {
      return `${fromFormatted}, ${fromDate.getFullYear()}`;
    } else {
      return `${fromFormatted} - ${tillFormatted}, ${fromDate.getFullYear()}`;
    }
  }

  // Display competitions in grid
  function displayCompetitions(competitions) {
    competitionsDiv.style.display = 'block';
    competitionsDiv.innerHTML = '';

    const today = new Date();
    const upcomingCompetitions = competitions.filter((comp) => {
      const fromDate = new Date(comp.date.from);
      return fromDate >= today;
    });

    upcomingCompetitions.sort((a, b) => {
      const dateA = new Date(a.date.from);
      const dateB = new Date(b.date.from);
      return dateA - dateB;
    });

    if (!upcomingCompetitions || upcomingCompetitions.length === 0) {
      competitionsDiv.innerHTML = '<div class="no-competitions">No upcoming competitions found.</div>';
      return;
    }

    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.gap = '10px';
    gridContainer.style.marginTop = '10px';

    const headers = ['Competition Name', 'Location', 'Date'];
    if (selectedCountries.length > 1) {
      headers.push('Country');
      gridContainer.style.gridTemplateColumns = '1fr 1fr 1fr 0.5fr';
    } else {
      gridContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
    }

    headers.forEach((header) => {
      const headerDiv = document.createElement('div');
      headerDiv.textContent = header;
      headerDiv.style.fontWeight = 'bold';
      gridContainer.appendChild(headerDiv);
    });

    upcomingCompetitions.forEach((comp) => {
      const nameDiv = document.createElement('div');
      const locationDiv = document.createElement('div');
      const dateDiv = document.createElement('div');

      const nameLink = document.createElement('a');
      nameLink.textContent = comp.name || 'N/A';
      
      const competitionName = comp.name ? comp.name.replace(/\s+/g, '') : '';
      nameLink.href = `https://www.worldcubeassociation.org/competitions/${competitionName}`;
      nameLink.target = '_blank';

      nameDiv.appendChild(nameLink);

      if (selectedCountries.length > 1) {
        locationDiv.textContent = comp.city || 'N/A';
      } else {
        locationDiv.textContent = `${comp.city || 'N/A'}, ${comp.country || 'N/A'}`;
      }

      const fromDate = new Date(comp.date.from);
      const tillDate = new Date(comp.date.till);
      dateDiv.textContent = formatCompetitionDate(fromDate, tillDate);

      gridContainer.appendChild(nameDiv);
      gridContainer.appendChild(locationDiv);
      gridContainer.appendChild(dateDiv);

      if (selectedCountries.length > 1) {
        const countryDiv = document.createElement('div');
        countryDiv.textContent = comp.country || 'N/A';
        gridContainer.appendChild(countryDiv);
      }
    });

    competitionsDiv.appendChild(gridContainer);
  }

   // Save country preference
  function saveCountryPreferences(countryCodes) {
    chrome.storage.sync.set({ preferredCountries: countryCodes }, function() {
      console.log('Country preferences saved');
      countrySelectionDiv.style.display = 'none';
      changeCountriesButton.style.display = 'inline-block';
      fetchButton.style.display = 'none';
      fetchCompetitionsForCountries(countryCodes);
    });
  }

  // Load country preference
  function loadCountryPreferences() {
    chrome.storage.sync.get(['preferredCountries'], function(result) {
      if (result.preferredCountries && result.preferredCountries.length > 0) {
        // Restore saved countries immediately
        selectedCountries = result.preferredCountries;
        
        // Ensure country dropdown is populated before updating display
        function continueLoad() {
          if (countrySelect.options.length > 1) {
            updateSelectedCountriesDisplay();
            countrySelectionDiv.style.display = 'none';
            changeCountriesButton.style.display = 'inline-block';
            fetchButton.style.display = 'none';
            fetchCompetitionsForCountries(selectedCountries);
          } else {
            // If dropdown not ready, wait and retry
            setTimeout(continueLoad, 100);
          }
        }
        
        continueLoad();
      } else {
        // If no saved preferences, show country selection
        countrySelectionDiv.style.display = 'block';
        changeCountriesButton.style.display = 'none';
        fetchButton.style.display = 'inline-block';
      }
    });
  }

  // Fetch competitions for a country
  async function fetchCompetitionsForCountries(countryCodes) {
    const competitions = await fetchCompetitions(countryCodes);
    if (competitions && competitions.length > 0) {
      displayCompetitions(competitions);
    } else {
      competitionsDiv.style.display = 'block';
      competitionsDiv.innerHTML = '<div class="no-competitions">No upcoming competitions found for the selected countries.</div>';
    }
  }

  function updateSelectedCountriesDisplay() {
    selectedCountriesDiv.innerHTML = '';
    selectedCountries.forEach(countryCode => {
      const countryName = countrySelect.querySelector(`option[value="${countryCode}"]`).textContent;
      const countryElement = document.createElement('span');
      countryElement.className = 'selected-country';
      countryElement.textContent = countryName;
      const removeButton = document.createElement('span');
      removeButton.className = 'remove-country';
      removeButton.textContent = '×';
      removeButton.onclick = () => removeCountry(countryCode);
      countryElement.appendChild(removeButton);
      selectedCountriesDiv.appendChild(countryElement);
    });
  }

  function removeCountry(countryCode) {
    selectedCountries = selectedCountries.filter(code => code !== countryCode);
    updateSelectedCountriesDisplay();
  }

  countrySelect.addEventListener('change', function() {
    const selectedCountry = this.value;
    if (selectedCountry && !selectedCountries.includes(selectedCountry)) {
      if (selectedCountries.length < 5) {
        selectedCountries.push(selectedCountry);
        updateSelectedCountriesDisplay();
      } else {
        alert('You can select a maximum of 5 countries.');
      }
    }
    this.selectedIndex = 0; // Reset dropdown to default option
  });

  fetchButton.addEventListener('click', async function () {
    if (selectedCountries.length > 0) {
      fetchCompetitionsForCountries(selectedCountries);
    } else {
      alert('Please select at least one country.');
    }
  });

  savePreferenceButton.addEventListener('click', function () {
    if (selectedCountries.length > 0 && selectedCountries.length <= 5) {
      saveCountryPreferences(selectedCountries);
    } else if (selectedCountries.length > 5) {
      alert('Please select a maximum of 5 countries.');
    } else {
      alert('Please select at least one country.');
    }
  });

  changeCountriesButton.addEventListener('click', function () {
    countrySelectionDiv.style.display = 'block';
    changeCountriesButton.style.display = 'none';
    fetchButton.style.display = 'inline-block';
    chrome.storage.sync.remove('preferredCountries');
    competitionsDiv.style.display = 'none';
    selectedCountries = [];
    updateSelectedCountriesDisplay();
  });

  loadCountryPreferences();
});