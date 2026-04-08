const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");
const logoutButton = document.getElementById("logoutButton");
const albumForm = document.getElementById("albumForm");
const albumStatus = document.getElementById("albumStatus");
const musicsList = document.getElementById("musicsList");
const albumsList = document.getElementById("albumsList");

if (uploadForm) {
    uploadForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(uploadForm);
        const title = String(formData.get("title") || "").trim();
        const file = formData.get("music");

        if (!title || !(file instanceof File) || file.size === 0) {
            alert("Title and music file are required.");
            return;
        }

        if (uploadStatus) {
            uploadStatus.textContent = "Uploading song...";
        }

        try {
            const response = await fetch("/api/music/upload", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            const result = await parseResponse(response);

            if (!response.ok) {
                if (uploadStatus) {
                    uploadStatus.textContent = result.message || "Music upload failed.";
                }
                alert(result.message || "Music upload failed.");
                return;
            }

            if (uploadStatus) {
                uploadStatus.textContent = result.message || "Music uploaded successfully.";
            }

            uploadForm.reset();
            await loadArtistSongs();
        } catch (error) {
            console.error("Upload error:", error);
            if (uploadStatus) {
                uploadStatus.textContent = "Something went wrong. Try again.";
            }
            alert("Something went wrong. Try again.");
        }
    });
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return {
        message: text || `Request failed with status ${response.status}`
    };
}

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
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
}

if (albumForm) {
    albumForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = albumForm.title.value.trim();
        const musicIds = Array.from(document.querySelectorAll('input[name="musics"]:checked')).map((input) => input.value);

        if (!title) {
            alert("Album title is required.");
            return;
        }

        if (musicIds.length === 0) {
            alert("Select at least one song for the album.");
            return;
        }

        if (albumStatus) {
            albumStatus.textContent = "Creating album...";
        }

        try {
            const response = await fetch("/api/music/album", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, musics: musicIds })
            });

            const data = await parseResponse(response);

            if (!response.ok) {
                if (albumStatus) {
                    albumStatus.textContent = data.message || "Album creation failed.";
                }
                alert(data.message || "Album creation failed.");
                return;
            }

            if (albumStatus) {
                albumStatus.textContent = data.message || "Album created successfully.";
            }

            albumForm.reset();
            await loadArtistAlbums();
        } catch (error) {
            console.error("Album creation error:", error);
            if (albumStatus) {
                albumStatus.textContent = "Something went wrong. Try again.";
            }
            alert("Something went wrong. Try again.");
        }
    });
}

async function loadArtistSongs() {
    if (!musicsList) {
        return;
    }

    musicsList.innerHTML = "";

    if (albumStatus) {
        albumStatus.textContent = "Loading your songs...";
    }

    try {
        const response = await fetch("/api/music/mine", {
            method: "GET",
            credentials: "include"
        });

        const data = await parseResponse(response);

        if (!response.ok) {
            if (albumStatus) {
                albumStatus.textContent = data.message || "Unable to load your songs.";
            }
            return;
        }

        const musics = Array.isArray(data.musics) ? data.musics : [];

        if (musics.length === 0) {
            const emptyState = document.createElement("p");
            emptyState.className = "music-checkbox-empty";
            emptyState.textContent = "Upload songs first to create an album.";
            musicsList.appendChild(emptyState);

            if (albumStatus) {
                albumStatus.textContent = "No uploaded songs available yet.";
            }
            return;
        }

        musics.forEach((music) => {
            const label = document.createElement("label");
            label.className = "music-checkbox-item";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = "musics";
            input.value = music._id || music.id;

            const text = document.createElement("span");
            text.textContent = music.title || "Untitled track";

            label.appendChild(input);
            label.appendChild(text);
            musicsList.appendChild(label);
        });

        if (albumStatus) {
            albumStatus.textContent = "Select one or more songs for the album.";
        }
    } catch (error) {
        console.error("Failed to load artist songs:", error);
        if (albumStatus) {
            albumStatus.textContent = "Failed to load your songs. Refresh and try again.";
        }
    }
}

async function loadArtistAlbums() {
    if (!albumsList) {
        return;
    }

    albumsList.textContent = "Loading albums...";

    try {
        const response = await fetch("/api/music/albums/mine", {
            method: "GET",
            credentials: "include"
        });

        const data = await parseResponse(response);

        if (!response.ok) {
            albumsList.textContent = data.message || "Unable to load albums.";
            return;
        }

        const albums = Array.isArray(data.albums) ? data.albums : [];

        if (albums.length === 0) {
            albumsList.textContent = "No albums created yet.";
            return;
        }

        const list = document.createElement("div");
        list.className = "album-list-grid";

        albums.forEach((album) => {
            const item = document.createElement("article");
            item.className = "album-item";

            const title = document.createElement("h3");
            title.textContent = album.title || "Untitled album";

            const trackCount = document.createElement("p");
            const count = Array.isArray(album.musics) ? album.musics.length : 0;
            trackCount.textContent = `${count} ${count === 1 ? "song" : "songs"}`;

            item.appendChild(title);
            item.appendChild(trackCount);

            if (Array.isArray(album.musics) && album.musics.length > 0) {
                const songs = document.createElement("ul");
                songs.className = "album-song-list";

                album.musics.forEach((music) => {
                    const song = document.createElement("li");
                    song.textContent = music.title || "Untitled track";
                    songs.appendChild(song);
                });

                item.appendChild(songs);
            }

            list.appendChild(item);
        });

        albumsList.innerHTML = "";
        albumsList.appendChild(list);
    } catch (error) {
        console.error("Failed to load albums:", error);
        albumsList.textContent = "Failed to load albums. Refresh and try again.";
    }
}

loadArtistSongs();
loadArtistAlbums();
