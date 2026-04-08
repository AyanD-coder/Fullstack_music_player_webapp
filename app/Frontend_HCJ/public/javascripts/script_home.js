document.addEventListener("DOMContentLoaded", async () => {
    const musicList = document.getElementById("musicList");
    const albumList = document.getElementById("albumList");
    const audioPlayer = document.getElementById("audioPlayer");
    const nowPlayingTitle = document.getElementById("nowPlayingTitle");
    const nowPlayingArtist = document.getElementById("nowPlayingArtist");
    const prevTrackButton = document.getElementById("prevTrackButton");
    const togglePlaybackButton = document.getElementById("togglePlaybackButton");
    const nextTrackButton = document.getElementById("nextTrackButton");
    const logoutButton = document.getElementById("logoutButton");
    let currentMusicId = null;
    let currentPlayButton = null;
    let playlist = [];
    let currentTrackIndex = -1;
    const trackRegistry = new Map();

    if (!musicList || !albumList || !audioPlayer || !nowPlayingTitle || !nowPlayingArtist || !prevTrackButton || !togglePlaybackButton || !nextTrackButton) {
        return;
    }

    function updateToggleButton() {
        togglePlaybackButton.textContent = audioPlayer.paused ? "Play" : "Pause";
    }

    function updateSkipButtons() {
        const hasPlaylist = playlist.length > 0 && currentTrackIndex !== -1;
        prevTrackButton.disabled = !hasPlaylist || currentTrackIndex <= 0;
        nextTrackButton.disabled = !hasPlaylist || currentTrackIndex >= playlist.length - 1;
    }

    function registerTrackReference(music, item, button, options = {}) {
        const musicId = music?._id || music?.id;

        if (!musicId) {
            return;
        }

        const existing = trackRegistry.get(musicId);
        if (!existing || options.primary) {
            trackRegistry.set(musicId, { music, item, button });
        }
    }

    function setActiveTrack(music, item, button) {
        if (!music?.uri) {
            return;
        }

        if (currentPlayButton && currentPlayButton !== button) {
            currentPlayButton.textContent = "Play";
        }

        document.querySelectorAll(".music-item").forEach((element) => {
            element.classList.toggle("is-active", element === item);
        });

        currentMusicId = music._id || music.id || null;
        currentPlayButton = button;
        audioPlayer.src = music.uri;
        nowPlayingTitle.textContent = music.title || "Untitled track";
        nowPlayingArtist.textContent = `Artist: ${music.artist?.username || "Unknown"}`;
        togglePlaybackButton.disabled = false;
        currentTrackIndex = playlist.findIndex((track) => (track._id || track.id) === currentMusicId);
        updateSkipButtons();
    }

    async function playTrack(music, item, button) {
        setActiveTrack(music, item, button);

        try {
            await audioPlayer.play();
            button.textContent = "Pause";
            updateToggleButton();
        } catch (error) {
            console.error("Playback failed:", error);
            nowPlayingArtist.textContent = "Playback could not start for this track.";
            button.textContent = "Play";
            updateToggleButton();
        }
    }

    async function playTrackByIndex(index) {
        if (index < 0 || index >= playlist.length) {
            return;
        }

        const music = playlist[index];
        const musicId = music?._id || music?.id;
        const reference = trackRegistry.get(musicId);

        if (!reference) {
            return;
        }

        await playTrack(reference.music, reference.item, reference.button);
    }

    togglePlaybackButton.addEventListener("click", async () => {
        if (!audioPlayer.src) {
            return;
        }

        if (audioPlayer.paused) {
            try {
                await audioPlayer.play();
            } catch (error) {
                console.error("Playback failed:", error);
            }
        } else {
            audioPlayer.pause();
        }
    });

    prevTrackButton.addEventListener("click", async () => {
        if (currentTrackIndex <= 0) {
            return;
        }

        await playTrackByIndex(currentTrackIndex - 1);
    });

    nextTrackButton.addEventListener("click", async () => {
        if (currentTrackIndex === -1 || currentTrackIndex >= playlist.length - 1) {
            return;
        }

        await playTrackByIndex(currentTrackIndex + 1);
    });

    audioPlayer.addEventListener("play", () => {
        updateToggleButton();
        if (currentPlayButton) {
            currentPlayButton.textContent = "Pause";
        }
    });

    audioPlayer.addEventListener("pause", () => {
        updateToggleButton();
        if (currentPlayButton) {
            currentPlayButton.textContent = "Play";
        }
    });

    audioPlayer.addEventListener("ended", () => {
        updateToggleButton();
        if (currentTrackIndex !== -1 && currentTrackIndex < playlist.length - 1) {
            void playTrackByIndex(currentTrackIndex + 1);
            return;
        }

        if (currentPlayButton) {
            currentPlayButton.textContent = "Replay";
        }
    });

    function createTrackButton(music, item, options = {}) {
        const button = document.createElement("button");
        button.className = "music-item-button";
        button.type = "button";
        button.textContent = "Play";
        button.disabled = !music.uri;
        button.addEventListener("click", async () => {
            if (currentMusicId === (music._id || music.id) && !audioPlayer.paused) {
                audioPlayer.pause();
                return;
            }

            await playTrack(music, item, button);
        });

        registerTrackReference(music, item, button, options);
        return button;
    }

    try {
        const response = await fetch("/api/music", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            musicList.textContent = errorData.message || "Unable to load songs.";
            return;
        }

        const data = await response.json();
        const musics = Array.isArray(data.musics) ? data.musics : [];
        playlist = musics.filter((music) => Boolean(music?.uri));

        if (musics.length === 0) {
            musicList.textContent = "No songs available yet.";
            return;
        }

        const list = document.createElement("ul");
        list.className = "music-list";

        musics.forEach((music) => {
            const item = document.createElement("li");
            item.className = "music-item";
            item.dataset.musicId = music._id || music.id || "";

            const details = document.createElement("div");

            const title = document.createElement("strong");
            title.className = "music-item-title";
            title.textContent = music.title || "Untitled track";

            const artist = document.createElement("div");
            artist.className = "music-item-artist";
            artist.textContent = `Artist: ${music.artist?.username || "Unknown"}`;

            const status = document.createElement("div");
            status.className = "music-item-status";
            status.textContent = music.uri ? "Ready to play" : "Track URL unavailable";

            const button = createTrackButton(music, item, { primary: true });

            details.appendChild(title);
            details.appendChild(artist);
            details.appendChild(status);
            item.appendChild(details);
            item.appendChild(button);
            list.appendChild(item);
        });

        musicList.innerHTML = "";
        musicList.appendChild(list);
        updateToggleButton();
        updateSkipButtons();
    } catch (error) {
        musicList.textContent = "Failed to load songs. Please refresh the page.";
        console.error("Failed to load music list:", error);
    }

    try {
        const response = await fetch("/api/music/albums", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            albumList.textContent = errorData.message || "Unable to load albums.";
            return;
        }

        const data = await response.json();
        const albums = Array.isArray(data.albums) ? data.albums : [];

        if (albums.length === 0) {
            albumList.textContent = "No albums available yet.";
            return;
        }

        const grid = document.createElement("div");
        grid.className = "album-grid";

        function collapseAlbum(card, heading, tracks, indicator) {
            if (tracks) {
                tracks.hidden = true;
            }
            heading.setAttribute("aria-expanded", "false");
            card.classList.remove("is-open");
            indicator.textContent = "Show songs";
        }

        function expandAlbum(card, heading, tracks, indicator) {
            if (tracks) {
                tracks.hidden = false;
            }
            heading.setAttribute("aria-expanded", "true");
            card.classList.add("is-open");
            indicator.textContent = "Hide songs";
        }

        albums.forEach((album) => {
            const card = document.createElement("article");
            card.className = "album-card";

            const heading = document.createElement("button");
            heading.className = "album-card-header";
            heading.type = "button";
            heading.setAttribute("aria-expanded", "false");

            const title = document.createElement("h3");
            title.className = "album-card-title";
            title.textContent = album.title || "Untitled album";

            const meta = document.createElement("p");
            meta.className = "album-card-meta";
            meta.textContent = `${album.artist?.username || "Unknown"} | ${Array.isArray(album.musics) ? album.musics.length : 0} songs`;

            const indicator = document.createElement("span");
            indicator.className = "album-card-indicator";
            indicator.textContent = "Show songs";

            heading.appendChild(title);
            heading.appendChild(meta);
            heading.appendChild(indicator);
            card.appendChild(heading);

            if (Array.isArray(album.musics) && album.musics.length > 0) {
                let tracks = null;

                function buildAlbumTracks() {
                    if (tracks) {
                        return tracks;
                    }

                    tracks = document.createElement("ul");
                    tracks.className = "album-track-list";
                    tracks.hidden = true;

                    album.musics.forEach((music) => {
                        const item = document.createElement("li");
                        item.className = "music-item album-track-item";
                        item.dataset.musicId = music._id || music.id || "";

                        const details = document.createElement("div");

                        const trackTitle = document.createElement("strong");
                        trackTitle.className = "music-item-title";
                        trackTitle.textContent = music.title || "Untitled track";

                        const trackStatus = document.createElement("div");
                        trackStatus.className = "music-item-status";
                        trackStatus.textContent = music.uri ? "Play from album" : "Track URL unavailable";

                        const button = createTrackButton(music, item);

                        details.appendChild(trackTitle);
                        details.appendChild(trackStatus);
                        item.appendChild(details);
                        item.appendChild(button);
                        tracks.appendChild(item);
                    });

                    card.appendChild(tracks);
                    return tracks;
                }

                heading.addEventListener("click", () => {
                    const isOpen = tracks ? !tracks.hidden : false;

                    grid.querySelectorAll(".album-card").forEach((otherCard) => {
                        const otherHeading = otherCard.querySelector(".album-card-header");
                        const otherTracks = otherCard.querySelector(".album-track-list");
                        const otherIndicator = otherCard.querySelector(".album-card-indicator");

                        if (!otherHeading || !otherTracks || !otherIndicator || otherCard === card) {
                            return;
                        }

                        collapseAlbum(otherCard, otherHeading, otherTracks, otherIndicator);
                    });

                    if (isOpen) {
                        collapseAlbum(card, heading, tracks, indicator);
                        return;
                    }

                    const currentTracks = buildAlbumTracks();
                    expandAlbum(card, heading, currentTracks, indicator);
                });
            } else {
                const empty = document.createElement("p");
                empty.className = "album-card-meta";
                empty.textContent = "No songs in this album yet.";
                card.appendChild(empty);
            }

            grid.appendChild(card);
        });

        albumList.innerHTML = "";
        albumList.appendChild(grid);
    } catch (error) {
        albumList.textContent = "Failed to load albums. Please refresh the page.";
        console.error("Failed to load album list:", error);
    }

    logoutButton?.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || "Logout failed.");
                return;
            }

            window.location.href = "/login";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Something went wrong. Try again.");
        }
    });
});
