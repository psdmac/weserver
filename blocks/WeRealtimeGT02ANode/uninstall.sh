#! /bin/sh

echo uninstall binary and configure files
sudo rm /usr/local/sbin/WeRealtimeGT02ANode.js
sudo rm /usr/local/etc/WeRealtimeGT02ANode.conf
sudo rm /etc/init/WeRealtimeGT02ANode.conf

echo done uninstallation of WeRealtimeGT02ANode
echo log files in /var/local/ are reserved
