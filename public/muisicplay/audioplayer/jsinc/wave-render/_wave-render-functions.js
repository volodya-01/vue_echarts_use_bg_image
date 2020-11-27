const dzsapHelpers = require('../_dzsap_helpers');
const dzsapConstants = require('../../configs/_constants').constants;
exports.wave_mode_canvas_try_to_get_pcm = function (selfClass, pargs) {


  var margs = {};

  var $ = jQuery;

  if (pargs) {
    margs = $.extend(margs, pargs);
  }
  var self = this;

  // console.log('this -5 ', this);

  var o = selfClass.initOptions;

  if (selfClass.src_real_mp3 == 'fake') {
    return false;
  }


  async function tryToGetPcm() {

    function tryToLoad(resolve, reject) {

      if (selfClass.cthis.attr('data-pcm')) {


      } else {
        // -- we do not have pcm so we get it

        var data = {
          action: 'dzsap_get_pcm',
          postdata: '1',
          source: selfClass.cthis.attr('data-source'),
          playerid: selfClass.identifier_pcm
        };

        if (selfClass.urlToAjaxHandler) {
          $.ajax({
            type: "POST",
            url: selfClass.urlToAjaxHandler,
            data: data,
            success: function (response) {
              if (response) {

                if (response != '0' && response.indexOf(',') > -1) {

                  response = response.replace(' data-pcm=\'', '');
                  response = response.replace('\'', '');
                  selfClass.cthis.attr('data-pcm', response);
                  selfClass.isRealPcm = true;

                  resolve({
                    resolve_type: 'success'
                  });

                } else {
                  // -- response but malformed
                  resolve({
                    resolve_type: 'error',
                    error_type: 'empty_response'
                  });
                }

                // console.log('pcm_try_to_generate - ',pcm_try_to_generate);
              } else {
                // -- no response

                if (selfClass.initOptions.cue === 'on') {
                  resolve({
                    resolve_type: 'error',
                    error_type: 'empty_response'
                  });
                } else {
                  selfClass.isPcmPromisingToGenerateOnMetaLoad = true; // -- we are promising generating on meta load
                  if (o.pcm_data_try_to_generate_wait_for_real_pcm === 'on') {
                    var default_pcm = [];
                    for (var i3 = 0; i3 < 200; i3++) {
                      default_pcm[i3] = Number(Math.random()).toFixed(3);
                    }
                    default_pcm = JSON.stringify(default_pcm);
                    self.scrubModeWave__transitionIn(selfClass, default_pcm);
                    selfClass.isRealPcm = false;

                    resolve({
                      resolve_type: 'success'
                    });
                  }
                }
              }

            },
            error: function (arg) {
              resolve({
                resolve_type: 'error'
              });
            }
          });
        } else {

        }
      }
    }

    return new Promise((resolve, reject) => {
      tryToLoad(resolve, reject);
    });
  }

  try {
    tryToGetPcm().then(r => {
      if (r.resolve_type == 'success') {

        setTimeout(function () {


          selfClass.cthis.addClass('scrubbar-loaded');
          selfClass.calculate_dims_time();
          setTimeout(function () {

            // calculate_dims();

          }, 100);
        }, 100);
      }
      if (r.resolve_type == 'error') {
        selfClass.isPcmTryingToGenerate = true;
        this.scrubModeWave__initGenerateWaveData(selfClass, {
          'call_from': 'pcm_data_try_to_generate .. no get call success'
        });
      }
    });
  } catch (error) {

    console.log('error - ', error);
    // Here, `error` would be an `Error` (with stack trace, etc.).
    // Whereas if you used `throw 400`, it would just be `400`.
  }


}


exports.scrubModeWave__checkIfWeShouldTryToGetPcm = function (selfClass, pargs) {

  let isWeShouldGetPcm = false;


  if (selfClass.isPcmTryingToGenerate) {
    return false;
  }


  if (selfClass.isPcmPromisingToGenerateOnMetaLoad) {
    selfClass.isPcmTryingToGenerate = true;
    isWeShouldGetPcm = true;
  }

  // console.log('selfClass - ', selfClass);
  if (!(selfClass.cthis.attr('data-pcm'))) {
    // console.log('selfClass - ', selfClass);


    if (!selfClass.urlToAjaxHandler) {

      // -- if we do not have url to ajax handler then it's clear we should generate smth..

      selfClass.isPcmTryingToGenerate = true;
      isWeShouldGetPcm = true;
    }

  }

  // debugger;
  if (isWeShouldGetPcm) {

    this.scrubModeWave__initGenerateWaveData(selfClass, {
      'call_from': 'pcm_data_try_to_generate .. no data-pcm'
    });
  }
}
/**
 * called after random
 * called on wavesurfer error / success
 * @param selfClass
 * @param argpcm
 */
exports.scrubModeWave__transitionIn = function (selfClass, argpcm) {

  //console.log('generate_wave_data_animate',cthis);
  var o = selfClass.initOptions;


  selfClass._scrubbar.find('.scrub-bg-img,.scrub-prog-img').removeClass('transitioning-in');
  selfClass._scrubbar.find('.scrub-bg-img,.scrub-prog-img').addClass('transitioning-out');
  ;

  dzsapHelpers.scrubbar_modeWave_setupCanvas({
    'prepare_for_transition_in': true
  }, selfClass);

  this.draw_canvas(selfClass._scrubbarbg_canvas.get(0), argpcm, "#" + o.design_wave_color_bg, {
    call_from: 'canvas_generate_wave_data_animate_pcm_bg',
    selfClass,
    'skinwave_wave_mode_canvas_waves_number': parseInt(o.skinwave_wave_mode_canvas_waves_number),
    'skinwave_wave_mode_canvas_waves_padding': parseInt(o.skinwave_wave_mode_canvas_waves_padding)
  });
  this.draw_canvas(selfClass._scrubbarprog_canvas.get(0), argpcm, '#' + o.design_wave_color_progress, {
    call_from: 'canvas_generate_wave_data_animate_pcm_prog',
    selfClass,
    'skinwave_wave_mode_canvas_waves_number': parseInt(o.skinwave_wave_mode_canvas_waves_number),
    'skinwave_wave_mode_canvas_waves_padding': parseInt(o.skinwave_wave_mode_canvas_waves_padding)
  });


  setTimeout(() => {
    dzsapHelpers.scrubbar_modeWave_clearObsoleteCanvas(selfClass);
  }, 300);

  // -- warning - not always real pcm
  selfClass.isRealPcm = true;
  selfClass.scrubbar_reveal();
}


exports.scrubModeWave__initGenerateWaveData = function (selfClass, pargs) {


  var $ = jQuery;
  var o = selfClass.initOptions;
  var margs = {
    'call_from': 'default'
    , 'call_attempt': 0
  };
  var self = this;


  if (pargs) {
    margs = $.extend(margs, pargs);
  }

  if (selfClass.isRealPcm) {
    return false;
  }

  if (selfClass.src_real_mp3 == 'fake') {
    return false;
  }


  selfClass.isPcmTryingToGenerate = true;
  if (selfClass.isPcmTryingToGenerate) {

  } else {
    setTimeout(function () {
      margs.call_attempt++;
      if (margs.call_attempt < 10) {
        self.scrubModeWave__initGenerateWaveData(margs);
        console.log('%c [dzsap] trying to regenerate ', dzsapConstants.DEBUG_STYLE_1);
      }
    }, 1000)
    return false;
  }


  // console.log('scrubModeWave__initGenerateWaveData()', margs);


  // console.log('init_generate_wave_data', selfClass.cthis.attr('data-source'));
  if (window.WaveSurfer) {
    // console.log('wavesurfer already loaded');
    self.scrubModeWave__generateWaveData(selfClass, {
      'call_from': 'wavesurfer already loaded'
    });
  } else {


    if (o.pcm_notice == 'on') {
      selfClass.cthis.addClass('errored-out');
      selfClass.cthis.append('<div class="feedback-text pcm-notice">please wait while pcm data is generated.. </div>');
    }

    asyncLoadWaveSurfer(selfClass, self).then(r => console.log('[wavesurfer] loading done', r));

  }
}

async function asyncLoadWaveSurfer(selfClass, self) {


  var scripts = document.getElementsByTagName("script");


  var baseUrl = '';
  for (var i23 in scripts) {
    if (scripts[i23] && scripts[i23].src) {
      if (scripts[i23].src.indexOf('audioplayer.js') > -1) {
        break;
      }
    }
  }
  var baseUrl_arr = String(scripts[i23].src).split('/');
  for (var i24 = 0; i24 < baseUrl_arr.length - 1; i24++) {
    baseUrl += baseUrl_arr[i24] + '/';
  }

  // console.log('baseUrl -' ,baseUrl);
  var wavesurferUrl = dzsapConstants.URL_WAVESURFER;
  if (baseUrl) {
    wavesurferUrl = baseUrl + 'wavesurfer.js';
  }

  var $ = jQuery;

  function tryToLoad_waveSurferScript(resolve, reject) {

    window.dzsap_wavesurfer_load_attempt++;

    if (window.dzsap_wavesurfer_load_attempt > 2) {
      wavesurferUrl = dzsapConstants.URL_WAVESURFER;
    }
    if (window.dzsap_wavesurfer_load_attempt < 6) {
      // console.log('load wavesurfer');
      $.ajax({
        url: wavesurferUrl,
        dataType: "script",
        success: function (arg) {
          //console.log(arg);
          self.scrubModeWave__generateWaveData(selfClass, {
            'call_from': 'load_script'
            , 'wavesurfer_url': wavesurferUrl
          });

          resolve('done');
        },
        error: function (arg) {

          // console.log('[wavesurfer] errored out ... ', this, arg);
          tryToLoad_waveSurferScript(resolve, reject);
        }
      });
    }
    if (window.dzsap_wavesurfer_load_attempt > 6) {
      reject('rejected');
    }
  }

  let promise = new Promise((resolve, reject) => {
    tryToLoad_waveSurferScript(resolve, reject);
  });

  let result = await promise; // wait until the promise resolves (*)

  // console.log('resolved',result);
  return result;

}

exports.scrubModeWave__generateWaveData = function (selfClass, pargs) {

  var $ = jQuery;
  var o = selfClass.initOptions;

  var margs = {
    call_from: 'default'
  }
  var self = this;

  if (pargs) {
    $.extend(margs, pargs);
  }


  if (selfClass.src_real_mp3 != 'fake') {

  } else {
    return false;
  }


  async function wavesurfer_renderPcm() {

    function asyncRenderPcm(resolve, reject) {
      // resolve(400);


      // -- make sure we are generating only once
      if (window.dzsap_generating_pcm) {
        setTimeout(function () {
          asyncRenderPcm(resolve, reject);
        }, 1000);
        return false;
      }
      window.dzsap_generating_pcm = true;


      var wavesurferConId = 'wavesurfer_' + Math.ceil(Math.random() * 10000);
      if (selfClass.identifier_pcm) {
        wavesurferConId = 'wavesurfer_' + selfClass.identifier_pcm;
      }
      selfClass.cthis.append('<div id="' + wavesurferConId + '" class="hidden"></div>');

      var wavesurfer = WaveSurfer.create({
        container: '#' + wavesurferConId
        , normalize: true
        , pixelRatio: 1
      });


      // -- we will not generate for this
      if (String(selfClass.cthis.attr('data-source')).indexOf('https://soundcloud.com') == 0 || selfClass.cthis.attr('data-source') == 'fake') {
        return;
      }
      if (String(selfClass.cthis.attr('data-source')).indexOf('https://api.soundcloud.com') == 0) {
      }


      // console.log('[wavesurfer] selfClass.src_real_mp3 - ' + selfClass.src_real_mp3, selfClass.src_real_mp3);
      try {
        wavesurfer.load(selfClass.src_real_mp3);
      } catch (err) {
        console.log("[wavesurfer] WAVE SURFER NO LOAD");
      }


      wavesurfer.on('ready', function () {
        //            wavesurfer.play();
        console.log('[dzsap] [wavesurfer] generating wave data for ', selfClass.identifier_pcm);

        var accuracy = 100;
        if (selfClass.$mediaNode_ && selfClass.$mediaNode_.duration && selfClass.$mediaNode_.duration > 1000) {
          accuracy = 100;
        }

        // console.log(selfClass.$mediaNode_, selfClass.$mediaNode_.duration);

        var ar_str = [];
        if (wavesurfer && wavesurfer.exportPCM) {

          ar_str = wavesurfer.exportPCM(o.wavesurfer_pcm_length, accuracy, true);
        } else {
          ar_str = dzsapHelpers.generateFakeArrayForPcm();
        }


        resolve({
          resolve_type: 'success',
          pcm_data: ar_str
        })
      });

      wavesurfer.on('error', function (err, err2) {
        reject({
          error_type: 'wavesurfer_error',
          error_message: err,
        })
      });


      setTimeout(() => {

        reject({
          error_type: 'wavesurfer_timeout',
          error_message: 'timeout',
        })

      }, dzsapConstants.WAVESURFER_MAX_TIMEOUT);
    }

    // -- end promise


    let promise = new Promise((resolve, reject) => {
      asyncRenderPcm(resolve, reject);
    });

    return promise;
  }

  wavesurfer_renderPcm().then(r => {
    self.scrubModeWave__sendPcm(selfClass, r.pcm_data);
    self.scrubModeWave__transitionIn(selfClass, r.pcm_data);
  }).catch(err => {

    var default_pcm = [];

    for (var i3 = 0; i3 < 200; i3++) {
      default_pcm[i3] = Math.abs(Number(Math.random()).toFixed(3));
    }
    default_pcm = JSON.stringify(default_pcm);

    console.log('%c [dzsap] error while generating pcm - ', dzsapConstants.DEBUG_STYLE_ERROR, err, err.error_message)

    self.scrubModeWave__sendPcm(selfClass, default_pcm);
    self.scrubModeWave__transitionIn(selfClass, default_pcm);
  });

}

exports.scrubModeWave__sendPcm = function (selfClass, ar_str) {
  var $ = jQuery;


  try {
    // -- convert to absolute
    ar_str = JSON.stringify(JSON.parse(String(ar_str)).map(Math.abs));
  } catch (err) {
    console.log(err, 'ar_str - ', ar_str);
  }

  selfClass.cthis.attr('data-pcm', ar_str);
  if (selfClass._feed_fakeButton && selfClass._feed_fakeButton.attr) {
    selfClass._feed_fakeButton.attr('data-pcm', ar_str);
  }
  if (selfClass._sourcePlayer && selfClass._sourcePlayer.attr) {
    selfClass._sourcePlayer.attr('data-pcm', ar_str);
  }


  // console.log("which is fake player ? ", selfClass.cthis, selfClass._actualPlayer, _sourcePlayer);


  selfClass.cthis.find('.pcm-notice').fadeOut("fast");
  selfClass.cthis.removeClass('errored-out');


  // console.log('generating wave data for '+selfClass.cthis.attr('data-source'));
  // console.log('%c selfClass.identifier_pcm before- ','color: #dd0022; background-color: #eee;', selfClass.identifier_pcm, selfClass.cthis);

  if (!selfClass.identifier_pcm) {
    selfClass.identifier_pcm = selfClass.cthis.attr('data-source');


    if (selfClass.original_real_mp3) {
      selfClass.identifier_pcm = selfClass.original_real_mp3;
    }
  }


  // console.log('%c selfClass.identifier_pcm- ','color: #dd0022; background-color: #eee;', selfClass.identifier_pcm, selfClass.cthis);


  var data = {
    action: 'dzsap_submit_pcm'
    , postdata: ar_str
    , playerid: selfClass.identifier_pcm
    , source: selfClass.cthis.attr('data-source')
  };


  window.dzsap_generating_pcm = false;


  if (selfClass.urlToAjaxHandler) {


    $.ajax({
      type: "POST",
      url: selfClass.urlToAjaxHandler,
      data: data,
      success: function (response) {

      }
    });
  }
}


exports.draw_canvas = draw_canvas;

/**
 * draw canvas here
 * @param _arg
 * @param pcm_arr
 * @param hexcolor
 * @param pargs
 * @returns {boolean}
 */
function draw_canvas(_arg, pcm_arr, hexcolor, pargs) {

  var margs = {
    'call_from': 'default',
    'is_sample': false,
    'selfClass': null,
    'sample_time_start': 0,
    'sample_time_end': 0,
    'sample_time_total': 0,
    'skinwave_wave_mode_canvas_waves_number': 2,
    'skinwave_wave_mode_canvas_waves_padding': 1,
  };

  var $ = jQuery;
  if (pargs) {
    margs = Object.assign(margs, pargs);
  }


  var _canvas = $(_arg);
  var __canvas = _arg;
  var static_hexcolor = '';
  var sw_draw = false;
  var {is_sample, sample_time_start, sample_time_total, sample_time_end, selfClass, skinwave_wave_mode_canvas_waves_number, skinwave_wave_mode_canvas_waves_padding} = margs;

  // -- sanitize
  if (isNaN(Number(skinwave_wave_mode_canvas_waves_number))) {
    skinwave_wave_mode_canvas_waves_number = 2;
  }

  if (isNaN(Number(skinwave_wave_mode_canvas_waves_padding))) {
    if (skinwave_wave_mode_canvas_waves_number != 1) {
      skinwave_wave_mode_canvas_waves_padding = 1;
    } else {

      skinwave_wave_mode_canvas_waves_padding = 0;
    }
  }

  if (margs.call_from == 'canvas_normal_pcm_bg') {
    static_hexcolor = hexcolor;

    if (hexcolor.indexOf(',') > -1) {
      static_hexcolor = hexcolor.split(',')[0];

    }
  }

  if (selfClass) {
    var o = selfClass.initOptions;
  }
  // console.log('o - ', o);


  // console.log('[dzsap] draw_canvas() - ', margs, 'hexcolor - ', hexcolor, _canvas);
  if (_canvas && _canvas.get(0)) {

  } else {
    return false;
  }

  var _canvasContext = _canvas.get(0).getContext("2d");

  var ar_str = pcm_arr;


  var ar = [];
  // console.log('selfClass - ', selfClass);
  if (selfClass && selfClass._scrubbar) {
    if (selfClass._scrubbarprog_canvas) {
      selfClass._scrubbarprog_canvas.width(selfClass._scrubbar.width());
      _arg.width = selfClass._scrubbar.width();
      _arg.height = selfClass._scrubbar.height();
    }
  }
  // ctx.translate(0.5, 0.5);
  // ctx.lineWidth = .5;

  _canvasContext.imageSmoothingEnabled = false;
  _canvasContext.imageSmoothing = false;
  _canvasContext.imageSmoothingQuality = "high";
  _canvasContext.webkitImageSmoothing = false;

  if (pcm_arr) {

  } else {
    setTimeout(function () {
      // draw_canvas(_arg,pcm_arr,hexcolor);
    }, 1000);
    return false;
  }

  if (typeof (ar_str) == 'object') {
    ar = ar_str;
  } else {
    try {

      ar = JSON.parse(ar_str);
    } catch (err) {
      // console.error('parse error - ',ar_str, ar_str!='');
    }
  }


  var i = 0,
    max = 0;

  // console.log(ar);

  // -- normalizing
  for (i = 0; i < ar.length; i++) {
    if ((ar[i]) > max) {
      max = (ar[i]);
    }
  }

  var ar_new = [];
  for (i = 0; i < ar.length; i++) {
    ar_new[i] = parseFloat(Math.abs(ar[i]) / Number(max));
  }

  ar = ar_new;


  var cww;
  var chh;
  var gradient = null;


  if (selfClass) {

    __canvas.width = selfClass._scrubbar.width();
  }

  cww = __canvas.width;
  chh = __canvas.height;


  var bar_len = skinwave_wave_mode_canvas_waves_number;
  var bar_space = skinwave_wave_mode_canvas_waves_padding;

  // console.log(bar_len);
  if (bar_len == 1) {
    bar_len = cww / bar_len;
  }
  if (bar_len == 2) {
    bar_len = cww / 2;
  }
  if (bar_len == 3) {
    bar_len = (cww) / 3;
  }

  // console.log('bar_len - ',bar_len);
  // console.log('pcm_arr - ',pcm_arr);


  var reflection_size = parseFloat(o.skinwave_wave_mode_canvas_reflection_size);

  if (cww / bar_len < 1) {
    bar_len = Math.ceil(bar_len / 3);

  }


  var bar_w = Math.ceil(cww / bar_len);
  var normal_size_ratio = 1 - reflection_size;

  // console.log("bar_w - ",bar_w);

  if (bar_w == 0) {
    bar_w = 1;
    bar_space = 0;
  }
  if (bar_w == 1) {
    bar_space = bar_space / 2;
  }
  // console.log('bar_w - ', bar_w, bar_space);


  // console.log('chh - ', chh, ' normal_size_ratio - ', normal_size_ratio, 'ar - ', ar);
  var lastval = 0;
  var searched_index = null;


  // -- left right gradient
  var temp_hex = hexcolor;
  temp_hex = temp_hex.replace('#', '');
  var hexcolors = []; // -- hex colors array
  if (temp_hex.indexOf(',') > -1) {
    hexcolors = temp_hex.split(',');
  }


  var progress_hexcolor = '';
  var progress_hexcolors = '';


  if (margs.call_from == 'spectrum') {


    progress_hexcolor = o.design_wave_color_progress;
    progress_hexcolor = progress_hexcolor.replace('#', '');
    progress_hexcolors = []; // -- hex colors array
    if (progress_hexcolor.indexOf(',') > -1) {
      progress_hexcolors = progress_hexcolor.split(',');

    }
  }


  var is_progress = false; // -- color the bar in progress colors

  // -- left right gradient END


  /**
   * draw with different color
   * @param i
   * @returns {boolean}
   */
  function sampleDetermineIfCurrentDrawIsBeforeOrAfterSample(i) {

    if ((i / bar_len < sample_time_start / sample_time_total) || i / bar_len > sample_time_end / sample_time_total) {

      _canvasContext.fillStyle = dzsapHelpers.hexToRgb(static_hexcolor, 0.5);

      if (margs.call_from.indexOf('pcm_prog') > -1) {
        return false;
      }
    }
    return true;
  }




  _canvasContext.clearRect(0, 0, cww, chh);
  // console.log('bar_len - ', bar_len);
  for (i = 0; i < bar_len; i++) {
    sw_draw = true;
    _canvasContext.save();

    // console.log('ar[searched_index] - ', ar[searched_index]);
    searched_index = Math.ceil(i * (ar.length / bar_len));

    // -- we'll try to prevent
    if (i < bar_len / 5) {
      if (ar[searched_index] < 0.1) {
        ar[searched_index] = 0.1;
      }
    }
    if (ar.length > bar_len * 2.5 && i > 0 && i < ar.length - 1) {
      ar[searched_index] = Math.abs(ar[searched_index] + ar[searched_index - 1] + ar[searched_index + 1]) / 3
    }


    // var barh = Math.abs(ar[searched_index] * chh);
    var barh_normal = Math.abs(ar[searched_index] * chh * normal_size_ratio);

    // -- let's try to normalize
    if (o.skinwave_wave_mode_canvas_normalize == 'on') {
      barh_normal = barh_normal / 1.5 + lastval / 2.5;
    }
    lastval = barh_normal;
    // console.log('ar searched_index', ar[searched_index], 'barh - ',barh);

    //            var barh =


    _canvasContext.lineWidth = 0;

    // console.log('bar w - ',bar_w);
    // bar_w = parseInt(bar)

    barh_normal = Math.floor(barh_normal);

    // var y = chh * normal_size_ratio - barh_normal;
    var y = Math.ceil(chh * normal_size_ratio - barh_normal);
    if (o.skinwave_wave_mode_canvas_mode === 'reflecto') {
      barh_normal++;
    }

    _canvasContext.beginPath();
    _canvasContext.rect(i * bar_w, y, bar_w - bar_space, barh_normal);

    // console.log('[dzsap] [waveform] draw rect props - ', i * bar_w, bar_w - bar_space ,barh_normal, ' bar_w - ', bar_w, 'bar_space - ',bar_space);
    // console.log('barh_normal - ', barh_normal, ' y - ', y);


    if (margs.call_from == 'spectrum') {
      if (i / bar_len < selfClass.timeCurrent / selfClass.timeTotal) {
        is_progress = true;
      } else {
        is_progress = false;
      }
    }


    if (is_progress) {
      // -- only for spectrum
      _canvasContext.fillStyle = '#' + progress_hexcolor;

      if (progress_hexcolors.length) {
        gradient = _canvasContext.createLinearGradient(0, 0, 0, chh);
        gradient.addColorStop(0, '#' + progress_hexcolors[0]);
        gradient.addColorStop(1, '#' + progress_hexcolors[1]);
        _canvasContext.fillStyle = gradient;
      }


      if (is_sample) {
        if ((i / bar_len < sample_time_start / sample_time_total) || i / bar_len > sample_time_end / sample_time_total) {
          _canvasContext.fillStyle = dzsapHelpers.hexToRgb(static_hexcolor, 0);
        }
      }
    } else {

      // -- not progress

      _canvasContext.fillStyle = hexcolor;

      // -- if we have gradient
      if (hexcolors.length) {
        gradient = _canvasContext.createLinearGradient(0, 0, 0, chh);
        hexcolors[0] = String(hexcolors[0]).replace('#', '');
        hexcolors[1] = String(hexcolors[1]).replace('#', '');
        gradient.addColorStop(0, '#' + hexcolors[0]);
        gradient.addColorStop(1, '#' + hexcolors[1]);
        _canvasContext.fillStyle = gradient;
      }

      // ctx.fillRect(20,20,150,100);
      // console.log('ctx.fillStyle - ',ctx.fillStyle);

      if (is_sample) {
        if (sampleDetermineIfCurrentDrawIsBeforeOrAfterSample(i) === false) {
          sw_draw = false;
        }
      }
    }


    if (sw_draw) {

      // console.log('ctx.fillStyle - ',ctx.fillStyle);
      _canvasContext.fill();
      _canvasContext.closePath();
    }


    _canvasContext.restore();

  }


  // -- reflection
  if (reflection_size > 0) {
    for (var i = 0; i < bar_len; i++) {
      sw_draw = true;
      searched_index = Math.ceil(i * (ar.length / bar_len));


      // console.log(searched_index);

      var barh_ref = Math.abs(ar[searched_index] * chh * reflection_size);


      _canvasContext.beginPath();
      _canvasContext.rect(i * bar_w, chh * normal_size_ratio, bar_w - bar_space, barh_ref);

      if (margs.call_from == 'spectrum') {
        if (i / bar_len < selfClass.timeCurrent / selfClass.timeTotal) {
          is_progress = true;
        } else {
          is_progress = false;
        }
      }

      if (is_progress) {

        // -- spectrum

        if (o.skinwave_wave_mode_canvas_mode != 'reflecto') {

          _canvasContext.fillStyle = dzsapHelpers.hexToRgb(progress_hexcolor, 0.25);
        }


        if (progress_hexcolors.length) {
          var gradient = _canvasContext.createLinearGradient(0, 0, 0, chh);
          var aux = dzsapHelpers.hexToRgb('#' + progress_hexcolors[1], 0.25);
          if (o.skinwave_wave_mode_canvas_mode == 'reflecto') {
            aux = dzsapHelpers.hexToRgb('#' + progress_hexcolors[1], 1);
          }
          gradient.addColorStop(0, aux);
          aux = dzsapHelpers.hexToRgb('#' + progress_hexcolors[0], 0.25);
          if (o.skinwave_wave_mode_canvas_mode == 'reflecto') {
            aux = dzsapHelpers.hexToRgb('#' + progress_hexcolors[0], 1);
          }
          gradient.addColorStop(1, aux);
          _canvasContext.fillStyle = gradient;
        }
      } else {

        if (margs.call_from == 'canvas_normal_pcm_prog') {
          // console.log('hexcolor -> ',hexcolor);
        }

        _canvasContext.fillStyle = hexcolor;

        // -- we make this trapsnarent
        if (o.skinwave_wave_mode_canvas_mode != 'reflecto') {

          _canvasContext.fillStyle = dzsapHelpers.hexToRgb(hexcolor, 0.25);
        }


        if (hexcolors.length) {
          var gradient = _canvasContext.createLinearGradient(0, 0, 0, chh);
          var aux = dzsapHelpers.hexToRgb('#' + hexcolors[1], 0.25);
          if (o.skinwave_wave_mode_canvas_mode == 'reflecto') {
            aux = dzsapHelpers.hexToRgb('#' + hexcolors[1], 1);
          }
          gradient.addColorStop(0, aux);
          aux = dzsapHelpers.hexToRgb('#' + hexcolors[0], 0.25);
          if (o.skinwave_wave_mode_canvas_mode == 'reflecto') {
            aux = dzsapHelpers.hexToRgb('#' + hexcolors[0], 1);
          }
          gradient.addColorStop(1, aux);
          _canvasContext.fillStyle = gradient;
        }


        if (is_sample) {
          if (sampleDetermineIfCurrentDrawIsBeforeOrAfterSample(i) === false) {
            sw_draw = false;
          }
        }
      }


      if (sw_draw) {
        _canvasContext.fill();
        _canvasContext.closePath();
      }

    }
  }

  setTimeout(function () {
    selfClass.scrubbar_reveal();
  }, 100)
}
