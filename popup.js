document.addEventListener('DOMContentLoaded', function () {
  const competitionsDiv = document.getElementById('competitions');
  const countrySelect = document.getElementById('country');
  const fetchButton = document.getElementById('fetch');

  // Hide the competitions div initially
  competitionsDiv.style.display = 'none';

  // Fetch competitions from the updated public JSON URL
  async function fetchCompetitions(countryCode) {
    try {
      // Construct the URL with the selected country code
      const url = `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/competitions/${countryCode}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Log data to understand its structure
      console.log('Fetched data:', data);

      // Check if data is an object with an 'items' property that is an array
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

    // If it's a single-day competition
    if (fromDate.getTime() === tillDate.getTime()) {
      return `${fromFormatted}, ${fromDate.getFullYear()}`;
    } else {
      return `${fromFormatted} - ${tillFormatted}, ${fromDate.getFullYear()}`;
    }
  }

  // Display competitions in grid
  function displayCompetitions(competitions) {
     // Show the competitions div when displaying results
    competitionsDiv.style.display = 'block';
    competitionsDiv.innerHTML = ''; // Clear previous results

    // Filter upcoming competitions
    const today = new Date();
    const upcomingCompetitions = competitions.filter((comp) => {
      const fromDate = new Date(comp.date.from);
      return fromDate >= today;
    });

    // Sort upcoming competitions by start date
    upcomingCompetitions.sort((a, b) => {
      const dateA = new Date(a.date.from);
      const dateB = new Date(b.date.from);
      return dateA - dateB;
    });

    if (!upcomingCompetitions || upcomingCompetitions.length === 0) {
      competitionsDiv.innerHTML = 'No upcoming competitions found.';
      return;
    }

    // Create a grid container
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = '1fr 2fr 1fr';
    gridContainer.style.gap = '10px';
    gridContainer.style.marginTop = '10px';

    // Add headers for the grid
    const headers = ['Competition Name', 'Location', 'Date'];
    const widths = ['130px', '120px', '130px'];
    headers.forEach((header, index) => {
      const headerDiv = document.createElement('div');
      headerDiv.textContent = header;
      headerDiv.style.fontWeight = 'bold';
      headerDiv.style.width = widths[index];
      gridContainer.appendChild(headerDiv);
    });

    // Add competitions to the grid
    upcomingCompetitions.forEach((comp) => {
      const nameDiv = document.createElement('div');
      const locationDiv = document.createElement('div');
      const dateDiv = document.createElement('div');

      // Create anchor for the competition name
      const nameLink = document.createElement('a');
      nameLink.textContent = comp.name || 'N/A';
      
      // Remove spaces from the competition name to construct the correct URL format
      const competitionName = comp.name ? comp.name.replace(/\s+/g, '') : '';
      nameLink.href = `https://www.worldcubeassociation.org/competitions/${competitionName}`;
      nameLink.target = '_blank';  // Open in a new tab

      // Append the link to the nameDiv
      nameDiv.appendChild(nameLink);

      locationDiv.textContent = `${comp.city || 'N/A'}, ${comp.country || 'N/A'}`;

      // Format date
      const fromDate = new Date(comp.date.from);
      const tillDate = new Date(comp.date.till);
      dateDiv.textContent = formatCompetitionDate(fromDate, tillDate);

      gridContainer.appendChild(nameDiv);
      gridContainer.appendChild(locationDiv);
      gridContainer.appendChild(dateDiv);
    });

    // Append the grid to the competitionsDiv
    competitionsDiv.appendChild(gridContainer);
  }

  // Fetch competitions on button click
  fetchButton.addEventListener('click', async function () {
    const selectedCountry = countrySelect.value;
    const competitions = await fetchCompetitions(selectedCountry);

    if (competitions) {
      displayCompetitions(competitions);
    } else {
      competitionsDiv.style.display = 'block';
      competitionsDiv.innerHTML = '<div class="grid no-competitions">No upcoming competitions found.</div>';
    }
  });
});
