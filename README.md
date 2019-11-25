# Light-Transcoder

This project contains an API to allows the real-time transcode of media files.  

To test it:

- `npm i` to install dependencies.
- `npm start` to launch the server.
- Go to `http://localhost:8585/demo/`.
- Change the link if needed (By default it uses the `test.mkv` file in the `public` folder) The file isn't provided, you need to add it.
- Click on  `load file` to start media analysis.
- Choose quality and tracks.
- Clic on `Play!`.

Note: The direct stream can failed if the original codec is not supported by your browser


## API Draft (NEED TO BE UPDATED)

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