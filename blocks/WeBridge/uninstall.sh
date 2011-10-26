#! /bin/sh

echo uninstall binary and configure files
sudo rm /usr/local/sbin/WeBridge
sudo rm /etc/init/WeBridge.conf
sudo rm /usr/local/etc/WeBridge.conf

echo done uninstallation of WeBridge
echo log files in /var/local/ are reserved
