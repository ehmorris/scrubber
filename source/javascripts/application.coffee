#= require '_jquery-2.0.3.min.js'
#= require '_hammer.min.js'
#= require_tree .

class @Video
  constructor: (args) ->
    @title = args.title
    @url = args.url
    @$player = $("<video src='" + @url + "' class='video' webkit-playsinline='false'></video>")
    @player = @$player[0]
    $(".video-cont").append @$player

  play: () =>
    console.log('here');
    console.log(@player);
    @$player.css({visibility: ''});
    @player.play();


class @Player
  constructor: () ->
    video_array = [
      {name: "Boat Video", url: "videos/boat.mp4"},
      {name: "Je Suis Charlie 1", url: "videos/Paris-JeSuisCharlie-1.mp4"},
      {name: "Je Suis Charlie 2", url: "videos/Paris-JeSuisCharlie-2.mp4"}]
    
    @pointer = 0
    @video_array = video_array.map (v) ->
      return new Video(v);
    @playNext()


  playNext: () =>
    @video_array[@pointer++].play()

  loadVideos: (video_array) =>
    console.log "loading many videos"
    for video in video_array
      @bufferVideo(video)

    @playVideo(video_array[0])
    @playVideo(video_array[1])
    @playVideo(video_array[2])

  playVideo: (video) ->

  # Changes speed of player, m = multiplier
  changeSpeed: (m) ->
    console.log 'Speed up video'

  # Static method
  favoriteVideo: (video_url) ->
    console.log 'favorite'

  skipVideo: () ->
    console.log 'unknown'

  bufferVideo: (video) ->
    console.log "buffer video"


@p = new Player();

