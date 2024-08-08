import Api from ".";

const config: Api.Config = {
    endpoints: {
        liveData: "https://panel.simrail.eu:8084",
        timetable: "https://api1.aws.simrail.eu:8082/api",
    },
    liveData: {
        cache: {
            activeServers:  { enabled: true, retention: 1 },
            activeStations: { enabled: true, retention: 1 },
            activeTrains:   { enabled: true, retention: 1 },
        },
    },
    timetable: {
        cache: {
            enabled: true,
            retention: 1,
            singleRecordOnly: true,
        },
    },
};

const api = new Api(config);

(async function test() {

    const eventSubscription = api.events.subscribe((event) => console.log(`api.events.subscribe()`, event.type));
    
    const servers = await api.getActiveServers();
    const serverA = servers[0];
    console.log(`api.getActiveServers()`, JSON.stringify(serverA));
    const serverB = await api.getActiveServer(serverA.serverCode);
    console.log(`api.getActiveServer(${serverA.serverCode})`, `Server entries match: ${JSON.stringify(serverA) === JSON.stringify(serverB)}`);
    
    const stations = await api.getActiveStations(serverA.serverCode);
    const stationA = stations[0];
    console.log(`api.getActiveStations(${serverA.serverCode})`, JSON.stringify(stationA));
    const stationB = await api.getActiveStation(serverA.serverCode, stationA.prefix);
    console.log(`api.getActiveStation(${serverA.serverCode}, ${stationA.prefix})`, `Station entries match: ${JSON.stringify(stationA) === JSON.stringify(stationB)}`);
    
    const trains = await api.getActiveTrains(serverA.serverCode);
    const trainA = trains[0];
    console.log(`api.getActiveTrains(${serverA.serverCode})`, JSON.stringify(trainA));
    const trainB = await api.getActiveTrain(serverA.serverCode, trainA.trainNoLocal);
    console.log(`api.getActiveTrain(${serverA.serverCode}, ${trainA.trainNoLocal})`, `Train entries match: ${JSON.stringify(trainA) === JSON.stringify(trainB)}`);
    
    const timetables = await api.getTimetable(serverA.serverCode);
    const timetableA = timetables[0];
    console.log(`api.getTimetable(${serverA.serverCode})`, JSON.stringify(timetableA));
    const timetableB = await api.getTimetable(serverA.serverCode, timetableA.trainNoLocal);
    console.log(`api.getTimetable(${serverA.serverCode}, ${timetableA.trainNoLocal})`, `Timetable entries match: ${JSON.stringify(timetableA) === JSON.stringify(timetableB)}`);

    api.autoUpdateServer = "en1";
    api.autoUpdate = true;
    
    setTimeout(() => { eventSubscription.unsubscribe(); api.stopAutoUpdates(); }, 5000);

})();


// api.config;
// api.core;
// api.flushActiveServerCache();
// api.flushActiveStationCache();
// api.flushActiveTrainCache();
// api.flushCache();
// api.flushTimetableCache();
// api.startAutoUpdates("en1");
// api.stopAutoUpdates();
