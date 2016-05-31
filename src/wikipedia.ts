// TURN noImplictAny back on
// Check errors are caught nicely all down the promise chain
// TODO - Add non-FCC projects to portfolio?
// Objectives - TypeScript instead of Ugly JS, Fetch instead of ugly XMLHttpRequest
// Polyfill - promises?
// Challenges - COR, Bundling/machinery
// Notes - Wikipedia API does not support CORS, so need to use JSONP
// Comment that JSONP is an awful hack
// Local storage
// Alternative to adding console.log


/*
 *
 * Global constants
 *
 */


// Used to build the URI for the Wikipedia API call
// Full URL used for the API is
//
// apiPrefix + <query-string> + apiSuffix + <callback-function-name>
//
const apiPrefix: string = "http://en.wikipedia.org/w/api.php?action=opensearch&namespace=0&format=json&search=";
const apiSuffix: string = "&callback="; // Name of the callback is added by fetchJSONP


/*
 *
 * Start-up code to set up our event listeners
 *
 */

run_when_document_ready(function (): void {

  // Button to open a random article
  document.getElementById("random-button").addEventListener("click", openRandomPage);

  // Button to start a search
  document.getElementById("search-button").addEventListener("click", startSearch);

  // Handle input into the search field
  document.querySelector(".search-form").addEventListener("submit", function (event: Event): void {
    let input: HTMLInputElement = document.getElementById("search-input") as HTMLInputElement;
    launchSearch(input.value);
    event.preventDefault();
  });
});


/*
 *
 * Types
 *
 */


// Type of the raw JSON result from the API call
type RawSearchResult = (string | string[])[];

// Type for the parsed and validated searchResult from the API call
interface SearchResult {
  query: string;
  titles: string[];
  firstParas: string[];
  urls: string[];
}


/*
 *
 * Main working functions
 *
 */


function openRandomPage(): void {
  console.log("Open random page");
}

function startSearch(): void {
  let input: HTMLFormElement = document.querySelector("#search-input") as HTMLFormElement;
  input.style.visibility = "visible";
  input.focus();
}

function launchSearch(query: string): void {

  jsonp<RawSearchResult>(apiPrefix + query + apiSuffix)
    .then(validateResult)
    .then(updateSearchList)
    .catch((e: Error) => console.log("fetch...catch", e.message));

}
function updateSearchList(result: SearchResult): void {
  console.log("updateSearchList", result);
}


/**
 *
 * Helper functions
 *
 */


// Validate that the raw result of the JSON parsing has the expected format, then convert to our
// tidier search resut format
function validateResult(raw: RawSearchResult): Promise<SearchResult> {

  if (Array.isArray(raw) &&
      raw.length === 4 &&
      typeof raw[0] === "string" &&
      Array.isArray(raw[1]) &&
      raw[1].every((x: string) => typeof x === "string")   &&
      Array.isArray(raw[2]) &&
      raw[2].every((x: string) => typeof x === "string")   &&
      Array.isArray(raw[3]) &&
      raw[3].every((x: string) => typeof x === "string")   &&
      raw[1].length === raw[2].length &&
      raw[2].length === raw[3].length) {

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


/*
 *
 * Library functions
 *
 */


// Standard function to run a function when document is loaded
function run_when_document_ready(fn: () => void): void {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

// Simple function to make a jsonp request and wrap in a Promise
// Url paramater will have the name of the callback appended
// Adapted from https://github.com/camsong/fetch-jsonp
function jsonp<T>(url: string): Promise<T> {

  return new Promise((resolve: (r: T) => void) => {

    // Create a random name for the callback function (so we can create many of them indpendently)
    let callbackName: string = `callback_jsonp_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;

    // Add our callback function to the global window object which handles the JSON response from the URL
    (window as any)[callbackName] = function (response: T): void {

      // Pass the received JSON to the Promsie
      resolve(response);

      // Remove the script tag and the name in the the global window object
      const script: HTMLElement = document.getElementById(callbackName);
      document.getElementsByTagName("head")[0].removeChild(script);
      delete (window as any)[callbackName];
    };

    // Add a script object to our document which will call our callback
    const script: HTMLElement = document.createElement("script");
    script.setAttribute("src", url + callbackName);
    script.id = callbackName;
    document.getElementsByTagName("head")[0].appendChild(script);

  });
}


