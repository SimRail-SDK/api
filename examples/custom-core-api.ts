import Api from "../";
import Core from "@simrail-sdk/api-core-node";

const endpoints: Api.Endpoints = {
    liveData: "https://panel.simrail.eu:8084",
    timetable: "https://api1.aws.simrail.eu:8082/api",
};

// By default the API will use the Core API class from package `@simrail-sdk/api-core-node`.
// To provide another Core API class or a custom one, just include the instance in the API config.
const core = new Core({ endpoints });
const api = new Api({ core });
