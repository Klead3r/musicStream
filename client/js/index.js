var currentSong = '';

function getSongs () {
    var songsEl = document.getElementById('songs__list');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            var html = '';
            response.songs.forEach((element, index) => {
                html += '<div tabindex="0" onkeyup="if (event.keyCode === 13) playSong('+"'"+element+"'"+')" onclick="playSong('+"'"+element+"'"+')" class="playSong" click>'+element+'</div>';
            });
            songsEl.innerHTML = html;
            highlightCurrent()
        }
    };
    xhttp.open("GET", "/songs", true);
    xhttp.send();
}

getSongs();

function playSong(name) {
    var player = document.getElementById('musicSource');
    var audio = document.getElementById('audio');
    var path = window.location.href+'play/'+name;
    player.src = path;
    audio.load();
    audio.play();
    currentSong = name;
    highlightCurrent();
}

function highlightCurrent () {
    var songs = document.getElementsByClassName('playSong');
    var selected = document.getElementsByClassName('playSong__selected');
    for (var song of selected) {
        song.classList.remove('playSong__selected');
    }
    for (var song of songs) {
        if (currentSong === song.textContent) {
            song.classList.add('playSong__selected');
        }
    }
}

function downloadFromYoutube() {
    var ytId = document.getElementById('ytId').value;
    var status = document.getElementById('dlStatus');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        status.innerHTML = 'Downloading...';
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            getSongs()
            status.innerHTML = response.status;
        }
    };
    xhttp.open("POST", ("/dlYt/"+ytId), true);
    xhttp.send();
}