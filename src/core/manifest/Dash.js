export const getTimeString = (time = 0) => (`PT${Math.floor(time / 3600)}H${Math.floor(time % 3600 / 60)}M${Math.round(time % 60)}S`);

export default class Dash {

    constructor(config) {
        this._config = config;
        //this._chunkDuration = chunkDuration;
    }

    // Generate a valid Dash manifest based on data provided
    // Codec compat: https://shaka-player-demo.appspot.com/support.html
    getManifest() {
        return {
            headers: [['content-type', 'text/html; charset=utf-8']],
            content: [
                '<?xml version="1.0" encoding="utf-8"?>',
                '<MPD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
                '    xmlns="urn:mpeg:dash:schema:mpd:2011"',
                '    xmlns:xlink="http://www.w3.org/1999/xlink"',
                '    xsi:schemaLocation="urn:mpeg:DASH:schema:MPD:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"',
                '    profiles="urn:mpeg:dash:profile:isoff-live:2011"',
                '    type="static"',
                `    mediaPresentationDuration="${getTimeString(this._config.duration)}"`,
                `    maxSegmentDuration="${getTimeString(this._config.chunkDuration * 3)}"`,
                `    minBufferTime="${getTimeString(this._config.chunkDuration * 1.5)}">`,
                `    <Period start="${getTimeString(0)}" duration="${getTimeString(this._config.duration)}">`,
                ...this._config.streams.map((stream, idx) => {
                    if (stream.type === 'video')
                        return [
                            `        <AdaptationSet contentType="video" segmentAlignment="true" lang="${stream.language}">`,
                            `            <SegmentTemplate duration="${this._config.chunkDuration}" timescale="1" initialization="$RepresentationID$/initial.${['mp4', 'webm'].includes(stream.codec.chunkFormat) ? stream.codec.chunkFormat : 'und'}" media="$RepresentationID$/$Number$.${['mp4', 'webm'].includes(stream.codec.chunkFormat) ? stream.codec.chunkFormat.replace('mp4', 'm4s') : 'und'}" startNumber="0">`,
                            '            </SegmentTemplate>',
                            `            <Representation id="${idx}" mimeType="video/${stream.codec.chunkFormat}" codecs="${stream.codec.name}" width="${stream.resolution.width}" height="${stream.resolution.height}" frameRate="${stream.framerate}">`,
                            '            </Representation>',
                            '        </AdaptationSet>',
                        ]
                    else if (stream.type === 'audio')
                        return [
                            `        <AdaptationSet contentType="audio" segmentAlignment="true" lang="${stream.language}">`,
                            `            <SegmentTemplate duration="${this._config.chunkDuration}" timescale="1" initialization="$RepresentationID$/initial.${['mp4', 'webm'].includes(stream.codec.chunkFormat) ? stream.codec.chunkFormat : 'und'}" media="$RepresentationID$/$Number$.${['mp4', 'webm'].includes(stream.codec.chunkFormat) ? stream.codec.chunkFormat.replace('mp4', 'm4s') : 'und'}" startNumber="0">`,
                            '            </SegmentTemplate>',
                            `            <Representation id="${idx}" mimeType="audio/${stream.codec.chunkFormat}" codecs="${stream.codec.name}">`,
                            `                <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="${stream.channels}" audioSamplingRate="${stream.sample}" />`,
                            '            </Representation>',
                            '        </AdaptationSet>',
                        ]
                }).reduce((acc, e) => ([...acc, ...e]), []),
                '    </Period>',
                '</MPD>',
            ].join('\n')
        }
    }
}