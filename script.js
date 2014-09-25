year = billboard[0];

var COLOR_FREQ = .10;
var CURVE_POINTS = [.4, .6];

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
		width = 200;
		gapWidth = 75;
		height = 20;
		yInc = 22;
		topGap = 5;
		ribbonStartY = 25;

		var x = 0;

		var weeks = year.weeks;
		nWeeks = weeks.length;
		paper = new Raphael(document.getElementById(divRef), width * nWeeks + gapWidth * (nWeeks - 1), topGap + yInc * 11);
		for (var i = 0; i < nWeeks; i++) {
			var week = weeks[i];
			var nextTen = i < nWeeks - 1 ? weeks[i + 1].top_ten : null;
			drawWeek(i, week.top_ten, nextTen, week.date, x);
			x += (width + gapWidth);
		}
	}

	function drawWeek(i, topTen, nextTen, date, x) {
		var y = topGap;
		var dateText = paper.text(x + width / 2, y + height / 2, date).attr({ "font-weight": "bold", "font-size": "14em" });
		y = ribbonStartY;

		for (var j = 0; j < 10; j++) {
			var curEntry = topTen[j];
			var inNextWeek = hasSong(nextTen, curEntry.title);
			drawEntry(i, curEntry, inNextWeek, x, y);
			y += yInc;
		}
	}

	function drawEntry(i, entry, inNextWeek, x, y) {
		var id = entry.song_order;

		var fillColor = getColor(id, 255);

		rectBorder(x, y, id);
		rectBorder(x, y + height, id);

		var entryRect = paper.rect(x, y, width, height);
		entryRect.attr({ "stroke": "none", "fill": fillColor });
		entryRect.node.setAttribute("class", "song-ribbon-" + entry.song_order);
		
		entryRect.toBack();

		addFlyover(entryRect.node, entry, fillColor);

		if (i > 0) {
			var prevWeekPos = entry.prev_week_position;
			if (entry.first_appearance) {
				cap(x, y, height / 2, id, fillColor);
			} else if (prevWeekPos <= 10) {
				joinBorder(x, y, (prevWeekPos - 1) * yInc + ribbonStartY, id);
				joinBorder(x, y + height, (prevWeekPos - 1) * yInc + height + ribbonStartY, id);

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

		if (i < nWeeks - 1) {
			if (entry.last_appearance) {
				cap(x + width, y, height / 2, id, fillColor);
			} else if (!inNextWeek) {
				var leaveOffRibbon = paper.path([["M", x + width, y], ["L", x + width - height / 2, y + height / 2], ["L", x + width, y + height]]);
				leaveOffRibbon.attr({ "stroke": "none", "fill": "white" });
			}
		}

		var songLabel = paper.text(x + width / 2, y + height / 2, entry.title);
		songLabel.node.setAttribute("class", "song-ribbon-" + entry.song_order + " song-label");

		if (entry.first_appearance) {
			songLabel.attr({ "font-weight": "bold", "font-size": "13em" });	
		} else {
			songLabel.attr({ "font-size": "12em", "font-color": "gray" });
		}

		var bbox = songLabel.getBBox();
		if (bbox.width > width) {
			songLabel.attr("text", entry.title.slice(0, 20) + "...");
		}

		addFlyover(songLabel.node, entry, fillColor);
		songLabel.toFront();
	}

	function rectBorder(xPos, yPos, id) {
		var rectBorder = paper.path([["M", xPos, yPos], ["L", xPos + width, yPos]]).attr({ "stroke": "white" });
		rectBorder.node.setAttribute("class", "song-ribbon-" + id + "-border");
		rectBorder.toBack();
	}

	function cap(xPos, yPos, radius, id, color) {
		var cap = paper.ellipse(xPos, yPos + radius, radius, radius).attr({ "stroke": "white", "fill": color });
		cap.node.setAttribute("class", "song-ribbon-" + id + "-border");
		cap.toBack();
	}

	function joinBorder(xPos, startY, endY, id) {
		var c1 = CURVE_POINTS[0];
		var c2 = CURVE_POINTS[1];
		var joinBorder = paper.path([["M", xPos - gapWidth, endY], ["C", xPos - c2 * gapWidth, endY, xPos - c1 * gapWidth, startY, xPos, startY]]);
		joinBorder.attr({ "stroke": "white" });
		joinBorder.toBack()
		joinBorder.node.setAttribute("class", "song-ribbon-" + id + "-border");
	}
	
	function hasSong(topTen, title) {
		if (!topTen) return false;
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
		wc.init('main');
		mainDiv.scrollLeft = 0;
	});

	$(document).keydown(function(event) {
		switch(event.keyCode) {
			case 37:
				mainDiv.scrollLeft -= 180;
				break;
			case 39:
				mainDiv.scrollLeft += 180;
			default:
				break;
		}
	})

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
}