const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');
let mapWidth, mapHeight, pixelizedData, pos, timeIndex = 0, fileNames;

setDimensions();

setInterval(() => {
    setDimensions();
    if (pixelizedData) {
        draw();
        ctx.font = '30px Arial';
        ctx.fillText(JSON.stringify(pixelizedData[timeIndex].dateTime), 50, 50);
    }
    /*if (pos)
        ctx.fillText(JSON.stringify(pos) + '\r\n' + timeIndex, 50, 50);*/

}, 20);

function startTimeMovement() {
    setInterval(() => {
        if (++timeIndex >= pixelizedData.length)
            timeIndex = 0;
    }, 50);
}

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    pos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
});

function setDimensions() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    mapWidth = canvas.width;
    mapHeight = canvas.height;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentTimeData = pixelizedData[timeIndex].data;

    const xExtrema = getExtrema('x', currentTimeData);
    const yExtrema = getExtrema('y', currentTimeData);

    currentTimeData.forEach(station => {
        const coords = getCoords(station, xExtrema, yExtrema);
        const size = station.bikes;
        ctx.fillRect(coords.x - size / 2, mapHeight - (coords.y + size / 2), size, size);
    });
}

fetch('velo-data').then(response => response.json()).then(data => {
    pixelizedData = data.map(dataAtCertainTime => {
        const dateTime = dataAtCertainTime.dateTime;
        const data = dataAtCertainTime.data.map(latLon2Pixel);
        return {dateTime, data};
    });
    startTimeMovement();
});

function getExtrema(what, data) {
    const min = data.reduce((min, curr) => curr[what] < min[what] ? curr : min);
    const max = data.reduce((max, curr) => curr[what] > max[what] ? curr : max);
    return {min, max};
}

function latLon2Pixel(station) {
    const x = (station.lon * mapWidth) / 360;
    const y = (station.lat * mapWidth) / 180;
    return Object.assign(station, {x, y});
}

function getCoords(station, xExtrema, yExtrema) {
    const x = (station.x - xExtrema.min.x) / (xExtrema.max.x - xExtrema.min.x) * mapWidth;
    const y = (station.y - yExtrema.min.y) / (yExtrema.max.y - yExtrema.min.y) * mapHeight;
    return {x, y};
}
