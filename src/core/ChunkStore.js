export default class ChunkStore {

    constructor() {
        this._currentProcessingChunk = false;
        this._availableChunks = [];
        this._callbackChunks = [];
    }

    _parseChunkId(id) {
        return (id === 'initial' ? 'initial' : parseInt(id, 10));
    }

    waitChunk(id, callback) {
        if (this.getChunkStatus(id)) {
            return callback(id);
        }
        this._callbackChunks.push({ id: this._parseChunkId(id), callback });
    }

    waitChunkCancel(id, callback) {
        this._callbackChunks = this._callbackChunks.filter(e => (!(e.id === this._parseChunkId(id) && e.callback === callback)));
    }

    execChunkCallback(id) {
        this._callbackChunks.filter(e => (e.id === this._parseChunkId(id))).forEach((e) => {
            e.callback(this._parseChunkId(id));
        })
        this._callbackChunks = this._callbackChunks.filter(e => (e.id !== this._parseChunkId(id)));
    }

    getChunkStatus(id) {
        return (this._availableChunks.indexOf(this._parseChunkId(id)) !== -1);
    }

    getCurrentChunkId() {
        return (this._currentProcessingChunk);
    }

    setCurrentChunk(id) {
        this._currentProcessingChunk = this._parseChunkId(id);
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
