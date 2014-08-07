
/** GAME ******************************************************************************************/

function Game () {
    this.activeNPC          = '';
    this.currentArea        = 'a000';
    this.currentDirection   = 'down';
    this.currentFocus       = '';
    this.domain             = location.protocol + '//' + location.host;
    this.directions         = {
        up      : 'up',
        down    : 'down',
        left    : 'left',
        right   : 'right'
    }
    this.fps                = 60;
    this.gridCellSize       = 32;
    this.loading            = 0;
    this.preloading         = false;
    this.pressedKeys        = [];
    this.prevArea           = 'a000';

    /**
     *
     */
    this.calculateZindex = function (object) {
        object.css({
            zIndex: object.position().top
        });
    }

    /**
     *
     */
    this.checkCollisions = function (object, direction) {
        var
            objectCoord = $.game.getCoordinates(object),
            offsetL     = 0,
            offsetT     = 0;

        switch (direction) {

            // Up
            case $.game.directions.up:
                offsetT = -1;

                break;

            // Down
            case $.game.directions.down:
                offsetT = 1;

                break;

            // Left
            case $.game.directions.left:
                offsetL = -1;

                break;

            // Right
            case $.game.directions.right:
                offsetL = 1;

                break;
        }

        if ($.stage.collisionsMap[objectCoord.y + offsetT]) {
            if ($.stage.collisionsMap[objectCoord.y + offsetT][objectCoord.x + offsetL]) {
                return $.stage.collisionsMap[objectCoord.y + offsetT][objectCoord.x + offsetL];
            }
        }

        if ($.stage.portalsMap[objectCoord.y + offsetT]) {
            if ($.stage.portalsMap[objectCoord.y + offsetT][objectCoord.x + offsetL]) {
                return $.stage.portalsMap[objectCoord.y + offsetT][objectCoord.x + offsetL];
            }
        }

        if ($.stage.npcsMap[objectCoord.y + offsetT]) {
            if ($.stage.npcsMap[objectCoord.y + offsetT][objectCoord.x + offsetL]) {
                return $.stage.npcsMap[objectCoord.y + offsetT][objectCoord.x + offsetL];
            }
        }

        if ($.stage.playersMap[objectCoord.y + offsetT]) {
            if ($.stage.playersMap[objectCoord.y + offsetT][objectCoord.x + offsetL]) {
                return $.stage.playersMap[objectCoord.y + offsetT][objectCoord.x + offsetL];
            }
        }

        return false;
    }

    /**
     *
     */
    this.getCoordinates = function (object) {
        var objectPos = object.position();

        return {
            'x': objectPos.left / $.game.gridCellSize,
            'y': objectPos.top / $.game.gridCellSize
        }
    }

    /**
     *
     */
    this.moveObject = function (object, direction, callback) {
        var
            animateOptions  = {},
            objectPos       = object.position(),
            left            = objectPos.left,
            top             = objectPos.top;

        switch (direction) {

            // Up
            case $.game.directions.up:
                animateOptions = {
                    top: top - $.game.gridCellSize
                }

                break;

            // Down
            case $.game.directions.down:
                animateOptions = {
                    top: top + $.game.gridCellSize
                }

                break;

            // Left
            case $.game.directions.left:
                animateOptions = {
                    left: left - $.game.gridCellSize
                }

                break;

            // Right
            case $.game.directions.right:
                animateOptions = {
                    left: left + $.game.gridCellSize
                }

                break;

        }

        object.stop().animate(
            animateOptions,
            180,
            'linear',
            function () {
                $.game.calculateZindex(object);

                if (callback) {
                    callback();
                }
            }
        );
    }

    /**
     *
     */
    this.preload = function () {
        $.game.preloading = true;

        if ($('#loading').length == 0) {
            $('body').append('<div id="loading">Loading...</div>');
        }

        var preload = [
            // Tile Map
            '../img/tile-map.gif',

            // Player
            '../img/rene-down.gif',
            '../img/rene-down-walking.gif',
            '../img/rene-left.gif',
            '../img/rene-left-walking.gif',
            '../img/rene-up.gif',
            '../img/rene-up-walking.gif',

            // NPC
            '../img/dude.gif',

            // Modals
            '../img/modal-border.gif',

            // Emotes
            '../img/emote-happiness.gif',
            '../img/emote-love.gif',
            '../img/emote-question.gif',
            '../img/emote-sadness.gif',
            '../img/emote-talk-angry.gif',
            '../img/emote-talk-happy.gif',
            '../img/emote-think.gif',

            // Icons
            '../img/icon-continue.gif'
        ];

        $.each(preload, function (index, value) {
            $.game.loading = true;

            $.ajax({
                type    : 'GET',
                url     : value
            }).done(function () {
                if (index == (preload.length - 1)) {
                    $.game.loading = false;

                    $.game.start();
                }
            }).fail(function () {
                // Do nothing
            }).always(function () {
                // Do nothing
            });
        });
    }

    /**
     *
     */
    this.start = function () {
        setInterval(function () {
            $.game.update();
        }, 1000 / $.game.fps);

        $.stage.init('a000');
    }

    /**
     *
     */
    this.update = function () {
        if ($.game.loading) {
            if ($('#loading').length == 0) {
                $('body').append('<div id="loading">Loading...</div>');
            }
        } else {
            $('#loading').remove();
        }

        if ($('.modal').length > 0) {
            $.modals.checkButtons();
        }

        if ($('#player').length > 0) {
            $.player.checkButtons();
        }

        $.stage.checkButtons();
    }
};

$.fn.game = function (option) {
    var
        element     = $(this[0]),
        otherArgs   = Array.prototype.slice.call(arguments, 1);

    if (typeof option !== 'undefined' && otherArgs.length > 0) {
        return element.data('game')[option].apply(this[0], [].concat(otherArgs));
    } else if (typeof option !== 'undefined') {
        return element.data('game')[option].call (this[0]);
    } else {
        return element.data('game');
    }
}

$.game = new Game();

/** BINDINGS **************************************************************************************/

//
$(document).on('keydown', function (event) {
    var key = event.keyCode || event.which;

    $.game.pressedKeys[event.keyCode] = true;
});

//
$(document).on('keyup', function (event) {
    var key = event.keyCode || event.which;

    $.game.pressedKeys[event.keyCode]   = false;
    $.modals.allowPress                 = true;
    $.player.allowPress                 = true;
});

/** GAME START! ***********************************************************************************/

//
$(document).on('ready', function () {
    $.game.preload();
});
