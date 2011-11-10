#! /bin/sh

echo install binary and configure files
sudo cp bin/WeRealtimeGT02A                       /usr/local/sbin/WeRealtimeGT02A
sudo cp etc/usr-local-etc-WeRealtimeGT02A.conf    /usr/local/etc/WeRealtimeGT02A.conf
sudo cp etc/etc-init-WeRealtimeGT02A.conf         /etc/init/WeRealtimeGT02A.conf

echo done installation of WeRealtimeGT02A
echo bin dir: /usr/local/sbin/
echo etc dir: /usr/local/etc/
echo log dir: /var/local/
