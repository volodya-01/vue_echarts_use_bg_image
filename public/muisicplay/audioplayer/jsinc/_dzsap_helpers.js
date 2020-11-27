const dzsapSvgs = require('./_dzsap_svgs');

const dzsap_generate_keyboard_controls = function () {
  var keyboard_controls = {
    'play_trigger_step_back': 'off'
    , 'step_back_amount': '5'
    , 'step_back': '37'
    , 'step_forward': '39'
    , 'sync_players_goto_next': ''
    , 'sync_players_goto_prev': ''
    , 'pause_play': '32'
    , 'show_tooltips': 'off'
  }


  if (window.dzsap_keyboard_controls) {
    // console.log('keyboard_controls - ',keyboard_controls);
    // console.log('window.dzsap_keyboard_controls - ',window.dzsap_keyboard_controls);
    keyboard_controls = jQuery.extend(keyboard_controls, window.dzsap_keyboard_controls);
  }

  keyboard_controls.step_back_amount = Number(keyboard_controls.step_back_amount);

  return keyboard_controls;
};


function formatTime(arg) {
  //formats the time
  var s = Math.round(arg);
  var m = 0;
  var h = 0;
  if (s > 0) {
    while (s > 3599 && s < 3000000 && isFinite(s)) {
      h++;
      s -= 3600;
    }
    while (s > 59 && s < 3000000 && isFinite(s)) {
      m++;
      s -= 60;
    }
    if (h) {

      return String((h < 10 ? "0" : "") + h + ":" + String((m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s));
    }
    return String((m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s);
  } else {
    return "00:00";
  }
}

function can_history_api() {
  return !!(window.history && history.pushState);
}

function dzs_clean_string(arg) {

  if (arg) {

    arg = arg.replace(/[^A-Za-z0-9\-]/g, '');
    //console.log(arg);
    arg = arg.replace(/\./g, '');
    return arg;
  }

  return '';


  //console.log(arg);


}


function get_query_arg(purl, key) {
  if (purl) {
    // console.log('purl - ',purl);
    if (String(purl).indexOf(key + '=') > -1) {
      //faconsole.log('testtt');
      var regexS = "[?&]" + key + "=.+";
      var regex = new RegExp(regexS);
      var regtest = regex.exec(purl);
      //console.log(regtest);

      if (regtest != null) {
        var splitterS = regtest[0];
        if (splitterS.indexOf('&') > -1) {
          var aux = splitterS.split('&');
          splitterS = aux[1];
        }
        //console.log(splitterS);
        var splitter = splitterS.split('=');
        //console.log(splitter[1]);
        //var tempNr = ;

        return splitter[1];

      }
      //$('.zoombox').eq
    }

  } else {
    console.log('purl not found - ', purl);
  }
}

function add_query_arg(purl, key, value) {
  // -- key and value must be unescaped for uri
  key = encodeURIComponent(key);
  value = encodeURIComponent(value);

  if (!(purl)) {
    purl = '';
  }
  var s = purl;
  var pair = key + "=" + value;

  var r = new RegExp("(&|\\?)" + key + "=[^\&]*");

  s = s.replace(r, "$1" + pair);
  //console.log(s, pair);
  if (s.indexOf(key + '=') > -1) {


  } else {
    if (s.indexOf('?') > -1) {
      s += '&' + pair;
    } else {
      s += '?' + pair;
    }
  }
  //if(!RegExp.$1) {s += (s.length>0 ? '&' : '?') + kvp;};


  //if value NaN we remove this field from the url
  if (value == 'NaN') {
    var regex_attr = new RegExp('[\?|\&]' + key + '=' + value);
    s = s.replace(regex_attr, '');


    if (s.indexOf('?') == -1 && s.indexOf('&') > -1) {
      s = s.replace('&', '?');
    }
  }

  return s;
}


function dzsap_is_mobile() {

  // return true;
  return is_ios() || is_android_good();
}

function is_ios() {
  // return true;
  return ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1) || (navigator.platform.indexOf("iPad") != -1));
}

exports.youtube_playMedia = function(selfClass, margs, yt_inited, yt_curr_id) {

  // console.log('is youtube .. try to play it .. ', selfClass.$mediaNode_);
  try {
    if (selfClass.$mediaNode_ && selfClass.$mediaNode_.playVideo) {

      selfClass.$mediaNode_.playVideo();
      //return false;
    } else {

      // console.log('lets retry ', margs.retry_call,  selfClass.$mediaNode_, 'yt_inited - ',yt_inited);
      if (margs.retry_call < 5) {

        margs.retry_call++;
        margs.call_from = 'retry for youtube';


        if (yt_inited == false) {
          // -- clearly not loaded..
          selfClass.playerIsLoaded = false;

          selfClass.youtube_checkReady(yt_curr_id);

          // console.log("RETRYING");

          selfClass.youtube_retryPlayTimeout = setTimeout(function (args) {
            selfClass.play_media(args);
          }, 500, margs);
        } else {

          selfClass.youtube_retryPlayTimeout = setTimeout(function (args) {
            selfClass.play_media(args);
          }, 500, margs);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}
function can_canvas() {
  // check if we have canvas support
  var oCanvas = document.createElement("canvas");
  if (oCanvas.getContext("2d")) {
    return true;
  }
  return false;
}

function is_android() {
  return is_android_good();
}

function select_all(el) {
  if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.select();
  }
}

function is_android_good() {
  //return false;
  //return true;
  var ua = navigator.userAgent.toLowerCase();

  //console.log('ua - ',ua);
  return (ua.indexOf("android") > -1);
}

function htmlEncode(arg) {
  return jQuery('<div/>').text(arg).html();
}

function dzsap_generate_keyboard_tooltip(keyboard_controls, lab) {


  // console.log('keyboard_controls - ',keyboard_controls,lab,keyboard_controls.lab);
  var fout = '<span class="dzstooltip arrow-from-start transition-slidein arrow-bottom skin-black" style="width: auto;  white-space:nowrap;">' + 'Shortcut' + ': ' + keyboard_controls[lab] + '</span>';
  // left: 5px;
  fout = fout.replace('32', 'space');
  fout = fout.replace('27', 'escape');

  return fout;


}


var MD5 = function (e) {
  function g(a, d) {
    var b = a & 2147483648;
    var c = d & 2147483648;
    var e = a & 1073741824;
    var f = d & 1073741824;
    var p = (a & 1073741823) + (d & 1073741823);
    return e & f ? p ^ 2147483648 ^ b ^ c : e | f ? p & 1073741824 ? p ^ 3221225472 ^ b ^ c : p ^ 1073741824 ^ b ^ c : p ^ b ^ c
  }

  function h(b, c, a, d, e, f, n) {
    b = g(b, g(g(c & a | ~c & d, e), n));
    return g(b << f | b >>> 32 - f, c)
  }

  function k(b, c, a, d, e, f, n) {
    b = g(b, g(g(c & d | a & ~d, e), n));
    return g(b << f | b >>> 32 - f, c)
  }

  function l(b, c, d, a, e, f, n) {
    b = g(b, g(g(c ^ d ^ a, e), n));
    return g(b << f | b >>> 32 - f, c)
  }

  function m(b, c, d, a, e, f, n) {
    b = g(b, g(g(d ^
      (c | ~a), e), n));
    return g(b << f | b >>> 32 - f, c)
  }

  function q(b) {
    var c = "", d;
    for (d = 0; 3 >= d; d++) {
      var a = b >>> 8 * d & 255;
      a = "0" + a.toString(16);
      c += a.substr(a.length - 2, 2)
    }
    return c
  }

  var f = [];
  e = function (b) {
    b = b.replace(/\r\n/g, "\n");
    for (var c = "", d = 0; d < b.length; d++) {
      var a = b.charCodeAt(d);
      128 > a ? c += String.fromCharCode(a) : (127 < a && 2048 > a ? c += String.fromCharCode(a >> 6 | 192) : (c += String.fromCharCode(a >> 12 | 224), c += String.fromCharCode(a >> 6 & 63 | 128)), c += String.fromCharCode(a & 63 | 128))
    }
    return c
  }(e);
  f = function (b) {
    var c = b.length;
    var a = c + 8;
    for (var d =
      16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
    a = (g - g % 4) / 4;
    e[a] |= 128 << g % 4 * 8;
    e[d - 2] = c << 3;
    e[d - 1] = c >>> 29;
    return e
  }(e);
  var a = 1732584193;
  var d = 4023233417;
  var b = 2562383102;
  var c = 271733878;
  for (e = 0; e < f.length; e += 16) {
    var r = a;
    var t = d;
    var u = b;
    var v = c;
    a = h(a, d, b, c, f[e + 0], 7, 3614090360);
    c = h(c, a, d, b, f[e + 1], 12, 3905402710);
    b = h(b, c, a, d, f[e + 2], 17, 606105819);
    d = h(d, b, c, a, f[e + 3], 22, 3250441966);
    a = h(a, d, b, c, f[e + 4], 7, 4118548399);
    c = h(c, a, d, b, f[e + 5], 12, 1200080426);
    b = h(b, c, a, d, f[e +
    6], 17, 2821735955);
    d = h(d, b, c, a, f[e + 7], 22, 4249261313);
    a = h(a, d, b, c, f[e + 8], 7, 1770035416);
    c = h(c, a, d, b, f[e + 9], 12, 2336552879);
    b = h(b, c, a, d, f[e + 10], 17, 4294925233);
    d = h(d, b, c, a, f[e + 11], 22, 2304563134);
    a = h(a, d, b, c, f[e + 12], 7, 1804603682);
    c = h(c, a, d, b, f[e + 13], 12, 4254626195);
    b = h(b, c, a, d, f[e + 14], 17, 2792965006);
    d = h(d, b, c, a, f[e + 15], 22, 1236535329);
    a = k(a, d, b, c, f[e + 1], 5, 4129170786);
    c = k(c, a, d, b, f[e + 6], 9, 3225465664);
    b = k(b, c, a, d, f[e + 11], 14, 643717713);
    d = k(d, b, c, a, f[e + 0], 20, 3921069994);
    a = k(a, d, b, c, f[e + 5], 5, 3593408605);
    c = k(c,
      a, d, b, f[e + 10], 9, 38016083);
    b = k(b, c, a, d, f[e + 15], 14, 3634488961);
    d = k(d, b, c, a, f[e + 4], 20, 3889429448);
    a = k(a, d, b, c, f[e + 9], 5, 568446438);
    c = k(c, a, d, b, f[e + 14], 9, 3275163606);
    b = k(b, c, a, d, f[e + 3], 14, 4107603335);
    d = k(d, b, c, a, f[e + 8], 20, 1163531501);
    a = k(a, d, b, c, f[e + 13], 5, 2850285829);
    c = k(c, a, d, b, f[e + 2], 9, 4243563512);
    b = k(b, c, a, d, f[e + 7], 14, 1735328473);
    d = k(d, b, c, a, f[e + 12], 20, 2368359562);
    a = l(a, d, b, c, f[e + 5], 4, 4294588738);
    c = l(c, a, d, b, f[e + 8], 11, 2272392833);
    b = l(b, c, a, d, f[e + 11], 16, 1839030562);
    d = l(d, b, c, a, f[e + 14], 23, 4259657740);
    a = l(a, d, b, c, f[e + 1], 4, 2763975236);
    c = l(c, a, d, b, f[e + 4], 11, 1272893353);
    b = l(b, c, a, d, f[e + 7], 16, 4139469664);
    d = l(d, b, c, a, f[e + 10], 23, 3200236656);
    a = l(a, d, b, c, f[e + 13], 4, 681279174);
    c = l(c, a, d, b, f[e + 0], 11, 3936430074);
    b = l(b, c, a, d, f[e + 3], 16, 3572445317);
    d = l(d, b, c, a, f[e + 6], 23, 76029189);
    a = l(a, d, b, c, f[e + 9], 4, 3654602809);
    c = l(c, a, d, b, f[e + 12], 11, 3873151461);
    b = l(b, c, a, d, f[e + 15], 16, 530742520);
    d = l(d, b, c, a, f[e + 2], 23, 3299628645);
    a = m(a, d, b, c, f[e + 0], 6, 4096336452);
    c = m(c, a, d, b, f[e + 7], 10, 1126891415);
    b = m(b, c, a, d, f[e + 14], 15, 2878612391);
    d = m(d, b, c, a, f[e + 5], 21, 4237533241);
    a = m(a, d, b, c, f[e + 12], 6, 1700485571);
    c = m(c, a, d, b, f[e + 3], 10, 2399980690);
    b = m(b, c, a, d, f[e + 10], 15, 4293915773);
    d = m(d, b, c, a, f[e + 1], 21, 2240044497);
    a = m(a, d, b, c, f[e + 8], 6, 1873313359);
    c = m(c, a, d, b, f[e + 15], 10, 4264355552);
    b = m(b, c, a, d, f[e + 6], 15, 2734768916);
    d = m(d, b, c, a, f[e + 13], 21, 1309151649);
    a = m(a, d, b, c, f[e + 4], 6, 4149444226);
    c = m(c, a, d, b, f[e + 11], 10, 3174756917);
    b = m(b, c, a, d, f[e + 2], 15, 718787259);
    d = m(d, b, c, a, f[e + 9], 21, 3951481745);
    a = g(a, r);
    d = g(d, t);
    b = g(b, u);
    c = g(c, v)
  }
  return (q(a) + q(d) + q(b) +
    q(c)).toLowerCase()
};


function handle_keypresses(e) {

  // -- local .. step back / step forward

  var $ = jQuery;

  var keyboard_controls = $.extend({}, dzsap_generate_keyboard_controls());
  // console.log('keyboard_controls.pause_play - ',keyboard_controls.pause_play);
  // console.log('keyboard_controls - ',keyboard_controls);

  // console.log('e.keyCode - ',e.keyCode, keyboard_controls);

  if (dzsap_currplayer_focused && dzsap_currplayer_focused.api_pause_media) {

    var sw_pressed;


    sw_pressed = false;
    if (keyboard_controls.pause_play.indexOf('ctrl+') > -1) {

      if (e.ctrlKey) {
        keyboard_controls.pause_play = keyboard_controls.pause_play.replace('ctrl+', '');

        if (e.keyCode == keyboard_controls.pause_play) {

          sw_pressed = true;
        }
      }

    } else {

      if (e.keyCode == keyboard_controls.pause_play) {

        sw_pressed = true;
      }
    }


    if (sw_pressed) {

      if ($(dzsap_currplayer_focused).hasClass('comments-writer-active') == false) {

        if ($(dzsap_currplayer_focused).hasClass('is-playing')) {

          dzsap_currplayer_focused.api_pause_media();

        } else {

          dzsap_currplayer_focused.api_play_media();
        }


        if (window.dzsap_mouseover) {

          e.preventDefault();
          return false;
        }
      }
    }


    sw_pressed = false;
    if (keyboard_controls.step_back.indexOf('ctrl+') > -1) {

      if (e.ctrlKey) {
        keyboard_controls.step_back = keyboard_controls.step_back.replace('ctrl+', '');
        if (e.keyCode == keyboard_controls.step_back) {


          sw_pressed = true;

        }
      }
    } else {

      if (e.keyCode == keyboard_controls.step_back) {


        sw_pressed = true;

      }
    }

    if (sw_pressed) {


      dzsap_currplayer_focused.api_step_back(keyboard_controls.step_back_amount);

    }

    sw_pressed = false;

    if (keyboard_controls.step_forward.indexOf('ctrl+') > -1) {

      if (e.ctrlKey) {
        keyboard_controls.step_forward = keyboard_controls.step_forward.replace('ctrl+', '');
        if (e.keyCode == keyboard_controls.step_forward) {

          sw_pressed = true;

        }
      }
    } else {
      if (e.keyCode == keyboard_controls.step_forward) {

        sw_pressed = true;

      }
    }

    if (sw_pressed) {


      dzsap_currplayer_focused.api_step_forward(keyboard_controls.step_back_amount);

    }

    sw_pressed = false;

    if (e.keyCode == keyboard_controls.sync_players_goto_next) {
      sw_pressed = true;
    }

    if (sw_pressed) {
      if (dzsap_currplayer_focused && dzsap_currplayer_focused.api_sync_players_goto_next) {
        dzsap_currplayer_focused.api_sync_players_goto_next();
      }
    }


    sw_pressed = false;

    if (e.keyCode == keyboard_controls.sync_players_goto_prev) {
      sw_pressed = true;

    }

    if (sw_pressed) {
      if (dzsap_currplayer_focused && dzsap_currplayer_focused.api_sync_players_goto_prev) {
        dzsap_currplayer_focused.api_sync_players_goto_prev();
      }
    }


  }
}


function hexToRgb(hex, palpha) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var str = '';
  if (result) {
    result = {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };


    var alpha = 1;

    if (palpha) {
      alpha = palpha;
    }


    str = 'rgba(' + result.r + ',' + result.g + ',' + result.b + ',' + alpha + ')';
  }


  // console.log('hexToRgb ( hex - '+hex+' ) result ', str);

  return str;


}

exports.assignHelperFunctionsToJquery = function ($) {

  $.fn.prependOnce = function (arg, argfind) {
    var _t = $(this) // It's your element


    //        console.log(argfind);
    if (typeof (argfind) == 'undefined') {
      var regex = new RegExp('class="(.*?)"');
      var auxarr = regex.exec(arg);


      if (typeof auxarr[1] != 'undefined') {
        argfind = '.' + auxarr[1];
      }
    }


    // we compromise chaining for returning the success
    if (_t.children(argfind).length < 1) {
      _t.prepend(arg);
      return true;
    } else {
      return false;
    }
  };
  $.fn.appendOnce = function (arg, argfind) {
    var _t = $(this) // It's your element


    if (typeof (argfind) == 'undefined') {
      var regex = new RegExp('class="(.*?)"');
      var auxarr = regex.exec(arg);


      if (typeof auxarr[1] != 'undefined') {
        argfind = '.' + auxarr[1];
      }
    }
    // we compromise chaining for returning the success
    if (_t.children(argfind).length < 1) {
      _t.append(arg);
      return true;
    } else {
      return false;
    }
  };
};


exports.registerTextWidth = function ($) {

  $.fn.textWidth = function () {
    var _t = jQuery(this);
    var html_org = _t.html();
    if (_t[0].nodeName == 'INPUT') {
      html_org = _t.val();
    }
    var html_calcS = '<span class="forcalc">' + html_org + '</span>';
    jQuery('body').append(html_calcS);
    var _lastspan = jQuery('span.forcalc').last();
    //console.log(_lastspan, html_calc);
    _lastspan.css({
      'font-size': _t.css('font-size'),
      'font-family': _t.css('font-family')
    })
    var width = _lastspan.width();
    //_t.html(html_org);
    _lastspan.remove();
    return width;
  };
}
exports.player_checkIfWeShouldShowAComment = player_checkIfWeShouldShowAComment;
function player_checkIfWeShouldShowAComment(selfClass, real_time_curr, real_time_total){

  var $ = jQuery;
  var timer_curr_perc = Math.round((real_time_curr / real_time_total) * 100) / 100;
  if (selfClass.audioType == 'fake') {
    timer_curr_perc = Math.round((selfClass.timeCurrent / selfClass.timeTotal) * 100) / 100;
  }
  if (selfClass._commentsHolder) {
    selfClass._commentsHolder.children().each(function () {
      var _t = $(this);
      if (_t.hasClass('dzstooltip-con')) {
        var _t_posx = _t.offset().left - selfClass._commentsHolder.offset().left;


        var aux = Math.round((parseFloat(_t_posx) / selfClass._commentsHolder.outerWidth()) * 100) / 100;


        if (aux) {

          if (Math.abs(aux - timer_curr_perc) < 0.02) {
            selfClass._commentsHolder.find('.dzstooltip').removeClass('active');
            _t.find('.dzstooltip').addClass('active');
          } else {
            _t.find('.dzstooltip').removeClass('active');
          }
        }
      }
    })
  }
}
exports.sanitizeObjectForChangeMediaArgs = sanitizeObjectForChangeMediaArgs ;
function sanitizeObjectForChangeMediaArgs(_sourceForChange) {

  var changeMediaArgs = {};
  var _feed_fakePlayer = _sourceForChange;

  var lab = '';

  if (_sourceForChange.data('original-settings')) {
    return _sourceForChange.data('original-settings');
  }

  // -- settle source
  changeMediaArgs.source = null;
  if (_feed_fakePlayer.attr('data-source')) {
    changeMediaArgs.source = _feed_fakePlayer.attr('data-source')
  } else {
    // -- if it is a inline link
    if (_feed_fakePlayer.attr('href')) {
      changeMediaArgs.source = _feed_fakePlayer.attr('href');
    }
  }

  if (_feed_fakePlayer.attr('data-pcm')) {
    changeMediaArgs.pcm = _feed_fakePlayer.attr('data-pcm');
  }


  lab = 'thumb';
  if (_feed_fakePlayer.attr('data-' + lab)) {
    changeMediaArgs[lab] = _sourceForChange.attr('data-' + lab);
  }

  lab = 'playerid';
  if (_feed_fakePlayer.attr('data-' + lab)) {
    changeMediaArgs[lab] = _sourceForChange.attr('data-' + lab);
  }
  lab = 'type';
  if (_feed_fakePlayer.attr('data-' + lab)) {
    changeMediaArgs[lab] = _sourceForChange.attr('data-' + lab);
  }


  if (_feed_fakePlayer.attr('data-thumb_link')) {
    changeMediaArgs.thumb_link = _sourceForChange.attr('data-thumb_link');
  }


  if (_sourceForChange.find('.meta-artist').length > 0 || _sourceForChange.find('.meta-artist-con').length > 0) {

    changeMediaArgs.artist = _sourceForChange.find('.the-artist').eq(0).html();
    changeMediaArgs.song_name = _sourceForChange.find('.the-name').eq(0).html();
  }


  if (_sourceForChange.attr('data-thumb_for_parent')) {
    changeMediaArgs.thumb = _sourceForChange.attr('data-thumb_for_parent');
  }


  if (_sourceForChange.find('.feed-song-name').length > 0 || _sourceForChange.find('.feed-artist-name').length > 0) {

    changeMediaArgs.artist = _sourceForChange.find('.feed-artist-name').eq(0).html();
    changeMediaArgs.song_name = _sourceForChange.find('.feed-song-name').eq(0).html();
  }


  if (_feed_fakePlayer.attr('data-soft-watermark')) {
    changeMediaArgs.watermark = _sourceForChange.attr('data-soft-watermark');
  }
  if (_feed_fakePlayer.attr('data-watermark-volume')) {
    changeMediaArgs.watermark_volume = _sourceForChange.attr('data-watermark-volume');

  }


  return changeMediaArgs;


}

exports.dzsapInitjQueryRegisters = function () {

  window.dzsap_generate_list_for_sync_players = function (pargs) {

    var margs = {
      'force_regenerate': false

    };

    if (pargs) {
      margs = $.extend(margs, pargs);
    }
    window.dzsap_list_for_sync_players = [];

    // console.log('typeof(settings) != "undefined"  && typeof(settings.construct_player_list_for_sync) != "undefined"  && settings.construct_player_list_for_sync==\'on\' - ',typeof(settings) != "undefined"  && typeof(settings.construct_player_list_for_sync) != "undefined"  && settings.construct_player_list_for_sync=='on', typeof(settings) != "undefined", typeof(settings.construct_player_list_for_sync), settings.construct_player_list_for_sync=='on');


    if (typeof (settings) != "undefined" && ((typeof (settings.construct_player_list_for_sync) != "undefined" && settings.construct_player_list_for_sync == 'on') || margs.force_regenerate)) {

      jQuery('.audioplayer,.audioplayer-tobe').each(function () {
        var _t2 = jQuery(this);
        if (_t2.attr('data-do-not-include-in-list') != 'on') {
          if (_t2.attr('data-type') != 'fake' || _t2.attr('data-fakeplayer')) {

            window.dzsap_list_for_sync_players.push(_t2);
          }
        }
      })

      // console.log('dzsap_list_for_sync_players -5 ',dzsap_list_for_sync_players);

    }
  }


  jQuery(document).off('click.dzsap_global');
  jQuery(document).on('click.dzsap_global', '.dzsap-btn-info', function () {

    var _t = jQuery(this);
    if (_t.hasClass('dzsap-btn-info')) {

      _t.find('.dzstooltip').toggleClass('active');
      return;
    }

  })
  jQuery(document).on('mouseover.dzsap_global', '.dzsap-btn-info', function () {

    var _t = jQuery(this);
    if (_t.hasClass('dzsap-btn-info')) {
      // console.log(_t.offset().left);
      if (window.innerWidth < 500) {
        // -- if we are in the left side of the screen, we move the tooltip to the right.
        if (_t.offset().left < (window.innerWidth / 2)) {
          _t.find('.dzstooltip').removeClass('talign-end').addClass('talign-start');
        }
      } else {
        _t.find('.dzstooltip').addClass('talign-end').removeClass('talign-start');
      }
    }

  });
}
exports.miscFunctions = function () {


  window.dzsap_send_total_time = function (argtime, argcthis) {


    // console.log('dzsap_send_total_time()',argtime,argcthis);

    var data = {
      action: 'dzsap_send_total_time_for_track'
      , id_track: argcthis.attr('data-playerid')
      , postdata: parseInt(argtime, 10)
    };
    jQuery.post(window.dzsap_ajaxurl, data, function (response) {
      if (window.console != undefined) {
        console.log('dzsap_send_total_time Got this from the server: ' + response);
      }


    });

  }


  window.dzs_open_social_link = function (arg, argthis) {
    var leftPosition, topPosition;
    var w = 500, h = 500;
    //Allow for borders.
    leftPosition = (window.screen.width / 2) - ((w / 2) + 10);
    //Allow for title and status bars.
    topPosition = (window.screen.height / 2) - ((h / 2) + 50);
    var windowFeatures = "status=no,height=" + h + ",width=" + w + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no";


    console.log('dzs_open_social_link()', arg, 'argthis - ', argthis);


    arg = arg.replace('{{replacewithcurrurl}}', encodeURIComponent(window.location.href));
    if (argthis) {

      arg = arg.replace(/{{replacewithdataurl}}/g, argthis.attr('data-url'));
    }

    var aux = window.location.href;


    var auxa = aux.split('?');

    var cid = '';
    var cid_gallery = '';


    if (argthis) {

    } else {
      if (window.dzsap_currplayer_from_share) {

        argthis = window.dzsap_currplayer_from_share;
      }
    }


    // console.log('window.dzsap_currplayer_from_share -> ', window.dzsap_currplayer_from_share);
    // console.log('argthis -> ', argthis);


    if (argthis) {

      var $ = jQuery;

      if ($(argthis).hasClass('audioplayer')) {
        cid = $(argthis).parent().children().index(argthis);
        cid_gallery = $(argthis).parent().parent().parent().attr('id');
      } else {
        if (jQuery(argthis).parent().parent().attr('data-menu-index')) {

          cid = jQuery(argthis).parent().parent().attr('data-menu-index');
        }
        if (jQuery(argthis).parent().parent().attr('data-gallery-id')) {

          cid_gallery = jQuery(argthis).parent().parent().attr('data-gallery-id');
        }
      }

    }


    var shareurl = encodeURIComponent(auxa[0] + '?fromsharer=on&audiogallery_startitem_' + cid_gallery + '=' + cid + '');
    arg = arg.replace('{{shareurl}}', shareurl);

    console.log('shareurl -> ', shareurl);

    //console.log(argthis);
    //console.log('arg - ',arg);
    window.open(arg, "sharer", windowFeatures);
  }


  window.dzsap_wp_send_contor_60_secs = function (argcthis, argtitle) {

    var data = {
      video_title: argtitle
      // ,video_analytics_id: argcthis.attr('data-analytics-id')
      , video_analytics_id: argcthis.attr('data-playerid')
      , curr_user: window.dzsap_curr_user
    };
    var theajaxurl = 'index.php?action=ajax_dzsap_submit_contor_60_secs';

    if (window.dzsap_settings.dzsap_site_url) {

      theajaxurl = dzsap_settings.dzsap_site_url + theajaxurl;
    }

    // console.log('dzsap_wp_send_contor_60_secs()',argcthis,argtitle);


    jQuery.ajax({
      type: "POST",
      url: theajaxurl,
      data: data,
      success: function (response) {
        if (typeof window.console != "undefined") {
          // console.log('Ajax - submit view - ' + response);
        }


      },
      error: function (arg) {
        if (typeof window.console != "undefined") {
          // console.warn('Got this from the server: ' + arg);
        }
        ;
      }
    });
  }


  window.dzsap_init_multisharer = function () {
    var $ = jQuery;
    setTimeout(function () {
      // console.log("LOAD MULTISHARER");


      // console.log('window.dzsap_multisharer_assets_loaded - ',window.dzsap_multisharer_assets_loaded);
      if (window.dzsap_multisharer_assets_loaded) {

      } else {
        if (window.dzsap_multisharer_assets_loaded != true && window.loading_multi_sharer != true) {

          // -- only if settings_php_handler is set


          // - -load script for lightbox
          window.loading_multi_sharer = true;
          var head = document.getElementsByTagName('head')[0];
          var link = document.createElement('link');

          if (window.dzsap_settings && window.dzsap_settings.dzsap_site_url) {

            link.id = 'dzsap-load-multi-sharer';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = add_query_arg(window.dzsap_settings.dzsap_site_url, 'load-lightbox-css', 'on');
            link.media = 'all';
            head.appendChild(link);
          }

          // console.log('script for lightbox - ',add_query_arg(window.dzsap_settings.dzsap_site_url,'load-lightbox-css','on'));

          // console.warn("APPEND MULTISHARER STYLE");

          setTimeout(function () {

            if (window.dzsap_box_main_con == null) {

              $('body').append('<div class="dzsap-main-con skin-default gallery-skin-default transition-slideup "> <div class="overlay-background"></div> <div class="box-mains-con"> <div class="box-main box-main-for-share" style=""> <div class="box-main-media-con transition-target"> <div class="close-btn-con"> ' + dzsapSvgs.svg_close_btn + '</div> <div class="box-main-media type-inlinecontent" style="width: 530px; height: 280px;"><div class=" real-media" style=""><div class="hidden-content share-content" > <div class="social-networks-con"></div> <div class="share-link-con"></div> <div class="embed-link-con"></div> </div> </div> </div> <div class="box-main-under"></div> </div> </div> </div><!-- end .box-mains-con--> </div>');


              window.dzsap_box_main_con = $('.dzsap-main-con').eq(0);

              // console.log('dzsap_box_main_con - ', window.dzsap_box_main_con);
            }

          }, 1000);


        }
      }

      // -- remove main con function
      $(document).on('click.dzsap_global_sharer', '.dzsap-main-con .close-btn-con,.dzsap-main-con .overlay-background', function () {


        var _c = $('.dzsap-main-con').eq(0);

        _c.removeClass('loading-item loaded-item');
      })

    }, 2000)
  }


  window.dzsap_submit_like = function (argp, e) {
    //only handles ajax call + result
    var mainarg = argp;
    var data = {
      action: 'dzsap_submit_like',
      playerid: argp
    };

    var _t = null;

    if (e) {
      _t = jQuery(e.currentTarget);
    }


    if (window.dzsap_settings && window.dzsap_settings.ajax_url) {

      jQuery.ajax({
        type: "POST",
        url: window.dzsap_settings.ajax_url,
        data: data,
        success: function (response) {
          if (typeof window.console != "undefined") {
            console.log('Got this from the server: ' + response);
          }


          if (_t) {

            var htmlaux = _t.html();

            _t.html(htmlaux.replace('fa-heart-o', 'fa-heart'));
          }

        },
        error: function (arg) {
          if (typeof window.console != "undefined") {
            // console.log('Got this from the server: ' + arg, arg);
          }
          ;
        }
      });
    }
  }


  window.dzsap_retract_like = function (argp, e) {
    //only handles ajax call + result
    var mainarg = argp;
    var data = {
      action: 'dzsap_retract_like',
      playerid: argp
    };

    var _t = null;

    if (e) {
      _t = jQuery(e.currentTarget);
    }


    if (window.dzsap_settings && window.dzsap_settings.ajax_url) {

      jQuery.ajax({
        type: "POST",
        url: window.dzsap_settings.ajax_url,
        data: data,
        success: function (response) {
          if (typeof window.console != "undefined") {
            console.log('Got this from the server: ' + response);
          }


          if (_t) {
            var htmlaux = _t.html();

            _t.html(htmlaux.replace('fa-heart', 'fa-heart-o'));
          }

        },
        error: function (arg) {
          if (typeof window.console != "undefined") {
            // console.log('Got this from the server: ' + arg, arg);
          }
          ;
        }
      });
    }
  }

}

exports.jQueryAuxBindings = function ($) {

  // console.log('start aux bindings');
  $(document).on('click.dzsap_metas', '.audioplayer-song-changer, .dzsap-wishlist-but', function () {
    var _t = $(this);

    // conso

    if (_t.hasClass('audioplayer-song-changer')) {

      // console.log('.audioplayer-song-changer', _t);
      var _c = $(_t.attr('data-fakeplayer')).eq(0);
      // console.log(_t, _t.attr('data-fakeplayer'), _t.attr('data-target'), _c, _c.get(0));


      if (_c && _c.get(0) && _c.get(0).api_change_media) {

        _c.get(0).api_change_media(_t, {
          'feeder_type': 'button'
          , 'call_from': 'changed audioplayer-song-changer'
        });
      }

      return false;
    }

    if (_t.hasClass('dzsap-wishlist-but')) {


      var data = {
        action: 'dzsap_add_to_wishlist',
        playerid: _t.attr('data-post_id'),
        wishlist_action: 'add',
      };


      if (_t.find('.svg-icon').hasClass('fa-star')) {
        data.wishlist_action = 'remove';
      }


      if (window.dzsap_lasto.settings_php_handler) {
        $.ajax({
          type: "POST",
          url: window.dzsap_lasto.settings_php_handler,
          data: data,
          success: function (response) {
            //if(typeof window.console != "undefined" ){ console.log('Ajax - get - comments - ' + response); }


            if (_t.find('.svg-icon').hasClass('fa-star-o')) {
              _t.find('.svg-icon').eq(0).attr('class', 'svg-icon fa fa-star');
            } else {

              _t.find('.svg-icon').eq(0).attr('class', 'svg-icon fa fa-star-o');
            }

          },
          error: function (arg) {
            if (typeof window.console != "undefined") {
              // console.log('Got this from the server: ' + arg, arg);
            }
            ;
          }
        });
      }

      return false;


    }

  })


  $(document).on('click.dzsiconhide', '.sticktobottom-close-con,.sticktobottom-close-con .svg-icon', function () {
    var _t = $(this);

    $('.dzsap-sticktobottom .audioplayer').get(0).api_pause_media();


    console.log('_t sticktobottom-close-con -7', _t);

    var _con = null;

    if (_t.parent().hasClass("dzsap-sticktobottom")) {
      _con = _t.parent();
    }
    if (_t.parent().parent().hasClass("dzsap-sticktobottom")) {
      _con = _t.parent().parent();
    }
    if (_t.parent().parent().parent().hasClass("dzsap-sticktobottom")) {
      _con = _t.parent().parent().parent();
    }

    console.log('_con - ', _con, _con.hasClass('audioplayer-loaded'));

    if (_con.hasClass('audioplayer-loaded')) {

      _con.removeClass('audioplayer-loaded');
      _con.addClass('audioplayer-was-loaded');


    } else {

      _con.addClass('audioplayer-loaded');
      _con.addClass('audioplayer-was-loaded');
    }

    return false;
  })

  $(document).on('click.dzsiconshow', '.dzsap-sticktobottom .icon-show', function () {
    var _t = $(this);


    // _t.parent().parent().addClass('audioplayer-loaded');
    // _t.parent().parent().removeClass('audioplayer-was-loaded');
    //
    // _t.parent().parent().parent().addClass('audioplayer-loaded');
    // _t.parent().parent().parent().removeClass('audioplayer-was-loaded');

    return false;
  })


  if ($('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-silver').length > 0) {
    setInterval(function () {

      //console.log($('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-silver > .audioplayer').eq(0).hasClass('dzsap-loaded'));
      if ($('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-silver  .audioplayer').eq(0).hasClass('dzsap-loaded')) {
        $('.dzsap-sticktobottom-placeholder').eq(0).addClass('active');

        if ($('.dzsap-sticktobottom').hasClass('audioplayer-was-loaded') == false) {

          $('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-silver').addClass('audioplayer-loaded')
        }
      }
    }, 1000);
  }


  if ($('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-wave').length > 0) {
    setInterval(function () {

      // console.log($('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-wave  .audioplayer'), $('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-wave  .audioplayer').eq(0).hasClass('dzsap-loaded'));
      if ($('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-wave  .audioplayer').eq(0).hasClass('dzsap-loaded')) {
        $('.dzsap-sticktobottom-placeholder').eq(0).addClass('active');

        if ($('.dzsap-sticktobottom').hasClass('audioplayer-was-loaded') == false) {

          $('.dzsap-sticktobottom.dzsap-sticktobottom-for-skin-wave').addClass('audioplayer-loaded')
        }
      }


    }, 1000);
  }


  $(document).on('click.dzsap_multisharer', '.dzsap-multisharer-but', click_open_embed_ultibox);

  function click_open_embed_ultibox(e, pargs) {

    var margs = {
      'call_from': 'default'


    };

    if (pargs) {
      margs = $.extend(margs, pargs);
    }


    console.log('click_open_embed_ultibox() this - ', this);

    open_dzsap_lightbox({
      'call_from': 'click_open_embed_ultibox'
      , 'lightbox_open': 'share'
      , 'overwrite_this': this
    });


    return false;
  }


  function open_dzsap_lightbox(pargs) {

    var margs = {
      'call_from': 'default'
      , 'lightbox_open': 'share'
      , 'overwrite_this': null

    };

    if (pargs) {
      margs = $.extend(margs, pargs);
    }


    // console.log('ceva');

    var _c_mc = window.dzsap_box_main_con;
    var _t = $(this);


    if (margs.overwrite_this) {
      _t = $(margs.overwrite_this);
    }
    // console.log('open_dzsap_lightbox() _c -> ',_c_mc, _c_mc.find('.social-networks-con'), 'margs - ',margs);


    if (_t.data('cthis')) {
      var cthis = _t.data('cthis');

      console.log('found cthis in data');
    }

    if (cthis) {

      window.dzsap_currplayer_from_share = cthis;
    } else {

      console.log('%c could not find this .. maybe we can find it in post_id', 'background-color: #da0000;', $('.audioplayer[data-playerid="' + _t.attr('data-post_id') + '"]'));


      if (_t.attr('data-post_id')) {
        window.dzsap_currplayer_from_share = $('.audioplayer[data-playerid="' + _t.attr('data-post_id') + '"]').eq(0);
        _t.data('cthis', window.dzsap_currplayer_from_share);
      } else {

        if (_t.parent().parent().parent().parent().parent().parent().hasClass('audioplayer')) {
          // console.log("YES");
          window.dzsap_currplayer_from_share = _t.parent().parent().parent().parent().parent().parent();
        }
      }
    }


    // console.log('window.dzsap_currplayer_from_share -> ', window.dzsap_currplayer_from_share);


    // console.log('_t -> ', _t, _t.data('cthis'));
    // console.log('window.dzsap_currplayer_from_share -> ', window.dzsap_currplayer_from_share);
    // console.log('_c_mc -5', _c_mc);


    var aux = '';

    if (window.dzsap_social_feed_for_social_networks) {
      aux = window.dzsap_social_feed_for_social_networks;
    }

    // -- aux is feed from social_feed


    if (window.dzsap_box_main_con) {

      console.log('window.dzsap_box_main_con - ', window.dzsap_box_main_con);

      window.dzsap_box_main_con.find('.social-networks-con').html(aux);


      aux = '';
      if (window.dzsap_social_feed_for_share_link) {
        aux = window.dzsap_social_feed_for_share_link;
      }


      if (aux) {


        // console.log('_t - ',_t);


        var newloc = window.location.href;


        if (_t.attr('data-post-url')) {
          newloc = _t.attr('data-post-url');
        }


        aux = aux.replace('{{replacewithcurrurl}}', newloc);
        aux = aux.replace('{{replacewithdataurl}}', newloc);
        window.dzsap_box_main_con.find('.share-link-con').html(aux);
      }

      var aux_social = '';
      if (window.dzsap_social_feed_for_embed_link) {
        aux_social = window.dzsap_social_feed_for_embed_link;
      }


      // console.log(' o - ',o, cthis,'dzsap_currplayer_from_share - ',dzsap_currplayer_from_share);
      if (window.dzsap_currplayer_from_share && dzsap_currplayer_from_share.data('embed_code')) {

        console.log('o.embed_code - ', dzsap_currplayer_from_share.data('embed_code'));

        if (aux_social) {

          var replace_str = dzsap_currplayer_from_share.data('embed_code');

          if (replace_str.indexOf('&lt;') == -1) {
            replace_str = htmlEntities(replace_str);
          }
          aux_social = aux_social.replace('{{replacewithembedcode}}', (replace_str));
          _c_mc.find('.embed-link-con').html(aux_social);
        }

      }

      // console.log('_c_mc - ',_c_mc);
      // console.log('o.embed_code - ',o.embed_code);
      // console.log('aux_social - ',aux_social);

      $(document).on('click.dzsap', '.field-for-view', function () {

        console.log("select all test ", this);
        selectText(this);

        // $(this).select();
      });
      _c_mc.addClass('loading-box-main-' + margs.lightbox_open);
      setTimeout(function () {
        _c_mc.addClass('loading-item');
      }, 100);

      setTimeout(function () {
        _c_mc.addClass('loaded-item');
      }, 200);


    } else {
      console.log('warning missing box-main');
    }
  }


  $(document).on('keydown.dzsapkeyup keypress.dzsapkeyup', function (e) {
    // console.log('e - ',e);
    // console.log('dzsap_currplayer_focused - ',dzsap_currplayer_focused);

    handle_keypresses(e);
  })


  $(document).on('keydown blur', '.zoomsounds-search-field', function (e) {

    // console.info(e.currentTarget.value);
    var _t = $(e.currentTarget);

    setTimeout(function () {

      if (_t) {
        var _target = $('.audiogallery').eq(0);
        if (_t.attr('data-target')) {
          _target = $(_t.attr('data-target'));
        }
        if (_target.get(0) && _target.get(0).api_filter) {

          _target.get(0).api_filter('title', _t.val());
        }
      }
    }, 100);

  });


  $(document).on('click', '.dzsap-like-but', function (e) {

    var _t = $(this);


    var playerid = _t.attr('data-post_id');

    if (playerid && playerid != '0') {

    } else {
      if (_t.parent().parent().parent().parent().parent().hasClass('audioplayer')) {

        playerid = _t.parent().parent().parent().parent().parent().attr('data-feed-playerid');
      }
    }
    window.dzsap_submit_like(playerid, e);

    _t.removeClass('dzsap-like-but').addClass('dzsap-retract-like-but');

    return false;
  })

  $(document).on('click', '.dzsap-retract-like-but', function (e) {

    var _t = $(this);
    var playerid = _t.attr('data-post_id');

    if (playerid && playerid != '0') {

    } else {
      if (_t.parent().parent().parent().parent().parent().hasClass('audioplayer')) {

        playerid = _t.parent().parent().parent().parent().parent().attr('data-feed-playerid');
      }
    }


    window.dzsap_retract_like(playerid, e);
    _t.addClass('dzsap-like-but').removeClass('dzsap-retract-like-but');
    return false;
  })


}


exports.selectText = function (arg) {
  if (document.selection) {
    var range = document.body.createTextRange();
    range.moveToElementText(arg);
    range.select();
  } else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(arg);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
}


exports.ajax_submit_views = function (argp, the_player_id, currIp, data_source, o, $, increment_views, ajax_view_submitted) {

  // console.log('ajax_submit_views()',argp);

  var data = {
    action: 'dzsap_submit_views',
    postdata: 1,
    playerid: the_player_id,
    currip: currIp
  };


  if (cthis.attr('data-playerid-for-views')) {
    data.playerid = cthis.attr('data-playerid-for-views');
  }


  if (data.playerid == '') {
    data.playerid = dzs_clean_string(data_source);
  }

  //                console.log(ajax_view_submitted);


  // -- submit view
  if (o.settings_php_handler) {
    $.ajax({
      type: "POST",
      url: o.settings_php_handler,
      data: data,
      success: function (response) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + response);
        }

        // -- increase number of hits
        var auxnr = cthis.find('.counter-hits .the-number').html();
        auxnr = parseInt(auxnr, 10);
        if (increment_views != 2) {
          auxnr++;
        }
        if (response) {
          if (decode_json(response)) {
            auxnr = decode_json(response)['number'];
          }
        }

        cthis.find('.counter-hits .the-number').html(auxnr);

        ajax_view_submitted = 'on';
      },
      error: function (arg) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + arg, arg);
        }
        ;


        var auxlikes = cthis.find('.counter-hits .the-number').html();
        auxlikes = parseInt(auxlikes, 10);
        auxlikes++;
        cthis.find('.counter-hits .the-number').html(auxlikes);

        ajax_view_submitted = 'on';
      }
    });
    ajax_view_submitted = 'on';
  }

}


exports.player_determineActualPlayer = player_determineActualPlayer;
function player_determineActualPlayer(cthis, selfClass){

  var $ = jQuery;
  var _c = $(cthis.attr('data-fakeplayer'));

  if (_c.length == 0) {
    _c = $(String(cthis.attr('data-fakeplayer')).replace('#', '.'));
    if (_c.length) {
      selfClass._actualPlayer = $(String(cthis.attr('data-fakeplayer')).replace('#', '.'));
      cthis.attr('data-fakeplayer', String(cthis.attr('data-fakeplayer')).replace('#', '.'));


    }
  }

  if (_c.length == 0) {
    cthis.attr('data-fakeplayer', '');
  } else {
    cthis.addClass('player-is-feeding is-source-player-for-actual-player');
    if (cthis.attr('data-type')) {

      selfClass._actualPlayer = $(cthis.attr('data-fakeplayer')).eq(0);
      selfClass.actualDataTypeOfMedia = cthis.attr('data-type');
      cthis.attr('data-original-type', selfClass.actualDataTypeOfMedia);
    }
  }
}
exports.configureAudioPlayerOptionsInitial = function (cthis, o, selfClass) {


  if (isNaN(parseInt(o.design_thumbh, 10)) == false) {
    o.design_thumbh = parseInt(o.design_thumbh, 10);
  }

  if(o.skinwave_wave_mode_canvas_normalize==''){
    o.skinwave_wave_mode_canvas_normalize = 'on';
  }
  if(o.skinwave_wave_mode_canvas_waves_number=='' || isNaN(Number(o.skinwave_wave_mode_canvas_waves_number))){
    o.skinwave_wave_mode_canvas_waves_number = 3;
  }


  if (o.autoplay == 'on' && o.cue == 'on') {
    o.preload_method = 'auto';
  }

  cthis.addClass(o.extra_classes_player)

  if (o.design_skin == '') {
    o.design_skin = 'skin-default';
  }

  if(this.is_ios()){
    // todo: ios not playing nice.. with audio context
    if(selfClass.initOptions.skinwave_enableSpectrum=='on'){
      selfClass.initOptions.skinwave_enableSpectrum = 'off';
    }

  }

  var regexr = / skin-/g;


  if (regexr.test(cthis.attr('class'))) {

  } else {

    cthis.addClass(o.design_skin);
  }


  if (cthis.hasClass('skin-default')) {
    o.design_skin = 'skin-default';
  }
  if (cthis.hasClass('skin-wave')) {
    o.design_skin = 'skin-wave';
  }
  if (cthis.hasClass('skin-justthumbandbutton')) {
    o.design_skin = 'skin-justthumbandbutton';
  }
  if (cthis.hasClass('skin-pro')) {
    o.design_skin = 'skin-pro';
  }
  if (cthis.hasClass('skin-aria')) {
    o.design_skin = 'skin-aria';
  }
  if (cthis.hasClass('skin-silver')) {
    o.design_skin = 'skin-silver';
  }
  if (cthis.hasClass('skin-redlights')) {
    o.design_skin = 'skin-redlights';
  }
  if (cthis.hasClass('skin-steel')) {
    o.design_skin = 'skin-steel';
  }
  if (cthis.hasClass('skin-customcontrols')) {
    o.design_skin = 'skin-customcontrols';
  }


  if (o.design_skin == 'skin-wave') {
    if (o.scrubbar_type == 'auto') {
      o.scrubbar_type = 'wave';
    }
  }
  if (o.scrubbar_type == 'auto') {
    o.scrubbar_type = 'bar';
  }


  if (cthis.attr('data-viewsubmitted') == 'on') {
    selfClass.ajax_view_submitted = 'on';

    // console.log('selfClass.ajax_view_submitted from data-viewsubmitted', cthis);
  }
  if (cthis.attr('data-userstarrating')) {
    selfClass.starrating_alreadyrated = Number(cthis.attr('data-userstarrating'));
  }


  if (cthis.hasClass('skin-minimal')) {
    o.design_skin = 'skin-minimal';
    if (o.disable_volume == 'default') {
      o.disable_volume = 'on';
    }

    if (o.disable_scrub == 'default') {
      o.disable_scrub = 'on';
    }
    o.disable_timer = 'on';
  }
  if (cthis.hasClass('skin-minion')) {
    o.design_skin = 'skin-minion';
    if (o.disable_volume == 'default') {
      o.disable_volume = 'on';
    }

    if (o.disable_scrub == 'default') {
      o.disable_scrub = 'on';
    }

    o.disable_timer = 'on';
  }


  if (o.design_color_bg) {
    o.design_wave_color_bg = o.design_color_bg;
  }


  if (o.design_color_highlight) {
    o.design_wave_color_progress = o.design_color_highlight;
  }


  if (o.design_skin == 'skin-justthumbandbutton') {
    if (o.design_thumbh == 'default') {
      o.design_thumbh = '';
      //                        res_thumbh = true;
    }
    o.disable_timer = 'on';
    o.disable_volume = 'on';

    if (o.design_animateplaypause == 'default') {
      o.design_animateplaypause = 'on';
    }
  }
  if (o.design_skin == 'skin-redlights') {
    o.disable_timer = 'on';
    o.disable_volume = 'off';
    if (o.design_animateplaypause == 'default') {
      o.design_animateplaypause = 'on';
    }

  }
  if (o.design_skin == 'skin-steel') {
    if (o.disable_timer == 'default') {

      o.disable_timer = 'off';
    }
    o.disable_volume = 'on';
    if (o.design_animateplaypause == 'default') {
      o.design_animateplaypause = 'on';
    }


    if (o.disable_scrub == 'default') {
      o.disable_scrub = 'on';
    }

  }
  if (o.design_skin == 'skin-customcontrols') {
    if (o.disable_timer == 'default') {

      o.disable_timer = 'on';
    }
    o.disable_volume = 'on';
    if (o.design_animateplaypause == 'default') {
      o.design_animateplaypause = 'on';
    }


    if (o.disable_scrub == 'default') {
      o.disable_scrub = 'on';
    }

  }

  if (o.skinwave_wave_mode_canvas_mode == 'reflecto') {
    o.skinwave_wave_mode_canvas_reflection_size = 0.5;
    // o.skinwave_wave_mode_canvas_waves_number=1;
    // o.skinwave_wave_mode_canvas_waves_padding=0;
  }

  if (o.skinwave_wave_mode_canvas_mode == 'reflecto') {
    o.skinwave_wave_mode_canvas_reflection_size = 0.5;
    // o.skinwave_timer_static='on';
  }


  if (o.embed_code == '') {
    if (cthis.find('div.feed-embed-code').length > 0) {
      o.embed_code = cthis.find('div.feed-embed-code').eq(0).html();
    }
  }

  if (o.design_animateplaypause == 'default') {
    o.design_animateplaypause = 'off';
  }

  if (o.design_animateplaypause == 'on') {
    cthis.addClass('design-animateplaypause');
  }

  if (window.dzsap_settings) {
    if (window.dzsap_settings.php_handler) {
      if (!o.settings_php_handler) {

        o.settings_php_handler = window.dzsap_settings.php_handler;
      }
    }
  }
  // console.log('o - ',o, selfClass);
  if (o.settings_php_handler) {
    selfClass.urlToAjaxHandler = o.settings_php_handler;
  }


}


/**
 * from 1:01 to 61
 * @param arg
 * @returns {number}
 */
exports.sanitize_from_point_time = function (arg) {
  //formats the time


  var fint = '';


  arg = String(arg).replace('%3A', ':');
  arg = String(arg).replace('#', '');

  if (arg && String(arg).indexOf(':') > -1) {

    var arr = /(\d.*):(\d.*)/g.exec(arg);

    // console.log('result arr -  ',arr);

    var m = parseInt(arr[1], 10);
    var s = parseInt(arr[2], 10);


    return (m * 60) + s;
  } else {
    return Number(arg);
  }
}

exports.player_initSpectrumOnUserAction = function (selfClass) {

  var javascriptNode = null;


  console.log('setting up listeners for player_initSpectrumOnUserAction');
  selfClass.cthis.get(0).addEventListener('mousedown', handleMouseDown, {once: true});
  selfClass.cthis.get(0).addEventListener('touchdown', handleMouseDown, {once: true});

  function handleMouseDown(e) {
    console.log('setting up audio context --', e);

    if (window.dzsap_audio_ctx == null) {
      if (typeof AudioContext !== 'undefined') {
        selfClass.spectrum_audioContext = new AudioContext();
        window.dzsap_audio_ctx = selfClass.spectrum_audioContext;
      } else if (typeof webkitAudioContext !== 'undefined') {
        selfClass.spectrum_audioContext = new webkitAudioContext();
        window.dzsap_audio_ctx = selfClass.spectrum_audioContext;
      } else {
        selfClass.spectrum_audioContext = null;
      }
    } else {
      selfClass.spectrum_audioContext = window.dzsap_audio_ctx;
    }


    if (selfClass.spectrum_audioContext.createOscillator) {

      // oscillatorNode = selfClass.spectrum_audioContext.createOscillator();
    }

    if (selfClass.spectrum_audioContext.destination) {

      // selfClass.spectrum_audioContext_finish = selfClass.spectrum_audioContext.destination;
    }


    // console.log('selfClass.spectrum_audioContext - ', selfClass.spectrum_audioContext);

    if (selfClass.spectrum_audioContext) {


      // -- normal
      // setup a analyzer
      if(selfClass.spectrum_analyser===null){

        selfClass.spectrum_analyser = selfClass.spectrum_audioContext.createAnalyser();
        selfClass.spectrum_analyser.smoothingTimeConstant = 0.3;
        selfClass.spectrum_analyser.fftSize = 512;

        // console.log('selfClass.audioType - ', selfClass.audioType);
        if (selfClass.audioType == 'selfHosted') {
          // console.log($mediaNode_);
          // return;
          selfClass.$mediaNode_.crossOrigin = "anonymous";
          selfClass.spectrum_mediaElementSource = selfClass.spectrum_audioContext.createMediaElementSource(selfClass.$mediaNode_);

          selfClass.spectrum_mediaElementSource.connect(selfClass.spectrum_analyser);
          if (selfClass.spectrum_audioContext.createGain) {
            selfClass.spectrum_gainNode = selfClass.spectrum_audioContext.createGain();
          }
          selfClass.spectrum_analyser.connect(selfClass.spectrum_audioContext.destination);

          selfClass.spectrum_gainNode.gain.value = 1;

          var frameCount = selfClass.spectrum_audioContext.sampleRate * 2.0;
          selfClass.spectrum_audioContext_buffer = selfClass.spectrum_audioContext.createBuffer(2, frameCount, selfClass.spectrum_audioContext.sampleRate);
        }
      }
    }

  }


}

exports.player_stopOtherPlayers = function(dzsap_list, selfClass){

  var i =0;
  for (i = 0; i < dzsap_list.length; i++) {
    // -- pause other players
    if (dzsap_list[i].get(0) && dzsap_list[i].get(0).api_pause_media && (dzsap_list[i].get(0) != selfClass.cthis.get(0))) {

      //console.error("LETS PAUSE");
      if (dzsap_list[i].data('type_audio_stop_buffer_on_unfocus') && dzsap_list[i].data('type_audio_stop_buffer_on_unfocus') == 'on') {
        dzsap_list[i].get(0).api_destroy_for_rebuffer();
      } else {
        dzsap_list[i].get(0).api_pause_media({
          'audioapi_setlasttime': false
        });
      }
    }
  }
}
exports.player_determineProperties = player_determineProperties;
function player_determineProperties(){

  var source = null;
  var type = null;
  var pcm = null;
  var thumb = null;




}
exports.player_detect_skinwave_mode = player_detect_skinwave_mode;
function player_detect_skinwave_mode () {

  var selfClass = this;


  selfClass.skinwave_mode = selfClass.initOptions.skinwave_mode;

  if (selfClass.cthis.hasClass('skin-wave-mode-small')) {
    selfClass.skinwave_mode = 'small'
  }
  if (selfClass.cthis.hasClass('skin-wave-mode-alternate')) {
    selfClass.skinwave_mode = 'alternate'
  }
  if (selfClass.cthis.hasClass('skin-wave-mode-bigwavo')) {
    selfClass.skinwave_mode = 'bigwavo'
  }
}
exports.player_constructArtistAndSongCon = function (margs) {

  var selfClass = this;

  if (selfClass.cthis.find('.meta-artist').length == 0) {
    if (selfClass.cthis.find('.feed-artist').length || selfClass.cthis.find('.feed-songname').length) {
      var structHtml = '<span class="meta-artist player-artistAndSong">';
      if (selfClass.cthis.find('.feed-artist').length) {
        structHtml += '<span class="the-artist">' + selfClass.cthis.find('.feed-artist').eq(0).html() + '</span>';
      }
      if (selfClass.cthis.find('.feed-songname').length) {
        structHtml += '<span class="the-name player-meta--songname">' + selfClass.cthis.find('.feed-songname').eq(0).html() + '</span>';
      }
      structHtml += '</span>';
      selfClass.cthis.append(structHtml);
    }
  }

  if (selfClass.cthis.attr("data-type") == 'fake') {
    if (selfClass.cthis.find('.meta-artist').length == 0) {
      selfClass.cthis.append('<span class="meta-artist"><span class="the-artist"></span><span class="the-name"></span></span>')
    }
  }

  if (!selfClass._metaArtistCon || margs.call_from == 'reconstruct') {
    // -- reconstruct
    if (selfClass.cthis.children('.meta-artist').length > 0) {
      //console.log(cthis.hasClass('alternate-layout'));
      if (selfClass.cthis.hasClass('skin-wave-mode-alternate')) {
        //console.log(_conControls.children().last());

        if (selfClass._conControls.children().last().hasClass('clear')) {
          selfClass._conControls.children().last().remove();
        }
        selfClass._conControls.append(selfClass.cthis.children('.meta-artist'));
      } else {

        // -- normal
        if (selfClass._audioplayerInner) {

          selfClass._audioplayerInner.append(selfClass.cthis.children('.meta-artist'));
        }
      }

    }


    // -- we need meta-artist at this point
    selfClass._audioplayerInner.find('.meta-artist').eq(0).wrap('<div class="meta-artist-con"></div>');

    //console.log('ceva');

    selfClass._metaArtistCon = selfClass._audioplayerInner.find('.meta-artist-con').eq(0);


    var o = selfClass.initOptions;


    if (selfClass._apControls.find('.ap-controls-right').length > 0) {
      selfClass._apControlsRight = selfClass.cthis.find('.ap-controls-right').eq(0);
    }
    if (selfClass._apControls.find('.ap-controls-left').length > 0) {
      selfClass._apControlsLeft = selfClass._apControls.find('.ap-controls-left').eq(0);
    }


    if (o.design_skin == 'skin-pro') {
      selfClass._apControlsRight = selfClass.cthis.find('.con-controls--right').eq(0)
    }

    if (o.design_skin == 'skin-wave') {


      if (selfClass.cthis.find('.dzsap-repeat-button').length) {
        selfClass.cthis.find('.dzsap-repeat-button').after(selfClass._metaArtistCon);
      } else {


        if (selfClass.cthis.find('.dzsap-loop-button').length && selfClass.cthis.find('.dzsap-loop-button').eq(0).parent().hasClass('feed-dzsap-for-extra-html-right') == false) {
          selfClass.cthis.find('.dzsap-loop-button').after(selfClass._metaArtistCon);
        } else {

          selfClass._conPlayPauseCon.after(selfClass._metaArtistCon);
        }
      }

      if (selfClass.skinwave_mode == 'alternate') {
        selfClass._apControlsRight.before(selfClass._metaArtistCon);
      }


    }
    if (o.design_skin == 'skin-aria') {
      selfClass._apControlsRight.prepend(selfClass._metaArtistCon);

    }
    if (o.design_skin == 'skin-redlights' || o.design_skin == 'skin-steel') {

      selfClass._apControlsRight.prepend(selfClass._metaArtistCon);


    }
    if (o.design_skin == 'skin-silver') {
      selfClass._apControlsRight.append(selfClass._metaArtistCon);
    }
    if (o.design_skin == 'skin-default') {
      selfClass._apControlsRight.before(selfClass._metaArtistCon);
    }


  }


}


exports.hexToRgb = hexToRgb;
exports.handle_keypresses = handle_keypresses;
exports.MD5 = MD5;
exports.select_all = select_all;
exports.dzsap_generate_keyboard_tooltip = dzsap_generate_keyboard_tooltip;
exports.htmlEncode = htmlEncode;
exports.dzsap_is_mobile = dzsap_is_mobile;
exports.is_ios = is_ios;
exports.is_android = is_android;
exports.is_android_good = is_android_good;
exports.get_query_arg = get_query_arg;
exports.add_query_arg = add_query_arg;
exports.can_history_api = can_history_api;
exports.dzs_clean_string = dzs_clean_string;
exports.formatTime = formatTime;
exports.can_canvas = can_canvas;


exports.dzsap_generate_keyboard_controls = dzsap_generate_keyboard_controls;


/**
 * deprecated
 * @param argarray
 * @returns {boolean}
 */
function drawSpectrum(argarray) {

  // todo: no functino ?
  //console.log(array);
  //console.log()
  //console.log($('.scrub-bg-canvas').eq(0).get(0).width, canw);

  //console.log(_scrubBgCanvas.get(0).width, _scrubBgCanvas.width())


  // console.log(_scrubbarbg_canvas);
  if (selfClass._scrubbarbg_canvas) {

    // dzsapWaveFunctions.draw_canvas(selfClass._scrubbarbg_canvas.get(0), argarray, o.design_wave_color_bg, {call_from: 'draw_spectrum_pcm_bg'});
    // draw_canvas(_scrubbarprog_canvas.get(0), argarray, o.design_wave_color_progress);
  }

  return false;


};

exports.convertPluginOptionsToFinalOptions = function (elThis, defaultOptions, argOptions = null, searchedAttr = 'data-options') {

  var finalOptions = null;
  var tempOptions = {};
  var sw_setFromJson = false;
  var _elThis = jQuery(elThis);

  if (argOptions && typeof argOptions == 'object') {
    tempOptions = argOptions;
  } else {

    if (_elThis.attr(searchedAttr)) {
      try {
        tempOptions = JSON.parse(_elThis.attr(searchedAttr));
        sw_setFromJson = true;
      } catch (err) {

        console.log('err - ', err);
      }
    }
    if (!sw_setFromJson) {

      if (typeof argOptions == 'undefined' || !argOptions) {
        if (typeof _elThis.attr(searchedAttr) != 'undefined' && _elThis.attr('data-options') != '') {
          var aux = _elThis.attr(searchedAttr);
          aux = 'var aux_opts = ' + aux;
          eval(aux);
          tempOptions = Object.assign({}, aux_opts);
        }
      }
    }
  }
  finalOptions = Object.assign(defaultOptions, tempOptions);

  return finalOptions;
}

exports.generateFakeArrayForPcm = function () {

  //console.log('generateFakeArray()');
  var maxlen = 256;

  var arr = [];

  for (var it1 = 0; it1 < maxlen; it1++) {
    arr[it1] = Math.random() * 100;

  }

  return arr;
}




exports.scrubbar_modeWave_clearObsoleteCanvas = scrubbar_modeWave_clearObsoleteCanvas;
function scrubbar_modeWave_clearObsoleteCanvas(selfClass){
  if(selfClass._scrubbar){
    selfClass._scrubbar.find('.scrubbar-type-wave--canvas.transitioning-out').remove();
  }
}
exports.scrubbar_modeWave_setupCanvas = scrubbar_modeWave_setupCanvas;
function scrubbar_modeWave_setupCanvas(pargs, selfClass){

  var margs = {
    prepare_for_transition_in: false
  }

  if (pargs) {
    margs = Object.assign(margs, pargs);
  }

  var struct_scrubBg_str = '';
  var struct_scrubProg_str = '';
  var aux_selector = '';
  var o = selfClass.initOptions;


  struct_scrubBg_str = '<canvas class="scrubbar-type-wave--canvas scrub-bg-img';
  struct_scrubBg_str += '" ></canvas>';

  struct_scrubProg_str = '<canvas class="scrubbar-type-wave--canvas scrub-prog-img';
  struct_scrubProg_str += '" ></canvas>';

  selfClass._scrubbar.children('.scrub-bg').eq(0).append(struct_scrubBg_str);
  selfClass._scrubbar.children('.scrub-prog').eq(0).append(struct_scrubProg_str);


  selfClass._scrubbarbg_canvas = selfClass._scrubbar.find('.scrub-bg-img').last();
  selfClass._scrubbarprog_canvas = selfClass._scrubbar.find('.scrub-prog-img').last();

  if (o.skinwave_enableSpectrum == 'on') {
    selfClass._scrubbarprog_canvas.hide();
  }


  if (margs.prepare_for_transition_in) {
    selfClass._scrubbarbg_canvas.addClass('preparing-transitioning-in');
    selfClass._scrubbarprog_canvas.addClass('preparing-transitioning-in');
    setTimeout(()=>{
      selfClass._scrubbarbg_canvas.addClass('transitioning-in');
      selfClass._scrubbarprog_canvas.addClass('transitioning-in');
    },20);
  }
}
