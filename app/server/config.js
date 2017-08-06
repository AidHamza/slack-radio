/* jshint node:true */
'use strict';

var slack = process.env.SLACK_TOKEN;
var youtube = process.env.YOUTUBE_KEY;

if(!(slack) || !(youtube)) {
    console.error("Slack Bot Token or Youtube Server Key not set");
    throw new Error("SLACK OR YOUTUBE KEY MISSING");
}

const rc = require('rc');

const DEFAULTS = {
    hostname: "0.0.0.0",
    port: Number(process.env.PORT || 8080),
    reverseProxyMode: false,
    url: undefined,
    dir: {
        client: __dirname + '/../../_public'
    },
    slack: {
        token: slack
    },
    youtube: {
        /**
         * this is an ISO 3166-1 alpha-2 country code
         * <http://www.iso.org/iso/country_codes/iso_3166_code_lists/country_names_and_code_elements.htm>
         */
        region: 'MA',
        key: youtube
    },
    playlist: {
        minDuration: 0,
        votes: 5
    }
};

module.exports = rc('config', DEFAULTS);
