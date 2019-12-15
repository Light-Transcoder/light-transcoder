import { getTimeString } from '../../utils';

export default class Dash {

    constructor({
        chunkDuration = 1,
        duration = 0,
    }) {
        this._duration = duration;
        this._chunkDuration = chunkDuration;
    }

    // Generate a valid Dash manifest based on data provided
    getManifest() {
        return {
            headers: [['content-type', 'text/html; charset=utf-8']],
            content: [
                '<?xml version="1.0" encoding="utf-8"?>',
                '<MPD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
                '    xmlns="urn:mpeg:dash:schema:mpd:2011"',
                '    xmlns:xlink="http://www.w3.org/1999/xlink"',
                '    xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"',
                '    profiles="urn:mpeg:dash:profile:isoff-live:2011"',
                '    type="static"',
                `    mediaPresentationDuration="${getTimeString(this._duration)}"`,
                `    maxSegmentDuration="${getTimeString(16)}"`,
                `    minBufferTime="${getTimeString(10)}">`,
                `    <Period start="PT0S" id="0" duration="${getTimeString(this._duration)}">`,
                '        <AdaptationSet segmentAlignment="true">',
                `            <SegmentTemplate timescale="1" duration="${this._chunkDuration}" initialization="$RepresentationID$/initial.mp4" media="$RepresentationID$/$Number$.m4s" startNumber="0">`,
                '            </SegmentTemplate>',
                '            <Representation id="0" mimeType="video/mp4" codecs="avc1.4d4029" bandwidth="5838200" width="1920" height="1080">',
                '            </Representation>',
                '        </AdaptationSet>',
                '        <AdaptationSet segmentAlignment="true">',
                `            <SegmentTemplate timescale="1" duration="${this._chunkDuration}" initialization="$RepresentationID$/initial.mp4" media="$RepresentationID$/$Number$.m4s" startNumber="0">`,
                '            </SegmentTemplate>',
                '            <Representation id="1" mimeType="audio/mp4" codecs="mp4a.40.2" bandwidth="95000" audioSamplingRate="48000">',
                '                <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="1"/>',
                '            </Representation>',
                '        </AdaptationSet>',
                '    </Period>',
                '</MPD>',
            ].join('\n')
        }
    }
}