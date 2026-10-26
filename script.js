const apiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const searchForm = document.querySelector("#search-form");
const wordInput = document.querySelector("#word-input");
const results = document.querySelector("#results");
const resultsHeading = document.querySelector("#results-heading");
const resultsKicker = document.querySelector("#results-kicker");
const resultCount = document.querySelector("#result-count");
const statusMessage = document.querySelector("#status-message");
const emptyState = document.querySelector("#empty-state");
const favoritesList = document.querySelector("#favorites-list");
const favoritesEmpty = document.querySelector("#favorites-empty");
const favoriteCount = document.querySelector("#favorite-count");
const themeToggle = document.querySelector("#theme-toggle");

let favorites = [];
let currentSearch = 0;

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = "status-message " + type;
  statusMessage.hidden = false;
}

function hideMessage() {
  statusMessage.textContent = "";
  statusMessage.hidden = true;
}

async function searchWord(word) {
  currentSearch += 1;
  const searchId = currentSearch;

  results.innerHTML = "";
  resultCount.hidden = true;
  emptyState.hidden = true;
  resultsHeading.textContent = "Looking it up...";
  resultsKicker.textContent = "ONE MOMENT";
  showMessage("Searching for “" + word + "”…", "loading");

  try {
    const response = await fetch(apiUrl + encodeURIComponent(word));

    if (searchId !== currentSearch) return;

    if (response.status === 404) {
      resultsHeading.textContent = "No word found";
      resultsKicker.textContent = "TRY ANOTHER SEARCH";
      showMessage("We couldn't find “" + word + "”. Check the spelling or try another word.", "error");
      return;
    }

    if (!response.ok) {
      throw new Error("The dictionary service returned an error.");
    }

    const entries = await response.json();

    if (searchId !== currentSearch) return;
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error("The dictionary returned no results.");
    }

    showResults(entries);
  } catch (error) {
    if (searchId !== currentSearch) return;

    console.error("Dictionary search failed.", error);
    resultsHeading.textContent = "Search unavailable";
    resultsKicker.textContent = "PLEASE TRY AGAIN";
    showMessage("We couldn't reach the dictionary. Check your connection and try again.", "error");
  }
}

function showResults(entries) {
  results.innerHTML = "";

  entries.forEach(function (entry) {
    results.appendChild(createWordCard(entry));
  });

  resultsHeading.textContent = entries[0].word;
  resultsKicker.textContent = "WORD DISCOVERY";
  resultCount.textContent = entries.length + (entries.length === 1 ? " entry" : " entries");
  resultCount.hidden = false;
  hideMessage();
}

function createWordCard(entry) {
  const card = createElement("article", "word-card", "");
  const header = createElement("div", "word-header", "");
  const wordDetails = createElement("div", "word-details", "");
  const title = createElement("h3", "word-title", entry.word);
  const pronunciationText = entry.phonetic || "Pronunciation unavailable";
  const pronunciation = createElement("p", "pronunciation", pronunciationText);

  wordDetails.append(title, pronunciation);
  header.appendChild(wordDetails);

  const audioUrl = getAudioUrl(entry);
  if (audioUrl) {
    header.appendChild(createAudioButton(entry.word, audioUrl));
  }

  header.appendChild(createSaveButton(entry.word));
  card.appendChild(header);

  if (entry.meanings) {
    entry.meanings.forEach(function (meaning) {
      card.appendChild(createMeaning(meaning));
    });
  }

  if (entry.sourceUrls && entry.sourceUrls.length > 0) {
    const source = createElement("p", "source-line", "");
    const sourceLink = createElement("a", "", "Source");
    sourceLink.href = entry.sourceUrls[0];
    sourceLink.target = "_blank";
    sourceLink.rel = "noreferrer";
    source.appendChild(sourceLink);
    card.appendChild(source);
  }

  return card;
}

function getAudioUrl(entry) {
  if (!entry.phonetics) return "";

  for (let i = 0; i < entry.phonetics.length; i += 1) {
    if (entry.phonetics[i].audio) {
      return entry.phonetics[i].audio;
    }
  }

  return "";
}

function createAudioButton(word, audioUrl) {
  const button = createElement("button", "audio-button", "🔊");
  button.type = "button";
  button.setAttribute("aria-label", "Play pronunciation of " + word);

  button.addEventListener("click", function () {
    const audio = new Audio(audioUrl);

    audio.play().catch(function (error) {
      console.error("Could not play pronunciation.", error);
      showMessage("Pronunciation audio could not be played.", "error");
    });
  });

  return button;
}

function createSaveButton(word) {
  const button = createElement("button", "save-button", "");
  button.type = "button";
  updateSaveButton(button, word);

  button.addEventListener("click", function () {
    toggleFavorite(word);
  });

  return button;
}

function updateSaveButton(button, word) {
  const saved = favorites.some(function (favorite) {
    return favorite.toLowerCase() === word.toLowerCase();
  });

  button.className = saved ? "save-button is-saved" : "save-button";
  button.setAttribute("aria-pressed", saved);
  button.textContent = saved ? "♥ Saved" : "♡ Save word";
}

function createMeaning(meaning) {
  const section = createElement("section", "meaning-section", "");
  const heading = createElement("div", "meaning-heading", "");
  const partOfSpeech = createElement("h4", "part-of-speech", meaning.partOfSpeech || "Meaning");
  const line = createElement("span", "meaning-rule", "");
  const definitionList = createElement("ol", "definition-list", "");

  heading.append(partOfSpeech, line);
  section.appendChild(heading);

  meaning.definitions.forEach(function (definition) {
    const item = createElement("li", "definition-item", "");
    item.appendChild(createElement("p", "definition-text", definition.definition));

    if (definition.example) {
      item.appendChild(createElement("p", "example-text", "“" + definition.example + "”"));
    }

    let synonyms = definition.synonyms;
    if ((!synonyms || synonyms.length === 0) && meaning.synonyms) {
      synonyms = meaning.synonyms;
    }

    if (synonyms && synonyms.length > 0) {
      const synonymText = synonyms.slice(0, 8).join(", ");
      const synonymsElement = createElement("p", "synonym-row", "Similar: " + synonymText);
      item.appendChild(synonymsElement);
    }

    definitionList.appendChild(item);
  });

  section.appendChild(definitionList);
  return section;
}

function toggleFavorite(word) {
  const updatedFavorites = favorites.filter(function (favorite) {
    return favorite.toLowerCase() !== word.toLowerCase();
  });

  if (updatedFavorites.length === favorites.length) {
    updatedFavorites.push(word);
  }

  try {
    localStorage.setItem("wordly-favorites", JSON.stringify(updatedFavorites));
    favorites = updatedFavorites;
    showFavorites();
    updateResultButtons(word);
  } catch (error) {
    console.error("Could not save favorite words.", error);
    showMessage("Your browser could not save this word.", "error");
  }
}

function updateResultButtons(word) {
  const cards = results.querySelectorAll(".word-card");

  cards.forEach(function (card) {
    const title = card.querySelector(".word-title");

    if (title.textContent.toLowerCase() === word.toLowerCase()) {
      updateSaveButton(card.querySelector(".save-button"), word);
    }
  });
}

function showFavorites() {
  favoritesList.innerHTML = "";
  favoriteCount.textContent = favorites.length;
  favoritesEmpty.hidden = favorites.length > 0;
  favoritesList.appendChild(favoritesEmpty);

  favorites.forEach(function (word) {
    const item = createElement("div", "favorite-item", "");
    const searchButton = createElement("button", "favorite-word", word);
    const removeButton = createElement("button", "remove-favorite", "×");

    searchButton.type = "button";
    searchButton.addEventListener("click", function () {
      wordInput.value = word;
      searchWord(word);
    });

    removeButton.type = "button";
    removeButton.setAttribute("aria-label", "Remove " + word + " from favorites");
    removeButton.addEventListener("click", function () {
      toggleFavorite(word);
    });

    item.append(searchButton, removeButton);
    favoritesList.appendChild(item);
  });
}

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const word = wordInput.value.trim();

  if (word) {
    searchWord(word);
  }
});

themeToggle.addEventListener("click", function () {
  const isDark = document.body.classList.toggle("dark-theme");
  const theme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-label", "Switch to " + (isDark ? "light" : "dark") + " theme");

  try {
    localStorage.setItem("wordly-theme", theme);
  } catch (error) {
    console.error("Could not save theme preference.", error);
  }
});

try {
  if (localStorage.getItem("wordly-theme") === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.setAttribute("aria-label", "Switch to light theme");
  }

  const savedFavorites = JSON.parse(localStorage.getItem("wordly-favorites") || "[]");
  if (Array.isArray(savedFavorites)) {
    favorites = savedFavorites.filter(function (word) {
      return typeof word === "string";
    });
  }
} catch (error) {
  console.error("Could not load saved settings.", error);
}

showFavorites();
