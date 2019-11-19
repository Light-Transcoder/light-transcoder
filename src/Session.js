import uuid from 'uuid/v4';
import mkdirp from 'mkdirp';
import ffmpeg from 'ffmpeg-static';
import { createReadStream, stat } from 'fs';

import exec from './exec';

export default class Session {

    constructor(mediaAnalyzer = false, streamingBrain = false) {
        this._uuid = uuid();
        this._dir = false;
        this._streamingBrain = streamingBrain;
        this._mediaAnalyzer = mediaAnalyzer;
        this._transcoders = [];
    }

    getUuid() {
        return this._uuid;
    }

    getChunkStatus(id) {

    }

    setChunkStatus() {

    }

    routeSendChunk(chunkId, req, res) {
        try {
            const path = `${this._dir}hls${chunkId}.ts`;
            console.log(path)
            //stat(path, (err, stats) => {
                //if (!err) {
                    //const stream = createReadStream(path);
                    //stream.pipe(res);
                    return setTimeout(() => {
                       // res.sendFile(path); 
                       console.log('serve')
                        const stream = createReadStream(path);
                        stream.pipe(res);
                    }, 2500) // TODO rework
               // }
                //else {
                   // console.error('skip');
                  //  res.status(404).send('404')
               // }
            //})

        } catch (e) {
            //console.error('skip');
            res.status(404).send('404')
        }
    }

    routeSendHLSMaster(req, res) {
        res.set('content-type', 'application/x-mpegURL');
        res.send(this._streamingBrain.getHLSMaster())
    }

    routeSendHLSStream(req, res) {
        res.set('content-type', 'application/x-mpegURL');
        res.send(this._streamingBrain.getHLSStream());
    }

    start() {
        const id = uuid();
        this._dir = `./tmp/session-${this._uuid}/transcoder-${id}/`;
        mkdirp(this._dir, (err) => {
            if (!err)
                exec(ffmpeg.path, this._streamingBrain.getCommand(), this._dir)
        })
    }

    stop() {

    }

    ping() {

    }
}