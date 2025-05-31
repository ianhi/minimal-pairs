// /Users/ian/Documents/bangla/minimal-pairs/minimal_pairs_data.js
// Define an object of Bengali minimal pairs, categorized by type.
const allMinimalPairsData = {
    "Aspirated vs. Unaspirated Consonants": [
        ['চাল', 'ছাল'],
        ['কাল', 'খাল'],
        ['বাঘ', 'ভাগ'],
        ['কান', 'খান'],
        ['পাকা', 'পাখা']
    ],
    "Alveolar vs. Dental Consonants": [
        ['জল', 'দল']
    ],
    "Voiced vs. Voiceless Consonants (Initial)": [
        ['ভাত', 'হাত'],
        ['বেল', 'ভেল'] // Example: b vs bh (though bhel is less common)
    ],
    "Short vs. Long Vowels": [
        ['দিন', 'দীন']
    ],
    "Oral vs. Nasalized Vowels": [
        ['আশা', 'আঁশা']
    ],
    "Sibilant Consonants (শ vs স)": [
        ['শাপ', 'সাপ']
    ],
    "Vowel Contrast (উ vs আ)": [
        ['ফুল', 'ফাল']
    ],
    "Dental ত vs. Retroflex ট":[
        ["তাল", "টাল"], 
        ["দান", "ডান"], // Dental 'দ' vs. Retroflex 'ড'
        ["পাতা", "পাটা"], // Dental 'ত' vs. Retroflex 'ট'
        ["হাত", "হাট"], // Dental 'ত' vs. Retroflex 'ট'
        ["কাদা", "কাটা"], // Dental 'দ' vs. Retroflex 'ট'
        ["তন", "টন"], // Dental 'ত' vs. Retroflex 'ট'
        // ["নল", "ণল"], // Dental 'ন' vs. Retroflex 'ণ' (Retroflex 'ণ' usage is limited)
        ["ভীত", "ভিট"], // Dental 'ত' vs. Retroflex 'ট'
        ["আঁত", "আঁট"], // Dental 'ত' vs. Retroflex 'ট'
        ["দাগ", "ডাগ"], // Dental 'দ' vs. Retroflex 'ড' (Second word less common)
        ["তার", "টার"], // Dental 'ত' vs. Retroflex 'ট' (Second word less common)
        ["তালি", "টালি"], // Dental 'ত' vs. Retroflex 'ট'
        ["আদর", "আডার"], // Dental 'দ' vs. Retroflex 'ড' (Second word borrowed)
        ["তুষ", "টুস"], // Dental 'ত' vs. Retroflex 'ট'
        ["পীত", "পিট"], // Dental 'ত' vs. Retroflex 'ট'
        ["রতি", "রটি"], // Dental 'ত' vs. Retroflex 'ট' (Second word less common)
        ["সাদ", "সাড"], // Dental 'দ' vs. Retroflex 'ড' (Both words less common)
        ["মতি", "মটি"], // Dental 'ত' vs. Retroflex 'ট' (Second word less common)
        ["কণ", "কন"], // Retroflex 'ণ' vs. Dental 'ন' ('ণ' not usually word-initial)
        ["ভিতর", "ভিটার"], // Dental 'ত' vs. Retroflex 'ট'
    ],
    "Dental aspirated vs. Retroflex aspirated":[
        ["থাল", "ঠাল"], // Dental aspirated 'থ' vs. Retroflex aspirated 'ঠ'
        ["ধরা", "ঢোরা"], // Dental aspirated voiced 'ধ' vs. Retroflex aspirated voiced 'ঢ'
        ["ধাম", "ঢাম"], // Dental aspirated voiced 'ধ' vs. Retroflex aspirated voiced 'ঢ' (Second word less common)
        ["থালা", "ঠালা"], // Dental aspirated 'থ' vs. Retroflex aspirated 'ঠ' (Second word less common)
        ["পাথ", "পাঠ"]  // Dental aspirated 'থ' vs. Retroflex aspirated 'ঠ'
    ]
    // Example of a type with no pairs initially, it won't show in dropdown:
    // "Future Category": []
};