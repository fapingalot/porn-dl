#!/bin/sh

export MANGA_DIR="/home/audioxd/Pictures/Porn/Manga"
HOME_DIR="$(realpath "$(dirname "$0")")"

exec 5>&1

for n in $( xclip -selection c -o | grep "https://hentaifox.com/g\|https://nhentai.net/g" )
do
	cd "$HOME_DIR"
    MANGA_DIR_PATH="$(ts-node src/index.ts "$n" 2>/dev/null |tee /dev/fd/5 | sed -n 3p | cut -c 12-)"
    echo "$MANGA_DIR_PATH"

    # mega-put -q "$MANGA_DIR_PATH" $(dirname "$(realpath "$MANGA_DIR_PATH" --relative-base "$(dirname $MANGA_DIR)")") 

    cd "$MANGA_DIR_PATH"
    nohup xdg-open "$((ls *.png; ls *.jpg) | head -n1)" 0<&- &>/dev/null & disown
done
