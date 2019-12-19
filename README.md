# Light-Transcoder

This project contains an API to allows the real-time transcode of media files.  

To test it:

- `npm i` to install dependencies.
- `npm start` to launch the server.
- Go to `http://localhost:8585/demo/`.
- Change the link if needed (By default it uses a `test.mkv` file in the `public` folder) The file isn't provided, you need to add it.
- Click on  `load file` to start media analysis.
- Choose quality and tracks
- Click on `Play!`.

Note: Direct stream only works if codecs can be played in your browser

# To Do
- Improve this Readme (WiP)
- Document the API
- Support Dash stream (WiP)
- Support Long Polling stream
- Support Download
- Support "Optimize"
- Improve the ChunkStore
- Extract ffmpeg status (speed / informations)
- Seek support (Ask not generated chunk should move the transcoder)
- Detect input codec and bind the correct decoder
- Hardware decoding/encoding (require previous line)
- Support multi-audio output
- Auto quality support
- Support subtitle extract / burn
- In the future, apps could send they codec map support and the StreamingBrain will choose the best protocol/codec to stream
- Webm / VP8 / VP9 / HEVC profiles (AV1?)
- Feat: Direct stream and ffmpeg speed limit

## API Draft (NEED TO BE UPDATED)

This part is not up to date, check the demo code for more information 

**POST** `/media/analyze`
```
{
    "url" : "http://file.mkv"
}
```

**POST** `/session`
```
{
    "url" : "http://file.mkv"
    "profile" : 5 // profile id
}
```
--------
```
{
    "session": {
        "uuid": "2fc083ff-f264-42d5-8d53-a50e175f1769",
        "stream": {
            "type": "HLS",
            "url": "http://localhost:8585/session/2fc083ff-f264-42d5-8d53-a50e175f1769/hls/master.m3u8"
        }
    }
}
```

## DRAFT supported codec map

```
[{
    "type": "HLS",
    "video" : [
        {"codec": "h264"},
        {"codec": "webm"},
    ],
    "audio" : [
        {"codec": "aac"},
        {"codec": "ogg"},
    ]
}]
```