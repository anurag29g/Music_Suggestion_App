var artistInput = document.getElementById("artistInput");
    var artistDropdown = document.getElementById("artistDropdown");
    var songArtistInput = document.getElementById("songArtistInput");
    var songInput = document.getElementById("songInput");

    artistInput.addEventListener("input", function () {
        var artistQuery = this.value;
        if (artistQuery.length > 0) {
            getArtistSuggestions(artistQuery);
        } else {
            hideArtistDropdown();
        }
    });

    artistInput.addEventListener("focusout", function () {
        setTimeout(hideArtistDropdown, 200);
    });

    artistInput.addEventListener("keydown", function (event) {
        var dropdownItems = artistDropdown.getElementsByClassName(
            "dropdown-menu-item"
        );
        var selectedIndex = Array.from(dropdownItems).findIndex(function (
            item
        ) {
            return item.classList.contains("selected");
        });

        if (event.key === "ArrowUp" && selectedIndex > 0) {
            event.preventDefault();
            deselectItem(dropdownItems[selectedIndex]);
            selectItem(dropdownItems[selectedIndex - 1]);
        } else if (
            event.key === "ArrowDown" &&
            selectedIndex < dropdownItems.length - 1
        ) {
            event.preventDefault();
            if (selectedIndex === -1) {
                selectItem(dropdownItems[0]);
            } else {
                deselectItem(dropdownItems[selectedIndex]);
                selectItem(dropdownItems[selectedIndex + 1]);
            }
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (selectedIndex >= 0) {
                var selectedArtist = dropdownItems[selectedIndex].textContent;
                artistInput.value = selectedArtist;
                hideArtistDropdown();
            }
        } else if (event.key === "Escape") {
            hideArtistDropdown();
        }
    });

    artistDropdown.addEventListener("mousedown", function (event) {
        event.preventDefault();
    });

    artistDropdown.addEventListener("click", function (event) {
        var target = event.target;
        if (target.classList.contains("dropdown-menu-item")) {
            artistInput.value = target.textContent;
            hideArtistDropdown();
        }
    });

    document.getElementById("artistForm").addEventListener("submit", function (
        event
    ) {
        event.preventDefault();
        var artistInputValue = artistInput.value;
        getArtistRecommendations(artistInputValue);
    });

    document.getElementById("songForm").addEventListener("submit", function (event) {
        event.preventDefault();
        var songArtist = songArtistInput.value;
        var songName = songInput.value;
        getSongRecommendations(songArtist, songName);
    });

    const LASTFM_API_KEY = 'fa39aa08ceab6fecd10e3e25c91a69f7';

    function getArtistSuggestions(artistQuery) {
        var apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(
            artistQuery
        )}&api_key=${LASTFM_API_KEY}&format=json`;

        fetch(apiUrl)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var artists = data.results.artistmatches.artist;
                var suggestions = "";
                if (artists.length > 0) {
                    for (var i = 0; i < artists.length; i++) {
                        var artist = artists[i].name;
                        suggestions += `<div class="dropdown-menu-item">${artist}</div>`;
                    }
                }
                artistDropdown.innerHTML = suggestions;
                showArtistDropdown();
            })
            .catch(function (error) {
                console.log("An error occurred:", error);
            });
    }

    function showArtistDropdown() {
        artistDropdown.style.display = "block";
    }

    function hideArtistDropdown() {
        artistDropdown.style.display = "none";
    }

    function selectItem(item) {
        item.classList.add("selected");
    }

    function deselectItem(item) {
        item.classList.remove("selected");
    }

    function getArtistRecommendations(artist) {
        var apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(
            artist
        )}&api_key=${LASTFM_API_KEY}&format=json`;

        fetch(apiUrl)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var similarArtists = data.similarartists.artist;
                var recommendations = "";
                if (similarArtists.length > 0) {
                    recommendations += "<ul>";
                    for (var i = 0; i < similarArtists.length; i++) {
                        var artist = similarArtists[i].name;
                        recommendations += `<li>${artist}</li>`;
                    }
                    recommendations += "</ul>";
                } else {
                    recommendations = "No artist recommendations found.";
                }
                document.getElementById("artistRecommendations").innerHTML =
                    "<h2>Artist Recommendations:</h2>" + recommendations;
            })
            .catch(function (error) {
                console.log("An error occurred:", error);
            });
    }

    function getSongRecommendations(artist, song) {
        var apiUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getSimilar&artist=${encodeURIComponent(
            artist
        )}&track=${encodeURIComponent(song)}&api_key=${LASTFM_API_KEY}&format=json`;

        fetch(apiUrl)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                var similarTracks = data.similartracks.track;
                var recommendations = "";

                if (similarTracks.length > 0) {
                    recommendations = "<ul>";

                    for (var i = 0; i < similarTracks.length; i++) {
                        var track = similarTracks[i];
                        var artist = track.artist.name;
                        var trackName = track.name;
                        recommendations += `<li>${artist} - ${trackName}</li>`;
                    }

                    recommendations += "</ul>";
                } else {
                    recommendations = `No song recommendations found for "${song}"`;
                }

                document.getElementById("songRecommendations").innerHTML =
                    "<h2>Song Recommendations:</h2>" + recommendations;
            })
            .catch(function (error) {
                console.log("An error occurred:", error);
            });
    }

let savedRecommendations = [];

function saveRecommendation(recommendation) {
  savedRecommendations.push(recommendation);
  updateSavedList();
}

function updateSavedList() {
  const savedList = document.getElementById("savedList");
  savedList.innerHTML = ""; // Clear the list before updating

  savedRecommendations.forEach((recommendation) => {
    const listItem = document.createElement("li");
    listItem.textContent = recommendation;
    savedList.appendChild(listItem);
  });
}

function handleSaveButtonClick(recommendation, saveButton) {
  saveRecommendation(recommendation);
  saveButton.textContent = "Saved";
  saveButton.style.backgroundColor = "#4CAF50";
  saveButton.style.color = "#fff";
  saveButton.disabled = true;
}

artistRecommendations.addEventListener("click", function (event) {
  if (event.target.tagName === "LI") {
    const recommendation = event.target.textContent;
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", function () {
      handleSaveButtonClick(recommendation, saveButton);
    });
    event.target.appendChild(saveButton);
  }
});

songRecommendations.addEventListener("click", function (event) {
  if (event.target.tagName === "LI") {
    const recommendation = event.target.textContent;
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", function () {
      handleSaveButtonClick(recommendation, saveButton);
    });
    event.target.appendChild(saveButton);
  }
});
