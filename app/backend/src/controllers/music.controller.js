const mongoose = require("mongoose");
const musicModel = require("../models/music.model");
const { uploadFile } = require("../services/storage.service");
const albumModel = require("../models/album.model");


async function createAlbum(req, res) {
    try {
        const { title, musics = [] } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Album title is required" });
        }

        const normalizedMusics = Array.isArray(musics) ? musics : [musics].filter(Boolean);

        if (normalizedMusics.length === 0) {
            return res.status(400).json({ message: "Select at least one song for the album" });
        }

        const hasInvalidMusicId = normalizedMusics.some((musicId) => !mongoose.Types.ObjectId.isValid(musicId));

        if (hasInvalidMusicId) {
            return res.status(400).json({ message: "One or more selected songs are invalid" });
        }

        const ownedMusics = await musicModel.find({
            _id: { $in: normalizedMusics },
            artist: req.user.id,
        }).select("_id");

        if (ownedMusics.length !== normalizedMusics.length) {
            return res.status(403).json({ message: "You can only add your own songs to an album" });
        }

        const album = await albumModel.create({
            title,
            musics: normalizedMusics,
            artist: req.user.id,
        });

        res.status(201).json({
            message: "Album created successfully",
            album: {
                id: album.id,
                title: album.title,
                artist: album.artist,
                musics: album.musics,
            },
        });
    } catch (err) {
        res.status(500).json({ message: `Album creation failed: ${err.message}` });
    }
}

async function createMusic(req, res) {
    try {
        const { title } = req.body;
        const file = req.file;

        if (!title) {
            return res.status(400).json({ message: "Music title is required" });
        }

        if (!file) {
            return res.status(400).json({ message: "Music file is required" });
        }

        const result = await uploadFile(file.buffer.toString("base64"));

        const music = await musicModel.create({
            uri: result.url,
            title,
            artist: req.user.id,
        });

        res.status(201).json({
            message: "Music created successfully",
            music: {
                id: music._id,
                uri: music.uri,
                title: music.title,
                artist: music.artist,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: `Music upload failed: ${err.message}` });
    }
}


async function getArtistMusics(req, res) {
    try {
        const musics = await musicModel.find({ artist: req.user.id }).populate("artist", "username");
        res.status(200).json({
            message: "Artist musics retrieved successfully",
            musics,
        });
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch artist musics: ${err.message}` });
    }
}


async function getAllMusics(req, res) {
    try {
        const musics = await musicModel.find().populate("artist", "username");
        res.status(200).json({
            message: "Musics retrieved successfully",
            musics,
        });
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch musics: ${err.message}` });
    }
}

async function getAllAlbums(req, res) {
    try {
        const albums = await albumModel.find().select("title artist musics").populate("artist").populate("musics");
        res.status(200).json({
            message: "Albums fetched successfully",
            albums,
        });
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch albums: ${err.message}` });
    }
}

async function getArtistAlbums(req, res) {
    try {
        const albums = await albumModel
            .find({ artist: req.user.id })
            .select("title artist musics")
            .populate("artist", "username")
            .populate("musics", "title uri");

        res.status(200).json({
            message: "Artist albums fetched successfully",
            albums,
        });
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch artist albums: ${err.message}` });
    }
}

async function getAlbumById(req, res) {
    try {
        const albumId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(albumId)) {
            return res.status(400).json({ message: "Invalid album id" });
        }

        const album = await albumModel.findById(albumId).populate("artist").populate("musics");

        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        res.status(200).json({
            message: "Album fetched successfully",
            album,
        });
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch album: ${err.message}` });
    }
}

module.exports = { createMusic, createAlbum, getArtistMusics, getAllMusics, getAllAlbums, getArtistAlbums, getAlbumById };
