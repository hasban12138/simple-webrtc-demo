#  simple webrtc demo

[中文](https://github.com/hasban12138/simple-webrtc-demo/blob/master/README.md) | English

Refer to [webrtc-stream](https://github.com/wuyawei/webrtc-stream) for simplification, directly enter the webpage to connect p2p without any other operations

## Start
```
npm i

npm dev

Open http://localhost:8087/ in your browser
```

## Multi-device
Change files

[socket.ts](https://github.com/hasban12138/simple-webrtc-demo/blob/master/src/socket.ts)
```javascript
const socket = io('http://localhost:3011');
```
[index.html](https://github.com/hasban12138/simple-webrtc-demo/blob/master/index.html)
```html
<script src="http://localhost:3011/socket.io/socket.io.js"></script>
```
```localhost``` to your computer's ip

Open http://(your ip):8087/ in your browser