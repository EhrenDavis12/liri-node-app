
require("dotenv").config();
var request = require("request");
var moment = require("moment");
var keys = require("./keys");
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);
var fs = require("fs");
var fileName = "./random.txt"

function getParams(startJoinIndex) {
    if (startJoinIndex !== undefined) {
        let result = process.argv.slice(2, parseInt(startJoinIndex) + 2);
        let joinedResult = process.argv.slice(parseInt(startJoinIndex) + 2).join(" ");
        return result.concat(joinedResult);
    }
    return process.argv.slice(2);
}

function main(input) {
    var operation = cleanString(input[0]);
    var name = cleanString(input[1]);

    console.log("Running command: " + operation + " with: " + name);

    switch (operation) {
        case "concert-this":
            concertThis(name);
            break;
        case "spotify-this-song":
            spotifyThisSong(name);
            break;
        case "movie-this":
            movieThis(name);
            break;
        case "do-what-it-says":
            doWhatItSays(fileName);
            break;
        default:
            results = "not found";
    };
}

function cleanString(str) {
    str = str.toLowerCase().trim();
    str = str.replace(/"/g, '');
    return str;
}

function concertThis(name) {
    request("https://rest.bandsintown.com/artists/" + name + "/events?app_id=codingbootcampEhren", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            JSON.parse(body).forEach(element => {
                console.log("Name of the venue: " + element.venue.name);
                console.log("Venue location:" + element.city);
                console.log("Date of the Event: " + moment(element.datetime, "YYYY-MM-DD").format("MM/DD/YYYY") + "\n");
            });
        }
    });
}

function spotifyThisSong(name) {
    if (name === "") {
        name = "The Sign";
    }
    spotify.search({ type: 'track', query: name }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        data.tracks.items.forEach(track => {
            track.artists.forEach(artist => {
                console.log("Artist(s): " + artist["name"]);
            });
            console.log("The song's name: " + track.name);
            console.log("A preview link of the song from Spotify: " + track.uri);
            console.log("The album that the song is from: " + track.album["name"] + "\n");
        });
    });
}

function movieThis(movieName) {
    if (movieName === "") {
        movieName = "Mr. Nobody";
    }

    request("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let jsonbody = JSON.parse(body);
            console.log("Title of the movie: " + jsonbody.Title);
            console.log("Year the movie came out: " + jsonbody.Released);
            console.log("IMDB Rating of the movie: " + jsonbody.imdbRating);
            jsonbody.Ratings.forEach(rating => {
                if (rating.Source === "Rotten Tomatoes") {
                    console.log("Rotten Tomatoes Rating of the movie: " + rating.Value);
                }
            });
            console.log("Country where the movie was produced: " + jsonbody.Country);
            console.log("Language of the movie: " + jsonbody.Language);
            console.log("Plot of the movie: " + jsonbody.Plot);
            console.log("Actors in the movie: " + jsonbody.Actors);
        }
    });
}

function doWhatItSays(fileName) {
    fs.readFile(fileName, "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        let commands = data.split("\r\n");
        commands.forEach(command => {
            let input = command.split(",");
            main(input);
        });
    });
}

var input = getParams(1);
main(input);
