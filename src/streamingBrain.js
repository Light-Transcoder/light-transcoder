export default class StreamingBrain {

    constructor() {
        this._input = '';
        this._inputVideoStream = '0:0';
        this._inputAudioStream = '0:1';
        this._format = 'HLS';
        this._chunkDuration = 5;
        this._videoDirectStream = true // If true we use "copy"
        this._audioDirectStream = true // If true we use "copy"
        this._bitrate = 1724 // Used to limit ffmpeg speed
        this._analyseDuration = 20000000;
        this._outputFPS = 23.975999999999999;
        this._h264Preset = "veryfast"; // maybe ultrafast ?
        this._h264Crf = 21;
        this._duration = 3 * 60 + 35;
        this._debug = true;
    }

    setInput(value) {
        this._input = value;
    }

    getCommand() {
        if (this._input === '')
            return;

        // Args
        const args = [];

        // Load input
        args.push( /*"-codec:0", "vc1", "-codec:1", "ac3",*/ "-analyzeduration", this._analyseDuration, "-probesize", this._analyseDuration, "-i", this._input);
        let videoStream = this._inputVideoStream;
        let audioStream = this._inputAudioStream;

        // Scale feature
        if (!this._videoDirectStream) {
            args.push("-filter_complex", `[${videoStream}]scale=w=720:h=406[scaled]`);
            videoStream = 'scaled';
            args.push("-filter_complex", `[${videoStream}]format=pix_fmts=yuv420p|nv12[format]`);
            videoStream = 'format';

            // Todo: interlated content + rescale = KO
            // Todo: HDR content + transcode => Tonemapping required
        }

        // Audio filter / Downmix
        if (!this._audioDirectStream) {
            args.push("-filter_complex", `[${audioStream}]aresample=async=1:ocl='stereo':osr=48000[aresample]`);
            audioStream = 'aresample';
        }

        // Map video stream
        args.push("-map", (videoStream.indexOf(':') === -1 ? `[${videoStream}]` : videoStream));

        // Video stream output codecs
        if (this._videoDirectStream) {
            args.push("-codec:0", 'copy', "-maxrate:0", `${this._bitrate}k`, "-bufsize:0", `${2 * this._bitrate}k`, "-force_key_frames:0", `expr:gte(t,0+n_forced*${this._chunkDuration})`)
        } else {
            args.push("-codec:0", "libx264", "-crf:0", this._h264Crf, "-maxrate:0", `${this._bitrate}k`, "-bufsize:0", `${2 * this._bitrate}k`, "-r:0", this._outputFPS, "-preset:0", this._h264Preset, "-x264opts:0", "subme=2:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none", "-force_key_frames:0", `expr:gte(t,0+n_forced*${this._chunkDuration})`);
        }

        // Map audio stream
        args.push("-map", (audioStream.indexOf(':') === -1 ? `[${audioStream}]` : audioStream));

        // Audio codec settings
        if (this._audioDirectStream) {
            args.push("-codec:1", "copy");
        } else {
            args.push("-codec:1", "aac", "-b:1", "162k");
        }

        if (this._format === 'HLS')
            args.push('-f', 'hls', '-hls_time', this._chunkDuration, '-hls_playlist_type', 'event', `hls.m3u8`); // HLS
        else if (this._format === 'DASH') {
            args.push(
                "-f",
                "dash",
                "-seg_duration",
                "8",
                "-init_seg_name",
                "init-stream$RepresentationID$.m4s",
                "-media_seg_name",
                "chunk-stream$RepresentationID$-$Number%05d$.m4s",
                "-skip_to_segment",
                "1",
                "-time_delta",
                "0.0625",
                "-manifest_name",
                "http://tralala.fun/video/:/transcode/session/q9zljdon5bcpoq6q0jm04cyr/18d5783e-25d1-48af-a083-9fc7fc9081bd/manifest",
                "-avoid_negative_ts",
                "disabled",
                "-map_metadata",
                "-1",
                "-map_chapters",
                "-1",
                "dash",
            ); // Dash
        }
        else if (this._format === 'LP') {
            // Long polling
        }
        else if (this._format === 'EXPORT') {
            // Export in a single file (media sync) => Maybe bundle subs and use mkv ?
        }

        args.push(
            "-start_at_zero",
            "-copyts",
            "-vsync",
            "cfr"
        )

        // Debug off
        if (this._debug)
            args.push(
                "-loglevel",
                "verbose",
                //"-loglevel_plex", // Plex related flag
                // "error",// Plex related flag
            )
        else
            args.push(
                "-nostats",
                //"-loglevel",
                //"quiet",
                //"-loglevel_plex", // Plex related flag
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

    getHLSStream() {
        return [
            '#EXTM3U',
            '#EXT-X-VERSION:3',
            `#EXT-X-TARGETDURATION:${this._chunkDuration}`,
            '#EXT-X-ALLOW-CACHE:YES',
            '#EXT-X-MEDIA-SEQUENCE:0',
            '#EXT-X-PLAYLIST-TYPE:EVENT',
            ...Array(this.getNbChunks()).fill(true).reduce((acc, _, i) => ([
                ...acc,
                `#EXTINF:${this._chunkDuration}.004267,`,
                `/${i}.ts`
            ]), []),
            '#EXT-X-ENDLIST'
        ].join('\n');
    }

    getHLSMaster() {
        return [
            '#EXTM3U',
            '#EXT-X-VERSION:3',
            '#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=300000',
            'hls.m3u8'
        ].join('\n');
    }

    getProfiles() {
        const resolutions = []


        const bitrates = [64,96,208,320,720,1500,2e3,3e3,4e3,8e3,1e4,12e3,2e4];
        const videoResolution = ["220x128","220x128","284x160","420x240","576x320","720x480","1280x720","1280x720","1280x720","1920x1080","1920x1080","1920x1080","1920x1080"];
        const videoQuality:[10,20,30,30,40,60,60,75,100,60,75,90,100]},


        return [
            /* {
                 bitrate: 2000,
                     resolution:720,
                     original: false
             }*/
        ]
    }
}