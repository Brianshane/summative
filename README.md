# Wordly Dictionary

A simple, single-page dictionary app. Search for an English word to see its definition, part of speech, examples, synonyms, and pronunciation when available. You can save words and switch between light and dark themes.

## Run the app

There are no packages to install. From the project folder, start a local server:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser. Using a local server lets the browser make requests to the dictionary API.

## How to use it

1. Enter a word in the search box and press **Search** or Enter.
2. Read the returned definitions and examples. Use the speaker button to play pronunciation when audio is available.
3. Select **Save word** to add a word to your saved list. Select a saved word to search for it again, or use **×** to remove it.
4. Select the theme button in the top-right corner to switch themes.

Search results come from the [Free Dictionary API](https://dictionaryapi.dev/). Saved words and the selected theme are stored in your browser on this device.

## Project files

- `index.html` — page content and search form
- `styles.css` — page layout and appearance
- `script.js` — API search and interactive features
