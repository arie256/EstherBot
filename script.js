'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

function filterWord(s) {
    var words = ['of', 'the', 'in', 'on', 'at', 'to', 'a', 'is'];
    var re = new RegExp('\\b(' + words.join('|') + ')\\b', 'g');
    return (s || '').replace(re, '').replace(/[ ]{2,}/, ' ');
    }


module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Let\'s chat about Liz and Arie\'s wedding!  Say HELLO to get started.')
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let messageText = message.text.trim();
            let wordText = messageText.replace(/[\.,-\/#!$\?\"\'%\^&\*;:{}=\-_`~()]/gi, '');
            let filterText=filterWord(wordText);
            let upperText = filterText.toUpperCase();
            
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
                    return bot.say(`Grrrr.  Sorry, I do not understand "` + upperText + `".`).then(() => 'speak');
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
