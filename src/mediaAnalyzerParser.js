// Calc ratio float value
const calcRatio = (ratio) => {
    if (typeof (ratio) !== 'string' || !(RegExp(/^([0-9]+):([0-9]+)$/gm)
        .test(ratio)))
        return (false);
    if ((parseInt(ratio.split(':')[0], 10) > 0 && parseInt(ratio.split(':')[1], 10) > 0))
        return (parseInt(ratio.split(':')[0], 10) / parseInt(ratio.split(':')[1], 10));
    return (false);
};

// Extract resolution from raw metadata
const extractResolution = (meta) => {
    // Bad files
    if (!meta.streams || meta.streams.length === 0)
        return false;

    // Convert to "real" size, using display_aspect_ratio
    const streams = meta.streams.map((s) => {
        // Output ratio not found
        if (!s.display_aspect_ratio || !s.width || !s.height)
            return s;

        // Get ratio
        const ratio = calcRatio(s.display_aspect_ratio);
        if (!ratio)
            return s;

        // Calc "real" display size
        // Eg: 1440x1080p @ 16:9 videos
        const calc1 = s.width * 1 / ratio;
        const calc2 = s.height * ratio;

        if (calc1 > s.height)
            return { ...s, width: s.width, height: calc1 };

        if (calc2 > s.width)
            return { ...s, width: calc2, height: s.height };

        return s;
    });

    // Default case
    return (streams.map((e) => ((e.width && e.height) ? { width: e.width, height: e.height } : false)).find((e) => (!!e)) || false);
};

const getRotateValue = (meta) => {
    // Bad files
    if (!meta.streams || meta.streams.length === 0)
        return 0;
    // Get rotation value
    const rotations = meta.streams.map((e) => ((e.width && e.height && e.tags) ? (e.tags.rotate || '0') : false))
        .filter((e) => (e !== false));
    return parseInt((rotations.length) ? rotations[0] : '0', 10);
};

// Format detection
const detectFileType = (meta) => {
    // Bad files
    if (!meta.streams)
        return ('OTHER');

    // Get streams
    const streams = meta.streams.filter((e) => (['audio', 'video'].indexOf(e.codec_type) !== -1));

    // No streams case
    if (streams.length === 0)
        return ('OTHER');

    // Audio case
    const resolution = extractResolution(meta);
    if (resolution === false)
        return ('AUDIO');

    // Picture case
    const type = meta.format.format_name.toLowerCase() + meta.format.format_long_name.toLowerCase();
    if (type.indexOf('pipe') !== -1 || type.indexOf('gif') !== -1 || type.indexOf('image2') !== -1)
        return ('IMAGE');

    // Video case
    return ('VIDEO');
};

// Detect HDR video stream
const detectHDR = (meta) => (meta.streams && meta.streams.filter((e) => (e.codec_type === 'video')).length && meta.streams.filter((e) => (e.codec_type === 'video'))[0].bits_per_raw_sample > 8);

// Extract metadata with FFprobe
export const parseMeta = (meta) => {
    if (!meta)
        return false;
    const resolution = extractResolution(meta);
    return {
        meta,
        global: {
            type: detectFileType(meta),
            duration: ((meta.format && typeof (meta.format.duration) !== 'undefined') ? parseFloat(meta.format.duration) : 0),
            size: ((meta.format && typeof (meta.format.size) !== 'undefined') ? parseInt(meta.format.size, 10) : 0),
            resolution,
            rotate: getRotateValue(meta),
            ratio: (resolution) ? calcRatio(`${resolution.width}:${resolution.height}`) : false,
            isHDR: detectHDR(meta),
            containsAudio: !!(meta.streams && meta.streams.map((e) => ((e.codec_type === 'audio') ? 1 : 0))
                .reduce((a, b) => (a + b), 0)),
            containsVideo: !!(meta.streams && meta.streams.map((e) => ((e.codec_type === 'video') ? 1 : 0))
                .reduce((a, b) => (a + b), 0)),
        },
    }
}