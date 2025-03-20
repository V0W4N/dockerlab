async function retryRequest(fn, retries = 5, delay = 2000) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying request... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryRequest(fn, retries - 1, delay);
        }
        throw error;
    }
}

module.exports = retryRequest; 