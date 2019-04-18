// Initialiser Discord.js
const Discord = require("discord.js");
// Initialiser le bot grâce au module Discord.JS
const bot = new Discord.Client();
// Initialiser Fs
const fs = require("fs");

const réponse = JSON.parse(fs.readFileSync("./eightball.json", "utf8"));

// Indiquer le chemin vers les commandes | Les aides de commandes, commande HELP
const commands = JSON.parse(fs.readFileSync("Storage/commands.json", "utf8"));

// Paramètres du bot - Paramètres globaux
const prefix = '#'; // Ici se trouve le préfix du bot

// Permet d'envoyer un message dans le channel member-logs quand un utilisateur rejoint le serveur
bot.on('guildMemberAdd', member => {
  const channel = member.guild.channels.find(ch => ch.name === 'member-log');
  if(!channel) return;
	var hey_Embed = new Discord.RichEmbed()
	.setColor("#15f153")
	.addField("Est arrivé :", `${member}`)
	channel.send(hey_Embed);
})

// Permet d'envoyer un message dans le channel member-logs quand un utilisateur part du serveur
bot.on('guildMemberRemove', member => {
  const channel = member.guild.channels.find(ch => ch.name === 'member-log');
  if(!channel) return;
	var bye_Embed = new Discord.RichEmbed()
	.setColor("#e20404")
	.addField("Est partit :", `${member}`)
	channel.send(bye_Embed);
})

// Cette ligne permet au bot de pouvoir lire la commande, sans ca il lui sera impossible de la comprendre
bot.on('message', message => {

	if (!message.guild) return;

	// Les variables utilisées ici vont permettres de pouvoir effectuer du code plus rapidement
	// Variables :
	let msg = message.content.toUpperCase(); // Cette variable lis le message
	let sender = message.author; // Celui variable lis celui qui aura effectué la commande, son pseudo
	let cont = message.content.slice(prefix.length).split(" "); // Cette variable permet de lire le contenu après la commande
	let args = cont.slice(1); // Cete variable contient la variable cont qui dit que c'est du contenu de type chiffre après la commande


	if (sender.bot) return;


	if (msg.startsWith(prefix + "PURGE")) {

		if(!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")) return message.channel.send("Vous n'avez pas la permission");


		if(!args[0]) return message.channel.send("Merci de préciser le nombre de messages à supprimer.")
		message.channel.bulkDelete(args[0]).then(() => {
      message.channel.send("**Nombres de messages supprimés :** `" + args[0] + "`").then(()  => {
        message.delete(2500)});
		});

	}

	if (msg.startsWith(prefix + "HELP")) {

		if (msg === `${prefix}HELP`) {

      const cmdsAt = new Discord.Attachment('./commandes.txt');

			const embed = new Discord.RichEmbed()
				.setColor(0x1D82B6)

			let commandsFound = 0;

			for (var cmd in commands) {

				if (commands[cmd].group.toUpperCase() === 'USER') {

					commandsFound++

					embed.addField(`${commands[cmd].name}`, `**Description :** ${commands[cmd].desc}\n**Utilisation :** ${commands[cmd].usage}\n**Groupe :** ${commands[cmd].group}`)

				}

			}

			embed.setFooter(`Entrain de montrer les commandes USER. Pour voir un autre groupe effectuez la commande ${prefix}help [group / command]\nLes commandes ne fonctionnent pas en privé !`)
			embed.setDescription(`**${commandsFound} commandes trouvées** - <> Veut dire requis, [] veut dire optionel`)


			sender.send({embed})
      sender.send(cmdsAt)
			message.channel.send({embed : {
				color: 0x1D82B6,
				description: `**Check your DMs ${sender}!**`
			}})

		} else if (args.join(" ").toUpperCase() === "GROUPS") {

			let groups = '';

			for (var cmd in commands) {

				if (!groups.includes(commands[cmd].group)) {

					groups += `${commands[cmd].group}\n`

				}

			}

			message.channel.send({embed : {
				description:`**${groups}**`,
				title:"Groupes",
				color: 0x1D82B6
			}})

			return;

		} else {

			let groupFound = '';

			for (var cmd in commands) {

				if (args.join(" ").trim().toUpperCase() === commands[cmd].group.toUpperCase()) {

					groupFound = commands[cmd].group.toUpperCase();

					break;

				}

			}

			if (groupFound != '') {

				const embed = new Discord.RichEmbed()
					.setColor(0x1D82B6)

				let commandsFound = 0;

				for (var cmd in commands) {

					if (commands[cmd].group.toUpperCase() === groupFound) {

						commandsFound++

						embed.addField(`${commands[cmd].name}`, `**Description :** ${commands[cmd].desc}\n**Utilisation :** ${commands[cmd].usage}\n**Groupe :** ${commands[cmd].group}`)

					}

				}

				embed.setFooter(`Entrain de montrer les commandes ${groupFound}. Pour voir un autre groupe effectuez la commande ${prefix}help [group / command]`)
				embed.setDescription(`**${commandsFound} commandes trouvées** - <> Veut dire requis, [] veut dire optionel`)


				sender.send({embed})
				message.channel.send({embed : {
					color: 0x1D82B6,
					description: `**Check your DMs ${sender}!**`
				}})

				return;

			}

			let commandFound = '';
			let commandDesc = '';
			let commandUsage = '';
			let commandGroup = '';

			for (var cmd in commands) {

				if (args.join(" ").trim().toUpperCase() ===  commands[cmd].name.toUpperCase()) {

					commandFound = commands[cmd].name;
					commandDesc = commands[cmd].desc;
					commandUsage = commands[cmd].usage;
					commandGroup = commands[cmd].group;

					break;

				}

			}

			if (commandFound === '') {

				message.channel.send({embed : {
					description:`**Aucun groupe ou commande nommée :** ${args.join(" ")}\n**N'a été trouvée !**`,
					color: 0x1D82B6,
				}})

			}

			message.channel.send({embed : {
				title:'<> Veut dire requis, [] veut dire optionel',
				color: 0x1D82B6,
				fields: [{
					name:commandFound,
					value:`**Description:** ${commandDesc}\n**Utilisation:** ${commandUsage}\n**Groupe:** ${commandGroup}`
				}]
			}})

		}

	}

	if (msg.startsWith(prefix + "PING")) {

		message.channel.send(":ping_pong: **Pong !**")

	}

	if (msg.startsWith(prefix + "KICK")) {

		let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
		if(!kUser) return message.channel.send("Utilisateur Introuvable ou Non Mentionné !");
		let kReason = args.join(" ").slice(22);
		if(!kReason) return message.channel.send("Merci d'indiquer la raison du kick !");
		if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("Vous n'avez pas la permission `KICK_MEMBERS`\nVous ne pouvez donc pas kick un membre du serveur")
		if(kUser.hasPermission("KICK_MEMBERS")) return message.channel.send("Cette personne ne peut pas être kick !")

		let kickEmbed = new Discord.RichEmbed()
		.setDescription("Kick")
		.setTimestamp()
		.setColor("#15f153")
		.addField("Membre Kick", `${kUser} avec l'ID |${kUser.id}|`)
		.addField("Kick Par", `<@${message.author.id}> with ID |${message.author.id}|`)
		.addField("Channel", message.channel)
		.addField("Raison", `${kReason}`);

		let kickChannel = message.guild.channels.find('name', "logs");
		if(!kickChannel) return message.channel.send("Impossible de trouver le channel `#logs`\nMerci de le créer ou de le renommer correctement !");


		message.guild.member(kUser).kick(kReason);
		message.delete().catch(O_o=>{});
		message.channel.send("Membre kick !\nPour plus de détails voir channel #logs")
		kickChannel.send(kickEmbed)

	}

	if (msg.startsWith(prefix + "BAN")) {

		let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
		if(!bUser) return message.channel.send("Utilisateur Introuvable ou Non Mentionné !");
		let bReason = args.join(" ").slice(22);
		if(!bReason) return message.channel.send("Merci d'indiquer la raison du ban !");
		if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send("Vous n'avez pas la permission `BAN_MEMBERS`\nVous ne pouvez donc pas bannir un membre du serveur")
		if(bUser.hasPermission("BAN_MEMBERS")) return message.channel.send("Cette personne ne peut pas être bannie !")

		let banEmbed = new Discord.RichEmbed()
		.setDescription("Ban")
		.setColor("#bc0000")
		.setTimestamp()
		.addField("Membre Banni", `${bUser} avec l'ID |${bUser.id}|`)
		.addField("Banni Par", `<@${message.author.id}> with ID |${message.author.id}|`)
		.addField("Channel", message.channel)
		.addField("Raison", `${bReason}`);

		let banChannel = message.guild.channels.find('name', "logs");
		if(!banChannel) return message.channel.send("Impossible de trouver le channel `#logs`\nMerci de le créer ou de le renommer correctement !");

		message.guild.member(bUser).ban(bReason);
		message.delete().catch(O_o=>{});
	  message.channel.send("Membre kick !\nPour plus de détails voir channel #logs")
		banChannel.send(banEmbed)

	}

	if (msg.startsWith(prefix + "BOTINFO")) {

		let bicon = bot.user.displayAvatarURL;
		let botembed = new Discord.RichEmbed()

		.setDescription("Bot's Informations")
		.setColor("#15f153")
		.setThumbnail(bicon)
		.addField("Name", bot.user.username)
		.addField("Discriminator", bot.user.Discriminator)
    .addField("Prefix", prefix)
		.addField("ID", bot.user.id)
		.addField("Created At", bot.user.createdAt);

		return message.channel.send(botembed);

	}

	if (msg.startsWith(prefix + "SERVERINFO")) {

		let sicon = message.guild.iconURL;

    message.channel.send({embed: {
      color: 3447003,
      title: "Server's Informations",
      fields: [
        { name: "Name", value: `${message.guild.name}`, inline: true},
        { name: "Owner", value: `${message.guild.owner}`, inline: true},
        { name: "Owner ID", value: `${message.guild.ownerID}`, inline: true},
        { name: "AFK Channel", value: `${message.guild.afkChannel}`, inline: true},
        { name: "AFK Timeout", value: `${message.guild.afkTimeout}`, inline: true},
        { name: "Default Role", value: `${message.guild.defaultRole}`, inline: true},
        { name: "Roles Count", value: `${message.guild.roles.size}`, inline: true},
        { name: "Member Count", value: `${message.guild.memberCount}`, inline: true},
        { name: "Channels/Cat Count", value: `${message.guild.channels.size}`, inline: true},
        { name: "Verification Level", value: `${message.guild.verificationLevel}`, inline: true},
        { name: "Default Channel", value: `${message.guild.defaultChannel}`, inline: true},
        { name: "Emojis List", value: `${message.guild.emojis}`, inline: true},
        { name: "You Joined", value: `${message.member.joinedAt}`, inline: true},
        { name: "Created", value: `${message.guild.createdAt}`, inline: true}
      ]
    }})
	}

  if (msg.startsWith(prefix + "USERINFO")) {

    let userinfo_embed = new Discord.RichEmbed()
    .setDescription("User's Informations")
    .setColor("#15f153")
    .setThumbnail(sender.displayAvatarURL)
    .addField("Name", sender.username)
    .addField("Discriminator", sender.Discriminator)
    .addField("ID", sender.id)
    .addField("Created At", sender.createdAt)
    message.delete().catch(O_o=>{});
    message.channel.send(userinfo_embed);

  }

	if (msg.startsWith(prefix + "REPORT")) {

		let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
		if(!rUser) return message.channel.send("Utilisateur Introuvable ou Non Mentionné !");
		let reason = args.join(" ").slice(22);
		if(!reason) return message.channel.send("Merci d'indiquer la raison de votre report !");

		let reportEmbed = new Discord.RichEmbed()
		.setDescription("Reports")
		.setTimestamp()
		.setColor("#15f153")
		.addField("Utilisateur Report", `${rUser} avec l'ID ${rUser.id}`)
		.addField("Report Par", `${message.author} avec l'ID ${message.author.id}`)
		.addField("Channel", message.channel)
		.addField("Raison", reason);

		let reportschannel = message.guild.channels.find(`name`, "reports");
		if(!reportschannel) return message.channel.send("Veuillez créer le channel `reports` afin de pouvoir report quelqu'un");

		message.channel.send("Utilisateur Report !")
		reportschannel.send(reportEmbed);

	}

	if (msg.startsWith(prefix + "INVITE")) {

		var inviteEmbed = new Discord.RichEmbed()
		.setTimestamp()
		.setColor("#15f153")
		.addField("Tu souhaite m'inviter sur ton serveur ?", "[Clique Sur Ce Lien !](https://discordapp.com/oauth2/authorize?client_id=565167041200390154&scope=bot&permissions=8)")

		console.log("Lien d'invitation généré !")

		message.delete().catch(O_o=>{});
		message.channel.send(inviteEmbed);

	}

	if (msg.startsWith(prefix + "SOND")) {

	if(!message.guild.member(sender).hasPermission("ADMINISTRATOR")) return message.channel.send("Tu ne peux pas effectuer de sondage");
		let thingToEcho = args.join(" ")
		if (!thingToEcho) return message.channel.send("Merci d'introduire le nom de votre sondage !");
		var embed = new Discord.RichEmbed()
			.setDescription(":tada: Sondage :tada:")
			.addField(thingToEcho, "Répondre avec :white_check_mark: ou :x:")
			.setColor("0x0000FF")
			.setTimestamp()
		message.delete();
		message.channel.send("@everyone !")
		message.channel.send(embed)
		.then(function (message) {
			message.react("✅")
			message.react("❌")
		}).catch(function() {
		});
		}

	if (msg.startsWith(prefix + "SERVERLIST")) {

		message.channel.send(bot.guilds.map(r => r.name + ` | **${r.memberCount}** membres`))

	}

	if (msg.startsWith(prefix + "LATENCE")) {

		message.channel.sendMessage('Temps de latence avec le serveur: `' + `${message.createdTimestamp - Date.now()}` + ' ms`');

	}

	if (msg.startsWith(prefix + "MUTE")) {

		if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR")) return message.channel.send("Vous n'avez pas la permission");

		if(message.mentions.users.size === 0) {
				return message.channel.send("Veuillez mentionner un utilisateur");
		}

		var mute = message.guild.member(message.mentions.users.first());
		if(!mute) {
				return message.channel.send("Utilisateur introuvable ou impossible à mute");
		}

		if(!message.guild.member(bot.user).hasPermission("ADMINISTRATOR")) return message.channel.send("Je n'ai pas la permission de mute");
		message.channel.overwritePermissions(mute, { SEND_MESSAGES: false}).then(member => {
				message.channel.send(`${mute.user.username} a été mute !`);
		})

	}

	if (msg.startsWith(prefix + "UNMUTE")) {

        if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR")) return message.channel.send("Vous n'avez pas la permission `ADMINISTRATOR`");

        if(message.mentions.users.size === 0) {
            return message.channel.send("Veuillez mentionner un utilisateur");
        }

        var mute = message.guild.member(message.mentions.users.first());
        if(!mute) {
            return message.channel.send("Utilisateur introuvable ou impossible à mute");
        }

        if(!message.guild.member(bot.user).hasPermission("ADMINISTRATOR")) return message.channel.send("Je n'ai pas la permission d'unmute. Il me manque la permission `ADMINISTRATOR`");
        message.channel.overwritePermissions(mute, { SEND_MESSAGES: true}).then(member => {
            message.channel.send(`${mute.user.username} n'est plus mute !`);
        })

	}

  if (msg.startsWith(prefix + "PROGRES")) {

    message.channel.send("Etat de la progression du bot\n```markdown\n[▇▇▇▇▇▇▇      ] 70%```")

  }

  if (msg.startsWith(prefix + "NEIN")) {

        // Send the attachment in the message channel
        const attachment = new Discord.Attachment('./nein.mp4');
        message.channel.send("NEIN NEIN NEIN !")
        message.channel.send(attachment);

    }

  if (msg.startsWith(prefix + "NEWROLE")) {

    if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR")) return message.channel.send("Vous n'avez pas la permission de créer de nouveaux rôles\nSi vous souhaitez effectuer la commande, demandez à/aux (l')administrateur(s) du serveur de vous donnez la permission `ADMINISTRATOR` :wink:");

    let rolename = args.join(" ")
    if (!rolename) return message.channel.send("Merci d'introduire le nom du nouveau rôle à créer");

    message.guild.createRole({
      name: `${rolename}`,
      color: `0x0000FF`,
    })
    .then(role => console.log(`Nouveau role créé ! Nom: ${rolename}, Couleur: 0x0000FF`))
    .then(role => {
      var roleembed = new Discord.RichEmbed()
      .setColor(0x0000FF)
      .setTitle("Nouveau rôle créé")
      .addField("Nom", `${rolename}`)
      .addField("Couleur", "Couleur de base : Couleur de l'embed")
      .setFooter("Commande non finie - Vous pouvez modifier les permissions dans les paramètres du serveur")
      message.channel.send(roleembed);
    })
    let rolelogs = message.guild.channels.find('name', "logs");
    rolelogs.send(`Nouveau role créé ! Nom: ${rolename}, Couleur: 0x0000FF`)

  }

  if (msg.startsWith(prefix + "NOTIF")) {

    const notif_att = new Discord.Attachment('./gifs/notif.gif')
    message.channel.send(notif_att);

  }

  if (msg.startsWith(prefix + "THINKING")) {

    const think_att = new Discord.Attachment("./gifs/thinking.gif")
    message.channel.send(think_att);

  }

  if (msg.startsWith(prefix + "NOEVERYONE")) {

    const noever_att = new Discord.Attachment("./gifs/notifeveryone.gif")
    message.channel.send(noever_att);

  }

});



// SAY
bot.on('message', message => {

  let msg = message.content.toLowerCase();
  let args = message.content.slice(prefix.length).trim().split(' ');
  let command = args.shift().toLowerCase();
  let say = args.join(' ');

  if(command === 'say') {
  if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR")) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
  if(!args[0]) return message.channel.send("Veuillez Introduire Un Texte ");
    var help_embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .addField(`Annonce de ${message.author.username}`, `${say}`)
    .setFooter(`Annonce générée grace au bot : WiiZ Mod V2.1 - M.A.J : 09-04-2019`)
    message.channel.sendEmbed(help_embed)

    message.delete();
  }
});

// 8BALL
bot.on('message', message => {

  if (message.content.startsWith(prefix + "8ball")) {

    var args = message.content.split(" ").join(" ").slice(6);

    if(!args) return message.channel.send("Pose moi une question, je suis toute oui !")

    var ball_embed = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(":8ball: Voici mon 8ball")
    .addField("Question :", `${args}`)
    .addField('Réponse :', réponse[Math.round(Math.random() * réponse.length)])
    .setFooter("8Ball | WiiZ Mod V2.1 - M.A.J : 09-04-2019")
    message.channel.send(ball_embed);

  }

});


// WARN
bot.on('message', message => {
	var fs = require('fs');

	let warns = JSON.parse(fs.readFileSync("./warns.json", "utf8"));

	if (message.content.startsWith(prefix + "warn")){

	if (message.channel.type === "dm") return;

	var mentionned = message.mentions.users.first();

	if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**").catch(console.error);

	if(message.mentions.users.size === 0) {

	  return message.channel.send("**:x: Vous n'avez mentionnée aucun utilisateur**");

	}else{

	    const args = message.content.split(' ').slice(1);

	    const mentioned = message.mentions.users.first();

	    if (message.member.hasPermission('MANAGE_GUILD')){

	      if (message.mentions.users.size != 0) {

	        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">") {

	          if (args.slice(1).length != 0) {

	            const date = new Date().toUTCString();

	            if (warns[message.guild.id] === undefined)

	              warns[message.guild.id] = {};

	            if (warns[message.guild.id][mentioned.id] === undefined)

	              warns[message.guild.id][mentioned.id] = {};

	            const warnumber = Object.keys(warns[message.guild.id][mentioned.id]).length;

	            if (warns[message.guild.id][mentioned.id][warnumber] === undefined){

	              warns[message.guild.id][mentioned.id]["1"] = {"raison": args.slice(1).join(' '), time: date, user: message.author.id};

	            } else {

	              warns[message.guild.id][mentioned.id][warnumber+1] = {"raison": args.slice(1).join(' '),

	                time: date,

	                user: message.author.id};

	            }

	            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});

	message.delete();

	            message.channel.send(':warning: | **'+mentionned.tag+' à été averti**');

	message.mentions.users.first().send(`:warning: **Warn |** depuis **${message.guild.name}** donné par **${message.author.username}**\n\n**Raison:** ` + args.slice(1).join(' '))

	          } else {

	            message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");

	          }

	        } else {

	          message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");

	        }

	      } else {

	        message.channel.send("Erreur mauvais usage: "+prefix+"warn <user> <raison>");

	      }

	    } else {

	      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**");

	    }

	  }

	}



	  if (message.content.startsWith(prefix+"seewarns")||message.content===prefix+"seewarns") {

	if (message.channel.type === "dm") return;

	if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**").catch(console.error);

	    const mentioned = message.mentions.users.first();

	    const args = message.content.split(' ').slice(1);

	    if (message.member.hasPermission('MANAGE_GUILD')){

	      if (message.mentions.users.size !== 0) {

	        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">") {

	          try {

	            if (warns[message.guild.id][mentioned.id] === undefined||Object.keys(warns[message.guild.id][mentioned.id]).length === 0) {

	              message.channel.send("**"+mentioned.tag+"** n'a aucun warn :eyes:");

	              return;

	            }

	          } catch (err) {

	            message.channel.send("**"+mentioned.tag+"** n'a aucun warn :eyes:");

	            return;

	          }

	          let arr = [];

	          arr.push(`**${mentioned.tag}** a **`+Object.keys(warns[message.guild.id][mentioned.id]).length+"** warns :eyes:");

	          for (var warn in warns[message.guild.id][mentioned.id]) {

	            arr.push(`**${warn}** - **"`+warns[message.guild.id][mentioned.id][warn].raison+

	            "**\" warn donné par **"+message.guild.members.find("id", warns[message.guild.id][mentioned.id][warn].user).user.tag+"** a/le **"+warns[message.guild.id][mentioned.id][warn].time+"**");

	          }

	          message.channel.send(arr.join('\n'));

	        } else {

	          message.channel.send("Erreur mauvais usage: "+prefix+"seewarns <user> <raison>");

	          console.log(args);

	        }

	      } else {

	        message.channel.send("Erreur mauvais usage: "+prefix+"seewarns <user> <raison>");

	      }

	    } else {

	      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**");

	    }

	  }





	  if (message.content.startsWith(prefix+"deletewarns")||message.content===prefix+"deletewarns") {

	if (message.channel.type === "dm") return;

	if(!message.guild.member(message.author).hasPermission("MANAGE_GUILD")) return message.reply("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**").catch(console.error);

	   const mentioned = message.mentions.users.first();

	    const args = message.content.split(' ').slice(1);

	    const arg2 = Number(args[1]);

	    if (message.member.hasPermission('MANAGE_GUILD')){

	      if (message.mentions.users.size != 0) {

	        if (args[0] === "<@!"+mentioned.id+">"||args[0] === "<@"+mentioned.id+">"){

	          if (!isNaN(arg2)) {

	            if (warns[message.guild.id][mentioned.id] === undefined) {

	              message.channel.send(mentioned.tag+" n'a aucun warn");

	              return;

	            } if (warns[message.guild.id][mentioned.id][arg2] === undefined) {

	              message.channel.send("**:x: Ce warn n'existe pas**");

	              return;

	            }

	            delete warns[message.guild.id][mentioned.id][arg2];

	            var i = 1;

	            Object.keys(warns[message.guild.id][mentioned.id]).forEach(function(key){

	              var val=warns[message.guild.id][mentioned.id][key];

	              delete warns[message.guild.id][mentioned.id][key];

	              key = i;

	              warns[message.guild.id][mentioned.id][key]=val;

	              i++;

	            });

	            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});

	            if (Object.keys(warns[message.guild.id][mentioned.id]).length === 0) {

	              delete warns[message.guild.id][mentioned.id];

	            }

	            message.channel.send(`Le warn de **${mentioned.tag}**\': **${args[1]}** a été enlevé avec succès!`);

	            return;

	          } if (args[1] === "tout") {

	            delete warns[message.guild.id][mentioned.id];

	            fs.writeFile("./warns.json", JSON.stringify(warns), (err) => {if (err) console.error(err);});

	            message.channel.send(`Les warns de **${mentioned.tag}** a été enlevé avec succès!`);

	            return;

	          } else {

	            message.channel.send("Erreur mauvais usage: "+prefix+"deletewarns <utilisateur> <nombre>");

	          }

	        } else {

	          message.channel.send("Erreur mauvais usage: "+prefix+"deletewarns <utilisateur> <nombre>");

	        }

	      } else {

	       message.channel.send("Erreur mauvais usage: "+prefix+"deletewarns <utilisateur> <nombre>");

	      }

	    } else {

	      message.channel.send("**:x: Vous n'avez pas la permission `Gérer le serveur` dans ce serveur**");

	    }

	  }
	})

// Cete ligne permet au bot d'envoyer un message dans la console afin de nous signaler qu'il est allumé.
bot.on('ready', () => {
	// envoie un message dans la console
	console.log("______________________________________")
  console.log("|                                    |")
	console.log("|\\      /\\      /   ||  ||   =====   |")
	console.log("| \\    /  \\    /    ||  ||      //   |")
  console.log("|  \\  /    \\  /     ||  ||     //    |")
	console.log("|   \\/      \\/      ||  ||    //==   |")
	console.log("|                                    |")
	console.log("|        WiiZ Moderation V2.1        |")
	console.log("|____________________________________|")
	console.log("BOT ALLUME !")
	bot.user.setActivity("#help", {type: "WATCHING"});

})

// Cette ligne permet d'allumer le bot grâce au token
bot.login(process.env.TOKEN);
