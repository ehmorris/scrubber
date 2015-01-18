//= require '_jquery-2.0.3.min.js'
//= require 'js-yaml.js'
//= require 'underscore.js'

/*
 * to do:

add comment button

show comments on screen

show comments on scrollbar

drag left to go backward 

transition or something to indicate video has changed

drag to bottom to skip

drag to top to favorite / upvote

*/


function Player(videos) {
  this.videos = videos.map(function(v) {
    return new Video(v);
  });
  this.playNext();

  _(this).bindAll('onMousewheel','playNext','keyListener','dragStart','dragMove','dragEnd','addComment','commentSubmit');
  $(window).on('mousewheel',this.onMousewheel);
  $(window).on('keypress',this.keyListener);
  $(window).on('mousedown',this.dragStart);

  $('.add-comment').on('click',this.addComment);

  this.seek_percent = 0;
  this.seekThrottled = _(function() {
    this.video.seek(this.seek_percent);
    this.video.play();
    this.seek_percent = 0;
  }.bind(this)).throttle(400,{leading: false})

  this.speed = 1;
  this.setSpeedThrottled = _(function() {
    this.video.setSpeed(this.speed);
  }.bind(this)).throttle(1000,{leading: false})



};


_(Player.prototype).extend({

  playNext: function() {
    console.log('PLAY NEXT');

    if (this.video)
      this.video.destroy();

    this.video = this.videos[0];
    this.video.$player.on('ended',this.playNext.bind(this));
    this.video.play();

    $('.video-name').text(this.video.name);
    this.videos.shift();
  },

  addComment: function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('ADD COMMENT');
    $('.comment-modal').fadeIn();
    this.video.pause();
  },

  commentSubmit: function() {
    $('.comment-modal').fadeOut();
    this.video.play();
  },

  dragStart: function(e) {

    this.mouse_down = true;

    $(window).on('mousemove',this.dragMove);
    $(window).on('mouseup',this.dragEnd);

    this.drag = {start: {x: e.pageX, y: e.pageY}};

  },


  dragMove: function (e) {
    e.preventDefault();
    $('.bubble').css({transform: 'translate(' + e.pageX + 'px,' + e.pageY + 'px)'});
    
    var lock_tolerance = 5;
    if (!this.drag.locked &&
        Math.abs(e.pageY - this.drag.start.y) > lock_tolerance &&
        Math.abs(e.pageX - this.drag.start.x) > lock_tolerance) {

      if (Math.abs(e.pageY - this.drag.start.y) >
          Math.abs(e.pageX - this.drag.start.x))
        this.drag.locked = 'vertical';
      else
        this.drag.locked = 'horizontal';

      $('.bubble-text').text('');
      $('.bubble').css({fontSize: '', opacity: ''});
      $('.bubble').show();

      console.log('DRAGGING ' + this.drag.locked);
    }


    if (this.drag.locked === 'horizontal') {
      var max_speed = 6;

      var drag_width = (e.pageX - this.drag.start.x) / $(window).width();
      console.log('drag % ' + Math.round(drag_width * 100));
      this.speed = 1 + drag_width * max_speed;

      console.log({
        fontSize: (drag_width + 1) * 40,
        opacity: .4 + (.6 * drag_width)});
 
      $('.bubble').css({
        fontSize: (drag_width + 1) * 20,
        opacity: .4 + (.6 * drag_width)});
      $('.bubble-text').text(Math.round(this.speed * 10)/10 + 'x');
      this.setSpeedThrottled();

    }

  },

  dragEnd: function(e) {
    console.log('drag end');
    //$('.bubble').hide();

    // return to normal speed
    this.speed = 1;
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
    //if (_('pause seeking waiting seeked playing play ended'.split(' ')).include(e.type))
    //  $('.message').text(e.type);
  },

  updateBar: function(e) {
    var progress = this.player.currentTime / this.player.duration;
    $('.bar').css({width: progress * 100 + '%'});
  },

  seek: function(seek_percent) {

    var time_addition = seek_percent * this.player.duration;

    if (this.player.currentTime + time_addition > this.player.duration) {
      console.log('SEEKING past the end');
      this.$player.trigger('ended');
      return;
    }
    else {
      console.log('SEEKING ' + Math.round(seek_percent * 100) + '%');
      this.player.currentTime += time_addition;
      this.player.play();
    }
  },

  setSpeed: function(speed) {
    console.log('SPEED ' + speed);
    this.player.playbackRate = speed;
  },

  destroy: function() {
    this.$player.remove();
  }

});



$(document).ready(function() {
  $.ajax('http://localhost:3000/metadata/videos.yaml',{success:
    function(data) {
      var videos = jsyaml.load(data);
      p = new Player(videos);
    }
  });
});


