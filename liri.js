//Here obviously we define all our global variables, although there are a few other
//variables declared globally further along. More specifically, these import multiple
//node packages, as well as a seperate .js file containing the API keys for spotify
//while lastly, setting the first string entered in node command line as a variable
//to be used later, as well as a variable, spacer, for ease of formatting what is displayed.
require('dotenv').config();
var moment = require("moment");
var fs = require("fs");
var axios = require("axios");
var Spotify = require("node-spotify-api");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var action = process.argv[2];
var spacer = "\r\n==============================================================";

//Inexplicably separated, another variable is declared to house the second string
//from the command line, to be implemented later in the code.
var find = process.argv.slice(3).join(" ");

//Here is perhaps uneccessary but something I wanted to add to polish off the corners
//and cement functionality in my mind, an all encompassing conditional so that no errors
//can occur if an action is mistyped.
if (action == "do-what-it-says" || action == "spotify-this-song" ||
    action == "concert-this" || action == "movie-this") {

    //Capping the main part of the logic off is a conditional to basically listen
    //for whether or not the first string of the command line is directing the program
    //to read from random.txt. This is done for more accurate logging in the log.txt file.
    //This conditional checks if its using the 'do-what-it-says' string as an action,
    //if so, logs accordingly, first noting it was used, as each method, or string can
    //be used with the random.txt file. Otherwise, it simply logs the search the user made
    //and by which string command they chose.
    if (action == "do-what-it-says") {

        //Here we read the random.txt file and set variables consisting of the split
        //halves of the containing text, by way of where the comma lies in the document.
        fs.readFile("random.txt", "utf-8", function (err, data) {
            if (err) {
                console.log(err);
            }
            var textFile = data.split(",");
            var newAction = textFile[0];
            var newFind = textFile[1];

            //After the file is read and split and values are distrubted into the variables
            //the log.txt files is appended and updated to reflect the method used by the user.
            fs.appendFile("log.txt", spacer + "\r\nUser used 'do-what-it-says', to use '" + newAction + "' to search for\r\n" + newFind, function (error) {
                if (error) {
                    console.log(error);
                }
                console.log("\r\n*****Search Logged*****")
            })
        })
    }

    //Otherwise, without reading the random.txt file, with the user having used any of the
    //other methods not requiring fs.readFile, the log.txt is updated and appended to show
    //what the user searched for and what method they used.
    else {
        fs.appendFile("log.txt", spacer + "\r\nUser used '" + action + "' to search for\r\n" + find, function (error) {
            if (error) {
                console.log(error);
            }
            console.log("\r\n*****Search Logged*****")
        })
    };

    //Here it's back to the basics, the first of three conditionals, checking if the user
    //has called one of three searches based on the first string entered into the command line
    //if it was 'spotify-this-song' we search the spotify api using their npm package, to find
    //the name of the artist, album, and a link to the song they are searching. As is for this and
    //every following action conditional, it also provides a default message for the case of any
    //missing search terms.
    if (action == "spotify-this-song") {
        if (find == "") {
            console.log(spacer);
            console.log("You didn't enter a song to search!\r\n")
            console.log("Let me give you an example :)")
            console.log("==============================================================");

            spotify
                .search({
                    type: 'track',
                    query: "The Sign"
                })
                .then(function (response) {
                    console.log("\r\n")
                    console.log("==============================================================");
                    console.log("Artist: " + response.tracks.items[9].album.artists[0].name);
                    console.log("Album: " + response.tracks.items[9].album.name);
                    console.log("Song Sample URL: " + response.tracks.items[9].preview_url);
                    console.log("==============================================================");
                })
                .catch(function (err) {
                    console.log(err);
                })
        } else {
            spotify
                .search({
                    type: 'track',
                    query: find
                })
                .then(function (response) {
                    console.log("\r\n")
                    console.log("==============================================================");
                    console.log("Artist: " + response.tracks.items[0].album.artists[0].name);
                    console.log("Album: " + response.tracks.items[0].album.name);
                    console.log("Song Sample URL: " + response.tracks.items[0].preview_url);
                    console.log("==============================================================");
                })
                .catch(function (err) {
                    console.log(err);
                })
        }
    };

    //The second conditional, if the user entered the string 'concert-this', to use the
    //bandsintown method, we grab their string, or strings after the action, 'concert-this'
    //and search the bandsintown api to find the next time this artist will perform, 
    //while also converting the given date through moment.js, as it's provided using
    //an uncommon format.
    if (action == "concert-this") {
        if (find == "") {
            console.log(spacer);
            console.log("You forgot to enter an artist to search!");
            console.log("Go ahead and give it another shot!");
            console.log("==============================================================");
        } else {
            axios.get("https://rest.bandsintown.com/artists/" + find + "/events?app_id=596fd1e6-dcb1-42f7-90a5-8f6119f565e4")
                .then(function (response) {

                    //Here we use moment.js to format the oddly formatted string of the time
                    //bands in town gives us, by splitting and formatting to a more palatable
                    //date format and time format.
                    var time = response.data[0].datetime.split("T");
                    var format = "YYYY/MM/DD"
                    var timeFormat = "HH:mm:ss"
                    var concertDate = moment(time[0], format);
                    var concertTime = moment(time[1], timeFormat)
                    var actualDate = concertDate.format("MM/DD/YYYY");
                    var actualTime = concertTime.format("hh:mm A");

                    //And obviously here log the results in a neat and orderly fashion for the user.
                    console.log("\r\n==================================================================");
                    console.log("The next time this artist plays will be at: " + response.data[0].venue.name);
                    console.log("In: " + response.data[0].venue.country);
                    console.log("On " + actualDate + " at " + actualTime);
                    console.log("==================================================================");
                })
                .catch(function (err) {
                    console.log(err);
                })
        }
    };

    //The third and final conditional, checking if they are meaning to use the 'movie-this'
    //method, if so, using the OMDB api to find all of the relevant data and information
    //regarding their movie.
    if (action == "movie-this") {
        if (find == "") {
            console.log(spacer);
            console.log("You didn't enter a movie to search!\r\n")
            console.log("Let me give you an example :)");
            console.log("==============================================================");

            axios.get("http://www.omdbapi.com/?t=Mr. Nobody&y=&plot=short&apikey=trilogy")
                .then(function (response) {
                    console.log("\r\n==================================================================");
                    console.log("Movie: " + response.data.Title);
                    console.log("==================================================================");
                    console.log("Year: " + response.data.Year);
                    console.log("==================================================================");
                    console.log("IMDB Rating: " + response.data.Ratings[0].Value);
                    console.log("==================================================================");
                    console.log("Rotten Tomatoes rating: " + response.data.Ratings[1].Value);
                    console.log("==================================================================");
                    console.log("Country: " + response.data.Country)
                    console.log("==================================================================");
                    console.log("Language: " + response.data.Language);
                    console.log("==================================================================");
                    console.log("Plot: " + response.data.Plot);
                    console.log("==================================================================");
                    console.log("Cast: " + response.data.Actors);
                    console.log("==================================================================");
                })
                .catch(function (err) {
                    console.log(err);
                })
        } else {

            axios.get("http://www.omdbapi.com/?t=" + find + "&y=&plot=short&apikey=trilogy")
                .then(function (response) {
                    console.log("\r\n==================================================================");
                    console.log("Movie: " + response.data.Title);
                    console.log("==================================================================");
                    console.log("Year: " + response.data.Year);
                    console.log("==================================================================");
                    console.log("IMDB Rating: " + response.data.Ratings[0].Value);
                    console.log("==================================================================");
                    console.log("Rotten Tomatoes rating: " + response.data.Ratings[1].Value);
                    console.log("==================================================================");
                    console.log("Country: " + response.data.Country)
                    console.log("==================================================================");
                    console.log("Language: " + response.data.Language);
                    console.log("==================================================================");
                    console.log("Plot: " + response.data.Plot);
                    console.log("==================================================================");
                    console.log("Cast: " + response.data.Actors);
                    console.log("==================================================================");
                })
                .catch(function (err) {
                    console.log(err);
                })
        }
    }

    //I suppose the third wasn't the last, as this is the final. But anyways, this conditional
    //listens for the string 'do-what-it-says', which aptly does just that. If asked, we now will
    //using the filesystem package, read the random.txt file, and split it, using whatever
    //search is designates, as well as whatever item it would like to search for, by way
    //of splitting by comma, which is required to be read in this program.
    if (action == "do-what-it-says") {
        fs.readFile("random.txt", "utf-8", function (err, data) {
            if (err) {
                console.log(error);
            }
            var textFile = data.split(",");
            let action = textFile[0];
            let find = textFile[1];
            spotify.search({
                    type: "track",
                    query: find
                })
                .then(function (response) {
                    console.log("\r\n")
                    console.log("==============================================================");
                    console.log("Artist: " + response.tracks.items[0].album.artists[0].name);
                    console.log("Album: " + response.tracks.items[0].album.name);
                    console.log("Song Sample URL: " + response.tracks.items[0].album.external_urls.spotify);
                    console.log("==============================================================");
                })
                .catch(function (error) {
                    console.log(error);
                })
        })
    }
} else {
    console.log(spacer);
    console.log("Uh-oh! It looks like you've either mistyped an action,");
    console.log("or typed an action that does not exist! Please try again :)");
    console.log("==============================================================");
}