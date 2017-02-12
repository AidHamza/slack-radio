const Botkit = require('botkit');

const StatusHandler = require('../statusHandler');

// video providers
const PROVIDERS = [
    require("../providers/youtube")
];

const Playlist = require('./playlist');

function start(app, options) {
    // Init the bot controller
    const controller = Botkit.slackbot({
        stats_optout: true,
        debug: false
        // logLevel: 7
        //include "log: false" to disable logging
        //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
    });

    // Init the bot
    let bot = controller.spawn({
        token: options.slack.token,
        retry: 10
    });

    bot.startRTM(function (err) {
        if (err) {
            console.error(err);
            StatusHandler.setHealthy(false);
        } else {
            StatusHandler.setHealthy(true);
        }
    });

    // Setup webhook endpoints
    // controller.config.hostname = options.hostname;
    // controller.config.port = options.port;
    // controller.createWebhookEndpoints(app);
    const url = getURL(options);

    // TODO: allow multiple playlist instances
    const pl = Playlist.getInstance();

    // Set listeners
    PROVIDERS.forEach(provider => {
        controller.hears([provider.PATTERN], ['direct_mention'], function (bot, message) {

            provider.process(message)
                .then(
                    video => {
                        let added = pl.addVideo(message.user, video);

                        if (added) {
                            console.info(`Video added to queue: ${video.id}`);

                            bot.say({
                                text: `<@${message.user}>: added video to queue - <${video.url}|${video.title}>`,
                                unfurl_links: true,
                                unfurl_media: true,
                                channel: message.channel
                            });
                        } else {
                            console.info(`Video rejected: ${video.id}`);

                            bot.say({
                                text: `<@${message.user}>: Computer says no! I don't like that video, give me something new.`,
                                channel: message.channel
                            });
                        }
                    }
                )
                .catch(console.error.bind(console));

            bot.startTyping(message);
        });
    });

    controller.hears(['skip'], ['direct_mention'], function (bot, message) {
        let voted = pl.voteToSkip(message.user);

        if (voted) {
            bot.reply(message, `<@${message.user}> voted to skip`);
        } else {
            bot.reply(message, `<@${message.user}>: No vote for you!`);
        }
    });

    controller.hears(['link me'], ['direct_mention', 'direct_message'], function (bot, message) {
        bot.reply(message, `<@${message.user}> the url is: <${url}>`);
    });

    controller.hears(['help'], ['direct_mention', 'direct_message'], function (bot, message) {
        bot.reply(message, {
            attachments: [{
                fallback: "list of available commands",
                title: "Available commands",
                text: "*&lt;video_url&gt;*: will add a video url to the queue\n" +
                "*skip*: will vote to skip the current track\n" +
                "*link me*: will print the link to the player\n" +
                "*help*: shows this help screen",
                mrkdwn_in: ["text"]
            }]
        });
    });

    pl.on('video_skip', function (entry, votes) {
        // Video was skipped, say it in all channels
        bot.api.channels.list({}, (err, data) => {
            if (err || data['ok'] !== true) {
                console.error("There was an error listing channels", err);
            } else {
                let channels = [].concat(data.channels || []);

                channels = channels
                    .filter(entry => entry['is_member'])
                    .map(entry => entry['id'])
                    .forEach(id => {
                        bot.say({
                            text: `Skipping video <${entry.video.url}|${entry.video.title}>`,
                            attachments: [{
                                title: "Votes:",
                                text: votes.map(id => `<@${id}>`).join(", ")
                            }],
                            channel: id
                        })
                    })


            }
        })
    });

    // controller.on('slash_command', function(bot, message) {
    //     console.log(message);
    // });

    controller.on('rtm_reconnect_failed', function () {
        StatusHandler.setHealthy(false);
        console.error("Reconnection to slack failed");
    });

    return controller;
}

function getURL(options) {
    if (options.url) {
        return options.url;
    }

    return `http://${options.hostname}${options.port !== 80 ? ":" + options.port : ""}` + (options.path || "");
}

module.exports = {
    start: start
};