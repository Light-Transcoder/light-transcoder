import { chunkCast, intCast } from '../../utils';

export default class FFmpegLogParser {

    constructor({
        protocol = 'HLS',
        onChunkStart = (track, id) => { },
        onChunkReady = (track, id) => { },
        onStats = () => { },
    }) {
        this._protocol = protocol;
        this._onChunkStart = onChunkStart;
        this._onChunkReady = onChunkReady;
        this._onStats = onStats;

        this._currentChunks = {};

        this.buffer = '';
    }

    parse(data) {
        this.buffer += data;
        while (this.buffer.indexOf('\n') !== -1) {
            const endline = this.buffer.indexOf('\n');
            const line = this.buffer.slice(0, endline + 1);
            this._parseLine(line);
            this.buffer = this.buffer.slice(endline + 1);
        }
    }

    _parseLine(data) {
        // ------------------------------ //
        //               HLS              //
        // ------------------------------ //
        if (this._protocol === 'HLS') {
            if (data.includes('Opening') && data.includes('.m3u8')) { // Manifest update (Previous chunk is ready)
                this._onChunkReady(0, chunkCast(this._currentChunks[0]));
            }
            else if (data.includes('Opening') && data.includes('.ts')) { // Writing chunk started
                const parsed = (/(.*)hls([0-9]+).ts(.*)/gm).exec(data);
                if (parsed.length === 4) {
                    const id = chunkCast(parsed[2]);
                    this._currentChunks[0] = id;
                    this._onChunkStart(0, chunkCast(parsed[2]));
                }
            }
        }

        // ------------------------------ //
        //               DASH             //
        // ------------------------------ //
        if (this._protocol === 'DASH') {
            if (data.includes('manifest.mpd')) { // Manifest update (Previous chunks are ready)
                Object.keys(this._currentChunks).map((k) => {
                    if (this._currentChunks[k] !== 'initial')
                        this._onChunkReady(intCast(k), chunkCast(this._currentChunks[k]));
                });
            }
            else if (data.includes('Opening') && data.includes('chunk-stream')) {
                const parsed = (/(.*)chunk-stream([0-9]+)-([0-9]+).(.*)/gm).exec(data);
                if (parsed.length === 5) {
                    const track = intCast(parsed[2]);
                    const id = chunkCast(parsed[3]);

                    // If we need to send an initial, we can do it because a chunk is ready
                    if (this._currentChunks[track] === 'initial')
                        this._onChunkReady(track, chunkCast('initial'));
                    
                    this._currentChunks[track] = id;
                    this._onChunkStart(track, id);
                }
            }
            else if (data.includes('Opening') && data.includes('init-stream')) { // Writing init started
                const parsed = (/(.*)init-stream([0-9]+).(.*)/gm).exec(data);
                if (parsed.length === 4) {
                    const track = parseInt(parsed[2], 10);
                    this._currentChunks[track] = 'initial';
                    this._onChunkStart(track, 'initial');
                }
            }
        }

        // ------------------------------ //
        //              STATS             //
        // ------------------------------ //
        if (data.includes('frame=')) { // Stats event
            // console.log('STATS', data);
            this._onStats(data);
        }

        //console.log(data)
    }
}