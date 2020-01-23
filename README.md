# Light-Transcoder

This project contains an API to allows the real-time transcode of media files.  

## Try it
- `npm i` to install dependencies.
- `npm start` to launch the server.
- Go to `http://localhost:8585/`. Source code available here => https://github.com/Maxou44/light-transcoder-player
- Change the link if needed.
- Press enter
- Have fun! 😉

## To Do
- Avoid rescale if not needed...
- Improve this Readme (WiP)
- Document the API
- Support Long-Polling stream
- Support Download (WiP) => In future it should proxy the url path
- Support "Optimize"
- Extract FFmpeg status (speed / informations)
- Seek support (Ask not generated chunk should move the transcoder)
- Detect input codec and bind the correct decoder
- Hardware decoding/encoding (require previous line)
- Support multi-audio output (WiP)
- Auto quality support
- Support subtitle extract / burn
- Webm / VP8 / VP9 / HEVC profiles (AV1?)
- Feat: Direct stream and FFmpeg speed limit