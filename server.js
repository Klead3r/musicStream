const express = require('express')
const app = express()
const fs = require('fs')

app.use('/js',express.static(__dirname + '/client/js'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
})

app.get('/songs', (req, res) => {
    var files = fs.readdirSync('music/');
    res.send({songs: files});
});

app.post('/dlYt/:id', (req, res) => {
    const query = req.params
    var arg = query.id
    var YoutubeMp3Downloader = require('youtube-mp3-downloader')
    var YD = new YoutubeMp3Downloader ({
        'ffmpegPath': process.platform === 'win32' ? 'ffmpeg/bin/ffmpeg.exe' : 'ffmpeg/bin/ffmpeg', // Where is the FFmpeg binary located?
        'outputPath': 'music', // Where should the downloaded and encoded files be stored?
        'youtubeVideoQuality': 'highest', // What video quality should be used?
        'queueParallelism': 2, // How many parallel downloads/encodes should be started?
        'progressTimeout': 2000 // How long should be the interval of the progress reports
    })
    //Download video and save as MP3 file
    YD.download(arg)
    YD.on('finished', function(err, data) {
        console.log(JSON.stringify(data));
        res.send({status: 'finished'});
    })
    YD.on('error', function(error) {
        console.log(error);
        res.send({status: error});
    })
    YD.on('progress', function(progress) {
        console.log(JSON.stringify(progress));
    })
})

app.get('/play/:name', function(req, res) {
    const query = req.params
    const path = 'music/'+query.name
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
        
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize-1
        
        const chunksize = (end-start)+1
        const file = fs.createReadStream(path, {start, end})
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp3',
        }
        
        res.writeHead(206, head)
        file.pipe(res)
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp3',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
})

app.listen(8080, function () {
    console.log('App is running on port 8080')
})