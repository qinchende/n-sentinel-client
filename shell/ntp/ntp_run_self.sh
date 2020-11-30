#!/bin/bash

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# Created by cd.net on 2020-04-25
# 下面的配置跑在 server 上面。 每8个小时和公网的时间服务器同步
# 0 */8 * * * /bin/sh /opt/n-sentinel-client/shell/ntp/ntp_run_self.sh
systemctl stop ntpd.service
sleep 3
/usr/sbin/ntpdate ntp1.aliyun.com 0.cn.pool.ntp.org 0.uk.pool.ntp.org; /sbin/hwclock -w
systemctl start ntpd.service

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# 下面这个一般用于 client 端，每天同步一次时间即可
#12 03 * * * /usr/sbin/ntpdate 10.10.10.11 10.10.10.12; /sbin/hwclock -w
