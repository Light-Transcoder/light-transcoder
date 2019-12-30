## File "13.Reasons.Why.S01E05.MULTi.1080p.NF.WEBRip.x264.mkv"

### Start from begining of the file
```ffmpeg -f matroska -noaccurate_seek -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 copy -bsf:v h264_mp4toannexb -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 192000 -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 6  -individual_header_trailer 0 -break_non_keyframes 1 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 0 -segment_list ".\transcoding-temp\98360f9fc660108388a1eb493ce4235c.m3u8" -y ".\transcoding-temp\98360f9fc660108388a1eb493ce4235c%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 6 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 0 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\98360f9fc660108388a1eb493ce4235c_s3.m3u8" -y ".\transcoding-temp\98360f9fc660108388a1eb493ce4235c_s3%d.vtt"```

### Start from the middle of the file
```ffmpeg -ss 00:32:18.000  -f matroska -noaccurate_seek -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 copy -bsf:v h264_mp4toannexb -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 192000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 6 -segment_time_delta -1938 -individual_header_trailer 0 -break_non_keyframes 1 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 323 -segment_list ".\transcoding-temp\bb8d8fc3b9daa42d2586331269489b4e.m3u8" -y ".\transcoding-temp\bb8d8fc3b9daa42d2586331269489b4e%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 6 -segment_time_delta -1938 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 323 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\bb8d8fc3b9daa42d2586331269489b4e_s3.m3u8" -y ".\transcoding-temp\bb8d8fc3b9daa42d2586331269489b4e_s3%d.vtt"```

### Move in file
```ffmpeg -ss 00:24:18.000  -f matroska -noaccurate_seek -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 copy -bsf:v h264_mp4toannexb -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 192000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 6 -segment_time_delta -1458 -individual_header_trailer 0 -break_non_keyframes 1 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 243 -segment_list ".\transcoding-temp\98360f9fc660108388a1eb493ce4235c.m3u8" -y ".\transcoding-temp\98360f9fc660108388a1eb493ce4235c%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 6 -segment_time_delta -1458 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 243 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\98360f9fc660108388a1eb493ce4235c_s3.m3u8" -y ".\transcoding-temp\98360f9fc660108388a1eb493ce4235c_s3%d.vtt"```

### 144p
```ffmpeg -ss 00:24:33.000  -f matroska -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 libx264 -filter_complex "[0:0]scale=trunc(min(max(iw\,ih*dar)\,426)/2)*2:trunc(ow/dar/2)*2" -pix_fmt yuv420p  -maxrate 64000 -bufsize 128000 -preset veryfast -profile:v:0 high -level:v:0 4.1 -crf 23 -x264opts:0 subme=0:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none -g:v:0 72 -keyint_min:v:0 72 -sc_threshold:v:0 0  -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 128000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 3  -individual_header_trailer 0 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 491 -segment_list ".\transcoding-temp\809d607ef8db984eddb404c2cdc25663.m3u8" -y ".\transcoding-temp\809d607ef8db984eddb404c2cdc25663%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 3 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 491 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\809d607ef8db984eddb404c2cdc25663_s3.m3u8" -y ".\transcoding-temp\809d607ef8db984eddb404c2cdc25663_s3%d.vtt"```

### 240p
```ffmpeg -ss 00:24:42.000  -f matroska -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 libx264 -filter_complex "[0:0]scale=trunc(min(max(iw\,ih*dar)\,426)/2)*2:trunc(ow/dar/2)*2" -pix_fmt yuv420p  -maxrate 192000 -bufsize 384000 -preset veryfast -profile:v:0 high -level:v:0 4.1 -crf 23 -x264opts:0 subme=0:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none -g:v:0 72 -keyint_min:v:0 72 -sc_threshold:v:0 0  -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 128000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 3  -individual_header_trailer 0 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 494 -segment_list ".\transcoding-temp\d2a5de54a9c0e53a9a1742e8e7fb8b5f.m3u8" -y ".\transcoding-temp\d2a5de54a9c0e53a9a1742e8e7fb8b5f%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 3 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 494 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\d2a5de54a9c0e53a9a1742e8e7fb8b5f_s3.m3u8" -y ".\transcoding-temp\d2a5de54a9c0e53a9a1742e8e7fb8b5f_s3%d.vtt"```

### 360p
```ffmpeg -ss 00:24:48.000  -f matroska -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 libx264 -filter_complex "[0:0]scale=trunc(min(max(iw\,ih*dar)\,426)/2)*2:trunc(ow/dar/2)*2" -pix_fmt yuv420p  -maxrate 272000 -bufsize 544000 -preset veryfast -profile:v:0 high -level:v:0 4.1 -crf 23 -x264opts:0 subme=0:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none -g:v:0 72 -keyint_min:v:0 72 -sc_threshold:v:0 0  -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 128000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 3  -individual_header_trailer 0 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 496 -segment_list ".\transcoding-temp\92f7800a2695e54226f6f64780e63b5f.m3u8" -y ".\transcoding-temp\92f7800a2695e54226f6f64780e63b5f%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 3 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 496 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\92f7800a2695e54226f6f64780e63b5f_s3.m3u8" -y ".\transcoding-temp\92f7800a2695e54226f6f64780e63b5f_s3%d.vtt"```

### 480p (420k)
```ffmpeg -ss 00:24:54.000  -f matroska -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 libx264 -filter_complex "[0:0]scale=trunc(min(max(iw\,ih*dar)\,426)/2)*2:trunc(ow/dar/2)*2" -pix_fmt yuv420p  -maxrate 292000 -bufsize 584000 -preset veryfast -profile:v:0 high -level:v:0 4.1 -crf 23 -x264opts:0 subme=0:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none -g:v:0 72 -keyint_min:v:0 72 -sc_threshold:v:0 0  -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 128000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 3  -individual_header_trailer 0 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 498 -segment_list ".\transcoding-temp\3cb8f598aa129d4e4b58d05dd650db49.m3u8" -y ".\transcoding-temp\3cb8f598aa129d4e4b58d05dd650db49%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 3 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 498 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\3cb8f598aa129d4e4b58d05dd650db49_s3.m3u8" -y ".\transcoding-temp\3cb8f598aa129d4e4b58d05dd650db49_s3%d.vtt"```

### 480p (720k)
```ffmpeg -ss 00:25:12.000  -f matroska -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 libx264 -filter_complex "[0:0]scale=trunc(min(max(iw\,ih*dar)\,640)/2)*2:trunc(ow/dar/2)*2" -pix_fmt yuv420p  -maxrate 528000 -bufsize 1056000 -preset veryfast -profile:v:0 high -level:v:0 4.1 -crf 23 -x264opts:0 subme=0:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none -g:v:0 72 -keyint_min:v:0 72 -sc_threshold:v:0 0  -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 192000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 3  -individual_header_trailer 0 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 504 -segment_list ".\transcoding-temp\ece1cc799b1f32c93b4df53bfc82ac9b.m3u8" -y ".\transcoding-temp\ece1cc799b1f32c93b4df53bfc82ac9b%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 3 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 504 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\ece1cc799b1f32c93b4df53bfc82ac9b_s3.m3u8" -y ".\transcoding-temp\ece1cc799b1f32c93b4df53bfc82ac9b_s3%d.vtt"```

### 480 (1M)
```ffmpeg -ss 00:25:21.000  -f matroska -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 libx264 -filter_complex "[0:0]scale=trunc(min(max(iw\,ih*dar)\,640)/2)*2:trunc(ow/dar/2)*2" -pix_fmt yuv420p  -maxrate 808000 -bufsize 1616000 -preset veryfast -profile:v:0 high -level:v:0 4.1 -crf 23 -x264opts:0 subme=0:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none -g:v:0 72 -keyint_min:v:0 72 -sc_threshold:v:0 0  -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 192000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 3  -individual_header_trailer 0 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 507 -segment_list ".\transcoding-temp\4dd2a7417d578135e149cc2ab7228b09.m3u8" -y ".\transcoding-temp\4dd2a7417d578135e149cc2ab7228b09%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 3 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 507 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\4dd2a7417d578135e149cc2ab7228b09_s3.m3u8" -y ".\transcoding-temp\4dd2a7417d578135e149cc2ab7228b09_s3%d.vtt"```

### 720p (1M)
```ffmpeg -ss 00:26:00.000  -f matroska -i file:"file.mkv" -threads 1 -map 0:0 -map 0:1 -sn -c:v:0 libx264 -filter_complex "[0:0]scale=trunc(min(max(iw\,ih*dar)\,640)/2)*2:trunc(ow/dar/2)*2" -pix_fmt yuv420p  -maxrate 808000 -bufsize 1616000 -preset veryfast -profile:v:0 high -level:v:0 4.1 -crf 23 -x264opts:0 subme=0:me_range=4:rc_lookahead=10:me=dia:no_chroma_me:8x8dct=0:partitions=none -g:v:0 72 -keyint_min:v:0 72 -sc_threshold:v:0 0  -copyts -vsync -1 -codec:a:0 libmp3lame -metadata:s:a:0 language=fre -disposition:a:0 default -ac:a:0 2 -ab:a:0 192000  -f segment -max_delay 5000000 -avoid_negative_ts disabled -map_metadata -1 -map_chapters -1 -start_at_zero -segment_time 3  -individual_header_trailer 0 -segment_format mpegts -segment_write_temp 1 -segment_list_type m3u8 -segment_start_number 520 -segment_list ".\transcoding-temp\4dd2a7417d578135e149cc2ab7228b09.m3u8" -y ".\transcoding-temp\4dd2a7417d578135e149cc2ab7228b09%d.ts" -map 0:3 -codec:0 webvtt -copyts -vsync -1 -f segment -segment_time 3 -segment_format webvtt -max_delay 5000000 -avoid_negative_ts disabled -start_at_zero -write_empty_segments 1 -segment_list_type m3u8 -segment_start_number 520 -segment_write_temp 1 -break_non_keyframes 1 -segment_list ".\transcoding-temp\4dd2a7417d578135e149cc2ab7228b09_s3.m3u8" -y ".\transcoding-temp\4dd2a7417d578135e149cc2ab7228b09_s3%d.vtt"```


### Cleaned data
|name|audio quality| image resolution| 
|--|--|--|
|144p|128000|426|
|240p|128000|426|
|360p|128000|426|
|480p (420k)|128000|426|
|480p (720k)|192000|640|
|480p (1M)|192000|640|
|720p (1M)|192000|640|
|720p (1.5M)|192000|640|