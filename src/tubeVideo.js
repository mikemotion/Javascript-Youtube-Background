;(function (window) { 
  'use strict';
  /**
  * @function extend
  * Deep extend(recursive),by http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
  */
    
    function extend (destination, source) {
      for (var property in source) {
        if (source[property] && source[property].constructor &&
         source[property].constructor === Object) {
          destination[property] = destination[property] || {};
        arguments.callee(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  };

  /**
  * @function loadAPI
  * load youtube javascript API 
  */

    var loadAPI = function loadAPI(callback){
      var tag = document.createElement('script');
      tag.src = "http://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      iframeIsReady(callback);

    }

    var iframeIsReady = function iframeIsReady(callback){
        // Listen for Gobal YT player callback
        if (typeof YT === 'undefined' && typeof window.loadingPlayer === 'undefined') {
        // Prevents Ready Event from being called twice
        window.loadingPlayer = true;
        window.onYouTubeIframeAPIReady = function() {
          window.onYouTubeIframeAPIReady = null;
          callback();
        };
      } else if (typeof YT === 'object')  {
        callback();
      } else {
          callback();
      }

    }

    /**
    * @TubeVideo
    * Create TubeVideo
    */ 
    var TubeVideo= function(node, userOptions){

      this.node = node || ' ';
      this.userOptions = userOptions || ' ';
      this.options = extend(this.defaults, this.userOptions);
      this._init();
      this.node.setAttribute('style', "position: relative; overflow: hidden;");
    }

    TubeVideo.prototype = {
      defaults:  {
        ratio: 16 / 9,
        videoId: 'gxCaDMB6y18',
        mute: true,
        repeat: true,
        width: window.innerWidth,
            //to come 
            // playButtonClass: 'YTPlayer-play',
            // pauseButtonClass: 'YTPlayer-pause',
            // muteButtonClass: 'YTPlayer-mute',
            // volumeUpClass: 'YTPlayer-volume-up',
            // volumeDownClass: 'YTPlayer-volume-down',
            start: 0,
            playerVars: {
              modestbranding: 1,
              autoplay: 1,
              controls: 0,
              showinfo: 0,
              wmode: 'transparent',
              branding: 0,
              rel: 0,
              autohide: 0
                //origin: window.location.origin
              },
              events: null
            },
            _addContainer: function(){
              var self = this;
              var playerWrapper = document.createElement('div');
              playerWrapper.setAttribute("id", self.ID);
              playerWrapper.setAttribute("class", "tubeVideoplayer-container");
              playerWrapper.setAttribute("style", "position: absolute; z-index: -5; width: 100%; height: 100%; top: 0;");
              var playerInner = document.createElement('div');
              playerInner.setAttribute("id", self.holderID);
              self.node.appendChild(playerWrapper).appendChild(playerInner);

            },

        /**
        * @function resize
        * Resize event to change video size
        * params {this} because it will be later called in global scope
        */

        _resize: function(self){

          var container = self.node;
          var width = container.offsetWidth,
          pWidth,
          height = container.offsetHeight,
          pHeight,
          player = document.getElementById(self.holderID);
            // when screen aspect ratio differs from video, video must center and underlay one dimension
            if (width / self.options.ratio < height) {
                pWidth = Math.ceil(height * self.options.ratio); // get new player width
                self._getPlayer().setSize(pWidth,height);
                player.style.left = (width - pWidth) / 2;
                player.style.top = 0;
                 // player width is greater, offset left; reset top
              } else { // new video width < window width (gap to right)
                pHeight = Math.ceil(width / self.options.ratio); // get new player width
                self._getPlayer().setSize(width,pHeight);
                player.style.left = 0;
                player.style.top = 0;
              }
            },


        /**
        * onYouTubeIframeAPIReady – The API will call this function when the page has finished downloading the JavaScript for the player API, which enables you to then use the API on your page. Thus, this function might create the player objects that you want to display when the page loads.
        */
         _onYouTubeIframeAPIReady: function() {
          var self = this;
          self.player = new window.YT.Player(self.holderID, self.options);
        },

        /**
         * @function onPlayerReady
         * @ params {event} window event from youtube player
         */
         _onPlayerReady: function (e) {
          if (this.options.mute) {
            e.target.mute();
          }
          e.target.playVideo();
        },

        /**
         * @function getPlayer
         * returns youtube player
         */
         _getPlayer: function () {
          return this.player;
        },

        /**
         * @function init
         * Start!
         */
         _init: function(){
          var self = this;
          self.ID = (new Date()).getTime();
          self.options.height = Math.ceil(self.node.offsetWidth/ self.options.ratio);
          self.holderID = 'tubeVideo-ID-' + self.ID;
          self._addContainer();
          loadAPI(self._onYouTubeIframeAPIReady.bind(self));
          window.addEventListener('resize', function(event){
            self._resize(self);
          });

          self.defaults.events = {
            onReady: function(e) {
              self._resize(self);
              self._onPlayerReady(e);
              // Callback for when finished
              if (typeof self.options.callback == 'function') {
                self.options.callback.call(this);
              }
            },
            onStateChange: function(e) {
              if (e.data === 1) {
                console.log("video loaded")
              } else if (e.data === 0 && self.options.repeat) { // video ended and repeat option is set true
                self.player.seekTo(self.options.start);
              }
            }
          }
        }
      }

      window.TubeVideo = TubeVideo;

    })(window);