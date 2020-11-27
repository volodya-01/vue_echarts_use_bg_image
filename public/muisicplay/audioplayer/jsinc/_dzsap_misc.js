exports.retrieve_soundcloud_url =  function (selfClass, pargs) {


  var o = selfClass.initOptions;
  console.log(' ooo - ', o);
  if (o.soundcloud_apikey == '') {
    alert('soundcloud api key not defined, read docs!');
  }
  var aux = 'http://api.' + 'soundcloud.com' + '/resolve?url=' + selfClass.data_source + '&format=json&consumer_key=' + o.soundcloud_apikey;
  //console.log(aux);


  aux = encodeURIComponent(aux);


  var soundcloud_retriever = o.php_retriever + '?scurl=' + aux;


  $.ajax({
    type: "GET",
    url: soundcloud_retriever
    , data: {}
    , async: true
    , dataType: 'text'
    , error: function (err, q, t) {

      console.log('retried soundcloud error', err, q, t);
    }
    , success: function (response) {

      // console.log('got response - ', response);
      var data = [];


      try {
        var data = JSON.parse(response);
        // console.log('got json - ', data);
        selfClass.audioType = 'selfHosted';


        if (data == '') {
          selfClass.cthis.addClass('errored-out');
          selfClass.cthis.append('<div class="feedback-text">soundcloud track does not seem to serve via api</div>');
        }


        //console.log('o.design_skin - ', o.design_skin);
        selfClass.original_real_mp3 = selfClass.cthis.attr('data-source');
        if (data.stream_url) {

          selfClass.cthis.attr('data-source', data.stream_url + '?consumer_key=' + o.soundcloud_apikey + '&origin=localhost');


          if (selfClass.feed_fakeButton) {
            selfClass.feed_fakeButton.attr('data-source', selfClass.cthis.attr('data-source'));
          }
          if (selfClass._sourcePlayer) {
            selfClass._sourcePlayer.attr('data-source', selfClass.cthis.attr('data-source'));
          }
        } else {

          selfClass.cthis.addClass('errored-out');
          selfClass.cthis.append('<div class="feedback-text ">this soundcloud track does not allow streaming  </div>');
        }
        selfClass.src_real_mp3 = selfClass.cthis.attr('data-source');


        if (selfClass.cthis.attr('data-pcm')) {


          selfClass.isRealPcm = true;
        }
        if (o.design_skin == 'skin-wave') {
          if (o.skinwave_wave_mode == 'canvas') {
            if (selfClass.isRealPcm == false) {
              if ((o.pcm_data_try_to_generate == 'on' && o.pcm_data_try_to_generate_wait_for_real_pcm == 'on') == false) {
                dzsapWaveFunctions.scrubModeWave__initGenerateWaveData(selfClass, {
                  'call_from': 'soundcloud init(), pcm not real..'
                });
              }
            }
          }
        }


        //                        if(window.console) { console.log(data); };

        if (o.cue == 'on' || selfClass._sourcePlayer || selfClass.feed_fakeButton) {

          // console.log("SETUPING MEDIA")
          setup_media({
            'called_from': 'retrieve_soundcloud_url'
          });


          setTimeout(function () {

            // console.log('selfClass.isPlayPromised -3 ',selfClass.isPlayPromised);
            if (selfClass.isPlayPromised) {
              play_media({
                'call_from': 'retrieve_soundcloud_url'
              })
              selfClass.isPlayPromised = false;
            }
          }, 300);


        }
      } catch (err) {
        console.log('soduncloud parse error -', response, ' - ', soundcloud_retriever);
      }
    }
  });

}
