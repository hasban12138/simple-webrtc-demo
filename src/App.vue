<template>
  <div class="room">
    <div class="video-box" ref="video-box">
      <video class="video-mine" autoplay controls ref="video-mine"></video>
    </div>
  </div>
</template>

<script lang="ts">
import socket from './socket';
import { v4 } from 'uuid';
import { defineComponent } from 'vue'
interface Idata {
  roomid: number,
  account: any,
  peer: any,
  peerList: any,
  candidate: any,
  localStream: MediaStream,
}
export default defineComponent({
  name: 'home',
  data(): Idata {
    return {
      roomid: 1,
      account: `_${v4().substring(0, 5)}`,
      peer: null,
      peerList: {},
      candidate: null,
      localStream: null
    }
  },
  watch: {
    userList: {
      handler() {
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.desctroy();
  },
  methods: {
    desctroy() {
      for (let k in this.peerList) {
        this.peerList[k].close();
        this.peerList[k] = null;
      }
      socket.emit('leave', { account: this.account, roomid: this.roomid });
    },
    getUserMedia() {
      let myVideo = this.$refs['video-mine'];
      navigator.mediaDevices.getUserMedia({
        audio: true, video: true,
      })
        .then((stream) => {
          myVideo.srcObject = stream;
          this.localStream = stream;
          socket.emit('join', { roomid: this.roomid, account: this.account })
        }).catch(() => {

        });
    },
    getPeerConnection(v: any) {
      let videoBox = this.$refs['video-box'];
      let PeerConnection = window.RTCPeerConnection;
      let peer = new PeerConnection();
      //向PeerConnection中加入需要发送的流
      const localStream: MediaStream = this.localStream;
      for (const t of localStream.getTracks()) {
        peer.addTrack(t);
      }

      let inboundStream: MediaStream = null;

      peer.ontrack = (e) => {
        let video = document.querySelector('#' + v.account) as HTMLVideoElement;
        if (!video) {
          video = document.createElement('video');
          video.controls = true;
          video.autoplay = true;
          video.id = v.account;
          videoBox.append(video);
        }
        if (e.streams && e.streams[0]) {
          video.srcObject = e.streams[0];
        } else {
          if (!inboundStream) {
            inboundStream = new MediaStream();
            video.srcObject = inboundStream;
          }
        }
        inboundStream.addTrack(e.track);
      };
      //发送ICE候选到其他客户端
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('__ice_candidate', { 'candidate': event.candidate, roomid: this.roomid, account: v.account });
        }
      };
      this.peerList[v.account] = peer;
    },
    createOffer(account: any, peer: any) {
      //发送offer，发送本地session描述
      peer.createOffer({
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      }).then((desc: any) => {
        peer.setLocalDescription(desc, () => {
          socket.emit('offer', { 'sdp': peer.localDescription, roomid: this.roomid, account: account });
        });
      });
    },
    socketInit() {
      socket.on('offer', (v: any) => {
        this.peerList[v.account] && this.peerList[v.account].setRemoteDescription(v.sdp, () => {
          this.peerList[v.account].createAnswer().then((desc: any) => {
            this.peerList[v.account].setLocalDescription(desc, () => {
              socket.emit('answer', { 'sdp': this.peerList[v.account].localDescription, roomid: this.roomid, account: v.account });
            });
          });
        }, () => {
        });
      });
      socket.on('answer', (v: any) => {
        console.log('take_answer', v.sdp);
        this.peerList[v.account] && this.peerList[v.account].setRemoteDescription(v.sdp, function () { }, () => {// console.log(err)
        });
      });
      socket.on('__ice_candidate', (v: any) => {
        //如果是一个ICE的候选，则将其加入到PeerConnection中
        if (v.candidate) {
          this.peerList[v.account] && this.peerList[v.account].addIceCandidate(v.candidate).catch(() => { }// console.log('err', e)
          );
        }
      });
      socket.on('leave', (data: any) => {
        const id = [this.account, data.account].sort().join('_');
        let dom = document.querySelector('#' + id);
        if (dom) {
          dom.remove();
        }
      });
      socket.on('joined', (data: any, account: any) => {
        if (data.length > 1) {
          data.forEach((v: any) => {
            let obj: any = {};
            let arr = [v.account, this.account];
            obj.account = arr.sort().join('_');
            if (!this.peerList[obj.account] && v.account !== this.account) {
              this.getPeerConnection(obj);
            }
          });
          if (account === this.account) {
            for (let k in this.peerList) {
              this.createOffer(k, this.peerList[k]);
            }
          }
        }
      });
    },
  },
  mounted() {
    window.addEventListener('beforeunload', this.desctroy);
    this.$nextTick(() => {
      this.getUserMedia();
      this.socketInit();
    });
  },
});
</script>
