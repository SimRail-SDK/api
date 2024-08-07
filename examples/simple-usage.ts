import Api from "../";

const api = new Api({
    endpoints: {
        liveData: "https://panel.simrail.eu:8084",
        timetable: "https://api1.aws.simrail.eu:8082/api",
    },
});
const serverCode: Api.ServerCode = "en1";

api.getActiveServers().then(console.log);
api.getActiveServer(serverCode).then(console.log);
// {
//     id: "638fec40d089346098624eb5",
//     isActive: true,
//     serverCode: "en1",
//     serverName: "EN1 (English)",
//     serverRegion: "Europe",
// },

api.getActiveStations(serverCode).then(console.log);
api.getActiveStation(serverCode, "KO").then(console.log);
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

api.getActiveTrains(serverCode).then(console.log);
api.getActiveTrain(serverCode, "446004").then(console.log);
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

api.getTimetable(serverCode).then(console.log);
api.getTimetable(serverCode, "446004").then(console.log);
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
