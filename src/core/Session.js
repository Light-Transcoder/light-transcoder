import uuid from 'uuid/v4';
import FFmpeg from './FFmpeg';

export default class Session {

    constructor(protocol = 'HLS', input = '', videoStream = '0:v:0', audioStream = '0:a:0', streamingBrain = false, profileId = 0) {
        this._uuid = uuid();
        this._dir = `./tmp/session-${this._uuid}/`
        this._streamingBrain = streamingBrain;
        this._input = input;
        this._profileId = profileId;
        this._videoStream = videoStream;
        this._audioStream = audioStream;
        this._protocol = protocol;
        this._ffmpeg = false;
        this._transcoders = [];
    }

    async initFFmpeg() {
        const meta = await this._streamingBrain.getMeta();
        const profile = (await this._streamingBrain.getProfiles())[this._profileId];
        console.log(profile);
        this._ffmpeg = new FFmpeg({
            input: this._input,
            meta,
            profile,
            videoStream: this._videoStream,
            videoStreamCopy: profile.directStreamVideo,
            audioStream: this._audioStream,
            audioStreamCopy: profile.directStreamAudio,
            protocol: this._protocol,
            dir: this._dir,
        });
    }

    getUuid() {
        return this._uuid;
    }

    routeSendChunk(track, id, req, res) {
        const chunkStores = this._ffmpeg.getChunkStores();
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
            this._ffmpeg.sendChunkStream(track, id, res);
        }
        chunkStore.waitChunk(id, callback);
    }

    async routeSendDashManifest(req, res) {
        if (!this._ffmpeg)
            await this.initFFmpeg();
        res.set('content-type', 'text/html; charset=utf-8');
        res.send(this._ffmpeg.getDashManifest());
    }

    async routeSendHLSMaster(req, res) {
        if (!this._ffmpeg)
            await this.initFFmpeg();
        res.set('content-type', 'application/x-mpegURL');
        res.send(this._ffmpeg.getHLSMaster())
    }

    async routeSendHLSStream(req, res) {
        if (!this._ffmpeg)
            await this.initFFmpeg();
        res.set('content-type', 'application/x-mpegURL');
        res.send(this._ffmpeg.getHLSStream());
    }

    async start() {
        if (!this._ffmpeg)
            await this.initFFmpeg();
        this._ffmpeg.start();
    }

    stop() {
        this._ffmpeg.stop();
    }

    ping() {

    }
}