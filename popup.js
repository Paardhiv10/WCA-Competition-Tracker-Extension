document.addEventListener("DOMContentLoaded", () => {
  // DOM element references
  const competitionsDiv = document.getElementById("competitions")
  const countrySelect = document.getElementById("country")
  const fetchButton = document.getElementById("fetch")
  const savePreferenceButton = document.getElementById("save-preference")
  const changeCountriesButton = document.getElementById("change-countries")
  const countrySelectionDiv = document.getElementById("country-selection")
  const selectedCountriesDiv = document.querySelector(".selected-countries")
  const eventFilter = document.getElementById("event-filter")
  const selectedEventsDiv = document.querySelector(".selected-events")
  const durationFilter = document.getElementById("duration-filter")
  const fetchLocationButton = document.getElementById("fetch-location")
  const removeLocationButton = document.getElementById("remove-location")
  const monthFilter = document.getElementById("month-filter")

  // State variables
  let selectedCountries = []
  let selectedEvents = []
  let allCompetitions = []
  let userLocation = null
  let useLocationSorting = false
  let userCountry = null

  // Event names mapping
  const eventNames = {
    333: "3x3x3 Cube",
    222: "2x2x2 Cube",
    444: "4x4x4 Cube",
    555: "5x5x5 Cube",
    pyram: "Pyraminx",
    skewb: "Skewb",
    sq1: "Square-1",
    "333oh": "3x3x3 One-Handed",
    clock: "Clock",
    minx: "Megaminx",
    "333bf": "3x3x3 Blindfolded",
    "333fm": "3x3x3 Fewest Moves",
    666: "6x6x6 Cube",
    777: "7x7x7 Cube",
    "333mbf": "3x3x3 Multi Blind",
    "444bf": "4x4x4 Blindfolded",
    "555bf": "5x5x5 Blindfolded",
  }

  competitionsDiv.style.display = "none"

  // Theme management
  const themeButton = document.getElementById("theme-button")
  const themeDropdown = document.getElementById("theme-dropdown")
  const themeOptions = document.querySelectorAll(".theme-option")

  // Function to get country from coordinates
  async function getCountryFromCoordinates(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      )
      const data = await response.json()
      return data.countryCode
    } catch (error) {
      console.error("Error getting country from coordinates:", error)
      return null
    }
  }

  // Function to fetch user location
  async function fetchUserLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        userCountry = await getCountryFromCoordinates(userLocation.latitude, userLocation.longitude)

        useLocationSorting = true
        fetchLocationButton.style.display = "none"
        removeLocationButton.style.display = "inline-block"

        if (selectedCountries.length === 0) {
          await fetchCompetitionsForCountries([userCountry])
        } else {
          await fetchCompetitionsForCountries(selectedCountries)
        }
      },
      () => {
        alert("Please enable location access in your browser settings to view nearest competitions.")
        useLocationSorting = false
        fetchLocationButton.style.display = "inline-block"
        removeLocationButton.style.display = "none"
      }
    )
  }

  // Event listener for location button
  fetchLocationButton.addEventListener("click", () => {
    fetchUserLocation()
  })

  // Event listener for removing location
  removeLocationButton.addEventListener("click", () => {
    useLocationSorting = false
    userCountry = null
    fetchLocationButton.style.display = "inline-block"
    removeLocationButton.style.display = "none"

    if (selectedCountries.length > 0) {
      fetchCompetitionsForCountries(selectedCountries)
    } else {
      competitionsDiv.style.display = "none"
    }
  })

  // Function to fetch countries from REST Countries API
  async function fetchCountries() {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2")
      if (!response.ok) {
        throw new Error(`API Request failed with status ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching countries:", error)
      return null
    }
  }

  // Function to populate country dropdown
  async function populateCountryDropdown() {
    const countries = await fetchCountries()
    if (countries) {
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common))
      countries.forEach((country) => {
        const option = document.createElement("option")
        option.value = country.cca2
        option.textContent = country.name.common
        countrySelect.appendChild(option)
      })
    }
  }

  // Call the function to populate the dropdown
  populateCountryDropdown()

  // Function to fetch competitions
  async function fetchCompetitions(countryCodes) {
    const allCompetitions = []

    for (const countryCode of countryCodes) {
      try {
        const url = `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/competitions/${countryCode}.json`
        const response = await fetch(url)

        if (!response.ok) {
          if (response.status === 404) {
            console.log(`No data found for country code: ${countryCode}`)
            continue
          }
          throw new Error(`API Request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (data && data.items && Array.isArray(data.items)) {
          const competitionsWithCountryCode = data.items.map((comp) => ({
            ...comp,
            countryCode: countryCode,
          }))
          allCompetitions.push(...competitionsWithCountryCode)
        }
      } catch (error) {
        console.error(`Error fetching competitions for ${countryCode}:`, error)
      }
    }
    return allCompetitions
  }

  // Function to format competition date
  function formatCompetitionDate(fromDate, tillDate) {
    const options = { month: "short", day: "numeric" }
    const fromFormatted = fromDate.toLocaleDateString("en-US", options)
    const tillFormatted = tillDate.toLocaleDateString("en-US", { day: "numeric" })

    if (fromDate.getTime() === tillDate.getTime()) {
      return `${fromFormatted}, ${fromDate.getFullYear()}`
    } else {
      return `${fromFormatted} - ${tillFormatted}, ${fromDate.getFullYear()}`
    }
  }

  // Function to calculate distance between two points using Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
  }

// Function to clean competition name for URL
function cleanCompetitionNameForUrl(name) {
  if (!name) return "";
  
  // Character mappings for special characters
  const charMap = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 'ã': 'a', 'ä': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i', 'ï': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o', 'õ': 'o', 'ö': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n',
    'ś': 's', 'š': 's',
    'ź': 'z', 'ž': 'z',
    'č': 'c',
    'ř': 'r',
    'ā': 'a',
    'ē': 'e',
    'ī': 'i',
    'ū': 'u',
    'ģ': 'g',
    'ķ': 'k',
    'ļ': 'l',
    'ņ': 'n',
    'ř': 'r',
    'š': 's',
    'ž': 'z',
    'ß': 'ss',
    'æ': 'ae',
    'ø': 'o',
    'å': 'a'
  };

  return name
    // Convert special characters to their basic Latin equivalents
    .toLowerCase()
    .split('')
    .map(char => charMap[char] || char)
    .join('')
    // Replace ' and ' with 'n'
    .replace(/'\s*n\s*'/gi, 'n')
    // Replace single quotes
    .replace(/'/g, '')
    // Replace any remaining special characters and spaces
    .replace(/[^a-zA-Z0-9]/g, '')
    // Capitalize first letter of each word
    .replace(/\b\w/g, c => c.toUpperCase());
  }

  // Function to display competitions
  function displayCompetitions(competitions) {
    competitionsDiv.style.display = "block"
    competitionsDiv.innerHTML = ""

    const today = new Date()
    const upcomingCompetitions = competitions.filter((comp) => {
      const fromDate = new Date(comp.date.from)
      return fromDate >= today
    })

    if (useLocationSorting && userLocation) {
      upcomingCompetitions.sort((a, b) => {
        if (a.venue && a.venue.coordinates && b.venue && b.venue.coordinates) {
          const distanceA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.venue.coordinates.latitude,
            a.venue.coordinates.longitude,
          )
          const distanceB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.venue.coordinates.latitude,
            b.venue.coordinates.longitude,
          )
          return distanceA - distanceB
        } else {
          return 0
        }
      })
    } else {
      upcomingCompetitions.sort((a, b) => {
        const dateA = new Date(a.date.from)
        const dateB = new Date(b.date.from)
        return dateA - dateB
      })
    }

    if (!upcomingCompetitions || upcomingCompetitions.length === 0) {
      competitionsDiv.innerHTML =
        '<div class="no-competitions">No upcoming competitions found in your country. Try selecting countries manually.</div>'
      return
    }

    const gridContainer = document.createElement("div")
    gridContainer.style.display = "grid"
    gridContainer.style.gap = "10px"
    gridContainer.style.marginTop = "10px"

    const headers = ["Competition Name", "Location", "Date"]
    if (useLocationSorting && userLocation) {
      headers.push("Distance")
      gridContainer.style.gridTemplateColumns = "1fr 1fr 1fr 0.5fr"
    } else {
      gridContainer.style.gridTemplateColumns = "1fr 1fr 1fr"
    }

    headers.forEach((header) => {
      const headerDiv = document.createElement("div")
      headerDiv.textContent = header
      headerDiv.style.fontWeight = "bold"
      gridContainer.appendChild(headerDiv)
    })

    upcomingCompetitions.forEach((comp) => {
      const { name, city, country, countryCode, date, venue } = comp
      const nameDiv = document.createElement("div")
      const locationDiv = document.createElement("div")
      const dateDiv = document.createElement("div")

      const nameLink = document.createElement("a")
      const flagImg = document.createElement("img")
      flagImg.src = `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`
      flagImg.className = "country-flag"
      flagImg.alt = `${country} flag`
      nameLink.appendChild(flagImg)
      nameLink.appendChild(document.createTextNode(name || "N/A"))

      const cleanedCompetitionName = cleanCompetitionNameForUrl(name)
      nameLink.href = `https://www.worldcubeassociation.org/competitions/${cleanedCompetitionName}`
      nameLink.target = "_blank"

      nameDiv.appendChild(nameLink)
      locationDiv.textContent = `${city || "N/A"}, ${country || "N/A"}`

      const fromDate = new Date(date.from)
      const tillDate = new Date(date.till)
      dateDiv.textContent = formatCompetitionDate(fromDate, tillDate)

      gridContainer.appendChild(nameDiv)
      gridContainer.appendChild(locationDiv)
      gridContainer.appendChild(dateDiv)

      if (useLocationSorting && userLocation && venue && venue.coordinates) {
        const distanceDiv = document.createElement("div")
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          venue.coordinates.latitude,
          venue.coordinates.longitude,
        )
        distanceDiv.textContent = `${distance.toFixed(0)} km`
        gridContainer.appendChild(distanceDiv)
      }
    })

    competitionsDiv.appendChild(gridContainer)
  }

  // Function to save country preferences
  function saveCountryPreferences(countryCodes) {
    chrome.storage.sync.set({ preferredCountries: countryCodes }, () => {
      console.log("Country preferences saved")
      countrySelectionDiv.style.display = "none"
      changeCountriesButton.style.display = "inline-block"
      fetchButton.style.display = "none"
      fetchCompetitionsForCountries(countryCodes)
    })
  }

  // Function to load country preferences
  function loadCountryPreferences() {
    chrome.storage.sync.get(['preferredCountries'], function(result) {
      if (result.preferredCountries && result.preferredCountries.length > 0) {
        selectedCountries = result.preferredCountries;
        
        // Wait for dropdown to be populated before updating display
        function continueLoad() {
          if (countrySelect.options.length > 1) {
            updateSelectedCountriesDisplay();
            countrySelectionDiv.style.display = 'none';
            changeCountriesButton.style.display = 'inline-block';
            fetchButton.style.display = 'none';
            fetchCompetitionsForCountries(selectedCountries);
          } else {
            setTimeout(continueLoad, 100); // Retry if dropdown not ready
          }
        }
        
        continueLoad();
      } else {
        countrySelectionDiv.style.display = 'block';
        changeCountriesButton.style.display = 'none';
        fetchButton.style.display = 'inline-block';
      }
    });
  }

  // Function to fetch competitions for countries
  async function fetchCompetitionsForCountries(countryCodes) {
    allCompetitions = await fetchCompetitions(countryCodes)
    if (allCompetitions && allCompetitions.length > 0) {
      populateEventFilter(allCompetitions)
      updateDisplay()
    } else {
      competitionsDiv.style.display = "block"
      competitionsDiv.innerHTML =
        '<div class="no-competitions">No upcoming competitions found for the selected countries.</div>'
    }
  }

  // Function to update selected countries display
  function updateSelectedCountriesDisplay() {
    selectedCountriesDiv.innerHTML = ""
    selectedCountries.forEach((countryCode) => {
      const countryName = countrySelect.querySelector(`option[value="${countryCode}"]`).textContent
      const countryElement = document.createElement("span")
      countryElement.className = "selected-country"
      countryElement.textContent = countryName
      const removeButton = document.createElement("span")
      removeButton.className = "remove-country"
      removeButton.textContent = "×"
      removeButton.onclick = () => removeCountry(countryCode)
      countryElement.appendChild(removeButton)
      selectedCountriesDiv.appendChild(countryElement)
    })
  }

  // Function to update selected events display
  function updateSelectedEventsDisplay() {
    const selectedEventsDiv = document.querySelector(".selected-events");
    selectedEventsDiv.innerHTML = "";
    
    selectedEvents.forEach((eventCode) => {
      const eventName = eventNames[eventCode] || eventCode;
      const eventElement = document.createElement("span");
      eventElement.className = "selected-event";
      eventElement.textContent = eventName;
      const removeButton = document.createElement("span");
      removeButton.className = "remove-event";
      removeButton.textContent = "×";
      removeButton.onclick = () => removeEvent(eventCode);
      eventElement.appendChild(removeButton);
      selectedEventsDiv.appendChild(eventElement);
    });
  }

  // Function to remove a country
  function removeCountry(countryCode) {
    selectedCountries = selectedCountries.filter((code) => code !== countryCode)
    updateSelectedCountriesDisplay()
  }

  // Function to remove an event
  function removeEvent(eventCode) {
    selectedEvents = selectedEvents.filter((code) => code !== eventCode)
    updateSelectedEventsDisplay()
    updateDisplay()
  }

  // Function to populate event filter
  function populateEventFilter(competitions) {
    const events = new Set()
    competitions.forEach((comp) => {
      comp.events.forEach((event) => {
        if (event !== "333ft" && event !== "333mbo" && event !=="magic" && event!="mmagic") {
          events.add(event)
        }
      })
    })

    eventFilter.innerHTML = '<option value="">Select Event</option>'
    Array.from(events)
      .sort()
      .forEach((event) => {
        const option = document.createElement("option")
        option.value = event
        option.textContent = eventNames[event] || event
        eventFilter.appendChild(option)
      })
  }

  // Function to filter competitions
  function filterCompetitions(competitions) {
    const selectedDuration = durationFilter.value
    const selectedMonth = monthFilter.value

    return competitions.filter((comp) => {
      // If no events are selected, show all competitions
      const eventMatch = selectedEvents.length === 0 || selectedEvents.every(event => comp.events.includes(event))
      
      const durationMatch =
        !selectedDuration ||
        (selectedDuration === "1" && comp.date.numberOfDays === 1) ||
        (selectedDuration === "2" && comp.date.numberOfDays === 2) ||
        (selectedDuration === "3" && comp.date.numberOfDays >= 3)
      
      // Month filter logic
      const monthMatch = !selectedMonth || new Date(comp.date.from).getMonth() === parseInt(selectedMonth)  
      
      return eventMatch && durationMatch && monthMatch
    })
  }

  // Function to update display
  function updateDisplay() {
    const filteredCompetitions = filterCompetitions(allCompetitions)
    displayCompetitions(filteredCompetitions)
  }

  // Event listener for country selection
  countrySelect.addEventListener("change", function () {
    const selectedCountry = this.value
    if (selectedCountry && !selectedCountries.includes(selectedCountry)) {
      if (selectedCountries.length < 5) {
        selectedCountries.push(selectedCountry)
        updateSelectedCountriesDisplay()
      } else {
        alert("You can select a maximum of 5 countries.")
      }
    }
    this.selectedIndex = 0 // Reset dropdown to default option
  })

  // Event listener for event selection
  eventFilter.addEventListener("change", function() {
    const selectedEvent = this.value
    if (selectedEvent && !selectedEvents.includes(selectedEvent)) {
      selectedEvents.push(selectedEvent)
      updateSelectedEventsDisplay()
      updateDisplay()
    }
    this.selectedIndex = 0 // Reset dropdown to default option
  })

  // Event listener for fetch button
  fetchButton.addEventListener("click", async () => {
    if (selectedCountries.length > 0) {
      fetchCompetitionsForCountries(selectedCountries)
    } else {
      alert("Please select at least one country.")
    }
  })

  // Event listener for save preference button
  savePreferenceButton.addEventListener("click", () => {
    if (selectedCountries.length > 0 && selectedCountries.length <= 5) {
      saveCountryPreferences(selectedCountries)
    } else if (selectedCountries.length > 5) {
      alert("Please select a maximum of 5 countries.")
    } else {
      alert("Please select at least one country.")
    }
  })

  // Event listener for change countries button
  changeCountriesButton.addEventListener("click", () => {
    countrySelectionDiv.style.display = "block"
    changeCountriesButton.style.display = "none"
    fetchButton.style.display = "inline-block"
    chrome.storage.sync.remove("preferredCountries")
    competitionsDiv.style.display = "none"
    selectedCountries = []
    updateSelectedCountriesDisplay()
  })

  // Event listener for duration filter
  durationFilter.addEventListener("change", updateDisplay)

  // Event listener for month filter
  monthFilter.addEventListener("change", updateDisplay)

  // Load country preferences on startup
  loadCountryPreferences()

  // Function to create overlay
  function createOverlay() {
    const overlay = document.createElement('div')
    overlay.className = 'theme-overlay'
    return overlay
  }

  // Function to apply theme
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme)
    // Update active state in dropdown
    themeOptions.forEach(option => {
      option.classList.toggle('active', option.dataset.theme === theme)
    })
  }

  // Function to save theme preference
  function saveThemePreference(theme) {
    chrome.storage.sync.set({ preferredTheme: theme }, () => {
      console.log("Theme preference saved:", theme)
    })
  }

  // Function to load theme preference
  function loadThemePreference() {
    chrome.storage.sync.get(["preferredTheme"], (result) => {
      const theme = result.preferredTheme || "teal"
      applyTheme(theme)
    })
  }

  // Function to show theme selector
  function showThemeSelector() {
    const overlay = createOverlay()
    document.body.appendChild(overlay)
    themeDropdown.style.display = "block"

    const closeThemeSelector = () => {
      overlay.remove()
      themeDropdown.style.display = "none"
    }

    overlay.addEventListener("click", closeThemeSelector)
    
    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeThemeSelector()
    }, { once: true })
  }

  // Event listener for theme button
  themeButton.addEventListener("click", (e) => {
    e.stopPropagation()
    showThemeSelector()
  })

  // Event listeners for theme options
  themeOptions.forEach(option => {
    option.addEventListener("click", (e) => {
      const selectedTheme = e.target.dataset.theme
      applyTheme(selectedTheme)
      saveThemePreference(selectedTheme)
      // Remove overlay and hide dropdown
      document.querySelector('.theme-overlay').remove()
      themeDropdown.style.display = "none"
    })
  })

  // Load theme preference on startup
  loadThemePreference()
})