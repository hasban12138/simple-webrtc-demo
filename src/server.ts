
const Koa = require('koa');
const path = require('path');
const koaSend = require('koa-send');
const static = require('koa-static');
const socket = require('koa-socket');
const users: any = {}; // 保存用户
const sockS: any = {}; // 保存客户端对应的socket
const io = new socket({
  ioOptions: {
    pingTimeout: 10000,
    pingInterval: 5000,
  }
});

const app = new Koa();
io.attach(app);

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx: any, next: any) => {
  if (!/\./.test(ctx.request.url)) {
    await koaSend(
      ctx,
      'index.html',
      { root: `${__dirname}/..` }
    );
  } else {
    await next();
  }
});

app._io.on('connection', (sock: any) => {
  sock.on('join', (data: any) => {
    sock.join(data.roomid, () => {
      if (!users[data.roomid]) {
        users[data.roomid] = [];
      }
      let obj = {
        account: data.account,
        id: sock.id
      };
      let arr = users[data.roomid].filter((v: any) => v.account === data.account);
      if (!arr.length) {
        users[data.roomid].push(obj);
      }
      sockS[data.account] = sock;
      app._io.in(data.roomid).emit('joined', users[data.roomid], data.account, sock.id); // 发给房间内所有人
    });
  });
  sock.on('offer', (data: any) => {4
    sock.to(data.roomid).emit('offer', data);
  });
  sock.on('answer', (data: any) => {
    sock.to(data.roomid).emit('answer', data);
  });
  sock.on('__ice_candidate', (data: any) => {
    sock.to(data.roomid).emit('__ice_candidate', data);
  });
  sock.on('leave', (data: any) => {
    let u = users[data.roomid];
    if (u) {
      users[data.roomid] = u.filter((v: any) => v.id !== sock.id);
      sock.to(data.roomid).emit('leave', data);
    }
  });
});

let port = 3011;
app.listen(port, (_: any) => {
  console.log('app started at port ...' + port);
});