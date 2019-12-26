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

    // Todo verify value and check profile / video/audio/protocol

    if (!req.body.url)
        return res.status(404).send('url not found in body');
    if (!req.body.profile)
        return res.status(404).send('profile not found in body');
    if (!req.body.protocol)
        return res.status(404).send('protocol not found in body');
    if (!req.body.video)
        return res.status(404).send('video not found in body');
    if (!req.body.audio)
        return res.status(404).send('audio not found in body');
    const profileId = parseInt(req.body.profile, 10);
    const input = req.body.url;
    const session = new Session(req.body.protocol, input, req.body.video, req.body.audio, profileId);
    session.start();
    SessionsArray[session.getUuid()] = session;
    if (req.body.protocol === 'HLS' || req.body.protocol === 'DASH') {
        res.send({
            session: {
                uuid: session.getUuid(),
                stream: {
                    type: req.body.protocol,
                    url: `${config.server.public}session/${session.getUuid()}/${(req.body.protocol === 'HLS') ? 'hls/master.m3u8' : 'dash/manifest.mpd'}`
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
        return res.status(404).send('404');
    session.routeSendDashManifest(req, res);
})

app.get('/session/:sessionid/dash/:track/:id.m4s', (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('404');
    session.routeSendChunk(req.params.track, parseInt(req.params.id, 10) + 1, req, res);
});

app.get('/session/:sessionid/dash/:track/initial.mp4', (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('404');
    session.routeSendChunk(req.params.track, 'initial', req, res);
});

app.get('/session/:sessionid/hls/master.m3u8', (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('404');
    session.routeSendHLSMaster(req, res);
})

app.get('/session/:sessionid/hls/stream.m3u8', (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('404');
    session.routeSendHLSStream(req, res);
});

app.get('/session/:sessionid/hls/:track/:id.ts', (req, res) => {
    const session = SessionsArray[req.params.sessionid];
    if (!session)
        return res.status(404).send('404');
    session.routeSendChunk(req.params.track, req.params.id, req, res);
});

app.use('/demo', express.static('public'));

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
console.log(`API was launched on port ${config.server.port}. Try the demo on ${config.server.public}demo/`);
