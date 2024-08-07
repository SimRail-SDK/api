# SimRail SDK - API

This module contains a simple SDK for interacting with the SimRail APIs.

This API module builds another layer on top of a Core API module by providing:
- Methods to request single resources. (A single server, station or train)
- Automatic pulling of remote data updates.
- Update event subcriptions.
- Caching of remote API responses.

This module requires the use of a Core API module to be able to extend it. By default
this module will use `@simrail-sdk/api-core-node`. To provide another Core API module
or a custom one, check out the example [providing a (custom) Core API class][providing-a-custom-core-api-class] below.

<br/>
<br/>


## Content index

- [Usage details][usage-details]

    - [Installation][installation]

    - [Examples][examples]

        - [Simple API usage][simple-api-usage]

        - [Automatic updates][automatic-updates]

        - [Handling events][handling-events]

        - [Working with result caching][working-with-result-caching]

        - [Providing a (custom) Core API class][providing-a-custom-core-api-class]

- [API reference][api-reference]

- [About this module][about-this-module]

    - [Module dependencies][module-dependencies]

        - [Module package dependencies][module-package-dependencies]

        - [Internal module dependencies][internal-module-dependencies]

    - [Module code statistics][module-code-statistics]
<br/>
<br/>


## [Usage details][usage-details]

[usage-details]: #usage-details "View Usage details"

### [Installation][installation]

[installation]: #installation "View Installation"

Using NPM:

`$ npm i @simrail-sdk/api`

or

`$ npm i github:simrail-sdk/api#VERSION`

Where `VERSION` specifies the version to install.
<br/>
<br/>


### [Examples][examples]

[examples]: #examples "View Examples"

#### [Simple API usage][simple-api-usage]

[simple-api-usage]: #simple-api-usage "View Simple API usage"

```TypeScript
import Api from "@simrail-sdk/api";

const api = new Api({
    endpoints: {
        liveData: "https://panel.simrail.eu:8084",
        timetable: "https://api1.aws.simrail.eu:8082/api",
    },
});
const serverCode: Api.ServerCode = "en1";

api.getActiveServers().then(...);
api.getActiveServer(serverCode).then(...);
// {
//     id: "638fec40d089346098624eb5",
//     isActive: true,
//     serverCode: "en1",
//     serverName: "EN1 (English)",
//     serverRegion: "Europe",
// },

api.getActiveStations(serverCode).then(...);
api.getActiveStation(serverCode, "KO").then(...);
// {
//     additionalImage1URL: "https://api.simrail.eu:8083/Thumbnails/Stations/ko2.jpg",
//     additionalImage2URL: "https://api.simrail.eu:8083/Thumbnails/Stations/ko3.jpg",
//     difficultyLevel: 5,
//     dispatchedBy: [],
//     id: "644133f3858f72cc3d476e42",
//     latitude: 50.25686264038086,
//     longitude: 19.01921844482422,
//     mainImageURL: "https://api.simrail.eu:8083/Thumbnails/Stations/ko1m.jpg",
//     name: "Katowice",
//     prefix: "KO"
// },

api.getActiveTrains(serverCode).then(...);
api.getActiveTrain(serverCode, "446004").then(...);
// {
//     endStation: "Częstochowa",
//     id: "662f96b3766d379b4f3f525f",
//     runId: "73c0f0ea-20d9-4317-8339-8bc7d098bd35",
//     serverCode: "en1",
//     startStation: "Jaworzno Szczakowa",
//     trainData: {
//     inBorderStationArea: true,
//     latitude: 50.262142181396484,
//     longitude: 19.269641876220703,
//     vdDelayedTimetableIndex: 1,
//     velocity: 40,
//     distanceToSignalInFront: 386.6281433105469,
//     signalInFront: "SMA_G@7129,82510,8",
//     signalInFrontSpeed: 40
//     },
//     trainName: "PWJ",
//     trainNoLocal: "446004",
//     type: "bot",
//     vehicles: [ "EN57/EN57-1003", "EN57/EN57-614", "EN57/EN57-1755" ]
// },

api.getTimetable(serverCode).then(...);
api.getTimetable(serverCode, "446004").then(...);
// {
//     endStation: "Częstochowa",
//     endsAt: "03:53:00",
//     locoType: "EN57 (5B+6B+5B)",
//     runId: "73c0f0ea-20d9-4317-8339-8bc7d098bd35",
//     startStation: "Jaworzno Szczakowa",
//     startsAt: "02:15:00",
//     timetable: [
//       {
//         departureTime: "2024-08-05 02:15:00",
//         displayedTrainNumber: "446004",
//         line: 133,
//         maxSpeed: 100,
//         kilometrage: 15.81,
//         nameForPerson: "Jaworzno Szczakowa",
//         nameOfPoint: "Jaworzno Szczakowa",
//         pointId: "1472",
//         stopType: "NoStopOver",
//         trainType: "PWJ",
//         supervisedBy: "Jaworzno Szczakowa"
//       },
//       ...
//     ],
//     trainLength: 60,
//     trainName: "PWJ",
//     trainNoLocal: "446004",
//     trainWeight: 60
// }

```
<br/>
<br/>


#### [Automatic updates][automatic-updates]

[automatic-updates]: #automatic-updates "View Automatic updates"

```TypeScript
import Api from "@simrail-sdk/api";

const api = new Api(...);
const serverCode: Api.ServerCode = "en1";

// Start auto updates using data from "en1".
api.startAutoUpdates(serverCode);

// Stop auto updates.
api.stopAutoUpdates();

// Restart auto updates.
api.startAutoUpdates();

// Or, do the same thing using accessors
api.autoUpdateServer = serverCode;
api.autoUpdate = true;
const updatesEnabled = api.autoUpdate;

```
<br/>
<br/>


#### [Handling events][handling-events]

[handling-events]: #handling-events "View Handling events"

```TypeScript
import Api from "@simrail-sdk/api";

const api = new Api(...);

// Subscribe to API events.
const eventSubscription = api.events.subscribe((event) => {
    switch (event.type) {
        case Api.Event.Type.ActiveServersUpdated:  event.activeServers[0].id;       break;
        case Api.Event.Type.ActiveStationsUpdated: event.activeStations[0].code;    break;
        case Api.Event.Type.ActiveTrainsUpdated:   event.activeTrains[0].id;        break;
        case Api.Event.Type.AutoUpdateChanged:     event.autoUpdate === true;       break;
        case Api.Event.Type.TimetableUpdated:      event.timetable[0].trainNoLocal; break;
    }
});

// Unsubscribe from events.
eventSubscription.unsubscribe();

```
<br/>
<br/>


#### [Working with result caching][working-with-result-caching]

[working-with-result-caching]: #working-with-result-caching "View Working with result caching"

```TypeScript
import Api from "@simrail-sdk/api";

// Cache configuration can be specified at API class construction.
const api = new Api({

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

    ...

});


// Independent of the cache config you can prevent a cached result
//   to be returned by specifying the `noCache` argument.
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


// If you need to, flush cached data.
api.flushCache();
// Or
api.flushActiveServerCache();
api.flushActiveStationCache();
api.flushActiveTrainCache();
api.flushTimetableCache();

```
<br/>
<br/>


#### [Providing a (custom) Core API class][providing-a-custom-core-api-class]

[providing-a-custom-core-api-class]: #providing-a-custom-core-api-class "View Providing a (custom) Core API class"

```TypeScript
import Api from "@simrail-sdk/api";
import Core from "different-api-core";

// By default the API will use the Core API class from package `@simrail-sdk/api-core-node`.
// To provide another Core API class or a custom one, just include the instance in the API config.
const core = new Core({ endpoints });
const api = new Api({ core });

```
<br/>
<br/>


## [API reference][api-reference]

[api-reference]: #api-reference "View API reference"

<span style="color: #ff3300;">**NOTE**</span>: The API reference section doesn't account for `namespace`s, this unfortunately means the documentation below is not entirely complete. Please investigate the TypeScript definition files for the full API.


- [`class Api`][api-reference-index.ts~Api]

    - [`new Api.constructor(config)`][api-reference-index.ts~Api.constructor0]

    - [`property Api.autoUpdateServer`][api-reference-index.ts~Api.autoUpdateServer]

    - [`property Api.config`][api-reference-index.ts~Api.config]

    - [`property Api.core`][api-reference-index.ts~Api.core]

    - [`property Api.events`][api-reference-index.ts~Api.events]

    - [`property Api.autoUpdate`][api-reference-index.ts~Api.autoUpdate]

    - [`method Api.flushActiveServerCache()`][api-reference-index.ts~Api.flushActiveServerCache0]

    - [`method Api.flushActiveStationCache()`][api-reference-index.ts~Api.flushActiveStationCache0]

    - [`method Api.flushActiveTrainCache()`][api-reference-index.ts~Api.flushActiveTrainCache0]

    - [`method Api.flushCache()`][api-reference-index.ts~Api.flushCache0]

    - [`method Api.flushTimetableCache()`][api-reference-index.ts~Api.flushTimetableCache0]

    - [`method Api.getActiveServer(serverCode, noCache)`][api-reference-index.ts~Api.getActiveServer0]

    - [`method Api.getActiveServers(noCache)`][api-reference-index.ts~Api.getActiveServers0]

    - [`method Api.getActiveStation(serverCode, stationCode, noCache)`][api-reference-index.ts~Api.getActiveStation0]

    - [`method Api.getActiveStations(serverCode, noCache)`][api-reference-index.ts~Api.getActiveStations0]

    - [`method Api.getActiveTrain(serverCode, trainNoLocal, noCache)`][api-reference-index.ts~Api.getActiveTrain0]

    - [`method Api.getActiveTrains(serverCode, noCache)`][api-reference-index.ts~Api.getActiveTrains0]

    - [`method Api.getTimetable(serverCode, noCache)`][api-reference-index.ts~Api.getTimetable0]

    - [`method Api.getTimetable(serverCode, trainNoLocal, noCache)`][api-reference-index.ts~Api.getTimetable1]

    - [`method Api.getTimetable(serverCode, trainNoOrNoCache, noCache)`][api-reference-index.ts~Api.getTimetable2]

    - [`method Api.startAutoUpdates(autoUpdateServer)`][api-reference-index.ts~Api.startAutoUpdates0]

    - [`method Api.stopAutoUpdates()`][api-reference-index.ts~Api.stopAutoUpdates0]

- [`const DEFAULT_ACTIVE_SERVER_RETENTION`][api-reference-index.ts~DEFAULT_ACTIVE_SERVER_RETENTION]

- [`const DEFAULT_ACTIVE_STATION_RETENTION`][api-reference-index.ts~DEFAULT_ACTIVE_STATION_RETENTION]

- [`const DEFAULT_ACTIVE_TRAIN_RETENTION`][api-reference-index.ts~DEFAULT_ACTIVE_TRAIN_RETENTION]

- [`const DEFAULT_TIMETABLE_RETENTION`][api-reference-index.ts~DEFAULT_TIMETABLE_RETENTION]

- [`const VERSION`][api-reference-index.ts~VERSION]

- [`const VMAX`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VMAX]

- [`const VMAX_VALUE`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VMAX_VALUE]

- [`enum Type`][api-reference-index.ts~Type]

    - [`member Type.ActiveServersUpdated`][api-reference-index.ts~Type.ActiveServersUpdated]

    - [`member Type.ActiveStationsUpdated`][api-reference-index.ts~Type.ActiveStationsUpdated]

    - [`member Type.ActiveTrainsUpdated`][api-reference-index.ts~Type.ActiveTrainsUpdated]

    - [`member Type.AutoUpdateChanged`][api-reference-index.ts~Type.AutoUpdateChanged]

    - [`member Type.TimetableUpdated`][api-reference-index.ts~Type.TimetableUpdated]

- [`interface ActiveServer`][api-reference-index.ts~ActiveServer]

- [`interface ActiveServers`][api-reference-index.ts~ActiveServers]

    - [`property ActiveServers.map`][api-reference-index.ts~ActiveServers.map]

    - [`property ActiveServers.timestamp`][api-reference-index.ts~ActiveServers.timestamp]

- [`interface ActiveServersUpdated`][api-reference-index.ts~ActiveServersUpdated]

    - [`property ActiveServersUpdated.activeServers`][api-reference-index.ts~ActiveServersUpdated.activeServers]

- [`interface ActiveStation`][api-reference-index.ts~ActiveStation]

    - [`property ActiveStation.code`][api-reference-index.ts~ActiveStation.code]

- [`interface ActiveStationsUpdated`][api-reference-index.ts~ActiveStationsUpdated]

    - [`property ActiveStationsUpdated.activeStations`][api-reference-index.ts~ActiveStationsUpdated.activeStations]

- [`interface ActiveTrain`][api-reference-index.ts~ActiveTrain]

- [`interface ActiveTrainsUpdated`][api-reference-index.ts~ActiveTrainsUpdated]

    - [`property ActiveTrainsUpdated.activeTrains`][api-reference-index.ts~ActiveTrainsUpdated.activeTrains]

- [`interface AutoUpdateChanged`][api-reference-index.ts~AutoUpdateChanged]

    - [`property AutoUpdateChanged.autoUpdate`][api-reference-index.ts~AutoUpdateChanged.autoUpdate]

- [`interface Base`][api-reference-index.ts~Base]

    - [`property Base.api`][api-reference-index.ts~Base.api]

    - [`property Base.type`][api-reference-index.ts~Base.type]

- [`interface Cache`][api-reference-index.ts~Cache]

    - [`property Cache.activeServers`][api-reference-index.ts~Cache.activeServers]

    - [`property Cache.activeStations`][api-reference-index.ts~Cache.activeStations]

    - [`property Cache.activeTrains`][api-reference-index.ts~Cache.activeTrains]

    - [`property Cache.timetables`][api-reference-index.ts~Cache.timetables]

- [`interface Config`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Config]

    - [`property Config.endpoints`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Config.endpoints]

- [`interface Data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data]

    - [`property Data.continuesAs`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.continuesAs]

    - [`property Data.endStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.endStation]

    - [`property Data.endsAt`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.endsAt]

    - [`property Data.locoType`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.locoType]

    - [`property Data.runId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.runId]

    - [`property Data.startStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.startStation]

    - [`property Data.startsAt`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.startsAt]

    - [`property Data.timetable`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.timetable]

    - [`property Data.trainLength`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainLength]

    - [`property Data.trainName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainName]

    - [`property Data.trainNoInternational`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainNoInternational]

    - [`property Data.trainNoLocal`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainNoLocal]

    - [`property Data.trainWeight`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainWeight]

- [`interface Disabled`][api-reference-index.ts~Disabled]

- [`interface DispatchedBy`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy]

    - [`property DispatchedBy.ServerCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy.ServerCode]

    - [`property DispatchedBy.SteamId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy.SteamId]

- [`interface Enabled`][api-reference-index.ts~Enabled]

    - [`property Enabled.retention`][api-reference-index.ts~Enabled.retention]

    - [`property Enabled.singleRecordOnly`][api-reference-index.ts~Enabled.singleRecordOnly]

- [`interface Endpoints`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints]

    - [`property Endpoints.liveData`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints.liveData]

    - [`property Endpoints.timetable`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints.timetable]

- [`interface Error`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Error]

- [`interface LiveData`][api-reference-index.ts~LiveData]

    - [`property LiveData.cache`][api-reference-index.ts~LiveData.cache]

- [`interface Regular`][api-reference-index.ts~Regular]

- [`interface Server`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server]

    - [`property Server.id`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.id]

    - [`property Server.isActive`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.isActive]

    - [`property Server.serverCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverCode]

    - [`property Server.serverName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverName]

    - [`property Server.serverRegion`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverRegion]

- [`interface Station`][api-reference-index.ts~Station]

    - [`property Station.code`][api-reference-index.ts~Station.code]

- [`interface Stations`][api-reference-index.ts~Stations]

    - [`property Stations.map`][api-reference-index.ts~Stations.map]

    - [`property Stations.timestamp`][api-reference-index.ts~Stations.timestamp]

- [`interface Successful`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful]

    - [`property Successful.count`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.count]

    - [`property Successful.data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.data]

    - [`property Successful.description`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.description]

- [`interface Timetable`][api-reference-index.ts~Timetable]

    - [`property Timetable.map`][api-reference-index.ts~Timetable.map]

    - [`property Timetable.timestamp`][api-reference-index.ts~Timetable.timestamp]

- [`interface TimetableUpdated`][api-reference-index.ts~TimetableUpdated]

    - [`property TimetableUpdated.timetable`][api-reference-index.ts~TimetableUpdated.timetable]

- [`interface Train`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train]

    - [`property Train.endStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.endStation]

    - [`property Train.id`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.id]

    - [`property Train.runId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.runId]

    - [`property Train.serverCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.serverCode]

    - [`property Train.startStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.startStation]

    - [`property Train.trainData`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainData]

    - [`property Train.trainName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainName]

    - [`property Train.trainNoLocal`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainNoLocal]

    - [`property Train.type`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.type]

    - [`property Train.vehicles`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.vehicles]

- [`interface TrainData`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData]

    - [`property TrainData.controlledBySteamId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.controlledBySteamId]

    - [`property TrainData.distanceToSignalInFront`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.distanceToSignalInFront]

    - [`property TrainData.inBorderStationArea`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.inBorderStationArea]

    - [`property TrainData.latitude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.latitude]

    - [`property TrainData.longitude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.longitude]

    - [`property TrainData.signalInFront`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.signalInFront]

    - [`property TrainData.signalInFrontSpeed`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.signalInFrontSpeed]

    - [`property TrainData.vdDelayedTimetableIndex`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.vdDelayedTimetableIndex]

    - [`property TrainData.velocity`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.velocity]

- [`interface Trains`][api-reference-index.ts~Trains]

    - [`property Trains.map`][api-reference-index.ts~Trains.map]

    - [`property Trains.timestamp`][api-reference-index.ts~Trains.timestamp]

- [`interface WithCore`][api-reference-index.ts~WithCore]

    - [`property WithCore.core`][api-reference-index.ts~WithCore.core]

- [`type ActiveServers`][api-reference-index.ts~ActiveServers]

- [`type ActiveStations`][api-reference-index.ts~ActiveStations]

- [`type ActiveTrains`][api-reference-index.ts~ActiveTrains]

- [`type ApiResponse`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ApiResponse]

- [`type ArrivalTime`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ArrivalTime]

- [`type AutoUpdate`][api-reference-index.ts~AutoUpdate]

- [`type AutoUpdateServer`][api-reference-index.ts~AutoUpdateServer]

- [`type Cache`][api-reference-index.ts~Cache]

- [`type Code`][api-reference-index.ts~Code]

- [`type Config`][api-reference-index.ts~Config]

- [`type ContinuesAs`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ContinuesAs]

- [`type ControlledBySteamId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ControlledBySteamId]

- [`type Count`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Count]

- [`type DepartureTime`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~DepartureTime]

- [`type Description`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Description]

- [`type DifficultyLevel`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DifficultyLevel]

- [`type DisplayedTrainNumber`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~DisplayedTrainNumber]

- [`type DistanceToSignalInFront`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DistanceToSignalInFront]

- [`type Emitter`][api-reference-index.ts~Emitter]

- [`type EndsAt`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~EndsAt]

- [`type EndStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~EndStation]

- [`type Event`][api-reference-index.ts~Event]

- [`type Id`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Id]

- [`type ImageUrl`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ImageUrl]

- [`type InBorderStationArea`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~InBorderStationArea]

- [`type IsActive`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~IsActive]

- [`type Kilometrage`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Kilometrage]

- [`type Latititude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latititude]

- [`type Latititute`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latititute]

- [`type Latitude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latitude]

- [`type Line`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Line]

- [`type List`][api-reference-index.ts~List]

- [`type LocoType`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~LocoType]

- [`type Longitude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Longitude]

- [`type Longitute`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Longitute]

- [`type Map`][api-reference-index.ts~Map]

- [`type MaxSpeed`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~MaxSpeed]

- [`type Mileage`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Mileage]

- [`type Name`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Name]

- [`type NameForPerson`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~NameForPerson]

- [`type NameOfPoint`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~NameOfPoint]

- [`type NoCache`][api-reference-index.ts~NoCache]

- [`type Platform`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Platform]

- [`type PointId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~PointId]

- [`type Prefix`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Prefix]

- [`type RadioChannel`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RadioChannel]

- [`type RadioChannels`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RadioChannels]

- [`type Result`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Result]

- [`type Retention`][api-reference-index.ts~Retention]

- [`type RunId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RunId]

- [`type ServerCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ServerCode]

- [`type ServerName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerName]

- [`type ServerRegion`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerRegion]

- [`type SignalInFront`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SignalInFront]

- [`type SignalInFrontSpeed`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SignalInFrontSpeed]

- [`type SingleRecordOnly`][api-reference-index.ts~SingleRecordOnly]

- [`type StartsAt`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StartsAt]

- [`type StartStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StartStation]

- [`type StationCategory`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StationCategory]

- [`type SteamId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SteamId]

- [`type StopType`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StopType]

- [`type SupervisedBy`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~SupervisedBy]

- [`type Timestamp`][api-reference-index.ts~Timestamp]

- [`type Timetables`][api-reference-index.ts~Timetables]

- [`type Track`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Track]

- [`type TrainLength`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainLength]

- [`type TrainName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainName]

- [`type TrainNoInternational`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainNoInternational]

- [`type TrainNoLocal`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainNoLocal]

- [`type TrainType`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainType]

- [`type TrainWeight`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainWeight]

- [`type Type`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Type]

- [`type Url`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Url]

- [`type VdDelayedTimetableIndex`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VdDelayedTimetableIndex]

- [`type Vehicle`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Vehicle]

- [`type Vehicles`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Vehicles]

- [`type Velocity`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Velocity]

- [`type Version`][api-reference-index.ts~Version]

<br/>
<br/>
<br/>

[api-reference-@simrail-sdk/api]: @simrail-sdk/api "View module \"@simrail-sdk/api\""
[api-reference-index]: index "View module \"index\""
[api-reference-index.d.ts]: index.d.ts "View module \"index.d.ts\""
[api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts]: node_modules/@simrail-sdk/api-core-node/index.d.ts "View module \"node_modules/@simrail-sdk/api-core-node/index.d.ts\""
[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]: node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts "View module \"node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts\""
[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]: node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts "View module \"node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts\""
[api-reference-index.ts]: index.ts "View module \"index.ts\""

### [`class Api`][api-reference-index.ts~Api]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api]: #class-api&nbsp;&nbsp;&nbsp;&uarr; "View class Api"

Specifies an API class instance for interacting with SimRail's remote API.

**Implements**:&nbsp;&nbsp;<abbr title='Declared in package "typescript"'>`Omit`</abbr>&#60;`Api.Core`, `"config"`&#62;

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:29][api-reference-index.ts]

<br/>
<br/>

#### [`new Api.constructor(config)`][api-reference-index.ts~Api.constructor0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.constructor0]: #new-apiconstructorconfig&nbsp;&nbsp;&nbsp;&uarr; "View new Api.constructor()"

| Arguments: | *Type* |
| ---------- | ------ |
| `config` | <code><u>[`Config`][api-reference-index.ts~Config]</u></code> |

**Returns**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:94][api-reference-index.ts]

<br/>

<br/>

#### [`property Api.autoUpdateServer`][api-reference-index.ts~Api.autoUpdateServer]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.autoUpdateServer]: #property-apiautoupdateserver&nbsp;&nbsp;&nbsp;&uarr; "View property Api.autoUpdateServer"

<kbd>optional</kbd>

Specifies the unique code of the server to automatically retrieve data from.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:47][api-reference-index.ts]

<br/>

<br/>

#### [`property Api.config`][api-reference-index.ts~Api.config]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.config]: #property-apiconfig&nbsp;&nbsp;&nbsp;&uarr; "View property Api.config"

<kbd>read-only</kbd>

Specifies the configuration of the API.

**Type**:&nbsp;&nbsp;<code><u>[`Config`][api-reference-index.ts~Config]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:35][api-reference-index.ts]

<br/>

<br/>

#### [`property Api.core`][api-reference-index.ts~Api.core]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.core]: #property-apicore&nbsp;&nbsp;&nbsp;&uarr; "View property Api.core"

<kbd>read-only</kbd>

Specifies a reference to the Core API.

**Type**:&nbsp;&nbsp;<code>`Api.Core`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:32][api-reference-index.ts]

<br/>

<br/>

#### [`property Api.events`][api-reference-index.ts~Api.events]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.events]: #property-apievents&nbsp;&nbsp;&nbsp;&uarr; "View property Api.events"

<kbd>read-only</kbd>

Specifies the event emitter for API events.

**Type**:&nbsp;&nbsp;<code><u>[`Emitter`][api-reference-index.ts~Emitter]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:38][api-reference-index.ts]

<br/>

<br/>

#### [`property Api.autoUpdate`][api-reference-index.ts~Api.autoUpdate]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.autoUpdate]: #property-apiautoupdate&nbsp;&nbsp;&nbsp;&uarr; "View property Api.autoUpdate"

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:73][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.flushActiveServerCache()`][api-reference-index.ts~Api.flushActiveServerCache0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.flushActiveServerCache0]: #method-apiflushactiveservercache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.flushActiveServerCache()"

Method to flush all cached active server records.

**Returns**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>&nbsp;&nbsp;- This API instance.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:109][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.flushActiveStationCache()`][api-reference-index.ts~Api.flushActiveStationCache0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.flushActiveStationCache0]: #method-apiflushactivestationcache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.flushActiveStationCache()"

Method to flush all cached active station records.

**Returns**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>&nbsp;&nbsp;- This API instance.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:119][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.flushActiveTrainCache()`][api-reference-index.ts~Api.flushActiveTrainCache0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.flushActiveTrainCache0]: #method-apiflushactivetraincache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.flushActiveTrainCache()"

Method to flush all cached active train records.

**Returns**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>&nbsp;&nbsp;- This API instance.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:129][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.flushCache()`][api-reference-index.ts~Api.flushCache0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.flushCache0]: #method-apiflushcache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.flushCache()"

Method to flush all cached records.

**Returns**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>&nbsp;&nbsp;- This API instance.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:139][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.flushTimetableCache()`][api-reference-index.ts~Api.flushTimetableCache0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.flushTimetableCache0]: #method-apiflushtimetablecache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.flushTimetableCache()"

Method to flush all cached timetable records.

**Returns**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>&nbsp;&nbsp;- This API instance.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:152][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getActiveServer(serverCode, noCache)`][api-reference-index.ts~Api.getActiveServer0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getActiveServer0]: #method-apigetactiveserverservercode-nocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getActiveServer()"

Method to retrieve an active server from the live data endpoint.

| Arguments: | *Type* | *Optional* | *Default* | *Description* |
| ---------- | ------ | ---------- | --------- | ------------- |
| `serverCode` | <code>`string`</code> | No | N/A | The unique code of the server. |
| `noCache` | <code>`boolean`</code> | Yes | <code>false</code> | Prevent returning a cached result. |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;<u>[`Server`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server]</u>&#62;</code>&nbsp;&nbsp;- The multiplayer server.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:164][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getActiveServers(noCache)`][api-reference-index.ts~Api.getActiveServers0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getActiveServers0]: #method-apigetactiveserversnocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getActiveServers()"

Method to retrieve active servers from the live data endpoint.

| Arguments: | *Type* | *Optional* | *Default* | *Description* |
| ---------- | ------ | ---------- | --------- | ------------- |
| `noCache` | <code>`boolean`</code> | Yes | <code>false</code> | Prevent returning a cached result. |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;[`Server`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server][]&#62;</code>&nbsp;&nbsp;- A list of multiplayer servers.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:178][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getActiveStation(serverCode, stationCode, noCache)`][api-reference-index.ts~Api.getActiveStation0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getActiveStation0]: #method-apigetactivestationservercode-stationcode-nocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getActiveStation()"

Method to retrieve an active dispatch station from the live data endpoint.

The value for `stationCode` can be either:
- The `prefix` of the station.
- The `code` which is the `prefix` but stripped from diacritics.
  Example: **prefix** `ŁA` equals **code** `LA`.

| Arguments: | *Type* | *Optional* | *Default* | *Description* |
| ---------- | ------ | ---------- | --------- | ------------- |
| `serverCode` | <code>`string`</code> | No | N/A | The code of the related server. |
| `stationCode` | <code>`string`</code> | No | N/A | The unique code of the dispatch station. |
| `noCache` | <code>`boolean`</code> | Yes | <code>false</code> | Prevent returning a cached result. |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;<u>[`Station`][api-reference-index.ts~Station]</u>&#62;</code>&nbsp;&nbsp;- The active dispatch station.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:210][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getActiveStations(serverCode, noCache)`][api-reference-index.ts~Api.getActiveStations0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getActiveStations0]: #method-apigetactivestationsservercode-nocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getActiveStations()"

Method to retrieve active dispatch stations from the live data endpoint.

| Arguments: | *Type* | *Optional* | *Default* | *Description* |
| ---------- | ------ | ---------- | --------- | ------------- |
| `serverCode` | <code>`string`</code> | No | N/A | The unique code of the multiplayer server. |
| `noCache` | <code>`boolean`</code> | Yes | <code>false</code> | Prevent returning a cached result. |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;<u>[`Station`][api-reference-index.ts~Station][]</u>&#62;</code>&nbsp;&nbsp;- A list of active dispatch stations.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:225][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getActiveTrain(serverCode, trainNoLocal, noCache)`][api-reference-index.ts~Api.getActiveTrain0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getActiveTrain0]: #method-apigetactivetrainservercode-trainnolocal-nocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getActiveTrain()"

Method to retrieve an active train from the live data endpoint.

| Arguments: | *Type* | *Optional* | *Default* | *Description* |
| ---------- | ------ | ---------- | --------- | ------------- |
| `serverCode` | <code>`string`</code> | No | N/A | The code of the related server. |
| `trainNoLocal` | <code>`string`</code> | No | N/A | The national number of the train. |
| `noCache` | <code>`boolean`</code> | Yes | <code>false</code> | Prevent returning a cached result. |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;<u>[`Train`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train]</u>&#62;</code>&nbsp;&nbsp;- The active dispatch train.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:257][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getActiveTrains(serverCode, noCache)`][api-reference-index.ts~Api.getActiveTrains0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getActiveTrains0]: #method-apigetactivetrainsservercode-nocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getActiveTrains()"

Method to retrieve active trains from the live data endpoint.

| Arguments: | *Type* | *Optional* | *Default* | *Description* |
| ---------- | ------ | ---------- | --------- | ------------- |
| `serverCode` | <code>`string`</code> | No | N/A | The unique code of the multiplayer server. |
| `noCache` | <code>`boolean`</code> | Yes | <code>false</code> | Prevent returning a cached result. |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;<u>[`Train`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train][]</u>&#62;</code>&nbsp;&nbsp;- A list of active trains.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:272][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getTimetable(serverCode, noCache)`][api-reference-index.ts~Api.getTimetable0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getTimetable0]: #method-apigettimetableservercode-nocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getTimetable()"

Method to retrieve timetable data from the timetable endpoint.

| Arguments: | *Type* | *Optional* | *Description* |
| ---------- | ------ | ---------- | ------------- |
| `serverCode` | <code>`string`</code> | No | The unique code of the multiplayer server. |
| `noCache` | <code>`boolean`</code> | Yes | |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;<u>[`Data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data][]</u>&#62;</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:297][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getTimetable(serverCode, trainNoLocal, noCache)`][api-reference-index.ts~Api.getTimetable1]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getTimetable1]: #method-apigettimetableservercode-trainnolocal-nocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getTimetable()"

| Arguments: | *Type* | *Optional* |
| ---------- | ------ | ---------- |
| `serverCode` | <code>`string`</code> | No |
| `trainNoLocal` | <code>`string`</code> | No |
| `noCache` | <code>`boolean`</code> | Yes |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;<u>[`Data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data]</u>&#62;</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:297][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.getTimetable(serverCode, trainNoOrNoCache, noCache)`][api-reference-index.ts~Api.getTimetable2]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.getTimetable2]: #method-apigettimetableservercode-trainnoornocache-nocache&nbsp;&nbsp;&nbsp;&uarr; "View method Api.getTimetable()"

| Arguments: | *Type* | *Optional* |
| ---------- | ------ | ---------- |
| `serverCode` | <code>`string`</code> | No |
| `trainNoOrNoCache` | <code>`string`</code> | Yes |
| `noCache` | <code>`boolean`</code> | Yes |

**Returns**:&nbsp;&nbsp;<code><abbr title='Declared in package "typescript"'>`Promise`</abbr>&#60;<u>[`Data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data]</u> &#124; <u>[`Data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data][]</u>&#62;</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:297][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.startAutoUpdates(autoUpdateServer)`][api-reference-index.ts~Api.startAutoUpdates0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.startAutoUpdates0]: #method-apistartautoupdatesautoupdateserver&nbsp;&nbsp;&nbsp;&uarr; "View method Api.startAutoUpdates()"

Method to start auto updating cached data.

This will update cached data and enable events. The update interval
  is determined by checking the cache retention value.

**NOTE**: Auto update only works for records which have caching enabled.

| Arguments: | *Type* | *Optional* |
| ---------- | ------ | ---------- |
| `autoUpdateServer` | <code>`string`</code> | Yes |

**Returns**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>&nbsp;&nbsp;- This `Api` instance.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:337][api-reference-index.ts]

<br/>

<br/>

#### [`method Api.stopAutoUpdates()`][api-reference-index.ts~Api.stopAutoUpdates0]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Api.stopAutoUpdates0]: #method-apistopautoupdates&nbsp;&nbsp;&nbsp;&uarr; "View method Api.stopAutoUpdates()"

Method to stop auto updating cached data.

**Returns**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>&nbsp;&nbsp;- This `Api` instance.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:381][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`const DEFAULT_ACTIVE_SERVER_RETENTION`][api-reference-index.ts~DEFAULT_ACTIVE_SERVER_RETENTION]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~DEFAULT_ACTIVE_SERVER_RETENTION]: #const-default_active_server_retention&nbsp;&nbsp;&nbsp;&uarr; "View const DEFAULT_ACTIVE_SERVER_RETENTION"

Specifies the default retention for active server records.

**Type**:&nbsp;&nbsp;<code><u>[`Config.LiveData.Cache.ActiveServers.Retention`][api-reference-index.ts~Retention]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:441][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`const DEFAULT_ACTIVE_STATION_RETENTION`][api-reference-index.ts~DEFAULT_ACTIVE_STATION_RETENTION]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~DEFAULT_ACTIVE_STATION_RETENTION]: #const-default_active_station_retention&nbsp;&nbsp;&nbsp;&uarr; "View const DEFAULT_ACTIVE_STATION_RETENTION"

Specifies the default retention for active station records.

**Type**:&nbsp;&nbsp;<code><u>[`Config.LiveData.Cache.ActiveStations.Retention`][api-reference-index.ts~Retention]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:443][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`const DEFAULT_ACTIVE_TRAIN_RETENTION`][api-reference-index.ts~DEFAULT_ACTIVE_TRAIN_RETENTION]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~DEFAULT_ACTIVE_TRAIN_RETENTION]: #const-default_active_train_retention&nbsp;&nbsp;&nbsp;&uarr; "View const DEFAULT_ACTIVE_TRAIN_RETENTION"

Specifies the default retention for active train records.

**Type**:&nbsp;&nbsp;<code><u>[`Config.LiveData.Cache.ActiveTrains.Retention`][api-reference-index.ts~Retention]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:445][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`const DEFAULT_TIMETABLE_RETENTION`][api-reference-index.ts~DEFAULT_TIMETABLE_RETENTION]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~DEFAULT_TIMETABLE_RETENTION]: #const-default_timetable_retention&nbsp;&nbsp;&nbsp;&uarr; "View const DEFAULT_TIMETABLE_RETENTION"

Specifies the default retention for timetable records.

**Type**:&nbsp;&nbsp;<code><u>[`Config.Timetable.Cache.Retention`][api-reference-index.ts~Retention]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:447][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`const VERSION`][api-reference-index.ts~VERSION]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~VERSION]: #const-version&nbsp;&nbsp;&nbsp;&uarr; "View const VERSION"

Specifies the version of the API.

**Type**:&nbsp;&nbsp;<code><u>[`Version`][api-reference-index.ts~Version]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:432][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`const VMAX`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VMAX]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VMAX]: #const-vmax&nbsp;&nbsp;&nbsp;&uarr; "View const VMAX"

Specifies the maximum allowable operating speed. (**Vmax**)

**Type**:&nbsp;&nbsp;<code>`"vmax"`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:15][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`const VMAX_VALUE`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VMAX_VALUE]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VMAX_VALUE]: #const-vmax_value&nbsp;&nbsp;&nbsp;&uarr; "View const VMAX_VALUE"

Specifies the "speed" value that will indicate `"vmax"`.

**Type**:&nbsp;&nbsp;<code>`32767`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:18][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`enum Type`][api-reference-index.ts~Type]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Type]: #enum-type&nbsp;&nbsp;&nbsp;&uarr; "View enum Type"

Specifies a type of API event.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:700][api-reference-index.ts]

<br/>
<br/>

#### [`member Type.ActiveServersUpdated`][api-reference-index.ts~Type.ActiveServersUpdated]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Type.ActiveServersUpdated]: #member-typeactiveserversupdated&nbsp;&nbsp;&nbsp;&uarr; "View member Type.ActiveServersUpdated"

Specifies an event that fires when cached active servers updated.

**Type**:&nbsp;&nbsp;<code>`"activeServersUpdated"`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:704][api-reference-index.ts]

<br/>

<br/>

#### [`member Type.ActiveStationsUpdated`][api-reference-index.ts~Type.ActiveStationsUpdated]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Type.ActiveStationsUpdated]: #member-typeactivestationsupdated&nbsp;&nbsp;&nbsp;&uarr; "View member Type.ActiveStationsUpdated"

Specifies an event that fires when cached active dispatch stations updated.

**Type**:&nbsp;&nbsp;<code>`"activeStationsUpdated"`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:706][api-reference-index.ts]

<br/>

<br/>

#### [`member Type.ActiveTrainsUpdated`][api-reference-index.ts~Type.ActiveTrainsUpdated]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Type.ActiveTrainsUpdated]: #member-typeactivetrainsupdated&nbsp;&nbsp;&nbsp;&uarr; "View member Type.ActiveTrainsUpdated"

Specifies an event that fires when cached active trains updated.

**Type**:&nbsp;&nbsp;<code>`"activeTrainsUpdated"`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:708][api-reference-index.ts]

<br/>

<br/>

#### [`member Type.AutoUpdateChanged`][api-reference-index.ts~Type.AutoUpdateChanged]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Type.AutoUpdateChanged]: #member-typeautoupdatechanged&nbsp;&nbsp;&nbsp;&uarr; "View member Type.AutoUpdateChanged"

Specifies an event that fires when the value of `Api.autoUpdate` changes.

**Type**:&nbsp;&nbsp;<code>`"autoUpdateChanged"`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:702][api-reference-index.ts]

<br/>

<br/>

#### [`member Type.TimetableUpdated`][api-reference-index.ts~Type.TimetableUpdated]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Type.TimetableUpdated]: #member-typetimetableupdated&nbsp;&nbsp;&nbsp;&uarr; "View member Type.TimetableUpdated"

Specifies an event that fires when cached timetable data updated.

**Type**:&nbsp;&nbsp;<code>`"timetableUpdated"`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:710][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface ActiveServer`][api-reference-index.ts~ActiveServer]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveServer]: #interface-activeserver&nbsp;&nbsp;&nbsp;&uarr; "View interface ActiveServer"

**Extends**:&nbsp;&nbsp;<u>[`Server`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server]</u>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:623][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`interface ActiveServers`][api-reference-index.ts~ActiveServers]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveServers]: #interface-activeservers&nbsp;&nbsp;&nbsp;&uarr; "View interface ActiveServers"

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:625][api-reference-index.ts]

<br/>
<br/>

#### [`property ActiveServers.map`][api-reference-index.ts~ActiveServers.map]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveServers.map]: #property-activeserversmap&nbsp;&nbsp;&nbsp;&uarr; "View property ActiveServers.map"

**Type**:&nbsp;&nbsp;<code><u>[`Map`][api-reference-index.ts~Map]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:626][api-reference-index.ts]

<br/>

<br/>

#### [`property ActiveServers.timestamp`][api-reference-index.ts~ActiveServers.timestamp]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveServers.timestamp]: #property-activeserverstimestamp&nbsp;&nbsp;&nbsp;&uarr; "View property ActiveServers.timestamp"

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:627][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface ActiveServersUpdated`][api-reference-index.ts~ActiveServersUpdated]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveServersUpdated]: #interface-activeserversupdated&nbsp;&nbsp;&nbsp;&uarr; "View interface ActiveServersUpdated"

Specifies an event that fires when cached active servers updated.

**Extends**:&nbsp;&nbsp;<u>[`Base`][api-reference-index.ts~Base]</u>&#60;<u>[`Type.ActiveServersUpdated`][api-reference-index.ts~ActiveServersUpdated]</u>&#62;

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:729][api-reference-index.ts]

<br/>
<br/>

#### [`property ActiveServersUpdated.activeServers`][api-reference-index.ts~ActiveServersUpdated.activeServers]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveServersUpdated.activeServers]: #property-activeserversupdatedactiveservers&nbsp;&nbsp;&nbsp;&uarr; "View property ActiveServersUpdated.activeServers"

**Type**:&nbsp;&nbsp;<code><u>[`Server`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server][]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:730][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface ActiveStation`][api-reference-index.ts~ActiveStation]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveStation]: #interface-activestation&nbsp;&nbsp;&nbsp;&uarr; "View interface ActiveStation"

**Extends**:&nbsp;&nbsp;<u>[`Station`][api-reference-index.ts~Station]</u>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:635][api-reference-index.ts]

<br/>
<br/>

#### [`property ActiveStation.code`][api-reference-index.ts~ActiveStation.code]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveStation.code]: #property-activestationcode&nbsp;&nbsp;&nbsp;&uarr; "View property ActiveStation.code"

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:636][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface ActiveStationsUpdated`][api-reference-index.ts~ActiveStationsUpdated]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveStationsUpdated]: #interface-activestationsupdated&nbsp;&nbsp;&nbsp;&uarr; "View interface ActiveStationsUpdated"

Specifies an event that fires when cached active dispatch stations updated.

**Extends**:&nbsp;&nbsp;<u>[`Base`][api-reference-index.ts~Base]</u>&#60;<u>[`Type.ActiveStationsUpdated`][api-reference-index.ts~ActiveStationsUpdated]</u>&#62;

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:734][api-reference-index.ts]

<br/>
<br/>

#### [`property ActiveStationsUpdated.activeStations`][api-reference-index.ts~ActiveStationsUpdated.activeStations]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveStationsUpdated.activeStations]: #property-activestationsupdatedactivestations&nbsp;&nbsp;&nbsp;&uarr; "View property ActiveStationsUpdated.activeStations"

**Type**:&nbsp;&nbsp;<code><u>[`List`][api-reference-index.ts~List]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:735][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface ActiveTrain`][api-reference-index.ts~ActiveTrain]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveTrain]: #interface-activetrain&nbsp;&nbsp;&nbsp;&uarr; "View interface ActiveTrain"

**Extends**:&nbsp;&nbsp;<u>[`Train`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train]</u>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:654][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`interface ActiveTrainsUpdated`][api-reference-index.ts~ActiveTrainsUpdated]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveTrainsUpdated]: #interface-activetrainsupdated&nbsp;&nbsp;&nbsp;&uarr; "View interface ActiveTrainsUpdated"

Specifies an event that fires when cached active trains updated.

**Extends**:&nbsp;&nbsp;<u>[`Base`][api-reference-index.ts~Base]</u>&#60;<u>[`Type.ActiveTrainsUpdated`][api-reference-index.ts~ActiveTrainsUpdated]</u>&#62;

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:739][api-reference-index.ts]

<br/>
<br/>

#### [`property ActiveTrainsUpdated.activeTrains`][api-reference-index.ts~ActiveTrainsUpdated.activeTrains]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveTrainsUpdated.activeTrains]: #property-activetrainsupdatedactivetrains&nbsp;&nbsp;&nbsp;&uarr; "View property ActiveTrainsUpdated.activeTrains"

**Type**:&nbsp;&nbsp;<code><u>[`Train`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train][]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:740][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface AutoUpdateChanged`][api-reference-index.ts~AutoUpdateChanged]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~AutoUpdateChanged]: #interface-autoupdatechanged&nbsp;&nbsp;&nbsp;&uarr; "View interface AutoUpdateChanged"

Specifies an event that fires when the value of `Api.autoUpdate` changes.

**Extends**:&nbsp;&nbsp;<u>[`Base`][api-reference-index.ts~Base]</u>&#60;<u>[`Type.AutoUpdateChanged`][api-reference-index.ts~AutoUpdateChanged]</u>&#62;

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:724][api-reference-index.ts]

<br/>
<br/>

#### [`property AutoUpdateChanged.autoUpdate`][api-reference-index.ts~AutoUpdateChanged.autoUpdate]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~AutoUpdateChanged.autoUpdate]: #property-autoupdatechangedautoupdate&nbsp;&nbsp;&nbsp;&uarr; "View property AutoUpdateChanged.autoUpdate"

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:725][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface Base`][api-reference-index.ts~Base]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Base]: #interface-base&nbsp;&nbsp;&nbsp;&uarr; "View interface Base"

| Type params: | *Extends* |
| ------------ | --------- |
| `EventType` | <code><u>[`Type`][api-reference-index.ts~Type]</u></code> |

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:713][api-reference-index.ts]

**Extended by**
- <u>[`AutoUpdateChanged`][api-reference-index.ts~AutoUpdateChanged]</u>
- <u>[`ActiveServersUpdated`][api-reference-index.ts~ActiveServersUpdated]</u>
- <u>[`ActiveStationsUpdated`][api-reference-index.ts~ActiveStationsUpdated]</u>
- <u>[`ActiveTrainsUpdated`][api-reference-index.ts~ActiveTrainsUpdated]</u>
- <u>[`TimetableUpdated`][api-reference-index.ts~TimetableUpdated]</u>

<br/>
<br/>

#### [`property Base.api`][api-reference-index.ts~Base.api]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Base.api]: #property-baseapi&nbsp;&nbsp;&nbsp;&uarr; "View property Base.api"

Specifies a reference to the related `Api` instance.

**Type**:&nbsp;&nbsp;<code><u>[`Api`][api-reference-index.ts~Api]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:715][api-reference-index.ts]

<br/>

<br/>

#### [`property Base.type`][api-reference-index.ts~Base.type]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Base.type]: #property-basetype&nbsp;&nbsp;&nbsp;&uarr; "View property Base.type"

Specifies the type of API event.

**Type**:&nbsp;&nbsp;<code>`EventType`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:717][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface Cache`][api-reference-index.ts~Cache]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Cache]: #interface-cache&nbsp;&nbsp;&nbsp;&uarr; "View interface Cache"

Specifies the internal cache of an API class instance.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:615][api-reference-index.ts]

<br/>
<br/>

#### [`property Cache.activeServers`][api-reference-index.ts~Cache.activeServers]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Cache.activeServers]: #property-cacheactiveservers&nbsp;&nbsp;&nbsp;&uarr; "View property Cache.activeServers"

<kbd>optional</kbd>

**Type**:&nbsp;&nbsp;<code><u>[`ActiveServers`][api-reference-index.ts~ActiveServers]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:616][api-reference-index.ts]

<br/>

<br/>

#### [`property Cache.activeStations`][api-reference-index.ts~Cache.activeStations]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Cache.activeStations]: #property-cacheactivestations&nbsp;&nbsp;&nbsp;&uarr; "View property Cache.activeStations"

**Type**:&nbsp;&nbsp;<code><u>[`ActiveStations`][api-reference-index.ts~ActiveStations]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:617][api-reference-index.ts]

<br/>

<br/>

#### [`property Cache.activeTrains`][api-reference-index.ts~Cache.activeTrains]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Cache.activeTrains]: #property-cacheactivetrains&nbsp;&nbsp;&nbsp;&uarr; "View property Cache.activeTrains"

**Type**:&nbsp;&nbsp;<code><u>[`ActiveTrains`][api-reference-index.ts~ActiveTrains]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:618][api-reference-index.ts]

<br/>

<br/>

#### [`property Cache.timetables`][api-reference-index.ts~Cache.timetables]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Cache.timetables]: #property-cachetimetables&nbsp;&nbsp;&nbsp;&uarr; "View property Cache.timetables"

**Type**:&nbsp;&nbsp;<code><u>[`Timetables`][api-reference-index.ts~Timetables]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:619][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface Config`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Config]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Config]: #interface-config&nbsp;&nbsp;&nbsp;&uarr; "View interface Config"

Specifies the configuration of the API.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/index.d.ts:96][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts]

<br/>

<br/>

#### [`property Config.endpoints`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Config.endpoints]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Config.endpoints]: #property-configendpoints&nbsp;&nbsp;&nbsp;&uarr; "View property Config.endpoints"

<kbd>read-only</kbd>

Specifies the configuration for API endpoints.

**Type**:&nbsp;&nbsp;<code><u>[`Endpoints`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/index.d.ts:104][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts]

<br/>

<br/>

<br/>

### [`interface Data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data]: #interface-data&nbsp;&nbsp;&nbsp;&uarr; "View interface Data"

Specifies information about a train in a timetable.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:15][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

#### [`property Data.continuesAs`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.continuesAs]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.continuesAs]: #property-datacontinuesas&nbsp;&nbsp;&nbsp;&uarr; "View property Data.continuesAs"

<kbd>optional</kbd>

Specifies under which train number the train will continue.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:17][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.endStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.endStation]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.endStation]: #property-dataendstation&nbsp;&nbsp;&nbsp;&uarr; "View property Data.endStation"

Specifies the name of the destination station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:19][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.endsAt`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.endsAt]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.endsAt]: #property-dataendsat&nbsp;&nbsp;&nbsp;&uarr; "View property Data.endsAt"

Specifies when the train arrives at it's destination. Format: `hh:mm:ss`

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:21][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.locoType`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.locoType]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.locoType]: #property-datalocotype&nbsp;&nbsp;&nbsp;&uarr; "View property Data.locoType"

Specifies the name of the train's locomotive.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:23][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.runId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.runId]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.runId]: #property-datarunid&nbsp;&nbsp;&nbsp;&uarr; "View property Data.runId"

Specifies the unique ID of the train. (independent from the train number)

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:25][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.startStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.startStation]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.startStation]: #property-datastartstation&nbsp;&nbsp;&nbsp;&uarr; "View property Data.startStation"

Specifies the name of the origin station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:27][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.startsAt`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.startsAt]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.startsAt]: #property-datastartsat&nbsp;&nbsp;&nbsp;&uarr; "View property Data.startsAt"

Specifies when the train departs from it's origin. Format: `hh:mm:ss`

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:29][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.timetable`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.timetable]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.timetable]: #property-datatimetable&nbsp;&nbsp;&nbsp;&uarr; "View property Data.timetable"

Specifies a list of timetable entries for this train.

**Type**:&nbsp;&nbsp;<code>`Api.Timetable.Timetable`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:31][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.trainLength`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainLength]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainLength]: #property-datatrainlength&nbsp;&nbsp;&nbsp;&uarr; "View property Data.trainLength"

Specifies the length of the train in meters.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:33][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.trainName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainName]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainName]: #property-datatrainname&nbsp;&nbsp;&nbsp;&uarr; "View property Data.trainName"

Specifies the name of the train or train series.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:35][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.trainNoInternational`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainNoInternational]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainNoInternational]: #property-datatrainnointernational&nbsp;&nbsp;&nbsp;&uarr; "View property Data.trainNoInternational"

<kbd>optional</kbd>

Specifies the international train number of this train.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:37][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.trainNoLocal`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainNoLocal]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainNoLocal]: #property-datatrainnolocal&nbsp;&nbsp;&nbsp;&uarr; "View property Data.trainNoLocal"

Specifies the national train number of this train.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:39][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

#### [`property Data.trainWeight`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainWeight]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data.trainWeight]: #property-datatrainweight&nbsp;&nbsp;&nbsp;&uarr; "View property Data.trainWeight"

Specifies the weight of this train in metric tonnes.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:41][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>

<br/>

<br/>

### [`interface Disabled`][api-reference-index.ts~Disabled]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Disabled]: #interface-disabled&nbsp;&nbsp;&nbsp;&uarr; "View interface Disabled"

Specifies a configuration for caching timetable data.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:601][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`interface DispatchedBy`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy]: #interface-dispatchedby&nbsp;&nbsp;&nbsp;&uarr; "View interface DispatchedBy"

Specifies a player dispatching at a station in the raw API format.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:196][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

#### [`property DispatchedBy.ServerCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy.ServerCode]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy.ServerCode]: #property-dispatchedbyservercode&nbsp;&nbsp;&nbsp;&uarr; "View property DispatchedBy.ServerCode"

Specifies the unique code of the server the player is using in the raw API format.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:198][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property DispatchedBy.SteamId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy.SteamId]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DispatchedBy.SteamId]: #property-dispatchedbysteamid&nbsp;&nbsp;&nbsp;&uarr; "View property DispatchedBy.SteamId"

Specifies the Steam ID of the player in the raw API format.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:200][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

<br/>

### [`interface Enabled`][api-reference-index.ts~Enabled]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Enabled]: #interface-enabled&nbsp;&nbsp;&nbsp;&uarr; "View interface Enabled"

Specifies a configuration for caching timetable data.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:577][api-reference-index.ts]

<br/>
<br/>

#### [`property Enabled.retention`][api-reference-index.ts~Enabled.retention]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Enabled.retention]: #property-enabledretention&nbsp;&nbsp;&nbsp;&uarr; "View property Enabled.retention"

<kbd>read-only</kbd> <kbd>optional</kbd>

Specifies for how long a timetable record should be cached in seconds.

Defaults to 24 hours.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:585][api-reference-index.ts]

<br/>

<br/>

#### [`property Enabled.singleRecordOnly`][api-reference-index.ts~Enabled.singleRecordOnly]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Enabled.singleRecordOnly]: #property-enabledsinglerecordonly&nbsp;&nbsp;&nbsp;&uarr; "View property Enabled.singleRecordOnly"

<kbd>read-only</kbd> <kbd>optional</kbd>

Specifies if only one timetable record should be cached.

When set to:
- `true` only the last timetable record will be cached.
- `false` a timetable record will be cached for
  each server that was queried for a timetable.
  Use this when you are actively querying multiple servers.

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:597][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface Endpoints`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints]: #interface-endpoints&nbsp;&nbsp;&nbsp;&uarr; "View interface Endpoints"

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/index.d.ts:110][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts]

<br/>
<br/>

#### [`property Endpoints.liveData`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints.liveData]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints.liveData]: #property-endpointslivedata&nbsp;&nbsp;&nbsp;&uarr; "View property Endpoints.liveData"

<kbd>read-only</kbd>

Specifies the URL for the live data API endpoint.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/index.d.ts:112][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts]

<br/>

<br/>

#### [`property Endpoints.timetable`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints.timetable]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Endpoints.timetable]: #property-endpointstimetable&nbsp;&nbsp;&nbsp;&uarr; "View property Endpoints.timetable"

<kbd>read-only</kbd>

Specifies the URL for the timetable API endpoint.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/index.d.ts:114][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts]

<br/>

<br/>

<br/>

### [`interface Error`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Error]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Error]: #interface-error&nbsp;&nbsp;&nbsp;&uarr; "View interface Error"

Specifies a response for a failed request.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:39][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`interface LiveData`][api-reference-index.ts~LiveData]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~LiveData]: #interface-livedata&nbsp;&nbsp;&nbsp;&uarr; "View interface LiveData"

Specifies a configuration for live data queries.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:476][api-reference-index.ts]

<br/>
<br/>

#### [`property LiveData.cache`][api-reference-index.ts~LiveData.cache]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~LiveData.cache]: #property-livedatacache&nbsp;&nbsp;&nbsp;&uarr; "View property LiveData.cache"

<kbd>read-only</kbd> <kbd>optional</kbd>

Specifies a configuration for caching live data data.

**Type**:&nbsp;&nbsp;<code><u>[`Cache`][api-reference-index.ts~Cache]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:478][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface Regular`][api-reference-index.ts~Regular]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Regular]: #interface-regular&nbsp;&nbsp;&nbsp;&uarr; "View interface Regular"

Specifies a configuration of the API.

**Extends**
- `Core`
- <abbr title='Declared in package "typescript"'>`Omit`</abbr>&#60;<u>[`Core.Config`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Config]</u>&#60;`true`&#62; &#124; `"convertData"`&#62;

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:473][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`interface Server`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server]: #interface-server&nbsp;&nbsp;&nbsp;&uarr; "View interface Server"

Specifies a multiplayer server.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:64][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

**Extended by**:&nbsp;&nbsp;<u>[`ActiveServer`][api-reference-index.ts~ActiveServer]</u>

<br/>
<br/>

#### [`property Server.id`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.id]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.id]: #property-serverid&nbsp;&nbsp;&nbsp;&uarr; "View property Server.id"

Specifies the unique ID of the server. (independent of `code`)

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:66][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Server.isActive`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.isActive]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.isActive]: #property-serverisactive&nbsp;&nbsp;&nbsp;&uarr; "View property Server.isActive"

Specifies if the server is active.

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:68][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Server.serverCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverCode]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverCode]: #property-serverservercode&nbsp;&nbsp;&nbsp;&uarr; "View property Server.serverCode"

Specifies the unique code of the server.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:70][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Server.serverName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverName]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverName]: #property-serverservername&nbsp;&nbsp;&nbsp;&uarr; "View property Server.serverName"

Specifies the name of the server.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:72][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Server.serverRegion`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverRegion]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Server.serverRegion]: #property-serverserverregion&nbsp;&nbsp;&nbsp;&uarr; "View property Server.serverRegion"

Specifies in which region the server is located.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:74][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

<br/>

### [`interface Station`][api-reference-index.ts~Station]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Station]: #interface-station&nbsp;&nbsp;&nbsp;&uarr; "View interface Station"

Specifies an active dispatch station.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:758][api-reference-index.ts]

**Extended by**:&nbsp;&nbsp;<u>[`ActiveStation`][api-reference-index.ts~ActiveStation]</u>

<br/>
<br/>

#### [`property Station.code`][api-reference-index.ts~Station.code]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Station.code]: #property-stationcode&nbsp;&nbsp;&nbsp;&uarr; "View property Station.code"

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:759][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface Stations`][api-reference-index.ts~Stations]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Stations]: #interface-stations&nbsp;&nbsp;&nbsp;&uarr; "View interface Stations"

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:643][api-reference-index.ts]

<br/>
<br/>

#### [`property Stations.map`][api-reference-index.ts~Stations.map]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Stations.map]: #property-stationsmap&nbsp;&nbsp;&nbsp;&uarr; "View property Stations.map"

**Type**:&nbsp;&nbsp;<code><u>[`Map`][api-reference-index.ts~Map]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:644][api-reference-index.ts]

<br/>

<br/>

#### [`property Stations.timestamp`][api-reference-index.ts~Stations.timestamp]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Stations.timestamp]: #property-stationstimestamp&nbsp;&nbsp;&nbsp;&uarr; "View property Stations.timestamp"

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:645][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface Successful`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful]: #interface-successful&nbsp;&nbsp;&nbsp;&uarr; "View interface Successful"

Specfies a response for a successful request.

| Type params: | *Description* |
| ------------ | ------------- |
| `ResponseData` | The requested data. |

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:47][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

#### [`property Successful.count`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.count]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.count]: #property-successfulcount&nbsp;&nbsp;&nbsp;&uarr; "View property Successful.count"

Specifies the number of results.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:49][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Successful.data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.data]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.data]: #property-successfuldata&nbsp;&nbsp;&nbsp;&uarr; "View property Successful.data"

Specifies the requested data.

**Type**:&nbsp;&nbsp;<code>`ResponseData`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:51][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Successful.description`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.description]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful.description]: #property-successfuldescription&nbsp;&nbsp;&nbsp;&uarr; "View property Successful.description"

Specifies a description for the response.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:53][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

<br/>

### [`interface Timetable`][api-reference-index.ts~Timetable]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Timetable]: #interface-timetable&nbsp;&nbsp;&nbsp;&uarr; "View interface Timetable"

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:675][api-reference-index.ts]

<br/>
<br/>

#### [`property Timetable.map`][api-reference-index.ts~Timetable.map]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Timetable.map]: #property-timetablemap&nbsp;&nbsp;&nbsp;&uarr; "View property Timetable.map"

**Type**:&nbsp;&nbsp;<code><u>[`Map`][api-reference-index.ts~Map]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:676][api-reference-index.ts]

<br/>

<br/>

#### [`property Timetable.timestamp`][api-reference-index.ts~Timetable.timestamp]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Timetable.timestamp]: #property-timetabletimestamp&nbsp;&nbsp;&nbsp;&uarr; "View property Timetable.timestamp"

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:677][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface TimetableUpdated`][api-reference-index.ts~TimetableUpdated]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~TimetableUpdated]: #interface-timetableupdated&nbsp;&nbsp;&nbsp;&uarr; "View interface TimetableUpdated"

Specifies an event that fires when cached timetable data updated.

**Extends**:&nbsp;&nbsp;<u>[`Base`][api-reference-index.ts~Base]</u>&#60;<u>[`Type.TimetableUpdated`][api-reference-index.ts~TimetableUpdated]</u>&#62;

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:744][api-reference-index.ts]

<br/>
<br/>

#### [`property TimetableUpdated.timetable`][api-reference-index.ts~TimetableUpdated.timetable]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~TimetableUpdated.timetable]: #property-timetableupdatedtimetable&nbsp;&nbsp;&nbsp;&uarr; "View property TimetableUpdated.timetable"

**Type**:&nbsp;&nbsp;<code><u>[`Data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data][]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:745][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface Train`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train]: #interface-train&nbsp;&nbsp;&nbsp;&uarr; "View interface Train"

Specifies an active train.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:220][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

**Extended by**:&nbsp;&nbsp;<u>[`ActiveTrain`][api-reference-index.ts~ActiveTrain]</u>

<br/>
<br/>

#### [`property Train.endStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.endStation]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.endStation]: #property-trainendstation&nbsp;&nbsp;&nbsp;&uarr; "View property Train.endStation"

Specifies the name of the destination station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:222][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.id`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.id]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.id]: #property-trainid&nbsp;&nbsp;&nbsp;&uarr; "View property Train.id"

Specifies the unique ID of the train. (independent from `runId`)

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:224][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.runId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.runId]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.runId]: #property-trainrunid&nbsp;&nbsp;&nbsp;&uarr; "View property Train.runId"

Specifies the unique ID of this train on the timetable server. (independent from `id`)

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:226][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.serverCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.serverCode]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.serverCode]: #property-trainservercode&nbsp;&nbsp;&nbsp;&uarr; "View property Train.serverCode"

Specifies the unique code of the server the train is running on.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:228][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.startStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.startStation]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.startStation]: #property-trainstartstation&nbsp;&nbsp;&nbsp;&uarr; "View property Train.startStation"

Specifies the name of the origin station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:230][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.trainData`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainData]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainData]: #property-traintraindata&nbsp;&nbsp;&nbsp;&uarr; "View property Train.trainData"

Specifies live data about the train.

**Type**:&nbsp;&nbsp;<code><u>[`TrainData`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:232][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.trainName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainName]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainName]: #property-traintrainname&nbsp;&nbsp;&nbsp;&uarr; "View property Train.trainName"

Specifies the name of the train.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:234][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.trainNoLocal`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainNoLocal]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.trainNoLocal]: #property-traintrainnolocal&nbsp;&nbsp;&nbsp;&uarr; "View property Train.trainNoLocal"

Specifies the national train number of this train.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:236][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.type`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.type]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.type]: #property-traintype&nbsp;&nbsp;&nbsp;&uarr; "View property Train.type"

Specifies if this train is operated by a `"bot"` or a `"user"`.

**Type**:&nbsp;&nbsp;<code><u>[`Type`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Type]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:238][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property Train.vehicles`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.vehicles]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Train.vehicles]: #property-trainvehicles&nbsp;&nbsp;&nbsp;&uarr; "View property Train.vehicles"

Specifies a list of vehicles of this train.

**NOTE**: This data hasn't be deciphered yet, if you know what this data
  describes please **open a new issue** in the project repository.

**Type**:&nbsp;&nbsp;<code><u>[`Vehicles`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Vehicles]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:245][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

<br/>

### [`interface TrainData`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData]: #interface-traindata&nbsp;&nbsp;&nbsp;&uarr; "View interface TrainData"

Specifies live data about a train.

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:281][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

#### [`property TrainData.controlledBySteamId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.controlledBySteamId]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.controlledBySteamId]: #property-traindatacontrolledbysteamid&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.controlledBySteamId"

<kbd>optional</kbd>

Specifies the Steam ID of the player controlling this train.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:283][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property TrainData.distanceToSignalInFront`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.distanceToSignalInFront]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.distanceToSignalInFront]: #property-traindatadistancetosignalinfront&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.distanceToSignalInFront"

<kbd>optional</kbd>

Specifies the distance to the next signal in meters.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:285][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property TrainData.inBorderStationArea`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.inBorderStationArea]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.inBorderStationArea]: #property-traindatainborderstationarea&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.inBorderStationArea"

Specifies if the train is in the border area of the map. (unplayable area)

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:287][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property TrainData.latitude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.latitude]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.latitude]: #property-traindatalatitude&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.latitude"

Specifies the current global latitude of the train.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:289][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property TrainData.longitude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.longitude]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.longitude]: #property-traindatalongitude&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.longitude"

Specifies the current global longitude of the train.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:291][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property TrainData.signalInFront`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.signalInFront]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.signalInFront]: #property-traindatasignalinfront&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.signalInFront"

<kbd>optional</kbd>

Specifies data about the next signal.

**NOTE**: This data (except for the ID prefixing the `@` symbol) hasn't be deciphered yet,
  if you know what this data describes please **open a new issue** in the project repository.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:298][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property TrainData.signalInFrontSpeed`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.signalInFrontSpeed]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.signalInFrontSpeed]: #property-traindatasignalinfrontspeed&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.signalInFrontSpeed"

<kbd>optional</kbd>

Specifies the track limit effective at the next signal in km/h.

**Type**:&nbsp;&nbsp;<code><u>[`SignalInFrontSpeed`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SignalInFrontSpeed]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:300][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property TrainData.vdDelayedTimetableIndex`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.vdDelayedTimetableIndex]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.vdDelayedTimetableIndex]: #property-traindatavddelayedtimetableindex&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.vdDelayedTimetableIndex"

Specifies the index of the current entry in this train's timetable.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:302][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

#### [`property TrainData.velocity`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.velocity]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainData.velocity]: #property-traindatavelocity&nbsp;&nbsp;&nbsp;&uarr; "View property TrainData.velocity"

Specifies the current speed of the train.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:304][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>

<br/>

<br/>

### [`interface Trains`][api-reference-index.ts~Trains]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Trains]: #interface-trains&nbsp;&nbsp;&nbsp;&uarr; "View interface Trains"

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:660][api-reference-index.ts]

<br/>
<br/>

#### [`property Trains.map`][api-reference-index.ts~Trains.map]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Trains.map]: #property-trainsmap&nbsp;&nbsp;&nbsp;&uarr; "View property Trains.map"

**Type**:&nbsp;&nbsp;<code><u>[`Map`][api-reference-index.ts~Map]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:661][api-reference-index.ts]

<br/>

<br/>

#### [`property Trains.timestamp`][api-reference-index.ts~Trains.timestamp]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Trains.timestamp]: #property-trainstimestamp&nbsp;&nbsp;&nbsp;&uarr; "View property Trains.timestamp"

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:662][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`interface WithCore`][api-reference-index.ts~WithCore]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~WithCore]: #interface-withcore&nbsp;&nbsp;&nbsp;&uarr; "View interface WithCore"

Specifies a configuration of the API.

**Extends**:&nbsp;&nbsp;`Core`

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:467][api-reference-index.ts]

<br/>
<br/>

#### [`property WithCore.core`][api-reference-index.ts~WithCore.core]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~WithCore.core]: #property-withcorecore&nbsp;&nbsp;&nbsp;&uarr; "View property WithCore.core"

<kbd>read-only</kbd>

Specifies a Core API class instance.

**Type**:&nbsp;&nbsp;<code>`Core`&#60;`true`&#62;</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:469][api-reference-index.ts]

<br/>

<br/>

<br/>

### [`type ActiveServers`][api-reference-index.ts~ActiveServers]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveServers]: #type-activeservers&nbsp;&nbsp;&nbsp;&uarr; "View type ActiveServers"

Specifies a configuration for caching active servers.

**Type**:&nbsp;&nbsp;<code><u>[`ActiveServers.Disabled`][api-reference-index.ts~Disabled]</u> &#124; <u>[`ActiveServers.Enabled`][api-reference-index.ts~Enabled]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:504][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type ActiveStations`][api-reference-index.ts~ActiveStations]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveStations]: #type-activestations&nbsp;&nbsp;&nbsp;&uarr; "View type ActiveStations"

**Type**:&nbsp;&nbsp;<code>{ [serverCode in <u>[`LiveData.Server.ServerCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerCode]</u>]: <u>[`ActiveStations.Stations`][api-reference-index.ts~Stations]</u> }</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:639][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type ActiveTrains`][api-reference-index.ts~ActiveTrains]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~ActiveTrains]: #type-activetrains&nbsp;&nbsp;&nbsp;&uarr; "View type ActiveTrains"

**Type**:&nbsp;&nbsp;<code>{ [serverCode in <u>[`LiveData.Server.ServerCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerCode]</u>]: <u>[`ActiveTrains.Trains`][api-reference-index.ts~Trains]</u> }</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:656][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type ApiResponse`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ApiResponse]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ApiResponse]: #type-apiresponse&nbsp;&nbsp;&nbsp;&uarr; "View type ApiResponse"

Specifies a response returned by the remote API.

| Type params: | *Description* |
| ------------ | ------------- |
| `ResponseData` | The requested data. |

**Type**:&nbsp;&nbsp;<code><u>[`ApiResponse.Error`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Error]</u> &#124; <u>[`ApiResponse.Successful`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Successful]</u>&#60;`ResponseData`&#62;</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:28][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type ArrivalTime`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ArrivalTime]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ArrivalTime]: #type-arrivaltime&nbsp;&nbsp;&nbsp;&uarr; "View type ArrivalTime"

Specifies when the train arrives at a point.

**Type**:&nbsp;&nbsp;<code><u>[`Timetable.ArrivalTime`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ArrivalTime]</u> &#124; `null`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:208][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type AutoUpdate`][api-reference-index.ts~AutoUpdate]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~AutoUpdate]: #type-autoupdate&nbsp;&nbsp;&nbsp;&uarr; "View type AutoUpdate"

Specifies if cached data is automatically updated.

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:450][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type AutoUpdateServer`][api-reference-index.ts~AutoUpdateServer]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~AutoUpdateServer]: #type-autoupdateserver&nbsp;&nbsp;&nbsp;&uarr; "View type AutoUpdateServer"

Specifies the unique code of a server to automatically retrieve data from.

**Type**:&nbsp;&nbsp;<code><u>[`LiveData.Server.ServerCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerCode]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:453][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type Cache`][api-reference-index.ts~Cache]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Cache]: #type-cache&nbsp;&nbsp;&nbsp;&uarr; "View type Cache"

Specifies a configuration for caching timetable data.

**Type**:&nbsp;&nbsp;<code><u>[`Cache.Disabled`][api-reference-index.ts~Disabled]</u> &#124; <u>[`Cache.Enabled`][api-reference-index.ts~Enabled]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:564][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type Code`][api-reference-index.ts~Code]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Code]: #type-code&nbsp;&nbsp;&nbsp;&uarr; "View type Code"

Specifies the unique code of the dispatch station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:772][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type Config`][api-reference-index.ts~Config]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Config]: #type-config&nbsp;&nbsp;&nbsp;&uarr; "View type Config"

Specifies a configuration of the API.

**Type**:&nbsp;&nbsp;<code><u>[`Config.Regular`][api-reference-index.ts~Regular]</u> &#124; <u>[`Config.WithCore`][api-reference-index.ts~WithCore]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:456][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type ContinuesAs`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ContinuesAs]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ContinuesAs]: #type-continuesas&nbsp;&nbsp;&nbsp;&uarr; "View type ContinuesAs"

Specifies under which train number a train will continue.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:49][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type ControlledBySteamId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ControlledBySteamId]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ControlledBySteamId]: #type-controlledbysteamid&nbsp;&nbsp;&nbsp;&uarr; "View type ControlledBySteamId"

Specifies the Steam ID of the player controlling a train in the raw API format.

**Type**:&nbsp;&nbsp;<code>`string` &#124; `null`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:358][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Count`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Count]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Count]: #type-count&nbsp;&nbsp;&nbsp;&uarr; "View type Count"

Specifies the number of results.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:35][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type DepartureTime`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~DepartureTime]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~DepartureTime]: #type-departuretime&nbsp;&nbsp;&nbsp;&uarr; "View type DepartureTime"

Specifies when a train departs at this point.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:134][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Description`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Description]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Description]: #type-description&nbsp;&nbsp;&nbsp;&uarr; "View type Description"

Specifies a description of a response.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:37][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type DifficultyLevel`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DifficultyLevel]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DifficultyLevel]: #type-difficultylevel&nbsp;&nbsp;&nbsp;&uarr; "View type DifficultyLevel"

Specifies the difficulty level for a station in the raw API format. (from `1` to `5`)

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:194][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type DisplayedTrainNumber`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~DisplayedTrainNumber]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~DisplayedTrainNumber]: #type-displayedtrainnumber&nbsp;&nbsp;&nbsp;&uarr; "View type DisplayedTrainNumber"

Specifies which train number is displayed for a train.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:136][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type DistanceToSignalInFront`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DistanceToSignalInFront]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~DistanceToSignalInFront]: #type-distancetosignalinfront&nbsp;&nbsp;&nbsp;&uarr; "View type DistanceToSignalInFront"

Specifies the distance to the next signal in meters and in the raw API format.

**Type**:&nbsp;&nbsp;<code>`number` &#124; `null`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:371][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Emitter`][api-reference-index.ts~Emitter]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Emitter]: #type-emitter&nbsp;&nbsp;&nbsp;&uarr; "View type Emitter"

Specifies an API event emitter.

**Type**:&nbsp;&nbsp;<code><abbr title='Declared in package "rxjs"'>`RXJS.Observable`</abbr>&#60;<u>[`Event`][api-reference-index.ts~Event]</u>&#62;</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:721][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type EndsAt`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~EndsAt]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~EndsAt]: #type-endsat&nbsp;&nbsp;&nbsp;&uarr; "View type EndsAt"

Specifies when a train arrives at it's destination. Format: `hh:mm:ss`

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:53][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type EndStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~EndStation]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~EndStation]: #type-endstation&nbsp;&nbsp;&nbsp;&uarr; "View type EndStation"

Specifies the name of a destination station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:51][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Event`][api-reference-index.ts~Event]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Event]: #type-event&nbsp;&nbsp;&nbsp;&uarr; "View type Event"

Specifies an API event.

**Type**:&nbsp;&nbsp;<code><u>[`Event.AutoUpdateChanged`][api-reference-index.ts~AutoUpdateChanged]</u> &#124; <u>[`Event.ActiveServersUpdated`][api-reference-index.ts~ActiveServersUpdated]</u> &#124; <u>[`Event.ActiveStationsUpdated`][api-reference-index.ts~ActiveStationsUpdated]</u> &#124; <u>[`Event.ActiveTrainsUpdated`][api-reference-index.ts~ActiveTrainsUpdated]</u> &#124; <u>[`Event.TimetableUpdated`][api-reference-index.ts~TimetableUpdated]</u></code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:691][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type Id`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Id]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Id]: #type-id&nbsp;&nbsp;&nbsp;&uarr; "View type Id"

Specifies the unique ID of a train. (independent from `Train.RunId`)

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:251][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type ImageUrl`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ImageUrl]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ImageUrl]: #type-imageurl&nbsp;&nbsp;&nbsp;&uarr; "View type ImageUrl"

Specifies the URL of an image.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:158][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type InBorderStationArea`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~InBorderStationArea]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~InBorderStationArea]: #type-inborderstationarea&nbsp;&nbsp;&nbsp;&uarr; "View type InBorderStationArea"

Specifies if a train is in the border area of the map. (unplayable area)

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:312][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type IsActive`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~IsActive]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~IsActive]: #type-isactive&nbsp;&nbsp;&nbsp;&uarr; "View type IsActive"

Specifies if a server is active.

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:80][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Kilometrage`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Kilometrage]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Kilometrage]: #type-kilometrage&nbsp;&nbsp;&nbsp;&uarr; "View type Kilometrage"

Specifies at what distance a point will be passed.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:144][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Latititude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latititude]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latititude]: #type-latititude&nbsp;&nbsp;&nbsp;&uarr; "View type Latititude"

Specifies the global latitude of a station in the raw API format.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:207][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Latititute`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latititute]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latititute]: #type-latititute&nbsp;&nbsp;&nbsp;&uarr; "View type Latititute"

Specifies the current global latitude of a train in the raw API format.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:360][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Latitude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latitude]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Latitude]: #type-latitude&nbsp;&nbsp;&nbsp;&uarr; "View type Latitude"

Specifies the current global latitude of a train.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:314][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Line`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Line]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Line]: #type-line&nbsp;&nbsp;&nbsp;&uarr; "View type Line"

Specifies the number of the line that a train will follow.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:138][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type List`][api-reference-index.ts~List]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~List]: #type-list&nbsp;&nbsp;&nbsp;&uarr; "View type List"

Specifies a list of active dispatch stations.

**Type**:&nbsp;&nbsp;<code><u>[`Station`][api-reference-index.ts~Station]</u>[]</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:774][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type LocoType`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~LocoType]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~LocoType]: #type-locotype&nbsp;&nbsp;&nbsp;&uarr; "View type LocoType"

Specifies the name of a train's locomotive.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:55][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Longitude`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Longitude]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Longitude]: #type-longitude&nbsp;&nbsp;&nbsp;&uarr; "View type Longitude"

Specifies the current global longitude of a train.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:316][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Longitute`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Longitute]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Longitute]: #type-longitute&nbsp;&nbsp;&nbsp;&uarr; "View type Longitute"

Specifies the current global longitude of a train in the raw API format.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:362][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Map`][api-reference-index.ts~Map]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Map]: #type-map&nbsp;&nbsp;&nbsp;&uarr; "View type Map"

**Type**:&nbsp;&nbsp;<code>{ [trainNumber in <u>[`LiveData.Train.TrainNoLocal`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~TrainNoLocal]</u>]: <u>[`Api.Timetable.Data`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Data]</u> }</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:680][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type MaxSpeed`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~MaxSpeed]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~MaxSpeed]: #type-maxspeed&nbsp;&nbsp;&nbsp;&uarr; "View type MaxSpeed"

Specifies the maximum speed at a point.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:142][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Mileage`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Mileage]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Mileage]: #type-mileage&nbsp;&nbsp;&nbsp;&uarr; "View type Mileage"

Specifies at what distance a point will be passed **in kilometers**.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:212][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Name`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Name]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Name]: #type-name&nbsp;&nbsp;&nbsp;&uarr; "View type Name"

Specifies the name of a station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:166][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type NameForPerson`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~NameForPerson]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~NameForPerson]: #type-nameforperson&nbsp;&nbsp;&nbsp;&uarr; "View type NameForPerson"

Specifies the name of the dispatcher for a point.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:146][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type NameOfPoint`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~NameOfPoint]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~NameOfPoint]: #type-nameofpoint&nbsp;&nbsp;&nbsp;&uarr; "View type NameOfPoint"

Specifies the name of a point.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:148][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type NoCache`][api-reference-index.ts~NoCache]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~NoCache]: #type-nocache&nbsp;&nbsp;&nbsp;&uarr; "View type NoCache"

Specifies if a cached result can be returned.

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:779][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type Platform`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Platform]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Platform]: #type-platform&nbsp;&nbsp;&nbsp;&uarr; "View type Platform"

Specifies at which platform a train will stop in Roman numerals.

**Type**:&nbsp;&nbsp;<code><u>[`Timetable.Platform`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Platform]</u> &#124; `null`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:218][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type PointId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~PointId]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~PointId]: #type-pointid&nbsp;&nbsp;&nbsp;&uarr; "View type PointId"

Specifies the unique ID of a point.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:156][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Prefix`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Prefix]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Prefix]: #type-prefix&nbsp;&nbsp;&nbsp;&uarr; "View type Prefix"

Specifies the prefix of a station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:168][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type RadioChannel`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RadioChannel]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RadioChannel]: #type-radiochannel&nbsp;&nbsp;&nbsp;&uarr; "View type RadioChannel"

Specifies a radio channel.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:162][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type RadioChannels`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RadioChannels]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RadioChannels]: #type-radiochannels&nbsp;&nbsp;&nbsp;&uarr; "View type RadioChannels"

Specifies the radio channels required after a point as a comma-separated string.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:224][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Result`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Result]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Result]: #type-result&nbsp;&nbsp;&nbsp;&uarr; "View type Result"

Specifies if a request succeeded.

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:41][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Retention`][api-reference-index.ts~Retention]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Retention]: #type-retention&nbsp;&nbsp;&nbsp;&uarr; "View type Retention"

Specifies for how long a timetable record is cached in seconds.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:604][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type RunId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RunId]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~RunId]: #type-runid&nbsp;&nbsp;&nbsp;&uarr; "View type RunId"

Specifies the unique ID of a train. (independent from the train number)

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:57][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type ServerCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ServerCode]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~ServerCode]: #type-servercode&nbsp;&nbsp;&nbsp;&uarr; "View type ServerCode"

Specifies the unique code of a timetable server.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:59][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type ServerName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerName]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerName]: #type-servername&nbsp;&nbsp;&nbsp;&uarr; "View type ServerName"

Specifies the name of a server.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:86][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type ServerRegion`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerRegion]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerRegion]: #type-serverregion&nbsp;&nbsp;&nbsp;&uarr; "View type ServerRegion"

Specifies in which region a server is located.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:88][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type SignalInFront`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SignalInFront]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SignalInFront]: #type-signalinfront&nbsp;&nbsp;&nbsp;&uarr; "View type SignalInFront"

Specifies data about the next signal in the raw API format.

**NOTE**: This data (except for the ID prefixing the `@` symbol) hasn't be deciphered yet,
  if you know what this data describes please **open a new issue** in the project repository.

**Type**:&nbsp;&nbsp;<code>`string` &#124; `null`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:369][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type SignalInFrontSpeed`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SignalInFrontSpeed]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SignalInFrontSpeed]: #type-signalinfrontspeed&nbsp;&nbsp;&nbsp;&uarr; "View type SignalInFrontSpeed"

Specifies the track limit effective at the next signal in km/h and in the raw API format.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:373][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type SingleRecordOnly`][api-reference-index.ts~SingleRecordOnly]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~SingleRecordOnly]: #type-singlerecordonly&nbsp;&nbsp;&nbsp;&uarr; "View type SingleRecordOnly"

Specifies if only one timetable record should be cached.

**Type**:&nbsp;&nbsp;<code>`boolean`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:607][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type StartsAt`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StartsAt]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StartsAt]: #type-startsat&nbsp;&nbsp;&nbsp;&uarr; "View type StartsAt"

Specifies when a train departs from it's origin. Format: `hh:mm:ss`

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:63][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type StartStation`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StartStation]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StartStation]: #type-startstation&nbsp;&nbsp;&nbsp;&uarr; "View type StartStation"

Specifies the name of an origin station.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:61][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type StationCategory`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StationCategory]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StationCategory]: #type-stationcategory&nbsp;&nbsp;&nbsp;&uarr; "View type StationCategory"

Specifies the category of a station.

**Type**:&nbsp;&nbsp;<code><u>[`Timetable.StationCategory`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StationCategory]</u> &#124; `null`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:226][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type SteamId`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SteamId]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~SteamId]: #type-steamid&nbsp;&nbsp;&nbsp;&uarr; "View type SteamId"

Specifies the Steam ID of a player.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:153][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type StopType`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StopType]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~StopType]: #type-stoptype&nbsp;&nbsp;&nbsp;&uarr; "View type StopType"

Specifies the type of stop a train will make.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:228][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type SupervisedBy`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~SupervisedBy]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~SupervisedBy]: #type-supervisedby&nbsp;&nbsp;&nbsp;&uarr; "View type SupervisedBy"

Specifies the name of the dispatch station a point belongs to.

**Type**:&nbsp;&nbsp;<code><u>[`Timetable.SupervisedBy`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~SupervisedBy]</u> &#124; `null`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:230][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Timestamp`][api-reference-index.ts~Timestamp]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Timestamp]: #type-timestamp&nbsp;&nbsp;&nbsp;&uarr; "View type Timestamp"

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:686][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type Timetables`][api-reference-index.ts~Timetables]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Timetables]: #type-timetables&nbsp;&nbsp;&nbsp;&uarr; "View type Timetables"

**Type**:&nbsp;&nbsp;<code>{ [serverCode in <u>[`LiveData.Server.ServerCode`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~ServerCode]</u>]: <u>[`Timetables.Timetable`][api-reference-index.ts~Timetable]</u> }</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:671][api-reference-index.ts]

<br/>
<br/>

<br/>

### [`type Track`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Track]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Track]: #type-track&nbsp;&nbsp;&nbsp;&uarr; "View type Track"

Specifies the number of the track a train will stop at.

**Type**:&nbsp;&nbsp;<code><u>[`Timetable.Track`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~Track]</u> &#124; `null`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:232][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type TrainLength`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainLength]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainLength]: #type-trainlength&nbsp;&nbsp;&nbsp;&uarr; "View type TrainLength"

Specifies the length of a train in meters.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:65][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type TrainName`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainName]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainName]: #type-trainname&nbsp;&nbsp;&nbsp;&uarr; "View type TrainName"

Specifies the name of a train or train series.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:67][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type TrainNoInternational`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainNoInternational]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainNoInternational]: #type-trainnointernational&nbsp;&nbsp;&nbsp;&uarr; "View type TrainNoInternational"

Specifies the international train number of a train.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:69][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type TrainNoLocal`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainNoLocal]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainNoLocal]: #type-trainnolocal&nbsp;&nbsp;&nbsp;&uarr; "View type TrainNoLocal"

Specifies the national train number of a train.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:71][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type TrainType`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainType]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainType]: #type-traintype&nbsp;&nbsp;&nbsp;&uarr; "View type TrainType"

Specifies the name of a train series.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:178][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type TrainWeight`][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainWeight]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts~TrainWeight]: #type-trainweight&nbsp;&nbsp;&nbsp;&uarr; "View type TrainWeight"

Specifies the weight of a train in metric tonnes.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts:73][api-reference-node_modules/@simrail-sdk/api-core-node/types/timetable/index.d.ts]

<br/>
<br/>

<br/>

### [`type Type`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Type]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Type]: #type-type&nbsp;&nbsp;&nbsp;&uarr; "View type Type"

Specifies the type of train operator in the raw API format. (`"bot"` or `"user"`)

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:408][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Url`][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Url]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts~Url]: #type-url&nbsp;&nbsp;&nbsp;&uarr; "View type Url"

Specifies an API endpoint URL.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/index.d.ts:118][api-reference-node_modules/@simrail-sdk/api-core-node/index.d.ts]

<br/>
<br/>

<br/>

### [`type VdDelayedTimetableIndex`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VdDelayedTimetableIndex]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~VdDelayedTimetableIndex]: #type-vddelayedtimetableindex&nbsp;&nbsp;&nbsp;&uarr; "View type VdDelayedTimetableIndex"

Specifies the index of the current entry in a train's timetable.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:327][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Vehicle`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Vehicle]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Vehicle]: #type-vehicle&nbsp;&nbsp;&nbsp;&uarr; "View type Vehicle"

Specifies data about a vehicle of a train.

**NOTE**: This data hasn't be deciphered yet, if you know what this data
  describes please **open a new issue** in the project repository.

**Type**:&nbsp;&nbsp;<code>`string`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:272][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Vehicles`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Vehicles]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Vehicles]: #type-vehicles&nbsp;&nbsp;&nbsp;&uarr; "View type Vehicles"

Specifies a list of vehicles of a train.

**NOTE**: This data hasn't be deciphered yet, if you know what this data
  describes please **open a new issue** in the project repository.

**Type**:&nbsp;&nbsp;<code><u>[`Vehicles`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Vehicles]</u>[]</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:279][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Velocity`][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Velocity]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts~Velocity]: #type-velocity&nbsp;&nbsp;&nbsp;&uarr; "View type Velocity"

Specifies the current speed of a train.

**Type**:&nbsp;&nbsp;<code>`number`</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts:329][api-reference-node_modules/@simrail-sdk/api-core-node/types/liveData/index.d.ts]

<br/>
<br/>

<br/>

### [`type Version`][api-reference-index.ts~Version]&nbsp;&nbsp;&nbsp;[&uarr;][api-reference]

[api-reference-index.ts~Version]: #type-version&nbsp;&nbsp;&nbsp;&uarr; "View type Version"

Specifies the version of the API.

**Type**:&nbsp;&nbsp;<code>&#96;&#36;{`number`}`.`&#36;{`number`}`.`&#36;{`number`}&#96; &#124; &#96;&#36;{`number`}`.`&#36;{`number`}`.`&#36;{`number`}`-`&#36;{`string`}&#96;</code>

**Since**: `0.1.0`

**Definition**:&nbsp;&nbsp;[index.ts:782][api-reference-index.ts]

<br/>
<br/>

<br/>

## [About this module][about-this-module]

[about-this-module]: #about-this-module "View About this module"

Package name: `@simrail-sdk/api`

Author: [Niek van Bennekom](https://github.com/niekvb "View GitHub profile")

Version: `0.1.0`

Repository: [`github:simrail-sdk/api` (origin)](https://github.com/simrail-sdk/api.git "View on github")

Keywords: `simrail`, `sdk`, `api`, `rest`.

[View license][view-license]&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;[view open source licenses][view-open-source-licenses]

[view-license]: ./LICENSE.md "View license"
[view-open-source-licenses]: ./OSL.md "View open source licenses"

*SCTL version: `0.1.11-dev`*
<br/>
<br/>


### [Module dependencies][module-dependencies]

[module-dependencies]: #module-dependencies "View Module dependencies"

#### [Module package dependencies][module-package-dependencies]

[module-package-dependencies]: #module-package-dependencies "View Module package dependencies"


**Production packages**: (3)

- `@simrail-sdk/api-core-node`: SimRail SDK - API Core for Node.JS.

- `remove-accents`: Converting the accented characters to their corresponding non-accented ASCII characters.

- `rxjs`: Reactive Extensions for modern JavaScript.
<br/>
<br/>


**Development packages**: (2)

- `@types/node`: TypeScript definitions for node.

- `typescript`: TypeScript is a language for application scale JavaScript development.
<br/>
<br/>


#### [Internal module dependencies][internal-module-dependencies]

[internal-module-dependencies]: #internal-module-dependencies "View Internal module dependencies"

This module contains and uses the following internal modules:


- `index.js`
<br/>
<br/>


Dependency tree:

[![Dependency tree graph][dependency-tree-image]][dependency-tree-image]

[dependency-tree-image]: ./stats/dependencyTree.png "Dependency tree"
<br/>
<br/>


### [Module code statistics][module-code-statistics]

[module-code-statistics]: #module-code-statistics "View Module code statistics"

| File type | Number of files | Lines with code | Lines with comments | Blank lines |
| --------- | --------------- | --------------- | ------------------- | ----------- |
| Markdown | 3 | 3805 | 0 | 2507 |
| TypeScript | 8 | 792 | 557 | 199 |
| JavaScript | 7 | 496 | 7 | 0 |
| JSON | 3 | 123 | 0 | 1 |
| YAML | 1 | 40 | 0 | 0 |
| **All (total)** | **22** | **5256** | **564** | **2707** |
