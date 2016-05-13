'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');


module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say("Let's chat about Liz and Arie's wedding!  Say HELLO or ask me a question to get started.")
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let messageText = message.text.trim();
            let useText = messageText.toUpperCase();
            let wordText = useText.replace(/[^A-Z ]/g, '');
            let myWords = wordText.split(' ');
            
            var badWords = ['IS', 'OF', 'THE', 'IN', 'ON', 'AT', 'A', 'AN', 'TELL', 'ME', 'ABOUT', 'SAY', 'WHO',
                'CAN', 'HOW', 'WHAT', 'I', 'AM', 'SHOULD', 'WHATS', 'UP', 'WITH', 'WILL', 'BE', 'THERE',
                'WHERE', 'SERVE', 'THIS', 'DO', 'REALLY', 'DID', 'HE', 'SHE', 'TO', 'HIM', 'HER', 'OK', 'BUT',
                'ARE', 'THEY', 'SO'];
            
            var newWords = [];
            var add;
            for (var i=0; i < myWords.length; i++) {
                add = 1;
                
                CHECKWORD: for (var j=0; j < badWords.length; j++) {
                    if (myWords[i] == badWords[j]) {
                            add = 0;
                            break CHECKWORD;    
                        }
                    }
                
                if (add == 1) { newWords.push(myWords[i]); }
                }
            
            let upperText = newWords.join(' ');
            
            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }
            
            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say('Sorry, I do not understand "' + messageText + '".').then(() => 'speak');
                    //return bot.say('Sorry, I do not understand "' + upperText + '".').then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return bot.say(line);
                    });
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
