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
export const compareVideoCodec = (meta, trackId, codec) => {
    const track = getVideoTracks(meta)[trackId];
    const source = track.codec_name;
    const match = ([
        (codec === '*'),
        ((codec === 'h264' || codec === 'x264') && source === 'h264'),
    ].filter((e) => (!!e)).length > 0)
    console.log(`Compare video codec: (${source} // ${container}) => ${match ? 'true' : 'false'}`);
    return match;
}

/*
    Supported audio codecs tests
    - "*"
    - "opus"
*/
export const compareAudioCodec = (meta, trackId, codec) => {
    const track = getAudioTracks(meta)[trackId];
    const source = track.codec_name;
    const match = ([
        (codec === '*'),
        (codec === 'opus' && source === 'opus'),
    ].filter((e) => (!!e)).length > 0)
    console.log(`Compare audio codec: (${source} // ${container}) => ${match ? 'true' : 'false'}`);
    return match;
}