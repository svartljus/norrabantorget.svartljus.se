# Raspberry PI

## Installation

Install raspberry os lite on a sd card, boot it up, create a user 'dendro' with password 'dendro'

Boot up the pi, go through set up.

On the pi, run raspi-config to enable SSH, configure wireless if needed, and set up auto login on console, figure out the IP of the raspberry.

From your machine, set up ssh keys (optional)

    ssh-copy-id -i ~/.ssh/id_rsa dendro@raspberry-ip

From your machine, copy over the scripts:

    scp color-mixer.js dendro@raspberry-ip:dendro/
    scp package.json dendro@raspberry-ip:dendro/
    scp loop.sh dendro@raspberry-ip:dendro/
    scp color-mixer.service dendro@raspberry-ip:dendro/color-mixer.script

On the pi, run:

    cd dendro
    apt-get install nodejs npm
    npm i
    sudo cp color-mixer.service /etc/systemd/system/color-mixer.service
    sudo systemctl daemon-reload
    sudo systemctl enable color-mixer.service

On the pi, enable read-only filesystem (overlay filesystem) in raspi-config

To see the service logs on the pi, run:

    journalctl -u color-mixer  -f

To make changes to the code you need to re-enable read/write mode on the file system, to do so disable overlay fs in raspi-config and reboot, remember to re-enable it afterwards to make the sd card happier.


