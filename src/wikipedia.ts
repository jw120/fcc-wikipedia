// Fix CORS problem
// TURN noImplictAny back on
// Check errors are caught nicely all down the promise chain
// TODO - Add non-FCC projects to portfolio?
// Objectives - TypeScript instead of Ugly JS, Fetch instead of ugly XMLHttpRequest
// Polyfill - fetch, promises?
// Challenges - COR, Bundling/machinery
// Notes - Wikipedia API does not support CORS, so need to use JSONP

/*
 *
 * Global constants
 *
 */

// Used to build the URI for the Wikipedia API call
const apiPrefix: string = "http://en.wikipedia.org/w/api.php?action=opensearch&namespace=0&format=json&search=";
const apiCallbackTag: string = "callback";

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
    launchSearch(input.value);
    event.preventDefault();
  });
});


/*
 *
 * Main working functions
 *
 */

// String containing the JSON stringify'd version of an object
type JSONString = string;

// Raw result of parsing the API Search Result as JSON
type RawSearchResult = (string | string[])[];

// Fully parsed searchResult
interface SearchResult {
  query: string;
  titles: string[];
  firstParas: string[];
  urls: string[];
}

function openRandomPage(): void {
  console.log("Open random page")
}

function startSearch(): void {
  let input = document.querySelector("#search-input") as HTMLFormElement;
  input.style.visibility = "visible";
  input.focus();
}

function launchSearch(query: string): void {

  console.log("launchSearch", query);

  fetchJSONP(apiPrefix + query, apiCallbackTag)
//    .then(checkStatus)
//    .then(parseResult)
    .then(r => r.json()) // Do we need then? <T>
    .then(validateResult)
    .then(updateSearchList)
    .catch((e: Error) => console.log("fetch...catch", e.message));


  // let request = new XMLHttpRequest();
  // request.open("GET",  apiPrefix + query); // true is for async
  // request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  // request.onload = () => {
  //   if (request.status >= 200 && request.status < 400) {
  //     let apiReturn: string = request.response;
  //     console.log("Response is", typeof apiReturn, apiReturn);
  //       let result: SearchResult = parseResult(request.response);
  //       if (result.err) {
  //         console.log("API call parse returned with error", result.err);
  //       } else {
  //         updateSearchList(result);
  //       }
  //   } else {
  //     console.log("Bad status from get", request);
  //   }
  // };
  // request.onerror = function () {
  //   console.log("Error from get");
  // };
  // request.send();

}

function updateSearchList(result: SearchResult): void {
  console.log("updateSearchList", result);
}

/**
 * Helper functions
 */

// Check that the response has a valid status
function checkStatus(response: Response): Promise<Response> {
  console.log("checkStatus", response);
  if (response.status && response.status >=200 && response.status < 300) {
    return Promise.resolve<Response>(response);
  } else {
    let msg = "Bad status code " + response.status +
      ((response.statusText) ? " (" + response.statusText + ")" : "");
    return Promise.reject<Response>(new Error(msg));
  }
}

// // Parse the JSON string returned from the API into a raw object
// // Adds a reasonable error message to the basic call
// function parseResult(response: Response): RawSearchResult {
//   response.json().catch((e) => {
//     throw new Error("Parse Failed" + e);
//   }
// }

// Validate that the raw result of the JSON parsing has the expected format, then convert to our
// tidier search resut format
function validateResult(raw: RawSearchResult): Promise<SearchResult> {
  console.log("validateResult", raw);
  if (Array.isArray(raw) &&
      raw.length === 4 &&
      typeof raw[0] == "string" &&
      Array.isArray(raw[1]) &&
      raw[1].every((x: string) => typeof x === "string")   &&
      Array.isArray(raw[2]) &&
      raw[2].every((x: string) => typeof x === "string")   &&
      Array.isArray(raw[3]) &&
      raw[3].every((x: string) => typeof x === "string")   &&
      raw[1].length == raw[2].length &&
      raw[2].length == raw[3].length) {
        console.log("Validates OK");
     return Promise.resolve<SearchResult>({
       query: raw[0],
       titles: raw[1],
       firstParas: raw[2],
       urls: raw[3]
     });
   } else {
     return Promise.reject<SearchResult>(new Error("Invalid search result"));
   }

}



// Standard function to run a function when document is loaded
function run_when_document_ready(fn: () => void): void {
  if (document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

interface JSONPResponse {
  ok: boolean;
  json(): Promise<any>;
  json<T>(): Promise<T>;
}

// Adapted from https://github.com/camsong/fetch-jsonp
function fetchJSONP(url: string, callbackTag: string): any {
  return new Promise((resolve, reject) => {
    let callbackName: string = `callback_jsonp_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;

    window[callbackName] = function (response) {
      console.log("Response in callback is", response)
      resolve({
        ok: true,
        json: () => Promise.resolve(response)
      });

      // Tidy up
      const script = document.getElementById(callbackName);
      document.getElementsByTagName("head")[0].removeChild(script);
      delete window[callbackName];
    };

    const script = document.createElement("script");
    script.setAttribute("src", url + "&" + callbackTag + "=" + callbackName);
    script.id = callbackName;
    document.getElementsByTagName("head")[0].appendChild(script);

  });
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
//

