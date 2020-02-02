import { chunkCast } from "../utils";

export default class ChunkStore {

    constructor(startChunkAt = 0) {
        this._availableChunks = [];
        this._callbackChunks = [];
        this._lastChunk = false;
        this._startChunkAt = startChunkAt;
    }

    waitChunk(id, callback) {
        if (this.getChunkStatus(id)) {
            return callback(id);
        }
        this._callbackChunks.push({ id: chunkCast(id, this._startChunkAt), callback });
    }

    waitChunkCancel(id, callback) {
        this._callbackChunks = this._callbackChunks.filter(e => (!(e.id === chunkCast(id, this._startChunkAt) && e.callback === callback)));
    }

    execChunkCallback(id) {
        this._callbackChunks.filter(e => (e.id === chunkCast(id, this._startChunkAt))).forEach((e) => {
            e.callback(chunkCast(id, this._startChunkAt));
        })
        this._callbackChunks = this._callbackChunks.filter(e => (e.id !== chunkCast(id, this._startChunkAt)));
    }

    getChunkStatus(id) {
        return (this._availableChunks.indexOf(chunkCast(id, this._startChunkAt)) !== -1);
    }

    getLastChunkId() {
        return (this._lastChunk);
    }

    setChunkStatus(id, status) {
        if (status === 'IN_PROGRESS') {
            console.log(`Preparing chunk ${chunkCast(id, this._startChunkAt)}...`);
        } else if (status === 'READY') {
            console.log(`Chunk ${chunkCast(id, this._startChunkAt)} is ready!`);
            this.execChunkCallback(chunkCast(id, this._startChunkAt));
            this._availableChunks.push(chunkCast(id, this._startChunkAt));
            if (id !== 'initial') {
                this._lastChunk = chunkCast(id, this._startChunkAt);
            }
        }
    }
}
