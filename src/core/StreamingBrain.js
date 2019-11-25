import uuid from 'uuid/v4';
import MediaAnalyzer from './MediaAnalyzer';


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
            language: e.tags.LANGUAGE || 'und',
            codec: e.codec_name || 'unknown',
            codec_name: e.codec_long_name || 'Unknown',
        }));

        const audioStreams = this._meta.meta.streams.filter(e => (e.codec_type === 'audio')).map((e, i) => ({
            id: `0:a:${i}`,
            language: e.tags.LANGUAGE || 'und',
            codec: e.codec_name || 'unknown',
            codec_name: e.codec_long_name || 'Unknown',
        }));

        return {
            video: videoStreams,
            audio: audioStreams,
            subtitle: [],
        }

    }
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
            {  audioBitrate: 135, videoBitrate: 50, x264subme: 2, x264crf: 22, x264preset: 'slower', height: 160, width: 285, name: '160p (256k)' },
            {  audioBitrate: 123, videoBitrate: 180, x264subme: 2, x264crf: 23, x264preset: 'slower', height: 240, width: 430, name: '240p (512k)' },
            {  audioBitrate: 153, videoBitrate: 530, x264subme: 2, x264crf: 21, x264preset: 'slow', height: 350, width: 625, name: '350p (768k)' },
            {  audioBitrate: 159, videoBitrate: 1260, x264subme: 2, x264crf: 21, x264preset: 'slow', height: 480, width: 855, name: '480p (1.5M)' }, // Maybe add a 576 profile ?
            {  audioBitrate: 204, videoBitrate: 1544, x264subme: 2, x264crf: 19, x264preset: 'medium', height: 720, width: 1280, name: '720p (2M)' },
            {  audioBitrate: 117, videoBitrate: 2698, x264subme: 0, x264crf: 23, x264preset: 'medium', height: 720, width: 1280, name: '720p (3M)' },
            {  audioBitrate: 148, videoBitrate: 3623, x264subme: 0, x264crf: 21, x264preset: 'fast', height: 720, width: 1280, name: '720p (4M)' },
            {  audioBitrate: 136, videoBitrate: 7396, x264subme: 0, x264crf: 22, x264preset: 'fast', height: 1080, width: 1920, name: '1080p (8M)' },
            {  audioBitrate: 164, videoBitrate: 9261, x264subme: 0, x264crf: 21, x264preset: 'faster', height: 1080, width: 1920, name: '1080p (10M)' },
            {  audioBitrate: 191, videoBitrate: 10947, x264subme: 0, x264crf: 19, x264preset: 'faster', height: 1080, width: 1920, name: '1080p (12M)' },
            {  audioBitrate: 256, videoBitrate: 14256, x264subme: 0, x264crf: 19, x264preset: 'veryfast', height: 1080, width: 1920, name: '1080p (15M)' },
            {  audioBitrate: 512, videoBitrate: 18320, x264subme: 0, x264crf: 18, x264preset: 'veryfast', height: 1080, width: 1920, name: '1080p (20M)' },
            {  audioBitrate: 1024, videoBitrate: 23320, x264subme: 0, x264crf: 17, x264preset: 'superfast', height: 1080, width: 1920, name: '1080p (25M)' },
            {  audioBitrate: 1024, videoBitrate: 23320, x264subme: 0, x264crf: 17, x264preset: 'superfast', height: 1080, width: 1920, name: '1080p (30M)' },
            {  audioBitrate: 2048, videoBitrate: 35320, x264subme: 0, x264crf: 17, x264preset: 'superfast', height: 1080, width: 1920, name: '1080p (40M)' },
            {  audioBitrate: 2048, videoBitrate: 455320, x264subme: 0, x264crf: 16, x264preset: 'superfast', height: 1080, width: 1920, name: '1080p (50M)' }, // Add a 2K profile
            {  audioBitrate: 2048, videoBitrate: 455320, x264subme: 0, x264crf: 24, x264preset: 'ultrafast', height: 2160, width: 3840, name: '4K (50M)' },
            {  audioBitrate: 2048, videoBitrate: 555320, x264subme: 0, x264crf: 24, x264preset: 'ultrafast', height: 2160, width: 3840, name: '4K (60M)' },
            {  audioBitrate: 4096, videoBitrate: 655320, x264subme: 0, x264crf: 24, x264preset: 'ultrafast', height: 2160, width: 3840, name: '4K (70M)' },
            {  audioBitrate: 4096, videoBitrate: 1310640, x264subme: 0, x264crf: 24, x264preset: 'ultrafast', height: 4320, width: 7680, name: '8K (140M)' }, // Add original Direct Stream profile
        ]
    }


    async getProfiles() {
        await this.analyse();

        const resolution = this._meta.global.resolution;
        const qualities = this.getQualities().filter((e) => (e.width <= resolution.width && e.height <= resolution.height && e.videoBitrate + e.audioBitrate <= this._meta.global.bitrate / 1024));

        // Improve this part: if we have a "light" 1080p stream it don't send us a 720p profile because original bitrate < 720p bitrate

        // Add a copy version here if codec can be forwarded
        qualities.push({  audioBitrate: 512, videoBitrate: 18320, x264subme: 0, x264crf: 18, x264preset: 'veryfast', height: resolution.height, width: resolution.width, name: `Original (${resolution.width}x${resolution.height}@${Math.round(this._meta.global.bitrate / 1024)}k)` })

        qualities.push({ directStreamAudio: true, directStreamVideo :true, audioBitrate: 512, videoBitrate: 18320, x264subme: 0, x264crf: 18, x264preset: 'veryfast', height: resolution.height, width: resolution.width, name: `Direct Stream (Beta)` })


        // In the future, based on metadata, this function should filter available profiles

        //resolutions.filter()

        return qualities.map((e, i) => ({ ...e, id: i }));
    }

}