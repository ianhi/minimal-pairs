import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LanguagePractice from '../views/LanguagePractice.vue';

const routes = [
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

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // Or just createWebHistory()
    routes,
});

export default router;