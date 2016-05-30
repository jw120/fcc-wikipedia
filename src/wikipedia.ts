/*
 *
 * Global constants
 *
 */

// Used to build the URI for the Wikipedia API call
const apiPrefix: string = "https://en.wikipedia.org/w/api.php?action=opensearch&namespace=0&format=json&search=";

/*
 *
 * Start-up code to set up our event listeners
 *
 */

run_when_document_ready(function () {

  // Button to open a random article
  document.getElementById("random-button").addEventListener("click", openRandomPage);

  // Button to start a search
  document.getElementById("search-button").addEventListener("click", startSearch);

  // Handle input into the search field
  document.querySelector(".search-form").addEventListener("submit", function (event) {
    let input = document.getElementById("search-input") as HTMLInputElement;
    search(input.value);
    event.preventDefault();
  });
});


/*
 *
 * Main working functions
 *
 */

function openRandomPage(): void {
  console.log("Open random page")
}

function startSearch(): void {
  let input = document.querySelector("#search-input") as HTMLFormElement;
  input.style.visibility = "visible";
  input.focus();
  console.log("Starting search");
}

function search(s: string): void {
  console.log("Search for ", s);
}


/*
// Fetch the weather from localStorage or API then call updateDOM (maybe asynchronously)
// Takes either (two arguments) latitude and longitude or (one argument) city name
function fetchWeather() {

  var query;   // Query postion of URI for API call; also used as localStorage key
  var stored;  // Saved weather stored in localStorage (time and result fields)
  var request; // Used to build up API call
  var result;  // Return value from API call

  // Build query from arguments
  debug("fetchWeather called with", arguments);
  if (arguments.length === 2) {
    query = "lat=" + arguments[0].toFixed(2) + "&lon=" + arguments[1].toFixed(2);
  } else if (arguments.length === 1) {
    query = "q="+ arguments[0];
  } else {
    debug("Bad parameters to fetchWeather");
    return;
  }
  debug("query set to", query);

  if (dummyMode) {
    updateDOM(dummyResult);
    return;
  }

  // Use local storage if we can
  if (storageAvailable("localStorage")) {
    debug("Have localStorage available");
    try {
      stored = JSON.parse(localStorage.getItem(query));
      debug("getItem gives", stored);
      if (stored.time && stored.result && Date.now() - stored.time < 10 * 60 * 1000) { // Less than 10 mins old
        debug("Using localstorage data");
        updateDOM(stored.result);
        return;
      }
    } catch (e) {
      debug("Error in getItem JSON.parse", e);
    }
  }

  // API call
  request = new XMLHttpRequest();
  request.open("GET",  apiPrefix + query + apiSuffix, true); // true is for async
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      try {
        result = JSON.parse(request.response);
        debug("API call returned", result);
      } catch (e) {
        debug("Error in api JSON.parse", e);
      }
      if (storageAvailable("localStorage")) {
        localStorage.setItem(query, JSON.stringify({
          time: Date.now(),
          result: result
        }));
        debug("Wrote", JSON.stringify(localStorage.getItem(query)), "to localstorage");
      }
      updateDOM(result);
    } else {
      debug("Bad status from get", request);
    }
  };
  request.onerror = function () {
    debug("Error from get");
  };
  request.send();

}

// Update the DOM with the result from the API weather call
function updateDOM(result) {
  debug("updateDOM called with", result, result.main);

  lastTemp = result.main.temp;
  writeTemp();

  // Add icons and text for each description in the weather result
  if (result.weather) {

    var row  = document.querySelector(".descriptions-row");

    // Remove any existing nodes in the row
    while (row.firstChild) {
      row.removeChild(row.firstChild);
    }

    // Add a box for each description
    result.weather.forEach(function (desc) {

      // Box for the whole description (contains icon and label)
      var descMainBox = document.createElement("div");
      descMainBox.className = "description-box";

      // Box containing the icon
      var descIconBox = document.createElement("div");
      descIconBox.className = "description-icon";
      var icon = document.createElement("img");
      icon.setAttribute("src", dummyMode ? dummyIcon : (iconPrefix + desc.icon + iconSuffix));
      descIconBox.appendChild(icon);

      // Box containing the label
      var descLabelBox = document.createElement("div");
      descLabelBox.className = "description-label";
      descLabelBox.appendChild(document.createTextNode(capitalizeFirst(desc.description)));

      // Connect nodes
      descMainBox.appendChild(descIconBox);
      descMainBox.appendChild(descLabelBox);
      row.appendChild(descMainBox);
    });
  }


  writeDescription(result.main && result.main.humidity,
            "humidity-reading", result.main.humidity.toFixed(0) + "%");
  writeDescription(result.wind && result.wind.speed,
            "wind-speed-reading", result.wind.speed.toFixed(1) + " m/s");
  writeDescription(result.wind && result.wind.deg,
           "wind-direction-reading", result.wind.deg.toFixed(0) + "&deg");

  document.querySelector(".city-name").innerHTML = result.name;


}

function writeTemp() {

  var temp;

  if (lastTemp) {
    if (useCelsius) {
      temp = (lastTemp - 273.15).toFixed(1) + "&deg;C";
    } else {
      temp = ((lastTemp - 273.15 + 32) * 9 / 5).toFixed(1) + "&degF";
    }
    writeDescription(true, "temperature-reading", temp);
  }
}
*/


/*
 *
 * Utility functions
 *
 */

// Helper function to check the test condition and then write the string into the node with the specified id
// Disable node if
// function writeDescription(test, id, str) {

//   var node = document.getElementById(id);

//   node.innerHTML = test ? str : "N/A";

// }

// Helper function to show progress to console
// var debugOn = true;
// function debug() {
//   if (debugOn) {
//     console.log.apply(console, arguments); // Chrome's console.log wants this to be console
//   }
// }

// // Capitalize the first letter of the string and return it
// function capitalizeFirst(s) {

//   return s.substr(0, 1).toUpperCase() + s.substr(1);

// }


// // Return true if local storage is available (from MDN)
// function storageAvailable(type) {
//   try {
//     var storage = window[type];
//     var x = "__storage_test__";
//     storage.setItem(x, x);
//     storage.removeItem(x);
//     return true;
//   }
//   catch(e) {
//     return false;
//   }
// }

// Standard function to run a function when document is loaded
function run_when_document_ready(fn: () => void): void {
  if (document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
