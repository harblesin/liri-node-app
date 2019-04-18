require('dotenv').config();
var axios = require("axios");
var Spotify = require("node-spotify-api");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);


var find = process.argv.slice(2).join(" ");
console.log(find);

spotify
.search({
    type: 'track', query: find
})
.then(function(response){
    for(var i = 0; i < response.tracks.items.length;i++){
        console.log("\r\n")
        console.log(response.tracks.items[i].album.artists[0].name);
        console.log(response.tracks.items[i].album.name);
        console.log(response.tracks.items[i].album.external_urls.spotify);
        //console.log(response.tracks.items[0]);
    }
    
})
.catch(function(err){
    console.log(err);
})

//axios.get("")