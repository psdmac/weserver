#! /bin/sh

echo uninstall binary and configure files
sudo rm /usr/local/sbin/WeSensorGT02A
sudo rm /etc/init/WeSensorGT02A.conf
sudo rm /usr/local/etc/WeSensorGT02A.conf

echo done uninstallation of WeSensorGT02A
echo log files in /var/local/ are reserved
