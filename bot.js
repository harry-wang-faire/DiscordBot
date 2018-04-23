var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var search = require('youtube-search');
var isChinese = require('is-Chinese');
var bodyparser = require('body-parser');
var jsonparse = require('json-parse');
var fs = require('fs');
var ytdl = require('ytdl-core');
var bot = new Discord.Client();
bot.login(auth.token);
const broadcast = bot.createVoiceBroadcast();
var dispatcher = null;

// To add the bot to you server goto https://discordapp.com/oauth2/authorize?client_id=YOUR_ID&scope=bot

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.add(logger.transports.File, { filename: 'discordLogs.log' });
logger.level = 'debug';

var playList = [];
var pl = [];
var search_opts = {
	maxResults: 1,
	key: 'AIzaSyDMZFukDb8l8UaVa8EtQqUKm22vjzPGItU' 
	};


function getQuery(args){
	var search_query = args.slice(0);
	search_query.splice(0,1);
	if (isChinese(args[1])){
		search_query = args[1];
	}else{
		search_query = search_query.join(' ');
	}
	return search_query;
}

function playMusic(args,message){
	if (message.member.voiceChannel !== undefined){
		var search_query = getQuery(args);
		search(search_query,search_opts,function(err,result){
		if (err) logger.error('Error while searching and the error is ' + err);
		else {
		logger.info("found the video");
		var link = result[0].link;
		message.member.voiceChannel.join()
			.then(function(connection){
				const stream = ytdl(link, { filter : 'audioonly' });
				 dispatcher = connection.playStream(stream);
				 logger.info("Playing");
				})
			.catch(console.error);
	}
	});
}else{
	message.channel.send("You are not in any Voice channel!");
}
}


bot.on('ready',function(evt){
	logger.info('Connected');
	logger.info('Logged in as: ' + bot.user.username);
});


bot.on('message', function(message) {
	//console.log(message.content);
	if(message.content.substring(0,1) === '$'){
		var args = message.content.substring(1).split(' ');
		var cmd = args[0];
		//console.log(message.member);
		//message.member.voiceChannel.join().then(connection => console.log('Connected!'))
  		//								.catch(console.error);;
		switch(cmd){
			case 'test':
			message.member.voiceChannel.join()
			.then(function(connection){
				const stream = ytdl("https://www.youtube.com/watch?v=WifuIg4PhHw", { filter : 'audioonly' });
				 dispatcher = connection.playStream(stream);
				 dispatcher.on('end',function(){
				playMusic(pl[0],message);
				pl.splice(0,1);
				playList.splice(0,1);
				logger.info("A song has finished");
				PlayMusic(pl[0],message);
				});
				 logger.info("Playing");
				})
			.catch(console.error);
				break;
			case 'play':
			if (args[1] !== "playlist")
				playMusic(args,message);
			else {
				playMusic(pl[0],message);
			}
			break;
			case 'pause':
				dispatcher.pause();
				logger.info("Paused");
				break;
			case 'end':
				dispatcher.end();
				logger.info("Ended");
				message.member.voiceChannel.leave();
				break;	
			case 'resume':
				dispatcher.resume();
				break;
			case 'avatar':
				message.reply(message.author.avatarURL);
				break;
			case 'discriminate':
				message.reply(message.author.discriminator);
				break;
			case 'help':
				message.reply('play -music to play a music');
				break;
			case 'loop': 
				message.channel.send('$loop');
				break;
			case 'add':
				var query = getQuery(args);
				playList.push(query);
				pl.push(args);
				logger.log(pl);
				logger.log(playList);
				message.reply("You have added "+query+" to your playList");
				break;
			case 'skip':
				if (playList.length===0) message.reply("This is the last song!");
				else if (dispatcher === null) message.reply("You are not playing any songs yet!");
				else {
					playMusic(pl[0],message);
					pl.splice(0,1);
					playList.splice(0,1);
					logger.info("Skipped a song");
					playMusic(pl[0],message);
				}
				break;
			case 'playlist':
				if (playList.length===0) {
				message.reply("Sorry, there are no songs in the playlist right now, use add to add -songName to add some")
				}else{
				message.channel.send("here is the playlist");
				for (var i = 0; i < playList.length; i++){
				message.channel.send(i+1 + " " + playList[i]);
				}
			}
				break;
		}
	}
});
