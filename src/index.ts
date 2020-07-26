import { app } from './app';
import { hello } from './sweeper';

app.listen(5000, async () => {
    console.log('Listening on port 5000');

})

hello();

