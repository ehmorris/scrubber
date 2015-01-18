#= require '_jquery-2.0.3.min.js'
#= require '_hammer.min.js'
#= require_tree .

class @Video
  constructor: (title, url) ->
    @title = title
    @url = url

  loadObject: () =>
    return "<video src='" + @url + "' autoplay='false' class='video' loop='true' webkit-playsinline='false'></video>"

class @Player
  constructor: () ->
    video1 = new Video("Boat Video", "videos/boat.mp4")
    video2 = new Video("Je Suis Charlie 1", "videos/Paris-JeSuisCharlie-1.mp4")
    video3 = new Video("Je Suis Charlie 2", "videos/Paris-JeSuisCharlie-2.mp4")
    @loadVideos([video1, video2, video3])

  loadVideos: (video_array) =>
    console.log "loading many videos"
    for video in video_array
      @bufferVideo(video)
    @playVideo(video_array[0])
    @playVideo(video_array[1])
    @playVideo(video_array[2])

  playVideo: (video) ->
    $(".slider-cont").append video.loadObject()

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
