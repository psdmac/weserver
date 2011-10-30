#! /bin/sh

echo install binary and configure files
sudo cp src/WeRealtimeGT02ANode.js                  /usr/local/sbin/WeRealtimeGT02ANode.js
sudo cp etc/usr-local-etc-WeRealtimeGT02ANode.conf  /usr/local/etc/WeRealtimeGT02ANode.conf
sudo cp etc/etc-init-WeRealtimeGT02ANode.conf       /etc/init/WeRealtimeGT02ANode.conf

echo done installation of WeRealtimeGT02ANode
echo bin dir: /usr/local/sbin/
echo etc dir: /usr/local/etc/
echo log dir: /var/local/
