#!/bin/sh

export MANGA_DIR="/home/audioxd/Pictures/Porn"
HOME_DIR="$(realpath "$(dirname "$0")")"

for n in $( xclip -selection c -o | grep https://hentaifox.com/g )
do 
	cd "$HOME_DIR"
    node index.js "$n"

    cd "$MANGA_DIR/manga/.data/$(basename $n)"
    nohup xdg-open "$(ls *.jpg | head -n1)" 0<&- &>/dev/null &
done