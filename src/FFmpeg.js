import uuid from 'uuid/v4';
import mkdirp from 'mkdirp'
import ffmpeg from 'ffmpeg-static';
import { createReadStream, stat } from 'fs';
import { execFile } from 'child_process';

export default class FFmpeg {

    constructor({
        input = '',
        meta = false,
        profile = false,
        videoStream = '0:v:0',
        audioStream = '0:a:0',
        protocol = 'HLS',
        dir = './',
    }) {
        this._uuid = uuid();
        this._input = input;
        this._meta = meta;
        this._inputVideoStream = videoStream;
        this._inputAudioStream = audioStream;

        console.log( this._inputVideoStream,  this._inputAudioStream)
        this._protocol = protocol;
        this._chunkDuration = 5;
        this._videoDirectStream = false // If true we use "copy"
        this._audioDirectStream = false // If true we use "copy"
        this._analyseDuration = 20000000;
        this._outputFPS = 23.975999999999999;
        this._useAdaptativePreset = true;
        this._startAt = parseInt(0, 10); // In seconds
        this._duration = (meta && meta.global.duration) ? meta.global.duration : 60 * 60 * 2; // Fallback to 2h if not available
        this._debug = true;
        this._profile = profile;
        this._dir = `${dir}transcoder-${this._uuid}/`;
        this._currentProcessingChunk = false;
        this._availableChunks = []
    }

    setInput(value) {
        this._input = value;
    }

    getCommand() {
        if (this._input === '')
            return;

        // Args
        const args = [];

        // Transcode profile
        const profile = this._profile;
        // Limit the maximum profile based on original file information

        // Load input
        args.push( /*"-codec:0", "vc1", "-codec:1", "ac3",*/)

        args.push('-ss', this._startAt, '-noaccurate_seek') // Personnal note: I didn't understand why/when -noaccurate_seek is added, sometimes on Plex, always on Emby

        args.push("-analyzeduration", this._analyseDuration, "-probesize", this._analyseDuration, "-i", this._input);

        // Init filters and stream inputs
        let videoStream = this._inputVideoStream;
        let audioStream = this._inputAudioStream;
        let videoFilters = [];
        let audioFilters = [];

        // Scale feature
        if (!this._videoDirectStream) {
            videoFilters.push(
                `[${videoStream}]scale=w=-2:h=${profile.height}[scale]`
            );
            videoStream = 'scale';
            videoFilters.push(
                `[${videoStream}]format=pix_fmts=yuv420p|nv12[format]`
            );
            videoStream = 'format';

            // Todo: interlated content + rescale = KO
            // Todo: HDR content + transcode => Tonemapping required
            // Todo: Check rotated videos
        }

        // Push all the video filters
        args.push(...(videoFilters.length) ? ["-filter_complex", videoFilters.join(';')] : [])

        // Audio filter (Switch to stereo)
        if (!this._audioDirectStream) {
            audioFilters.push(
                `[${audioStream}]aresample=async=1:ocl='stereo':osr=48000[aresample]`
            );
            audioStream = 'aresample';
        }

        // Push all the audio filters
        args.push(...(audioFilters.length) ? ["-filter_complex", audioFilters.join(';')] : [])

        // Map video stream
        args.push(
            "-map",
            (videoStream.indexOf(':') === -1 ? `[${videoStream}]` : videoStream)
        );

        // Video stream output codecs
        if (this._videoDirectStream) {
            args.push(
                "-codec:0",
                'copy',
                // Maybe remove the next 4 lines, they limit the FFMPEG progress (and it's not useful on direct stream) or we need to use original bitrate
                "-maxrate:0",
                `${profile.videoBitrate}k`,
                "-bufsize:0",
                `${2 * profile.videoBitrate}k`,
                "-force_key_frames:0",
                `expr:gte(t,${this._startAt === 0 ? '' : `${this._startAt}+`}n_forced*${this._chunkDuration})`
            )
        } else {
            args.push(
                "-codec:0",
                "libx264",
                "-crf:0",
                profile.x264crf,
                "-maxrate:0",
                `${profile.videoBitrate}k`,
                "-bufsize:0",
                `${2 * profile.videoBitrate}k`,
                "-r:0", this._outputFPS,
                "-preset:0",
                ((this._useAdaptativePreset) ? profile.x264preset : 'ultrafast'),
                "-x264opts:0",
                `subme=${profile.x264subme}:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none`,
                "-force_key_frames:0",
                `expr:gte(t,${this._startAt === 0 ? '' : `${this._startAt}+`}n_forced*${this._chunkDuration})`
            );
        }

        // Map audio stream
        args.push("-map", (audioStream.indexOf(':') === -1 ? `[${audioStream}]` : audioStream));

        // Audio codec settings
        if (this._audioDirectStream) {
            args.push(
                "-codec:1",
                "copy"
            );
        } else {
            args.push(
                "-codec:1",
                "aac",
                "-b:1",
                `${profile.audioBitrate}k`
            );
        }

        if (this._protocol === 'HLS')
            args.push(
                '-f',
                'hls',
                '-hls_time',
                this._chunkDuration,
                '-hls_flags', 'split_by_time',
                '-hls_playlist_type',
                'event',
                `hls.m3u8`
            ); // HLS
        else if (this._protocol === 'DASH') {
            args.push(
                "-f",
                "dash",
                "-seg_duration",
                "8",
                /*"-init_seg_name",
                "init-stream$RepresentationID$.m4s",
                "-media_seg_name",
                "chunk-stream$RepresentationID$-$Number%05d$.m4s",*/
                "-skip_to_segment",
                "1",
                "-time_delta",
                "0.0625",
                "-manifest_name",
                "manifest.mpd",
                "-avoid_negative_ts",
                "disabled",
                "-map_metadata",
                "-1",
                "-map_chapters",
                "-1",
                "dash",
            ); // Dash
        }
        else if (this._protocol === 'LP') {
            // Long polling
        }
        else if (this._protocol === 'EXPORT') {
            // Export in a single file (media sync) => Maybe bundle subs and use mkv ?
        }

        args.push(
            "-start_at_zero",
            "-copyts",
            ...((this._startAt === 0) ? [
                "-vsync",
                "cfr"
            ] : [])
        )

        // Debug off
        if (this._debug)
            args.push(
                "-loglevel",
                "verbose",
                // "-loglevel_plex", // Plex related flag
                // "error",// Plex related flag
            )
        else
            args.push(
                "-nostats",
                "-loglevel",
                "quiet",
                // "-loglevel_plex", // Plex related flag
                // "error",// Plex related flag
            )

        // Progress URL
        /*args.push(
            "-progressurl",
            "{INTERNAL_TRANSCODER}video/:/transcode/session/q9zljdon5bcpoq6q0jm04cyr/18d5783e-25d1-48af-a083-9fc7fc9081bd/progress"
        )*/

        // Overwrite files
        args.push('-y');

        // Returns args
        return args;
    }

    getNbChunks() {
        return Math.ceil(this._duration / this._chunkDuration);
    }

    sendChunkStream(id, res) {
        return new Promise((resolve, reject) => {
            const path = `${this._dir}hls${id}.ts`;
            console.log('Asking chunk', id, path);
            stat(path, (err) => {
                if (err)
                    return reject(err);
                const stream = createReadStream(path);
                stream.pipe(res);
                stream.on('finish', () => { return resolve(id) });
                stream.on('error', (err) => { return reject(id, err) });
            });
        });
    }

    getChunkStatus(id) {
        return (this._availableChunks.indexOf(parseInt(id, 10)) !== -1);
    }

    getCurrentChunkId() {
        return (this._currentProcessingChunk);
    }

    getHLSStream() {
        const lastDuration = this._duration - ((this.getNbChunks() - 1) * this._chunkDuration);
        return [
            '#EXTM3U',
            '#EXT-X-PLAYLIST-TYPE:VOD',
            '#EXT-X-VERSION:3',
            `#EXT-X-TARGETDURATION:${this._chunkDuration}`,
            '#EXT-X-ALLOW-CACHE:YES',
            '#EXT-X-MEDIA-SEQUENCE:0',
            '#EXT-X-PLAYLIST-TYPE:EVENT',
            ...Array(this.getNbChunks()).fill(true).reduce((acc, _, i) => ([
                ...acc,
                `#EXTINF:${(i === this.getNbChunks() - 1) ? lastDuration : this._chunkDuration}, nodesc`,
                `${i}.ts`
            ]), []),
            '#EXT-X-ENDLIST'
        ].join('\n');
    }

    getHLSMaster() {
        return [
            '#EXTM3U',
            '#EXT-X-VERSION:3',
            '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=300000', // TODO BIND BANDWIDTH
            'stream.m3u8'
        ].join('\n');
    }

    start() {

        mkdirp(this._dir, (err) => {
            if (err)
                return;
            const binary = ffmpeg.path;
            const args = this.getCommand();
            const exec = execFile(binary, [...args], { cwd: this._dir });
            let stdout = '';
            let stderr = '';
            const end = () => {
                /* resolve({
                     binary,
                     args,
                     cwd,
                     stdout,
                     stderr,
                 });*/
            };
            exec.stdout.on('data', (data) => { stdout += data; });
            exec.stderr.on('data', (data) => {
                if (data.includes('Opening') && data.includes('.m3u8')) { // Manifest update (Previous chunk is ready)
                    if (this._currentProcessingChunk !== false) {
                        console.log(`Chunk ${this._currentProcessingChunk} is ready!`);
                        this._availableChunks.push(this._currentProcessingChunk)
                        this._currentProcessingChunk = false;
                    }
                }
                else if (data.includes('Opening') && data.includes('.ts')) { // Writing chunk
                    const parsed = (/(.*)hls([0-9]+).ts(.*)/gm).exec(data);
                    if (parsed.length === 4) {
                        this._currentProcessingChunk = parseInt(parsed[2], 10);
                    }
                }
                else if (data.includes('frame=')) { // Stats event
                    // console.log('STATS', data);
                }

                stderr += data;

            });
            exec.on('close', end);
            exec.on('exit', end);
        })
    }
}