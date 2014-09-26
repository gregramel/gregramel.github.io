var PREGAME = ["Swimming Pools", "Bitch Don't Kill My Vibe", "Poetic Justice", "Big Spender", "White Walls", "i"];

var BIG_SONGS = ["Mr. Brightside", "Wasted", "Timber", "Club Can't Handle Me", "Anaconda"];

var DRUNK_SINGALONGS = ["Shake It Off", "Last Friday Night", "Party in the USA", "22", "Hot and Cold"];

// var STANDARD = []

var STANDARD = ["Niggas in Paris", "#SELFIE", "Starships", "Animals", "Pursuit of Happiness", "Turn Down for What", "Talk Dirty to Me"];

var PLAYLIST = ["Swimming Pools", "Bitch Don't Kill My Vibe", "Poetic Justice", "Big Spender", "White Walls", "i", "Mr. Brightside", "Wasted", "Timber", "Club Can't Handle Me", "Anaconda", "Shake It Off", "Last Friday Night", "Party in the USA", "22"
, "Hot and Cold", "Niggas in Paris", "#SELFIE", "Starships", "Animals", "Pursuit of Happiness", "Turn Down for What", "Talk Dirty to Me"];

// var PLAYLIST = ["Swimming Pools", "Bitch Don't Kill My Vibe", "Poetic Justice", "Big Spender", "White Walls", "i", "Mr. Brightside", "Wasted", "Timber", "Club Can't Handle Me", "Anaconda", "Shake It Off", "Last Friday Night", "Party in the USA", "22"
// , "Hot and Cold"];

function priorityShuffle(playlist, pregame, bigSongs, singalongs, standard) {
	var length = playlist.length;
	var singAlongStart = Math.floor(.75 * length - 1);
	var bigGap = Math.floor((singAlongStart - pregame.length) / bigSongs.length);

	preShuffle = shuffle(pregame);
	bigShuffle = shuffle(bigSongs);
	singShuffle = shuffle(singalongs);
	normalShuffle = shuffle(standard);

	console.log(preShuffle.length, bigShuffle.length, singShuffle.length, normalShuffle.length);

	shuffled = playlist;
	for (var i = 0, ii = preShuffle.length; i < ii; i++) {
		shuffled[i] = preShuffle[i];
	}
	console.log('Big gap', bigGap);
	var bigCounter = 0, singCounter = 0, standardCounter = 0;

	for (var j = preShuffle.length, jj = length; j < jj; j++) {
		if (j % bigGap === 0 && bigCounter < bigShuffle.length) {
			shuffled[j] = bigShuffle[bigCounter];
			bigCounter++;
		} else {
			if (j >= singAlongStart) {
				
				if ((Math.random() > .5 || standardCounter >= normalShuffle.length) && singCounter < singShuffle.length) {
					console.log('Singalong counter', singCounter, singShuffle[singCounter]);
					shuffled[j] = singShuffle[singCounter];
					singCounter++;
					console.log('Singalong counter inc', singCounter);
				} else if (standardCounter < normalShuffle.length) {
					shuffled[j] = normalShuffle[standardCounter];
					standardCounter++;
				}
			} else if (standardCounter < normalShuffle.length) {
				shuffled[j] = normalShuffle[standardCounter];
				standardCounter++;
			}
		}
	}

	return shuffled;
}

for (var i = 0; i < 5; i++) {
	priShuffled = priorityShuffle(PLAYLIST, PREGAME, BIG_SONGS, DRUNK_SINGALONGS, STANDARD);
	console.log(priShuffled, priShuffled.length);
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