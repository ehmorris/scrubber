//= require '_jquery-2.0.3.min.js'
//= require 'js-yaml.js'
//= require 'underscore.js'


function Player(videos) {
  this.videos = videos.map(function(v) {
    return new Video(v);
  });

  this.pointer = -1;
  this.playNext();

  _(this).bindAll('onMousewheel','playNext','keyListener','dragStart','dragMove','dragEnd','commentPrompt','commentSubmit');
  $(window).on('mousewheel',this.onMousewheel);
  $(window).on('keypress',this.keyListener);
  $(window).on('mousedown',this.dragStart);

  $('.add-comment').on('click',this.commentPrompt);
  $('.comment-modal button.submit').on('click',this.commentSubmit);

  this.seek_percent = 0;
  this.seekThrottled = _(function() {
    this.video.seek(this.seek_percent);
    this.video.player.play();
    this.seek_percent = 0;
  }.bind(this)).throttle(400,{leading: true})

  this.speed = 1;
  this.setSpeedThrottled = _(function() {
    this.video.setSpeed(this.speed);
  }.bind(this)).throttle(300,{leading: false})

  // cancel the comment modal when clicking outside of it
  $(document).click(function(e) {
    if ($('.comment-modal').is(':visible') &&
        !$(e.target).parents().is('.comment-modal') &&
        !$(e.target).is('.comment-modal')) {
      this.commentModalHide();
    }
  }.bind(this));


};


_(Player.prototype).extend({

  playNext: function() {
    console.log('PLAY NEXT');

    this.removeCurrent();
    this.pointer++;
    if (this.pointer >= this.videos.length)
      this.pointer = 0;
    this.video = this.videos[this.pointer];
    this.video.$player.on('ended',this.playNext.bind(this));

    this.video.play();
    $('.video-name').text(this.video.name);
  },


  removeCurrent: function() {
    if (this.video) {
      this.video.hide();
      $('.indicator .comment-marker').remove();
      $('.comment-container .comment').remove();
    }
  },

  commentPrompt: function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('COMMENT PROMPT');
    $('.comment-modal').show();
    _(function() { $('.comment-modal').addClass('shown'); }).defer();
    this.video.pause();

  },

  commentSubmit: function() {

    if ($('textarea').val()) {
      var new_comment = {
        time: this.video.player.currentTime,
        user: 'HackathonMember', 
        comment: $('textarea').val() };
      this.video.comments.push(new_comment);
      this.video.addComment(new_comment);
    }

    this.commentModalHide();
  },

  commentModalHide: function() {
    $('.comment-modal').removeClass('shown');
    $('textarea').val('');
    this.video.player.play();
    $('.comment-modal').hide();
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
        (Math.abs(e.pageY - this.drag.start.y) > lock_tolerance ||
         Math.abs(e.pageX - this.drag.start.x) > lock_tolerance)) {

      if (Math.abs(e.pageY - this.drag.start.y) >
          Math.abs(e.pageX - this.drag.start.x))
        this.drag.locked = 'vertical';
      else
        this.drag.locked = 'horizontal';

      $('.bubble-text').text('');
      $('.bubble').css({fontSize: '', opacity: ''});
      $('.bubble').show();
      $('body').addClass('dragging');

      console.log('DRAGGING ' + this.drag.locked);
    }


    if (this.drag.locked === 'horizontal') {
      var max_speed = 20;

      var drag_width = (e.pageX - this.drag.start.x) / $(window).width();


      //console.log('drag % ' + Math.round(drag_width * 100));
      this.speed = 1 + drag_width * max_speed;

      if (this.speed < 0.2)
        this.speed = 0.2;


      var opacity = .3 + (1.5 * drag_width);
      opacity = opacity > 1 ? 1 : opacity;
      opacity = opacity < .3 ? .3 : opacity;
      //console.log('opacity: ' + opacity);

      $('.bubble').css({
        fontSize: ((this.speed + 1) * 10) + 20,
        opacity: opacity});
      $('.bubble-text').text(Math.round(this.speed * 10)/10 + 'x');
      this.setSpeedThrottled();
    }

  },

  dragEnd: function(e) {
    $('.bubble').hide();

    // return to normal speed
    this.speed = 1;
    this.video.setSpeed(1);

    this.drag = false;
    $(window).off('mousemove',this.dragMove);
    $(window).off('mouseup',this.dragEnd);
    $('body').removeClass('dragging');
  },


  keyListener: function(e) {
    // not while in the comment modal please
    if ($('.comment-modal').hasClass('shown'))
      return;

    console.log('key ' + e.which);
    // space bar
    if (e.which === 32) {

      if (this.video.player.paused)
        this.video.player.play();
      else
        this.video.player.pause();
    }
  },


  onMousewheel: function(e) {
    e.preventDefault();

    this.video.pause();

    var delta;
    if (Math.abs(e.originalEvent.deltaY) > Math.abs(e.originalEvent.deltaX))
      delta = e.originalEvent.deltaY;
    else
      delta = -1 * e.originalEvent.deltaX;

    //console.log('delta ' + delta);

    // assume 2000 pixels scrolled to complete video
    this.seek_percent += delta / (this.video.player.duration * 10);

    this.seekThrottled();

    var progress = (this.video.player.currentTime + this.video.player.duration * this.seek_percent) / this.video.player.duration;

    //console.log('here ' + progress);
    console.log('progress ' + progress);
    if (progress > 1) {
      //this.playNext();
      //this.seek_percent = 0;
      progress = 1;
    } 

    $('.bar').css({width: progress * 100 + '%'});
  }

});

function Video(args) {
  _(this).extend(args);
  this.$player = $("<video><source src='" + this.src + "'></video>");
  this.player = this.$player[0];
  $(".video-container").append(this.$player);

  _(this).bindAll('onProgress','onAnyEvent','addComment');

  this.$player.on("loadstart progress suspend abort error emptied stalled loadedmetadata loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange timeupdate play pause ratechange resize volumechange",this.onAnyEvent);

  this.$player.on('timeupdate', this.onProgress);
};

_(Video.prototype).extend({

  addComment: function(c) {

    var $marker = $('<div class=comment-marker>|</div>');
    c.position = c.time / this.player.duration;
    $marker.css({left: c.position * 100 + '%'});
    $('.indicator').append($marker);

    // add the comments themselves
    // these are hidden fow now
    c.$el = $([
      '<div class=comment>',
        '<span class=body>',
          '<strong class=user>',
            c.user,
          '</strong>: ',
          c.comment,
        '</span>',
      '</div>'].join(''));
    $('.comment-container').append(c.$el);
  },

  pause: function() {
    this.player.pause();
  },

  play: function() {
    this.$player.show();

    this.$player.on('playing',_(function() {
      _(this.comments).each(this.addComment)
    }.bind(this)).once());

    this.player.currentTime = 0;
    this.player.play();
  },

  onAnyEvent: function(e) {
    return;

    //console.log('VIDEO EVENT: ' + e.type);
    if (_('pause seeking waiting seeked playing play ended'.split(' ')).include(e.type))
      $('.message').text(e.type);
  },

  onProgress: function(e) {
    var progress = this.player.currentTime / this.player.duration;
    $('.bar').css({width: progress * 100 + '%'});

    var ten_seconds = 10 / this.player.duration;
    _(this.comments).each(function(c) {
      if (progress > c.position && progress < (c.position + ten_seconds))
        c.$el.show();
      else
        c.$el.hide();
    }.bind(this));
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

  hide: function() {
    this.player.pause();
    this.$player.hide();
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


