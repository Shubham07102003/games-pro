
// const { dialog } = require('electron').remote;


const axios = require('axios');

var theGames = document.getElementById("theGames");
var gameName = document.getElementById("gameName");

var final_games = [];

async function getGames() {
    var games = await axios.get('https://storage.googleapis.com/cbcdn/cbjson.json');
    var json = games["data"];


    Object.keys(json).forEach(key => {
        final_games.push(json[key][0]);
    });

    console.log(final_games);
    loadGames(final_games);
}

function loadGames(final_games) {
    theGames.innerHTML = ``;

    final_games.map((game) => {
        theGames.innerHTML += `

        <div class="p-2 lg:w-1/3 md:w-1/2 w-full">
        <div class="h-full flex items-center border-gray-200 border p-4 rounded-lg">
        <img alt="team" class="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0 rounded-full mr-4" src="${game.image_url}">
        <div class="flex-grow">
          <h2 class="text-gray-900 title-font font-medium">${game.game_name}</h2>
          <p class="text-gray-500">${game.game_size}</p>
          <button onclick="downloadGame('${game.game_download}','${game.game_name}')" class="inline-block rounded-lg bg-indigo-500 px-4 text-center text-sm font-semibold text-white outline-none ring-indigo-300 transition duration-100 hover:bg-indigo-600 focus-visible:ring active:bg-indigo-700 md:text-base">Install</button>

          </div>
        </div>
      </div>

      `;
    });

}

function downloadGame(gameDownload,gameName){
    var data = gameDownload.toString().split(":");
    var provider = data[0];
    var rpath = data[1];

    window.postMessage({
        type: 'select-dirs',
        arguments:{rpath,provider,gameName}
      });
    

    // var path = dialog.showOpenDialog({
    //     properties: ['openDirectory']
    // });

    console.log({rpath,provider})

}

getGames();

function searchGames() {
    new_games = [];
    if (gameName.value == "") {
        loadGames(final_games);
        return;

    }
    else if (final_games != [] && gameName.value.length >= 2) {
        final_games.map((game) => {
            var name = game.game_name;
            if (name.toLowerCase().includes(gameName.value.toLowerCase())) {
                // console.log(name);
                new_games.push(game);
            }
        });
        // final_games = new_games;

        loadGames(new_games);

    }
}