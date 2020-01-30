import uuid from 'uuid/v4';
import Transcoder from './ffmpeg/Transcoder';
import StreamingBrain from './StreamingBrain';
import MediaAnalyzer from './analyze/MediaAnalyzer';
import DashManifest from './manifest/Dash'
import HlsManifest from './manifest/Hls'

export default class Session {

    constructor(input = '', videoStream = [], audioStream = [], profileId = 0, compatibilityMap = []) {
        this._uuid = uuid();
        this._dir = `./tmp/session-${this._uuid}/`
        this._streamingBrain = new StreamingBrain(input);
        this._mediaAnalyzer = new MediaAnalyzer(input);
        this._input = input;
        this._profileId = profileId;
        this._videoStream = videoStream;
        this._audioStream = audioStream;
        this._compatibilityMap = compatibilityMap;
        this._transcoder = [];
    }

    async getConfig() {
        const profile = (await this._streamingBrain.getProfile(this._profileId));
        const config = (await this._streamingBrain.takeDecision(this._compatibilityMap, profile, this._videoStream, this._audioStream));
        return config;
    }

    async addTranscoder(startChunkAt = 0) {
        const config = await this.getConfig();
        if (config.protocol === 'HLS' || config.protocol === 'DASH') {
            const idx = this._transcoder.push(new Transcoder({
                ...config,
                startChunkAt,
                dir: this._dir,
            }));
            this._transcoder[idx].start();
            return true;
        }
        return false;
    }

    getUuid() {
        return this._uuid;
    }

    routeSendChunk(track, id, _, res) {
        // No transcoder found, need to start it
        if (!this._transcoder.length || this._transcoder.some(e => (!e.getChunkStores)))
            return res.status(404).send('404 - Transcoder not initialized');

        // If track don't exist
        if (track < 0 || track >= this._videoStream.length + this._audioStream.length) {
            return res.status(404).send('404 - Track not found');
        }

        // Timeout
        const cancel = setTimeout(() => {
            chunkStores.forEach((chunkStore) => {
                chunkStore.waitChunkCancel(id, callback);
            })
            res.status(404).send('404')
        }, 2000);


        const chunkStore = chunkStores[track];

        const callback = (x) => {
            clearTimeout(cancel);
            this._transcoder[0].sendChunkStream(track, id, res);
        }
        chunkStore.waitChunk(id, callback);
    }

    async routeSendDashManifest(_, res) {
        const config = await this.getConfig();
        if (config.protocol === 'DASH') {
            const manifest = (new DashManifest(config)).getManifest();
            manifest.headers.forEach(e => (res.set(e[0], e[1])))
            return res.send(manifest.content);
        }
        return res.status(404).send('404 - It\'s not a DASH session');
    }

    async routeSendHLSMaster(_, res) {
        const config = await this.getConfig();
        if (config.protocol === 'HLS') {
            const manifest = (new HlsManifest(config)).getMaster();
            manifest.headers.forEach(e => (res.set(e[0], e[1])))
            return res.send(manifest.content);
        }
        return res.status(404).send('404 - It\'s not a HLS session');
    }

    async routeSendHLSStream(_, res) {
        const config = await this.getConfig();
        if (config.protocol === 'HLS') {
            const manifest = (new HlsManifest(config)).getStream();
            manifest.headers.forEach(e => (res.set(e[0], e[1])))
            return res.send(manifest.content);
        }
        return res.status(404).send('404 - It\'s not a HLS session');
    }

    async start() {
        const config = await this.getConfig();
        if (config.protocol === 'HLS' || config.protocol === 'DASH') {
            if (!this._transcoder.length) {
                await this.addTranscoder(0);
            }
        }
        return false;
    }

    /*stop() {
        this._transcoder.stop();
    }

    ping() {

    }*/
}