import { chunkCast, intCast } from "../utils";

export default class ChunkStore {

    constructor(startChunkAt = 0) {
        this._availableChunks = [];
        this._callbackChunks = [];
        this._lastChunk = intCast(startChunkAt);
    }

    getChunkStatus(id) {
        return (this._availableChunks.indexOf(chunkCast(id)) !== -1);
    }

    export() {
        return JSON.stringify(this._availableChunks);
    }

    getLastChunkId() {
        return (this._lastChunk);
    }

    setChunkStatus(id, status) {
        if (status === 'IN_PROGRESS') {
            // console.log(`Preparing chunk ${chunkCast(id)}...(start=${this._startChunkAt})`);
        } else if (status === 'READY') {
            // console.log(`Chunk ${chunkCast(id)} is ready! (start=${this._startChunkAt})`);
            this._availableChunks.push(chunkCast(id));
            if (id !== 'initial') {
                this._lastChunk = chunkCast(id);
            }
        }
    }
}
