// /Users/ian/Documents/bangla/minimal-pairs/minimal_pairs_data.js
// Define an object of Bengali minimal pairs, categorized by type.
// All categories now follow the structure: { path: "optional/path", pairs: [...] }
// If path is not specified, "audio/aligned" will be used by default in script.js.

export const allMinimalPairsData = {
    // "Aspirated vs. Unaspirated Consonants": {
    //     // path: "audio/aligned", // Implicitly uses default
    //     pairs: [
    //         [['চাল', 'chaal'], ['ছাল', 'chhaal']],
    //         [['কাল', 'kaal'], ['খাল', 'khaal']],
    //         [['বাঘ', 'bagh'], ['ভাগ', 'bhag']],
    //         [['কান', 'kan'], ['খান', 'khan']],
    //         [['পাকা', 'paka'], ['পাখা', 'pakha']]
    //     ]
    // },
    // "Alveolar vs. Dental Consonants": {
    //     // path: "audio/aligned",
    //     pairs: [
    //         [['জল', 'jol'], ['দল', 'dol']]
    //     ]
    // },
    // "Voiced vs. Voiceless Consonants (Initial)": {
    //     // path: "audio/aligned",
    //     pairs: [
    //         [['ভাত', 'bhaat'], ['হাত', 'haat']],
    //         [['বেল', 'bel'], ['ভেল']] // 'ভেল' has no audio filename, will use TTS
    //     ]
    // },
    // "Short vs. Long Vowels": {
    //     // path: "audio/aligned",
    //     pairs: [
    //         [['দিন', 'din'], ['দীন', 'deen']]
    //     ]
    // },
    "Oral vs. Nasalized Vowels": {
        path: "audio/bn-IN/oral-nasal",
        pairs: [[["কাঁদা", "kãda"], ["কাদা", "kada"]],
        [["বাঁশ", "bãsh"], ["বাস", "bash"]],
        [["আঁশ", "ãsh"], ["আশ", "ash"]],
        [["বাঁধা", "bãdha"], ["বাধা", "badha"]],
        [["চাঁপা", "chãpa"], ["চাপা", "chapa"]],
        [["ধোঁয়া", "dhõa"], ["ধোয়া", "dhoa"]],
        [["শোঁক", "shõk"], ["শোক", "shok"]],
        [["গোঁফ", "gõph"], ["গোপ", "gop"]],
        [["হাঁস", "hãs"], ["হাস", "has"]],
        [["চাঁই", "chãi"], ["চাই", "chai"]],
        [["কুঁড়ি", "kũṛi"], ["কুড়ি", "kuṛi_1"]],
        [["শাঁস", "shãs"], ["শাস", "shas"]],
        [["পিঁয়াজ", "pĩyaj"], ["পিয়াজ", "piyaj"]],
        [["পুঁটি", "pũṭi"], ["পুটি", "puṭi"]],
        [["শুঁড়", "shũṛ"], ["শুড়", "shuṛ"]],
        [["কাঁটা", "kãṭa"], ["কাটা", "kaṭa_1"]],
        [["আঁকা", "ãka"], ["আকা", "aka"]],
        [["ফাঁক", "fhãk"], ["ফাক", "fhak"]],
        [["ঝাঁক", "jhãk"], ["ঝাক", "jhak"]],
        [["ঠোঁট", "ṭhõṭ"], ["ঠোট", "ṭhot"]],
        [["লেংটা", "lẽṅṭa"], ["লেটা", "leṭa"]],
        [["আঁটি", "ãṭi"], ["আটি", "aṭi"]],
        [["বেঁকে", "bẽke"], ["বেকে", "beke"]],
        [["ধোঁকা", "dhõka"], ["ধোকা", "dhoka"]],
        [["ভাঙন", "bhãṅon"], ["ভাগন", "bhagon"]]
        ]
    },
    // "Sibilant Consonants (শ vs স)": {
    //     // path: "audio/aligned",
    //     pairs: [
    //         [['শাপ', 'shaap'], ['সাপ', 'saap']]
    //     ]
    // },
    // "Vowel Contrast (উ vs আ)": {
    //     // path: "audio/aligned",
    //     pairs: [
    //         [['ফুল', 'phul'], ['ফাল', 'phaal']]
    //     ]
    // },
    "Dental ত vs. Retroflex ট": {
        path: "audio/bn-IN/dental-retroflex",
        pairs: [
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
    }
    // Example of a type with no pairs initially, it won't show in dropdown:
    // "Future Category": []
};