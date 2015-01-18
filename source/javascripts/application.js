//= require '_jquery-2.0.3.min.js'
//= require 'js-yaml.js'
//= require 'underscore.js'

/*

drag to right/left is change speed
as drag is happening, have a circle increasing in size with the number in it. white going forward, red going backward

drag top/bottom is up vote / down vote
use 3d transform. new one fades in from behind

when we scroll through to the end, have it sink to the bottom

we can have a big plus button that pauses the video and opens a modal to add a comment

show comments on screen

show comments on scrollbar

*/


function Player(videos) {
  this.videos = videos.map(function(v) {
    return new Video(v);
  });
  this.playNext();

  _(this).bindAll('onMousewheel','playNext','keyListener','dragStart','dragMove','dragEnd');
  $(window).on('mousewheel',this.onMousewheel);
  $(window).on('keypress',this.keyListener);
  $(window).on('mousedown',this.dragStart);

  this.seek_percent = 0;
  this.seekThrottled = _(function() {
    this.video.seek(this.seek_percent);
    this.video.play();
    this.seek_percent = 0;
  }.bind(this)).throttle(400,{leading: false})

};


_(Player.prototype).extend({

  playNext: function() {
    if (this.video)
      this.video.destroy();

    console.log('PLAY NEXT');
    this.video = this.videos[0]
    this.video.$player.on('ended',this.playNext);
    this.video.play();

    $('.video-name').text(this.video.name);
    this.videos.shift();

  },

  dragStart: function(e) {

    this.mouse_down = true;

    $(window).on('mousemove',this.dragMove);
    $(window).on('mouseup',this.dragEnd);

    this.drag = {start: {x: e.pageX, y: e.pageY}};
  },


  dragMove: function (e) {
    e.preventDefault();
    
    var tolerance = 5;
    if (!this.drag.locked &&
        Math.abs(e.pageY - this.drag.start.y) > tolerance &&
        Math.abs(e.pageX - this.drag.start.x) > tolerance) {

      if (Math.abs(e.pageY - this.drag.start.y) >
          Math.abs(e.pageX - this.drag.start.x))
        this.drag.locked = 'vertical';
      else
        this.drag.locked = 'horizontal';

      console.log(this.drag.locked);
    }


    if (this.drag.locked === 'horizontal') {
      var max_speed = 4;
      var speed = 1 + (e.pageY - this.drag.start.y) / $(window).width() * max_speed;

      console.log(speed);
      this.video.setSpeed(speed);
    }

  },

  dragEnd: function(e) {
    console.log('drag end');

    // return to normal speed
    this.video.setSpeed(1);

    this.drag = false;
    $(window).off('mousemove',this.dragMove);
    $(window).off('mouseup',this.dragEnd);
  },


  keyListener: function(e) {
    console.log('key ' + e.which);
    // space bar
    if (e.which === 32) {
      if (this.video.player.paused)
        this.video.player.play();
      else
        this.video.player.pause();
    }
  },

  favoriteVideo: function(video_url) {
  },

  skipVideo: function() {
  },

  bufferVideo: function(video) {
  },

  onMousewheel: function(e) {
    e.preventDefault();

    this.video.pause();

    var delta = e.originalEvent.deltaY;
    //console.log('delta ' + delta);

    // assume 2000 pixels scrolled to complete video
    this.seek_percent += delta / 2000;

    this.seekThrottled();

    var progress = (this.video.player.currentTime + this.video.player.duration * this.seek_percent) / this.video.player.duration;
    //console.log('progress ' + progress);
    if (progress > 1) {
      this.playNext();
      this.seek_percent = 0;
    }
    $('.bar').css({width: progress * 100 + '%'});
  }

});


function Video(args) {
  _(this).extend(args);
  this.$player = $("<video><source src='" + this.src + "'></video>");
  this.player = this.$player[0];
  $(".video-container").append(this.$player);

  _(this).bindAll('updateBar','onAnyEvent');

  this.$player.on('timeupdate',this.updateBar);

  this.$player.on("loadstart progress suspend abort error emptied stalled loadedmetadata loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange timeupdate play pause ratechange resize volumechange",this.onAnyEvent);

};

_(Video.prototype).extend({

  pause: function() {
    this.player.pause();
  },
 
  play: function() {
    this.player.play();
    this.$player.css({visibility: 'visible'});
  },

  onAnyEvent: function(e) {
    //console.log('VIDEO EVENT: ' + e.type);
    if (_('pause seeking waiting seeked playing play ended'.split(' ')).include(e.type))
      $('.message').text(e.type);
  },

  updateBar: function(e) {
    var progress = this.player.currentTime / this.player.duration;
    $('.bar').css({width: progress * 100 + '%'});
  },

  seek: function(seek_percent) {
    console.log('SEEKING ' + Math.round(seek_percent * 100) + '%');
    this.player.currentTime += seek_percent * this.player.duration;
    this.player.play();
  },

  setSpeed: function(speed) {
    this.player.playbackRate = speed;
  },

  destroy: function() {
    this.$player.remove();
  }

});


$(document).ready(function() {
  $.ajax('http://localhost:3000/metadata/videos',{success:
    function(data) {
      var videos = jsyaml.load(data);
      p = new Player(videos);
    }
  });
});


