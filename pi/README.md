# Raspberry PI

## Installation

Install raspberry os lite on a sd card, boot it up, create a user 'dendro' with password 'dendro'

Boot up the pi, go through set up.

On the pi, run raspi-config to enable SSH, configure wireless if needed, and set up auto login on console, figure out the IP of the raspberry.

From your machine, set up ssh keys (optional)

    ssh-copy-id -i ~/.ssh/id_rsa dendro@192.168.1.10

From your machine, copy over the scripts:

    scp color-mixer.js dendro@192.168.1.10:dendro/
    scp package.json dendro@192.168.1.10:dendro/
    scp loop.sh dendro@192.168.1.10:dendro/
    scp color-mixer.service dendro@192.168.1.10:dendro/color-mixer.script
    scp color-mixer.timer dendro@192.168.1.10:dendro/color-mixer.timer
    scp ngrok.serice dendro@192.168.1.10:

On the pi, run:

    curl -OJ "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz"
    tar -xvzf ngrok-v3-stable-linux-arm64.tgz
    sudo cp ngrok /usr/local/bin/
    sudo cp ngrok.service /etc/systemd/system/ngrioj.service
    sudo systemctl enable ngrok.service
    cd dendro
    apt-get install nodejs npm
    npm i
    sudo cp color-mixer.service /etc/systemd/system/color-mixer.service
    sudo cp color-mixer.timer /etc/systemd/system/color-mixer.timer
    sudo systemctl daemon-reload
    sudo systemctl enable color-mixer.service
    sudo systemctl enable color-mixer.timer

On the pi, enable read-only filesystem (overlay filesystem) in raspi-config

To see the service logs on the pi, run:

    journalctl -u color-mixer  -f

To make changes to the code you need to re-enable read/write mode on the file system, to do so disable overlay fs in raspi-config and reboot, remember to re-enable it afterwards to make the sd card happier.
