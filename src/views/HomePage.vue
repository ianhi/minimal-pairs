<template>
    <div class="container mx-auto p-4">
        <header class="text-center my-8">
            <h1 class="text-4xl font-bold text-gray-800">Minimal Pairs Practice</h1>
            <p class="text-lg text-gray-600 mt-2">Choose a language to start practicing your pronunciation!</p>
        </header>

        <main>
            <section id="language-selection" class="mt-10">
                <h2 class="text-2xl font-semibold text-gray-700 mb-6 text-center">Available Languages</h2>
                <div class="flex flex-wrap justify-center gap-6">
                    <!-- Bengali Card -->
                    <router-link to="/practice/bn-IN" 
                                 class="language-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out w-full sm:w-1/2 md:w-1/3 lg:w-1/4 cursor-pointer">
                        <h3 class="text-xl font-semibold text-blue-600">Bengali (বাংলা)</h3>
                        <p class="text-gray-600 mt-2">Practice distinguishing similar-sounding words in Bengali.</p>
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
        </main>

        <footer class="text-center mt-12 py-4 border-t">
            <p class="text-gray-500">&copy; {{ new Date().getFullYear() }} Minimal Pairs Practice</p>
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