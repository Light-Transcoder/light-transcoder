import uuid from 'uuid/v4';
import Transcoder from './ffmpeg/Transcoder';
import StreamingBrain from './StreamingBrain';
import MediaAnalyzer from './analyze/MediaAnalyzer';
import config from '../config';
import DashManifest from './manifest/Dash'
import HlsManifest from './manifest/Hls'

export default class Session {

    constructor(protocol = 'HLS', input = '', videoStream = '0:v:0', audioStream = '0:a:0', profileId = 0) {
        this._uuid = uuid();
        this._dir = `./tmp/session-${this._uuid}/`
        this._streamingBrain = new StreamingBrain(input);
        this._mediaAnalyzer = new MediaAnalyzer(input);
        this._input = input;
        this._profileId = profileId;
        this._videoStream = videoStream;
        this._audioStream = audioStream;
        this._protocol = protocol;
        this._transcoder = false;
    }

    async initTranscoder() {
        const profile = (await this._streamingBrain.getProfile(this._profileId));
        const config = (await this._streamingBrain.takeDecision('', profile));
        this._transcoder = new Transcoder({
            config,
            dir: this._dir,
        });
        return true;
    }

    getUuid() {
        return this._uuid;
    }

    routeSendChunk(track, id, _, res) {
        if (!this._transcoder.getChunkStores)
            return res.status(404).send('404');
        const chunkStores = this._transcoder.getChunkStores();
        if (!chunkStores[track]) {
            return res.status(404).send('404');
        }
        const chunkStore = chunkStores[track];
        const cancel = setTimeout(() => {
            chunkStore.waitChunkCancel(id, callback);
            res.status(404).send('404')
        }, 10000);
        const callback = (x) => {
            clearTimeout(cancel);
            console.log('callback', x)
            this._transcoder.sendChunkStream(track, id, res);
        }
        chunkStore.waitChunk(id, callback);
    }

    async routeSendDashManifest(_, res) {
        const duration = await this._mediaAnalyzer.getDuration();
        const manifest = (new DashManifest({ duration, chunkDuration: config.transcode.chunkDuration })).getManifest();
        manifest.headers.forEach(e => (res.set(e[0], e[1])))
        return res.send(manifest.content);
    }

    async routeSendHLSMaster(_, res) {
        const duration = await this._mediaAnalyzer.getDuration();
        const manifest = (new HlsManifest({ duration, chunkDuration: config.transcode.chunkDuration })).getMaster();
        manifest.headers.forEach(e => (res.set(e[0], e[1])))
        return res.send(manifest.content);
    }

    async routeSendHLSStream(_, res) {
        const duration = await this._mediaAnalyzer.getDuration();
        const manifest = (new HlsManifest({ duration, chunkDuration: config.transcode.chunkDuration })).getStream();
        manifest.headers.forEach(e => (res.set(e[0], e[1])))
        return res.send(manifest.content);
    }

    async start() {
        if (!this._transcoder)
            await this.initTranscoder();
        return this._transcoder.start();
    }

    stop() {
        this._transcoder.stop();
    }

    ping() {

    }
}