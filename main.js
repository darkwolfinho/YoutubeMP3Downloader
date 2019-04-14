var YoutubeMp3Downloader = require("youtube-mp3-downloader");
var fetchVideoInfo = require('youtube-info');
const ypi = require('youtube-playlist-info');
var readline = require('readline');
var fs = require('fs');

//Configure YoutubeMp3Downloader with your settings
var YD = new YoutubeMp3Downloader({
    //"ffmpegPath": "/path/to/ffmpeg",        // Where is the FFmpeg binary located?
    "outputPath": "./musicas",    // Where should the downloaded and encoded files be stored?
    "youtubeVideoQuality": "highest",       // What video quality should be used?
    "queuePafrallelism": 2,                  // How many parallel downloads/encodes should be started?
    "progressTimeout": 2000                 // How long should be the interval of the progress reports
});

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Escolhe o Tipo:\n[1] Para Playlist\n[2] Youtube Link!\nObsv: para não dar erro..\n\n", function (answer) {
    rl.question("Ok Agora Me diga a Id do link/playlist que deseja instalar!\n", function (answer2) {
        if (answer == 1) {
            console.log("Ok! Começando a instalar Playlist: " + answer2)
            Playlist(answer2)
            return;
        } else if (answer == 2) {
            console.log("Ok! Começando a instalar Video: " + answer2)
            Video(answer2)
            return;
        } else {
            console.log("Selecione corretamente...")
        }

    });

});

// Anti Caracteres Especiais
function validaCaracteres(strToReplace) {
    strSChar = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ";
    strNoSChars = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC";
    var newStr = "";
    for (var i = 0; i < strToReplace.length; i++) {
        if (strSChar.indexOf(strToReplace.charAt(i)) != -1) {
            newStr += strNoSChars.substr(strSChar.search(strToReplace.substr(i, 1)), 1);
        } else {
            newStr += strToReplace.substr(i, 1);
        }
    }
    
    return newStr.replace(/[^a-zA-Z 0-9]/g, '')
}

// Instalação
function Playlist(args) {
    ypi("Seu Token do Youtube APIV3", args).then(items => {
        console.log("[ " + items.length + " ] Músicas estão começando a serem baixadas!")
        for (var i = 0; i < items.length; i++) {
            let VideoId = items[i].resourceId.videoId
            let VideoName = validaCaracteres(items[i].title).replace(/ /g, "-")
            YD.download(VideoId, VideoName + ".mp3");
        }
    }).catch(console.error)
}

function Video(args) {
    fetchVideoInfo(args, function (err, videoInfo) {
        if (err) throw new Error(err);
        let VideoName2 = validaCaracteres(videoInfo.title).replace(/" "/g, "-")
        YD.download(videoInfo.videoId, VideoName2 + ".mp3");
    })
}
// Finalização
var a = 1
YD.on("finished", function (err, data) {
    fetchVideoInfo(data.videoId, function (err, videoInfo) {
        if (err) throw new Error(err);
        //console.log(data)
        console.log("Song " + a + " was downloaded: " + data.file);
        a++;
    })
    /*setTimeout(function() { // Deletar
        fs.unlink(`../musicas/${data.videoTitle}.mp3`, function (err) {
            if (err) throw err;
            console.log("deletado!")
        })
    }, 30*1000)*/
});

// Sistema de Erro
YD.on("error", function (error) {
    console.log(error);
});


YD.on("progress", function (progress) {
    /*{ videoId: 'IxpoSGpYxLU',
  progress:
   { percentage: 53.94855920445969,
     transferred: 10895280,
     length: 20195683,
     remaining: 9300403,
     eta: 11,
     runtime: 12,
     delta: 1867760,
     speed: 871622.4 } }*/
    //console.log(Math.floor(progress.progress.percentage)+"%");
    printProgress(Math.floor(progress.progress.percentage))
});

function printProgress(progress) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress + '%');
    if (progress > 98) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }
}