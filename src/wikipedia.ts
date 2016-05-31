// Polyfill - promises?
// Alternative to adding console.log

// Objectives - TypeScript instead of Ugly JS, Fetch instead of ugly XMLHttpRequest
// Notes - Wikipedia API does not support CORS, so need to use JSONP
// Comment that JSONP is an awful hack
// Challenges - COR, Bundling/machinery


// TODO - Add non-FCC projects to portfolio?


/*
const dummy: SearchResult = {
  query: "zz",
  titles: [
    "Zz", "ZZ Top", "ZZ Top equipment", "ZZ Top discography", "ZZ Ward",
    "ZZ diboson", "Zzyzx, California", "ZZ Gundam", "Zzoom", "ZZZap!"
  ],
  firstParas: [
    "This is a redirect from a title with another method of capitalisation. It leads to the title in accordance with the Wikipedia naming conventions for capitalisation, or it leads to a title that is associated in some way with the conventional capitalisation of this redirect title.",
    "ZZ Top /ˈziːziːtɒp/ is an American rock band that formed in 1969 in Houston, Texas. The band is composed of bassist and lead vocalist Dusty Hill, guitarist and lead vocalist Billy Gibbons (the band's leader, main lyricist and musical arranger), and drummer Frank Beard.",
    "This is the musical equipment used by the members of the hard rock/blues rock band ZZ Top.",
    "The following is a comprehensive discography of ZZ Top, an American blues rock band. Over the years they have released 15 studio albums, 3 live albums, 6 compilation albums, and 42 singles.",
    "ZZ Ward (born Zsuzsanna Eva Ward, June 2, 1986) is an American musician, singer and songwriter. She is signed to Boardwalk Entertainment Group and Hollywood Records.",
    "ZZ dibosons are rare pairs of Z bosons. They were first observed by the experiments at the Large Electron–Positron Collider (ALEPH, DELPHI, L3 and OPAL).",
    "Zzyzx (/ˈzaɪzᵻks/ ZY-zəks), formerly Camp Soda and Soda Springs, is an unincorporated community in San Bernardino County, California, United States, within the boundaries of Mojave National Preserve.",
    "The MSZ-010 ΖΖ Gundam (pronounced Double Zeta (ダブルゼータ, Daburu Zēta)), designed by Makoto Kobayashi, is a fictional weapon from the Universal Century timeline of the anime Gundam metaseries.",
    "Zzoom is a computer game developed by John Gibson, Mark Butler and Steve Blower for the ZX Spectrum and released by Imagine Software in 1983. It is an early example of a combat flight simulator game, in which the player controls an aircraft that must protect refugees from enemy forces.",
    "Zzzap (rendered ZZZap!) was a British children's television comedy programme. The concept of the show is a giant 18 ft comic that has been brought to life."

  ],
  urls:  [
    "https://en.wikipedia.org/wiki/Zz",
    "https://en.wikipedia.org/wiki/ZZ_Top",
    "https://en.wikipedia.org/wiki/ZZ_Top_equipment",
    "https://en.wikipedia.org/wiki/ZZ_Top_discography",
    "https://en.wikipedia.org/wiki/ZZ_Ward",
    "https://en.wikipedia.org/wiki/ZZ_diboson",
    "https://en.wikipedia.org/wiki/Zzyzx,_California",
    "https://en.wikipedia.org/wiki/ZZ_Gundam",
    "https://en.wikipedia.org/wiki/Zzoom",
    "https://en.wikipedia.org/wiki/ZZZap!"
  ]
};
*/


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

  // For testing updateSearchList
  // startSearch();
  // updateSearchList(dummy);

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


// Update the search-results div in the DOM with the new search results
function updateSearchList(result: SearchResult): void {
  console.log("updateSearchList", result);

  const resultsBox: Element = document.querySelector(".results-box");

  while (resultsBox.firstChild) {
    resultsBox.removeChild(resultsBox.firstChild);
  }

  result.titles.forEach((title: string, i: number): void => {

    let newAnchor: Element = document.createElement("a");
    newAnchor.setAttribute("href", result.urls[i]);
    newAnchor.className = "result-anchor";

    let newBox: Element = document.createElement("div");
    newBox.className = "result-box";

    let newTitle: Element = document.createElement("h4");
    newTitle.appendChild(document.createTextNode(title));

    let newBody: Element = document.createElement("p");
    newBody.appendChild(document.createTextNode(result.firstParas[i]));

    resultsBox.appendChild(newAnchor);
    newAnchor.appendChild(newBox);
    newBox.appendChild(newTitle);
    newBox.appendChild(newBody);

  });

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


