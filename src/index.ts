import { app } from './app';
import { Constants } from './constants';
import sweeper from './sweeper';
import { parseNumber } from './utils';

const port = parseNumber(process.env.DISCOVERY_PORT, Constants.discoveryPort)
const expiryTTL = parseNumber(process.env.EXPIRY_TTL, Constants.applicationTTLinMilliseconds);
const interval = parseNumber(process.env.SWEEP_INTERVAL, Constants.sweepingIntervalTimeInMilliseconds);

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
})

sweeper.startSweeping(expiryTTL, interval);