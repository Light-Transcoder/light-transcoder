import { chunkCast } from "../utils";

export default class ChunkStore {

    constructor() {
        this._availableChunks = [];
        this._callbackChunks = [];
    }

    waitChunk(id, callback) {
        if (this.getChunkStatus(id)) {
            return callback(id);
        }
        this._callbackChunks.push({ id: chunkCast(id), callback });
    }

    waitChunkCancel(id, callback) {
        this._callbackChunks = this._callbackChunks.filter(e => (!(e.id === chunkCast(id) && e.callback === callback)));
    }

    execChunkCallback(id) {
        this._callbackChunks.filter(e => (e.id === chunkCast(id))).forEach((e) => {
            e.callback(chunkCast(id));
        })
        this._callbackChunks = this._callbackChunks.filter(e => (e.id !== chunkCast(id)));
    }

    getChunkStatus(id) {
        return (this._availableChunks.indexOf(chunkCast(id)) !== -1);
    }

    setChunkStatus(id, status) {
        if (status === 'IN_PROGRESS') {
            console.log(`Preparing chunk ${id}...`);
        } else if (status === 'READY') {
            console.log(`Chunk ${id} is ready!`);
            this.execChunkCallback(id);
            this._availableChunks.push(id);
        }
    }
}
