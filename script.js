var year = billboard[0];


var ENTRY_MAP = {};

var COLOR_FREQ = .10;

function getColor(length, maxLength) {
	var i = length - 6;
    var r = Math.round(Math.sin(COLOR_FREQ * i + 2 * Math.PI / 3) * 127 + 128);
    var g = Math.round(Math.sin(COLOR_FREQ * i + 0) * 127 + 128);
    var b = Math.round(Math.sin(COLOR_FREQ * i - 2 * Math.PI / 3) * 127 + 128);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function WeekChart() {
	this.init = function(divRef) {
		var self = this;
		var width = 200;
		var gapWidth = 75;
		var height = 20;
		var yInc = 22;
		var topGap = 5;
		var ribbonStartY = 25;

		var x = 0;

		

		var weeks = year.weeks;
		var nWeeks = weeks.length;
		paper = new Raphael(document.getElementById(divRef), width * nWeeks + gapWidth * (nWeeks - 1), topGap + yInc * 11);
		for (var i = 0; i < nWeeks; i++) {
			var week = weeks[i];
			var topTen = week.top_ten;
			var y = topGap;
			var dateText = paper.text(x + width / 2, y + height / 2, week.date).attr({ "font-weight": "bold", "font-size": "14em" });
			y = ribbonStartY;


			for (var j = 0; j < 10; j++) {
				var entry = topTen[j];
				var id = entry.song_order;
				var date = week.date;
				if (!ENTRY_MAP.hasOwnProperty(id)) {
					ENTRY_MAP[id] = entry;
				}
				// if (!ENTRY_MAP.hasOwnProperty(id)) {
				// 	ENTRY_MAP[id] = [];
				// }
				// var newDate = {};
				// newDate[date] = entry;
				// ENTRY_MAP[id].push(newDate)
				// var fillColor = COLORS[entry.song_order % 6];
				var fillColor = getColor(id, 255);

				var upperRectBorder = paper.path([["M", x, y], ["L", x + width, y]]);
				var lowerRectBorder = paper.path([["M", x, y + height], ["L", x + width, y + height]]);
				upperRectBorder.node.setAttribute("class", "song-ribbon-" + entry.song_order + "-border");
				lowerRectBorder.node.setAttribute("class", "song-ribbon-" + entry.song_order + "-border");
				upperRectBorder.toBack();
				lowerRectBorder.toBack();
				lowerRectBorder.attr({ "stroke": "white" });
				upperRectBorder.attr({ "stroke": "white" });


				var entryRect = paper.rect(x, y, width, height);
				entryRect.attr({ "stroke": "none", "fill": fillColor });
				entryRect.node.setAttribute("class", "song-ribbon-" + entry.song_order);
				
				entryRect.toBack();

				addFlyover(entryRect.node, entry, fillColor);
				
				


				// $(songLabel.node).addClass(".song-label");

				if (i > 0) {
					var prevWeekPos = entry.prev_week_position;
					 if (entry.first_appearance) {
						var startCap = paper.ellipse(x, y + height / 2, height / 2, height / 2);
						startCap.node.setAttribute("class", "song-ribbon-" + entry.song_order + "-border");
						startCap.attr({ "stroke": "white", "fill": fillColor });
						startCap.toBack();
					} else if (prevWeekPos <= 10) {
						var upperJoinBorder = paper.path([["M", x - gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY], ["C", x - .6 * gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY, x - .4 * gapWidth, y, x, y]]);
						var lowerJoinBorder = paper.path([["M", x, y + height], ["C", x - .4 * gapWidth, y + height, x - .6 * gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY, x - gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY]]);
						upperJoinBorder.toBack();
						lowerJoinBorder.toBack();
						upperJoinBorder.attr({ "stroke": "white" });
						lowerJoinBorder.attr({ "stroke": "white" });
						upperJoinBorder.node.setAttribute("class", "song-ribbon-" + entry.song_order + "-border");
						lowerJoinBorder.node.setAttribute("class", "song-ribbon-" + entry.song_order + "-border");
						var joiner = paper.path([["M", x, y], ["C", x - .4 * gapWidth, y, x - .6 * gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY, x - gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY], ["L", x - gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY],
														["C", x - .6 * gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY, x - .4 * gapWidth, y + height, x, y + height], ["L", x, y]]);
						joiner.attr({ "stroke": "none", "fill": fillColor });
						joiner.toBack();
						joiner.node.setAttribute("class", "song-ribbon-" + entry.song_order);
						addFlyover(joiner.node, entry, fillColor);
					} else {
						var pickupRibbon = paper.path([["M", x, y], ["L", x - height / 2, y + height / 2], ["L", x, y + height], ["Z"]]);
						pickupRibbon.attr({ "stroke": "none", "fill": fillColor });
						pickupRibbon.toBack();
					}
				}

				if (i < 51) {
					if (entry.last_appearance) {
						var endCap = paper.ellipse(x + width, y + height / 2, height / 2, height / 2);
						endCap.node.setAttribute("class", "song-ribbon-" + entry.song_order + "-border");
						endCap.attr({ "stroke": "white", "fill": fillColor });
						endCap.toBack();
					} else if (!hasSong(weeks[i + 1].top_ten, entry.title)) {
						var leaveOffRibbon = paper.path([["M", x + width, y], ["L", x + width - height / 2, y + height / 2], ["L", x + width, y + height]]);
						leaveOffRibbon.attr({ "stroke": "none", "fill": "white" });
						// leaveOffRibbon.toBack();
					}
				}

				var songLabel = paper.text(x + width / 2, y + height / 2, entry.title);
				// songLabel.attr({ "font-size": "12em" });
				songLabel.node.setAttribute("class", "song-ribbon-" + entry.song_order + " song-label");
				/* INSERT SUPPORT FOR TRUNCATING LONG LABELS */

				
				if (entry.first_appearance) {
					songLabel.attr({ "font-weight": "bold", "font-size": "13em" });
					
				} else {
					songLabel.attr({ "font-size": "12em", "font-color": "gray" });
				}

				var bbox = songLabel.getBBox();
				if (bbox.width > width) {
					// songLabel.node.textContent = entry.title.slice(0, 20) + "...";
					// console.log("wider", songLabel.node.textContent, entry.title.slice(0, 20) + "...");
					songLabel.attr("text", entry.title.slice(0, 20) + "...");
				}

				addFlyover(songLabel.node, entry, fillColor);
				songLabel.toFront();

				y += yInc;


			}
			x += (width + gapWidth);
		}
	}

	this.staticGraphic = function(divRef) {
		var self = this;
		var width = 30;
		var gapWidth = 0;
		var height = 5;
		var yInc = 5;
		var topGap = 5;
		var ribbonStartY = 0;
		paper = new Raphael(document.getElementById(divRef), width * 52 + gapWidth * (51), (height * 10 + 2) * 58);

		for (var n = 0, nn = billboard.length; n < nn; n++) {
			console.log(ribbonStartY);
			year = billboard[n];
			var x = 0;

			var weeks = year.weeks;
			var nWeeks = weeks.length;
			
			for (var i = 0; i < nWeeks; i++) {
				var week = weeks[i];
				var topTen = week.top_ten;
				y = ribbonStartY;


				for (var j = 0; j < 10; j++) {
					var entry = topTen[j];
					var id = entry.song_order;
					var date = week.date;
					var fillColor = getColor(id, 255);

					// var upperRectBorder = paper.path([["M", x, y], ["L", x + width, y]]);
					// var lowerRectBorder = paper.path([["M", x, y + height], ["L", x + width, y + height]]);
					// upperRectBorder.toBack();
					// lowerRectBorder.toBack();
					// lowerRectBorder.attr({ "stroke": "white" });
					// upperRectBorder.attr({ "stroke": "white" });


					var entryRect = paper.rect(x, y, width, height);
					entryRect.attr({ "stroke": "none", "fill": fillColor });
					
					entryRect.toBack();
					
					


					// $(songLabel.node).addClass(".song-label");

					if (i > 0) {
						var prevWeekPos = entry.prev_week_position;
						if (prevWeekPos <= 10) {
							// var upperJoinBorder = paper.path([["M", x - gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY], ["C", x - .6 * gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY, x - .4 * gapWidth, y, x, y]]);
							// var lowerJoinBorder = paper.path([["M", x, y + height], ["C", x - .4 * gapWidth, y + height, x - .6 * gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY, x - gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY]]);
							// upperJoinBorder.toBack();
							// lowerJoinBorder.toBack();
							// upperJoinBorder.attr({ "stroke": "white" });
							// lowerJoinBorder.attr({ "stroke": "white" });
							// var joiner = paper.path([["M", x, y], ["C", x - .4 * gapWidth, y, x - .6 * gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY, x - gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY], ["L", x - gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY],
							// 								["C", x - .6 * gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY, x - .4 * gapWidth, y + height, x, y + height], ["L", x, y]]);
							// joiner.attr({ "stroke": "none", "fill": fillColor });
							// joiner.toBack();
						}
					}

					y += yInc;


				}
				x += (width + gapWidth);
			}
			ribbonStartY += height * 10 + 2;
		}

		
	}

	this.completeChart = function(divRef) {
		var self = this;
		var width = 200;
		var gapWidth = 75;
		var height = 20;
		var yInc = 22;
		var topGap = 5;

		var x = 0;

		paper = new Raphael(document.getElementById(divRef), (width * 52 + gapWidth * 51) * 57, topGap + yInc * 11);
		for (var k = billboard.length - 6, kk = billboard.length; k < kk; k++) {
			console.log(x);
			var year = billboard[k];

			var weeks = year.weeks;
			for (var i = 0, ii = weeks.length; i < ii; i++) {
				var week = weeks[i];
				var topTen = week.top_ten;
				var y = topGap;
				var dateText = paper.text(x + width / 2, y + height / 2, week.date);
				y = ribbonStartY;


				for (var j = 0; j < 10; j++) {
					var entry = topTen[j];
					var id = entry.all_time_order;
					var date = week.date;
					// if (!ENTRY_MAP.hasOwnProperty(id)) {
					// 	ENTRY_MAP[id] = [];
					// }
					// var newDate = {};
					// newDate[date] = entry;
					// ENTRY_MAP[id].push(newDate)
					// var fillColor = COLORS[entry.song_order % 6];
					var fillColor = getColor(id, 255);

					var upperRectBorder = paper.path([["M", x, y], ["L", x + width, y]]);
					var lowerRectBorder = paper.path([["M", x, y + height], ["L", x + width, y + height]]);
					upperRectBorder.node.setAttribute("class", "song-ribbon-" + id + "-border");
					lowerRectBorder.node.setAttribute("class", "song-ribbon-" + id + "-border");
					upperRectBorder.toBack();
					lowerRectBorder.toBack();
					lowerRectBorder.attr({ "stroke": "white" });
					upperRectBorder.attr({ "stroke": "white" });


					var entryRect = paper.rect(x, y, width, height);
					entryRect.attr({ "stroke": "none", "fill": fillColor });
					entryRect.node.setAttribute("class", "song-ribbon-" + id);
					
					entryRect.toBack();

					addFlyover(entryRect.node, entry, fillColor);
					
					var songLabel = paper.text(x + width / 2, y + height / 2, entry.title);
					// songLabel.attr({ "font-size": "12em" });
					songLabel.node.setAttribute("class", "song-ribbon-" + id + " song-label");

					
					if (entry.first_appearance) {
						songLabel.attr({ "font-weight": "bold", "font-size": "13em" });
						
					} else {
						songLabel.attr({ "font-size": "12em", "font-color": "gray" });
					}

					var bbox = songLabel.getBBox();
					if (bbox.width > width) {
						// songLabel.node.textContent = entry.title.slice(0, 20) + "...";
						// console.log("wider", songLabel.node.textContent, entry.title.slice(0, 20) + "...");
						songLabel.attr("text", entry.title.slice(0, 20) + "...");
					}

					addFlyover(songLabel.node, entry, fillColor);


					// $(songLabel.node).addClass(".song-label");

					// if (i > 0) {
						var prevWeekPos = entry.prev_week_position;
						if (prevWeekPos <= 10) {
							var upperJoinBorder = paper.path([["M", x - gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY], ["C", x - .6 * gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY, x - .4 * gapWidth, y, x, y]]);
							var lowerJoinBorder = paper.path([["M", x, y + height], ["C", x - .4 * gapWidth, y + height, x - .6 * gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY, x - gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY]]);
							upperJoinBorder.toBack();
							lowerJoinBorder.toBack();
							upperJoinBorder.attr({ "stroke": "white" });
							lowerJoinBorder.attr({ "stroke": "white" });
							upperJoinBorder.node.setAttribute("class", "song-ribbon-" + id + "-border");
							lowerJoinBorder.node.setAttribute("class", "song-ribbon-" + id + "-border");
							var joiner = paper.path([["M", x, y], ["C", x - .4 * gapWidth, y, x - .6 * gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY, x - gapWidth, (prevWeekPos - 1) * yInc + ribbonStartY], ["L", x - gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY],
															["C", x - .6 * gapWidth, (prevWeekPos - 1) * yInc + height + ribbonStartY, x - .4 * gapWidth, y + height, x, y + height], ["L", x, y]]);
							joiner.attr({ "stroke": "none", "fill": fillColor });
							joiner.toBack();
							joiner.node.setAttribute("class", "song-ribbon-" + id);
							addFlyover(joiner.node, entry, fillColor);
						} else if (entry.first_appearance) {
							var startCap = paper.ellipse(x, y + height / 2, height / 2, height / 2);
							startCap.node.setAttribute("class", "song-ribbon-" + id + "-border");
							startCap.attr({ "stroke": "white", "fill": fillColor });
							startCap.toBack();
						} else {
							var pickupRibbon = paper.path([["M", x, y], ["L", x - height / 2, y + height / 2], ["L", x, y + height], ["Z"]]);
							pickupRibbon.attr({ "stroke": "none", "fill": fillColor });
							pickupRibbon.toBack();
						}
					// }

					if (i < 51) {
						if (entry.last_appearance) {
							var endCap = paper.ellipse(x + width, y + height / 2, height / 2, height / 2);
							endCap.node.setAttribute("class", "song-ribbon-" + id + "-border");
							endCap.attr({ "stroke": "white", "fill": fillColor });
							endCap.toBack();
						} else if (!hasSong(weeks[i + 1].top_ten, entry.title)) {
							var leaveOffRibbon = paper.path([["M", x + width, y], ["L", x + width - height / 2, y + height / 2], ["L", x + width, y + height]]);
							leaveOffRibbon.attr({ "stroke": "none", "fill": "white" });
							// leaveOffRibbon.toBack();
						}
					}

					y += yInc;


				}
				x += (width + gapWidth);
			}
		}

		
	}

	function hasSong(topTen, title) {
		for (var i = 0; i < topTen.length; i++) {
			if (topTen[i].title === title) return true;
		}
		return false;
	}

	function addFlyover(node, entry, color) {
		$(node).mouseover(function() {
			$("#songInfo").css("visibility", "visible");
			$("#songName").text(entry.title);
			$("#artistName").text(entry.artist);
			$("#weeksOn").text(entry.weeks_on);
			$(".song-info-span").css("color", color);

			$(".song-ribbon-" + entry.song_order + "-border").attr({ "stroke-width": 2, "stroke": "black" });

		}).mouseout(function() {
			$(".song-ribbon-" + entry.song_order + "-border").attr({ "stroke-width": 1, "stroke": "white" });
		});
	}
}

window.onload = function() {
	var wc = new WeekChart();

	year = billboard[55];

	wc.init('main');
	// wc.staticGraphic('main');
	// wc.completeChart('main');

	$('#songInfo').css("visibility", "hidden");
	
	$("#toggleText").click(function(event) {
		$(".song-label:not([font-weight=bold])").toggle();
	});

	var $select = $("#selectYear");

	$("<option />", { value: -1, text: "Select Year" }).appendTo($select);

	for (var i = 0, ii = billboard.length; i < ii; i++) {
		year_json = billboard[i];
		$("<option />", {value: i, text: year_json.year}).appendTo($select);
	}

	// var 2013_rendered =	"data:image/svg + xml" + encodeURIComponent(document.getElementsByTagName("svg")[0].parentNode.innerHTML);

	var mainDiv = document.getElementById("main");
	
	$("#selectYear").change(function() {
		if ($(this).val() == -1) return;
		year = billboard[$(this).val()];
		$('#main').empty();
		// if ($("#selectYear option:selected").text() == 2013) {
		// 	$('#main').html(2013_rendered);
		// 	console.log(2013_rendered);
		// 	console.log("2013");
		// } else {
			wc.init('main');
		mainDiv.scrollLeft = 0;
		// }
	});

	

	$("body").bind('mousewheel DOMMouseScroll', function(event) {
		if (event.originalEvent.wheelDelta) {
			mainDiv.scrollLeft -= (event.originalEvent.wheelDelta * 2.295);
			event.preventDefault();
		} else {
			mainDiv.scrollLeft += (event.originalEvent.detail * 91.8);
		}
	});

	$("#selectYear").bind('mousewheel DOMMouseScroll', function(event) {
		event.stopPropagation();
	});

	$('#main').mousedown(function (event) {
        $(this)
            .data('down', true)
            .data('x', event.clientX)
            .data('scrollLeft', this.scrollLeft);
            
        return false;
    }).mouseup(function (event) {
        $(this).data('down', false);
    }).mousemove(function (event) {
        if ($(this).data('down') == true) {
            this.scrollLeft = $(this).data('scrollLeft') + $(this).data('x') - event.clientX;
        }
    }).mouseleave(function (event) {
    	$(this).data('down', false);
    }).css({
        'cursor' : 'move'
    });

    // var seen_artists = [];
    // for (var i = 0, ii = billboard.length; i < ii; i++) {
    // 	var year = billboard[i];
    // 	for (var k = 0, kk = year.weeks.length; k < kk; k++) {
    // 		var topTen = year.weeks[k].top_ten;
    // 		for (var j = 0; j < 10; j++) {
    // 			var entry = topTen[j];
    // 			var artist = entry.artist;
    // 			if (isCollaboration(artist) && seen_artists.indexOf(artist) === -1) {
    // 				seen_artists.push(artist);
    // 			}
    // 		}
    // 	}
    // }

    // function isCollaboration(artistName) {
    // 	var artist = artistName.toLowerCase();
    // 	return (artist.indexOf("feat") > -1 || artist.indexOf(" featuring ") > -1 || artist.indexOf(" feat. ") > -1 || artist.indexOf(" ft ") > -1 || artist.indexOf(" ft. ") > -1);
    // 	// return (artist.indexOf("and") > -1 || artist.indexOf(",") > -1 || artist.indexOf("&") > -1 || artist.indexOf("+") > -1 || artist.indexOf("feat") > -1 || artist.indexOf("featuring") > -1 || artist.indexOf("feat.") > -1 || artist.indexOf("ft") > -1 || artist.indexOf("ft.") > -1 || artist.indexOf("with") > -1);
    // }
    // // console.log(seen_artists);
    // seen_artists.forEach(function(artist) {
    // 	// console.log(artist.split(".*\\Featuring\\b.*"));

    // 	console.log(artist.replace(' Featuring ', '||').replace(' featuring ', '||').replace(' feat ', '||').replace(' Feat ', '||').replace(' Ft ', '||').replace(' ft ', '||').replace(' Feat. ', '||').replace(' feat. ', '||').replace(' Ft. ', '||').replace(' ft. ', '||').split('||'));
    // });

    // console.log(encodeURIComponent(document.getElementsByTagName("svg")[0].parentNode.innerHTML));
    // open("data:image/svg+xml," + encodeURIComponent(document.getElementsByTagName("svg")[0].parentNode.innerHTML));
}