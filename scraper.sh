#!/bin/sh

export MANGA_DIR="/home/audioxd/Pictures/Manga" # Wehere to save the manga
HOME_DIR="$(realpath "$(dirname "$0")")"

for n in {1..59663}
do
	cd "$HOME_DIR"
    node index.js "$n"
done