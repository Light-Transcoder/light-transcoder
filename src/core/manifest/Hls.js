import {getNbChunks} from '../../utils';

export default class Hls {

    constructor({
        chunkDuration = 1,
        duration = 0,
    }) {
        this._duration = duration;
        this._chunkDuration = chunkDuration;
        this._nbChunks = getNbChunks(this._duration, this._chunkDuration);
    }

    getStream() {
        const lastDuration = this._duration - ((this._nbChunks - 1) * this._chunkDuration);
        return {
            headers: [['content-type', 'application/x-mpegURL']],
            content: [
                '#EXTM3U',
                '#EXT-X-PLAYLIST-TYPE:VOD',
                '#EXT-X-VERSION:3',
                `#EXT-X-TARGETDURATION:${this._chunkDuration}`,
                '#EXT-X-ALLOW-CACHE:YES',
                '#EXT-X-MEDIA-SEQUENCE:0',
                '#EXT-X-PLAYLIST-TYPE:EVENT',
                ...Array(this._nbChunks).fill(true).reduce((acc, _, i) => ([
                    ...acc,
                    `#EXTINF:${(i === this._nbChunks - 1) ? lastDuration : this._chunkDuration}, nodesc`,
                    `0/${i}.ts`
                ]), []),
                '#EXT-X-ENDLIST'
            ].join('\n')
        }
    }

    getMaster() {
        return {
            headers: [['content-type', 'application/x-mpegURL']],
            content: [
                '#EXTM3U',
                '#EXT-X-VERSION:3',
                '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=300000', // TODO BIND BANDWIDTH
                'stream.m3u8'
            ].join('\n')
        }
    }
}