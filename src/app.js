import express from 'express';
import bodyParser from 'body-parser';

import cors from 'cors';
import StreamingBrain from './core/StreamingBrain';
import Session from './core/Session';
import config from './config';

// Init our express app
const app = express();

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status >= 400 && err.status < 500 && err.message.indexOf('JSON'))
        return res.status(400).send({ error: { code: 'INVALID_DATA', message: 'Syntax error in the JSON body' } });
    return next();
});

// CORS
app.use(cors());

let SessionsArray = {}

app.post('/media/analyze', async (req, res) => {
    const input = req.body.url;
    if (!req.body.url)
        return res.status(404).send('url not found in body');
    const sb = new StreamingBrain(input);
    res.send({
        profiles: await sb.getProfiles(),
        tracks: await sb.getTracks()
    });
})

app.post('/session', async (req, res) => {

    // Todo verify value and check profile / video/audio
    if (typeof (req.body.url) === 'undefined')
        return res.status(400).send('url not found in body');
    if (typeof (req.body.profile) === 'undefined')
        return res.status(400).send('profile not found in body');
    if (typeof (req.body.video) === 'undefined' && typeof (req.body.audio) === 'undefined')
        return res.status(400).send('video and/or audio not found in body');
    if (typeof (req.body.supported) === 'undefined')
        return res.status(400).send('supported not found in body');
    const profileId = parseInt(req.body.profile, 10);
    const session = new Session(req.body.url, (typeof (req.body.video) === 'undefined') ? [] : [req.body.video], (typeof (req.body.audio) === 'undefined') ? [] : [req.body.audio], profileId, req.body.supported);
    session.start();
    SessionsArray[session.getUuid()] = session;
    const streamingConfig = await session.getConfig()
    if (['DASH', 'HLS', 'DOWNLOAD'].includes(streamingConfig.protocol)) {
        res.send({
            session: {
                uuid: session.getUuid(),
                stream: {
                    type: streamingConfig.protocol,
                    url: (streamingConfig.protocol === 'DOWNLOAD') ? req.body.url : `${config.server.public}session/${session.getUuid()}/${(streamingConfig.protocol === 'HLS') ? 'hls/master.m3u8' : 'dash/manifest.mpd'}`
                }
            }
        });
    } else {
        res.send('ERROR')
    }
});

app.get('/session/:sessionid/dash/manifest.mpd', (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('Session not found');
    session.routeSendDashManifest(req, res);
})

app.get('/session/:sessionid/dash/:track/initial.*', async (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('Session not found');
    await session.routeSendChunk(req.params.track, 'initial', req, res);
});

app.get('/session/:sessionid/dash/:track/:id.*', async (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('Session not found');
    await session.routeSendChunk(req.params.track, parseInt(req.params.id, 10) + 1, req, res);
});

app.get('/session/:sessionid/hls/master.m3u8', (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('Session not found');
    session.routeSendHLSMaster(req, res);
})

app.get('/session/:sessionid/hls/stream.m3u8', (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('Session not found');
    session.routeSendHLSStream(req, res);
});

app.get('/session/:sessionid/hls/:track/:id.ts', async (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('Session not found');
    await session.routeSendChunk(req.params.track, req.params.id, req, res);
});

// Front demo
app.use('/', express.static('public/web'));

// Bind and start
const server = app.listen(config.server.port);

// Catch SIGTERM and SIGKILL
['SIGTERM', 'SIGKILL'].forEach(signal => {
    process.on(signal, () => {
        process.exit(0);
        server.close(() => {
            process.exit(0);
        });
    });
});
console.log(`API was launched on port ${config.server.port}. Try the demo on ${config.server.public}`);
