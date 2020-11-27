
const dzsapHelpers = require('../_dzsap_helpers');

exports.media_tryToPlay = function(selfClass, callbackFn, errorFn){
  async function async_media_tryToPlay() {
    function tryToPlay(resolve, reject) {
      if (selfClass.cthis.attr('data-original-type')) {
        // -- then this player is feeding
      } else {

        // -- no audioCtx_buffer
        if (selfClass.$mediaNode_) {
          if (selfClass.$mediaNode_.play) {


            if (dzsapHelpers.is_ios() && selfClass.spectrum_audioContext !== null && typeof selfClass.spectrum_audioContext == 'object') {
              // todo: ios not playing nice.. with audio context
              // console.log('selfClass.spectrum_audioContext - ', typeof selfClass.spectrum_audioContext, selfClass.spectrum_audioContext);
              selfClass.spectrum_audioContextBufferSource = selfClass.spectrum_audioContext.createBufferSource();
              selfClass.spectrum_audioContextBufferSource.buffer = selfClass.spectrum_audioContext_buffer;
              selfClass.spectrum_audioContextBufferSource.connect(selfClass.spectrum_audioContext.destination);
              // selfClass.spectrum_audioContextBufferSource.connect(selfClass.spectrum_analyser)
              selfClass.spectrum_audioContextBufferSource.start(0, selfClass.lastTimeInSeconds);
              resolve({
                'resolve_type': 'playing_context'
              })
            } else {

              selfClass.$mediaNode_.play().then(r => {
                resolve({
                  'resolve_type': 'started_playing'
                })
              }).catch(err => {
                reject({
                  'error_type': 'did not want to play',
                  'error_message': err
                });
              });
            }
          } else {
            if (selfClass._actualPlayer == null) {
              selfClass.isPlayPromised = true;
            }

          }
        } else {
          if (selfClass._actualPlayer == null) {
            selfClass.isPlayPromised = true;
          }
        }


      }

    }

    return new Promise((resolve, reject) => {

      tryToPlay(resolve, reject);

    })
  }

  async_media_tryToPlay().then((r)=>{
    callbackFn(r);
  }).catch((err)=>{

    errorFn(err);
  })

}






exports.media_pause = function(selfClass, callbackFn){

  var $ = jQuery;



  if (selfClass.audioType == 'youtube') {

    // console.log('trying to pause youtube video, ',selfClass.$mediaNode_);
    if (selfClass.$mediaNode_ && selfClass.$mediaNode_.pauseVideo) {
      selfClass.$mediaNode_.pauseVideo();
    }
  }
  if (selfClass.audioType == 'selfHosted') {

    if (0) {
    } else {
      if (selfClass.$mediaNode_) {

        if (selfClass.initOptions.pause_method == 'stop') {

          selfClass.$mediaNode_.pause();
          selfClass.$mediaNode_.src = '';


          selfClass.destroy$mediaNode_();
          $(selfClass.$mediaNode_).remove();
          selfClass.$mediaNode_ = null;
        } else {

          if (selfClass.$mediaNode_.pause) {
            selfClass.$mediaNode_.pause();
          }
        }
      }
      if (selfClass.$watermarkMedia_ && selfClass.$watermarkMedia_.pause) {
        selfClass.$watermarkMedia_.pause();

      }

    }


  }

  callbackFn();

}

