#! /bin/sh

echo install binary and configure files
sudo cp bin/WeBridge                       /usr/local/sbin/WeBridge
sudo cp etc/etc-init-WeBridge.conf         /etc/init/WeBridge.conf
sudo cp etc/usr-local-etc-WeBridge.conf    /usr/local/etc/WeBridge.conf

echo done installation of WeBridge
echo bin dir: /usr/local/sbin/
echo etc dir: /usr/local/etc/
echo log dir: /var/local/
