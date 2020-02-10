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

    serveChunk(track, id, res) {
        for (let i = 0; i < this._transcoder.length; i++) {
            if (this._transcoder[i].canServeFileNow(track, id)) {
                this._transcoder[i].sendChunkStream(track, id, res);
                return true;
            }
        }
        return false;
    }

    async routeSendChunk(track, id, _, res) {
        // If track don't exist
        if (track < 0 || track >= this._videoStream.length + this._audioStream.length) {
            return res.status(404).send('404 - Track not found');
        }

        // Detect if we need to seek
        const isSeeking = !this._transcoder.some(t => (t.canServeFileSoon(track, id)))

        console.log(`[API] User is asking for chunk ${id} on track ${track}, isSeeking=${isSeeking}`)
       
        // Start a new transcoder if needed
        if (isSeeking) {
            await this.addTranscoder(id);
        }

        // Callback and retry
        let cancel = false;
        let interval = false;

        // Cancel
        cancel = setTimeout(() => {
            clearInterval(interval);
            clearTimeout(cancel);
            res.status(404).send('404 - Chunk was\'t generated in time');
        }, 10000);

        // Try to serve the file every 50ms
        interval = setInterval(() => {
            if (this.serveChunk(track, id, res)) {
                clearInterval(interval);
                clearTimeout(cancel);
            }
        }, 50)
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

    /*stop() {
        this._transcoder.stop();
    }

    ping() {

    }*/
}