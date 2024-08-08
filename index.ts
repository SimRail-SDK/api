/**
 * ## SimRail API SDK
 *
 * This file contains the functionality for interacting with the SimRail API
 *   and exports type definitions from submodules for ease-of-use.
 *
 * @file
 * @module
 *
 * @author  Niek van Bennekom
 * @since   0.1.0
 * @version 0.1.0
 *
 * @requires [at]simrail-sdk/api-core-node
 * @requires remove-accents
 * @requires rxjs
 */

// Import node modules
import ApiCore from "@simrail-sdk/api-core-node";
import * as removeAccents from "remove-accents";
import * as RXJS from "rxjs";

/**
 * Specifies an API class instance for interacting with SimRail's remote API.
 *
 * @param config - The API configuration.
 */
export class Api implements Omit<Api.Core, "config"> {

    /** Specifies a reference to the Core API. */
    public readonly core: Api.Core;

    /** Specifies the configuration of the API. */
    public readonly config: Api.Config;

    /** Specifies the event emitter for API events. */
    public readonly events: Api.Event.Emitter = new RXJS.Subject();

    private readonly cache: Api.Cache = {
        activeStations: {},
        activeTrains: {},
        timetables: {},
    };

    /** Specifies the unique code of the server to automatically retrieve data from. */
    public autoUpdateServer?: Api.AutoUpdateServer;

    private _activeServersUpdateTimer?: NodeJS.Timeout;

    private _activeStationsUpdateTimer?: NodeJS.Timeout;

    private _activeTrainsUpdateTimer?: NodeJS.Timeout;

    private _timetableUpdateTimer?: NodeJS.Timeout;

    private set activeServersUpdateTimer(value: NodeJS.Timeout | undefined) {
        clearInterval(this._activeServersUpdateTimer);
        this._activeServersUpdateTimer = value;
    }

    private set activeStationsUpdateTimer(value: NodeJS.Timeout | undefined) {
        clearInterval(this._activeStationsUpdateTimer);
        this._activeStationsUpdateTimer = value;
    }

    private set activeTrainsUpdateTimer(value: NodeJS.Timeout | undefined) {
        clearInterval(this._activeTrainsUpdateTimer);
        this._activeTrainsUpdateTimer = value;
    }

    /** Specifies if live data is updated automatically. */
    public get autoUpdate(): Api.AutoUpdate {
        return (
            this._activeServersUpdateTimer  ??
            this._activeStationsUpdateTimer ??
            this._activeTrainsUpdateTimer   ??
            this._timetableUpdateTimer
        ) !== undefined;
    }

    public set autoUpdate(value: Api.AutoUpdate) {
        if (this.autoUpdate !== value) {
            if (value === true) { this.startAutoUpdates(); }
            else { this.stopAutoUpdates(); }
        }
    }

    private set timetableUpdateTimer(value: NodeJS.Timeout | undefined) {
        clearInterval(this._timetableUpdateTimer);
        this._timetableUpdateTimer = value;
    }

    constructor(config: Api.Config) {
        this.config = config;
        if ((config as Api.Config.WithCore).core !== undefined) {
            this.core = (config as Api.Config.WithCore).core;
        } else {
            const regular = config as Api.Config.Regular;
            this.core = new Api.Core({ endpoints: regular.endpoints, convertData: true });
        }
    }

    /**
     * Method to flush all cached active server records.
     *
     * @returns This API instance.
     */
    public flushActiveServerCache(): this {
        this.cache.activeServers = undefined;
        return this;
    }

    /**
     * Method to flush all cached active station records.
     *
     * @returns This API instance.
     */
    public flushActiveStationCache(): this {
        this.cache.activeStations = {};
        return this;
    }

    /**
     * Method to flush all cached active train records.
     *
     * @returns This API instance.
     */
    public flushActiveTrainCache(): this {
        this.cache.activeTrains = {};
        return this;
    }

    /**
     * Method to flush all cached records.
     *
     * @returns This API instance.
     */
    public flushCache(): this {
        this.flushActiveServerCache();
        this.flushActiveStationCache();
        this.flushActiveTrainCache();
        this.flushTimetableCache();
        return this;
    }

    /**
     * Method to flush all cached timetable records.
     *
     * @returns This API instance.
     */
    public flushTimetableCache(): this {
        this.cache.timetables = {};
        return this;
    }

    /**
     * Method to retrieve an active server from the live data endpoint.
     *
     * @param serverCode - The unique code of the server.
     * @param noCache    - Prevent returning a cached result.
     * @returns The multiplayer server.
     */
    public async getActiveServer(serverCode: Api.LiveData.Server.ServerCode, noCache: Api.NoCache = false): Promise<Api.LiveData.Server> {
        const servers = await this.getActiveServers(noCache);
        for (const server of servers) {
            if (server.serverCode === serverCode) { return server; }
        }
        throw exception("InvalidServerCodeError", `Can't find server with code "${serverCode}"!`);
    }

    /**
     * Method to retrieve active servers from the live data endpoint.
     *
     * @param noCache - Prevent returning a cached result.
     * @returns A list of multiplayer servers.
     */
    public async getActiveServers(noCache: Api.NoCache = false): Promise<Api.LiveData.Server.List> {
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
            const map: Api.Cache.ActiveServers.Map = {};
            activeServers.forEach((server) => map[server.serverCode] = server);
            this.cache.activeServers = { map, timestamp: Date.now() };
            (this.events as RXJS.Subject<Api.Event>).next({ activeServers, api: this, type: Api.Event.Type.ActiveServersUpdated });
        }
        return activeServers;
    }

    /**
     * Method to retrieve an active dispatch station from the live data endpoint.
     *
     * The value for `stationCode` can be either:
     * - The `prefix` of the station.
     * - The `code` which is the `prefix` but stripped from diacritics.
     *   Example: **prefix** `ŁA` equals **code** `LA`.
     *
     * @param serverCode  - The code of the related server.
     * @param stationCode - The unique code of the dispatch station.
     * @param noCache     - Prevent returning a cached result.
     * @returns The active dispatch station.
     */
    public async getActiveStation(serverCode: Api.LiveData.Server.ServerCode, stationCode: Api.LiveData.Station.Prefix, noCache: Api.NoCache = false): Promise<Api.LiveData.Station> {
        const stations = await this.getActiveStations(serverCode, noCache);
        for (const station of stations) {
            if (this.stationCode(station.prefix) === this.stationCode(stationCode)) { return station; }
        }
        throw exception("InvalidStationCodeError", `Can't find dispatch station with code or prefix "${stationCode}"!`);
    }

    /**
     * Method to retrieve active dispatch stations from the live data endpoint.
     *
     * @param serverCode - The unique code of the multiplayer server.
     * @param noCache    - Prevent returning a cached result.
     * @returns A list of active dispatch stations.
     */
    public async getActiveStations(serverCode: Api.LiveData.Server.ServerCode, noCache: Api.NoCache = false): Promise<Api.LiveData.Station.List> {
        const config = this.config.liveData?.cache?.activeStations;
        if (noCache !== true && config?.enabled !== false) {
            const cache = this.cache.activeStations[serverCode];
            const retention = config?.retention ?? Api.DEFAULT_ACTIVE_STATION_RETENTION;
            if (cache !== undefined && cache.timestamp < (Date.now() + (retention * 1000))) {
                return Object.values(cache.map);
            }
        }
        const results = await this.core.getActiveStations(serverCode);
        const activeStations: Api.LiveData.Station.List = [];
        const map: Api.Cache.ActiveStations.Stations.Map = {};
        results.forEach((station) => {
            const code = this.stationCode(station.prefix);
            activeStations.push({ ...station, code });
            map[code] = { ...station, code };
        });
        if (config?.enabled !== false) {
            this.cache.activeStations[serverCode] = { map, timestamp: Date.now() };
            (this.events as RXJS.Subject<Api.Event>).next({ activeStations, api: this, type: Api.Event.Type.ActiveStationsUpdated });
        }
        return activeStations;
    }

    /**
     * Method to retrieve an active train from the live data endpoint.
     *
     * @param serverCode   - The code of the related server.
     * @param trainNoLocal - The national number of the train.
     * @param noCache      - Prevent returning a cached result.
     * @returns The active dispatch train.
     */
    public async getActiveTrain(serverCode: Api.LiveData.Server.ServerCode, trainNoLocal: Api.LiveData.Train.TrainNoLocal, noCache: Api.NoCache = false): Promise<Api.LiveData.Train> {
        const trains = await this.getActiveTrains(serverCode, noCache);
        for (const train of trains) {
            if (train.trainNoLocal === trainNoLocal) { return train; }
        }
        throw exception("InvalidTrainNumberError", `Can't find train with number "${trainNoLocal}"!`);
    }

    /**
     * Method to retrieve active trains from the live data endpoint.
     *
     * @param serverCode - The unique code of the multiplayer server.
     * @param noCache    - Prevent returning a cached result.
     * @returns A list of active trains.
     */
    public async getActiveTrains(serverCode: Api.LiveData.Server.ServerCode, noCache: Api.NoCache = false): Promise<Api.LiveData.Train.List> {
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
            const map: Api.Cache.ActiveTrains.Trains.Map = {};
            activeTrains.forEach((train) => map[train.trainNoLocal] = train);
            this.cache.activeTrains[serverCode] = { map, timestamp: Date.now() };
            (this.events as RXJS.Subject<Api.Event>).next({ activeTrains, api: this, type: Api.Event.Type.ActiveTrainsUpdated });
        }
        return activeTrains;
    }

    /**
     * Method to retrieve timetable data from the timetable endpoint.
     *
     * @param serverCode   - The unique code of the multiplayer server.
     * @param trainNoLocal - The national train number of a train. If left `undefined`, this function will return data for all trains in the timetable.
     */
    public async getTimetable(serverCode: Api.Timetable.ServerCode, noCache?:                                       Api.NoCache                               ): Promise<Api.Timetable.Data.List                     >;
    public async getTimetable(serverCode: Api.Timetable.ServerCode, trainNoLocal:      Api.Timetable.TrainNoLocal              , noCache?: Api.NoCache        ): Promise<                          Api.Timetable.Data>;
    public async getTimetable(serverCode: Api.Timetable.ServerCode, trainNoOrNoCache?: Api.Timetable.TrainNoLocal              , noCache?: Api.NoCache        ): Promise<Api.Timetable.Data.List | Api.Timetable.Data>;
    public async getTimetable(serverCode: Api.Timetable.ServerCode, trainNoOrNoCache?: Api.Timetable.TrainNoLocal | Api.NoCache, noCache:  Api.NoCache = false): Promise<Api.Timetable.Data.List | Api.Timetable.Data> {
        const config = this.config.timetable?.cache;
        if (trainNoOrNoCache !== true && noCache !== true && config?.enabled !== false) {
            const cache = this.cache.timetables[serverCode];
            const retention = config?.retention ?? Api.DEFAULT_ACTIVE_TRAIN_RETENTION;
            if (cache !== undefined && cache.timestamp < (Date.now() + (retention * 1000))) {
                if (typeof trainNoOrNoCache === "string") {
                    const trainTimetable = cache.map[trainNoOrNoCache];
                    if (trainTimetable !== undefined) { return trainTimetable; }
                    throw exception("InvalidTimetableTrainNumberError", `Can't find timetable for train with number "${trainNoOrNoCache}"!`);
                } else { return Object.values(cache.map); }
            }
        }
        if (typeof trainNoOrNoCache === "string") {
            return await this.core.getTimetable(serverCode, trainNoOrNoCache);
        }
        const timetable = await this.core.getTimetable(serverCode);
        if (config?.enabled !== false) {
            const map: Api.Cache.Timetables.Timetable.Map = {};
            timetable.forEach((entry) => map[entry.trainNoLocal] = entry);
            if (config?.singleRecordOnly !== false) { this.cache.timetables = {}; }
            this.cache.timetables[serverCode] = { map, timestamp: Date.now() };
            (this.events as RXJS.Subject<Api.Event>).next({ timetable, api: this, type: Api.Event.Type.TimetableUpdated });
        }
        return timetable;
    }

    /**
     * Method to start auto updating cached data.
     *
     * This will update cached data and enable events. The update interval
     *   is determined by checking the cache retention value.
     *
     * **NOTE**: Auto update only works for records which have caching enabled.
     *
     *  @returns This `Api` instance.
     */
    public startAutoUpdates(autoUpdateServer?: Api.AutoUpdateServer): this {
        this.autoUpdateServer = autoUpdateServer ?? this.autoUpdateServer;
        this.checkAutoUpdateServer();
        if (this.autoUpdate !== true) {

            let enabled: boolean = false;

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
                (this.events as RXJS.Subject<Api.Event>).next({ api: this, autoUpdate: true, type: Api.Event.Type.AutoUpdateChanged });
            }

        }
        return this;
    }

    /**
     * Method to stop auto updating cached data.
     *
     * @returns This `Api` instance.
     */
    public stopAutoUpdates(): this {
        let changed: boolean = false;
        if (this._activeServersUpdateTimer  !== undefined) { this.activeServersUpdateTimer  = undefined; changed = true; }
        if (this._activeStationsUpdateTimer !== undefined) { this.activeStationsUpdateTimer = undefined; changed = true; }
        if (this._activeTrainsUpdateTimer   !== undefined) { this.activeTrainsUpdateTimer   = undefined; changed = true; }
        if (this._timetableUpdateTimer      !== undefined) { this.timetableUpdateTimer      = undefined; changed = true; }
        if (changed === true) {
            (this.events as RXJS.Subject<Api.Event>).next({ api: this, autoUpdate: false, type: Api.Event.Type.AutoUpdateChanged });
        }
        return this;
    }

    private checkAutoUpdateServer(): void | never {
        if (this.autoUpdateServer === undefined) {
            throw exception("MissingAutoUpdateServerError", `Server for retrieving automatic updates isn't specified!`)
        }
    }

    private stationCode(prefix: Api.LiveData.Station.Prefix): Api.LiveData.Station.Code {
        let code = removeAccents(prefix);
        return code.substring(0, 1).toUpperCase() + code.substring(1);
    }

    private async updateActiveServers(): Promise<void> {
        const activeServers = await this.getActiveServers(true);
        (this.events as RXJS.Subject<Api.Event>).next({ activeServers, api: this, type: Api.Event.Type.ActiveServersUpdated });
    }

    private async updateActiveStations(): Promise<void> {
        this.checkAutoUpdateServer();
        const activeStations = await this.getActiveStations(this.autoUpdateServer!, true);
        (this.events as RXJS.Subject<Api.Event>).next({ activeStations, api: this, type: Api.Event.Type.ActiveStationsUpdated });
    }

    private async updateActiveTrains(): Promise<void> {
        this.checkAutoUpdateServer();
        const activeTrains = await this.getActiveTrains(this.autoUpdateServer!, true);
        (this.events as RXJS.Subject<Api.Event>).next({ activeTrains, api: this, type: Api.Event.Type.ActiveTrainsUpdated });
    }

    private async updateTimetable(): Promise<void> {
        this.checkAutoUpdateServer();
        const timetable = await this.getTimetable(this.autoUpdateServer!, true);
        (this.events as RXJS.Subject<Api.Event>).next({ timetable, api: this, type: Api.Event.Type.TimetableUpdated });
    }

}

export namespace Api {

    /** Specifies the version of the API. */
    export const VERSION: Version = "0.1.1";

    export import Core       = ApiCore;
    export import Endpoints  = ApiCore.Endpoints;
    export import Timetable  = ApiCore.Timetable;
    export import ServerCode = ApiCore.LiveData.ServerCode;
    export import Url        = ApiCore.Url;

    /** Specifies the default retention for active server records. */
    export const DEFAULT_ACTIVE_SERVER_RETENTION: Config.LiveData.Cache.ActiveServers.Retention = 30 as const;
    /** Specifies the default retention for active station records. */
    export const DEFAULT_ACTIVE_STATION_RETENTION: Config.LiveData.Cache.ActiveStations.Retention = 30 as const;
    /** Specifies the default retention for active train records. */
    export const DEFAULT_ACTIVE_TRAIN_RETENTION: Config.LiveData.Cache.ActiveTrains.Retention = 5 as const;
    /** Specifies the default retention for timetable records. */
    export const DEFAULT_TIMETABLE_RETENTION: Config.Timetable.Cache.Retention = 1140 as const;

    /** Specifies if cached data is automatically updated. */
    export type AutoUpdate = boolean;

    /** Specifies the unique code of a server to automatically retrieve data from. */
    export type AutoUpdateServer = LiveData.Server.ServerCode;

    /** Specifies a configuration of the API. */
    export type Config = Config.Regular | Config.WithCore;
    export namespace Config {

        export interface Core {
            /** Specifies a configuration for live data queries. */
            readonly liveData?: Config.LiveData;
            /** Specifies a configuration for timetable queries. */
            readonly timetable?: Config.Timetable;
        }

        /** Specifies a configuration of the API. */
        export interface WithCore extends Core {
            /** Specifies a Core API class instance. */
            readonly core: Api.Core;
        }

        /** Specifies a configuration of the API. */
        export interface Regular extends Core, Omit<Core.Config<true>, "convertData"> {}

        /** Specifies a configuration for live data queries. */
        export interface LiveData {
            /** Specifies a configuration for caching live data data. */
            readonly cache?: LiveData.Cache;
        }
        export namespace LiveData {
            export interface Cache {
                readonly activeServers?: Cache.ActiveServers;
                readonly activeStations?: Cache.ActiveStations;
                readonly activeTrains?: Cache.ActiveTrains;
            }
            export namespace Cache {

                export interface Core<CacheEnabled extends boolean> {
                    /**
                     * Specifies if caching is enabled for live data queries.
                     *
                     * @default true
                     */
                    readonly enabled: CacheEnabled;
                }

                /** Specifies a configuration for caching live data. */
                export interface Disabled extends Core<false> {}

                /** Specifies for how long a live data record is cached in seconds. */
                export type Retention = number;

                /** Specifies a configuration for caching active servers. */
                export type ActiveServers = ActiveServers.Disabled | ActiveServers.Enabled;
                export namespace ActiveServers {
                    export import Core = Cache.Core;
                    export import Disabled = Cache.Disabled;
                    export import Retention = Cache.Retention;
                    /** Specifies a configuration for caching active servers. */
                    export interface Enabled extends Core<true> {
                        /**
                         * Specifies for how long an active server record should be cached in seconds.
                         *
                         * @default 30
                         */
                        readonly retention?: Retention;
                    }
                }

                /** Specifies a configuration for caching active stations. */
                export type ActiveStations = ActiveStations.Disabled | ActiveStations.Enabled;
                export namespace ActiveStations {
                    export import Core = Cache.Core;
                    export import Disabled = Cache.Disabled;
                    export import Retention = Cache.Retention;
                    /** Specifies a configuration for caching active stations. */
                    export interface Enabled extends Core<true> {
                        /**
                         * Specifies for how long an active station record should be cached in seconds.
                         *
                         * @default 30
                         */
                        readonly retention?: Retention;
                    }
                }

                /** Specifies a configuration for caching active trains. */
                export type ActiveTrains = ActiveTrains.Disabled | ActiveTrains.Enabled;
                export namespace ActiveTrains {
                    export import Core = Cache.Core;
                    export import Disabled = Cache.Disabled;
                    export import Retention = Cache.Retention;
                    /** Specifies a configuration for caching active trains. */
                    export interface Enabled extends Core<true> {
                        /**
                         * Specifies for how long an active train record should be cached in seconds.
                         *
                         * @default 5
                         */
                        readonly retention?: Retention;
                    }
                }

            }
        }

        /** Specifies a configuration for timetable queries. */
        export interface Timetable {
            /** Specifies a configuration for caching timetable data. */
            readonly cache?: Timetable.Cache;
        }
        export namespace Timetable {
            /** Specifies a configuration for caching timetable data. */
            export type Cache = Cache.Disabled | Cache.Enabled;
            export namespace Cache {

                export interface Core<CacheEnabled extends boolean> {
                    /**
                     * Specifies if caching is enabled for timetable queries.
                     *
                     * @default true
                     */
                    readonly enabled: CacheEnabled;
                }

                /** Specifies a configuration for caching timetable data. */
                export interface Enabled extends Core<true> {
                    /**
                     * Specifies for how long a timetable record should be cached in seconds.
                     *
                     * Defaults to 24 hours.
                     *
                     * @default 1440
                     */
                    readonly retention?: Retention;
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
                    readonly singleRecordOnly?: SingleRecordOnly;
                }

                /** Specifies a configuration for caching timetable data. */
                export interface Disabled extends Core<false> {}

                /** Specifies for how long a timetable record is cached in seconds. */
                export type Retention = number;

                /** Specifies if only one timetable record should be cached. */
                export type SingleRecordOnly = boolean;

            }
        }

    }

    /** Specifies the internal cache of an API class instance. */
    export interface Cache {
        activeServers?: Cache.ActiveServers;
        activeStations: Cache.ActiveStations;
        activeTrains: Cache.ActiveTrains;
        timetables: Cache.Timetables;
    }
    export namespace Cache {

        export interface ActiveServer extends LiveData.Server {}

        export interface ActiveServers {
            map: ActiveServers.Map;
            timestamp: Timestamp;
        }
        export namespace ActiveServers {
            export type Map = {
                [serverCode in LiveData.Server.ServerCode]: ActiveServer;
            };
        }

        export interface ActiveStation extends LiveData.Station {
            code: LiveData.Station.Prefix;
        }

        export type ActiveStations = {
            [serverCode in LiveData.Server.ServerCode]: ActiveStations.Stations;
        };
        export namespace ActiveStations {
            export interface Stations {
                map: Stations.Map;
                timestamp: Timestamp;
            }
            export namespace Stations {
                export type Map = {
                    [stationCode in LiveData.Station.Prefix]: ActiveStation;
                };
            }
        }

        export interface ActiveTrain extends LiveData.Train {}

        export type ActiveTrains = {
            [serverCode in LiveData.Server.ServerCode]: ActiveTrains.Trains;
        };
        export namespace ActiveTrains {
            export interface Trains {
                map: Trains.Map;
                timestamp: Timestamp;
            }
            export namespace Trains {
                export type Map = {
                    [trainNumber in LiveData.Train.TrainNoLocal]: ActiveTrain;
                };
            }
        }

        export type Timetables = {
            [serverCode in LiveData.Server.ServerCode]: Timetables.Timetable;
        };
        export namespace Timetables {
            export interface Timetable {
                map: Timetable.Map;
                timestamp: Timestamp;
            }
            export namespace Timetable {
                export type Map = {
                    [trainNumber in LiveData.Train.TrainNoLocal]: Api.Timetable.Data;
                };
            }
        }

        export type Timestamp = number;

    }

    /** Specifies an API event. */
    export type Event =
        Event.AutoUpdateChanged |
        Event.ActiveServersUpdated |
        Event.ActiveStationsUpdated |
        Event.ActiveTrainsUpdated |
        Event.TimetableUpdated;
    export namespace Event {

        /** Specifies a type of API event. */
        export enum Type {
            /** Specifies an event that fires when the value of `Api.autoUpdate` changes. */
            AutoUpdateChanged = "autoUpdateChanged",
            /** Specifies an event that fires when cached active servers updated. */
            ActiveServersUpdated = "activeServersUpdated",
            /** Specifies an event that fires when cached active dispatch stations updated. */
            ActiveStationsUpdated = "activeStationsUpdated",
            /** Specifies an event that fires when cached active trains updated. */
            ActiveTrainsUpdated = "activeTrainsUpdated",
            /** Specifies an event that fires when cached timetable data updated. */
            TimetableUpdated = "timetableUpdated",
        }

        export interface Base<EventType extends Type> {
            /** Specifies a reference to the related `Api` instance. */
            api: Api;
            /** Specifies the type of API event. */
            type: EventType;
        }

        /** Specifies an API event emitter. */
        export type Emitter = RXJS.Observable<Event>;

        /** Specifies an event that fires when the value of `Api.autoUpdate` changes. */
        export interface AutoUpdateChanged extends Base<Type.AutoUpdateChanged> {
            autoUpdate: AutoUpdate;
        }

        /** Specifies an event that fires when cached active servers updated. */
        export interface ActiveServersUpdated extends Base<Type.ActiveServersUpdated> {
            activeServers: LiveData.Server.List;
        }

        /** Specifies an event that fires when cached active dispatch stations updated. */
        export interface ActiveStationsUpdated extends Base<Type.ActiveStationsUpdated> {
            activeStations: LiveData.Station.List;
        }

        /** Specifies an event that fires when cached active trains updated. */
        export interface ActiveTrainsUpdated extends Base<Type.ActiveTrainsUpdated> {
            activeTrains: LiveData.Train.List;
        }

        /** Specifies an event that fires when cached timetable data updated. */
        export interface TimetableUpdated extends Base<Type.TimetableUpdated> {
            timetable: Timetable.Data.List;
        }

    }

    export namespace LiveData {
        export import VMAX        = Core.LiveData.VMAX;
        export import VMAX_VALUE  = Core.LiveData.VMAX_VALUE;
        export import ServerCode  = Core.LiveData.ServerCode;
        export import ApiResponse = Core.LiveData.ApiResponse;
        export import Server      = Core.LiveData.Server;
        export import Train       = Core.LiveData.Train;
        /** Specifies an active dispatch station. */
        export interface Station extends Core.LiveData.Station {
            code: Station.Code;
        }
        export namespace Station {
            export import DifficultyLevel = Core.LiveData.Station.DifficultyLevel;
            export import DispatchedBy    = Core.LiveData.Station.DispatchedBy;
            export import Id              = Core.LiveData.Station.Id;
            export import ImageUrl        = Core.LiveData.Station.ImageUrl;
            export import Latitude        = Core.LiveData.Station.Latitude;
            export import Longitude       = Core.LiveData.Station.Longitude;
            export import Name            = Core.LiveData.Station.Name;
            export import Prefix          = Core.LiveData.Station.Prefix;
            export import Raw             = Core.LiveData.Station.Raw;
            /** Specifies the unique code of the dispatch station. */
            export type Code = string;
            /** Specifies a list of active dispatch stations. */
            export type List = Station[];
        }
    }

    /** Specifies if a cached result can be returned. */
    export type NoCache = boolean;

    /** Specifies the version of the API. */
    export type Version = `${number}.${number}.${number}` | `${number}.${number}.${number}-${string}`;

}

export default Api;

function exception(code: string, message: string): Error {
    const error = Error(message); error.name = code; return error;
}
