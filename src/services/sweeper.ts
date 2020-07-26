import { ApplicationDAO } from '../dao';

/**
 * Start sweeping, checking for expired applications right away, and then on
 * every set interval
 * @param expiryTTL 
 * @param interval 
 */
const startSweeping = (expiryTTL: number, interval: number) => {
    console.log(`Expiry time is ${expiryTTL / 1000} seconds.`);
    console.log(`Expired applications will be removed every ${interval / 1000} seconds.`);

    // Call it first time for no delay
    sweep(expiryTTL);

    // Trigger on every interval
    setInterval(() => {
        sweep(expiryTTL);
    }, interval)
}

/**
 * Remove applications that exhausted their time to live
 * @param expiryTTL 
 */
const sweep = (expiryTTL: number) => {
    console.log('Cleansing expired applications...');
    const applications = ApplicationDAO.getApplicationsCollection();

    // Example:
    // updatedAt = 100
    // Date.now() = 200
    // TTL = 50
    // 200 - 50 = 150 > 100 => expired
    // TTL = 150
    // 200 - 150 = 50 < 100 => not expired
    applications.removeWhere({
        updatedAt: {
            $lte: Date.now() - expiryTTL
        }
    })
}

export {
    startSweeping
}