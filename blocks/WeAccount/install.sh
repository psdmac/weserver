#! /bin/sh

echo install binary and configure files
sudo cp src/WeAccount.js                  /usr/local/sbin/WeAccount.js
sudo cp etc/usr-local-etc-WeAccount.conf  /usr/local/etc/WeAccount.conf
sudo cp etc/etc-init-WeAccount.conf       /etc/init/WeAccount.conf

echo done installation of WeAccount
echo bin dir: /usr/local/sbin/
echo etc dir: /usr/local/etc/
echo log dir: /var/local/
