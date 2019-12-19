import uuid from 'uuid/v4';
import MediaAnalyzer from './analyze/MediaAnalyzer';


export default class StreamingBrain {

    constructor(input = '') {
        this._uuid = uuid();
        this._input = input;
        this._meta = false;
        this._analyzer = new MediaAnalyzer(input);

        /*
        this._inputVideoStream = '0:v:0';
        this._inputAudioStream = '0:a:0';
        this._format = 'DASH';
        this._chunkDuration = 5;
        this._videoDirectStream = false // If true we use "copy"
        this._audioDirectStream = false // If true we use "copy"
        this._analyseDuration = 20000000;
        this._outputFPS = 23.975999999999999;
        this._useAdaptativePreset = true;
        this._startAt = parseInt(0, 10); // In seconds
        this._duration = (meta && meta.global.duration) ? meta.global.duration : 60 * 60 * 2; // Fallback to 2h if not available
        this._debug = true;
        this._profile = profileId;*/

        this.allowedVideoCodecs = ['H264', 'HEVC', 'COPY'];
        this.allowedAudioCodecs = ['AAC', 'OGG', 'COPY'];
        this.allowedSubtitlesCodecs = ['EXTRACT', 'BURN'] // WTF ?
        this.allowedStreamModes = ['HLS', 'DASH', 'LP', 'DOWNLOAD'];
    }

    async getMeta() {
        return await this.analyse();
    }

    async analyse() {
        if (!this._meta)
            this._meta = await this._analyzer.analyze();
        return this._meta;
    }

    async getTracks() {
        await this.analyse();

        if (!this._meta)
            return {};

        const videoStreams = this._meta.meta.streams.filter(e => (e.codec_type === 'video')).map((e, i) => ({
            id: `0:v:${i}`,
            language: e.tags && e.tags.LANGUAGE || 'und',
            codec: e.codec_name || 'unknown',
            codec_name: e.codec_long_name || 'Unknown',
        }));

        const audioStreams = this._meta.meta.streams.filter(e => (e.codec_type === 'audio')).map((e, i) => ({
            id: `0:a:${i}`,
            language: e.tags && e.tags.LANGUAGE || 'und',
            codec: e.codec_name || 'unknown',
            codec_name: e.codec_long_name || 'Unknown',
        }));

        return {
            video: videoStreams,
            audio: audioStreams,
            subtitle: [],
        }
    }

    async takeDecision() {


        return [
            {
                type: 'video',
                codec: {
                    type: 'x264',
                    options: {
                        x264subme: 0,
                        x264crf: 22,
                        x264preset: 'fast',
                    },
                },
                bitrate: 512,
                framerate: '30000/1001',
                resolution: {
                    width: 1920,
                    height: 1080,
                },
                meta: {},
            },
            {
                type: 'audio',
                codec: {
                    type: 'opus',
                },
                channels: 2,
                bitrate: 128,
                meta: {}
            }
        ]

    }


    /*
        async takeDecision(compatibilityMap = [{
            "type": "HLS",
            "video": [
                { "codec": "h264" },
                { "codec": "webm" },
            ],
            "audio": [
                { "codec": "aac" },
                { "codec": "ogg" },
            ]
        }, {
            "type": "DOWNLOAD",
            "format": [
                { "container": "mp4" },
                { "container": "webm" },
            ],
            "video": [
                { "codec": "h264" },
                { "codec": "webm" },
            ],
            "audio": [
                { "codec": "aac" },
                { "codec": "ogg" },
            ]
        }]) {
            const protocolOrder = ['DOWNLOAD', 'HLS'];
     
     
     
     
     
     
        }
     
       */

    /*
        exp() {
     
     
     
     
            const exp = {
                format: 'HLS',
                //quickSwitch: false,
                duration: 300,
                chunkDuration: 5,
                videoStream: [
                    {
                        name: 'track 1',
                        index: '0:a:0',
                        codec: 'copy/fun/aac',
                        bitrate: 568,
                        autoQuality: false,
                    }
                ],
                audio: [
                    {
                        name: 'track 1',
                        index: '0:a:0',
                        codec: 'copy/fun/aac',
                        bitrate: 568,
                        height: 1080,
                        width: 1920,
                        x264preset: 'slower',
                        x264subme: 2,
                        x264crf: 22,
                    }
                ],
                subtitle: [
                    name : 'track 1',
                    index: '0:a:0',
                    codec: 'burn/extract',
                    bitrate: 568
                ]
     
            }
     
     
        }
    */

    getQualities() {
        return [
            { audioBitrate: 135, videoBitrate: 50, x264subme: 2, x264crf: 22, x264preset: 'slower', maxHeight: 160, maxWidth: 285, name: '160p (256k)' },
            { audioBitrate: 123, videoBitrate: 180, x264subme: 2, x264crf: 23, x264preset: 'slower', maxHeight: 240, maxWidth: 430, name: '240p (512k)' },
            { audioBitrate: 153, videoBitrate: 530, x264subme: 2, x264crf: 21, x264preset: 'slow', maxHeight: 350, maxWidth: 625, name: '350p (768k)' },
            { audioBitrate: 159, videoBitrate: 1260, x264subme: 2, x264crf: 21, x264preset: 'slow', maxHeight: 480, maxWidth: 855, name: '480p (1.5M)' }, // Maybe add a 576 profile ?
            { audioBitrate: 204, videoBitrate: 1544, x264subme: 2, x264crf: 19, x264preset: 'medium', maxHeight: 720, maxWidth: 1280, name: '720p (2M)' },
            { audioBitrate: 117, videoBitrate: 2698, x264subme: 0, x264crf: 23, x264preset: 'medium', maxHeight: 720, maxWidth: 1280, name: '720p (3M)' },
            { audioBitrate: 148, videoBitrate: 3623, x264subme: 0, x264crf: 21, x264preset: 'fast', maxHeight: 720, maxWidth: 1280, name: '720p (4M)' },
            { audioBitrate: 136, videoBitrate: 7396, x264subme: 0, x264crf: 22, x264preset: 'fast', maxHeight: 1080, maxWidth: 1920, name: '1080p (8M)' },
            { audioBitrate: 164, videoBitrate: 9261, x264subme: 0, x264crf: 21, x264preset: 'faster', maxHeight: 1080, maxWidth: 1920, name: '1080p (10M)' },
            { audioBitrate: 191, videoBitrate: 10947, x264subme: 0, x264crf: 19, x264preset: 'faster', maxHeight: 1080, maxWidth: 1920, name: '1080p (12M)' },
            { audioBitrate: 256, videoBitrate: 14256, x264subme: 0, x264crf: 19, x264preset: 'veryfast', maxHeight: 1080, maxWidth: 1920, name: '1080p (15M)' },
            { audioBitrate: 512, videoBitrate: 18320, x264subme: 0, x264crf: 18, x264preset: 'veryfast', maxHeight: 1080, maxWidth: 1920, name: '1080p (20M)' },
            { audioBitrate: 1024, videoBitrate: 23320, x264subme: 0, x264crf: 17, x264preset: 'superfast', maxHeight: 1080, maxWidth: 1920, name: '1080p (25M)' },
            { audioBitrate: 1024, videoBitrate: 23320, x264subme: 0, x264crf: 17, x264preset: 'superfast', maxHeight: 1080, maxWidth: 1920, name: '1080p (30M)' },
            { audioBitrate: 2048, videoBitrate: 35320, x264subme: 0, x264crf: 17, x264preset: 'superfast', maxHeight: 1080, maxWidth: 1920, name: '1080p (40M)' },
            { audioBitrate: 2048, videoBitrate: 455320, x264subme: 0, x264crf: 16, x264preset: 'superfast', maxHeight: 1080, maxWidth: 1920, name: '1080p (50M)' }, // Add a 2K profile ?
            { audioBitrate: 2048, videoBitrate: 455320, x264subme: 0, x264crf: 24, x264preset: 'ultrafast', maxHeight: 2160, maxWidth: 3840, name: '4K (50M)' },
            { audioBitrate: 2048, videoBitrate: 555320, x264subme: 0, x264crf: 24, x264preset: 'ultrafast', maxHeight: 2160, maxWidth: 3840, name: '4K (60M)' },
            { audioBitrate: 4096, videoBitrate: 655320, x264subme: 0, x264crf: 24, x264preset: 'ultrafast', maxHeight: 2160, maxWidth: 3840, name: '4K (70M)' },
            { audioBitrate: 4096, videoBitrate: 1310640, x264subme: 0, x264crf: 24, x264preset: 'ultrafast', maxHeight: 4320, maxWidth: 7680, name: '8K (140M)' },
        ]
    }

    //1920 * 1080 + 1920 * 1080 => 1920 * 1080
    //1280 * 720 + 1920 * 1080 => 1280 * 720

    _calcOutputResolution(width, height, maxWidth, maxHeight) {
        // Calc ratio
        const ratio = width / height;

        // Default case
        if (width <= maxWidth && height <= maxHeight)
            return { width, height, resized: false };

        // We need to calc %2 values (Else, we will have issues with ffmpeg)
        const widthCase1 = Math.ceil(maxWidth) - (Math.ceil(maxWidth) % 2 !== 0);
        const heightCase1 = Math.ceil(maxWidth / ratio) - (Math.ceil(maxWidth / ratio) % 2 !== 0);
        const widthCase2 = Math.ceil(maxHeight * ratio) - (Math.ceil(maxHeight * ratio) % 2 !== 0);
        const heightCase2 = Math.ceil(maxHeight) + (Math.ceil(maxHeight) % 2 !== 0);

        // Get the right value
        if (widthCase1 <= maxWidth && heightCase1 <= maxHeight && widthCase1 > 0 && heightCase1 > 0)
            return { width: widthCase1, height: heightCase1, resized: true };
        if (widthCase2 <= maxWidth && heightCase2 <= maxHeight && widthCase2 > 0 && heightCase2 > 0)
            return { width: widthCase2, height: heightCase2, resized: true };

        // Default fallback
        return { width, height, resized: false };
    }

    async getProfiles() {
        // Analyse the file if needed
        await this.analyse();

        // Get resolution
        const resolution = this._meta.global.resolution;

        // Filter to avoid higher resolution than original file
        const qualitiesFiltered = this.getQualities().filter((e) => (e.maxWidth <= resolution.width && e.maxHeight <= resolution.height));

        // Remove qualities with higher bitrate (except the first one)
        const qualities = qualitiesFiltered.filter((e, i) => (e.videoBitrate + e.audioBitrate <= this._meta.global.bitrate / 1024 || qualitiesFiltered.findIndex((q) => (q.maxWidth === e.maxWidth && q.maxHeight === e.maxHeight)) === i))

        // Add a "Original" version with the same bitrate (It will be merged with the Direct stream in the future)
        qualities.push({ audioBitrate: 512, videoBitrate: Math.round(this._meta.global.bitrate / 1024), x264subme: 0, x264crf: 18, x264preset: 'veryfast', maxHeight: resolution.height, maxWidth: resolution.width, name: `Original (${resolution.width}x${resolution.height}@${Math.round(this._meta.global.bitrate / 1024)}k)` })

        // Beta feature / Test => Try to direct stream file
        qualities.push({ directStreamAudio: true, directStreamVideo: true, audioBitrate: 512, videoBitrate: 18320, x264subme: 0, x264crf: 18, x264preset: 'veryfast', maxHeight: resolution.height, maxWidth: resolution.width, name: `Direct Stream (Beta)` })

        // Return the array of profiles with real output resolution and id
        return qualities.map((e, i) => ({ ...e, id: i, resolution: this._calcOutputResolution(resolution.width, resolution.height, e.maxWidth, e.maxHeight) }));
    }

}