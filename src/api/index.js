export const baseUrl = 'https://direct-messages-api.herokuapp.com';
export const socketUrl = 'wss://direct-messages-api.herokuapp.com/websocket';

export const get = async (endpoint, params) => {
    //Query search paramters string
    let queryString = '';

    //Construct query string from paramters object
    if (params) {
        let queryArray = [];
        let queryEntries = Object.entries(params);
        for (const [key, value] of queryEntries) value && queryArray.push(`${key}=${value}`);
        if (queryArray.length > 0) queryString = `?${queryArray.join('&')}`;
    }

    return fetch(`${baseUrl}${endpoint}${queryString}`)
            .then(res => res.json())
            .then(data => data)
            .catch(() => null)
}