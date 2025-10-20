const cdnURL = `https://ogextractor.netlify.app/.netlify/functions/ogExtractionHandler?url=`;
const placeHolderImageURL = `https://picsum.photos/seed/picsum/200/300`;
const charLimit = 100000;
let abortController = null;
let previousTag = null;
let currentAudio = null;

//Popup box creation and styling
const popupBox = document.createElement("div");
popupBox.style.position = "fixed";
popupBox.style.color = "#808080";
popupBox.style.display = "flex";
popupBox.style.fontFamily = "Trebuchet MS,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Tahoma,sans-serif";
popupBox.style.width = "auto";
popupBox.style.maxWidth = "800px";
popupBox.style.height = "auto";
popupBox.style.borderRadius = "10px";
popupBox.style.zIndex = "9999";
popupBox.style.overflow = "hidden";
popupBox.style.display = "none";
document.body.appendChild(popupBox);
const showPopupContainer = () => {
  popupBox.style.display = "flex";
};
const hidePopupContainer = () => {
  popupBox.style.display = "none";
};

//Content Creation and Styles
const contentBox = document.createElement("div");
contentBox.style.padding = "15px";
contentBox.style.lineHeight = "18.5px";
contentBox.style.gap = "10px";
contentBox.style.width = "auto";
contentBox.style.height = "auto";
contentBox.style.display = "flex";
contentBox.style.overflow = "hidden";
contentBox.style.flexDirection = "column";
contentBox.style.backgroundColor = "#151922";
contentBox.style.whiteSpace = "nowrap";
contentBox.style.maxWidth = "800px";
popupBox.appendChild(contentBox);

//Image Creation and Styles
const imageBox = document.createElement("div");
imageBox.style.backgroundColor = "#151922";
imageBox.style.padding = "10px";
imageBox.style.width = "auto";
imageBox.style.height = "auto";
const image = document.createElement("img");
image.style.width = "225px";
image.style.height = "225px";
image.style.objectFit = "fill";
image.style.borderRadius = "10px";
imageBox.appendChild(image);
popupBox.appendChild(imageBox);
const loadNewImage = (src = placeHolderImageURL) => {
  image.style.visibility = "hidden";
  const tempImg = new Image();
  tempImg.addEventListener("load", () => {
    console.log(src);
    image.src = tempImg.src;
    image.style.visibility = "inherit";
  });
  tempImg.src = src;
};

//Popup content styling
const type = document.createElement("span");
type.style.color = "#cdcdcd";
type.style.fontSize = "14px";
contentBox.appendChild(type);

const divider1 = document.createElement("div");
divider1.style.margin = "0px";
divider1.style.width = "100%";
divider1.style.height = "1px";
divider1.style.backgroundColor = "#cdcdcd";
contentBox.appendChild(divider1);

const title = document.createElement("span");
title.style.display = "-webkit-box";
title.style.webkitLineClamp = "1";
title.style.lineHeight = "28.5px";
title.style.overflow = "hidden";
title.style.fontSize = "22px";
title.style.fontWeight = "bold";
title.style.color = "#ffffff";
contentBox.appendChild(title);

const description = document.createElement("span");
description.style.color = "#cdcdcd"
description.style.display = "block";
description.style.overflow = "hidden";
description.style.fontSize = "14px";
description.style.whiteSpace = "normal";
description.style.wordBreak = "break-word";
contentBox.appendChild(description);

const divider2 = document.createElement("div");
divider2.style.margin = "0px";
divider2.style.width = "100%";
divider2.style.height = "1px";
divider2.style.backgroundColor = "#cdcdcd";
contentBox.appendChild(divider2);

const url = document.createElement("a");
url.style.color = "#cdcdcd";
url.style.fontSize = "12px";
url.style.display = "-webkit-box";
url.style.webkitLineClamp = "1";
url.style.overflow = "hidden";
contentBox.appendChild(url);

//Loading Circle Creation and Styles
const loading = document.createElement("span");
loading.style.width = "50px";
loading.style.height = "50px";
loading.style.position = "absolute";
loading.style.top = "50%";
loading.style.left = "50%";
loading.style.borderRadius = "100%";
loading.style.borderTop = "5px solid #797e7d";
loading.style.borderLeft = "5px solid #797e7d";
loading.style.borderBottom = "5px solid transparent";
loading.style.borderRight = "5px solid transparent";
loading.style.transform = "translate(-50%, -50%)";
loading.style.transformOrigin = "top left";
loading.animate([{ rotate: "0deg" }, { rotate: "360deg" }], { duration: 1000, iterations: Infinity });
popupBox.appendChild(loading);
const showPopupLoader = () => {
  loading.style.visibility = "visible";
  imageBox.style.visibility = "hidden";
  contentBox.style.visibility = "hidden";
  popupBox.style.backgroundColor = "transparent";
  popupBox.style.boxShadow = "";
};
const hidePopupLoader = () => {
  loading.style.visibility = "hidden";
  imageBox.style.visibility = "initial";
  contentBox.style.visibility = "initial";
  popupBox.style.backgroundColor = "#ffffff";
  popupBox.style.boxShadow = "2px 2px 4px 0px rgba(0,0,0,0.3)";
};
hidePopupLoader();

// Find the closest link tag to the mouseover event
const findClosestLinkTag = (event) => {
  let x = event.target;
  // Traverse up the DOM tree until reaching a link tag or the body element
  while (!x.matches("a, body")) x = x.parentElement;
  if (x.matches("a")) {
    return x;
  }
  return null;
};

// Reposition the popup box relative to the given element
const repositionPopup = (element) => {
  // Get position data of the element and the popup box
  const elementPositionData = element.getBoundingClientRect();
  const popupPositionData = popupBox.getBoundingClientRect();
  // Calculate x and y positions for the popup box
  const xPos = elementPositionData.left + elementPositionData.width / 2 - popupPositionData.width / 2;
  let yPos = elementPositionData.top;
  if (elementPositionData.top > popupPositionData.height + 10) yPos -= popupPositionData.height + 5;
  else yPos += 10 + elementPositionData.height;
  // Ensure the popup box stays within the viewport
  const offsetX = document.documentElement.clientWidth - popupPositionData.width;
  popupBox.style.top = `${Math.max(0, yPos)}px`;
  popupBox.style.left = `${Math.max(0, Math.min(xPos, offsetX))}px`;
};

// Populate the popup with content
const popupContent = ({
  title: titleText,
  description: descriptionText,
  image: imageSrc,
  type: typeText,
  url: urlText,
}) => {
  loadNewImage(imageSrc);
  type.innerText = typeText ?? "Website";
  title.innerText = titleText;
  description.innerText = descriptionText ?? titleText;
  url.href = urlText;
  url.innerText = urlText;
};

function headerDisplay(text, color, targetLanguage) {
  // Create a header element
  const header = document.createElement("div");
  // Style the header
  header.style.backgroundColor = color;
  header.style.padding = "15px";
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "center";
  header.style.flexDirection = "column";

  // Create a container for icon and title
  const iconTitleContainer = document.createElement("div");
  iconTitleContainer.style.display = "flex";
  iconTitleContainer.style.paddingBottom = "15px"

  // Create an SVG icon
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "2em");
  svg.setAttribute("height", "2em");
  svg.setAttribute("viewBox", "0 0 32 32");
  svg.innerHTML = `<g fill="currentColor"><path d="M8.896 27.617a6.03 6.03 0 0 0 .306-.13c1.829.957 4.086 1.51 6.797 1.51c2.804 0 5.122-.592 6.983-1.61l.019.011l.042.023l.043.019a6.618 6.618 0 0 0 2.605.556C23.245 29.9 19.994 30.998 16 30.998c-3.99 0-7.238-1.096-9.683-2.996a5.827 5.827 0 0 0 2.58-.385m18.114-.806c-.898.264-1.927.253-2.972-.08a6.134 6.134 0 0 1-.557-.21c-.971-.532-1.417-1.21-1.855-1.877c-.36-.549-.716-1.09-1.355-1.533l-2.473-1.428a1.5 1.5 0 0 1 .58-2.79l-.08-.045a1.5 1.5 0 0 1 1.5-2.598l3.198 1.847l.03-.013l-.395-4.446l-.002-.026a1.5 1.5 0 0 1 2.935-.532a1.5 1.5 0 0 1 2.685.92v4.487l1.145-1.824c.362-.656 1.197-.877 1.865-.494c.67.385.917 1.234.547 1.89l-1.152 2.715c-.19.474-.315 1.033-.447 1.618c-.269 1.195-.563 2.5-1.473 3.41a4.027 4.027 0 0 1-1.724 1.01"/><path d="M21.636 13.727a2.49 2.49 0 0 1 .242-1.314a2.5 2.5 0 0 0-3.768 2.82a2.492 2.492 0 0 1 2.19.151l1.563.903z"/><path d="M29.25 14a2.49 2.49 0 0 0-.658-1.69c-.498-2.144-1.448-4.033-2.828-5.532C23.647 4.48 20.43 3 15.999 3c-4.43 0-7.648 1.48-9.764 3.778c-1.63 1.769-2.66 4.082-3.053 6.716a2.431 2.431 0 0 0-2.148 1.347c.213-3.614 1.436-6.927 3.73-9.418C7.314 2.654 11.095 1 15.999 1c4.904 0 8.686 1.654 11.236 4.423c2.331 2.532 3.556 5.912 3.739 9.595a2.362 2.362 0 0 0-1.724.36zM13 25c0 1.652 1.348 3 3 3s3-1.348 3-3s-1.348-3-3-3s-3 1.348-3 3"/><path d="M6.92 12.8a1.372 1.372 0 0 1 1.82-.54c.514.271.764.829.661 1.367l.368-.65a1.436 1.436 0 0 1 1.905-.564c.674.354.914 1.182.537 1.849l-.1.175a1.41 1.41 0 0 1 .906.138c.674.355.915 1.183.537 1.85l-.323.57c.31-.05.637.002.925.17a1.32 1.32 0 0 1 .433 1.876l-3.594 5.5a4.82 4.82 0 0 1-2.463 2.144c-2.476.968-5.26-.235-6.218-2.687a4.71 4.71 0 0 1-.292-2.279a1.472 1.472 0 0 1-.002-.138l.082-2.532l-.304-3.035c-.075-.75.49-1.428 1.26-1.512c.765-.083 1.44.454 1.51 1.2l.099 1.076zm4.58-6.575a.75.75 0 0 1-.725.775C8.661 7.07 7.5 8.837 7.5 10.25a.75.75 0 0 1-1.5 0c0-2.087 1.674-4.647 4.725-4.75a.75.75 0 0 1 .775.725m9.5 0a.75.75 0 0 0 .725.775C23.839 7.07 25 8.837 25 10.25a.75.75 0 0 0 1.5 0c0-2.087-1.674-4.647-4.725-4.75a.75.75 0 0 0-.774.725"/></g>`;
  iconTitleContainer.appendChild(svg);

  // Create a title element
  const title = document.createElement("div");
  title.textContent = "  -- WebPeek Summary --   ";
  title.style.fontFamily = "Trebuchet MS";
  title.style.fontSize = "22px";
  title.style.fontWeight = "bold";
  title.style.textAlign = "center";
  title.style.color = "#ffffff";
  title.style.marginLeft = "10px";
  iconTitleContainer.appendChild(title);
  header.appendChild(iconTitleContainer);

  // Create a divider element
  const divider3 = document.createElement("div");
  divider3.style.margin = "0px";
  divider3.style.width = "100%";
  divider3.style.height = "1px";
  divider3.style.backgroundColor = "#cdcdcd";
  header.appendChild(divider3);

  // Create a TLDR element
  const tldr = document.createElement("div");
  tldr.textContent = "tldr; " + text;
  tldr.style.fontSize = "18px";
  tldr.style.padding = "20px";
  tldr.style.color = "#cdcdcd";
  tldr.style.textAlign = "center";
  tldr.style.fontFamily = "Trebuchet MS";
  header.appendChild(tldr);

  // Create a speaker icon element for text-to-speech functionality
  const speakerIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  speakerIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  speakerIcon.style.width = "2em";
  speakerIcon.style.height = "2em";
  speakerIcon.setAttribute("viewBox", "0 0 16 16");
  speakerIcon.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M9 2.5a.5.5 0 0 0-.849-.358l-2.927 2.85H3.5a1.5 1.5 0 0 0-1.5 1.5v2.99a1.5 1.5 0 0 0 1.5 1.5h1.723l2.927 2.875A.5.5 0 0 0 9 13.5zm1.111 2.689a.5.5 0 0 1 .703-.08l.002.001l.002.002l.005.004l.015.013l.046.04c.036.034.085.08.142.142c.113.123.26.302.405.54c.291.48.573 1.193.573 2.148c0 .954-.282 1.668-.573 2.148a3.394 3.394 0 0 1-.405.541a2.495 2.495 0 0 1-.202.196l-.008.007h-.001s-.447.243-.703-.078a.5.5 0 0 1 .075-.7l.002-.002l-.001.001l.002-.001h-.001l.018-.016c.018-.017.048-.045.085-.085a2.4 2.4 0 0 0 .284-.382c.21-.345.428-.882.428-1.63c0-.747-.218-1.283-.428-1.627a2.382 2.382 0 0 0-.368-.465a.5.5 0 0 1-.096-.717m1.702-2.08a.5.5 0 1 0-.623.782l.011.01l.052.045c.047.042.116.107.201.195c.17.177.4.443.63.794c.46.701.92 1.733.92 3.069a5.522 5.522 0 0 1-.92 3.065c-.23.35-.46.614-.63.79a3.922 3.922 0 0 1-.252.24l-.011.01h-.001a.5.5 0 0 0 .623.782l.033-.027l.075-.065c.063-.057.15-.138.253-.245a6.44 6.44 0 0 0 .746-.936a6.522 6.522 0 0 0 1.083-3.614a6.542 6.542 0 0 0-1.083-3.618a6.517 6.517 0 0 0-.745-.938a4.935 4.935 0 0 0-.328-.311l-.023-.019l-.007-.006l-.002-.002zM10.19 5.89l-.002-.001Z"/></svg>';
  speakerIcon.style.cursor = "pointer";
  // Add event listener to the icon
  speakerIcon.addEventListener("click", () => {
    const summary = text;
    if (summary) {
      tts(summary, targetLanguage);
    } else {
      console.error("Summary not found in console log.");
    }
  });
  iconTitleContainer.appendChild(speakerIcon);

  document.body.parentNode.insertBefore(header, document.body);
}

// Summarize the given text
async function summarize(text, options) {
  chrome.storage.sync.get(['apiKey', 'options'], async (data) => {
    const apiKey = data.apiKey;
    const storedOptions = data.options;

    // Determine target language from stored options or default to English
    const targetLanguage = storedOptions && storedOptions.targetLanguage ? storedOptions.targetLanguage : 'en';

    if (!apiKey) {
      console.log("Please set an API key in WebPeek > Options. You can get one from https://dashboard.cohere.ai/api-keys");
      return;
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json",
        "Authorization": "Bearer " + apiKey,
        "Request-Source": "sandbox-condense"
      },
      body: JSON.stringify({
        ...options,
        text: text,
        additional_command: "of this webpage"
      })
    };

    try {
      const response = await fetch('https://api.cohere.ai/v1/summarize', requestOptions);
      const summaryResponse = await response.json();
      // Check if summary is available
      if (summaryResponse.summary === undefined) {
        console.log("There was an error: " + summaryResponse.message, options.displayColor);
      } else {
        const summary = summaryResponse.summary;
        console.log(summary);

        // Display summary header with or without translation based on target language
        if (targetLanguage === 'en') {
          headerDisplay(summary, options.displayColor, targetLanguage);
        } else {
          const translatedSummary = await translateText(summary, targetLanguage);
          console.log(translatedSummary.translation_data.translation);
          headerDisplay(translatedSummary.translation_data.translation, options.displayColor, targetLanguage);
        }
      }
    } catch (error) {
      headerDisplay("An error occurred: " + error.message, options.displayColor, targetLanguage);
    }
  });
}

async function translateText(text, targetLanguage) {
  const apiKey = '30c449f598msh3e861e1c2371d0fp181ac7jsn98e3ed20cbc1';
  const url = 'https://google-translation-unlimited.p.rapidapi.com/translate';

  // Options for the translation request
  const translationOptions = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'google-translation-unlimited.p.rapidapi.com'
    },
    body: new URLSearchParams({
      texte: text,
      to_lang: targetLanguage
    })
  };

  try {
    // Send translation request
    const response = await fetch(url, translationOptions);
    if (response.ok) {
      // Parse and return translation result
      const result = await response.json();
      console.log(result);
      return result;
    } else {
      throw new Error('Translation failed: ' + response.status);
    }
  } catch (error) {
    console.error("An error occurred while translating text:", error);
    return null;
  }
}

// Generate text-to-speech for the summary in the target language
async function tts(summary, targetLanguage) {
  const apiKey = '30c449f598msh3e861e1c2371d0fp181ac7jsn98e3ed20cbc1';

  // Settings for the text-to-speech request
  const settings = {
    async: true,
    crossDomain: true,
    url: `https://all-purpose-complex-converter.p.rapidapi.com/text_to_speech/${encodeURIComponent(summary)}/${targetLanguage}/`,
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'all-purpose-complex-converter.p.rapidapi.com'
    }
  };

  try {
    // Send text-to-speech request
    const response = await fetch(settings.url, { method: 'GET', headers: settings.headers });
    if (response.ok) {
      // Get audio data and play it
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Pause any current audio playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      // Play the new audio
      const audio = new Audio(audioUrl);
      audio.play();
      currentAudio = audio;
    } else {
      // Handle text-to-speech request failure
      throw new Error('TTS request failed: ' + response.statusText);
    }
  } catch (error) {
    // Log any errors that occur during text-to-speech generation
    console.error("An error occurred while generating TTS:", error.message);
  }
}

// Check if an element is hidden
function isHidden(el) {
    const style = window.getComputedStyle(el);
    return style.display === 'none' || style.visibility === 'hidden';
}

// Get visible text content from the DOM
function getVisibleText() {
    // Determine the body element to search for visible text
    let body = document.querySelector('body');
    if (document.querySelector('#content')) {
        body = document.querySelector('#content');
    }
    if (document.main) {
        body = document.querySelector('main');
    }
    // Get all elements within the body
    const allTags = body.getElementsByTagName('*');

    // Initialize variables for tracking visible text
    let visibleText = [];
    let nChars = 0;

    // Iterate through all elements
    for (let i = 0, max = allTags.length; i < max; i++) {
        const elem = allTags[i];
        // Check if the element is visible
        if (!isHidden(elem)) {
            // Extract text content from the element
            const text = $(elem).contents().filter(function() {
                return this.nodeType === Node.TEXT_NODE;
            });
            // Continue if no text content is found
            if (text === undefined || text.length === 0) {
                continue;
            }
            const nodeValue = text[0].nodeValue;
            // Add text content to the visible text array, respecting character limit
            if (nodeValue) {
                nChars += nodeValue.length + 1;
                if (nChars < charLimit) {
                    visibleText.push(nodeValue);
                } else {
                    break;
                }
            }
        }
    }
    // Return the visible text as a single string
    return visibleText.join('\n');
}

// Event listener for mouseover event on body element
document.body.addEventListener("mouseover", async (e) => {
  // Check if the current page is a Google search results page
  if (!window.location.href.startsWith("https://www.google.com/search?q=")) {
    return;
  }

  // Retrieve API key from Chrome storage
  chrome.storage.sync.get('apiKey', async (data) => {
    const apiKey = data.apiKey;
    // Check if API key exists
    if (!apiKey) {
      console.log("Please set an API key in WebPeek > Options. You can get one from https://dashboard.cohere.ai/api-keys");
      return;
    }

    // Find closest link tag to the mouseover event
    const foundTag = findClosestLinkTag(e);
    // Process if a link tag is found and it's different from previous
    if (foundTag && foundTag !== previousTag) {
      // Abort any previous requests
      if (abortController) abortController.abort("newrequest");
      previousTag = foundTag;
      abortController = new AbortController();
      try {
        // Display loader and popup container
        showPopupLoader();
        showPopupContainer();
        // Position popup relative to the found link
        repositionPopup(foundTag);

        // Fetch Open Graph data using the link's href
        const ogDataResponse = await fetch(`${cdnURL}${foundTag.href}`, { signal: abortController.signal });
        
        // Return if request was aborted
        if (abortController.signal.aborted) {
          return;
        }
        
        // Parse Open Graph data
        const ogData = await ogDataResponse.json();

        // Populate popup content with Open Graph data
        popupContent({
          title: ogData.title,
          description: ogData.description,
          image: ogData.image,
          type: ogData.type,
          url: ogData.url
        });

        // Hide loader after data is fetched
        hidePopupLoader();
      } catch (e) {
        // Hide loader and log error message if request fails
        hidePopupLoader();
        if (!abortController.signal.aborted) {
          console.log(e.message);
        }
      }
    } else if (!foundTag) {
      // Abort previous request if no tag is found and hide popup container
      if (abortController) abortController.abort("mouseout");
      previousTag = null;
      hidePopupContainer();
    }
  });
});

// Main function to initialize
function main() {
  // Retrieve API key and other options from Chrome storage
  chrome.storage.sync.get(['apiKey', 'options', 'displayColor'], data => {
      const apiKey = data.apiKey;
      // Check if API key exists
      if (!apiKey) {
          headerDisplay("Please set an API key in WebPeek > Options. You can get one from https://dashboard.cohere.ai/api-keys");
          return;
      }
      const options = data.options || {};
      // Get visible text and summarize
      const visibleText = getVisibleText();
      summarize(visibleText, options);
  });
}

// Call main function to start execution
main();
