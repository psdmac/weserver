#! /bin/sh

echo install binary and configure files
sudo cp bin/WeSensorGT02A                       /usr/local/sbin/WeSensorGT02A
sudo cp etc/etc-init-WeSensorGT02A.conf         /etc/init/WeSensorGT02A.conf
sudo cp etc/usr-local-etc-WeSensorGT02A.conf    /usr/local/etc/WeSensorGT02A.conf

echo done installation of WeSensorGT02A
echo bin dir: /usr/local/sbin/
echo etc dir: /usr/local/etc/
echo log dir: /var/local/
