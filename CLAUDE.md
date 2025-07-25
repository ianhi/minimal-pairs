# Minimal Pairs Project Structure

This document provides an overview of the Minimal Pairs project structure and how the data is organized.

## Project Overview

The Minimal Pairs project is a web application for language learning that helps users practice distinguishing between similar-sounding words (minimal pairs) in a language. The current focus is on Bengali (Bangla) language.

## Directory Structure

- `/src/` - Vue.js frontend code
  - `/components/` - Reusable Vue components
  - `/router/` - Vue Router configuration
  - `/views/` - Vue page components
- `/public/` - Static assets
  - `/audio/` - Audio files for minimal pairs
- `/audio/` - Scripts and tools for generating audio files
- `/minimal_pairs_data.js` - Data file containing minimal pairs information

## Data Structure

### Current Structure

Currently, the minimal pairs data is organized as follows:

1. In `minimal_pairs_data.js`, minimal pairs are organized by categories (e.g., "Oral vs. Nasalized Vowels").
2. Each category has:
   - `path`: Directory path for audio files
   - `pairs`: Array of minimal pairs, where each pair is an array of two words
3. Each word in a pair is represented as an array: `[Bengali word, Transliteration]`
4. Audio files are named after the transliteration and stored in the specified path

Example:
```javascript
"Oral vs. Nasalized Vowels": {
    path: "audio/bn-IN/oral-nasal",
    pairs: [
        [["কাঁদা", "kãda"], ["কাদা", "kada"]],
        [["বাঁশ", "bãsh"], ["বাস", "bash"]],
        // more pairs...
    ]
}
```

### Current Audio Structure

Currently, audio files are stored with a flat naming structure:
- Audio files are named as `{transliteration}_{recording_number}.mp3` (e.g., `patth_1.mp3`, `patth_2.mp3`)
- Files are stored in category-specific directories (e.g., `public/audio/bn-IN/dental-retroflex/`)
- Each word currently has exactly 2 recordings

### New Tree-like Structure (Planned)

The new structure will organize audio files in a hierarchical tree format to support multiple voice models and recordings:

**Directory Structure:**
```
public/audio/
└── bn-IN/
    ├── patth/
    │   ├── patth_1.wav
    │   ├── patth_2.wav
    │   ├── patth_3.wav
    │   └── ...
    ├── pada/
    │   ├── pada_1.wav
    │   ├── pada_2.wav
    │   └── ...
    └── ...
```

**Benefits:**
1. **Multiple Voice Models**: Each word can have recordings from many different voice models/speakers
2. **Scalability**: Easy to add new recordings without filename conflicts
3. **Organization**: Cleaner separation of recordings per word
4. **Dynamic Selection**: Frontend can randomly select from available recordings for more variety

**Implementation Requirements:**
1. Update JSON data structure to reference word directories instead of specific files
2. Modify audio generation script to create word-specific directories
3. Update frontend to discover and randomly select from available recordings
4. Implement fallback logic for missing recordings

## Audio Generation

Audio files are generated using:
1. `make_audio.py` - Python script that uses Google Cloud Text-to-Speech API
2. The script generates audio for each word in the minimal pairs
3. Audio files are saved in the appropriate directory structure

## Frontend Implementation

The main gameplay is implemented in `LanguagePractice.vue`, which:
1. Loads minimal pairs data from JSON
2. Presents a random word audio to the user
3. Asks the user to identify which word they heard from two choices
4. Tracks user performance and provides feedback

The application uses Vue.js with Vue Router for navigation and component-based architecture.