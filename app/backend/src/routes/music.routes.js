const express = require ('express')
const musicController = require("../controllers/music.controller")
const multer= require("multer")
const authMiddleware = require('../middilewares/auth.middileware')

const upload = multer({
    storage: multer.memoryStorage()
})


const router =  express.Router();


router.post("/upload",authMiddleware.authArtist,upload.single("music"),musicController.createMusic)


router.post("/album",authMiddleware.authArtist,musicController.createAlbum)

router.get("/mine",authMiddleware.authArtist,musicController.getArtistMusics)
router.get("/albums/mine",authMiddleware.authArtist,musicController.getArtistAlbums)

router.get("/",authMiddleware.authUser,musicController.getAllMusics)

router.get("/albums",authMiddleware.authUser,musicController.getAllAlbums)

router.get("/albums/:id",authMiddleware.authUser,musicController.getAlbumById)

module.exports= router
