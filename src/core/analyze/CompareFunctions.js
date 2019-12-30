import { intCast } from "../../utils";

/*
    Extract container
*/
export const getContainer = (meta) => {
    return meta.format;
}

/*
    Extract video streams
*/
export const getVideoTracks = (meta) => {
    return meta.streams.filter(e => (e.codec_type === 'video'));
}

/*
    Extract audio streams
*/
export const getAudioTracks = (meta) => {
    return meta.streams.filter(e => (e.codec_type === 'audio'));
}

/*
    Extract file duration
*/
export const getDuration = (meta) => {
    return parseInt(((meta && meta.global.duration) ? meta.global.duration : 60 * 60 * 2), 10);
}

/*
    Supported containers tests
    - "*"
    - "mkv"
    - "mp4"
*/
export const compareContainer = (meta, container) => {
    const source = getContainer(meta).format_name;
    const match = ([
        (container === '*'),
        (container === 'mp4' && source === 'mp4'),
        (container === 'mkv' && source.includes('matroska'))
    ].filter((e) => (!!e)).length > 0)
    console.log(`Compare container: (${source} // ${container}) => ${match ? 'true' : 'false'}`);
    return match;
}

/*
    Supported video codecs tests
    - "*"
    - "h264" / "x264"
*/
export const compareVideoCodec = (metaTrack, codec) => {
    const source = metaTrack.codec_name;
    const match = ([
        (codec === '*'),
        ((codec === 'h264' || codec === 'x264') && source === 'h264'),
    ].filter((e) => (!!e)).length > 0)
    console.log(`Compare video codec: (${source} // ${codec}) => ${match ? 'true' : 'false'}`);
    return match;
}
export const compareVideoCodecArray = (metaTrack, codecsArray) => (codecsArray.map(c => (compareVideoCodec(metaTrack, c))).filter((e) => (!!e)).length);

/*
    Supported audio codecs tests
    - "*"
    - "opus"
*/
export const compareAudioCodec = (metaTrack, codec) => {
    const source = metaTrack.codec_name;
    const match = ([
        (codec === '*'),
        (codec === 'opus' && source === 'opus'),
    ].filter((e) => (!!e)).length > 0)
    console.log(`Compare audio codec: (${source} // ${codec}) => ${match ? 'true' : 'false'}`);
    return match;
}
export const compareAudioCodecArray = (metaTrack, codecsArray) => (codecsArray.map(c => (compareAudioCodec(metaTrack, c))).filter((e) => (!!e)).length);

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