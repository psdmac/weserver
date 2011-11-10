#! /bin/sh

echo install binary and configure files
sudo cp src/WeRealtimeGT02A.js                  /usr/local/sbin/WeRealtimeGT02A.js
sudo cp etc/usr-local-etc-WeRealtimeGT02A.conf  /usr/local/etc/WeRealtimeGT02A.conf
sudo cp etc/etc-init-WeRealtimeGT02A.conf       /etc/init/WeRealtimeGT02A.conf

echo done installation of WeRealtimeGT02A
echo bin dir: /usr/local/sbin/
echo etc dir: /usr/local/etc/
echo log dir: /var/local/
