/* Shuffles a playlist with respect to different category songs */
function priorityShuffle(playlist, pregame, bigSongs, singalongs, standard) {
	var length = playlist.length;
	var singAlongStart = Math.floor(.75 * length - 1);
	var bigGap = Math.floor((singAlongStart - pregame.length) / bigSongs.length);

	var preShuffle = shuffle(pregame);
	var bigShuffle = shuffle(bigSongs);
	var singShuffle = shuffle(singalongs);
	var standardShuffle = shuffle(standard);

	var preLength = preShuffle.length, bigLength = bigShuffle.length, singLength = singShuffle.length, standardLength = standardShuffle.length;

	var shuffled = playlist;

	/* Inserts shuffled intro songs at the beginning */
	for (var i = 0; i < preLength; i++) {
		shuffled[i] = preShuffle[i];
	}

	var bigCounter = 0, singCounter = 0, standardCounter = 0;

	for (var j = preLength, jj = length; j < jj; j++) {
		/* Spaces out big songs */
		if (j % bigGap === 0 && bigCounter < bigLength) {
			shuffled[j] = bigShuffle[bigCounter];
			bigCounter++;
		} else {
			/* Places singalongs near the end */
			if (j >= singAlongStart) {
				/* Randomly chooses between normal and singalong songs while checking if they're empty */
				if ((Math.random() > .5 || standardCounter >= standardLength) && singCounter < singLength) {
					shuffled[j] = singShuffle[singCounter];
					singCounter++;
				} else if (standardCounter < standardLength) {
					shuffled[j] = standardShuffle[standardCounter];
					standardCounter++;
				}
			} else if (standardCounter < standardLength) {
				shuffled[j] = standardShuffle[standardCounter];
				standardCounter++;
			}
		}
	}
	return shuffled;
}

/* Taken from code adapted from Fisher-Yates Shuffle http://bost.ocks.org/mike/shuffle/*/
function shuffle(array) {
    var counter = array.length, temp, index;
    while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;

        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}