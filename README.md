# Light-Transcoder

This project contains an API to allows the real-time transcode of media files.  

To test it:

- `npm i` to install dependencies.
- Add a file named `test.mkv` in the root folder.
- Tweak the `streamingBrain.js` file :
    - **_inputVideoStream** => The ffmpeg video input stream
    - **_inputAudioStream** => The ffmpeg audio input stream
    - **_chunkDuration** => The HLS chunk duration
    - **_videoDirectStream** => If true, it will serve the original video stream
    - **_audioDirectStream** => If true, it will serve the original audio stream
    - **_outputFPS** => The FPS output value
    - **_duration** => Duration of your file in seconds
    - **_profile** => Id in the profile array (Available at the end of the file)
- run `npm start`
- The soft will create a tmp directory and start a ffmpeg, the stream will be available on `http://localhost:8585/master.m3u8` and it can be tested here : `https://shaka-player-demo.appspot.com/demo/#audiolang=en-US;textlang=en-US;uilang=en-US;asset=http://localhost:8585/master.m3u8;panel=CUSTOM%20CONTENT;build=uncompiled`  


## API Draft

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