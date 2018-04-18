var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var search = require('youtube-search');
var isChinese = require('is-Chinese');
var bodyparser = require('body-parser');
var jsonparse = require('json-parse');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});

logger.add(logger.transports.File, { filename: 'discordLogs.log' });

logger.level = 'debug';
var bot = new Discord.Client();
bot.login(auth.token);


function playMusic(args){
var search_opts = {
	maxResults: 1,
	key: 'AIzaSyDMZFukDb8l8UaVa8EtQqUKm22vjzPGItU' // assume chinese song
	};
	var search_query = args.slice(0);
	search_query.splice(0,1);
	
	if (isChinese(args[1])){
		search_query = args[1];
	}else{
		search_query = search_query.toString();
	}

	search(search_query,search_opts,function(err,result){
		var link = result[0].link;
	});
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
				message.channel.send('This is a test');

				//console.log(message.channel.guild);
				break;
			case 'play':
				playMusic(args);
				break;
			case 'avatar':
				message.reply(message.author.avatarURL);
				break;
			case 'discriminate':
				message.reply(message.author.discriminator);
				break;
			case 'help':
				message.reply('play -music to play a music');
			case 'loop': 
				message.channel.send('$loop');

		}
	}
});