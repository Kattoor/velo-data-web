const http = require('http');

const fs = require('fs');
http.createServer((req, res) => {
    if (req.url === '/')
        res.end(fs.readFileSync('./index.html'));
    if (req.url === '/renderer.js')
        res.end(fs.readFileSync('./renderer.js'));
    if (req.url === '/velo-data') {
        const path = '~/velo-data-gatherer';
        fs.readdir(path, (err, files) => {
            const data = files.filter(fileName => fileName.indexOf('velo-data-') === 0).reduce((cumulative, current) => {
                cumulative.push({dateTime: current.substr(current.indexOf('velo-data-') + 10, current.length - 10), data: JSON.parse(fs.readFileSync(path + '\\' + current))});
                return cumulative;
            }, []);
            res.end(JSON.stringify(data));
        });
    }
    else
        res.end('');
}).listen(4040);
//[{dateTime: x, data: []}, {dateTime: y, data: []}, ...]
