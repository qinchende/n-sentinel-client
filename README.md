# n-sentinel-client
这是服务器监控工具 **[n-sentinel]** 的客户端；目前用`Node.js`实现。

Client：[n-sentinel-client](https://github.com/qinchende/n-sentinel-client)

Server：[n-sentinel-server](https://github.com/qinchende/n-sentinel-server)

ManagerPages：[n-sentinel-view](https://github.com/qinchende/n-sentinel-view)



### Requirements

Node.js v8 LTS or later.

请先确保你的服务器上安装了Node.js的可执行程序。

```sh
whereis node
node: /usr/local/bin/node
# 如果你的路径不是这个，修改一下n_sentinel_alive.sh中的node路径
```

### Quick start

**下载源代码**

在服务器 `/opt` 目录下下载源代码：

git clone https://github.com/qinchende/n-sentinel-client.git

或通过FTP工具把项目上传到服务器`/opt`目录下面

**修改监听IP**

```js
// vi app.js
// 将host改成自己服务器的IP地址，将来server要通过host:port访问这个HTTP Server.
// 为了 安全考虑，最好监听内网网卡。
let Env = {
    host: '10.10.10.11',
    port: 49119,
    secret: 'n*sentinel*XYz'
};
```

注意上面的`secret`字段需要修改一个随机的字符序列，`client`和`server`段一致即可。

**配置任务计划自动监控重启**

```sh
# cat n_sentinel_alive.sh 
# 在上面这个文件中有一句脚本，将其加入cronteb
# */1 * * * * sh /opt/n-sentinel-client/n_sentinel_alive.sh >> /opt/n-sentinel-client/alive.log 2>&1 &
# 使用命令：crontab -e ，加好之后保存退出即可。
```

这样服务器每一分钟都会检查node进程，如果没有了，就会自动重启。稍等片刻，在项目根目录你能看到两个日志文件：

```sh
# cat alive.log
[20201130_163401] CHECK ----------------
[RE] n-sentinel-client done
[20201130_163501] CHECK ----------------
[S] n-sentinel-client exist

# cat log.log
Hi, I am the master process.
Worker express listening on 10.10.10.11:49119 # 看到这个证明你client启动成功
```

到这里服务器上的收集程序就部署好了，他会一直等着server调用收集他的状态。