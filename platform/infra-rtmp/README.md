# Local RTMP/HLS
- Ingest: rtmp://localhost/live (key: test)
- Playback: http://localhost:8000/hls/test.m3u8
Run:
  docker compose up -d
Stop:
  docker compose down
