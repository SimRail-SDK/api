import Api from "../";

const api = new Api({
    endpoints: {
        liveData: "https://panel.simrail.eu:8084",
        timetable: "https://api1.aws.simrail.eu:8082/api",
    },
});

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
