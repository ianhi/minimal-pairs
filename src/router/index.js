import { createWebHistory } from 'vue-router'; // Keep for potential client-side only router, but ViteSSG handles it
import HomePage from '../views/HomePage.vue';
import LanguagePractice from '../views/LanguagePractice.vue';

export const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
    },
    {
        path: '/practice/:langCode', // e.g., /practice/bn-IN
        name: 'LanguagePractice',
        component: LanguagePractice,
        props: true, // Passes route.params as props to the component
    },
];

// ViteSSG will handle router creation.
// We only need to export the routes array.
// The createRouter call below is removed as ViteSSG handles it.
// const router = createRouter({
//     history: createWebHistory(import.meta.env.BASE_URL),
//     routes,
// });
// export default router;