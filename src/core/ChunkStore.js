export default class ChunkStore {

    constructor() {
        this._currentProcessingChunk = false;
        this._availableChunks = [];
        this._callbackChunks = [];
    }

    waitChunk(id, callback) {
        if (this.getChunkStatus(id)) {
            return callback(id);
        }
        this._callbackChunks.push({ id: parseInt(id, 10), callback });
    }

    waitChunkCancel(id, callback) {
        this._callbackChunks = this._callbackChunks.filter(e => (!(e.id === parseInt(id, 10) && e.callback === callback)));
    }

    execChunkCallback(id) {
        this._callbackChunks.filter(e => (e.id === parseInt(id, 10))).forEach((e) => {
            e.callback(parseInt(id, 10));
        })
        this._callbackChunks = this._callbackChunks.filter(e => (e.id !== parseInt(id, 10)));
    }

    getChunkStatus(id) {
        return (this._availableChunks.indexOf(parseInt(id, 10)) !== -1);
    }

    getCurrentChunkId() {
        return (this._currentProcessingChunk);
    }

    setCurrentChunk(id) {
        this._currentProcessingChunk = parseInt(id, 10);
    }

    setCurrentChunkReady() {
        if (this._currentProcessingChunk !== false) {
            console.log(`Chunk ${this._currentProcessingChunk} is ready!`);
            this.execChunkCallback(this._currentProcessingChunk);
            this._availableChunks.push(this._currentProcessingChunk);
            this._currentProcessingChunk = false;
        }
    }
}
