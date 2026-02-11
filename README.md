# 简单webrtc demo

中文 | [English](https://github.com/hasban12138/simple-webrtc-demo/blob/master/docs/README_EN.md)

参考[webrtc-stream](https://github.com/wuyawei/webrtc-stream)精简，直接进入网页即可p2p连接无序任何其他操作

## 使用方法
```
npm i

npm dev

在浏览器中打开 http://localhost:8087/
```

## 多设备连接
修改

[socket.ts](https://github.com/hasban12138/simple-webrtc-demo/blob/master/src/socket.ts)
```javascript
const socket = io('http://localhost:3011');
```
[index.html](https://github.com/hasban12138/simple-webrtc-demo/blob/master/index.html)
```html
<script src="http://localhost:3011/socket.io/socket.io.js"></script>
```
中的```localhost```为你的电脑ip

在浏览器中打开 http://你的ip:8087/