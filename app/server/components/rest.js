const Playlist = require('./playlist');

function start(app, options) {
    const statusHandler = require('./../statusHandler');

    app.get('/status', function (req, res) {
        const status = statusHandler.getStatus();

        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');

        if (status.isHealthy) {
            res.status(200).send(status);
        } else {
            res.status(500).send(status);
        }
    });

    // FIXME: handle multiple rooms
    app.get('/state', function (req, res) {
        const pl = Playlist.getInstance();

        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send({
            serverTime: +new Date(),
            currentEntry: pl.getCurrent(),
            entries: pl.getEntries()
        });
    });
}

module.exports = {
    start: start
};