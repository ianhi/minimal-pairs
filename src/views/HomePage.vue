<template>
    <div class="container mx-auto p-4">
        <header class="text-center my-8">
            <h1 class="text-4xl font-bold text-gray-800">Minimal Pairs Practice</h1>
            <p class="text-lg text-gray-600 mt-2">Choose a language to start practicing your pronunciation!</p>
        </header>

        <section id="inspiration" class="text-center my-6">
            <p class="text-md text-gray-500 italic">
                Inspired by the recommendations in the <a href="https://fluent-forever.com/book/" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer-when-downgrade" class="text-blue-500 hover:text-blue-700 underline">Fluent Forever book</a>.
            </p>
        </section>

        <main>
            <section id="language-selection" class="mt-10">
                <h2 class="text-2xl font-semibold text-gray-700 mb-6 text-center">Available Languages</h2>
                <div class="flex flex-wrap justify-center gap-6">
                    <!-- Bengali Card -->
                    <router-link to="/practice/bn-IN" 
                                 class="language-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out w-full sm:w-1/2 md:w-1/3 lg:w-1/4 cursor-pointer">
                        <h3 class="text-xl font-semibold text-blue-600">Bangla (বাংলা) 🇮🇳 </h3>
                        <p class="text-gray-600 mt-2">Kolkata style Bengali</p>
                    </router-link>

                    <!-- Add more language cards here as you support them -->
                    <!-- Example:
                    <router-link to="/practice/es-ES" class="language-card ...">
                        <h3 class="text-xl font-semibold text-green-600">Spanish (Español)</h3>
                        <p class="text-gray-600 mt-2">Practice distinguishing similar-sounding words in Spanish.</p>
                    </router-link>
                    -->
                </div>
            </section>

            <section id="open-source-free" class="mt-12 py-8 text-center">
                <h2 class="text-2xl font-semibold text-gray-700 mb-4">❤️ Open & Free Forever! 🎁</h2>
                <div class="max-w-2xl mx-auto text-gray-600 px-4">
                    <p class="mb-3 text-lg">
                        <br/>This project is what I wish I had when I started learning Bangla. 
                        <br/>It will always be <strong class="text-green-600">completely free to use</strong><br/>
                        No hidden fees, no premium versions - just learning! 🚀
                        <br/><br/>
                        It is also proudly <strong class="text-indigo-600">open-source</strong>.
                    </p>
                    <a href="https://github.com/ianhi/minimal-pairs" target="_blank" rel="noopener noreferrer" 
                       class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300">
                        Contribute or Report Issues on Github
                    </a>
                </div>
            </section>

            <section id="ai-assisted" class="mt-12 py-8 text-center">
                <h2 class="text-2xl font-semibold text-gray-700 mb-6">🤖 AI Usage 🤖</h2>
                <p class="text-lg">
                    This project started as a combination of scratching an itch and an attempt to learn how to vibe code.<br/><br/>
                </p>
                <div class="max-w-2xl mx-auto text-gray-600 px-4">
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">👯‍♂️ Minimal Pairs Determination 👯‍♂️</h3>
                        <p class="text-lg">
                            For Bangla I struggled to find a good list of minimal pairs. So I used LLMs to generate a list of candidates and then had a native speaker validate the choices.<br/>
                        </p>
                        </div>
                    </div>
                <div class="max-w-2xl mx-auto text-gray-600 px-4">
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">🎤 Audio Generation 🎤</h3>
                        <p class="text-lg">
                             I chose to use Google Cloud Text to Speech to instead of native spearker audio
                            in order to achieve the highest possible consistency between words. I applied custom post-processing to align
                            the audio in time. For Bangla I had a native speaker validate the audio was correct. The Bangla audio was generated
                            with the bn-IN-Chirp3-HD-Aoede voice.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">💻 Code Development 💻</h3>
                        <p class="text-lg">
                            I heavily used gemini code assist to make this page. This was my first significant web project and without AI tools I'm not sure I would have made it at all.
                            The Python code to generate the audio is a mix of AI and hand coded, the audio alignment and trimming code was written by me.
                        </p>
                    </div>
                </div>
            </section>


            <section id="about" class="mt-12 py-8 bg-gray-50 rounded-lg">
                <h2 class="text-2xl font-semibold text-gray-700 mb-6 text-center">About This Project</h2>
                <div class="max-w-2xl mx-auto text-center text-gray-600 px-4">
                    <p class="mb-4">
                        This Minimal Pairs Practice tool is designed to help you learn to distinguish between sounds when learning a language by
                        testing distinguishing between similar-sounding words.
                    </p>
                </div>
            </section>
        </main>

        <footer class="text-center mt-12 py-4 border-t">
            <p class="text-gray-500">
                &copy; {{ new Date().getFullYear() }} Minimal Pairs Practice. 
                Released under the <a href="https://github.com/ianhi/minimal-pairs/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 underline">BSD 3-Clause License</a>.
                <!-- Make sure the href above points to your LICENSE file on GitHub once you push it -->
            </p>
        </footer>
    </div>
</template>

<script setup>
// No specific script needed for this simple homepage yet.
</script>

<style scoped>
.language-card {
    text-decoration: none; /* Removes underline from router-link */
}
/* Add any additional specific styles for the homepage here */
.container {
    display: block; /* Ensure it's a block-level element for mx-auto */
    width: 100%;    /* Allow it to take full width of its parent initially */
    max-width: 960px; /* Constrain its maximum width */
    /* Centering is handled by 'mx-auto' Tailwind class */
    /* Padding is handled by 'p-4' Tailwind class */
}
</style>