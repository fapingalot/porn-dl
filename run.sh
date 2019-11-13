#!/bin/sh

export MANGA_DIR="/home/audioxd/Pictures/Porn/Manga"
HOME_DIR="$(realpath "$(dirname "$0")")"

for n in $( xclip -selection c -o | grep https://hentaifox.com/g )
do 
	cd "$HOME_DIR"
    node index.js "$n"
done