import axios from 'axios';
console.log("Toàn bộ biến env:", process.env);
const BASE_URL = process.env.REACT_APP_API_BASE_URL ;


export async function refreshCartRecommendations(userId) {
    try {
        await axios.post(`${BASE_URL}/api/ai/refresh-cart`, { userId });
    } catch (e) {
        console.error('refreshCartRecommendations:', e.message);
    }
}

export async function getAiProductSuggestions(productId, limit = 5) {
    try {
        const res = await axios.get(`${BASE_URL}/api/ai/similar-products/${productId}`, {
            params: { limit }
        });
        return res.data || [];
    } catch (e) {
        console.error('getAiProductSuggestions:', e.message);
        return [];
    }
}

export async function getPersonalizedRecommendations(userId, limit = 10) {
    try {
        const res = await axios.get(`${BASE_URL}/api/ai/personalized/${userId}`, {
            params: { limit }
        });
        return res.data || [];
    } catch (e) {
        console.error('getPersonalizedRecommendations:', e.message);
        return [];
    }
}