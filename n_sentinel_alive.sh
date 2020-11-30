#!/bin/sh

# 加入每分钟自动检测保活验证。
# crontab -e
# */1 * * * * sh /opt/n-sentinel-client/n_sentinel_alive.sh >> /opt/n-sentinel-client/alive.log 2>&1 &

cur_time=`date +%Y%m%d_%H%M%S`
echo [$cur_time] CHECK ----------------

RET=`ps awx|grep "/opt/n-sentinel-client/app.js" |grep -v grep`
if [ -n "$RET" ]
then
    echo "[S] n-sentinel-client exist"
else
    /usr/local/bin/node /opt/n-sentinel-client/app.js >> /opt/n-sentinel-client/log.log 2>&1 &
    echo "[RE] n-sentinel-client done"
fi
