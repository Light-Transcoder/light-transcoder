import uuid from 'uuid/v4';
import mkdirp from 'mkdirp'
import ffmpeg from 'ffmpeg-static';
import { createReadStream, stat } from 'fs';
import { execFile } from 'child_process';
import ChunkStore from '../ChunkStore';
import FFmpegLogParser from './LogParser';
import config from '../../config';

export default class FFmpeg {

    constructor({
        input = '',
        meta = false,
        profile = false,
        videoStream = '0:v:0',
        videoStreamCopy = false,
        audioStream = '0:a:0',
        audioStreamCopy = false,
        protocol = 'HLS',
        dir = './',
    }) {
        this._uuid = uuid();
        this._input = input;
        this._meta = meta;
        this._inputVideoStream = videoStream;
        this._inputAudioStream = audioStream;

        console.log(this._inputVideoStream, this._inputAudioStream)
        this._protocol = protocol;
        this._chunkDuration = config.transcode.chunkDuration;
        this._videoDirectStream = videoStreamCopy;
        this._audioDirectStream = audioStreamCopy;
        this._analyseDuration = 20000000;
        this._outputFPS = 30000 / 1001;
        this._useAdaptativePreset = true;
        this._startAt = parseInt(0, 10); // In seconds
        this._duration = (meta && meta.global.duration) ? meta.global.duration : 60 * 60 * 2; // Fallback to 2h if not available
        this._debug = true;
        this._profile = profile;
        this._dir = `${dir}transcoder-${this._uuid}/`;

        this._chunkStores = [];

        this._logParser = false;
    }

    getChunkStores() {
        return this._chunkStores;
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

        // TODO calc start based on chunk duration
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
                //`[${videoStream}]scale=w=-2:h=${profile.maxHeight}[scale]`

                `[${videoStream}]scale=${profile.resolution.width}:${profile.resolution.height}:force_original_aspect_ratio=disable,setdar=${profile.resolution.width}/${profile.resolution.height}[scale]`
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
                this._chunkDuration,
                /*"-init_seg_name",
                "init-stream$RepresentationID$.m4s",
                "-media_seg_name",
                "chunk-stream$RepresentationID$-$Number%05d$.m4s",*/
                // "-skip_to_segment",
                //  "1",
                // "-time_delta",
                // "0.0625",
                //  "-manifest_name",
                "manifest.mpd",
                // "-avoid_negative_ts",
                // "disabled",
                // "-map_metadata",
                // "-1",
                // "-map_chapters",
                // "-1",
                // "dash",
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
            // ...((this._startAt === 0) ? [
            "-vsync",
            "cfr"
            //] : [])
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

    sendChunkStream(track, id, res) {
        return new Promise((resolve, reject) => {
            let path = false;
            if (this._protocol === 'HLS') {
                path = `${this._dir}hls${id}.ts`; // Basic HLS chunk
            } else if (this._protocol === 'DASH' && id !== 'initial') {
                path = `${this._dir}chunk-stream${track}-${(id).toString().padStart(5, '0')}.m4s`; // Basic DASH chunk
            } else if (this._protocol === 'DASH' && id === 'initial') {
                path = `${this._dir}init-stream${track}.m4s`; // Initial DASH chunk
            }
            console.log('Sending chunk', id, path);
            stat(path, (err) => {
                if (err)
                    return reject(err);
               /* if (track == 0) {
                    console.log('Set mime video');
                    res.type('video/mp4')
                }
                if (track == 1) {
                    console.log('Set mime audio');
                    res.type('audio/mp4')
                }*/
//setTimeout(() => {
    const stream = createReadStream(path);
               
    stream.on('end', () => { res.end(); return resolve(id) });
    stream.on('error', (err) => { res.end();  return reject(id, err) });
    stream.pipe(res);
//}, 2000)
              
            });
        });
    }

    start() {
        // Init all the stores
        const nbStore = ({ HLS: 1, DASH: 2 }[this._protocol]);
        (new Array(nbStore)).fill('').forEach(() => {
            this._chunkStores.push(new ChunkStore());
        })

        // Init the log parser
        this._logParser = new FFmpegLogParser({
            protocol: this._protocol,
            onChunkStart: (track, id) => {
                this._chunkStores[track].setChunkStatus(id, 'IN_PROGRESS');
            },
            onChunkReady: (track, id) => {
                this._chunkStores[track].setChunkStatus(id, 'READY');
            }
        });

        // Todo comment & clean
        mkdirp(this._dir, (err) => {
            if (err)
                return;
            const binary = ffmpeg.path;
            const args = this.getCommand();
            console.log(`${binary} ${args.map((a) => (`"${a}"`)).join(' ')}`);
            const exec = execFile(binary, [...args], { cwd: this._dir });
            const end = () => {
                /* resolve({
                     binary,
                     args,
                     cwd,
                     stdout,
                     stderr,
                 });*/
            };
            exec.stdout.on('data', (data) => {
                stdout += data;
            });
            exec.stderr.on('data', (data) => {
                this._logParser.parse(data);
            });
            exec.on('close', end);
            exec.on('exit', end);
        })
    }
}