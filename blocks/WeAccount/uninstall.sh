#! /bin/sh

echo uninstall binary and configure files
sudo rm /usr/local/sbin/WeAccount.js
sudo rm /usr/local/etc/WeAccount.conf
sudo rm /etc/init/WeAccount.conf

echo done uninstallation of WeAccount
echo log files in /var/local/ are reserved
