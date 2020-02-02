import { intCast } from "../../utils";

/*
    Extract video streams
*/
export const getVideoTracks = (meta) => {
    return meta.streams.filter(e => (e.codec_type === 'video'));
}
export const countVideoTracks = (meta) => (getVideoTracks(meta).length);

/*
    Extract audio streams
*/
export const getAudioTracks = (meta) => {
    return meta.streams.filter(e => (e.codec_type === 'audio'));
}
export const countAudioTracks = (meta) => (getAudioTracks(meta).length);

/*
    Extract file duration
*/
export const getDuration = (meta) => {
    return ((meta.format && typeof (meta.format.duration) !== 'undefined') ? parseFloat(meta.format.duration) : 0);
}

/*
    Supported containers detection
    - "mkv"
    - "mp4"
    - "unknown" (if not detected)
*/
export const getContainer = (meta) => {
    /*if (meta.format.format_name.includes('matroska'))
        return 'mkv';*/ // Conflicts with webm
    /*if (meta.format.format_name.includes('mp4')) // It creates conflicts
        return 'mp4';*/
    if (meta.format.format_name === 'mp4' || meta.format.tags && meta.format.tags.compatible_brands === 'isomiso2avc1mp41')
        return 'mp4';
    if (meta.format.format_name.includes('avi'))
        return 'avi';

    // TODO: Implement this function

    // Unknown container
    //console.warn('WARNING: Unknown container', meta.format);
    return 'unknown';
}
export const compareContainer = (meta, container) => (container === '*' || getContainer(meta) === container);

/*
    Supported video codec detection
    - "h264"
    - "vp8"
    - "xvid"
    - "unknown" (if not detected)
*/
export const getVideoCodec = (metaTrack) => {
    if (!metaTrack)
        return 'unknown';
    if (metaTrack.codec_name === 'h264')
        return 'h264';
    if (metaTrack.codec_name === 'hevc')
        return 'hevc';
    if (metaTrack.codec_name === 'vp8')
        return 'vp8';
    if (metaTrack.codec_name === 'vp9')
        return 'vp9';
    if (metaTrack.codec_name === 'av1')
        return 'av1';
    if (metaTrack.codec_name === 'mpeg4' && metaTrack.codec_tag_string === 'XVID')
        return 'xvid';

    // Unknown codec
    console.warn('WARNING: Unknown video codec', metaTrack);
    return 'unknown';
}
export const compareVideoCodec = (metaTrack, codec) => (codec === '*' || getVideoCodec(metaTrack) === codec);
export const compareVideoCodecArray = (metaTrack, codecsArray) => (codecsArray.some(c => (compareVideoCodec(metaTrack, c))));
export const getVideoDashFormat = (codec) => (['vp8', 'vp9'].includes(codec) ? 'webm' : 'mp4');

/*
    Supported audio codec detection
    - "opus"
    - "aac"
    - "mp3"
    - "ac3"
    - "eac3"
    - "vorbis"
    - "unknown" (if not detected)
*/
export const getAudioCodec = (metaTrack) => {
    if (!metaTrack)
        return 'unknown';
    if (metaTrack.codec_name === 'opus')
        return 'opus';
    if (metaTrack.codec_name === 'aac')
        return 'aac';
    if (metaTrack.codec_name === 'mp3')
        return 'mp3';
    if (metaTrack.codec_name === 'ac3')
        return 'ac3';
    if (metaTrack.codec_name === 'eac3')
        return 'eac3';
    if (metaTrack.codec_name === 'vorbis')
        return 'vorbis';

    // Unknown codec
    console.warn('WARNING: Unknown audio codec', metaTrack);
    return 'unknown';
}
export const compareAudioCodec = (metaTrack, codec) => (codec === '*' || getAudioCodec(metaTrack) === codec);
export const compareAudioCodecArray = (metaTrack, codecsArray) => (codecsArray.some(c => (compareAudioCodec(metaTrack, c))));
export const getAudioDashFormat = (codec) => (['vorbis', 'opus'].includes(codec) ? 'webm' : 'mp4');

export const getFramerate = (metaTrack) => {
    return metaTrack.avg_frame_rate || '30000/1001';
}

export const getBitrate = (metaTrack) => {
    if (!metaTrack)
        return 0;
    if (metaTrack.bit_rate && intCast(metaTrack.bit_rate) > 0)
        return intCast(metaTrack.bit_rate) / 1024;
    if (metaTrack.tags && metaTrack.tags.BPS) {
        return intCast(metaTrack.tags.BPS) / 1024;
    }
    return 0;
}

export const getLanguage = (metaTrack) => {
    if (metaTrack && metaTrack.tags) {
        if (metaTrack.tags.LANGUAGE) {
            return metaTrack.tags.LANGUAGE;
        }
        if (metaTrack.tags.language) {
            return metaTrack.tags.language;
        }
    }
    return 'und';
}

export const canDirectPlay = (meta, supportedMap) => {
    // Invalid map
    if (!supportedMap || supportedMap.type !== 'DOWNLOAD') {
        return [false, 'DirectPlay not available, invalid map'];
    }
    // Container not compatible
    if (!supportedMap.format.some((f) => (compareContainer(meta, f.container)))) {
        return [false, 'DirectPlay not available, container not compatible'];
    }
    // Too much audio tracks
    if (typeof (supportedMap.maxAudioTrack) !== 'undefined' && countAudioTracks(meta) > supportedMap.maxAudioTrack) {
        return [false, 'DirectPlay not available, file contains more audio track than allowed'];
    }
    // Too much video tracks
    if (typeof (supportedMap.maxVideoTrack) !== 'undefined' && countVideoTracks(meta) > supportedMap.maxVideoTrack) {
        return [false, 'DirectPlay not available, file contains more video track than allowed'];
    }
    // Video codec can't be played
    if (!getVideoTracks(meta).every(((metaTrack) => (compareVideoCodecArray(metaTrack, supportedMap.video.map((c) => (c.codec))))))) {
        return [false, 'DirectPlay not available, video codec not supported by player'];
    }
    // Audio codec can't be played
    if (!getAudioTracks(meta).every(((metaTrack) => (compareAudioCodecArray(metaTrack, supportedMap.audio.map((c) => (c.codec))))))) {
        return [false, 'DirectPlay not available, audio codec not supported by player'];
    }
    // Yes!
    return [true, 'DirectPlay available!'];
}

export const canDirectStreamVideo = (metaTrack, supportedMap, maxBitrate = false, shouldResize = false) => {
    // Invalid map
    if (!supportedMap || !['DASH', 'HLS'].includes(supportedMap.type)) {
        return [false, 'DirectStream not available, invalid map'];
    }
    // Should resize video
    if (shouldResize) {
        return [false, 'DirectStream not available, player asked for resized video'];
    }
    // Lower bitrate
    if (maxBitrate !== false && maxBitrate + 64 < getBitrate(metaTrack)) {
        return [false, 'DirectStream not available, player asked for lower video bitrate'];
    }
    //  Protocol codec support
    const supportedProtocolCodecs = (supportedMap.type === 'DASH') ? ['h264', 'hevc', 'av1', 'vp8', 'vp9'] : (supportedMap.type === 'HLS') ? ['h264', 'hevc'] : [];
    if (!compareVideoCodecArray(metaTrack, supportedProtocolCodecs)) {
        return [false, 'DirectStream not available, the streaming protocol don\'t support the video stream codec'];
    }
    // Player codec support
    if (!compareVideoCodecArray(metaTrack, supportedMap.video.map((c) => (c.codec)))) {
        return [false, 'DirectStream not available, video codec not supported by player'];
    }
    // Yes!
    return [true, 'DirectStream available!']
}

export const canDirectStreamAudio = (metaTrack, supportedMap = {}, maxBitrate = false, videoDelay = 0) => {
    // Invalid map
    if (!supportedMap || !['DASH', 'HLS'].includes(supportedMap.type)) {
        return [false, 'DirectStream not available, invalid map'];
    }
    // Lower bitrate
    if (maxBitrate !== false && maxBitrate + 64 < getBitrate(metaTrack)) {
        return [false, 'DirectStream not available, player asked for lower audio bitrate'];
    }
    //  Protocol codec support
    const supportedProtocolCodecs = (supportedMap.type === 'DASH') ? [ /*'mp3',*/ 'aac', 'ac3', 'ec3', 'opus', 'flac', 'vorbis'] : (supportedMap.type === 'HLS') ? ['mp3', 'aac', 'ac3', 'ec3'] : [];
    if (!compareAudioCodecArray(metaTrack, supportedProtocolCodecs)) {
        return [false, 'DirectStream not available, the streaming protocol don\'t support the audio stream codec'];
    }
    // Player codec support
    if (!compareAudioCodecArray(metaTrack, supportedMap.audio.map((c) => (c.codec)))) {
        return [false, 'DirectStream not available, audio codec not supported by player'];
    }
    // Video delay (video in copy mode but start_pts !== 0), we must resync audio track
    if (videoDelay !== 0) {
        return [false, 'DirectStream not available, audio stream must be synchronized with video stream'];
    }
    // Yes!
    return [true, 'DirectStream available!']
}

/*
 * Check if we need to adjust audio track based on pts_start header information
 */
export const getStreamDelay = (metaTrack) => {
    return Math.round(parseFloat(metaTrack.start_time || 0) * 1000) / 1000;
}

export const getVideoRfcCodecName = (codec) => { // RFC6381 value (For dash manifest)
    if (codec === 'h264')
        return 'avc1.42c00d';
    if (codec === 'vp8')
        return 'vp8';
    if (codec === 'vp9')
        return 'vp9';
    if (codec === 'av1')
        return 'av01.0.04M.08';
    if (codec === 'hevc')
        return 'hev1';
    return 'avc1.42c00d';
}

export const getAudioRfcCodecName = (codec) => { // RFC6381 value (For dash manifest)
    if (codec === 'opus')
        return 'opus';
    if (codec === 'vorbis')
        return 'vorbis';
    if (codec === 'aac')
        return 'mp4a.40.2';
    return 'mp4a.40.2';
}

/*
 * Analyze videoStreams and take decision
 */
export const analyzeVideoStreams = (path, videoStreams, videoStreamsMeta, profile, compatibilityMap) => ([videoStreams[0]].map((id) => {
    const canDirectStream = canDirectStreamVideo(videoStreamsMeta[id], compatibilityMap, profile.videoBitrate, profile.resized)
    // console.log('CAN DIRECT STREAM VIDEO TRACK', id, canDirectStream[1]);
    return {
        id,
        type: 'video',
        path,
        canDirectStream: canDirectStream[0],
        language: getLanguage(videoStreamsMeta[id]),
        startDelay: (canDirectStream[0]) ? getStreamDelay(videoStreamsMeta[id]) : 0,
        codec: {
            encoder: canDirectStream[0] ? 'copy' : 'libx264',
            decoder: false, // FFmpeg decoder (not supported yet)
            chunkFormat: getVideoDashFormat(canDirectStream[0] ? getVideoCodec(videoStreamsMeta[id]) : 'h264'),
            name: getVideoRfcCodecName(canDirectStream[0] ? getVideoCodec(videoStreamsMeta[id]) : 'h264'),
            options: {
                x264subme: profile.x264subme,
                x264crf: profile.x264crf,
                x264preset: profile.x264preset,
            },
        },
        bitrate: profile.videoBitrate,
        framerate: getFramerate(videoStreamsMeta[id]),
        resolution: {
            width: profile.width,
            height: profile.height,
            resized: profile.resized,
        },
        meta: videoStreamsMeta[id],
    }
}));

/*
 * Analyze audioStreams and take decision
 */
export const analyzeAudioStreams = (path, audioStreams, audioStreamsMeta, profile, compatibilityMap, videoDelay = 0) => (audioStreams.map((id) => {
    const canDirectStream = canDirectStreamAudio(audioStreamsMeta[id], compatibilityMap, profile.audioBitrate, videoDelay);
    // console.log('CAN DIRECT STREAM AUDIO TRACK', id, canDirectStream[1], delay)
    return {
        id,
        type: 'audio',
        path,
        canDirectStream: canDirectStream[0],
        language: getLanguage(audioStreamsMeta[id]),
        codec: {
            encoder: canDirectStream[0] ? 'copy' : 'aac',
            decoder: false, // FFmpeg decoder
            chunkFormat: getAudioDashFormat(canDirectStream[0] ? getAudioCodec(audioStreamsMeta[id]) : 'aac'),
            name: getAudioRfcCodecName(canDirectStream[0] ? getAudioCodec(audioStreamsMeta[id]) : 'aac'),
        },
        bitrate: profile.audioBitrate,
        delay: videoDelay,
        channels: 2,
        sample: audioStreamsMeta[id].sample_rate || 0,
        meta: audioStreamsMeta[id],
    }
}));