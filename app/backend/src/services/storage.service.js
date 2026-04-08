const {ImageKit}= require('@imagekit/nodejs/index.js')


let imageKitClient = null;

function getImageKitClient() {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        throw new Error('IMAGEKIT_PRIVATE_KEY is missing')
    }

    if (!imageKitClient) {
        imageKitClient = new ImageKit({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        })
    }

    return imageKitClient;
}

async function uploadFile(file) {
    const result = await getImageKitClient().files.upload({
        file,
        fileName:"music_"+Date.now(),
        folder:"MUSIC_PLAYER_WEBAPP/music"
    })

    return result;
}

module.exports={uploadFile}
