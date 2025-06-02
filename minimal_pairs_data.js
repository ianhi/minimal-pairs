// /Users/ian/Documents/bangla/minimal-pairs/minimal_pairs_data.js
// Define an object of Bengali minimal pairs, categorized by type.
const allMinimalPairsData = {
    "Aspirated vs. Unaspirated Consonants": [
        [['চাল', 'chaal'], ['ছাল', 'chhaal']],
        [['কাল', 'kaal'], ['খাল', 'khaal']],
        [['বাঘ', 'bagh'], ['ভাগ', 'bhag']],
        [['কান', 'kan'], ['খান', 'khan']],
        [['পাকা', 'paka'], ['পাখা', 'pakha']]
    ],
    "Alveolar vs. Dental Consonants": [
        [['জল', 'jol'], ['দল', 'dol']]
    ],
    "Voiced vs. Voiceless Consonants (Initial)": [
        [['ভাত', 'bhaat'], ['হাত', 'haat']],
        [['বেল', 'bel'], ['ভেল']] // 'ভেল' has no audio filename, will use TTS
    ],
    "Short vs. Long Vowels": [
        [['দিন', 'din'], ['দীন', 'deen']]
    ],
    "Oral vs. Nasalized Vowels": [
        [['আশা', 'asha'], ['আঁশা', 'aansha']] // Assuming these will also be .mp3 now, or you'll adjust extension logic
    ],
    "Sibilant Consonants (শ vs স)": [
        [['শাপ', 'shaap'], ['সাপ', 'saap']]
    ],
    "Vowel Contrast (উ vs আ)": [
        [['ফুল', 'phul'], ['ফাল', 'phaal']]
    ],
    "Dental ত vs. Retroflex ট":[
    [["তাল", "tal"], ["টাল", "ttal"]],
    [["দান", "dan"], ["ডান", "ddan"]],
    [["পাতা", "pata"], ["পাটা", "patta"]],
    [["হাত", "hat"], ["হাট", "hatt"]],
    [["কাদা", "kada"], ["কাটা", "katta"]],
    [["থাল", "thal"], ["ঠাল", "tthal"]],
    [["ধরা", "dhora"], ["ঢোরা", "ddhora"]],
    [["তন", "ton"], ["টন", "tton"]],
    [["নল", "nol"], ["ণল", "nnol"]],
    [["ভীত", "bhit"], ["ভিট", "bhitt"]],
    [["আঁত", "ant"], ["আঁট", "antt"]],
    [["দাগ", "dag"], ["ডাগ", "ddag"]],
    [["তার", "tar"], ["টার", "ttar"]],
    [["তালি", "tali"], ["টালি", "ttali"]],
    [["আদর", "ador"], ["আডার", "addar"]],
    [["তুষ", "tush"], ["টুস", "ttush"]],
    [["ধাম", "dham"], ["ঢাম", "ddham"]],
    [["থালা", "thala"], ["ঠালা", "tthala"]],
    [["পীত", "pit"], ["পিট", "pitt"]],
    [["রতি", "roti"], ["রটি", "rotti"]],
    [["সাদ", "sad"], ["সাড", "ssad"]],
    [["মতি", "moti"], ["মটি", "motti"]],
    [["কণ", "kon"], ["কন", "nkon"]],
    [["ভিতর", "bhitor"], ["ভিটার", "bhittor"]],
    [["পাথ", "path"], ["পাঠ", "patth"]],
    ],
    // Example of a type with no pairs initially, it won't show in dropdown:
    // "Future Category": []
};