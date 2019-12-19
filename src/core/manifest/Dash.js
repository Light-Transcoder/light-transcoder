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
const streams = [


]
 // Codec compat : https://shaka-player-demo.appspot.com/support.html
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
                `    mediaPresentationDuration="${getTimeString(this._duration)}"`,
                `    minBufferTime="${getTimeString(this._chunkDuration)}">`,
                `    <Period start="${getTimeString(0)}" duration="${getTimeString(this._duration)}">`,
                '        <AdaptationSet contentType="video" segmentAlignment="true" bitstreamSwitching="true" lang="und">',
                '            <Representation id="0" mimeType="video/mp4" codecs="avc1.640028" width="1920" height="1080" frameRate="30000/1001">',
                `                <SegmentTemplate duration="${this._chunkDuration}" timescale="1" initialization="$RepresentationID$/initial.mp4" media="$RepresentationID$/$Number$.m4s" startNumber="0">`,
                '                </SegmentTemplate>',
                '            </Representation>',
                '        </AdaptationSet>',
                '        <AdaptationSet contentType="audio" segmentAlignment="true" bitstreamSwitching="true" lang="eng">',
                '            <Representation id="1" mimeType="audio/mp4" codecs="mp4a.40.2"  audioSamplingRate="48000">',
                '                <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="2" />',
                `                <SegmentTemplate duration="${this._chunkDuration}" timescale="1" initialization="$RepresentationID$/initial.mp4" media="$RepresentationID$/$Number$.m4s" startNumber="0">`,
                '                </SegmentTemplate>',
                '            </Representation>',
                '        </AdaptationSet>',
                '    </Period>',
                '</MPD>',
            ].join('\n')
        }
    }
}