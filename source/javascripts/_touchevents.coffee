$ ->
  video = $('video').get(0)
  screenwidth = $(document).width()
  max_volume = 10

  $(document).on 'vmousemove', (e) ->
    percent_right = Math.floor((e.clientX / screenwidth) * 100)
    playback_rate = max_volume * (percent_right / 100)

    video.playbackRate = playback_rate

    console.log(playback_rate)
    
    e.preventDefault()
