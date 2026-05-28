import axios from 'axios';

const adminApi = axios.create({

    baseURL:
        process.env
        .REACT_APP_API_BASE_URL
        ||
        'http://localhost:5001'

});

// Tự gắn token admin
adminApi.interceptors.request.use(
(config)=>{

    const token =
    localStorage
    .getItem("token");

    if(token){

        config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
});

export default adminApi;