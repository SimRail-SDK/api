import Api from "../";

const endpoints: Api.Endpoints = {
    liveData: "https://panel.simrail.eu:8084",
    timetable: "https://api1.aws.simrail.eu:8082/api",
};

// Cache configuration can be specified at API class construction.
const api = new Api({
    endpoints,

    /** Specifies a config for requests to the timetable endpoint. */
    timetable: {
        cache: {
            /**
             * Specifies if caching is enabled.
             * @default true
             */
            enabled: true,
            /**
             * Specifies for how long a timetable record is cached in seconds.
             * This value also specifies the update interval for auto updates.
             * @default 1440
             */
            retention: 1440,
            /**
             * Specifies if only one timetable record should be cached.
             *
             * When set to:
             * - `true` only the last timetable record will be cached.
             * - `false` a timetable record will be cached for
             *   each server that was queried for a timetable.
             *   Use this when you are actively querying multiple servers.
             *
             * @default true
             */
            singleRecordOnly: true,
        },
    },

    /** Specifies a config for requests to the live data endpoint. */
    liveData: {
        cache: {
            // Values displayed are the defaults.
            activeServers:  { enabled: true, retention: 30 },
            activeStations: { enabled: true, retention: 30 },
            activeTrains:   { enabled: true, retention: 5  },
        },
    },

});


// Independent of the cache config you can prevent a cached result
//   to be returned by specifying the `noCache` argument.
async () => {
    const serverCode: Api.ServerCode = "de1";
    const noCache: Api.NoCache = true;
    const nonCachedServers        = await api.getActiveServers(noCache);
    const nonCachedServer         = await api.getActiveServer(serverCode, noCache);
    const nonCachedStations       = await api.getActiveStations(serverCode, noCache);
    const nonCachedStation        = await api.getActiveStation(serverCode, "KO", noCache);
    const nonCachedTrains         = await api.getActiveTrains(serverCode, noCache);
    const nonCachedTrain          = await api.getActiveTrain(serverCode, "446004", noCache);
    const nonCachedTimetable      = await api.getTimetable(serverCode, noCache);
    const nonCachedTrainTimetable = await api.getTimetable(serverCode, "446004", noCache);
}


// If you need to, flush cached data.
api.flushCache();
// Or
api.flushActiveServerCache();
api.flushActiveStationCache();
api.flushActiveTrainCache();
api.flushTimetableCache();
