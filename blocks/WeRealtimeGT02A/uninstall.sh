#! /bin/sh

echo uninstall binary and configure files
sudo rm /usr/local/sbin/WeRealtimeGT02A.js
sudo rm /usr/local/etc/WeRealtimeGT02A.conf
sudo rm /etc/init/WeRealtimeGT02A.conf

echo done uninstallation of WeRealtimeGT02A
echo log files in /var/local/ are reserved
