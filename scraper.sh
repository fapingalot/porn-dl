#!/bin/sh

export MANGA_DIR="/home/audioxd/Pictures/Porn/Manga" # Wehere to save the manga
HOME_DIR="$(realpath "$(dirname "$0")")"

for n in {59663..1}
do
	cd "$HOME_DIR"
    node index.js "$n"
done