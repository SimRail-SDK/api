import Api from "../";

const api = new Api({
    endpoints: {
        liveData: "https://panel.simrail.eu:8084",
        timetable: "https://api1.aws.simrail.eu:8082/api",
    },
});
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
