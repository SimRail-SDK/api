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
    public readonly events: Api.Event.Emitter;

    /** Specifies the unique code of the server to automatically retrieve data from. */
    public autoUpdateServer?: Api.AutoUpdateServer;

    /** Specifies if live data is updated automatically. */
    public autoUpdate: Api.AutoUpdate;

    constructor(config: Api.Config);

    /**
     * Method to flush all cached active server records.
     *
     * @returns This API instance.
     */
    public flushActiveServerCache(): this;

    /**
     * Method to flush all cached active station records.
     *
     * @returns This API instance.
     */
    public flushActiveStationCache(): this;

    /**
     * Method to flush all cached active train records.
     *
     * @returns This API instance.
     */
    public flushActiveTrainCache(): this;

    /**
     * Method to flush all cached records.
     *
     * @returns This API instance.
     */
    public flushCache(): this;

    /**
     * Method to flush all cached timetable records.
     *
     * @returns This API instance.
     */
    public flushTimetableCache(): this;

    /**
     * Method to retrieve an active server from the live data endpoint.
     *
     * @param serverCode - The unique code of the server.
     * @param noCache    - Prevent returning a cached result.
     * @returns The multiplayer server.
     */
    public getActiveServer(serverCode: Api.LiveData.Server.ServerCode, noCache?: Api.NoCache): Promise<Api.LiveData.Server>;

    /**
     * Method to retrieve active servers from the live data endpoint.
     *
     * @param noCache - Prevent returning a cached result.
     * @returns A list of multiplayer servers.
     */
    public getActiveServers(noCache?: Api.NoCache): Promise<Api.LiveData.Server.List>;

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
    public getActiveStation(serverCode: Api.LiveData.Server.ServerCode, stationCode: Api.LiveData.Station.Prefix, noCache?: Api.NoCache): Promise<Api.LiveData.Station>;

    /**
     * Method to retrieve active dispatch stations from the live data endpoint.
     *
     * @param serverCode - The unique code of the multiplayer server.
     * @param noCache    - Prevent returning a cached result.
     * @returns A list of active dispatch stations.
     */
    public getActiveStations(serverCode: Api.LiveData.Server.ServerCode, noCache?: Api.NoCache): Promise<Api.LiveData.Station.List>;

    /**
     * Method to retrieve an active train from the live data endpoint.
     *
     * @param serverCode   - The code of the related server.
     * @param trainNoLocal - The national number of the train.
     * @param noCache      - Prevent returning a cached result.
     * @returns The active dispatch train.
     */
    public getActiveTrain(serverCode: Api.LiveData.Server.ServerCode, trainNoLocal: Api.LiveData.Train.TrainNoLocal, noCache?: Api.NoCache): Promise<Api.LiveData.Train>;

    /**
     * Method to retrieve active trains from the live data endpoint.
     *
     * @param serverCode - The unique code of the multiplayer server.
     * @param noCache    - Prevent returning a cached result.
     * @returns A list of active trains.
     */
    public getActiveTrains(serverCode: Api.LiveData.Server.ServerCode, noCache?: Api.NoCache): Promise<Api.LiveData.Train.List>;

    /**
     * Method to retrieve timetable data from the timetable endpoint.
     *
     * @param serverCode   - The unique code of the multiplayer server.
     * @param trainNoLocal - The national train number of a train. If left `undefined`, this function will return data for all trains in the timetable.
     */
    public getTimetable(serverCode: Api.Timetable.ServerCode, noCache?: Api.NoCache): Promise<Api.Timetable.Data.List>;
    /**
     * Method to retrieve timetable data from the timetable endpoint.
     *
     * @param serverCode   - The unique code of the multiplayer server.
     * @param trainNoLocal - The national train number of a train. If left `undefined`, this function will return data for all trains in the timetable.
     */
    public getTimetable(serverCode: Api.Timetable.ServerCode, trainNoLocal: Api.Timetable.TrainNoLocal, noCache?: Api.NoCache): Promise<Api.Timetable.Data>;
    /**
     * Method to retrieve timetable data from the timetable endpoint.
     *
     * @param serverCode   - The unique code of the multiplayer server.
     * @param trainNoLocal - The national train number of a train. If left `undefined`, this function will return data for all trains in the timetable.
     */
    public getTimetable(serverCode: Api.Timetable.ServerCode, trainNoOrNoCache?: Api.Timetable.TrainNoLocal, noCache?: Api.NoCache): Promise<Api.Timetable.Data.List | Api.Timetable.Data>;

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
    public startAutoUpdates(autoUpdateServer?: Api.AutoUpdateServer): this;

    /**
     * Method to stop auto updating cached data.
     *
     * @returns This `Api` instance.
     */
    public stopAutoUpdates(): this;

}

export namespace Api {

    /** Specifies the version of the API. */
    export const VERSION: Version;

    export import Core       = ApiCore;
    export import Endpoints  = ApiCore.Endpoints;
    export import Timetable  = ApiCore.Timetable;
    export import ServerCode = ApiCore.LiveData.ServerCode;
    export import Url        = ApiCore.Url;

    /** Specifies the default retention for active server records. */
    export const DEFAULT_ACTIVE_SERVER_RETENTION: Config.LiveData.Cache.ActiveServers.Retention;
    /** Specifies the default retention for active station records. */
    export const DEFAULT_ACTIVE_STATION_RETENTION: Config.LiveData.Cache.ActiveStations.Retention;
    /** Specifies the default retention for active train records. */
    export const DEFAULT_ACTIVE_TRAIN_RETENTION: Config.LiveData.Cache.ActiveTrains.Retention;
    /** Specifies the default retention for timetable records. */
    export const DEFAULT_TIMETABLE_RETENTION: Config.Timetable.Cache.Retention;

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
