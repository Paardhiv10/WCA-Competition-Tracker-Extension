document.addEventListener("DOMContentLoaded", () => {
  // DOM element references
  const competitionsDiv = document.getElementById("competitions")
  const countrySelect = document.getElementById("country")
  const changeCountriesButton = document.getElementById("change-countries")
  const countrySelectionDiv = document.getElementById("country-selection")
  const selectedCountriesDiv = document.querySelector(".selected-countries")
  const eventFilter = document.getElementById("event-filter")
  const selectedEventsDiv = document.querySelector(".selected-events")
  const durationFilter = document.getElementById("duration-filter")
  const fetchLocationButton = document.getElementById("fetch-location")
  const removeLocationButton = document.getElementById("remove-location")
  const monthFilter = document.getElementById("month-filter")
  const searchButton = document.getElementById("search-button")
  const searchContainer = document.getElementById("search-container")
  const searchInput = document.getElementById("search-input")
  const clearSearchButton = document.getElementById("clear-search")
  const rememberPreferencesCheckbox = document.getElementById("remember-preferences")
  const rememberPreferencesContainer = document.querySelector(".remember-preferences-container")
  const advancedFiltersToggle = document.getElementById("advanced-filters-toggle")
  const filtersContainer = document.getElementById("filters")
  const viewModeButton = document.getElementById("view-mode-button")
  const viewModeDropdown = document.getElementById("view-mode-dropdown")
  const viewModeRadios = document.querySelectorAll('input[name="view-mode"]')
  const rememberViewModeCheckbox = document.getElementById("remember-view-mode")
  const applyViewModeButton = document.getElementById("apply-view-mode")

  // State variables
  let selectedCountries = []
  let selectedEvents = []
  let allCompetitions = []
  let userLocation = null
  let useLocationSorting = false
  let userCountry = null
  let searchQuery = ""
  let isLoadingCompetitions = false

  // Cache configuration: balance between fresh data and fewer API calls
  const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
  const CACHE_KEY_PREFIX = "wca_comps_"

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

  
  // Safe caching functions with fallback
  function isStorageAvailable() {
    try {
      return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local
    } catch (e) {
      return false
    }
  }

  async function getCachedCompetitions(countryCode) {
    if (!isStorageAvailable()) {
      return null
    }

    return new Promise((resolve) => {
      try {
        const cacheKey = CACHE_KEY_PREFIX + countryCode
        chrome.storage.local.get([cacheKey], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Cache read error:', chrome.runtime.lastError)
            resolve(null)
            return
          }
          
          if (result[cacheKey]) {
            const cached = result[cacheKey]
            const now = Date.now()
            if (now - cached.timestamp < CACHE_DURATION) {
              resolve(cached.data)
            } else {
              resolve(null)
            }
          } else {
            resolve(null)
          }
        })
      } catch (error) {
        console.error('Cache error:', error)
        resolve(null)
      }
    })
  }

  async function cacheCompetitions(countryCode, competitions) {
    if (!isStorageAvailable()) {
      return
    }

    return new Promise((resolve) => {
      try {
        const cacheKey = CACHE_KEY_PREFIX + countryCode
        const cacheData = {
          timestamp: Date.now(),
          data: competitions
        }
        chrome.storage.local.set({ [cacheKey]: cacheData }, () => {
          if (chrome.runtime.lastError) {
            console.error('Cache write error:', chrome.runtime.lastError)
          }
          resolve()
        })
      } catch (error) {
        console.error('Cache error:', error)
        resolve()
      }
    })
  }

  async function clearCache() {
    if (!isStorageAvailable()) {
      return
    }

    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(null, (items) => {
          if (chrome.runtime.lastError) {
            console.error('Cache clear error:', chrome.runtime.lastError)
            resolve()
            return
          }
          
          const keysToRemove = Object.keys(items).filter(key => key.startsWith(CACHE_KEY_PREFIX))
          if (keysToRemove.length > 0) {
            chrome.storage.local.remove(keysToRemove, () => {
              resolve()
            })
          } else {
            resolve()
          }
        })
      } catch (error) {
        console.error('Cache clear error:', error)
        resolve()
      }
    })
  }

  // Parallel fetching
  function mapComp(comp, countryCode) {
    const startDate = new Date(comp.start_date)
    const endDate = new Date(comp.end_date)
    const numberOfDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    return {
      id: comp.id,
      name: comp.name,
      city: comp.city,
      country: comp.country_iso2,
      countryCode: countryCode,
      date: {
        from: comp.start_date,
        till: comp.end_date,
        numberOfDays: numberOfDays,
      },
      events: comp.event_ids || [],
      venue: {
        name: comp.venue || "",
        coordinates: {
          latitude: comp.latitude_degrees ?? null,
          longitude: comp.longitude_degrees ?? null,
        },
      },
    }
  }

  
  // Fetch single page with timeout
  async function fetchPageFast(url, timeoutMs = 10000) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    
    try {
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 404) {
          return []
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      clearTimeout(timeoutId)
      return []
    }
  }

  /**
   * OPTIMIZED: Fetch ALL pages in true parallel for maximum speed
   * For USA: Fetches up to 15 pages at once (all competitions)
   * For others: Fetches up to 5 pages
   */
  async function fetchCountryAllPages(countryCode, today) {
    const startTime = performance.now()

    // Check cache first
    const cached = await getCachedCompetitions(countryCode)
    if (cached) {
      return cached
    }

    // Determine max pages based on country (USA needs more)
    const maxPages = (countryCode === 'US') ? 15 : 5
    
    // Build all URLs at once - NO end date to get ALL competitions
    const urls = []
    for (let page = 1; page <= maxPages; page++) {
      urls.push(
        `https://www.worldcubeassociation.org/api/v0/competitions?country_iso2=${countryCode}&start=${today}&per_page=100&page=${page}&sort=start_date`
      )
    }

    try {
      // Fetch ALL pages at the SAME TIME (truly parallel)
      const allPagesData = await Promise.all(
        urls.map(url => fetchPageFast(url))
      )

      // Combine all results and map
      let allCompetitions = []
      for (const pageData of allPagesData) {
        if (pageData.length > 0) {
          allCompetitions.push(...pageData.map(comp => mapComp(comp, countryCode)))
        } else {
          // Stop when we hit an empty page
          break
        }
      }

      const endTime = performance.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)

      // Cache the results
      await cacheCompetitions(countryCode, allCompetitions)
      return allCompetitions

    } catch (error) {
      console.error(`Error fetching ${countryCode}:`, error)
      return []
    }
  }

  // Fetch with progressive updates for instant feedback
  async function fetchCompetitionsProgressive(countryCodes, progressCallback) {
    const today = new Date().toISOString().split("T")[0]

    const allCompetitions = []
    
    // Fetch countries one by one for progressive display
    for (const countryCode of countryCodes) {
      const competitions = await fetchCountryAllPages(countryCode, today)
      allCompetitions.push(...competitions)
      
      // Update UI immediately after each country
      if (progressCallback && competitions.length > 0) {
        progressCallback(allCompetitions.slice(), countryCode)
      }
    }

    return allCompetitions
  }

  // Display functions
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
    return R * c
  }

  function displayCompetitions(competitions) {
    competitionsDiv.style.display = "block"
    competitionsDiv.innerHTML = ""
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingCompetitions = competitions.filter((comp) => {
      const tillDate = new Date(comp.date.till)
      return tillDate >= today
    })

    if (useLocationSorting && userLocation) {
      upcomingCompetitions.sort((a, b) => {
        if (a.venue && a.venue.coordinates && a.venue.coordinates.latitude && b.venue && b.venue.coordinates && b.venue.coordinates.latitude) {
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
        '<div class="no-competitions">No upcoming competitions found. Try selecting different countries.</div>'
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

      nameLink.href = `https://www.worldcubeassociation.org/competitions/${comp.id}`
      nameLink.target = "_blank"

      nameDiv.appendChild(nameLink)
      locationDiv.textContent = `${city || "N/A"}, ${country || "N/A"}`

      const fromDate = new Date(date.from)
      const tillDate = new Date(date.till)
      dateDiv.textContent = formatCompetitionDate(fromDate, tillDate)

      gridContainer.appendChild(nameDiv)
      gridContainer.appendChild(locationDiv)
      gridContainer.appendChild(dateDiv)

      if (useLocationSorting && userLocation && venue && venue.coordinates && venue.coordinates.latitude) {
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

  // Main fetch with progressive display
  async function fetchCompetitionsForCountries(countryCodes) {
    if (isLoadingCompetitions) {
      return
    }

    isLoadingCompetitions = true
    competitionsDiv.style.display = "block"
    competitionsDiv.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading ALL competitions...</p>
        <small style="color: #888; margin-top: 8px;">Showing results as they arrive ⚡</small>
      </div>
    `

    const startTime = performance.now()
    let loadedCountries = []

    try {
      // Progressive loading with live updates
      allCompetitions = await fetchCompetitionsProgressive(countryCodes, (currentComps, justLoadedCountry) => {
        loadedCountries.push(justLoadedCountry)
        
        // Update display with current competitions
        const filteredComps = filterCompetitions(currentComps)
        displayCompetitions(filteredComps)
        
        // Show progress indicator
        const remaining = countryCodes.length - loadedCountries.length
        if (remaining > 0) {
          const progressDiv = document.createElement('div')
          progressDiv.style.cssText = 'text-align: center; padding: 15px; background: rgba(255,255,255,0.1); margin-top: 10px; border-radius: 8px;'
          progressDiv.innerHTML = `
            <div style="font-size: 14px; color: #888;">
              Loaded ${loadedCountries.join(', ')}<br>
              <span style="color: #4CAF50; font-weight: bold;">${currentComps.length} competitions</span> found so far
              ${remaining > 0 ? `<br>⏳ ${remaining} more ${remaining === 1 ? 'country' : 'countries'} loading...` : ''}
            </div>
          `
          competitionsDiv.appendChild(progressDiv)
        }
      })

      const endTime = performance.now()
      const totalTime = ((endTime - startTime) / 1000).toFixed(2)

      if (allCompetitions.length > 0) {
        populateEventFilter(allCompetitions)
        updateDisplay()
        updateSearchVisibility()
      } else {
        competitionsDiv.innerHTML = '<div class="no-competitions">No upcoming competitions found for the selected countries.</div>'
        updateSearchVisibility()
      }

    } catch (error) {
      console.error("Error fetching competitions:", error)
      competitionsDiv.innerHTML = '<div class="no-competitions">Error loading competitions. Please try again.</div>'
    } finally {
      isLoadingCompetitions = false
    }
  }

  // Filtering & event handlers
  function populateEventFilter(competitions) {
    const events = new Set()
    competitions.forEach((comp) => {
      comp.events.forEach((event) => {
        if (event !== "333ft" && event !== "333mbo" && event !== "magic" && event != "mmagic") {
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

      // Search filter logic - search by city or country name
      const searchMatch = !searchQuery ||
        (comp.city && comp.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (comp.country && comp.country.toLowerCase().includes(searchQuery.toLowerCase()))

      return eventMatch && durationMatch && monthMatch && searchMatch
    })
  }

  // Function to update display
  function updateDisplay() {
    const filteredCompetitions = filterCompetitions(allCompetitions)
    displayCompetitions(filteredCompetitions)
  }

  function updateSelectedEventsDisplay() {
    selectedEventsDiv.innerHTML = ""
    selectedEvents.forEach((eventCode) => {
      const eventName = eventNames[eventCode] || eventCode
      const eventElement = document.createElement("span")
      eventElement.className = "selected-event"
      eventElement.textContent = eventName
      const removeButton = document.createElement("span")
      removeButton.className = "remove-event"
      removeButton.textContent = "×"
      removeButton.onclick = () => removeEvent(eventCode)
      eventElement.appendChild(removeButton)
      selectedEventsDiv.appendChild(eventElement)
    })
  }

  function removeEvent(eventCode) {
    selectedEvents = selectedEvents.filter((code) => code !== eventCode)
    updateSelectedEventsDisplay()
    updateDisplay()
  }

  // Country selection & preferences
  async function fetchCountries() {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2")
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching countries:", error)
      return null
    }
  }

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

  populateCountryDropdown()

  function saveCountryPreferences(countryCodes) {
    // Persist the selected country codes in sync storage when "Remember selections" is enabled
    if (!isStorageAvailable()) return
    
    try {
      if (rememberPreferencesCheckbox.checked) {
        chrome.storage.sync.set({ preferredCountries: countryCodes })
      } else {
        chrome.storage.sync.remove("preferredCountries")
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  function loadCountryPreferences() {
    // Restore any previously saved country selections on startup
    if (!isStorageAvailable()) {
      countrySelectionDiv.style.display = 'block'
      changeCountriesButton.style.display = 'none'
      return
    }

    try {
      chrome.storage.sync.get(['preferredCountries'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error loading preferences:', chrome.runtime.lastError)
          countrySelectionDiv.style.display = 'block'
          changeCountriesButton.style.display = 'none'
          return
        }

        if (result.preferredCountries && result.preferredCountries.length > 0) {
          selectedCountries = result.preferredCountries
          rememberPreferencesCheckbox.checked = true

          function continueLoad() {
            if (countrySelect.options.length > 1) {
              updateSelectedCountriesDisplay()
              countrySelectionDiv.style.display = 'none'
              changeCountriesButton.style.display = 'inline-block'
              fetchCompetitionsForCountries(selectedCountries)
            } else {
              setTimeout(continueLoad, 100)
            }
          }
          continueLoad()
        } else {
          countrySelectionDiv.style.display = 'block'
          changeCountriesButton.style.display = 'none'
          rememberPreferencesCheckbox.checked = false
          rememberPreferencesContainer.style.display = 'none'
          updateSearchVisibility()
        }
      })
    } catch (error) {
      console.error('Error loading preferences:', error)
      countrySelectionDiv.style.display = 'block'
      changeCountriesButton.style.display = 'none'
    }
  }

  function updateSelectedCountriesDisplay() {
    // Render the list of selected countries as removable chips
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

    if (selectedCountries.length > 0) {
      rememberPreferencesContainer.style.display = "block"
    } else {
      rememberPreferencesContainer.style.display = "none"
      rememberPreferencesCheckbox.checked = false
    }
    updateSearchVisibility()
  }

  function removeCountry(countryCode) {
    // Remove a single country from the selection and refresh data / preferences
    selectedCountries = selectedCountries.filter((code) => code !== countryCode)
    updateSelectedCountriesDisplay()
    if (selectedCountries.length > 0) {
      fetchCompetitionsForCountries(selectedCountries)
      saveCountryPreferences(selectedCountries)
    } else {
      competitionsDiv.style.display = "none"
      allCompetitions = []
      saveCountryPreferences([])
    }
  }

  function updateSearchVisibility() {
    const hasCountriesSelected = selectedCountries.length > 0
    const competitionsLoaded = allCompetitions && allCompetitions.length > 0

    if (hasCountriesSelected && competitionsLoaded) {
      searchButton.style.display = "flex"
      searchInput.placeholder = "Search by city or state..."
      searchButton.disabled = false
      searchInput.disabled = false
    } else {
      searchButton.style.display = "none"
      searchContainer.style.display = "none"
      searchInput.value = ""
      searchQuery = ""
      clearSearchButton.style.display = "none"
    }
  }

  // Event listeners
  countrySelect.addEventListener("change", function () {
    const selectedCountry = this.value
    this.selectedIndex = 0

    if (!selectedCountry) return

    if (selectedCountries.includes(selectedCountry)) {
      const hasMissingData = allCompetitions.length === 0 || !allCompetitions.some((c) => c.countryCode === selectedCountry)
      if (hasMissingData) {
        fetchCompetitionsForCountries(selectedCountries)
      }
      return
    }

    if (selectedCountries.length < 5) {
      selectedCountries.push(selectedCountry)
      updateSelectedCountriesDisplay()
        // Auto-fetch competitions when country is selected
      fetchCompetitionsForCountries(selectedCountries)
      saveCountryPreferences(selectedCountries)
    } else {
      alert("You can select a maximum of 5 countries.")
    }
  })

  // Event listener for event selection
  eventFilter.addEventListener("change", function () {
    const selectedEvent = this.value
    if (selectedEvent && !selectedEvents.includes(selectedEvent)) {
      selectedEvents.push(selectedEvent)
      updateSelectedEventsDisplay()
      updateDisplay()
    }
    this.selectedIndex = 0
  })

  // Event listener for remember preferences checkbox
  rememberPreferencesCheckbox.addEventListener("change", () => {
    if (rememberPreferencesCheckbox.checked) {
      // When checked, save preferences and show the saved view
      if (selectedCountries.length > 0) {
        saveCountryPreferences(selectedCountries)
        // Show the same view as when "Save Preferences" was clicked
        countrySelectionDiv.style.display = "none"
        changeCountriesButton.style.display = "inline-block"
      }
    } else {
      if (isStorageAvailable()) {
        try {
          chrome.storage.sync.remove("preferredCountries")
        } catch (e) {
          console.error('Error removing preferences:', e)
        }
      }
      countrySelectionDiv.style.display = "block"
      changeCountriesButton.style.display = "none"
    }
  })

  // Event listener for change countries button
  changeCountriesButton.addEventListener("click", () => {
    countrySelectionDiv.style.display = "block"
    changeCountriesButton.style.display = "none"
    rememberPreferencesCheckbox.checked = false
    if (isStorageAvailable()) {
      try {
        chrome.storage.sync.remove("preferredCountries")
      } catch (e) {
        console.error('Error:', e)
      }
    }
    competitionsDiv.style.display = "none"
    selectedCountries = []
    allCompetitions = [] // Clear competitions when changing countries
    updateSelectedCountriesDisplay()
  })

  // Event listener for advanced filters toggle
  advancedFiltersToggle.addEventListener("click", (e) => {
    e.preventDefault() // Prevent default link behavior
    const isExpanded = filtersContainer.style.display !== "none"
    filtersContainer.style.display = isExpanded ? "none" : "flex"
    const chevron = advancedFiltersToggle.querySelector(".chevron")
    chevron.textContent = isExpanded ? "▼" : "▲"
  })

  // Event listener for duration filter
  durationFilter.addEventListener("change", updateDisplay)

  // Event listener for month filter
  monthFilter.addEventListener("change", updateDisplay)

  // Search functionality
  searchButton.addEventListener("click", () => {
    // Only allow search if competitions are loaded
    if (!allCompetitions || allCompetitions.length === 0) {
      return
    }

    if (searchContainer.style.display === "none") {
      searchContainer.style.display = "block"
      searchInput.focus()
    } else {
      searchContainer.style.display = "none"
      searchInput.value = ""
      searchQuery = ""
      clearSearchButton.style.display = "none"
      updateDisplay()
    }
  })

  searchInput.addEventListener("input", (e) => {
    // Only allow search if competitions are loaded
    if (!allCompetitions || allCompetitions.length === 0) {
      return
    }

    searchQuery = e.target.value.trim()
    clearSearchButton.style.display = searchQuery.length > 0 ? "flex" : "none"
    updateDisplay()
  })

  clearSearchButton.addEventListener("click", () => {
    searchInput.value = ""
    searchQuery = ""
    clearSearchButton.style.display = "none"
    updateDisplay()
  })

  // Close search on Escape key
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchContainer.style.display = "none"
      searchInput.value = ""
      searchQuery = ""
      clearSearchButton.style.display = "none"
      updateDisplay()
    }
  })

  // Location features
  async function getCountryFromCoordinates(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      )
      const data = await response.json()
      return data.countryCode
    } catch (error) {
      console.error("Error getting country:", error)
      return null
    }
  }

  fetchLocationButton.addEventListener("click", () => {
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
        alert("Please enable location access in your browser settings.")
        useLocationSorting = false
      }
    )
  })

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

  // Theme Management (existing code kept)
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
    if (isStorageAvailable()) {
      try {
        chrome.storage.sync.set({ preferredTheme: theme })
      } catch (e) {
        console.error('Error saving theme:', e)
      }
    }
  }

  // Function to load theme preference
  function loadThemePreference() {
    if (!isStorageAvailable()) {
      applyTheme("teal")
      return
    }

    try {
      chrome.storage.sync.get(["preferredTheme"], (result) => {
        const theme = result.preferredTheme || "teal"
        applyTheme(theme)
      })
    } catch (e) {
      console.error('Error loading theme:', e)
      applyTheme("teal")
    }
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

  // View Mode Management
  let currentViewMode = "popup"

  // Function to save view mode preference
  function saveViewModePreference(mode) {
    if (isStorageAvailable()) {
      try {
        chrome.storage.sync.set({ preferredViewMode: mode })
      } catch (e) {
        console.error('Error:', e)
      }
    }
  }

  // Function to load view mode preference
  function loadViewModePreference() {
    if (!isStorageAvailable()) return

    try {
      chrome.storage.sync.get(["preferredViewMode"], (result) => {
        if (result.preferredViewMode) {
          currentViewMode = result.preferredViewMode
        // Update radio button to reflect saved preference
          const radio = document.querySelector(`input[name="view-mode"][value="${currentViewMode}"]`)
        if (radio) {
          radio.checked = true
        }
        // Check the remember checkbox since we have a saved preference
        if (rememberViewModeCheckbox) {
          rememberViewModeCheckbox.checked = true
        }
        }
      })
    } catch (e) {
      console.error('Error:', e)
    }
  }

  // Function to show view mode selector
  function showViewModeSelector() {
    const overlay = createOverlay()
    overlay.classList.add("view-mode-overlay")
    document.body.appendChild(overlay)
    viewModeDropdown.style.display = "block"

    // Set the current selection to match the current mode
    const radio = document.querySelector(`input[name="view-mode"][value="${currentViewMode}"]`)
    if (radio) {
      radio.checked = true
    }

    const closeViewModeSelector = () => {
      overlay.remove()
      viewModeDropdown.style.display = "none"
    }

    overlay.addEventListener("click", closeViewModeSelector)

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        closeViewModeSelector()
        document.removeEventListener("keydown", escapeHandler)
      }
    }
    document.addEventListener("keydown", escapeHandler)
  }

  // Event listener for view mode button
  viewModeButton.addEventListener("click", (e) => {
    e.stopPropagation()
    showViewModeSelector()
  })

  // Event listener for apply view mode button
  applyViewModeButton.addEventListener("click", async () => {
    const selectedMode = document.querySelector('input[name="view-mode"]:checked').value
    const shouldRemember = rememberViewModeCheckbox.checked

    if (shouldRemember) {
      saveViewModePreference(selectedMode)
    } else {
      if (isStorageAvailable()) {
        try {
          chrome.storage.sync.remove("preferredViewMode")
        } catch (e) {
          console.error('Error:', e)
        }
      }
    }

    // Close the modal
    const overlay = document.querySelector(".view-mode-overlay")
    if (overlay) {
      overlay.remove()
    }
    viewModeDropdown.style.display = "none"

    // If sidebar mode is selected, open side panel
    if (selectedMode === "sidebar") {
      try {
        // Send message to background script to open side panel
        const response = await chrome.runtime.sendMessage({ action: "openSidePanel" })

        // Close the popup after opening side panel
        if (response && response.success) {
          window.close()
        }
      } catch (error) {
        console.error("Error opening side panel:", error)
        alert("Unable to open side panel. Please try again.")
      }
    } else {
      try {
        // Get the current window ID before closing
        const browserWindow = await chrome.windows.getCurrent()

        // Send message to background to handle the switch
        await chrome.runtime.sendMessage({
          action: "switchToPopupMode",
          windowId: browserWindow.id
        })

        // Close the sidebar
        window.close()

      } catch (error) {
        const message = document.createElement("div")
        message.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 12px; z-index: 10000; text-align: center;"
        message.textContent = "Switched to popup mode!\nClick the extension icon to open as popup"
        document.body.appendChild(message)
        setTimeout(() => window.close(), 1500)
      }
    }
  })

  // Load view mode preference on startup
  loadViewModePreference()

  // Initialize
  updateSearchVisibility()
  rememberPreferencesContainer.style.display = "none"
  loadCountryPreferences()

  // Manual cache clear shortcut
  document.addEventListener("keydown", async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "R") {
      e.preventDefault()
      await clearCache()
      if (selectedCountries.length > 0) {
        fetchCompetitionsForCountries(selectedCountries)
      }
    }
  })
})
