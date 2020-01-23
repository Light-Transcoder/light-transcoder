# Light-Transcoder

This project contains an API to allows the real-time transcode of media files.  

## Try it
- `npm i` to install dependencies.
- `npm start` to launch the server.
- Go to `http://localhost:8585/web/`. Source code available here => https://github.com/Maxou44/light-transcoder-player
- Change the link if needed.
- Press enter
- Have fun!

## To Do
- Improve this Readme (WiP)
- Document the API
- Support Long Polling stream
- Support Download
- Support "Optimize"
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