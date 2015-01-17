$(document).on 'touchmove', (e) ->
  video = $('video').get(0)
  video.playbackRate = 10

  e.preventDefault()
