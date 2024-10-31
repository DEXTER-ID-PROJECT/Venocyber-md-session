const PastebinAPI = require('pastebin-js'),
      pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const multer = require('multer'); // For file upload
const path = require('path');
const pino = require("pino");
const {
    default: Venocyber_Tech, useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("maher-zubair-baileys");

let router = express.Router();

// Set up file upload handling
const storage = multer.diskStorage({
  destination: './temp/uploads',
  filename: (req, file, cb) => {
    cb(null, `${makeid()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

// Helper function to remove files
function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Main route with audio file upload
router.post('/', upload.single('audioFile'), async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    let sendNumber = req.query.sendNumber; // Sending number from query
    const audioFilePath = req.file.path; // Path to uploaded audio file

    async function VENOCYBER_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let Pair_Code_By_Venocyber_Tech = Venocyber_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Chrome (Linux)", "", ""]
            });

            if (!Pair_Code_By_Venocyber_Tech.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Venocyber_Tech.requestPairingCode(num);
                
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Venocyber_Tech.ev.on('creds.update', saveCreds);
            Pair_Code_By_Venocyber_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection == "open") {
                    await delay(5000);

                    // Send voice note
                    await Pair_Code_By_Venocyber_Tech.sendMessage(sendNumber + "@s.whatsapp.net", {
                        audio: { url: audioFilePath },
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true // Set to true to send as a voice note
                    });

                    // Confirmation message
                    const VENOCYBER_MD_TEXT = `
*_Pair Code Connected by Venocyber Tech_*
*_Made With 🤍_*
...additional text...`;
                    await Pair_Code_By_Venocyber_Tech.sendMessage(Pair_Code_By_Venocyber_Tech.user.id, { text: VENOCYBER_MD_TEXT });

                    await delay(100);
                    await Pair_Code_By_Venocyber_Tech.ws.close();
                    removeFile(audioFilePath); // Remove uploaded audio file after sending
                    return await removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    VENOCYBER_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("service restarted");
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await VENOCYBER_MD_PAIR_CODE();
});

module.exports = router;
