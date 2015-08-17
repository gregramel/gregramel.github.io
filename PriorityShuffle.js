window.onload = function() {
    $('#shuffle').hide();
    
    /* Code for logging in and accessing and displaying a user's playlists taken and modified slightly
        from official Spotify API demo: http://jsfiddle.net/k4v3h/78/ Shuffling code developed independently.*/
    // find template and compile it
    var playlistsListTemplateSource = document.getElementById('playlists-list-template').innerHTML,
        playlistsListTemplate = Handlebars.compile(playlistsListTemplateSource),
        playlistsListPlaceholder = document.getElementById('playlists-list'),
        
        playlistDetailTemplateSource = document.getElementById('playlist-detail-template').innerHTML,
        playlistDetailTemplate = Handlebars.compile(playlistDetailTemplateSource),
        playlistDetailPlaceholder = document.getElementById('playlist-detail')
    
    document.getElementById('login').addEventListener('click', function() {
        login();
    });
    
    function login() {
        var width = 400,
            height = 500;
        var left = (screen.width / 2) - (width / 2);
        var top = (screen.height / 2) - (height / 2);
        
        var params = {
            client_id: '8db44d8fec824723bb8057362ed8ea88',
            redirect_uri: 'http://gregramel.github.io/priority_callback',
            scope: 'user-read-private playlist-read-private playlist-modify-public playlist-modify-private',
            response_type: 'token'
        };
        console.log(toQueryString(params));
        authWindow = window.open(
            "https://accounts.spotify.com/authorize?" + toQueryString(params),
            "Spotify",
            'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
        );
    }
    
    function receiveMessage(event){
        // if (event.origin !== "http://gregramel.github.io") {
        //     return;
        // }
        if (authWindow) {
            authWindow.close();
        }
        console.log(event.data);
        showInfo(event.data);
    }
    
    window.addEventListener("message", receiveMessage, false);
    
    function toQueryString(obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    }
    var authWindow = null;
    
    var token = null;
    
    function showInfo(accessToken) {
        token = accessToken;
        // fetch my public playlists
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {         
                var user_id = response.id.toLowerCase();         
                $.ajax({
                    url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    success: function(response) {
                        playlistsListPlaceholder.innerHTML = playlistsListTemplate(response);
                    }
                });
             
                $('div#login').hide();
                $('div#loggedin').show();
            }
        });
    }
    
    var curPlaylistURL = null;
    
    playlistsListPlaceholder.addEventListener('click', function(e) {
        var target = e.target;
        if (target !== null && target.classList.contains('load')) {
            e.preventDefault();
            var link = target.getAttribute('data-link');
            curPlaylistURL = link;
                   
            $.ajax({
                url: link,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function(response) {
                    console.log(response);
                    playlistDetailPlaceholder.innerHTML = playlistDetailTemplate(response);
                    $('#song-list').selectable({
                        filter: 'li'
                    });
                    $('html, body').animate({
                        scrollTop: $('#playlist-detail').offset().top
                    }, 100);
                }
            });
        }
        $('#shuffle').show();


    });
    
    /* Shuffles the playlist with the selected options */
    $('#shuffle').click(function(event) {
        var shuffled = shuffleFromTypes();
        var uris = encodeTracksToURIs(shuffled);
        console.log('Attempting shuffle with url', curPlaylistURL, token);
        $.ajax({
            url: curPlaylistURL + '/tracks',
            type: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            contentType: 'application/json',
            data: JSON.stringify(uris),
            success: function(response) {
                console.log(response);
                alert('Shuffled successfully');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    });

    $('#intro-btn').click(function(event) {
        $('.ui-selected').removeClass('singalong-song big-song standard-song').addClass('intro-song');
    });

    $('#big-btn').click(function(event) {
        $('.ui-selected').removeClass('singalong-song intro-song standard-song').addClass('big-song');
    });

    $('#singalong-btn').click(function(event) {
        $('.ui-selected').removeClass('intro-song big-song standard-song').addClass('singalong-song');
    });

    $('#std-btn').click(function(event) {
        $('.ui-selected').removeClass('intro-song big-song singalong-song').addClass('standard-song');
    });

    $('.song-list-element').hover(function(event) {
        console.log('mousenter');
        $(this).addClass('ui-selecting');
    }, function(event) {
        console.log('mouseleave');
        $(this).removeClass('ui-selecting');
    });
    
    /* Arranges songs into the appropriate category arrays based on the selected option */
    function shuffleFromTypes() {
        var arrays = { "playlist": [], "intro": [], "big": [], "singalong": [], "standard": [] };
        $(".type-select").each(function() {
            var $checked = $(this).find("input:checked");
            console.log($checked);
            var id = $(this).find("input").attr("name");
            if (id != "") {
                arrays.playlist.push(id);
                if ($checked[0]) {
                    switch ($checked.val()) {
                        case "pregame":
                            arrays.intro.push(id);
                            break;
                        case "big":
                            arrays.big.push(id);
                            break;
                        case "singalong":
                            arrays.singalong.push(id);
                            break;
                        default:
                            break;
                    }
                } else {
                    arrays.standard.push(id);
                }
            }
        });
        console.log(arrays);

        /* Shuffles the playlist based onc ategory arrays */
        var shuffledList = priorityShuffle(arrays.playlist, arrays.intro, arrays.big, arrays.singalong, arrays.standard);
        console.log(shuffledList);

        return shuffledList;
    }

    /* Helper function to create a JSON object for the URIs to be passed in request body */
    function encodeTracksToURIs(tracks) {
        var data = {};
        var URIs = [];
        tracks.forEach(function(track) {
            URIs.push('spotify:track:' + track);
        });
        data["uris"] = URIs;
        return data;
    }    
}
