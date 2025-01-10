document.addEventListener('DOMContentLoaded', function () {
  const competitionsDiv = document.getElementById('competitions');
  const countrySelect = document.getElementById('country');
  const fetchButton = document.getElementById('fetch');
  const savePreferenceButton = document.getElementById('save-preference');
  const changeCountryButton = document.getElementById('change-country');
  const countrySelectionDiv = document.getElementById('country-selection');

  // Hide the competitions div initially
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
  async function fetchCompetitions(countryCode) {
    try {
      const url = `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/competitions/${countryCode}.json`;
      const response = await fetch(url);
  
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No data found for country code: ${countryCode}`);
          return [];
        }
        throw new Error(`API Request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Fetched data:', data);
  
      if (data && data.items && Array.isArray(data.items)) {
        return data.items;
      } else {
        throw new Error('Unexpected data structure');
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
      return null;
    }
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
    gridContainer.style.gridTemplateColumns = '1fr 2fr 1fr';
    gridContainer.style.gap = '10px';
    gridContainer.style.marginTop = '10px';

    const headers = ['Competition Name', 'Location', 'Date'];
    const widths = ['130px', '120px', '130px'];
    headers.forEach((header, index) => {
      const headerDiv = document.createElement('div');
      headerDiv.textContent = header;
      headerDiv.style.fontWeight = 'bold';
      headerDiv.style.width = widths[index];
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

      locationDiv.textContent = `${comp.city || 'N/A'}, ${comp.country || 'N/A'}`;

      const fromDate = new Date(comp.date.from);
      const tillDate = new Date(comp.date.till);
      dateDiv.textContent = formatCompetitionDate(fromDate, tillDate);

      gridContainer.appendChild(nameDiv);
      gridContainer.appendChild(locationDiv);
      gridContainer.appendChild(dateDiv);
    });

    competitionsDiv.appendChild(gridContainer);
  }

  // Save country preference
  function saveCountryPreference(countryCode) {
    chrome.storage.sync.set({ preferredCountry: countryCode }, function() {
      console.log('Country preference saved');
      countrySelectionDiv.style.display = 'none';
      changeCountryButton.style.display = 'inline-block';
      fetchButton.style.display = 'none';
      fetchCompetitionsForCountry(countryCode);
    });
  }

  // Load country preference
  function loadCountryPreference() {
    chrome.storage.sync.get(['preferredCountry'], function(result) {
      if (result.preferredCountry) {
        countrySelect.value = result.preferredCountry;
        countrySelectionDiv.style.display = 'none';
        changeCountryButton.style.display = 'inline-block';
        fetchButton.style.display = 'none';
        fetchCompetitionsForCountry(result.preferredCountry);
      }
    });
  }

  // Fetch competitions for a country
  async function fetchCompetitionsForCountry(countryCode) {
    const competitions = await fetchCompetitions(countryCode);
    if (competitions && competitions.length > 0) {
      displayCompetitions(competitions);
    } else {
      competitionsDiv.style.display = 'block';
      competitionsDiv.innerHTML = '<div class="no-competitions">No upcoming competitions found for this country.</div>';
    }
  }

  // Fetch competitions on button click
  fetchButton.addEventListener('click', async function () {
    const selectedCountry = countrySelect.value;
    if (selectedCountry) {
      fetchCompetitionsForCountry(selectedCountry);
    } else {
      alert('Please select a country first.');
    }
  });

  // Save preference on button click
  savePreferenceButton.addEventListener('click', function () {
    const selectedCountry = countrySelect.value;
    if (selectedCountry) {
      saveCountryPreference(selectedCountry);
    } else {
      alert('Please select a country first.');
    }
  });

  // Change country button click
  changeCountryButton.addEventListener('click', function () {
    countrySelectionDiv.style.display = 'block';
    changeCountryButton.style.display = 'none';
    fetchButton.style.display = 'inline-block';
    chrome.storage.sync.remove('preferredCountry');
    competitionsDiv.style.display = 'none';
  });

  // Load country preference on popup open
  loadCountryPreference();
});