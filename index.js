"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const api_core_node_1 = require("@simrail-sdk/api-core-node");
const removeAccents = require("remove-accents");
const RXJS = require("rxjs");
class Api {
    set activeServersUpdateTimer(value) {
        clearInterval(this._activeServersUpdateTimer);
        this._activeServersUpdateTimer = value;
    }
    set activeStationsUpdateTimer(value) {
        clearInterval(this._activeStationsUpdateTimer);
        this._activeStationsUpdateTimer = value;
    }
    set activeTrainsUpdateTimer(value) {
        clearInterval(this._activeTrainsUpdateTimer);
        this._activeTrainsUpdateTimer = value;
    }
    get autoUpdate() {
        return (this._activeServersUpdateTimer ??
            this._activeStationsUpdateTimer ??
            this._activeTrainsUpdateTimer ??
            this._timetableUpdateTimer) !== undefined;
    }
    set autoUpdate(value) {
        if (this.autoUpdate !== value) {
            if (value === true) {
                this.startAutoUpdates();
            }
            else {
                this.stopAutoUpdates();
            }
        }
    }
    set timetableUpdateTimer(value) {
        clearInterval(this._timetableUpdateTimer);
        this._timetableUpdateTimer = value;
    }
    constructor(config) {
        this.events = new RXJS.Subject();
        this.cache = {
            activeStations: {},
            activeTrains: {},
            timetables: {},
        };
        this.config = config;
        if (config.core !== undefined) {
            this.core = config.core;
        }
        else {
            const regular = config;
            this.core = new Api.Core({ endpoints: regular.endpoints, convertData: true });
        }
    }
    flushActiveServerCache() {
        this.cache.activeServers = undefined;
        return this;
    }
    flushActiveStationCache() {
        this.cache.activeStations = {};
        return this;
    }
    flushActiveTrainCache() {
        this.cache.activeTrains = {};
        return this;
    }
    flushCache() {
        this.flushActiveServerCache();
        this.flushActiveStationCache();
        this.flushActiveTrainCache();
        this.flushTimetableCache();
        return this;
    }
    flushTimetableCache() {
        this.cache.timetables = {};
        return this;
    }
    async getActiveServer(serverCode, noCache = false) {
        const servers = await this.getActiveServers(noCache);
        for (const server of servers) {
            if (server.serverCode === serverCode) {
                return server;
            }
        }
        throw exception("InvalidServerCodeError", `Can't find server with code "${serverCode}"!`);
    }
    async getActiveServers(noCache = false) {
        const config = this.config.liveData?.cache?.activeServers;
        if (noCache !== true && config?.enabled !== false) {
            const cache = this.cache.activeServers;
            const retention = config?.retention ?? Api.DEFAULT_ACTIVE_SERVER_RETENTION;
            if (cache !== undefined && cache.timestamp < (Date.now() + (retention * 1000))) {
                return Object.values(cache.map);
            }
        }
        const activeServers = await this.core.getActiveServers();
        if (config?.enabled !== false) {
            const map = {};
            activeServers.forEach((server) => map[server.serverCode] = server);
            this.cache.activeServers = { map, timestamp: Date.now() };
            this.events.next({ activeServers, api: this, type: Api.Event.Type.ActiveServersUpdated });
        }
        return activeServers;
    }
    async getActiveStation(serverCode, stationCode, noCache = false) {
        const stations = await this.getActiveStations(serverCode, noCache);
        for (const station of stations) {
            if (this.stationCode(station.prefix) === this.stationCode(stationCode)) {
                return station;
            }
        }
        throw exception("InvalidStationCodeError", `Can't find dispatch station with code or prefix "${stationCode}"!`);
    }
    async getActiveStations(serverCode, noCache = false) {
        const config = this.config.liveData?.cache?.activeStations;
        if (noCache !== true && config?.enabled !== false) {
            const cache = this.cache.activeStations[serverCode];
            const retention = config?.retention ?? Api.DEFAULT_ACTIVE_STATION_RETENTION;
            if (cache !== undefined && cache.timestamp < (Date.now() + (retention * 1000))) {
                return Object.values(cache.map);
            }
        }
        const results = await this.core.getActiveStations(serverCode);
        const activeStations = [];
        const map = {};
        results.forEach((station) => {
            const code = this.stationCode(station.prefix);
            activeStations.push({ ...station, code });
            map[code] = { ...station, code };
        });
        if (config?.enabled !== false) {
            this.cache.activeStations[serverCode] = { map, timestamp: Date.now() };
            this.events.next({ activeStations, api: this, type: Api.Event.Type.ActiveStationsUpdated });
        }
        return activeStations;
    }
    async getActiveTrain(serverCode, trainNoLocal, noCache = false) {
        const trains = await this.getActiveTrains(serverCode, noCache);
        for (const train of trains) {
            if (train.trainNoLocal === trainNoLocal) {
                return train;
            }
        }
        throw exception("InvalidTrainNumberError", `Can't find train with number "${trainNoLocal}"!`);
    }
    async getActiveTrains(serverCode, noCache = false) {
        const config = this.config.liveData?.cache?.activeTrains;
        if (noCache !== true && config?.enabled !== false) {
            const cache = this.cache.activeTrains[serverCode];
            const retention = config?.retention ?? Api.DEFAULT_ACTIVE_TRAIN_RETENTION;
            if (cache !== undefined && cache.timestamp < (Date.now() + (retention * 1000))) {
                return Object.values(cache.map);
            }
        }
        const activeTrains = await this.core.getActiveTrains(serverCode);
        if (config?.enabled !== false) {
            const map = {};
            activeTrains.forEach((train) => map[train.trainNoLocal] = train);
            this.cache.activeTrains[serverCode] = { map, timestamp: Date.now() };
            this.events.next({ activeTrains, api: this, type: Api.Event.Type.ActiveTrainsUpdated });
        }
        return activeTrains;
    }
    async getTimetable(serverCode, trainNoOrNoCache, noCache = false) {
        const config = this.config.timetable?.cache;
        if (trainNoOrNoCache !== true && noCache !== true && config?.enabled !== false) {
            const cache = this.cache.timetables[serverCode];
            const retention = config?.retention ?? Api.DEFAULT_ACTIVE_TRAIN_RETENTION;
            if (cache !== undefined && cache.timestamp < (Date.now() + (retention * 1000))) {
                if (typeof trainNoOrNoCache === "string") {
                    const trainTimetable = cache.map[trainNoOrNoCache];
                    if (trainTimetable !== undefined) {
                        return trainTimetable;
                    }
                    throw exception("InvalidTimetableTrainNumberError", `Can't find timetable for train with number "${trainNoOrNoCache}"!`);
                }
                else {
                    return Object.values(cache.map);
                }
            }
        }
        if (typeof trainNoOrNoCache === "string") {
            return await this.core.getTimetable(serverCode, trainNoOrNoCache);
        }
        const timetable = await this.core.getTimetable(serverCode);
        if (config?.enabled !== false) {
            const map = {};
            timetable.forEach((entry) => map[entry.trainNoLocal] = entry);
            if (config?.singleRecordOnly !== false) {
                this.cache.timetables = {};
            }
            this.cache.timetables[serverCode] = { map, timestamp: Date.now() };
            this.events.next({ timetable, api: this, type: Api.Event.Type.TimetableUpdated });
        }
        return timetable;
    }
    startAutoUpdates(autoUpdateServer) {
        this.autoUpdateServer = autoUpdateServer ?? this.autoUpdateServer;
        this.checkAutoUpdateServer();
        if (this.autoUpdate !== true) {
            let enabled = false;
            if (this.config.liveData?.cache?.activeServers?.enabled !== false) {
                const retention = this.config.liveData?.cache?.activeServers?.retention ?? Api.DEFAULT_ACTIVE_SERVER_RETENTION;
                this.activeServersUpdateTimer = setInterval(() => this.updateActiveServers(), retention * 1000);
                enabled = true;
            }
            if (this.config.liveData?.cache?.activeStations?.enabled !== false) {
                const retention = this.config.liveData?.cache?.activeStations?.retention ?? Api.DEFAULT_ACTIVE_STATION_RETENTION;
                this.activeStationsUpdateTimer = setInterval(() => this.updateActiveStations(), retention * 1000);
                enabled = true;
            }
            if (this.config.liveData?.cache?.activeTrains?.enabled !== false) {
                const retention = this.config.liveData?.cache?.activeTrains?.retention ?? Api.DEFAULT_ACTIVE_TRAIN_RETENTION;
                this.activeTrainsUpdateTimer = setInterval(() => this.updateActiveTrains(), retention * 1000);
                enabled = true;
            }
            if (this.config.timetable?.cache?.enabled !== false) {
                const retention = this.config.timetable?.cache?.retention ?? Api.DEFAULT_TIMETABLE_RETENTION;
                this.timetableUpdateTimer = setInterval(() => this.updateTimetable(), retention * 1000);
                enabled = true;
            }
            if (enabled === true) {
                this.events.next({ api: this, autoUpdate: true, type: Api.Event.Type.AutoUpdateChanged });
            }
        }
        return this;
    }
    stopAutoUpdates() {
        let changed = false;
        if (this._activeServersUpdateTimer !== undefined) {
            this.activeServersUpdateTimer = undefined;
            changed = true;
        }
        if (this._activeStationsUpdateTimer !== undefined) {
            this.activeStationsUpdateTimer = undefined;
            changed = true;
        }
        if (this._activeTrainsUpdateTimer !== undefined) {
            this.activeTrainsUpdateTimer = undefined;
            changed = true;
        }
        if (this._timetableUpdateTimer !== undefined) {
            this.timetableUpdateTimer = undefined;
            changed = true;
        }
        if (changed === true) {
            this.events.next({ api: this, autoUpdate: false, type: Api.Event.Type.AutoUpdateChanged });
        }
        return this;
    }
    checkAutoUpdateServer() {
        if (this.autoUpdateServer === undefined) {
            throw exception("MissingAutoUpdateServerError", `Server for retrieving automatic updates isn't specified!`);
        }
    }
    stationCode(prefix) {
        let code = removeAccents(prefix);
        return code.substring(0, 1).toUpperCase() + code.substring(1);
    }
    async updateActiveServers() {
        const activeServers = await this.getActiveServers(true);
        this.events.next({ activeServers, api: this, type: Api.Event.Type.ActiveServersUpdated });
    }
    async updateActiveStations() {
        this.checkAutoUpdateServer();
        const activeStations = await this.getActiveStations(this.autoUpdateServer, true);
        this.events.next({ activeStations, api: this, type: Api.Event.Type.ActiveStationsUpdated });
    }
    async updateActiveTrains() {
        this.checkAutoUpdateServer();
        const activeTrains = await this.getActiveTrains(this.autoUpdateServer, true);
        this.events.next({ activeTrains, api: this, type: Api.Event.Type.ActiveTrainsUpdated });
    }
    async updateTimetable() {
        this.checkAutoUpdateServer();
        const timetable = await this.getTimetable(this.autoUpdateServer, true);
        this.events.next({ timetable, api: this, type: Api.Event.Type.TimetableUpdated });
    }
}
exports.Api = Api;
(function (Api) {
    Api.VERSION = "0.1.0";
    Api.Core = api_core_node_1.default;
    Api.Timetable = api_core_node_1.default.Timetable;
    Api.DEFAULT_ACTIVE_SERVER_RETENTION = 30;
    Api.DEFAULT_ACTIVE_STATION_RETENTION = 30;
    Api.DEFAULT_ACTIVE_TRAIN_RETENTION = 5;
    Api.DEFAULT_TIMETABLE_RETENTION = 1140;
    let Config;
    (function (Config) {
        let LiveData;
        (function (LiveData) {
            let Cache;
            (function (Cache) {
                let ActiveServers;
                (function (ActiveServers) {
                })(ActiveServers = Cache.ActiveServers || (Cache.ActiveServers = {}));
                let ActiveStations;
                (function (ActiveStations) {
                })(ActiveStations = Cache.ActiveStations || (Cache.ActiveStations = {}));
                let ActiveTrains;
                (function (ActiveTrains) {
                })(ActiveTrains = Cache.ActiveTrains || (Cache.ActiveTrains = {}));
            })(Cache = LiveData.Cache || (LiveData.Cache = {}));
        })(LiveData = Config.LiveData || (Config.LiveData = {}));
    })(Config = Api.Config || (Api.Config = {}));
    let Event;
    (function (Event) {
        let Type;
        (function (Type) {
            Type["AutoUpdateChanged"] = "autoUpdateChanged";
            Type["ActiveServersUpdated"] = "activeServersUpdated";
            Type["ActiveStationsUpdated"] = "activeStationsUpdated";
            Type["ActiveTrainsUpdated"] = "activeTrainsUpdated";
            Type["TimetableUpdated"] = "timetableUpdated";
        })(Type = Event.Type || (Event.Type = {}));
    })(Event = Api.Event || (Api.Event = {}));
    let LiveData;
    (function (LiveData) {
        LiveData.VMAX = Api.Core.LiveData.VMAX;
        LiveData.VMAX_VALUE = Api.Core.LiveData.VMAX_VALUE;
        let Station;
        (function (Station) {
        })(Station = LiveData.Station || (LiveData.Station = {}));
    })(LiveData = Api.LiveData || (Api.LiveData = {}));
})(Api || (exports.Api = Api = {}));
exports.default = Api;
function exception(code, message) {
    const error = Error(message);
    error.name = code;
    return error;
}
//# sourceMappingURL=index.js.map