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
                config: {
                    ...config,
                    startChunkAt
                },
                dir: this._dir,
            }));
            this._transcoder[idx - 1].start();
            return true;
        }
        return false;
    }

    getUuid() {
        return this._uuid;
    }

    getChunkStores(track) {
        return this._transcoder.map(t => (t.getChunkStores()[track])).filter((e) => (!!e));
    }

    async routeSendChunk(track, id, _, res) {
        // No transcoder found, need to start it
        if (!this._transcoder.length || this._transcoder.some(e => (!e.getChunkStores)))
            return res.status(404).send('404 - Transcoder not initialized');

        // If track don't exist
        if (track < 0 || track >= this._videoStream.length + this._audioStream.length) {
            return res.status(404).send('404 - Track not found');
        }

        // Chunk is ready or will be ready soon
        if (!this._transcoder.some(t => (t.canServeFileSoon(track, id)))) {
            console.log('SEEK REQUIRED', id, track);
            await this.addTranscoder(id);
        }

        // Callback
        const callback = (x) => {
            // Remove other callbacks
            clearTimeout(cancel);

            // Serve file
            this._transcoder.forEach(transcoder => {
                this.getChunkStores(track).forEach((chunkStore) => {
                    chunkStore.waitChunkCancel(id, callback);
                })
                transcoder.sendChunkStream(track, id, res);
            });
        }

        // Timeout
        const cancel = setTimeout(() => {
            this.getChunkStores(track).forEach((chunkStore) => {
                chunkStore.waitChunkCancel(id, callback);
            })
            res.status(404).send('404 - Chunk was\'t generated in time');
        }, 2000);

        // Wait chunk
        this.getChunkStores(track).forEach((chunkStore) => {
            chunkStore.waitChunk(id, callback);
        })
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