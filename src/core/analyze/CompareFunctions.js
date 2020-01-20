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

    // Unknown container
    console.warn('WARNING: Unknown container', meta.format);
    return 'unknown';
}
export const compareContainer = (meta, container) => (container === '*' || getContainer(meta) === container);

/*
    Supported video codec detection
    - "x264"
    - "vp8"
    - "xvid"
    - "unknown" (if not detected)
*/
export const getVideoCodec = (metaTrack) => {
    if (metaTrack.codec_name === 'h264')
        return 'x264';
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

export const getFramerate = (metaTrack) => {
    return metaTrack.avg_frame_rate || '30000/1001';
}

export const getBitrate = (metaTrack) => {
    if (metaTrack.bit_rate && intCast(metaTrack.bit_rate) > 0)
        return intCast(metaTrack.bit_rate) / 1024;
    if (metaTrack.tags && metaTrack.tags.BPS) {
        return intCast(metaTrack.tags.BPS) / 1024;
    }
    return 0;
}

export const getLanguage = (metaTrack) => {
    if (metaTrack.tags) {
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
    const supportedProtocolCodecs = (supportedMap.type === 'DASH') ? ['x264', 'hevc', 'av1', 'vp8', 'vp9'] : (supportedMap.type === 'HLS') ? ['x264', 'hevc'] : [];
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

export const canDirectStreamAudio = (metaTrack, supportedMap = {}, maxBitrate = false) => {
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
    // Yes!
    return [true, 'DirectStream available!']
}