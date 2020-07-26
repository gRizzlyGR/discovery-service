// import dao from './dao';
// import { Constants } from './constants';

// function startSweeping(ttl = Constants.applicationTTLinMilliseconds) {
//     setInterval(() => {
//         const applications = dao.getApplicationsCollection();
        
//         applications.removeWhere({
//             Date.now >= updatedAt + ttl
//         })

        

//     }, Constants.sweepingScheduleTimeInMilliseconds)


// }

export function hello() {
    setInterval(() => {
        console.log('Hello there!')
    }, 10000)
}