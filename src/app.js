import express from 'express';
import ffmpeg from 'ffmpeg-static';
import uuid from 'uuid/v4';
import mkdirp from 'mkdirp';
import cors from 'cors';
import exec from './exec';
import StreamingBrain from './streamingBrain';
import { createReadStream, read } from 'fs';

const id = uuid();
const dir = `./tmp/${id}/`;
mkdirp(dir)


const stream = new StreamingBrain();

stream.setInput('../../test.mkv');


setTimeout(() => {
    exec(ffmpeg.path, stream.getCommand(), dir)
}, 1000)


// Init our express app
const app = express();

const url = 'http://localhost:8585/'

// CORS
app.use(cors());

// Routes

app.get('/master.m3u8', (req, res) => {
    res.set('content-type', 'application/x-mpegURL');
    res.send(stream.getHLSMaster())
});


app.get('/hls.m3u8', (req, res) => {
    res.set('content-type', 'application/x-mpegURL');
    res.send(stream.getHLSStream());
});

app.get('/:id.ts', (req, res) => {
    try {
        const path = dir + 'hls' + req.params.id + '.ts';
        const stream = createReadStream(path);
        stream.pipe(res);
    } catch (e) {
        console.error(e);
        res.status(404).send('error')
    }
})

// Bind and start
const server = app.listen(8585);

// Catch SIGTERM and SIGKILL
['SIGTERM', 'SIGKILL'].forEach(signal => {
    process.on(signal, () => {
        server.close(() => {
            process.exit(0);
        });
    });
});
console.log(`API was launched on port 8585`);
