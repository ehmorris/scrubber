#= require '_jquery-2.0.3.min.js'
#= require '_jquery.mobile.custom.min.js'
#= require '_hammer.min.js'
#= require_tree .

# class @Video = 

class @Player
  constructor: (@name) ->
    @loadVideos(["vid1", "vid2", "vid3"])

  loadVideos: (video_array) =>
    console.log "loading many videos"
    for video in video_array
      @bufferVideo(video)
    @playVideo(video_array[0])

  playVideo: (video) ->
    console.log "playing single video"

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
