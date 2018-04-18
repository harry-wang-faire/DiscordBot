var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
var bot = new Discord.Client();
bot.login(auth.token);
bot.on('ready',function(evt){
	logger.info("Connected");
	logger.info("Logged in as: " + bot.user.username);
});

bot.on('message', function(message) {
	console.log(message.content);
	if(message.content.substring(0,1) === '$'){
		var args = message.content.substring(1).split(' ');
		var cmd = args[0];
		switch(cmd){
			case 'test':
				message.channel.send('This is a test');
				break;
		}
	}
});