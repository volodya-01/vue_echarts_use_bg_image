/*
 * Author: Audio Player with Playlist
 * Website: http://digitalzoomstudio.net/
 * Portfolio: http://bit.ly/nM4R6u
 * Version: 5.73
 * */


if (!(window.dzsap_init_calls)) {
  window.dzsap_init_calls = [];
}


const dzsHelpers = require('./js_common/_dzs_helpers');
const dzsapHelpers = require('./jsinc/_dzsap_helpers');
const dzsapSvgs = require('./jsinc/_dzsap_svgs');
const dzsapPlaylist = require('./jsinc/_dzsap_playlist');
const dzsapAjax = require('./jsinc/_dzsap_ajax');
const dzsapMisc = require('./jsinc/_dzsap_misc');
const dzsapStructure = require('./jsinc/components/_structure');
const dzsapWaveFunctions = require('./jsinc/wave-render/_wave-render-functions');
const ConstantsDzsAp = require('./configs/_constants').constants;
const dzsapMediaFuncs = require('./jsinc/media/_media_functions');


var dzsap_list = []; // -- this is for the players
var dzsap_yt_list = []; // -- this is for the youtube players
var dzsap_ytapiloaded = false;
var dzsap_globalidind = 20;

var dzsap_list_for_sync_sw_built = false;
var dzsap_list_for_sync_inter_build = 0;

window.loading_multi_sharer = false;

window.dzsap_moving_playlist_item = false;
window.dzsap_playlist_con = null;
window.dzsap_playlist_item_moving = null;
window.dzsap_playlist_item_target = null;

window.dzsap_player_interrupted_by_dzsap = null;
window.dzsap_audio_ctx = null;
window.dzsap__style = null;
window.dzsap_sticktobottom_con = null;

window.dzsap_self_options = {};

window.dzsap_generating_pcm = false;
window.dzsap_box_main_con = null;
window.dzsap_lasto = null;
window.dzsap_wavesurfer_load_attempt = 0;
window.dzsap_list_for_sync_players = []; // -- used for next .. prev .. footer playlist


window.dzsap_player_index = 0; // -- the player index on the page


class DzsAudioPlayer {

  constructor(argThis, argOptions, $) {

    this.argThis = argThis;
    this.argOptions = argOptions;
    this.$ = $;

    this.ajax_view_submitted = 'auto';
    this.increment_views = 0;
    this.the_player_id = '';
    this.currIp = '127.0.0.1';
    this.index_extrahtml_toloads = 0;
    this.starrating_alreadyrated = -1;
    this.data_source = '';
    this._actualPlayer = null;

    this.urlToAjaxHandler = null;


    // -- time vars
    this.sample_time_start = 0;
    this.sample_time_end = 0;
    this.sample_time_total = 0;


    this.pseudo_sample_time_start = 0
    this.pseudo_sample_time_end = 0
    this.pseudo_sample_time_total = 0
    this.playlist_inner_currNr = 0

    this.timeCurrent = 0;
    this.timeTotal = 0;

    this._audioplayerInner = null;
    this._metaArtistCon = null;
    this._conControls = null;
    this._conPlayPauseCon = null;
    this._apControls = null;
    this._apControlsLeft = null;
    this._apControlsRight = null;
    this._commentsHolder = null;
    this.$mediaNode_ = null;
    this._scrubbar = null;
    this._scrubbarbg_canvas = null;
    this._scrubbarprog_canvas = null;
    this._feed_fakeButton = null;
    this._sourcePlayer = null;
    this.$theMedia = null;
    this.$conPlayPause = null;
    this.$conControls = null;
    this.$$scrubbProg = null;
    this.$controlsVolume = null;
    this.$currTime = null;
    this.$totalTime = null;
    this.$watermarkMedia_ = null;

    this.audioType = 'normal';
    this.skinwave_mode = 'normal';
    this.action_audio_comment = null; // -- set a outer ended function ( for example for tracking your analytics

    this.commentPositionPerc = 0;// --the % at which the comment will be placed

    this.spectrum_audioContext = null;
    this.spectrum_audioContextBufferSource = null;
    this.spectrum_audioContext_buffer = null;
    this.spectrum_mediaElementSource = null;
    this.spectrum_analyser = null;
    this.spectrum_gainNode = null;

    this.isMultiSharer = false;

    this.lastArray = null;
    this.last_lastArray = null;

    this.player_playing = false;
    this.playerIsLoaded = false;

    this.actualDataTypeOfMedia = 'audio';

    this.youtube_retryPlayTimeout = 0;
    this.lastTimeInSeconds = 0;


    this.settings_extrahtml_in_float_right = ''; // -- the html to have in right of controls

    // -- pcm
    this.identifier_pcm = ''; // -- can be either player id or source if player id is not set
    this.isRealPcm = false;
    this.isPcmTryingToGenerate = false;
    this.isPcmPromisingToGenerateOnMetaLoad = false // -- we are promising generating on meta load
    this.isPlayPromised = false // -- we are promising generating on meta load
    this.isCanvasFirstDrawn = false // -- the first draw on canvas

    this.src_real_mp3 = '';
    this.original_real_mp3 = '' // -- this is the original real mp3 for sainvg and identifying in the database

    // -- theme specific
    this.skin_minimal_canvasplay = null;


    this.classInit();
  }

  classInit() {
    // console.log('this -> ', this);

    // console.log('process - ', process);

    var $ = this.$;
    var o = this.argOptions;
    var cthis = $(this.argThis);

    var selfClass = this;


    selfClass.cthis = cthis;
    selfClass.initOptions = o;

    var cthisId = 'ap1'
      , cclass = ''
    ;
    var currNr = -1;
    var i = 0;
    var ww, wh, tw, th, cw // -- controls width
      , ch // -- controls height
      , sw = 0 // -- scrubbar width
      ,
      sh, spos = 0 //== scrubbar prog pos
    ;
    var _commentsSelector = null
      , _theThumbCon, _scrubBgReflect = null
      , _extra_html
      , _playlistTooltip = null
      , _scrubBgCanvas = null,
      _scrubBgCanvasCtx = null,
      _commentsWriter = null;
    var busy = false,
      muted = false,
      yt_inited = false,
      destroyed = false,
      google_analytics_sent_play_event = false,
      destroyed_for_rebuffer = false
      , loop_active = false // -- if loop_active the track will loop
      , is_sample = false
      , dzsap_can_canvas = false
      , curr_time_first_set = false
      , scrub_showing_scrub_time = false
      , setuped_listeners = false
      , setuped_media = false // -- linked with loaded
      , safe_to_change_track = false // -- only after 2 seconds of init is it safe to change track
    ;
    var last_time_total = 0

      , time_curr_for_visual = -1
      , time_curr_for_real = -1

      , time_total_for_visual = -1
      , time_total_for_real = -1

      , real_time_curr = 0 // -- we need these for sample..
      , real_time_total = 0 // -- we need these for sample..
      , sample_perc_end = 0
      , attempt_reload = 0
      , currTime_outerWidth = 0
      , media_changed_index = 0
      , player_index_in_gallery = -1 // -- the player index in gallery
    ;

    var volume_lastVolume = 1,
      last_vol_before_mute = 1
    ;
    var inter_check
      , inter_checkReady
      , inter_check_yt_ready
      , inter_audiobuffer_workaround_id = 0
      , inter_ended = 0
      , inter_60_secs_contor = 0
      , inter_trigger_resize;
    var data_station_main_url = ''
      , id_real_mp3 = '' // -- the real source of the mp3
    ;

    var res_thumbh = false
      , debug_var = false
      , debug_var2 = false
      , volume_dragging = false
      , volume_set_by_user = false // -- this shows if the user actioned on the volume
      , is_under_400 = false
      , sent_received_time_total = false
      , ended = false
      , youtube_cmedia_converted = false
      , sw_mouse_over = false


    ; // resize thumb height

    var _sticktobottom = null;

    var skin_minimal_button_size = 0;

    // -- touch controls
    var scrubbar_moving = false
      , scrubbar_moving_x = 0
      , aux3 = 0
    ;

    var radio_update_artist_name = false;
    var radio_update_song_name = false;


    var _feed_extra_html = null;
    var dataSrc = '';
    var canw = 100;
    var canh = 100;
    var barh = 100,
      scrubbar_h = 75
      , design_thumbh
    ;


    var _commentsChildren = null;

    var str_audio_element = '';


    var controls_left_pos = 0;
    var controls_right_pos = 0;


    var yt_curr_id = ''

    var starrating_index = 0,
      starrating_nrrates = 0;

    var playfrom = 'off',
      playfrom_ready = false
    ;


    var defaultVolume = 1;

    var action_audio_end = null
      , action_audio_play = null
      , action_audio_play2 = null
      , action_audio_pause = null


    var sw_suspend_enter_frame = true
      , sw_spectrum_fakeit = 'auto'
      , sw_spectrum_fakeit_decided = '' // -- shows where fakeit was decided
    ;

    var type_normal_stream_type = ''; // -- normal icecast or shoutcast


    var duration_viy = 20;
    var begin_viy = 0;
    var change_viy = 0;


    var draw_canvas_inter = 0;

    // -- temp functions

    var func_audio_error = null;


    // console.log(cthis, o);


    window.dzsap_player_index++;


    settle_sample_times();


    selfClass.keyboard_controls = dzsapHelpers.dzsap_generate_keyboard_controls();
    cthis.addClass('preload-method-' + o.preload_method);

    o.wavesurfer_pcm_length = Number(o.wavesurfer_pcm_length);

    if (o.skinwave_preloader_code == 'default') {
      o.skinwave_preloader_code = dzsapSvgs.svg_preloader_code;
    }


    //console.log(sample_perc_start,sample_perc_end);

    o.settings_trigger_resize = parseInt(o.settings_trigger_resize, 10);
    o.watermark_volume = parseFloat(o.watermark_volume);

    selfClass.settings_extrahtml_in_float_right = o.settings_extrahtml_in_float_right;

    if (cthis.children('.extra-html-in-controls-right').length > 0) {


      selfClass.settings_extrahtml_in_float_right += cthis.children('.extra-html-in-controls-right').eq(0).html();


    }


    if (cthis.children('.extra-html-in-controls-left').length > 0 && o.settings_extrahtml_in_float_left == '') {
      o.settings_extrahtml_in_float_left = cthis.children('.extra-html-in-controls-left').eq(0).html();


    }

    if (selfClass.settings_extrahtml_in_float_right) {

      selfClass.settings_extrahtml_in_float_right = String(selfClass.settings_extrahtml_in_float_right).replace(/{{svg_share_icon}}/g, dzsapSvgs.svg_share_icon);
    }


    init();

    function init() {
      //console.log(typeof(o.parentgallery)=='undefined');


      // console.log('cthis - - on init - ', cthis);


      if (cthis.hasClass('dzsap-inited')) {
        return false;
      }

      selfClass.youtube_checkReady = youtube_checkReady;
      selfClass.play_media = play_media;
      selfClass.scrubbar_reveal = scrubbar_reveal;
      selfClass.calculate_dims_time = calculate_dims_time;
      selfClass.struct_generate_thumb = struct_generate_thumb;
      selfClass.check_multisharer = check_multisharer;
      selfClass.setup_structure_scrub = setup_structure_scrub;
      selfClass.setup_structure_sanitizers = setup_structure_sanitizers;
      selfClass.setup_structure_extras = setup_structure_extras;
      selfClass.destroy_cmedia = destroy_cmedia;

      cthis.css({'opacity': ''});
      cthis.addClass('dzsap-inited');
      window.dzsap_player_index++;


      // console.log('cthis - ',cthis,o);


      dzsapHelpers.configureAudioPlayerOptionsInitial(cthis, o, selfClass);


      (dzsapHelpers.player_detect_skinwave_mode.bind(selfClass))()




      if (o.design_skin == 'skin-default') {
        if (o.design_thumbh == 'default') {
          design_thumbh = cthis.height() - 40;
          res_thumbh = true;
        }
      }


      // console.log('o.mobile_delete -> ',o.mobile_delete, cthis);
      if (dzsapHelpers.dzsap_is_mobile()) {
        $('body').addClass('is-mobile');
      }
      if (o.mobile_delete == 'on') {
        if (dzsapHelpers.dzsap_is_mobile()) {
          var _con = null;
          if (cthis.parent().parent().hasClass('dzsap-sticktobottom')) {
            _con = cthis.parent().parent();
          }
          if (_con) {
            if (_con.prev().hasClass("dzsap-sticktobottom-placeholder")) {
              _con.prev().remove();
            }

            _con.remove();
          }


          cthis.remove();


          return false;
        }
      }

      dzsap_can_canvas = dzsapHelpers.can_canvas();

      apply_skinwave_mode_class();


      // console.log(o.design_wave_color_bg, o.design_wave_color_prog); 1


      if (o.design_thumbh == 'default') {
        design_thumbh = 200;
      }


      //                console.log(selfClass.the_player_id, o.skinwave_comments_enable, o.skinwave_comments_playerid);

      if (o.skinwave_comments_playerid == '') {


        if (typeof (cthis.attr('id')) != 'undefined') {
          selfClass.the_player_id = cthis.attr('id');
        }
        if (cthis.attr('data-playerid')) {
          selfClass.the_player_id = cthis.attr('data-playerid');
        }
      } else {
        selfClass.the_player_id = o.skinwave_comments_playerid;

        if (!(cthis.attr('id'))) {
          cthis.attr('id', selfClass.the_player_id);
        }
      }

      // console.log('selfClass.the_player_id - ',selfClass.the_player_id);

      if (cthis.attr('data-playerid')) {

      } else {
        // console.log('selfClass.the_player_id - ',selfClass.the_player_id);
        if (selfClass.the_player_id == '') {
          selfClass.the_player_id = dzsapHelpers.dzs_clean_string(cthis.attr('data-source'));
          cthis.attr('data-playerid', selfClass.the_player_id);
        }
      }


      if (isNaN(Number(selfClass.the_player_id))) {
        // TODO: maybe if we except only number for wp database, maybe convert ascii to number


      }


      if (selfClass.the_player_id == '') {
        o.skinwave_comments_enable = 'off';

      }

      // console.log('o.skinwave_comments_enable - ',o.skinwave_comments_enable);


      // -- disable fakeplayer on mobile for some reason
      if (o.mobile_disable_fakeplayer == 'on' && dzsapHelpers.dzsap_is_mobile()) {
        selfClass.cthis.attr('data-fakeplayer', '');
      }

      if (cthis.attr('data-fakeplayer')) {
        dzsapHelpers.player_determineActualPlayer(selfClass.cthis, selfClass);
      }

      selfClass.cthis.addClass('scrubbar-type-' + o.scrubbar_type);


      if (cthis.children('.extra-html').length > 0 && o.settings_extrahtml == '') {
        o.settings_extrahtml = cthis.children('.extra-html').eq(0).html();

        _feed_extra_html = cthis.children('.extra-html').eq(0);

        // console.log('o.settings_extrahtml - ',o.settings_extrahtml);


        var re_ratesubmitted = /{\{ratesubmitted=(.?)}}/g;
        if (re_ratesubmitted.test(String(o.settings_extrahtml))) {
          re_ratesubmitted.lastIndex = 0;
          var auxa = (re_ratesubmitted.exec(String(o.settings_extrahtml)));


          selfClass.starrating_alreadyrated = auxa[1];

          o.settings_extrahtml = String(o.settings_extrahtml).replace(re_ratesubmitted, '');

          if (o.parentgallery && $(o.parentgallery).get(0) != undefined && $(o.parentgallery).get(0).api_player_rateSubmitted != undefined) {
            $(o.parentgallery).get(0).api_player_rateSubmitted();
          }
        }


        selfClass.cthis.children('.extra-html').remove();
      }

      if (o.construct_player_list_for_sync == 'on') {
        if (dzsap_list_for_sync_sw_built == false) {
          dzsap_list_for_sync_players = [];

          dzsap_list_for_sync_sw_built = true;

          $('.audioplayer.is-single-player,.audioplayer-tobe.is-single-player').each(function () {
            var _t23 = $(this);


            if (_t23.hasClass('dzsap_footer')) {
              return;
            }

            // console.log(_t23);

            if (_t23.attr('data-do-not-include-in-list') != 'on') {

              dzsap_list_for_sync_players.push(_t23);
            }
          })

          // console.log(dzsap_list_for_sync_players);

          clearTimeout(dzsap_list_for_sync_inter_build);

          dzsap_list_for_sync_inter_build = setTimeout(function () {
            dzsap_list_for_sync_sw_built = false;
          }, 500);

        }
      }

      // console.log('dzsap_list_for_sync_players - ',dzsap_list_for_sync_players);


      playfrom = o.playfrom;

      if (dzsHelpers.isValid(cthis.attr('data-playfrom'))) {
        playfrom = cthis.attr('data-playfrom');
      }

      if (isNaN(parseInt(playfrom, 10)) == false) {
        playfrom = parseInt(playfrom, 10);
      }


      if (playfrom == 'off' || playfrom == '') {
        if (dzsapHelpers.get_query_arg(window.location.href, 'audio_time')) {
          playfrom = sanitize_from_point_time(dzsapHelpers.get_query_arg(window.location.href, 'audio_time'));
        }
      }

      // console.log('playfrom - ',playfrom);


      selfClass.identifier_pcm = selfClass.the_player_id; // -- the pcm identifier to send via ajax


      var _feed_obj = null;

      if (selfClass._feed_fakeButton) {
        _feed_obj = selfClass._feed_fakeButton;
      } else {
        if (selfClass._sourcePlayer) {
          _feed_obj = selfClass._sourcePlayer;
        } else {
          _feed_obj = null;
        }
      }


      if (selfClass.identifier_pcm == 'dzs_footer') {
        selfClass.identifier_pcm = dzsapHelpers.dzs_clean_string(cthis.attr('data-source'));
      }

      if (_feed_obj) {

        if (_feed_obj.attr('data-playerid')) {

          selfClass.identifier_pcm = _feed_obj.attr('data-playerid');
        } else {

          if (_feed_obj.attr('data-source')) {

            selfClass.identifier_pcm = _feed_obj.attr('data-source');
          }
        }
      }

      // console.log('inited - ', selfClass.the_player_id, ' skinwave_comments_enable - ', o.skinwave_comments_enable, cthis);

      if (cthis.attr('data-type') == 'youtube') {
        o.type = 'youtube';

        selfClass.audioType = 'youtube';
      }
      if (cthis.attr('data-type') == 'soundcloud') {
        o.type = 'soundcloud';
        selfClass.audioType = 'soundcloud';

        o.skinwave_enableSpectrum = 'off';
        cthis.removeClass('skin-wave-is-spectrum');
      }
      if (cthis.attr('data-type') == 'mediafile') {
        o.type = 'audio';
        selfClass.audioType = 'audio';
      }

      // todo: move shoutcast
      if (cthis.attr('data-type') == 'shoutcast') {
        o.type = 'shoutcast';
        selfClass.audioType = 'audio';
        o.disable_timer = 'on';
        o.skinwave_enableSpectrum = 'off';
        // -- might still use it for skin-wave

        if (o.design_skin == 'skin-default') {
          o.disable_scrub = 'on';
        }
        //                    o.disable_scrub = 'on';
      }


      if (selfClass.audioType == 'audio' || selfClass.audioType == 'normal' || selfClass.audioType == '') {
        selfClass.audioType = 'selfHosted';
      }


      type_normal_stream_type = '';

      // console.log('type - ',type, cthis.attr('data-streamtype'));


      if (selfClass.audioType == 'selfHosted') {
        if (cthis.attr('data-streamtype') && cthis.attr('data-streamtype') != 'off') {
          type_normal_stream_type = cthis.attr('data-streamtype');
          data_station_main_url = cthis.attr('data-source');
          cthis.addClass('is-radio-type');

        } else {
          type_normal_stream_type = '';
        }
      }

      // -- no shoutcast autoupdate at the moment 2 3 4 5 6 7 8
      if (type_normal_stream_type == 'shoutcast') {
        // type_normal_stream_type = '';

        // -- todo: we
      }


      // console.log('type_normal_stream_type - ', type_normal_stream_type);

      selfClass.src_real_mp3 = cthis.attr('data-source');
      if (selfClass.audioType === 'selfHosted') {
        selfClass.src_real_mp3 = cthis.attr('data-source');
      }

      // -- we disable the function if audioplayer inited
      if (cthis.hasClass('audioplayer')) {
        return;
      }
      //console.log('ceva');

      if (cthis.attr('id') != undefined) {
        cthisId = cthis.attr('id');
      } else {
        cthisId = 'ap' + dzsap_globalidind++;
      }


      yt_curr_id = 'ytplayer_' + cthisId;


      cthis.removeClass('audioplayer-tobe');
      cthis.addClass('audioplayer');

      draw_scrub_prog();
      setTimeout(function () {
        draw_scrub_prog()
      }, 1000);


      if (cthis.find('.the-comments').length > 0 && cthis.find('.the-comments').eq(0).children().length > 0) {
        _commentsChildren = cthis.find('.the-comments').eq(0).children();
      } else {
        if (o.skinwave_comments_retrievefromajax == 'on') {
          var data = {
            action: 'dzsap_get_comments',
            postdata: '1',
            playerid: selfClass.the_player_id
          };


          // -- get comments
          if (selfClass.urlToAjaxHandler) {
            $.ajax({
              type: "POST",
              url: selfClass.urlToAjaxHandler,
              data: data,
              success: function (response) {
                //if(typeof window.console != "undefined" ){ console.log('Ajax - get - comments - ' + response); }

                cthis.prependOnce('<div class="the-comments"></div>', '.the-comments');

                if (response.indexOf('a-comment') > -1) {

                  response = response.replace(/a-comment/g, 'a-comment dzstooltip-con');
                  response = response.replace(/dzstooltip arrow-bottom/g, 'dzstooltip arrow-from-start transition-slidein arrow-bottom');

                }
                cthis.find('.the-comments').eq(0).html(response);

                _commentsChildren = cthis.find('.the-comments').eq(0).children();

                setup_controls_commentsHolder({call_from: 'ajax_complete'});

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


      // -- try to get pcm data via ajax
      // console.log(cthis);
      if (o.skinwave_wave_mode == 'canvas' && (o.design_skin == 'skin-wave' || cthis.attr('data-fakeplayer'))) {
        dzsapWaveFunctions.wave_mode_canvas_try_to_get_pcm(selfClass);
      }


      //===ios does not support volume controls so just let it die
      //====== .. or autoplay FORCE STAFF


      if (dzsapHelpers.is_ios() || dzsapHelpers.is_android()) {
        o.autoplay = 'off';
        o.disable_volume = 'on';
        if (o.cue == 'off') {
          o.cue = 'on';
        }
        o.cue = 'on';
      }


      // console.log('o.autoplay here - ',o.autoplay, cthis);  22

      if (o.cue == 'off') {

        // -- cue is forcing autoplay on
        cthis.addClass('cue-off');
        o.autoplay = 'on';
      }

      // console.log('o.autoplay here - ',o.autoplay, cthis);

      if (selfClass.audioType == 'youtube') {

        load_yt_api();
      }
      selfClass.data_source = cthis.attr('data-source');


      //====sound cloud INTEGRATION //
      if (cthis.attr('data-source') != undefined && String(cthis.attr('data-source')).indexOf('https://soundcloud.com/') > -1) {
        selfClass.audioType = 'soundcloud';
      }
      //console.log(o.type);
      if (selfClass.audioType == 'soundcloud') {
        dzsapMisc.retrieve_soundcloud_url(selfClass);

        //                    type='audio';
      }
      // -- END soundcloud INTEGRATION//


      dzsapStructure.setup_structure(selfClass); //  -- inside init()

      //console.log(cthis, dzsapHelpers.is_ios(), o.type);
      //trying to access the youtube api with ios did not work


      //                console.log(o.design_skin, type, o.skinwave_comments_enable, o.design_skin=='skin-wave' && (type=='audio'||type=='soundcloud') && o.skinwave_comments_enable=='on');

      //console.log(o.design_skin, type, o.skinwave_comments_enable)

      if (o.design_skin == 'skin-wave' && (selfClass.audioType == 'selfHosted' || selfClass.audioType == 'soundcloud' || selfClass.audioType == 'fake') && o.skinwave_comments_enable == 'on') {

        var str_comments_holder = '<div class="comments-holder">';


        if (o.skinwave_comments_links_to) {

          str_comments_holder += '<a href="' + o.skinwave_comments_links_to + '" target="_blank" class="the-bg"></a>';
        } else {

          str_comments_holder += '<div class="the-comments-holder-bg"></div>';
        }


        str_comments_holder += '</div><div class="clear"></div><div class="comments-writer"><div class="comments-writer-inner"><div class="setting"><div class="setting-label"></div><textarea name="comment-text" placeholder="Your comment.." type="text" class="comment-input"></textarea><div class="float-right"><button class="submit-ap-comment dzs-button-dzsap float-right">Submit</button><button class="cancel-ap-comment dzs-button-dzsap float-right">Cancel</button></div><div class="overflow-it"><input placeholder="Your email.." name="comment-email" type="text" class="comment-input"/></div><div class="clear"></div></div></div></div>';


        if (selfClass.skinwave_mode == 'normal') {
          selfClass._apControls.appendOnce(str_comments_holder);
        } else {
          selfClass.cthis.appendOnce(str_comments_holder);
        }
        selfClass._commentsHolder = cthis.find('.comments-holder').eq(0);
        _commentsWriter = cthis.find('.comments-writer').eq(0);


        setup_controls_commentsHolder({call_from: 'default'});

        // console.log('selfClass._commentsHolder -> ',selfClass._commentsHolder);
        // selfClass._commentsHolder.on('click', '.the-comments-holder-bg', click_comments_bg);
        selfClass._commentsHolder.on('click', click_comments_bg);
        _commentsWriter.find('.cancel-ap-comment').bind('click', click_cancel_comment);
        _commentsWriter.find('.submit-ap-comment').bind('click', click_submit_comment);
      }


      if (o.settings_extrahtml != '') {


        // console.log('_feed_extra_html - ',_feed_extra_html);
        if (_feed_extra_html) {


          // console.log('_feed_extra_html.attr(\'data-playerid\') - ' , _feed_extra_html.attr('data-playerid'));
        }
        cthis.append('<div class="extra-html">' + o.settings_extrahtml + '</div>');

        _extra_html = cthis.children('extra-html');


        if (_feed_extra_html && _feed_extra_html.attr('data-playerid')) {
          _extra_html = _feed_extra_html.attr('data-playerid');
        }


        if (_feed_extra_html && _feed_extra_html.attr('data-posttype')) {
          _extra_html = _feed_extra_html.attr('data-posttype');
        }


      }


      //console.log();


      if (selfClass.audioType == 'selfHosted') {


        //                    img = document.createElement('img'); my source
        //                    img.onerror = function(){
        //                        return;
        //                        if(cthis.children('.meta-artist').length>0){
        //                            selfClass._audioplayerInner.children('.meta-artist').html('audio not found...');
        //                        }else{
        //                            selfClass._audioplayerInner.append('<div class="meta-artist">audio not found...</div>');
        //                            selfClass._audioplayerInner.children('.meta-artist').eq(0).wrap('<div class="meta-artist-con"></div>');
        //                        }
        //                    };
        //                    img.src= cthis.attr('data-source');

      }

      if (o.autoplay == 'on' && o.cue == 'on') {
        selfClass.increment_views = 1;
      }


      if (selfClass.audioType == 'selfHosted' && dzsapHelpers.is_ios() && 1 == 0) {
        if (cthis.height() < 200) {
          cthis.height(200);
        }
        aux = '<iframe width="100%" height="100%" src="//www.youtube.com/embed/' + selfClass.data_source + '" frameborder="0" allowfullscreen></iframe>';
        cthis.html(aux);
        return;
      } else {
        // -- soundcloud will setupmedia when api done

        // console.log(o.cue, type);
        if (o.cue == 'on' && selfClass.audioType != 'soundcloud') {


          if (dzsapHelpers.is_android() || dzsapHelpers.is_ios()) {

            cthis.find('.playbtn').bind('click', play_media);
          }


          // console.log('source - ',cthis.attr('data-source'), dataSrc);


          dataSrc = cthis.attr('data-source');

          if (dataSrc.indexOf('{{generatenonce}}') > -1) {


            var original_id = '';

            var aux = /id=(\d*?)/g.exec(dataSrc);

            if (aux) {

              original_id = aux[1];
            }

            // -- generate nonce
            $.ajax({
              type: "POST",
              url: dataSrc,
              data: {},
              success: function (response) {
                if (response) {

                  if (response.indexOf(original_id) > -1) {

                    cthis.attr('data-source', response);

                    setup_media({'called_from': 'nonce generated'});
                  }
                }
              }
            })
            ;


          } else {

            // console.log('type_normal_stream_type - ',type_normal_stream_type);
            if (type_normal_stream_type != 'icecast') {
              setup_media({'called_from': 'normal setup media .. --- icecast must wait'});
              if (type_normal_stream_type == 'shoutcast') {
                // -- we can just set an interval for retrieving shoutcast current artist
                setInterval(function () {
                    icecast_shoutcast_get_data()
                  }
                  , 10000
                );
              }
            } else {
              if (type_normal_stream_type == 'icecast') {


                // -- if we have icecast we can update currently playing song
                setInterval(function () {
                    icecast_shoutcast_get_data()
                  }
                  , 10000
                );
              }
            }

          }


        } else {


          //console.log(' -- cue is of so set autoplay to on')
          // o.autoplay = 'on';
          cthis.find('.playbtn').bind('click', click_for_setup_media);
          cthis.find('.scrubbar').bind('click', click_for_setup_media);
          handleResize();
        }

      }

      setInterval(function () {
        debug_var = true;
      }, 3000);

      setInterval(function () {
        debug_var2 = true;
      }, 2000);

      // -- we call the api functions here
      //console.log('api sets');


      if (cthis.parent().hasClass('dzsap-sticktobottom')) {

        _sticktobottom = cthis.parent();

      }
      if (cthis.parent().parent().hasClass('dzsap-sticktobottom')) {

        _sticktobottom = cthis.parent().parent();
      }


      // console.log('_sticktobottom -> ',_sticktobottom, cthis,cthis.parent().attr('class'),cthis.parent().parent().attr('class'));
      if (_sticktobottom) {
        if (cthis.hasClass('theme-dark')) {
          _sticktobottom.addClass('theme-dark');
        }

        setTimeout(function () {

          _sticktobottom.addClass('inited');
        }, 500)
        _sticktobottom.addClass('dzsap-sticktobottom-for-' + o.design_skin);
        _sticktobottom.prev().addClass('dzsap-sticktobottom-for-' + o.design_skin);

        if (o.design_skin == 'skin-wave') {
          _sticktobottom.addClass('dzsap-sticktobottom-for-' + o.design_skin + '--mode-' + selfClass.skinwave_mode)
          _sticktobottom.prev().addClass('dzsap-sticktobottom-for-' + o.design_skin + '--mode-' + selfClass.skinwave_mode)
        }


        cclass = cthis.attr('class');


        var regex = /(skinvariation-.*?)($| )/g

        var aux = regex.exec(cclass);

        // console.log('aux - ',aux);

        if (aux && aux[1]) {

          // console.log("YESSS ",aux[1]);
          _sticktobottom.addClass(aux[1]);
          _sticktobottom.prev().addClass(aux[1]);
        }
      }

      // -- api calls

      cthis.get(0).api_destroy = destroy_it; // -- destroy the player and the listeners
      cthis.get(0).api_play = play_media; // -- play the media
      cthis.get(0).api_get_last_vol = get_last_vol; // -- play the media
      cthis.get(0).api_click_for_setup_media = click_for_setup_media; // -- play the media
      cthis.get(0).api_init_loaded = init_loaded; // -- force resize event
      cthis.get(0).api_handleResize = handleResize; // -- force resize event
      cthis.get(0).api_set_playback_speed = set_playback_speed; // -- set the playback speed, only works for local hosted mp3
      cthis.get(0).api_change_media = change_media; // -- change the media file from the API
      cthis.get(0).api_seek_to_perc = seek_to_perc; // -- seek to percentage ( for example seek to 0.5 skips to half of the song )
      cthis.get(0).api_seek_to = seek_to; // -- seek to percentage ( for example seek to 0.5 skips to half of the song )
      cthis.get(0).api_seek_to_visual = seek_to_visual; // -- seek to perchange but only visually ( does not actually skip to that ) , good for a fake player
      cthis.get(0).api_set_volume = volume_setVolume; // -- set a volume
      cthis.get(0).api_visual_set_volume = volume_setOnlyVisual; // -- set a volume
      cthis.get(0).api_destroy_listeners = destroy_listeners; // -- set a volume

      cthis.get(0).api_pause_media = pause_media; // -- pause the media
      cthis.get(0).api_pause_media_visual = pause_media_visual; // -- pause the media, but only visually
      cthis.get(0).api_play_media = play_media; // -- play the media
      cthis.get(0).api_play_media_visual = play_media_visual; // -- play the media, but only visually
      cthis.get(0).api_handle_end = handle_end; // -- play the media, but only visually
      cthis.get(0).api_change_visual_target = change_visual_target; // -- play the media, but only visually
      cthis.get(0).api_change_design_color_highlight = change_design_color_highlight; // -- play the media, but only visually
      cthis.get(0).api_draw_scrub_prog = draw_scrub_prog; // -- render the scrub progress
      cthis.get(0).api_draw_curr_time = draw_curr_time; // -- render the current time
      cthis.get(0).api_get_times = get_times; // -- refresh the current time
      cthis.get(0).api_check_time = handleTickChange; // -- do actions required in the current frame
      cthis.get(0).api_sync_players_goto_next = sync_players_goto_next; // -- in the sync playlist, go to the next song
      cthis.get(0).api_sync_players_goto_prev = sync_players_goto_prev; // -- in the sync playlist, go to the previous song
      cthis.get(0).api_regenerate_playerlist_inner = function () {
        // -- call with window.dzsap_generate_list_for_sync_players({'force_regenerate': true})
        player_setup_playlist_inner();
      }; // -- regenerate the playlist innter


      // -- get current time
      cthis.get(0).api_get_time_curr = function () {
        return time_curr_for_real;
      };
      // -- set current time
      cthis.get(0).api_set_time_curr = function (arg) {
        time_curr_for_visual = arg;

        curr_time_first_set = true;


        if (selfClass.pseudo_sample_time_start == 0) {

          if (selfClass.sample_time_start > 0) {
            time_curr_for_visual = selfClass.sample_time_start + time_curr_for_visual;

          }
        }

      };
      // -- get total time
      cthis.get(0).api_get_time_total = function () {
        return time_total_for_visual;
      };
      // -- set total time
      cthis.get(0).api_set_time_total = function (arg) {
        time_total_for_visual = arg;
        curr_time_first_set = true;
      };


      cthis.get(0).api_seek_to_0 = function () {
        seek_to(0);
      };
      cthis.get(0).api_step_back = function (arg) {

        if (arg) {

        } else {
          arg = selfClass.keyboard_controls.step_back_amount;
        }
        seek_to(selfClass.timeCurrent - arg);
      }
      cthis.get(0).api_step_forward = function (arg) {

        if (arg) {

        } else {
          arg = selfClass.keyboard_controls.step_back_amount;
        }
        seek_to(selfClass.timeCurrent + arg);
      } // --
      cthis.get(0).api_playback_slow = function (arg) {
        if (selfClass.$mediaNode_ && selfClass.$mediaNode_.playbackRate) {
          selfClass.$mediaNode_.playbackRate = 0.65;
        }
      } // -- slow to 2/3 of the current song
      cthis.get(0).api_playback_reset = function (arg) {
        // seek_to(0);
        if (selfClass.$mediaNode_ && selfClass.$mediaNode_.playbackRate) {
          selfClass.$mediaNode_.playbackRate = 1;
        }
      } // -- playback speed to one


      cthis.get(0).api_set_action_audio_play = function (arg) {
        action_audio_play = arg;
      }; // -- set action on audio play
      cthis.get(0).api_set_action_audio_pause = function (arg) {
        action_audio_pause = arg;
      }; // -- set action on audio pause
      cthis.get(0).api_set_action_audio_end = function (arg) {
        action_audio_end = arg;
        cthis.data('has-action-end', 'on');
      }; // -- set action on audio end
      cthis.get(0).api_set_action_audio_comment = function (arg) {
        selfClass.action_audio_comment = arg;
      }; // -- set the function to call on audio song comment
      cthis.get(0).api_try_to_submit_view = try_to_submit_view; // -- try to submit a new play analytic

      //console.log(cthis.get(0));

      //console.log(o);
      if (o.action_audio_play) {
        action_audio_play = o.action_audio_play;
      }
      ;
      if (o.action_audio_pause) {
        action_audio_pause = o.action_audio_pause;
      }
      ;
      if (o.action_audio_play2) {
        action_audio_play2 = o.action_audio_play2;
      }
      ;

      if (o.action_audio_end) {
        action_audio_end = o.action_audio_end;
        cthis.data('has-action-end', 'on');
      }


      handleTickChange({
        'fire_only_once': true
      });


      setInterval(check_every_05_secs, 500);

      //console.log(o.design_skin);
      if (o.design_skin == 'skin-minimal') {
        handleTickChange({
          'fire_only_once': true
        });
      }


      cthis.on('click', '.dzsap-repeat-button,.dzsap-loop-button,.btn-zoomsounds-download,.zoomsounds-btn-step-backward,.zoomsounds-btn-step-forward,.zoomsounds-btn-go-beginning,.zoomsounds-btn-slow-playback,.zoomsounds-btn-reset, .playlist-menu-item, .tooltip-indicator--btn-footer-playlist', handle_mouse);
      // cthis.on('mouseover',handle_mouse);
      cthis.on('mouseenter', handle_mouse);
      cthis.on('mouseleave', handle_mouse);


      selfClass.$conPlayPause.on('click', click_playpause);
      //cthis.on('click','.con-playpause', click_playpause);


      cthis.on('click', '.skip-15-sec', function () {
        cthis.get(0).api_step_forward(15);
      });


      $(window).on('resize.dzsap', handleResize);
      handleResize();

      if (selfClass._scrubbar && selfClass._scrubbar.get(0)) {

        selfClass._scrubbar.get(0).addEventListener('touchstart', function (e) {
          if (selfClass.player_playing) {

            scrubbar_moving = true;
          }
        }, {passive: true})
      }


      if (type_normal_stream_type == 'icecast' || type_normal_stream_type == 'shoutcast') {


        icecast_shoutcast_get_data();

      }

      // selfClass._scrubbar.on('touchstart', function(e) {
      //     if(selfClass.player_playing){
      //
      //         scrubbar_moving = true;
      //     }
      // }, {passive: true})
      $(document).on('touchmove', function (e) {
        if (scrubbar_moving) {
          scrubbar_moving_x = e.originalEvent.touches[0].pageX;


          aux3 = scrubbar_moving_x - selfClass._scrubbar.offset().left;

          if (aux3 < 0) {
            aux3 = 0;
          }
          if (aux3 > selfClass._scrubbar.width()) {
            aux3 = selfClass._scrubbar.width();
          }

          seek_to_perc(aux3 / selfClass._scrubbar.width());


          return false;
          //console.log(aux3);


        }
      });

      $(document).on('touchend', function (e) {
        scrubbar_moving = false;
      });


      // console.log('skinwave_comments_mode_outer_selector - ',o.skinwave_comments_mode_outer_selector);

      if (o.skinwave_comments_mode_outer_selector) {
        _commentsSelector = $(o.skinwave_comments_mode_outer_selector);

        if (_commentsSelector.data) {

          _commentsSelector.data('parent', cthis);

          if (o.skinwave_comments_account && o.skinwave_comments_account != 'none') {
            _commentsSelector.find('.comment_email,*[name=comment_user]').remove();
          }

          _commentsSelector.on('click', '.comments-btn-cancel,.comments-btn-submit', comments_selector_event);
          _commentsSelector.on('focusin', 'input', comments_selector_event);
          _commentsSelector.on('focusout', 'input', comments_selector_event);

          // console.log(_commentsSelector, _commentsSelector.find('input'));
        } else {
          console.log('%c, data not available .. ', 'color: #990000;', $(o.skinwave_comments_mode_outer_selector));
        }
      }


      // console.log("hmm",cthis);
      cthis.off('click', '.btn-like');
      cthis.on('click', '.btn-like', click_like);


      $(document).on('mousemove', '.star-rating-con', mouse_starrating);
      $(document).on('mouseleave', '.star-rating-con', mouse_starrating);
      $(document).on('click', '.star-rating-con', mouse_starrating);

      setTimeout(function () {

        handleResize();


        if (o.skinwave_wave_mode == 'canvas') {

          calculate_dims_time();

          setTimeout(function () {
            calculate_dims_time();


          }, 100)
        }

      }, 100)


      cthis.find('.btn-menu-state').eq(0).bind('click', click_menu_state);


      //console.log('init');


      cthis.on('click', '.prev-btn,.next-btn', handle_mouse);
    }


    function settle_sample_times() {

      selfClass.sample_time_start = 0;
      selfClass.sample_time_total = 0;
      selfClass.sample_time_start = 0;
      selfClass.pseudo_sample_time_end = 0;

      if (o.sample_time_start) {

      } else {
        if (cthis.attr('data-sample_time_start')) {
          selfClass.sample_time_start = Number(cthis.attr('data-sample_time_start'));
        }
        if (cthis.attr('data-sample_time_end')) {
          selfClass.sample_time_end = Number(cthis.attr('data-sample_time_end'));
        }
        if (cthis.attr('data-pseudo-sample_time_start')) {
          selfClass.pseudo_sample_time_start = Number(cthis.attr('data-pseudo-sample_time_start'));
        }
        if (cthis.attr('data-pseudo-sample_time_end')) {
          selfClass.pseudo_sample_time_end = Number(cthis.attr('data-pseudo-sample_time_end'));
        }
        if (cthis.attr('data-sample_time_total')) {
          selfClass.sample_time_total = Number(cthis.attr('data-sample_time_total'));
        }
      }

      if (isNaN(Number(o.sample_time_start)) == false && Number(o.sample_time_start) > 0) {
        selfClass.sample_time_start = Number(o.sample_time_start);
        if (Number(o.sample_time_end) > 0) {
          selfClass.sample_time_end = Number(o.sample_time_end);

          if (Number(o.sample_time_total) > 0) {
            selfClass.sample_time_total = Number(o.sample_time_total);


            selfClass.sample_perc_start = selfClass.sample_time_start / selfClass.sample_time_total;
            selfClass.sample_perc_end = selfClass.sample_time_end / selfClass.sample_time_total;

          }
        }
      }

      if (selfClass.pseudo_sample_time_start) {
        selfClass.sample_time_start = selfClass.pseudo_sample_time_start;
        selfClass.sample_time_end = selfClass.pseudo_sample_time_end;
      }


      if ((selfClass.sample_time_total && selfClass.sample_time_start) || (selfClass.pseudo_sample_time_start && selfClass.pseudo_sample_time_end)) {
        is_sample = true;
      } else {
        is_sample = false;
      }

    }

    function icecast_shoutcast_get_data() {


      var url = cthis.attr('data-source');

      if (type_normal_stream_type == 'shoutcast') {

        url = dzsapHelpers.add_query_arg(selfClass.urlToAjaxHandler, 'action', 'dzsap_shoutcast_get_streamtitle');
        url = dzsapHelpers.add_query_arg(url, 'source', (dataSrc));
      }


      $.ajax({
        type: "GET",
        url: url,
        crossDomain: true,
        success: function (response) {

          if (response.documentElement && response.documentElement.innerHTML) {
            response = response.documentElement.innerHTML;
          }

          // console.log(' response - ',response);

          var regex_title = '';
          var regex_creator = '';
          var new_title = '';
          var new_artist = '';

          if (type_normal_stream_type == 'icecast') {

            var regex_location = /<location>(.*?)<\/location>/g

            var aux = null;
            if (aux = regex_location.exec(response)) {
              // console.log(' aux - ', aux);

              if (aux[1] != selfClass.data_source) {
                selfClass.data_source = aux[1];
                setup_media({
                  'called_from': 'icecast setup'
                });
              }
            }
          }

          if (radio_update_song_name) {

            if (type_normal_stream_type == 'icecast') {
              regex_title = /<title>(.*?)<\/title>/g

              if (aux = regex_title.exec(response)) {
                new_title = aux[1];
              }
            }
            if (type_normal_stream_type == 'shoutcast') {

              new_title = response;
            }

          }
          if (radio_update_artist_name) {
            if (type_normal_stream_type == 'icecast') {

              regex_creator = /<creator>(.*?)<\/creator>/g;

              if (aux = regex_creator.exec(response)) {
                new_artist = aux[1];
              }
            }
            if (type_normal_stream_type == 'shoutcast') {
            }
          }

          if (radio_update_song_name) {

            selfClass._metaArtistCon.find('.the-name').html(new_title);
          }
          if (radio_update_artist_name) {

            selfClass._metaArtistCon.find('.the-artist').html(new_artist)
          }
        },
        error: function (err) {
          console.log('error loading icecast - ', err);
        }
      });
    }


    function check_every_05_secs() {


      // console.log('check_every_05_secs',cthis);
      if (!cthis) {
        return false;
      }
      if (cthis.hasClass('first-played') == false) {

        if (!(cthis.attr('data-playfrom')) || cthis.attr('data-playfrom') == '0') {
          time_total_for_real = 0;
          selfClass.timeTotal = 0;
          if ($(selfClass.$mediaNode_) && $(selfClass.$mediaNode_).html() && $(selfClass.$mediaNode_).html().indexOf('api.soundcloud.com') > -1) {
            if (selfClass.$mediaNode_.currentTime != 0) {

              seek_to(0, {
                'call_from': 'first_played_false'
              });
            }
          }
        }

      }


      if (selfClass.audioType == 'fake' || selfClass._actualPlayer) {


        // console.log('curr_time_first_set -> ',curr_time_first_set);
        if (cthis.hasClass('current-feeder-for-parent-player') == false) {
          if (time_curr_for_visual) {
            selfClass.timeCurrent = time_curr_for_visual;
          }
        }

        // console.log(time_curr,selfClass.$mediaNode_.currentTime,selfClass.$mediaNode_);


        if (selfClass.timeTotal == 0) {
          if (selfClass.$mediaNode_) {
            selfClass.timeTotal = selfClass.$mediaNode_.duration;
            if (inter_audiobuffer_workaround_id == 0) {
              selfClass.timeCurrent = selfClass.$mediaNode_.currentTime;
            }
          }
        }
        if (selfClass.timeCurrent == 5) {
          // selfClass.timeCurrent = 0;
        }


        // console.log(selfClass.timeCurrent);
        // -- trying to fix some soundcloud wrong reporting


        // console.log(selfClass.timeCurrent,cthis.hasClass('first-played'), cthis.attr('data-playfrom'), cthis)
        real_time_curr = selfClass.timeCurrent;
        real_time_total = selfClass.timeTotal;
      }


      // -- trying to get current time
      if (selfClass.audioType == 'youtube') {


        time_total_for_real = -1;
        time_curr_for_real = -1;
        try {
          if (selfClass.$mediaNode_ && selfClass.$mediaNode_.getDuration) {
            time_total_for_real = selfClass.$mediaNode_.getDuration();
            if (selfClass._actualPlayer == null) {
              time_curr_for_real = selfClass.$mediaNode_.getCurrentTime();
            }
          }
          if (playfrom == 'last' && playfrom_ready) {
            if (typeof Storage != 'undefined') {
              localStorage['dzsap_' + selfClass.the_player_id + '_lastpos'] = time_curr_for_real;
            }
          }
        } catch (err) {
          console.log('yt error - ', err);
        }
      }


      if (o.design_skin == 'skin-wave' && o.skinwave_comments_displayontime == 'on') {
        dzsapHelpers.player_checkIfWeShouldShowAComment(selfClass, real_time_curr, real_time_total);
      }
    }

    function load_yt_api() {

      // console.error("LOAD YT API");

      if (dzsap_ytapiloaded == false) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        dzsap_ytapiloaded = true;
      }
    }


    function comments_selector_event(e) {
      var _t = $(this);
      var _con = null;

      if (_t.parent().parent().hasClass('zoomsounds-comment-wrapper')) {
        _con = _t.parent().parent();
      }
      if (_t.parent().parent().parent().hasClass('zoomsounds-comment-wrapper')) {
        _con = _t.parent().parent().parent();
      }
      // console.log(_t, e.type);
      if (e.type == 'focusin') {

        // console.log(_t);


        var spx = selfClass.timeCurrent / selfClass.timeTotal * selfClass._commentsHolder.width();
        spx += 'px';
        // console.log(spx);


        selfClass.commentPositionPerc = selfClass.timeCurrent / selfClass.timeTotal * 100 + '%';

        _con.addClass('active');

        add_comments_placeholder(spx);
      }
      if (e.type == 'focusout') {


      }
      if (e.type == 'click') {

        if (_t.hasClass('comments-btn-cancel')) {

          _con.removeClass('active');
          _con.find('input').val('');
        }
        if (_t.hasClass('comments-btn-submit')) {


          var comment_email = '';

          if (_con.find('.comment_email').length) {
            comment_email = _con.find('.comment_email').eq(0).val();
          }


          comment_submit(_con.find('.comment_text').eq(0).val(), comment_email);


          _con.removeClass('active');
          _con.find('input').val('');


          return false;
        }


      }
    }


    function calculate_dims_time() {
      var reflection_size = parseFloat(o.skinwave_wave_mode_canvas_reflection_size);


      reflection_size = 1 - reflection_size;


      var scrubbarh = selfClass._scrubbar.height();

      if (o.design_skin == 'skin-wave') {


        // console.log('selfClass.skinwave_mode - ',selfClass.skinwave_mode);
        if (selfClass.skinwave_mode == 'small') {
          scrubbarh = 60;
        }

        if (selfClass._commentsHolder) {

          if (reflection_size == 0) {

            // console.log(selfClass._scrubbar.offset().top - cthis.offset().top + scrubbarh *reflection_size - selfClass._commentsHolder.height())

            selfClass._commentsHolder.css('top', selfClass._scrubbar.offset().top - cthis.offset().top + scrubbarh * reflection_size - selfClass._commentsHolder.height());
          } else {


            selfClass._commentsHolder.css('top', selfClass._scrubbar.offset().top - selfClass._scrubbar.parent().offset().top + scrubbarh * reflection_size);
            _commentsWriter.css('top', selfClass._scrubbar.offset().top - selfClass._scrubbar.parent().offset().top + scrubbarh * reflection_size);
          }
        }

        if (selfClass.$currTime) {


          selfClass.$currTime.css('top', scrubbarh * reflection_size - selfClass.$currTime.outerHeight());
        }
        if (selfClass.$totalTime) {

          selfClass.$totalTime.css('top', scrubbarh * reflection_size - selfClass.$totalTime.outerHeight());
        }
      }

      //console.log('reflection_size - ',reflection_size);

      cthis.attr('data-reflection-size', reflection_size);
    }


    function change_visual_target(arg, pargs) {
      // -- change the visual target, the main is the main palyer selfClass.player_playing and the visual target is the player which is a visual representation of this

      console.log('change_visual_target() - ', arg);

      var margs = {}


      // return false;


      if (pargs) {
        margs = $.extend(margs, pargs);
      }


      if (selfClass._sourcePlayer && selfClass._sourcePlayer.get(0) && selfClass._sourcePlayer.get(0).api_pause_media_visual) {
        selfClass._sourcePlayer.get(0).api_pause_media_visual({
          'call_from': 'change_visual_target'
        });
      }
      selfClass._sourcePlayer = arg;


      console.log('new selfClass._sourcePlayer -  ', selfClass._sourcePlayer);

      var __c = selfClass._sourcePlayer.get(0);
      if (selfClass.player_playing) {
        if (selfClass._sourcePlayer && __c && __c.api_play_media_visual) {
          __c.api_play_media_visual();
        }
      }

      if (__c && __c.api_draw_curr_time) {


        __c.api_set_time_curr(selfClass.timeCurrent);
        __c.api_get_times({
          'call_from': ' change visual target .. in api '
        });
        __c.api_check_time({
          'fire_only_once': true
        });
        __c.api_draw_curr_time();
        __c.api_draw_scrub_prog();
      }

      setTimeout(function () {

        // console.log('__c.api_draw_curr_time - ',__c.api_draw_curr_time);
        if (__c && __c.api_draw_curr_time) {
          __c.api_get_times();
          __c.api_check_time({
            'fire_only_once': true
          });
          __c.api_draw_curr_time();
          __c.api_draw_scrub_prog();
        }
      }, 800);

    }

    function change_design_color_highlight(arg) {
      // -- change the visual target, the main is the main palyer selfClass.player_playing and the visual target is the player which is a visual representation of this

      //console.log(arg);

      o.design_wave_color_progress = arg;
      if (o.skinwave_wave_mode == 'canvas') {
        dzsapWaveFunctions.draw_canvas(selfClass._scrubbarbg_canvas.get(0), cthis.attr('data-pcm'), "#" + o.design_wave_color_bg, {
          call_from: 'canvas_change_pcm_bg',
          selfClass,
          'skinwave_wave_mode_canvas_waves_number': parseInt(o.skinwave_wave_mode_canvas_waves_number),
          'skinwave_wave_mode_canvas_waves_padding': parseInt(o.skinwave_wave_mode_canvas_waves_padding)
        });
        dzsapWaveFunctions.draw_canvas(selfClass._scrubbarprog_canvas.get(0), cthis.attr('data-pcm'), "#" + o.design_wave_color_progress, {
          call_from: 'canvas_change_pcm_prog',
          selfClass,
          'skinwave_wave_mode_canvas_waves_number': parseInt(o.skinwave_wave_mode_canvas_waves_number),
          'skinwave_wave_mode_canvas_waves_padding': parseInt(o.skinwave_wave_mode_canvas_waves_padding)
        });
      }

    }


    /**
     * change media source for the player / change_media("song.mp3", {type:"audio", fakeplayer_is_feeder:"off"});
     * @param _argSource - can be player dom element
     * @param pargs - {type:"audio", fakeplayer_is_feeder:"off"}
     * @returns {boolean}
     */
    function change_media(_argSource, pargs = {}) {


      var changeMediaArgsDefaults = {
        type: '',
        fakeplayer_is_feeder: 'off' // -- this is OFF in case there is a button feeding it, and on if it's an actual player
        , call_from: 'default'
        , source: 'default'
        , pcm: ''
        , artist: ""
        , song_name: ""
        , thumb: ""
        , thumb_link: ""
        , autoplay: "on"
        , cue: "on"
        , feeder_type: "player"
        , source_player_do_not_update: "off"
        , watermark: ""
        , watermark_volume: ""
        , playerid: ""
      };


      selfClass.ajax_view_submitted = 'on'; // -- view submitted from caller

      // console.log('%c change_media() -','background-color: #444; color: #dd5555;');
      // console.log('margs initial -> ',Object.assign({},margs));
      // console.log('pargs initial -> ',Object.assign({},pargs));
      var handle_resize_delay = 500;
      var changeMediaArgs = Object.assign(changeMediaArgsDefaults, pargs);
      // margs = Object.assign(margs, pargs);
      // console.log("_argSource -",_argSource,'changeMediaArgs - ',Object.assign({},changeMediaArgs), 'pargs -5 ', Object.assign({},pargs));

      var _sourceForChange = _argSource;

      media_changed_index++;


      var isSourceAStringSource = false;

      $('.current-feeder-for-parent-player').removeClass('current-feeder-for-parent-player');
      //console.log('change_media', "margs - ", margs, cthis, selfClass._sourcePlayer, arg);

      if (typeof _sourceForChange == 'string') {
        isSourceAStringSource = true;
      }


      // -- let us decide if we pause old player
      var sw_pause_old_player = true;

      if (!isSourceAStringSource && cthis.attr('data-source') == _sourceForChange.attr('data-source')) {
        sw_pause_old_player = false;
      }
      if (isSourceAStringSource && cthis.attr('data-source') == _sourceForChange) {
        sw_pause_old_player = false;
      }

      // -- old feed fake player

      if (sw_pause_old_player && selfClass._sourcePlayer) {
        selfClass._sourcePlayer.get(0).api_pause_media_visual({
          'call_from': 'change_media'
        });
      }

      // -- we are in one mode, so we need to preserve the originalSettings of the first item
      if (!(selfClass.cthis.data('original-settings')) && selfClass.data_source != 'fake') {
        selfClass.cthis.data('original-settings', dzsapHelpers.sanitizeObjectForChangeMediaArgs(selfClass.cthis))
      }


      if (!isSourceAStringSource) {
        changeMediaArgs = dzsapHelpers.sanitizeObjectForChangeMediaArgs(_sourceForChange);
      }

      selfClass.data_source = changeMediaArgs.source;

      const isSourceHasClassForDomSource = isSourceAStringSource == false && !!(!!_sourceForChange.hasClass('audioplayer') === true || _sourceForChange.hasClass('is-zoomsounds-source-player'));


      if ((isSourceHasClassForDomSource) || changeMediaArgs.fakeplayer_is_feeder == 'on') {
        selfClass._sourcePlayer = _sourceForChange;

        selfClass.cthis.data('feeding-from', selfClass._sourcePlayer.get(0));
        selfClass._sourcePlayer.addClass('current-feeder-for-parent-player');


        // console.log("selfClass._sourcePlayer.find('.meta-artist') -> ",selfClass._sourcePlayer.find('.meta-artist'));


        if (selfClass._sourcePlayer.attr('data-sample_time_start')) {
          selfClass.cthis.attr('data-sample_time_start', _sourceForChange.attr('data-sample_time_start'));
        } else {
          selfClass.cthis.attr('data-sample_time_start', '');
        }
        if (selfClass._sourcePlayer.attr('data-sample_time_end')) {
          cthis.attr('data-sample_time_end', _sourceForChange.attr('data-sample_time_end'));
        } else {
          cthis.attr('data-sample_time_end', '');
        }
        if (selfClass._sourcePlayer.attr('data-pseudo-sample_time_start')) {
          cthis.attr('data-pseudo-sample_time_start', selfClass._sourcePlayer.attr('data-pseudo-sample_time_start'));
        } else {
          cthis.attr('data-pseudo-sample_time_start', '');
        }
        if (selfClass._sourcePlayer.attr('data-pseudo-sample_time_end')) {
          cthis.attr('data-pseudo-sample_time_end', selfClass._sourcePlayer.attr('data-pseudo-sample_time_end'));
        } else {
          cthis.attr('data-pseudo-sample_time_end', '');
        }
        if (selfClass._sourcePlayer.attr('data-sample_time_total')) {
          cthis.attr('data-sample_time_total', _sourceForChange.attr('data-sample_time_total'));
        } else {
          cthis.attr('data-sample_time_total', '');
        }
      }

      if (!isSourceAStringSource && _sourceForChange) {
        if (_sourceForChange.attr('data-playerid')) {
          cthis.attr('data-feed-playerid', _sourceForChange.attr('data-playerid'));
        } else {
          cthis.attr('data-feed-playerid', '');
          changeMediaArgs.playerid = '';
        }
      }


      // console.log('change_media', "changeMediaArgs - ", changeMediaArgs);

      // --- if the media is the same DON'T CHANGE IT
      if (selfClass._sourcePlayer && changeMediaArgsDefaults.source_player_do_not_update !== 'on') {
        // console.error(cthis.attr('data-source'), arg.attr('data-source'));
        if (cthis.attr('data-source') == _sourceForChange.attr('data-source')) {
          return false;
        }
      } else {
        if (cthis.attr('data-source') == _sourceForChange) {
          return false;
        }

      }


      if (changeMediaArgs.type == 'detect' || changeMediaArgs.type == 'audio' || changeMediaArgs.type == 'normal') {
        changeMediaArgs.type = 'selfHosted';
      }
      if (changeMediaArgs.type == 'youtube') {

        var ytid = 'ytplayer_' + cthisId;

        if (media_changed_index) {
          ytid += media_changed_index;
        }
      }


      // console.log('changeMediaArgs here -2 ',Object.assign({},changeMediaArgs), isSourceAStringSource);

      cthis.removeClass('meta-loaded');


      // -- footer placeholder
      if (cthis.parent().hasClass('audioplayer-was-loaded')) {

        cthis.parent().addClass('audioplayer-loaded');
        $('body').addClass('footer-audioplayer-loaded');
        cthis.parent().removeClass('audioplayer-was-loaded');
      }

      if (_sticktobottom) {
        _sticktobottom.addClass('audioplayer-loaded');
      }


      cthis.removeClass('errored-out');


      destroy_media();


      cthis.attr('data-source', changeMediaArgs.source);
      cthis.attr('data-soft-watermark', changeMediaArgs.watermark);


      if (changeMediaArgs.watermark_volume) {
        o.watermark_volume = changeMediaArgs.watermark_volume;
      } else {

        o.watermark_volume = 1;
      }


      //console.log('o.watermark_volume - ',o.watermark_volume);


      var original_type = changeMediaArgs.type;
      if (changeMediaArgs.type == 'mediafile') {
        changeMediaArgs.type = 'audio';
      }
      if (changeMediaArgs.type) {
        if (changeMediaArgs.type == 'soundcloud') {
          changeMediaArgs.type = 'audio';
        }
        if (changeMediaArgs.type == 'album_part') {
          changeMediaArgs.type = 'audio';
        }
        cthis.attr('data-type', changeMediaArgs.type);
        selfClass.audioType = changeMediaArgs.type;
        o.type = changeMediaArgs.type;
      }

      selfClass.playerIsLoaded = false;


      if (o.design_skin == 'skin-wave') {
        if (o.skinwave_wave_mode == 'canvas') {
          if (selfClass._sourcePlayer) {
            selfClass.src_real_mp3 = _sourceForChange.attr('data-source');
          } else {
            selfClass.src_real_mp3 = _sourceForChange;
          }

          if (_sourceForChange && changeMediaArgs.pcm) {

            cthis.attr('data-pcm', _sourceForChange.attr('data-pcm'));
            dzsapWaveFunctions.scrubModeWave__transitionIn(selfClass, _sourceForChange.attr('data-pcm'));
          } else {

            dzsapWaveFunctions.scrubModeWave__initGenerateWaveData(selfClass, {
              'call_from': 'change_media() regenerate_canvas_from_change_media'
            });
          }


          if (changeMediaArgs.pcm != '') {

            dzsapWaveFunctions.scrubModeWave__transitionIn(selfClass, changeMediaArgs.pcm);
            cthis.attr('data-pcm', changeMediaArgs.pcm);
          } else {
            selfClass._scrubbar.addClass('fast-animate-scrubbar');

            cthis.removeClass('scrubbar-loaded');
            setTimeout(function () {
            }, 10)
            setTimeout(function () {
              cthis.removeClass('fast-animate-scrubbar');


              // -- we have no new pcm data
              selfClass.isRealPcm = false;

              cthis.attr('data-pcm', '');

              dzsapWaveFunctions.wave_mode_canvas_try_to_get_pcm(selfClass);
              dzsapWaveFunctions.scrubModeWave__initGenerateWaveData(selfClass, {
                'call_from': 'regenerate_canvas_from_change_media - generate data for new'
              });

            }, 120);


          }


        }


        // console.log(' artist - ',changeMediaArgs.artist, cthis.find('.the-artist'), changeMediaArgs)


        // -- inside skin-wave
        if (changeMediaArgs.thumb) {

          if (cthis.find('.the-thumb').length) {

            cthis.find('.the-thumb').css('background-image', 'url(' + changeMediaArgs.thumb + ')');
          } else {
            cthis.attr('data-thumb', changeMediaArgs.thumb);
            struct_generate_thumb();
          }

        }
      }


      if (changeMediaArgs.thumb) {

        if (cthis.find('.the-thumb').length) {

          cthis.find('.the-thumb').css('background-image', 'url(' + changeMediaArgs.thumb + ')');
        } else {
          cthis.attr('data-thumb', changeMediaArgs.thumb);
          struct_generate_thumb();
        }

        cthis.removeClass('does-not-have-thumb');
        cthis.addClass('has-thumb');
      } else {
        cthis.addClass('does-not-have-thumb');
        cthis.removeClass('has-thumb');
      }


      if (changeMediaArgs.pcm == '') {
        setup_pcm_random_for_now();
      }

      // console.log('%c selfClass._sourcePlayer.attr(\'data-playerid\') - ','color: #da00ff;',selfClass._sourcePlayer.attr('data-playerid'), cthis);


      if (selfClass._sourcePlayer) {

        if (selfClass._sourcePlayer.attr('data-playerid')) {
          selfClass.identifier_pcm = selfClass._sourcePlayer.attr('data-playerid');
        } else {

          if (selfClass._sourcePlayer.attr('data-source')) {
            selfClass.identifier_pcm = selfClass._sourcePlayer.attr('data-source');
          }
        }
      }
      // console.log('%c selfClass.identifier_pcm - ','color: #da00ff;',selfClass.identifier_pcm);


      if (_playlistTooltip) {
        var ind = 0;
        var _cach = _playlistTooltip.children('.dzstooltip--inner');
        _cach.children().removeClass('current-playlist-item');
        _cach.children().each(function () {
          var _t = $(this);

          // console.log('_t - ',_t);

          if (_t.attr('data-playerid') == changeMediaArgs.playerid) {
            _t.addClass('current-playlist-item');
            selfClass.playlist_inner_currNr = ind;
          }
        })
      }


      handle_resize_delay = 100;
      if (selfClass._sourcePlayer && _sourceForChange.find('.meta-artist').eq(0).html()) {

      }

      if (selfClass._sourcePlayer) {

        // console.log('let us check selfClass._sourcePlayer for feed-dzsap-for-extra-html-rigth - ',selfClass._sourcePlayer, selfClass._sourcePlayer.find('.feed-dzsap-for-extra-html-right'));
        // -- .feed-dzsap-for-extra-html-right will be appended to the footer player

        var selector = '';
        var _el = null;
        if (selfClass._sourcePlayer.find('.feed-dzsap-for-extra-html-right').length) {
          _el = selfClass._sourcePlayer.find('.feed-dzsap-for-extra-html-right').eq(0);
        } else {
          // -- we use this for Shop Builder
          if (selfClass._sourcePlayer.attr('data-playerid') && $(document).find('.feed-dzsap-for-extra-html-right[data-playerid="' + selfClass._sourcePlayer.attr('data-playerid') + '"]').length) {
            _el = $(document).find('.feed-dzsap-for-extra-html-right[data-playerid="' + selfClass._sourcePlayer.attr('data-playerid') + '"]').eq(0);

          }
        }
        if (_el) {
          cthis.find('.extrahtml-in-float-right').eq(0).html(_el.html());
        }
      }

      if (changeMediaArgs.artist) {
        cthis.find('.the-artist').html(changeMediaArgs.artist);
      }
      if (changeMediaArgs.song_name) {
        cthis.find('.the-name').html(changeMediaArgs.song_name);
      }


      if (changeMediaArgsDefaults.source_player_do_not_update == 'on') {
        selfClass._sourcePlayer = null;
      }


      // console.error('changeMediaArgs.source - ',changeMediaArgs.source,changeMediaArgs.type, type);
      if (original_type === 'soundcloud' && changeMediaArgs.source.indexOf('api.soundcloud') == -1) {
        selfClass.data_source = changeMediaArgs.source;
        console.log("RETRIEVE SOUNDCLOUD URL");
        selfClass.isPlayPromised = true;
        setTimeout(function () {
          selfClass.isPlayPromised = true;
        }, 501);
        dzsapMisc.retrieve_soundcloud_url(selfClass);

      } else {

        // -- setup media for all sources
        // -- make sure source is not fake
        setup_media({
          'called_from': 'change_media'
        });
      }


      settle_sample_times();



      if (selfClass.audioType == 'fake') {
        return false;
      }

      if (o.action_audio_change_media) {
        o.action_audio_change_media(changeMediaArgs.source, changeMediaArgs);
      }


      //console.log("IS MOBILE - ",dzsapHelpers.dzsap_is_mobile());
      // console.log('%c before autoplay changeMediaArgs - ','color: #dadada;',changeMediaArgs, dzsapHelpers.dzsap_is_mobile());

      if (changeMediaArgs.autoplay == 'on' && dzsapHelpers.dzsap_is_mobile() == false) {
        play_media_visual();

        setTimeout(function () {

          play_media({
            'called_from': 'changeMediaArgs.autoplay'
          });
        }, 500);
      }
      setTimeout(function () {

        handleResize();
      }, handle_resize_delay)
    }


    function destroy_listeners() {


      if (destroyed) {
        return false;
      }


      sw_suspend_enter_frame = true;

    }

    function destroy_it() {


      if (destroyed) {
        return false;
      }

      if (selfClass.player_playing) {
        pause_media();
      }


      $(window).off('resize.dzsap');

      cthis.remove();
      cthis = null;

      destroyed = true;
    }

    function click_for_setup_media(e, pargs) {
      // console.log('click_for_setup_media', cthis, pargs);

      //console.log(e.target);
      //cthis.unbind('click', click_for_setup_media);


      var margs = {

        'do_not_autoplay': false
      };

      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      cthis.find('.playbtn').unbind('click', click_for_setup_media);
      cthis.find('.scrubbar').unbind('click', click_for_setup_media);

      setup_media(margs);


      if (dzsapHelpers.is_android() || dzsapHelpers.is_ios()) {

        play_media({
          'called_from': 'click_for_setup_media'
        });
      }
    }


    function click_menu_state(e) {

      if (o.parentgallery && typeof (o.parentgallery.get(0)) != "undefined") {
        o.parentgallery.get(0).api_toggle_menu_state();
      }
    }

    function click_comments_bg(e) {

      // console.log('click_comments_bg() --- ');
      var _t = $(this);
      var lmx = parseInt(e.clientX, 10) - _t.offset().left;
      selfClass.commentPositionPerc = (lmx / _t.width()) * 100 + '%';


      if (o.skinwave_comments_links_to) {
        return;
      }

      if (o.skinwave_comments_allow_post_if_not_logged_in == 'off' && o.skinwave_comments_account == 'none') {

        return false;
      }

      var sw = true;

      selfClass._commentsHolder.children().each(function () {
        var _t2 = $(this);
        //console.log(_t2);

        if (_t2.hasClass('placeholder') || _t2.hasClass('the-bg')) {
          return;
        }

        var lmx2 = _t2.offset().left - _t.offset().left;

        //console.log(lmx2, Math.abs(lmx2-lmx));

        if (Math.abs(lmx2 - lmx) < 20) {
          selfClass._commentsHolder.find('.dzstooltip-con.placeholder').remove();
          sw = false;

          return false;
        }
      })


      if (!sw) {
        return false;
      }

      var comments_offset = selfClass._commentsHolder.offset().left - cthis.offset().left;


      var aux3 = lmx + comments_offset - (_commentsWriter.width() / 2) + 7;

      var aux4 = -1;

      if (aux3 < comments_offset) {
        aux4 = aux3 + 32;
        aux3 = comments_offset;

        // console.error(aux4);


        cthis.append('<style class="comments-writter-temp-css">.audioplayer.skin-wave .comments-writer .comments-writer-inner:before{ left:' + aux4 + 'px  }</style>');

      } else {

        if (aux3 > tw - comments_offset - (_commentsWriter.width() / 2)) {
          aux4 = lmx - (_commentsWriter.offset().left - cthis.offset().left) + (_commentsWriter.width() / 3);
          aux3 = tw - comments_offset - (_commentsWriter.width() / 2);

          // console.error(lmx, _commentsWriter.offset().left - cthis.offset().left,  aux4);


          cthis.append('<style class="comments-writter-temp-css">.audioplayer.skin-wave .comments-writer .comments-writer-inner:before{ left:' + aux4 + 'px  }</style>');

        } else {

          cthis.find('.comments-writter-temp-css').remove();
        }
      }


      _commentsWriter.css('left', (aux3) + 'px')


      _commentsWriter.css({
        'left': '50%'
        , 'top': '80px'
        , 'transform': 'translate3d(-50%,0,0)'
        , 'width': '100%'
      })


      // console.log('parseInt(selfClass._commentsHolder.css(\'top\'),10) + \'px\' -5 ', parseInt(selfClass._commentsHolder.css('top'),10) + 'px');
      _commentsWriter.css('top', ((parseInt(selfClass._commentsHolder.css('top'), 10) + 20) + 'px'))


      if (_commentsWriter.hasClass('active') == false) {
        _commentsWriter.css({
          'height': _commentsWriter.find('.comments-writer-inner').eq(0).outerHeight() + 20
        });


        _commentsWriter.addClass('active');

        cthis.addClass('comments-writer-active');

        if (o.parentgallery && $(o.parentgallery).get(0) != undefined && $(o.parentgallery).get(0).api_handleResize != undefined) {
          $(o.parentgallery).get(0).api_handleResize();
        }
      }

      if (o.skinwave_comments_account != 'none') {
        cthis.find('input[name=comment-email]').remove();
      }


      add_comments_placeholder();


    }


    function add_comments_placeholder() {


      selfClass._commentsHolder.remove('.dzsap-style-comments');
      selfClass._commentsHolder.append('<style class="dzsap-style-comments">.dzstooltip-con:not(.placeholder) { opacity: 0.5; }</style>')
      selfClass._commentsHolder.find('.dzstooltip-con.placeholder').remove();
      selfClass._commentsHolder.append('<span class="dzstooltip-con placeholder" style="left:' + selfClass.commentPositionPerc + ';"><div class="the-avatar" style="background-image: url(' + o.skinwave_comments_avatar + ')"></div></span>');
    }

    function click_cancel_comment(e) {
      hide_comments_writer();
    }


    function comment_submit(comment_text, comment_email, comment_username) {
      var comm_author = '';
      if (comment_email) {
        var regex_mail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (regex_mail.test(comment_email) == false) {
          alert('please insert email, your email is just used for gravatar. it will not be sent or stored anywhere');
          return false;
        }

        comm_author = String(comment_email).split('@')[0];
        o.skinwave_comments_account = comm_author;
        //console.log(comm_author);


        if (_commentsSelector) {

          _commentsSelector.find('*[name=comment_email],*[name=comment_user]').remove();
        }


        o.skinwave_comments_avatar = 'https://secure.gravatar.com/avatar/' + dzsapHelpers.MD5(String(cthis.find('input[name=comment-email]').eq(0).val()).toLowerCase()) + '?s=20';
      } else {

      }


      console.log('comment_submit() - ', comment_text, comment_email);

      // return false;

      comm_author = o.skinwave_comments_account;

      var aux = '';


      if (o.skinwave_comments_process_in_php != 'on') {

        // -- process the comment now, in javascript

        aux += '<span class="dzstooltip-con zoomsounds-comment" style="left:' + selfClass.commentPositionPerc + '"><div class="the-avatar tooltip-indicator" style="background-image: url(' + o.skinwave_comments_avatar + ')"></div><span class="dzstooltip arrow-bottom style-rounded color-dark-light talign-start  transition-slidein arrow-bottom " style="width: 250px;"><span class="dzstooltip--inner"><span class="the-comment-author">@' + comm_author + '</span> says:<br>';
        aux += dzsapHelpers.htmlEncode(comment_text);


        aux += '</span></span></span>';
      } else {


        // -- process php

        aux += comment_text;
      }


      cthis.find('*[name=comment-text]').eq(0).val('');


      cthis.find('.comments-writter-temp-css,.dzsap-style-comments').remove();


      (dzsapAjax.ajax_comment_publish.bind(selfClass))(aux);

      hide_comments_writer();

      if (o.parentgallery && $(o.parentgallery).get(0) != undefined && $(o.parentgallery).get(0).api_player_commentSubmitted != undefined) {
        $(o.parentgallery).get(0).api_player_commentSubmitted();
      }

    }

    function click_submit_comment(e) {

      var comment_email = '';

      if (cthis.find('input[name=comment-email]').length) {
        comment_email = cthis.find('input[name=comment-email]').eq(0).val();
      }


      comment_submit(cthis.find('*[name=comment-text]').eq(0).val(), comment_email);


      return false;
    }

    function hide_comments_writer() {

      //console.log(_commentsWriter);
      cthis.removeClass('comments-writer-active');
      selfClass._commentsHolder.find('.dzstooltip-con.placeholder').remove();
      _commentsWriter.removeClass('active');
      _commentsWriter.css({
        'height': 0
      })


      if (o.parentgallery && $(o.parentgallery).get(0) != undefined && $(o.parentgallery).get(0).api_handleResize != undefined) {
        $(o.parentgallery).get(0).api_handleResize();
      }

      setTimeout(function () {

        cthis.find('.comments-writter-temp-css,.dzsap-style-comments').remove();
      }, 300);

    }

    function youtube_checkReady(argid) {
      //console.log(loaded);


      // console.log('check_yt_ready()', loaded, window.YT, cthis);
      if (selfClass.playerIsLoaded == true) {
        return;
      }
      // console.log('yt inited');
      //var player;

      if (argid) {

      } else {
        argid = yt_curr_id;
      }

      if (selfClass.$theMedia.children().length == 0) {
        selfClass.$theMedia.append('<div id="' + argid + '"></div>');
      }

      // console.log('argid - ', argid, $(argid), Object.assign({}, $(argid)));
      selfClass.$mediaNode_ = new YT.Player(argid + '', {
        height: '200',
        width: '200',
        videoId: cthis.attr('data-source'),
        playerVars: {
          origin: ''
          ,
          controls: 1,
          'showinfo': 0,
          'playsinline': 1,
          rel: 0,
          autohide: 0,
          wmode: 'transparent',
          iv_load_policy: '3'
        },
        events: {
          'onReady': check_yt_ready_phase_two,
          'onStateChange': change_yt_state
        }
      });
      cthis.addClass('yt-inited');

      yt_inited = true;


      return false;
      //init_loaded();
    }

    function check_yt_ready_phase_two(arg) {

      // console.log('check_yt_ready_phase_two', arg);


      // console.log('selfClass.$mediaNode_ - ', Object.assign({},selfClass.$mediaNode_), selfClass.$mediaNode_.getPlayerState, cthis);

      if (yt_inited == false) {
        youtube_checkReady(yt_curr_id);
        setTimeout(function () {
          check_yt_ready_phase_two(arg)
        }, 1000);
      } else {
        if (selfClass.$mediaNode_) {
          // --  && selfClass.$mediaNode_.getPlayerState
          init_loaded({
            'call_from': 'check_yt_ready_phase_two'
          });

          if (selfClass.youtube_retryPlayTimeout) {
            // console.log('try to play ')
            setTimeout(function () {
              play_media({
                'called_from': 'check_yt_ready_phase_two'
              });
            }, 500);
          }
        } else {
          setTimeout(function () {
            check_yt_ready_phase_two(arg)
          }, 1000);
        }

      }
    }

    function change_yt_state(arg) {
      // console.log('change_yt_state - ', arg);

      if (arg.data == 4) {

      }
      if (arg.data == 2) {

        pause_media({
          'call_from': 'youtube paused'
        });
      }
      if (arg.data == 1) {

        play_media({
          'called_from': 'youtube playing'
        });
        cthis.addClass('dzsap-loaded');
      }
      if (arg.data == -1) {

        // console.log('selfClass.player_playing - ',selfClass.player_playing);

        if (selfClass.player_playing) {
          seek_to(0);
        }
      }
    }

    function check_ready(pargs) {
      // console.log('check_ready()', cthis, selfClass.$mediaNode_, selfClass.$mediaNode_.readyState);
      //=== do a little ready checking


      var margs = {

        'do_not_autoplay': false
      };

      if (selfClass._actualPlayer && dzsapHelpers.is_ios()) {
        return false;
      }


      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      // console.log(selfClass.$mediaNode_.readyState);
      if (selfClass.audioType == 'youtube') {

        init_loaded(margs);
      } else {
        if (typeof (selfClass.$mediaNode_) != 'undefined' && selfClass.$mediaNode_) {


          //                        return false;
          if (selfClass.$mediaNode_.nodeName != "AUDIO" || o.type == 'shoutcast') {
            init_loaded(margs);
          } else {
            if (is_safari()) {

              if (selfClass.$mediaNode_.readyState >= 1) {
                //console.log("CALL INIT LOADED FROM ",selfClass.$mediaNode_.readyState);

                if (selfClass.playerIsLoaded == false) {
                }

                init_loaded(margs);
                clearInterval(inter_checkReady);

                if (o.action_audio_loaded_metadata) {
                  o.action_audio_loaded_metadata(cthis);
                }
              }
            } else {
              if (selfClass.$mediaNode_.readyState >= 2) {
                //console.log("CALL INIT LOADED FROM ",selfClass.$mediaNode_.readyState);
                if (selfClass.playerIsLoaded == false) {
                }
                init_loaded(margs);
                clearInterval(inter_checkReady);

                // console.log(selfClass.$mediaNode_.duration);


                // console.log(o.action_audio_loaded_metadata)
                if (o.action_audio_loaded_metadata) {
                  o.action_audio_loaded_metadata(cthis);
                }
              }
            }

          }
        }

      }

    }

    function scrubbar_reveal() {
      setTimeout(function () {
        if (cthis) {
          cthis.addClass('scrubbar-loaded');
        }
      }, 1000);
    }


    function struct_generate_thumb() {

      // return false;


      var str_thumbh = "";
      if (design_thumbh != '') {
        str_thumbh = ' height:' + o.design_thumbh + 'px;';
      }
      if (cthis.attr('data-thumb')) {


        cthis.addClass('has-thumb');
        var aux_thumb_con_str = '';

        if (cthis.attr('data-thumb_link')) {
          aux_thumb_con_str += '<a href="' + cthis.attr('data-thumb_link') + '"';
        } else {
          aux_thumb_con_str += '<div';
        }
        aux_thumb_con_str += ' class="the-thumb-con"><div class="the-thumb" style=" background-image:url(' + cthis.attr('data-thumb') + ')"></div>';


        if (cthis.attr('data-thumb_link')) {
          aux_thumb_con_str += '</a>';
        } else {
          aux_thumb_con_str += '</div>';
        }


        if (cthis.children('.the-thumb-con').length) {
          aux_thumb_con_str = cthis.children('.the-thumb-con').eq(0);
        }


        if (o.design_skin != 'skin-customcontrols') {
          if (o.design_skin == 'skin-wave' && (selfClass.skinwave_mode == 'small' || selfClass.skinwave_mode == 'alternate')) {

            if (selfClass.skinwave_mode == 'alternate') {

              // console.log("WHERE IS INNER ? ",selfClass._audioplayerInner);
              selfClass._audioplayerInner.prepend(aux_thumb_con_str);
            } else {

              selfClass._apControlsLeft.prepend(aux_thumb_con_str);
            }
          } else if (o.design_skin == 'skin-steel') {


            selfClass._apControlsLeft.prepend(aux_thumb_con_str);
          } else {

            selfClass._audioplayerInner.prepend(aux_thumb_con_str);
          }
        }

        _theThumbCon = selfClass._audioplayerInner.children('.the-thumb-con').eq(0);
      } else {

        cthis.removeClass('has-thumb');
      }
    }

    function apply_skinwave_mode_class() {


      cthis.removeClass('skin-wave-mode-normal');
      if (o.design_skin == 'skin-wave') {
        cthis.addClass('skin-wave-mode-' + selfClass.skinwave_mode);


        if (selfClass.skinwave_mode == 'small') {
          if (o.design_thumbh == 'default') {
            design_thumbh = 80;
          }
        }
        cthis.addClass('skin-wave-wave-mode-' + o.skinwave_wave_mode);

        if (o.skinwave_enableSpectrum == 'on') {

          cthis.addClass('skin-wave-is-spectrum');
        }
        cthis.addClass('skin-wave-wave-mode-canvas-mode-' + o.skinwave_wave_mode_canvas_mode);

      }

    }


    function playlist_goto_item(arg, pargs) {
      // -- this is the function called from playlist menu item ( footer )


      var margs = {
        'call_from': "default"
      }

      if (pargs) {
        margs = $.extend(margs, pargs);
      }


      // console.log('playlist_goto_item - margs -4 ',margs, 'arg - ',arg);


      var _cach_con = null;


      if (_playlistTooltip) {
        _cach_con = _playlistTooltip.find('.dzstooltip--inner');

        var _cach = _cach_con.children().eq(arg);

        // console.log(_cach);

        var playerid = _cach.attr('data-playerid');


        // console.log('playerid && $(\'.audioplayer[data-playerid="\'+playerid+\'"]\').length && $(\'.audioplayer[data-playerid="\'+playerid+\'"]\').eq(0).get(0).api_play_media - ',playerid);
        // console.log('the-player - ', $('.audioplayer[data-playerid="'+playerid+'"],.audioplayer-tobe[data-playerid="'+playerid+'"]'));


        var _cach = $('.audioplayer[data-playerid="' + playerid + '"],.audioplayer-tobe[data-playerid="' + playerid + '"]');


        if (playerid && _cach.length && _cach.eq(0).get(0) && _cach.eq(0).get(0).api_play_media) {


          $('.audioplayer[data-playerid="' + playerid + '"]').eq(0).get(0).api_play_media({

            'called_from': 'api_sync_players_prev'
          });

        } else {


          if (_cach.parent().parent().parent().hasClass('audiogallery')) {
            _cach.parent().parent().parent().get(0).api_goto_item(arg);
          } else {

            // -- in case we change the page ;)
            change_media(_cach);
          }


        }

        selfClass.playlist_inner_currNr = arg;

      }
    }


    function player_setup_playlist_inner(pargs) {
      // -- setup playlist for footer


      var margs = {
        'call_from': "default"
      }

      if (pargs) {
        margs = $.extend(margs, pargs);
      }


      // console.log('player_setup_playlist_inner() dzsap_list_for_sync_players -4 ',dzsap_list_for_sync_players,margs,cthis);

      // console.log('dzsap_list_for_sync_players - dzsap_list_for_sync_players len - ', dzsap_list_for_sync_players.length, _playlistTooltip);


      if (_playlistTooltip) {
        (dzsap_list_for_sync_players.length) ? _playlistTooltip.parent().removeClass('is-empty') : _playlistTooltip.parent().addClass('is-empty');
        // -- clear all before adding
        _playlistTooltip.find('.dzstooltip--inner').html('');
        var aux = '';
        for (var lab in dzsap_list_for_sync_players) {
          // -- setup inner playlist for sticky player


          var _c = dzsap_list_for_sync_players[lab];

          if (_c.hasClass('number-wrapper') || _c.hasClass('for-number-wrapper')) {
            continue;
          }

          aux += '<div class="playlist-menu-item"';


          $.each(_c.get(0).attributes, function () {
            // -- we remember attributes in case the page has changed and we lost..
            if (this.specified && this.name && this.name != 'id' && this.name != 'style') {

              aux += ' ' + this.name + '="' + this.value + '"';
              // console.log(this.name, this.value);
            }
          });


          aux += '>';


          aux += '<div class="pi-thumb-con">';
          aux += '<div class="pi-thumb divimage" style="background-image: url(' + _c.attr('data-thumb') + ')">';
          aux += '</div>'
          aux += '</div>'
          aux += '<div class="pi-meta-con">';

          aux += '<div class="pi-the-artist">';
          aux += _c.find('.the-artist').eq(0).text();
          aux += '</div>';

          aux += '<div class="pi-the-name">';
          aux += _c.find('.the-name').eq(0).text();
          aux += '</div>';

          aux += '</div>';


          aux += '<div class="the-sort-handle">';
          aux += dzsapSvgs.svg_arrow_resize;
          aux += '</div>';

          aux += '</div>';

        }
        _playlistTooltip.find('.dzstooltip--inner').append(aux);


        cthis.on('mousedown', '.the-sort-handle', handle_mouse);
        $(document).on('mousemove.dzsap_playlist_item', function (e) {

          if (window.dzsap_moving_playlist_item) {

            var my = e.clientY;

            my -= dzsap_playlist_con.offset().top;

            // console.log(mx,my);

            dzsap_playlist_item_moving.css('top', my - 20);


            dzsap_playlist_item_target.parent().children(':not(".target-playlist-item"):not(".cloner")').each(function () {
              var _t = $(this);

              var tmy = _t.offset().top - dzsap_playlist_con.offset().top;


              // console.log(my,tmy);
              if (my > tmy) {
                _t.after(dzsap_playlist_item_target);
              }
            })

            if (my < 50) {
              dzsap_playlist_item_target.parent().prepend(dzsap_playlist_item_target);
            }
          }
        });
        $(document).on('mouseup.dzsap_playlist_item', function (e) {

          if (window.dzsap_moving_playlist_item) {

            window.dzsap_moving_playlist_item = false;


            dzsap_playlist_item_moving.parent().children('.cloner').remove();
            dzsap_playlist_item_target.removeClass('target-playlist-item');
            dzsap_playlist_item_moving.remove();
            dzsap_playlist_item_moving = null;
            dzsap_playlist_item_target = null;
          }
        })
      } else {
        console.error('no tooltip .. why, should be here?');
      }

    }


    function setup_controls_commentsHolder() {

      // console.log('setup_controlsselfClass._commentsHolder() - arguments - ',arguments);

      if (selfClass._commentsHolder && _commentsChildren) {

        // console.log(' _commentsChildren - ',_commentsChildren, cthis);
        _commentsChildren.each(function () {

          var _c = $(this);


          if (o.skinwave_comments_process_in_php == 'on') {

            if (_c && _c.hasClass && _c.hasClass('dzstooltip-con')) {
              if (_c.find('.dzstooltip > .dzstooltip--inner').length) {

              } else {
                // -- convert


                // console.error("CONVERT");
                _c.find('.dzstooltip').wrapInner('<div class="dzstooltip--inner"></div>');


                _c.find('.the-avatar').addClass('tooltip-indicator');
                _c.find('.dzstooltip').before(_c.find('.tooltip-indicator'));
                _c.find('.dzstooltip').addClass('talign-start style-rounded color-dark-light');
              }
            }
          }

          selfClass._commentsHolder.append(_c);
        })
      }

    }


    function setup_structure_extras() {

      // console.log('selfClass.skinwave_mode - ', selfClass.skinwave_mode);
      if (o.design_skin == 'skin-wave' && selfClass.skinwave_mode == 'bigwavo') {
        selfClass._audioplayerInner.after(selfClass._scrubbar);

        if (cthis.find('.feed-description')) {
          selfClass.$conControls.after(cthis.find('.feed-description').eq(0));
          selfClass.$conControls.next().removeClass('feed-description').addClass('song-desc');
        }
      }


      if (radio_update_song_name == false && selfClass._metaArtistCon.find('.the-name').length && selfClass._metaArtistCon.find('.the-name').eq(0).text().length > 0) {
        // -- we already have artist name..
        radio_update_song_name = false;
        if (selfClass._metaArtistCon.find('.the-name').eq(0).html().indexOf('&nbsp;&nbsp;') > -1) {
          radio_update_song_name = true;
        }
      } else {
        radio_update_song_name = true;
      }

      if (radio_update_artist_name == false && selfClass._metaArtistCon.find('.the-name').length && selfClass._metaArtistCon.find('.the-artist').eq(0).text().length > 0) {
        // -- we already have artist name..
        radio_update_artist_name = false;
        if (selfClass._metaArtistCon.find('.the-name').eq(0).html().indexOf('&nbsp;&nbsp;') > -1) {
          radio_update_artist_name = true;
        }
      } else {
        radio_update_artist_name = true;
      }


      if (o.disable_scrub == 'on') {
        cthis.addClass('disable-scrubbar');
      }
      if (o.design_animateplaypause != 'on') {
        // aux_str_con_controls+=' style="display:none"';
      } else {
        cthis.addClass('playing-animation');
      }

      if (o.design_skin == 'skin-wave' && o.embed_code != '') {
        if (o.design_skin == 'skin-wave') {

          if (o.enable_embed_button == 'on') {
            if (selfClass._apControlsRight) {
              selfClass._apControlsRight.appendOnce('<div class="btn-embed-code-con dzstooltip-con player-but"><div class="btn-embed-code "> <div class="the-icon-bg"></div> ' + dzsapSvgs.svg_embed_button + '</div><span class="dzstooltip transition-slidein arrow-bottom align-right skin-black " style="width: 350px; "><span style="max-height: 150px; overflow:hidden; display: block;">' + o.embed_code + '</span></span></div>');
            }
          }

        } else {
          if (o.enable_embed_button == 'on') {
            selfClass._audioplayerInner.appendOnce('<div class="btn-embed-code-con dzstooltip-con "><div class="btn-embed-code player-but "> <div class="the-icon-bg"></div> ' + dzsapSvgs.svg_embed_btn + '</div><span class="dzstooltip transition-slidein arrow-bottom align-right skin-black " style="width: 350px; "><span style="max-height: 150px; overflow:hidden; display: block;">' + o.embed_code + '</span></span></div>');
          }
        }

        cthis.on('click', '.btn-embed-code-con, .btn-embed', function () {
          var _t = $(this);

          // console.log(_t);
          dzsapHelpers.select_all(_t.find('.dzstooltip').get(0));
        })
        cthis.on('click', '.copy-embed-code-btn', function () {
          var _t = $(this);

          // console.log(_t);
          dzsapHelpers.select_all(_t.parent().parent().find('.dzstooltip--inner > span').get(0));

          document.execCommand('copy');
          setTimeout(function () {

            dzsapHelpers.select_all(_t.get(0));
          }, 100)
        })

        // cthis.on(' .btn-embed .dzstooltip').bind('click', function() {
        //     var _t = $(this);
        //
        //     console.log(_t);
        //     dzsapHelpers.select_all(_t.get(0));
        // })
      }

      if (o.footer_btn_playlist == 'on') {

        if (selfClass._apControlsRight.find('.btn-footer-playlist').length == 0) {

          selfClass._apControlsRight.append('<div class="btn-footer-playlist for-hover dzstooltip-con player-but"> <div class="tooltip-indicator tooltip-indicator--btn-footer-playlist"><div class="the-icon-bg"></div> ' + dzsapSvgs.svg_footer_playlist + '    </div><div class="dzstooltip playlist-tooltip style-default color-light-dark arrow-bottom talign-end transition-scaleup active2"><div class="dzstooltip--inner"> </div></div></div>');


          _playlistTooltip = cthis.find('.playlist-tooltip');


          setTimeout(function () {
            player_setup_playlist_inner();
          }, 100);

          setTimeout(function () {
            // player_setup_playlist_inner();
          }, 1000)
        }

      }

      if (o.settings_extrahtml != '') {

        // console.log('o.settings_extrahtml -> ', o.settings_extrahtml, index_extrahtml_toloads);

        if (String(o.settings_extrahtml).indexOf('{{get_likes}}') > -1) {
          selfClass.index_extrahtml_toloads++;
          ajax_get_likes();
        }
        if (String(o.settings_extrahtml).indexOf('{{get_plays}}') > -1) {
          selfClass.index_extrahtml_toloads++;
          (dzsapAjax.ajax_get_views.bind(selfClass))();
        } else {
          // console.log('selfClass.increment_views', selfClass.increment_views);
          if (selfClass.increment_views === 1) {
            (dzsapAjax.ajax_submit_views.bind(selfClass))();
            selfClass.increment_views = 2;
          }
        }

        if (String(o.settings_extrahtml).indexOf('{{get_rates}}') > -1) {
          selfClass.index_extrahtml_toloads++;
          ajax_get_rates();
        }
        o.settings_extrahtml = String(o.settings_extrahtml).replace('{{heart_svg}}', dzsapSvgs.svg_heart_icon);
        o.settings_extrahtml = String(o.settings_extrahtml).replace('{{embed_code}}', o.embed_code);


        if (selfClass.index_extrahtml_toloads == 0) {
          //console.log('lel',cthis.find('.extra-html'))

          cthis.find('.extra-html').addClass('active');
        }
        setTimeout(function () {

          //console.log('lel',cthis.find('.extra-html'))
          cthis.find('.extra-html').addClass('active');


          // console.log("cthis.find('.extra-html') -> ",cthis.find('.extra-html'))
          // console.log("cthis.find('.extra-html-extra') -> ",cthis.find('.extra-html-extra'))
          // cthis.find('.extra-html-extra').removeClass('dzsap-feed');

          if (cthis.find('.float-left').length == 0) {
            cthis.find('.extra-html').append(cthis.find('.extra-html-extra'));
          } else {
            cthis.find('.extra-html .float-left').append(cthis.find('.extra-html-extra'));
          }


          var _c = cthis.find('.extra-html-extra').children().eq(0);

          cthis.find('.extra-html-extra').children().unwrap();
          // if(_c.parent().hasClass('float-left')){                         }


          // console.log('o.settings_extrahtml->',o.settings_extrahtml);
          // console.log('cthis.find(\'.extra-html\').html()->',cthis.find('.extra-html').html());


          if (cthis.find('.extra-html').html().indexOf('dzsap-multisharer-but') > -1) {
            selfClass.isMultiSharer = true;


          }

        }, 2000);

      }

      if (cthis.find('.con-after-playpause').length) {
        selfClass.$conPlayPause.after(cthis.find('.con-after-playpause').eq(0));
      }

      if (cthis.find('.afterplayer').length > 0) {
        //console.log(cthis.children('.afterplayer'));
        cthis.append(cthis.find('.afterplayer'));
      }

    }

    function setup_structure_sanitizers() {

      if (cthis.hasClass('zoomsounds-wrapper-bg-bellow') && cthis.find('.dzsap-wrapper-buts').length === 0) {
        // console.log('NO WRAPPER BUTS - ',cthis.find('.ap-controls-right'));

        cthis.append('<div class="temp-wrapper"></div>');
        cthis.find('.temp-wrapper').append(selfClass.settings_extrahtml_in_float_right);
        cthis.find('.temp-wrapper').children('*:not(.dzsap-wrapper-but)').remove();
        cthis.find('.temp-wrapper > .dzsap-wrapper-but').unwrap();
        cthis.children('.dzsap-wrapper-but').each(function () {
          var aux = $(this).html();
          // console.log('aux - ',aux);

          aux = aux.replace('{{heart_svg}}', dzsapSvgs.svg_heart_icon);
          aux = aux.replace('{{svg_share_icon}}', dzsapSvgs.svg_share_icon);


          if ($(this).get(0) && $(this).get(0).outerHTML.indexOf('dzsap-multisharer-but') > -1) {
            selfClass.isMultiSharer = true;
            // console.log("selfClass.isMultiSharer -5 sw",selfClass.isMultiSharer);

          }

          $(this).html(aux);
        }).wrapAll('<div class="dzsap-wrapper-buts"></div>');
      }

      if (o.design_skin === 'skin-customcontrols') {


        // console.log('cthis.html() - ',cthis.html());
        cthis.html(String(cthis.html()).replace('{{svg_play_icon}}', dzsapSvgs.svg_play_icon));
        cthis.html(String(cthis.html()).replace('{{svg_pause_icon}}', dzsapSvgs.pausebtn_svg));

      }
    }


    function check_multisharer() {

      // -- we setup a box main here as a child of body


      cthis.find('.dzsap-multisharer-but').data('cthis', cthis);
      // console.log("WE SETUP HERE", cthis.find('.dzsap-multisharer-but').data('cthis'), 'selfClass.isMultiSharer - ',selfClass.isMultiSharer);

      cthis.data('embed_code', o.embed_code);


      if (selfClass.isMultiSharer) {
        window.dzsap_init_multisharer()
      }

    }

    function setup_pcm_random_for_now(pargs) {


      var margs = {
        call_from: 'default'
      }


      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      var default_pcm = [];

      if (!(o.pcm_data_try_to_generate == 'on' && o.pcm_data_try_to_generate_wait_for_real_pcm == 'on')) {
        for (var i3 = 0; i3 < 200; i3++) {
          default_pcm[i3] = Number(Math.random()).toFixed(2);
        }
        default_pcm = JSON.stringify(default_pcm);

        cthis.addClass('rnd-pcm-for-now')
        cthis.attr('data-pcm', default_pcm);
      }


      dzsapHelpers.scrubbar_modeWave_setupCanvas({}, selfClass);
      ;

    }


    function setup_structure_scrub() {
      if (o.skinwave_enableSpectrum != 'on') {

        if (o.skinwave_wave_mode == 'canvas') {
          // console.log('verify pcm - ',cthis, cthis.attr('data-pcm'));

          if (cthis.attr('data-pcm')) {
            selfClass.isRealPcm = true;
            dzsapHelpers.scrubbar_modeWave_setupCanvas({}, selfClass);
          } else {
            setup_pcm_random_for_now();
          }


        } else {
          if (o.skinwave_wave_mode == 'line') {


          }
          if (o.skinwave_wave_mode == 'image') {

            var aux = '<img class="scrub-bg--img" src="' + cthis.attr('data-scrubbg') + '"/>'
            selfClass._scrubbar.children('.scrub-bg').eq(0).append(aux);

            setTimeout(function () {

              scrubbar_reveal();
            }, 300);
            aux = '<img class="scrub-prog--img" src="' + cthis.attr('data-scrubprog') + '"/>'
            selfClass._scrubbar.children('.scrub-prog').eq(0).append(aux);

            setTimeout(function () {

              scrubbar_reveal();
            }, 300);

          }


        }


      } else {

        // -- spectrum ON

        dzsapHelpers.scrubbar_modeWave_setupCanvas({}, selfClass);
        // -- old spectrum code
        // selfClass._scrubbar.children('.scrub-bg').eq(0).append('<canvas class="scrub-bg-canvas" style="width: 100%; height: 100%;"></canvas><div class="wave-separator"></div>');
        _scrubBgCanvas = cthis.find('.scrub-bg-img').eq(0);
        //console.log('_scrubBgCanvas - ',_scrubBgCanvas)
        _scrubBgCanvasCtx = _scrubBgCanvas.get(0).getContext("2d");


      }

    }


    function ajax_get_likes(argp) {
      //only handles ajax call + result
      var mainarg = argp;
      var data = {
        action: 'dzsap_get_likes',
        postdata: mainarg,
        playerid: selfClass.the_player_id
      };


      if (selfClass.urlToAjaxHandler) {


        $.ajax({
          type: "POST",
          url: selfClass.urlToAjaxHandler,
          data: data,
          success: function (response) {
            if (window.console) {
              // console.log('Got this from the server: ' + response);
            }

            var auxls = false;
            if (response.indexOf('likesubmitted') > -1) {
              response = response.replace('likesubmitted', '');
              auxls = true;
            }


            if (response == '') {
              response = 0;
            }


            var _cach = cthis.find('.extra-html').eq(0);

            // console.log('_cach - ',_cach);


            _cach.css('opacity', '');
            var auxhtml = _cach.html();
            auxhtml = auxhtml.replace('{{get_likes}}', response);
            _cach.html(auxhtml);
            selfClass.index_extrahtml_toloads--;
            if (auxls) {
              cthis.find('.extra-html').find('.btn-like').addClass('active');
            }


            //console.log(selfClass.index_extrahtml_toloads);
            if (selfClass.index_extrahtml_toloads == 0) {
              cthis.find('.extra-html').addClass('active');
            }

          },
          error: function (arg) {
            if (window.console) {
              // console.log('Got this from the server: ' + arg, arg);
            }
            ;
            selfClass.index_extrahtml_toloads--;
            if (selfClass.index_extrahtml_toloads == 0) {
              cthis.find('.extra-html').addClass('active');
            }
          }
        });
      }

    }

    function ajax_get_rates(argp) {
      //only handles ajax call + result
      var mainarg = argp;
      var data = {
        action: 'dzsap_get_rate',
        postdata: mainarg,
        playerid: selfClass.the_player_id
      };


      if (selfClass.urlToAjaxHandler) {

        $.ajax({
          type: "POST",
          url: selfClass.urlToAjaxHandler,
          data: data,
          success: function (response) {
            if (typeof window.console != "undefined") {
              // console.log('Got this from the server: ' + response);
            }

            var auxls = false;
            if (response.indexOf('likesubmitted') > -1) {
              response = response.replace('likesubmitted', '');
              auxls = true;
            }


            if (response == '') {
              response = '0|0';
            }


            var auxresponse = response.split('|');


            starrating_nrrates = auxresponse[1];
            cthis.find('.extra-html .counter-rates .the-number').eq(0).html(starrating_nrrates);
            selfClass.index_extrahtml_toloads--;


            cthis.find('.star-rating-set-clip').width(auxresponse[0] * (parseInt(cthis.find('.star-rating-bg').width(), 10) / 5));


            //===ratesubmitted
            if (typeof (auxresponse[2]) != 'undefined') {
              selfClass.starrating_alreadyrated = auxresponse[2];


              if (o.parentgallery && $(o.parentgallery).get(0) != undefined && $(o.parentgallery).get(0).api_player_rateSubmitted != undefined) {
                $(o.parentgallery).get(0).api_player_rateSubmitted();
              }
            }


            if (selfClass.index_extrahtml_toloads <= 0) {
              cthis.find('.extra-html').addClass('active');
            }

          },
          error: function (arg) {
            if (typeof window.console != "undefined") {
              // console.log('Got this from the server: ' + arg, arg);
            }
            ;
            selfClass.index_extrahtml_toloads--;
            if (selfClass.index_extrahtml_toloads <= 0) {
              cthis.find('.extra-html').addClass('active');
            }
          }
        });
      }
    }


    ;


    function ajax_submit_download(argp) {
      //only handles ajax call + result
      var mainarg = argp;
      var data = {
        action: 'dzsap_submit_download',
        postdata: mainarg,
        playerid: selfClass.the_player_id
      };

      if (selfClass.starrating_alreadyrated > -1) {
        return;
      }

      if (selfClass.urlToAjaxHandler) {

        $.ajax({
          type: "POST",
          url: selfClass.urlToAjaxHandler,
          data: data,
          success: function (response) {
            // console.log('Got this from the server: ' + response);


          },
          error: function (arg) {
            // console.log('Got this from the server: ' + arg, arg);


          }
        });
      }
    };


    function setup_media(pargs) {
      // -- order = init, setup_media, init_loaded


      //                return;


      var margs = {

        'do_not_autoplay': false
        , 'called_from': 'default'
      };


      if (pargs) {
        margs = $.extend(margs, pargs);
      }
      // console.log('%c --- #setup_media()', 'background-color: #eaeaea;', cthis.attr('data-source'), o.cue,selfClass.ajax_view_submitted, margs, loaded, 'cthis - ', cthis, 'o.preload_method -'  , o.preload_method, 'loaded - ',loaded);


      // -- these types should not exist
      if (selfClass.audioType == 'icecast' || selfClass.audioType == 'shoutcast') {
        selfClass.audioType = 'selfHosted';
      }

      if (o.cue == 'off') {
        //console.log(selfClass.ajax_view_submitted);
        if (selfClass.ajax_view_submitted == 'auto') {


          // -- why is view submitted ?
          selfClass.increment_views = 1;

          // console.log(o.settings_extrahtml);
          if (String(o.settings_extrahtml).indexOf('{{get_plays}}') > -1) {
            selfClass.ajax_view_submitted = 'on'
          } else {
            selfClass.ajax_view_submitted = 'off';
          }
          ;
        }
      }


      //console.log(type, o.type, loaded);

      if (selfClass.playerIsLoaded == true) {
        return;
      }


      if (cthis.attr('data-original-type') == 'youtube') {
        return;
      }

      // console.log("SETUP MEDIA", margs, type);


      if (selfClass.audioType == 'youtube') {

        load_yt_api();


        if (String(cthis.attr('data-source')).indexOf('youtube.com/watch')) {

          var dataSrc = cthis.attr('data-source');
          var auxa = String(dataSrc).split('youtube.com/watch?v=');
//                            console.log(auxa);
          if (auxa[1]) {

            dataSrc = auxa[1];
            if (auxa[1].indexOf('&') > -1) {
              var auxb = String(auxa[1]).split('&');
              dataSrc = auxb[0];
            }

            cthis.attr('data-source', dataSrc);
          }
        }
      }


      if (selfClass.audioType == 'youtube') {
        if (o.settings_exclude_from_list != 'on' && dzsap_list && dzsap_list.indexOf(cthis) == -1) {
          if (dzsap_list) {

            if (cthis.attr('data-do-not-include-in-list') != 'on') {
              dzsap_list.push(cthis);
            }
          }
        }
        dzsap_yt_list.push(cthis);


        // -- clear on change media
        if (margs.called_from == 'change_media') {
          yt_inited = false;
          if (selfClass.$mediaNode_ && selfClass.$mediaNode_.destroy) {

            selfClass.$mediaNode_.destroy();
            console.log("DESTROYED LAST PLAYERS");
          }
          selfClass.$theMedia.children().remove();
        }


        selfClass.$theMedia.append('<div id="' + yt_curr_id + '"></div>');
        cthis.get(0).fn_yt_ready = youtube_checkReady;

        if (window.YT) {
          youtube_checkReady(yt_curr_id);
        }


        cthis.addClass('media-setuped');
        cthis.addClass('meta-loaded');

        if (selfClass._sourcePlayer) {
          selfClass._sourcePlayer.addClass('meta-loaded');
        }
      }


      var str_open_audio_tag = '';
      var aux_source = '';
      var str_close_audio_tag = '';

      if (dzsapHelpers.is_ios()) {
        o.preload_method = 'metadata';
      }


      if (selfClass.audioType == 'selfHosted' || selfClass.audioType == 'soundcloud') {
        str_open_audio_tag += '<audio';
        str_open_audio_tag += ' preload="' + o.preload_method + '"';
        if (o.skinwave_enableSpectrum == 'on') {
          str_open_audio_tag += ' crossOrigin="anonymous"';
          // str_open_audio_tag += ' src="'+cthis.attr('data-source')+'"';
        }

        if (dzsapHelpers.is_ios()) {
          if (margs.called_from == 'change_media') {
            str_open_audio_tag += ' autoplay';
          }
        }

        str_open_audio_tag += '>';
        aux_source = '';

        // console.log('cthis.attr("data-source")', cthis.attr('data-source'));
        if (selfClass.data_source) {

          if (!selfClass.data_source && type_normal_stream_type != 'icecast') {
            selfClass.data_source = cthis.attr('data-source');
          }

          // console.log('selfClass.data_source'+' - '+selfClass.data_source)
          if (selfClass.data_source != 'fake') {
            aux_source += '<source src="' + selfClass.data_source + '" type="audio/mpeg">';
            if (cthis.attr('data-sourceogg') != undefined) {
              aux_source += '<source src="' + cthis.attr('data-sourceogg') + '" type="audio/ogg">';
            }
          } else {
            cthis.addClass('meta-loaded meta-fake');
          }
        }
        str_close_audio_tag += '</audio>';


        //console.log(str_open_audio_tag, selfClass.$theMedia);

        str_audio_element = str_open_audio_tag + aux_source + str_close_audio_tag;

        // console.log(' .final_aux - ', str_audio_element, selfClass.$theMedia);


        // -- change media
        if (margs.called_from == 'change_media') {
          if (selfClass.$watermarkMedia_ && selfClass.$watermarkMedia_.pause) {
            selfClass.$watermarkMedia_.pause();
          }
          selfClass.$theMedia.find('.the-watermark').remove();
          selfClass.$watermarkMedia_ = null;
          if (dzsapHelpers.is_ios() || dzsapHelpers.is_android()) {

            // -- we append only the source to mobile devices as we need the thing to autoplay without user action

            if (selfClass.$mediaNode_) {
              selfClass.$theMedia.children().remove();
              $(selfClass.$mediaNode_).append(aux_source);

              selfClass.$mediaNode_.addEventListener('loadedmetadata', function (e) {

                cthis.addClass('meta-loaded');
                cthis.removeClass('meta-fake');
                if (selfClass._sourcePlayer) {
                  selfClass._sourcePlayer.addClass('meta-loaded');
                }
              }, true);

              if (selfClass.$mediaNode_.load) {

                selfClass.$mediaNode_.load();
              }
            }

          } else {
            // -- normal desktop

            // console.log('%c .str_audio_element - ', 'background-color: #dada20;',str_audio_element);
            selfClass.$theMedia.append(str_audio_element);
            selfClass.$mediaNode_ = (selfClass.$theMedia.children('audio').get(0));
          }
        } else {

          selfClass.$theMedia.children().remove();
          selfClass.$theMedia.append(str_audio_element);
          selfClass.$mediaNode_ = (selfClass.$theMedia.children('audio').get(0));
          // console.log("selfClass.$theMedia.html() - ",selfClass.$theMedia.html());


          if (dzsapHelpers.is_ios() || dzsapHelpers.is_android()) {
            if (margs.called_from == 'retrieve_soundcloud_url') {
              setTimeout(function () {
                pause_media();
              }, 500);
            }
          }
        }

        if (cthis.attr('data-soft-watermark')) {
          //type="audio/wav"

          //console.log('add watermark');
          selfClass.$theMedia.append('<audio class="the-watermark" preload="metadata" loop><source src="' + cthis.attr('data-soft-watermark') + '" /></audio>');
          selfClass.$watermarkMedia_ = selfClass.$theMedia.find('.the-watermark').get(0);

          if (selfClass.$watermarkMedia_.volume) {
            selfClass.$watermarkMedia_.volume = defaultVolume * o.watermark_volume;
          }
          //console.log(selfClass.$watermarkMedia_);
        }

        // console.log(margs);


        //return;
        //selfClass.$theMedia.children('audio').get(0).autoplay = false;


        // console.log('cthis.attr(\'data-source\') - ',cthis.attr('data-source'));
        if (selfClass.$mediaNode_ && selfClass.$mediaNode_.addEventListener && cthis.attr('data-source') != 'fake') {

          func_audio_error = function (e) {
            console.log('errored out', this, this.audioElement, this.duration, e, e.target.error);
            var noSourcesLoaded = (this.networkState === HTMLMediaElement.NETWORK_NO_SOURCE);
            if (noSourcesLoaded && dzsapHelpers.dzsap_is_mobile() == false) {
              if (cthis.hasClass('errored-out') == false) {
                console.log("%c could not load audio source - ", 'color:#ff2222;', cthis.attr('data-source'));

                if (attempt_reload < 5) {
                  setTimeout(function (earg) {

                    // console.log("ERROR !!!", selfClass.$mediaNode_, selfClass.$mediaNode_.src, cthis.attr('data-source'), earg);
                    // console.log(earg.target.error)

                    if (selfClass.$mediaNode_) {

                      selfClass.$mediaNode_.src = '';
                    }
                    // selfClass.$mediaNode_.load();


                    setTimeout(function () {

                      // console.log(selfClass.$mediaNode_, selfClass.$mediaNode_.src, cthis.attr('data-source'));

                      if (selfClass.$mediaNode_) {
                        selfClass.$mediaNode_.src = cthis.attr('data-source');
                        selfClass.$mediaNode_.load();
                      }
                    }, 1000)


                  }, 1000, e)
                  attempt_reload++;
                } else {


                  if (o.notice_no_media == 'on') {

                    //&& e.target && e.target.error && (e.target.error.code==1 || e.target.error.code==2|| e.target.error.code==3|| e.target.error.code==5)


                    cthis.addClass('errored-out');

                    var txt = 'error - file does not exist...';
                    if (e.target.error) {
                      txt = e.target.error.message;
                    }


                    cthis.append('<div class="feedback-text">' + txt + ' </div>');
                  }
                }
              }
            }


          }
          selfClass.$mediaNode_.addEventListener('error', func_audio_error, true);
          selfClass.$mediaNode_.addEventListener('loadedmetadata', function (e) {
            // console.log('loadedmetadata', this, this.audioElement, this.duration, cthis);
            cthis.addClass('meta-loaded');
            cthis.removeClass('meta-fake');

            if (selfClass._sourcePlayer) {
              selfClass._sourcePlayer.addClass('meta-loaded');
              selfClass._sourcePlayer.removeClass('meta-fake');
            }
            // console.log('add metaloaded here');


            // console.log('margs.called_from - ', margs.called_from, cthis);
            if (margs.called_from == 'change_media') {
              if (cthis.hasClass('init-loaded') == false) {
                init_loaded({
                  'call_from': 'force_reload_change_media'
                })
              }


            }
            if (margs.called_from == 'change_media' || selfClass._sourcePlayer) {
              if (volume_lastVolume) {
                setTimeout(() => {

                  volume_setVolume(volume_lastVolume, {
                    call_from: "change_media"
                  });
                }, 50);
              }
            }


          }, true);
        }


        //console.log(cthis,type);
        if (selfClass.audioType != 'fake') {

          //return false;
        }

        //alert(selfClass.$mediaNode_);
      }

      // console.log("MEDIA SETUPED",selfClass.$conPlayPause);
      cthis.addClass('media-setuped');
      //selfClass.$conPlayPause.off('click');


      if (margs.called_from == 'change_media') {
        return false;
      }

      if (selfClass.audioType != 'youtube') {
        if (cthis.attr('data-source') == 'fake') {
          if (dzsapHelpers.is_ios() || dzsapHelpers.is_android()) {
            init_loaded(margs);
          }
        } else {
          if (dzsapHelpers.is_ios()) {

            setTimeout(function () {
              init_loaded(margs);
            }, 1000);


          } else {

            // -- check_ready() will fire init_loaded()
            inter_checkReady = setInterval(function () {
              check_ready(margs);
            }, 50);
            //= setInterval(check_ready, 50);
          }

        }


        if (o.preload_method == 'none') {

          // console.log(window.dzsap_player_index);
          setTimeout(function () {
            if (selfClass.$mediaNode_) {

              $(selfClass.$mediaNode_).attr('preload', 'metadata');
            }
          }, (Number(window.dzsap_player_index) + 1 * 18000));
        }


        if (o.design_skin == 'skin-customcontrols' || o.design_skin == 'skin-customhtml') {
          cthis.find('.custom-play-btn,.custom-pause-btn').off('click');
          cthis.find('.custom-play-btn,.custom-pause-btn').on('click', click_playpause);
        }

        if (o.failsafe_repair_media_element) {
          setTimeout(function () {

            if (selfClass.$theMedia.children().eq(0).get(0) && selfClass.$theMedia.children().eq(0).get(0).nodeName == "AUDIO") {
              //console.log('ceva');
              return false;
            }
            selfClass.$theMedia.html('');
            selfClass.$theMedia.append(str_audio_element);

            var aux_wasplaying = selfClass.player_playing;

            pause_media();
            selfClass.$mediaNode_ = (selfClass.$theMedia.children('audio').get(0));


            if (aux_wasplaying) {
              aux_wasplaying = false;
              setTimeout(function () {

                play_media({
                  'called_from': 'aux_was_playing'
                });
              }, 20);
            }
          }, o.failsafe_repair_media_element);

          o.failsafe_repair_media_element = '';

        }
      }

      if (o.design_skin == 'skin-wave') {
        if (o.skinwave_enableSpectrum == 'on') {
          dzsapHelpers.player_initSpectrumOnUserAction(selfClass);
        }
      }


      // dzsapHelpers.is_ios() ||


      setuped_media = true;


    }

    function destroy_cmedia() {
      // -- destroy cmedia
      if (selfClass.$mediaNode_) {

        selfClass.$mediaNode_.removeEventListener('error', func_audio_error, true);
      }
      $(selfClass.$mediaNode_).remove();
      selfClass.$mediaNode_ = null;
      setuped_media = false;
      selfClass.playerIsLoaded = false;
    }

    function destroy_media() {
      //console.log("destroy_media()", cthis)
      pause_media();


      if (selfClass.$mediaNode_) {

        //console.log(selfClass.$mediaNode_, selfClass.$mediaNode_.src);
        if (selfClass.$mediaNode_.children) {

          //selfClass.$mediaNode_.children().remove();
        }

        //console.log(selfClass.$mediaNode_.innerHTML);
        if (o.type == 'audio') {
          selfClass.$mediaNode_.innerHTML = '';
          selfClass.$mediaNode_.load();
        }
        //console.log(selfClass.$mediaNode_.innerHTML);

        //selfClass.$mediaNode_.remove();
      }

      if (dzsapHelpers.is_ios() || dzsapHelpers.is_android()) {
      } else {
        if (selfClass.$theMedia) {

          selfClass.$theMedia.children().remove();
          selfClass.playerIsLoaded = false;
        }
      }

      destroy_cmedia();

    }

    function setup_listeners() {


      if (setuped_listeners) {
        return false;
      }
      // console.log('setup_listeners()');

      setuped_listeners = true;


      // -- adding scrubbar listeners
      selfClass._scrubbar.unbind('mousemove');
      selfClass._scrubbar.unbind('mouseleave');
      selfClass._scrubbar.unbind('click');
      selfClass._scrubbar.bind('mousemove', handleMouseOnScrubbar);
      selfClass._scrubbar.bind('mouseleave', handleMouseOnScrubbar);
      selfClass._scrubbar.bind('click', handleMouseOnScrubbar);

      // cthis.on('');


      selfClass.$controlsVolume.on('click', '.volumeicon', volume_handleClickMuteIcon);

      selfClass.$controlsVolume.bind('mousemove', volume_handleMouse);
      selfClass.$controlsVolume.bind('mousedown', volume_handleMouse);


      // $(document).undelegate(window, 'mouseup', mouse_volumebar);
      $(document).on('mouseup', window, volume_handleMouse);

      if (o.design_skin == 'skin-silver') {
        cthis.on('click', '.volume-holder', volume_handleMouse);
      }

      cthis.find('.playbtn').unbind('click');


      //                console.log('setup_listeners()');

      setTimeout(handleResize, 300);
      // setTimeout(handleResize,1000);
      setTimeout(handleResize, 2000);

      if (o.settings_trigger_resize > 0) {
        inter_trigger_resize = setInterval(handleResize, o.settings_trigger_resize);
      }


      cthis.addClass('listeners-setuped');


      return false;

      //                console.log('ceva');
    }

    function click_like() {
      // console.log('zoomsounds - click_like()');
      var _t = $(this);
      if (cthis.has(_t).length == 0) {
        return;
      }

      if (_t.hasClass('active')) {
        (dzsapAjax.ajax_retract_like.bind(selfClass))();
      } else {
        (dzsapAjax.ajax_submit_like.bind(selfClass))();
      }
    }


    function get_last_vol() {
      return volume_lastVolume;
    }

    function init_loaded(pargs) {

      if (cthis.attr('id') == 'apminimal') {
      }
      // console.log('init_loaded() - ', pargs, cthis, cthis.hasClass('loaded'));
      if (cthis.hasClass('dzsap-loaded')) {
        return;
      }

      var margs = {

        'do_not_autoplay': false
        , 'call_from': 'init'
      };


      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      // console.log('[dzsap] [init] init_loaded()',margs);

      setTimeout(function () {
        safe_to_change_track = true;
      }, 5000);


      if (typeof (selfClass.$mediaNode_) != "undefined" && selfClass.$mediaNode_) {
        if (selfClass.$mediaNode_.nodeName == 'AUDIO') {
          //console.log(selfClass.$mediaNode_);
          selfClass.$mediaNode_.addEventListener('ended', handle_end);
        }
      }


      //console.log("CLEAR THE TIMEOUT HERE")
      clearInterval(inter_checkReady);
      clearTimeout(inter_checkReady);
      setup_listeners();
      //console.log('setuped_listeners', cthis.hasClass('dzsap-loaded'), cthis)


      setTimeout(function () {

        //console.log(selfClass.$currTime, )
        if (selfClass.$currTime && selfClass.$currTime.outerWidth() > 0) {
          currTime_outerWidth = selfClass.$currTime.outerWidth();
        }
      }, 1000);


      // -- this comes from cue off, no pcm data


      dzsapWaveFunctions.scrubModeWave__checkIfWeShouldTryToGetPcm(selfClass, {
        called_from: 'init_loaded()'
      });


      //console.log('type - ',type);
      //console.log('initLoaded() - margs - ',margs);


      if (selfClass.audioType != 'fake' && margs.call_from != 'force_reload_change_media') {
        if (o.settings_exclude_from_list != 'on' && dzsap_list && dzsap_list.indexOf(cthis) == -1) {
          if (selfClass._actualPlayer == null) {
            dzsap_list.push(cthis);
          }
        }


        if (o.type_audio_stop_buffer_on_unfocus == 'on') {


          cthis.data('type_audio_stop_buffer_on_unfocus', 'on');

          cthis.get(0).api_destroy_for_rebuffer = function () {

            if (o.type == 'audio') {
              playfrom = selfClass.$mediaNode_.currentTime;
            }
            //console.log(playfrom);
            destroy_media();

            destroyed_for_rebuffer = true;
          }

        }
      }

      //console.log("CHECK TIME",cthis);


      //console.log(selfClass.ajax_view_submitted);

      if (selfClass.ajax_view_submitted == 'auto') {
        setTimeout(function () {
          if (selfClass.ajax_view_submitted == 'auto') {
            selfClass.ajax_view_submitted = 'off';
          }
        }, 1000);
      }

      //console.log('---- ADDED LOADED BUT FROM WHERE', cthis);
      selfClass.playerIsLoaded = true;

      if (selfClass.data_source != 'fake') {

        cthis.addClass('dzsap-loaded');
      }

      //                console.log(playfrom);

      if (o.default_volume == 'default') {
        defaultVolume = 1;
      }

      if (isNaN(Number(o.default_volume)) == false) {
        defaultVolume = Number(o.default_volume);
      } else {
        if (o.default_volume == 'last') {


          if (localStorage != null && selfClass.the_player_id) {

            //console.log(selfClass.the_player_id);


            if (localStorage.getItem('dzsap_last_volume_' + selfClass.the_player_id)) {

              defaultVolume = localStorage.getItem('dzsap_last_volume_' + selfClass.the_player_id);
            } else {

              defaultVolume = 1;
            }
          } else {

            defaultVolume = 1;
          }
        }
      }

      if (o.volume_from_gallery) {
        defaultVolume = o.volume_from_gallery;
      }


      // console.log(pargs);
      // console.log('[dzsap] [volume] defaultVolume - ', defaultVolume);
      volume_setVolume(defaultVolume, {
        call_from: "from_init_loaded"
      });


      if (selfClass.pseudo_sample_time_start) {
        playfrom = (selfClass.pseudo_sample_time_start);
      }
      // console.log('playfrom -> ',playfrom);
      if (dzsHelpers.isInt(playfrom)) {
        seek_to(playfrom, {
          call_from: 'from_playfrom'
        });
      }


      // TODO: debug
      // localStorage['dzsap_' + selfClass.the_player_id + '_lastpos'] = 10;
      if (playfrom == 'last') {
        // -- here we save last position
        if (typeof Storage != 'undefined') {
          setTimeout(function () {
            playfrom_ready = true;
          })


          if (typeof localStorage['dzsap_' + selfClass.the_player_id + '_lastpos'] != 'undefined') {

            // console.log("LETS SEEK TO lastposition -3 ",localStorage['dzsap_' + selfClass.the_player_id + '_lastpos'])
            seek_to(localStorage['dzsap_' + selfClass.the_player_id + '_lastpos'], {
              'call_from': 'last_pos'
            });
          }
        }
      }
      //return false ;

      //                console.log(cthis, o.autoplay);


      if (margs.do_not_autoplay != true) {

        if (o.autoplay == 'on' && o.cue == 'on') {
          // console.log('margs.do_not_autoplay - ', margs.do_not_autoplay, margs,o);
          play_media({
            'called_from': 'do not autoplay not true ( init_loaded() ) '
          });
        }
        ;
      }

      if (selfClass.$mediaNode_ && selfClass.$mediaNode_.duration) {
        cthis.addClass('meta-loaded');
      }


      // -- init loaded()


      // if(debug_var2){
      //
      //     debug_var2 = false;
      // }

      // console.log('called check_time() - ',cthis);

      handleTickChange({
        'fire_only_once': false
      });

      if (o.autoplay == 'off') {
        sw_suspend_enter_frame = true;
      }

      cthis.addClass('init-loaded');

      setTimeout(function () {
        //console.log(cthis.find('.wave-download'));

        get_times({
          'call_from': 'set timeout 500'
        });
        handleTickChange({
          'fire_only_once': true
        });

        cthis.find('.wave-download').bind('click', handle_mouse);
      }, 500);

      setTimeout(function () {
        //console.log(cthis.find('.wave-download'));

        get_times({
          'call_from': 'set timeout 1000'
        });

        handleTickChange({
          'fire_only_once': true
        });


      }, 1000);


      setTimeout(function () {

        // console.log('selfClass.$mediaNode_.duration - ',selfClass.$mediaNode_.duration)
      }, 2000);


      // console.log('init_loaded - ',o.action_video_contor_60secs);
      if (inter_60_secs_contor == 0 && o.action_video_contor_60secs) {
        inter_60_secs_contor = setInterval(count_60secs, 30000);
      }


    }


    function count_60secs() {

      // console.log('count it',o.action_video_contor_60secs,cthis.hasClass('is-playing'));
      if (o.action_video_contor_60secs && cthis.hasClass('is-playing')) {
        o.action_video_contor_60secs(cthis, '');
      }
    }


    function handle_mouse(e) {
      var _t = $(this);

      // console.log('handle_mouse() _t - ',_t);

      if (e.type == 'click') {
        if (_t.hasClass('wave-download')) {
          ajax_submit_download();
        }
        if (_t.hasClass('prev-btn')) {
          click_prev_btn();
        }
        if (_t.hasClass('next-btn')) {
          click_next_btn();
        }
        if (_t.hasClass('tooltip-indicator--btn-footer-playlist')) {

          _t.parent().find('.dzstooltip').toggleClass('active');
        }
        if (_t.hasClass('playlist-menu-item')) {


          var ind = _t.parent().children().index(_t);


          console.log('ind - ', ind);

          playlist_goto_item(ind, {
            'call_from': 'handle_mouse'
          })


        }
        if (_t.hasClass('zoomsounds-btn-go-beginning')) {

          var _target = cthis;
          if (selfClass._actualPlayer) {
            _target = selfClass._actualPlayer;
          }

          _target.get(0).api_seek_to_0();
        }
        if (_t.hasClass('zoomsounds-btn-step-backward')) {

          var _target = cthis;
          if (selfClass._actualPlayer) {
            _target = selfClass._actualPlayer;
          }

          _target.get(0).api_step_back();
        }
        if (_t.hasClass('zoomsounds-btn-step-forward')) {

          var _target = cthis;
          if (selfClass._actualPlayer) {
            _target = selfClass._actualPlayer;
          }

          _target.get(0).api_step_forward();
        }
        if (_t.hasClass('zoomsounds-btn-slow-playback')) {
          var _target = cthis;
          if (selfClass._actualPlayer) {
            _target = selfClass._actualPlayer;
          }

          _target.get(0).api_playback_slow();
        }
        if (_t.hasClass('zoomsounds-btn-reset')) {
          var _target = cthis;
          if (selfClass._actualPlayer) {
            _target = selfClass._actualPlayer;
          }

          _target.get(0).api_playback_reset();
        }
        if (_t.hasClass('btn-zoomsounds-download')) {
          ajax_submit_download();
        }
        if (_t.hasClass('dzsap-repeat-button')) {

          // console.log("REPEAT");
          if (selfClass.player_playing) {
          }
          seek_to(0, {
            call_from: "repeat"
          });
        }
        if (_t.hasClass('dzsap-loop-button')) {

          if (_t.hasClass('active')) {
            _t.removeClass('active');
            loop_active = false;
          } else {

            _t.addClass('active');
            loop_active = true;

          }
          console.log('loop_active - ', loop_active, cthis);


        }
      }
      if (e.type == 'mousedown') {

        // console.log('mouse down');

        var _con = _t.parent();

        _con.parent().append(_con.clone().addClass('cloner'));
        var _clone = _con.parent().children('.cloner').eq(0);

        dzsap_playlist_con = _con.parent();
        dzsap_moving_playlist_item = true;

        dzsap_playlist_item_target = _con;
        dzsap_playlist_item_moving = _clone;
        _con.addClass('target-playlist-item');


      }
      if (e.type == 'mouseover') {
      }
      if (e.type == 'mouseenter') {
        // console.log('mouseenter');

        if (o.preview_on_hover == 'on') {
          seek_to_perc(0);

          play_media({
            'called_from': 'preview_on_hover'
          });
          console.log('mouseover');
        }

        window.dzsap_mouseover = true;
      }
      if (e.type == 'mouseleave') {
        // console.log('mouseleave');


        if (o.preview_on_hover == 'on') {
          seek_to_perc(0);

          pause_media();
        }
        window.dzsap_mouseover = false;
      }
    }

    function mouse_starrating(e) {
      var _t = $(this);

      // console.log('mouse_starrating ' , e.type, _t);


      if (cthis.has(_t).length == 0) {
        return;
      }

      if (e.type == 'mouseleave') {


        var auxnr = Number(cthis.find('.star-rating-con').eq(0).attr('data-initial-rating-index')) * 100;


        // console.log('selfClass.starrating_alreadyrated - ',selfClass.starrating_alreadyrated);
        if (selfClass.starrating_alreadyrated > -1 && selfClass.starrating_alreadyrated > 0) {
          auxnr = selfClass.starrating_alreadyrated * 100 / 5;
        }

        cthis.find('.rating-prog').css({
          'width': auxnr + '%'
        })


      }
      if (e.type == 'mousemove') {
        //console.log(_t);
        var mx = e.pageX - _t.offset().left;
        var my = e.pageX - _t.offset().left;

        // console.log('Math.round(mx/ (_t.outerWidth()/5)) - ' , Math.round(mx/ (_t.outerWidth()/5)) );
        // console.log('selfClass.starrating_alreadyrated - ' , selfClass.starrating_alreadyrated );


        starrating_index = Math.round(mx / (_t.outerWidth() / 5));


        if (starrating_index > 4) {
          starrating_index = 5;
        } else {
          starrating_index = Math.round(starrating_index);
        }

        if (starrating_index < 1) {
          starrating_index = 1;
        }

        //                    console.log(starrating_index, cthis.find('.star-rating-prog-clip'));

        // console.log('starrating_index - ',starrating_index);
        // console.log('(starrating_index/5 * 100) - ',(starrating_index/5 * 100));
        cthis.find('.rating-prog').css({
          'width': (starrating_index / 5 * 100) + '%'
        })

        selfClass.starrating_alreadyrated = -1;


        cthis.find('.star-rating-set-clip').css({
          'opacity': 0
        })
      }
      if (e.type == 'click') {


        if (selfClass.starrating_alreadyrated > -1 && selfClass.starrating_alreadyrated > 0) {
          return;
        }

        (dzsapAjax.ajax_submit_rating.bind(selfClass))(starrating_index);
      }


    }


    // log if an error occurs
    function onError(e) {
      console.log(e);
    }

    function draw_curr_time() {

      // -- draw current time -- called onEnterFrame when playing
      // console.log('draw_curr_time() -7');


      if (o.design_skin == 'skin-wave') {
        if (o.skinwave_enableSpectrum == 'on') {

          // -- spectrum ON


          //console.log(_scrubBgCanvas.width());


          // -- easing


          if (selfClass.player_playing) {

          } else {
            // requestAnimFrame(handleTickChange);
            return false;
          }


          /*
                         ctx.imageSmoothingEnabled = false;
                         ctx.imageSmoothing = false;
                         ctx.imageSmoothingQuality = "high";
                         ctx.webkitImageSmoothing = false;
                         */

          var meterNum = canw / (10 + 2); //count of the meters


          //console.log(_scrubBgCanvas);
          if (_scrubBgCanvas) {

            canw = _scrubBgCanvas.width();
            canh = _scrubBgCanvas.height();

            _scrubBgCanvas.get(0).width = canw;
            _scrubBgCanvas.get(0).height = canh;
          }


          var drawMeter = function () {

            //console.log(o.type);

            if (o.type == 'soundcloud' || sw_spectrum_fakeit == 'on') {

              selfClass.lastArray = dzsapHelpers.generateFakeArrayForPcm();

            } else {

              if (selfClass.spectrum_analyser) {
                selfClass.lastArray = new Uint8Array(selfClass.spectrum_analyser.frequencyBinCount);
                selfClass.spectrum_analyser.getByteFrequencyData(selfClass.lastArray);
              }
            }


            if (selfClass.lastArray && selfClass.lastArray.length) {


              //fix when some sounds end the value still not back to zero
              var len = selfClass.lastArray.length;
              for (var i = len - 1; i >= 0; i--) {
                //selfClass.lastArray[i] = 0;

                if (i < len / 2) {

                  selfClass.lastArray[i] = selfClass.lastArray[i] / 255 * canh;
                } else {

                  selfClass.lastArray[i] = selfClass.lastArray[len - i] / 255 * canh;
                }
              }
              ;


              if (selfClass.last_lastarray) {
                for (var i3 = 0; i3 < selfClass.last_lastarray.length; i3++) {
                  begin_viy = selfClass.last_lastarray[i3]; // -- last value
                  change_viy = selfClass.lastArray[i3] - begin_viy; // -- target value - last value
                  duration_viy = 3;
                  selfClass.lastArray[i3] = Math.easeIn(1, begin_viy, change_viy, duration_viy);
                }
              }
              // -- easing END

              dzsapWaveFunctions.draw_canvas(_scrubBgCanvas.get(0), selfClass.lastArray, '' + o.design_wave_color_bg, {
                'call_from': 'spectrum',
                selfClass,
                'skinwave_wave_mode_canvas_waves_number': parseInt(o.skinwave_wave_mode_canvas_waves_number),
                'skinwave_wave_mode_canvas_waves_padding': parseInt(o.skinwave_wave_mode_canvas_waves_padding)
              })


              if (selfClass.lastArray) {
                selfClass.last_lastarray = selfClass.lastArray.slice();
              }


            }

          }

          drawMeter();


          // -- end spectrum
        }

        // console.log('selfClass.$currTime - ',selfClass.$currTime, o.skinwave_timer_static);

        if (selfClass.$currTime && selfClass.$currTime.length) {
          //                        console.log(selfClass.$currTime, selfClass.timeCurrent, time_total, formatTime(selfClass.timeCurrent))

          if (o.skinwave_timer_static != 'on') {

            if (spos < 0) {
              spos = 0;
            }
            spos = parseInt(spos, 10);


            if (spos < 2 && cthis.data('promise-to-play-footer-player-from')) {
              // console.error("WE RETURN IT")
              return false;
            }

            // -- move currTime
            selfClass.$currTime.css({
              'left': spos
            });

            // console.log('spos - ',spos);
            // console.log('sw - ',sw);
            if (spos > sw - currTime_outerWidth) {
              //console.log(sw, currTime_outerWidth);
              selfClass.$currTime.css({
                'left': sw - currTime_outerWidth
              })
            }
            if (spos > sw - 30 && sw) {
              selfClass.$totalTime.css({
                'opacity': 1 - (((spos - (sw - 30)) / 30))
              });
            } else {
              if (selfClass.$totalTime.css('opacity') != '1') {
                selfClass.$totalTime.css({
                  'opacity': ''
                });
              }
            }
            ;
          }
          ;
        }
      }


      if (selfClass.$currTime) {
        //console.log(selfClass.$currTime, selfClass.timeCurrent, formatTime(selfClass.timeCurrent))
        //console.log("CEVA");


        if (scrub_showing_scrub_time == false) {

          selfClass.$currTime.html(dzsapHelpers.formatTime(time_curr_for_visual));
        }

        if (time_total_for_visual && time_total_for_visual > -1) {
          cthis.addClass('time-total-visible');


          if (sent_received_time_total == false) {

            if (o.action_received_time_total) {
              o.action_received_time_total(time_total_for_visual, cthis);
            }
            sent_received_time_total = true;
          }
        }
        if (time_total_for_visual != last_time_total) {
          selfClass.$totalTime.html(dzsapHelpers.formatTime(time_total_for_visual));
          selfClass.$totalTime.fadeIn('fast');
        }
      }

    }

    /**
     * draw the scrub width
     * @returns {string|boolean}
     */
    function draw_scrub_prog() {
      // return false;

      if (selfClass.timeTotal == 0) {
        selfClass.timeTotal = time_total_for_visual;
      }
      spos = (selfClass.timeCurrent / selfClass.timeTotal) * sw;

      // console.log('sw - ',sw);

      if (selfClass._actualPlayer) {
        if (time_curr_for_visual > 0 && time_total_for_visual > 0) {
          spos = (time_curr_for_visual / time_total_for_visual) * sw;
        }

      }
      if (isNaN(spos)) {
        spos = 0;
      }
      if (spos > sw) {
        spos = sw;
      }

      if (selfClass.timeCurrent == -1) {
        spos = 0;
      }

      if (selfClass.timeTotal == 0 || selfClass.timeTotal == '-1' || isNaN(selfClass.timeTotal)) {
        spos = 0;
      }

      // console.log('spos -3 ',spos, 'promise-to-play-footer-player-from -',cthis.data('promise-to-play-footer-player-from'), "||", cthis);

      if (spos < 2 && cthis.data('promise-to-play-footer-player-from')) {
        // console.error("WE RETURN IT")
        return false;
      }

      if (selfClass.spectrum_audioContext_buffer == null) {
        if (selfClass.$$scrubbProg) {
          selfClass.$$scrubbProg.style.width = parseInt(spos, 10) + 'px';
        }
      }
    }

    function click_prev_btn() {


      console.log('click_prev_btn()')
      if (o.parentgallery && (o.parentgallery.get(0))) {
        o.parentgallery.get(0).api_goto_prev();
      } else {

        sync_players_goto_prev();
      }
    }

    function click_next_btn() {
      // console.log('click_next_btn()', dzsap_list, dzsap_list_for_sync_players);
      if (o.parentgallery && (o.parentgallery.get(0))) {
        o.parentgallery.get(0).api_goto_next();
      } else {

        sync_players_goto_next();
      }
    }

    function get_times(pargs) {


      var margs = {
        'call_from': 'default'
      }

      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      // console.log('get_times () margs - ',margs,'type - ',type,o.type);
      // -- trying to get current time
      if ((selfClass.audioType == 'selfHosted' || (selfClass.audioType == 'fake' && selfClass._actualPlayer))) {
        if (o.type != 'shoutcast') {


          if (selfClass.$mediaNode_ && isNaN(selfClass.$mediaNode_.duration) == false) {
            time_total_for_real = selfClass.$mediaNode_.duration;
          }

          if (0 && selfClass.spectrum_audioContext_buffer && selfClass.spectrum_audioContext_buffer != 'placeholder' && selfClass.spectrum_audioContext_buffer != 'waiting') {

            if (selfClass._actualPlayer == null) {
              time_curr_for_real = selfClass.spectrum_audioContext.currentTime;
            }

          } else {

            // -- normal
            if (selfClass.$mediaNode_) {
              if (selfClass._actualPlayer == null) {
                time_curr_for_real = selfClass.$mediaNode_.currentTime;
              }
              if (inter_audiobuffer_workaround_id == 0) {


              }

            }

          }


          if (selfClass._actualPlayer) {
            selfClass.timeCurrent = time_curr_for_visual;
          }


          if (playfrom == 'last' && playfrom_ready) {
            if (typeof Storage != 'undefined') {
              localStorage['dzsap_' + selfClass.the_player_id + '_lastpos'] = selfClass.timeCurrent;
            }
          }


        }


      }


      // -- setting real times ( if actual player is not there )
      if (selfClass._actualPlayer === null && time_curr_for_real > -1) {
        selfClass.timeCurrent = time_curr_for_real;
        time_curr_for_visual = time_curr_for_real;
      }

      if (selfClass._actualPlayer === null && time_total_for_real > -1) {
        selfClass.timeTotal = time_total_for_real;
        time_total_for_visual = time_total_for_real;
      }
    }


    function handleTickChange(pargs) {


      // -- enter frame
      // console.log('handleTickChange()', cthis);

      var margs = {
        'fire_only_once': false
      }

      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      if (destroyed) {
        console.log("DESTROYED");
        return false;
      }


      // console.log(sw_suspend_enter_frame);
      if (margs.fire_only_once == false && sw_suspend_enter_frame) {

        requestAnimFrame(handleTickChange);
        // console.log("SUSPENDED ENTER FRAME HERE");
        return false;
      }
      // console.log("REACHED");


      get_times({
        'call_from': 'checK_time'
      });

      if (selfClass.audioType == 'selfHosted') {

      }


      if (selfClass.pseudo_sample_time_start) {

        if (time_curr_for_visual < selfClass.pseudo_sample_time_start) {
          time_curr_for_visual = selfClass.pseudo_sample_time_start;
        }


        if (selfClass.pseudo_sample_time_end) {
          if (selfClass.timeCurrent > selfClass.pseudo_sample_time_end) {

            var args = {
              'call_from': 'time_curr>pseudo_sample_time_end'
            }
            handle_end(args);

            ended = true;

            clearTimeout(inter_ended);
            inter_ended = setTimeout(function () {

              ended = false;
            }, 1000);
          }
        }
      }


      if (selfClass._actualPlayer == null) {

        if (selfClass.pseudo_sample_time_start == 0) {

          if (selfClass.sample_time_start > 0) {
            time_curr_for_visual = selfClass.sample_time_start + time_curr_for_real;

          }
        }
      }


      if (selfClass.sample_time_total > 0) {

        time_total_for_visual = selfClass.sample_time_total;
      }


      draw_scrub_prog();


      // console.log('cthis -5 ', cthis, selfClass._sourcePlayer);
      if (selfClass._sourcePlayer) {
        //console.log(cthis, selfClass._sourcePlayer);

        if (selfClass._sourcePlayer.get(0)) {
          if (selfClass._sourcePlayer.get(0).api_get_time_curr) {
            // console.log('getting time total', selfClass._sourcePlayer.get(0).api_get_time_total());
            if (isNaN(selfClass._sourcePlayer.get(0).api_get_time_total()) || selfClass._sourcePlayer.get(0).api_get_time_total() == '' || selfClass._sourcePlayer.get(0).api_get_time_total() < 1) {
              // console.log('setting time total');

              // console.log("SET TIME CUR - ",time_curr);
              // console.error('SET time_total - ',time_total_for_visual);
              selfClass._sourcePlayer.get(0).api_set_time_total(time_total_for_visual);
            }

            // if(debug_var){
            //     console.error("SETTING TIME CURR",time_curr, selfClass._sourcePlayer);
            //      debug_var = false;
            // }

            selfClass._sourcePlayer.get(0).api_set_time_curr(selfClass.timeCurrent);
          }
        }


        if (selfClass._sourcePlayer.get(0) && selfClass._sourcePlayer.get(0).api_seek_to_visual) {
          var temp_time_curr = selfClass.timeCurrent;
          // TODO: to be continued
          if (selfClass.pseudo_sample_time_start == 0) {

            if (selfClass.sample_time_start) {
              temp_time_curr -= selfClass.sample_time_start;
            }
          }


          selfClass._sourcePlayer.get(0).api_seek_to_visual(temp_time_curr / selfClass.timeTotal);
        } else {
          console.log('warning .. no seek to visual');
        }

      }


      // if(debug_var){

      //
      //     debug_var = false;
      // }


      // -- skin minimal
      if (o.design_skin == 'skin-minimal') {


        if (!dzsap_can_canvas) {
          selfClass.$conPlayPause.addClass('canvas-fallback');
        } else {


          if (selfClass.player_playing || selfClass.isCanvasFirstDrawn === false) {

            if (selfClass.skin_minimal_canvasplay) {

              var ctx_minimal = selfClass.skin_minimal_canvasplay.getContext('2d');
              //console.log(ctx);


              var ctx_w = selfClass.skin_minimal_canvasplay.width;
              var ctx_h = selfClass.skin_minimal_canvasplay.height;

              // console.log(ctx_w);
              var pw = ctx_w / 100;
              var ph = ctx_h / 100;

              if (selfClass._actualPlayer) {

              }
              spos = Math.PI * 2 * (selfClass.timeCurrent / selfClass.timeTotal);

              if (isNaN(spos)) {
                spos = 0;
              }
              if (spos > Math.PI * 2) {
                spos = Math.PI * 2;
              }

              ctx_minimal.clearRect(0, 0, ctx_w, ctx_h);
              //console.log(ctx_w, ctx_h);


              // -- use design_wave_color_progress for drawing skin-minimal circle

              // console.log('skin-minimal use o.design_wave_color_progress - ',o.design_wave_color_progress);
              // var aux1 = parseInt(o.design_wave_color_progress, 16);
              //
              //
              // var color1 = aux1;
              // var color2 = aux1 + 12000;


              // console.log(aux1,color1,color2, color1.toString(16), color2.toString(16));
              //console.log(aux1.toString(16));


              ctx_minimal.beginPath();
              ctx_minimal.arc((50 * pw), (50 * ph), (40 * pw), 0, Math.PI * 2, false);
              ctx_minimal.fillStyle = "rgba(0,0,0,0.1)";
              ctx_minimal.fill();


              // console.log(spos);
              ctx_minimal.beginPath();
              ctx_minimal.arc((50 * pw), (50 * ph), (34 * pw), 0, spos, false);
              //ctx_minimal.fillStyle = "rgba(0,0,0,0.3)";
              ctx_minimal.lineWidth = (10 * pw);
              ctx_minimal.strokeStyle = 'rgba(0,0,0,0.3)';
              ctx_minimal.stroke();


              selfClass.isCanvasFirstDrawn = true;
            }


          } else {

            if (margs.fire_only_once != true) {
              requestAnimFrame(handleTickChange);

            }
            return false;
          }
        }
        //console.log('ceva');
      }


      //                console.log(o.design_skin);

      // -- enter_frame
      // console.log("REACHED2");
      draw_curr_time();

      //                console.log(selfClass.timeCurrent, selfClass.timeTotal);
      if (safe_to_change_track && selfClass.timeTotal > 1 && selfClass.timeCurrent >= selfClass.timeTotal - 0.07) {
        var args = {
          'call_from': 'selfClass.timeTotal > 0 && selfClass.timeCurrent >= selfClass.timeTotal - 0.07 ... '
        }

        // if(debug_var2){
        //
        //     console.log('selfClass.timeCurrent - ',selfClass.timeCurrent, cthis);
        //     console.log('selfClass.timeTotal - ',selfClass.timeTotal);
        //     debug_var2 = false;
        // }

        // console.log('%c selfClass.timeTotal > 0 && selfClass.timeCurrent >= selfClass.timeTotal - 0.07 ... ', 'background-color: #dada00;', selfClass.timeTotal, selfClass.timeCurrent);

        if (selfClass._actualPlayer) {

        } else {

          handle_end(args);

          ended = true;


          clearTimeout(inter_ended);
          inter_ended = setTimeout(function () {

            ended = false;
          }, 1000);
        }
      }


      // -- debug handleTickChange
      // inter_check = setTimeout(handleTickChange, 2000);
      if (margs.fire_only_once != true) {
        requestAnimFrame(handleTickChange);

      }


      last_time_total = time_total_for_visual;


      if (selfClass.spectrum_audioContext) {
        if (selfClass.$totalTime) {
          selfClass.$totalTime.html(dzsapHelpers.formatTime(time_total_for_visual));
        }
      }

    }

    function click_playpause(e) {
      //console.log('click_playpause', 'selfClass.player_playing - ',selfClass.player_playing);

      if (cthis.hasClass('prevent-bubble')) {

        if (e && e.stopPropagation) {
          e.preventDefault();
          e.stopPropagation();
          ;
          // return false;
        }

      }

      var _t = $(this);

      var sw_cancel_toggle = false;
      //console.log(_t);

      // console.log('time_total_for_visual -7 ',time_total_for_visual);

      if (cthis.hasClass('listeners-setuped')) {

      } else {

        $(selfClass.$mediaNode_).attr('preload', 'auto');

        setup_listeners();
        init_loaded();

        // console.log('time_total_for_visual -4 ',time_total_for_visual);


        var it3 = setInterval(function () {

          // console.log(selfClass.$mediaNode_, selfClass.$mediaNode_.duration);
          if (selfClass.$mediaNode_ && selfClass.$mediaNode_.duration && isNaN(selfClass.$mediaNode_.duration) == false) {

            real_time_total = selfClass.$mediaNode_.duration;
            selfClass.timeTotal = real_time_total;


            cthis.addClass('meta-loaded');
            if (selfClass.$totalTime) {
              // console.error("ENTER HERE 9057");
              selfClass.$totalTime.html(dzsapHelpers.formatTime(time_total_for_visual));
            }

            clearInterval(it3);
          }
        }, 1000);
      }


      if (o.design_skin == 'skin-minimal') {

        var center_x = _t.offset().left + skin_minimal_button_size / 2;
        var center_y = _t.offset().top + skin_minimal_button_size / 2;
        var mouse_x = e.pageX;
        var mouse_y = e.pageY;
        var pzero_x = center_x + skin_minimal_button_size / 2;
        var pzero_y = center_y;

        //var angle = Math.acos(mouse_x - center_x);

        //console.log(pzero_x, pzero_y, mouse_x, mouse_y, center_x, center_y, mouse_x - center_x, angle);

        //A = center, B = mousex, C=pointzero

        var AB = Math.sqrt(Math.pow((mouse_x - center_x), 2) + Math.pow((mouse_y - center_y), 2));
        var AC = Math.sqrt(Math.pow((pzero_x - center_x), 2) + Math.pow((pzero_y - center_y), 2));
        var BC = Math.sqrt(Math.pow((pzero_x - mouse_x), 2) + Math.pow((pzero_y - mouse_y), 2));


        var angle = Math.acos((AB + AC + BC) / (2 * AC * AB));
        var angle2 = Math.acos((mouse_x - center_x) / (skin_minimal_button_size / 2));

        //console.log(AB, AC, BC, angle, (mouse_x - center_x), angle2, Math.PI);

        var perc = -(mouse_x - center_x - (skin_minimal_button_size / 2)) * 0.005; //angle2 / Math.PI / 2;


        if (mouse_y < center_y) {
          perc = 0.5 + (0.5 - perc)
        }

        if (Math.abs(mouse_y - center_y) > 20 || Math.abs(mouse_x - center_x) > 20) {


          // console.log('perc - ',perc);
          seek_to_perc(perc, {
            call_from: "skin_minimal_scrub"
          })
          sw_cancel_toggle = true;

          handleTickChange({
            'fire_only_once': true
          });
        }


      }


      //unghi = acos (x - centruX) = asin(centruY - y)


      if (sw_cancel_toggle == false) {

        //console.log("selfClass.player_playing -> ",selfClass.player_playing);
        if (selfClass.player_playing == false) {
          play_media({
            'called_from': 'click_playpause'
          });
        } else {
          pause_media();
        }
      }


      return false;
    }


    function sync_players_goto_prev() {
      // console.log('sync_players_goto_prev ', dzsap_list_for_sync_players);


      if (selfClass._actualPlayer) {
        selfClass._actualPlayer.get(0).api_sync_players_goto_prev();

        return false;
      }


      if (_playlistTooltip && _playlistTooltip.children('.dzstooltip--inner').length) {


        var tempNr = selfClass.playlist_inner_currNr - 1;

        if (tempNr >= 0) {

          playlist_goto_item(tempNr, {
            'call_from': 'api_sync_players_prev'
          });
        } else {
        }


      } else {

        if (dzsap_list_for_sync_players.length > 0) {
          for (var i24 in dzsap_list_for_sync_players) {


            var _ctarget = cthis;

            if (selfClass._sourcePlayer) {
              _ctarget = selfClass._sourcePlayer;
            }


            if (dzsap_list_for_sync_players[i24].get(0) == _ctarget.get(0)) {
              // console.log('THIS IS ',i24,dzsap_list_for_sync_players.length-1, dzsap_list_for_sync_players);

              i24 = parseInt(i24, 10);
              if (i24 > 0) {
                var $currentSyncPlayer_ = dzsap_list_for_sync_players[i24 - 1].get(0);
                // console.log('THIS IS _c ',_c);

                // console.log(_c_, i24, dzsap_list_for_sync_players[i24+1]);
                if ($currentSyncPlayer_ && $currentSyncPlayer_.api_play_media) {
                  setTimeout(function () {
                    $currentSyncPlayer_.api_play_media({
                      'called_from': 'api_sync_players_prev'
                    });
                  }, 200);

                }
              }
            }
          }
        }
      }


    }


    function sync_players_goto_next() {


      // console.log('sync_players_goto_next() - ', cthis, 'selfClass._actualPlayer - ',selfClass._actualPlayer);


      if (selfClass._actualPlayer) {
        selfClass._actualPlayer.get(0).api_sync_players_goto_next();

        return false;
      }

      if (_playlistTooltip && _playlistTooltip.find('.playlist-menu-item').length) {


        var tempNr = selfClass.playlist_inner_currNr + 1;


        if (tempNr - 1 > _playlistTooltip.find('.playlist-menu-item').length) {

        } else {
          playlist_goto_item(tempNr, {
            'call_from': 'api_sync_players_prev'
          });
        }


      } else {

        var _ctarget = null;

        // console.log('dzsap_list_for_sync_players -4 ',dzsap_list_for_sync_players);
        if (dzsap_list_for_sync_players.length > 0) {
          for (var i24 in dzsap_list_for_sync_players) {


            _ctarget = cthis;

            if (selfClass._sourcePlayer) {
              _ctarget = selfClass._sourcePlayer;
            }


            if (dzsap_list_for_sync_players[i24].get(0) == _ctarget.get(0)) {
              // console.log('THIS IS ',i24,dzsap_list_for_sync_players.length-1, dzsap_list_for_sync_players);

              i24 = parseInt(i24, 10);

              var tempNr = i24 + 1;

              if (tempNr > dzsap_list_for_sync_players.length - 1) {

                // tempNr = 0;
              }


              if (tempNr < dzsap_list_for_sync_players.length) {
                var _c_ = dzsap_list_for_sync_players[tempNr].get(0);

                if (_c_) {

                  // console.log('THIS IS _c ',_c);

                  // console.log(_c_, i24, dzsap_list_for_sync_players[i24+1]);
                  if (_c_ && _c_.api_play_media) {
                    setTimeout(function () {
                      _c_.api_play_media({
                        'called_from': 'api_sync_players_prev'
                      });
                    }, 200);

                  }
                }
              }

            }
          }
        }
      }

    }

    function handle_end(pargs) {


      var margs = {
        'called_from': 'default'
      }


      if (pargs) {
        margs = $.extend(margs, pargs);
      }
      //console.log('end');
      if (ended) {
        return false;
      }

      console.log('handle_end()', ConstantsDzsAp.DEBUG_STYLE_PLAY_FUNCTIONS, margs);


      // selfClass.timeCurrent  = 0;
      ended = true;

      inter_ended = setTimeout(function () {

        ended = false;
      }, 1000);


      if (selfClass._actualPlayer && margs.call_from != 'fake_player') {
        // -- lets leave fake player handle handle_end
        return false;
      }


      seek_to(0, {
        'call_from': 'handle_end'
      });

      if (o.loop == 'on' || loop_active) {
        play_media({
          'called_from': 'track_end'
        });
        return false;
      } else {
        pause_media();
      }

      if (o.parentgallery && typeof (o.parentgallery) != 'undefined') {
        //console.log(o.parentgallery);


        var args = {
          'call_from': 'player_handle_end'
        }
        o.parentgallery.get(0).api_gallery_handle_end();
      }


      setTimeout(function () {


        if (cthis.hasClass('is-single-player')) {

          // -- called on handle end
          sync_players_goto_next();
        }

      }, 100);

      setTimeout(function () {

        if (selfClass._sourcePlayer && (selfClass._sourcePlayer.hasClass('is-single-player') || selfClass._sourcePlayer.hasClass('feeded-whole-playlist'))) {
          //action_audio_end(selfClass._sourcePlayer,args);
          selfClass._sourcePlayer.get(0).api_handle_end({
            'call_from': 'handle_end() fake_player'
          });
          return false;
          //args.child_player = selfClass._sourcePlayer;
        }

        if (action_audio_end) {


          var args = {};


          // console.log(cthis, selfClass._sourcePlayer)


          action_audio_end(cthis, args);
        }
      }, 200);

    }


    function handleResize(e, pargs) {


      var margs = {

        'call_from': 'default'
      }

      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      if (cthis) {

      }


      //cthis.attr('data-pcm')
      ww = $(window).width();
      tw = cthis.width();
      th = cthis.height();


      if (_scrubBgCanvas && typeof (_scrubBgCanvas.width) == 'function') {
        canw = _scrubBgCanvas.width();
        canh = _scrubBgCanvas.height();

      }

      // console.log('handleResize', selfClass._commentsHolder)

      if (tw <= 720) {
        cthis.addClass('under-720');
      } else {

        cthis.removeClass('under-720');
      }
      if (tw <= 500) {
        // -- width under 500


        // -- move
        if (cthis.hasClass('under-500') == false) {
          if (o.design_skin == 'skin-wave' && selfClass.skinwave_mode == 'normal') {
            selfClass._apControls.append(selfClass._metaArtistCon);
          }
        }

        cthis.addClass('under-500');


      } else {
        // -- width under 500


        if (cthis.hasClass('under-500') == false) {
          if (o.design_skin == 'skin-wave' && selfClass.skinwave_mode == 'normal') {
            // selfClass._apControls.append(selfClass._metaArtistCon);
            selfClass._conPlayPauseCon.after(selfClass._metaArtistCon);
          }
        }

        cthis.removeClass('under-500');
      }


      sw = tw;
      if (o.design_skin == 'skin-default') {
        sw = tw;
      }
      if (o.design_skin == 'skin-pro') {
        sw = tw;
      }
      if (o.design_skin == 'skin-silver' || o.design_skin == 'skin-aria') {
        sw = tw;

        sw = selfClass._scrubbar.width();
        //console.log(sw);


      }


      if (o.design_skin == 'skin-justthumbandbutton') {
        tw = cthis.children('.audioplayer-inner').outerWidth();
        sw = tw;
      }
      if (o.design_skin == 'skin-redlights' || o.design_skin == 'skin-steel') {
        sw = selfClass._scrubbar.width();
      }


      //console.log(sw);


      if (o.design_skin == 'skin-wave') {
        sw = selfClass._scrubbar.outerWidth(false);
        // console.log('scrubbar width - ', sw, selfClass._scrubbar);

        scrubbar_h = selfClass._scrubbar.outerHeight(false);

        if (selfClass._commentsHolder) {

          // var aux = selfClass._scrubbar.offset().left - cthis.offset().left;
          var aux = 0;


          if (selfClass._scrubbar && cthis && selfClass._scrubbar.offset()) {
            aux = selfClass._scrubbar.offset().left - cthis.offset().left;
          } else {
            console.log('no scrubbar or cthis', selfClass._scrubbar, cthis);
          }

          //console.log(aux);

          // console.log('aux - ',aux);

          selfClass._commentsHolder.css({
            'width': sw
            //,'left': aux + 'px'
          })


          if (cthis.hasClass('skin-wave-mode-small')) {

            selfClass._commentsHolder.css({
              'left': aux + 'px'
            })
          }
          //return;
          selfClass._commentsHolder.addClass('active');

          //                        selfClass._commentsHolder.find('.a-comment').each(function(){
          //                            var _t = $(this);
          //
          //
          ////                            console.log(_t, _t.offset(), _t.find('.dzstooltip').eq(0).width(), _t.offset().left + _t.find('.dzstooltip').eq(0).width(), _t.offset().left + _t.find('.dzstooltip').eq(0).width() > ww - 50)
          //                            if(_t.offset().left + _t.find('.dzstooltip').eq(0).width() > ww - 50){
          //                                _t.find('.dzstooltip').eq(0).addClass('align-right');
          //                            }else{
          //
          //                                _t.find('.dzstooltip').eq(0).removeClass('align-right');
          //                            }
          //                        })
        }

      }

      //console.log(o.design_skin, tw, sw);


      if (res_thumbh == true) {

        //                    console.log(cthis.get(0).style.height);


        if (o.design_skin == 'skin-default') {


          if (cthis.get(0) != undefined) {
            // if the height is auto then
            if (cthis.get(0).style.height == 'auto') {
              cthis.height(200);
            }
          }

          var cthis_height = selfClass._audioplayerInner.height();
          if (typeof cthis.attr('data-initheight') == 'undefined' && cthis.attr('data-initheight') != '') {
            cthis.attr('data-initheight', selfClass._audioplayerInner.height());
          } else {
            cthis_height = Number(cthis.attr('data-initheight'));
          }

          // console.log('cthis_height - ', cthis_height, cthis.attr('data-initheight'));

          if (o.design_thumbh == 'default') {

            design_thumbh = cthis_height - 44;
          }

        }

        selfClass._audioplayerInner.find('.the-thumb').eq(0).css({
          // 'height': design_thumbh
        })
      }


      //===display none + overflow hidden hack does not work .. yeah
      //console.log(cthis, selfClass._scrubbar.children('.scrub-bg').width());

      if (cthis.css('display') != 'none') {
        selfClass._scrubbar.find('.scrub-bg-img').eq(0).css({
          // 'width' : selfClass._scrubbar.children('.scrub-bg').width()
        });
        selfClass._scrubbar.find('.scrub-prog-img').eq(0).css({
          'width': selfClass._scrubbar.children('.scrub-bg').width()
        });
        selfClass._scrubbar.find('.scrub-prog-canvas').eq(0).css({
          'width': selfClass._scrubbar.children('.scrub-bg').width()
        });
        selfClass._scrubbar.find('.scrub-prog-img-reflect').eq(0).css({
          'width': selfClass._scrubbar.children('.scrub-bg').width()
        });
        selfClass._scrubbar.find('.scrub-prog-canvas-reflect').eq(0).css({
          'width': selfClass._scrubbar.children('.scrub-bg').width()
        });
      }


      // console.log('is_under_400 - ',is_under_400);
      // console.log('tw - ',tw);
      cthis.removeClass('under-240 under-400');
      if (tw <= 240) {
        cthis.addClass('under-240');
      }
      if (tw <= 500) {
        cthis.addClass('under-400');

        if (is_under_400 == false) {
          is_under_400 = true;
          reconstruct_player();
        }
        if (selfClass.$controlsVolume) {
        }

      } else {


        if (is_under_400 == true) {
          is_under_400 = false;
          reconstruct_player();
        }
      }


      var aux2 = 50;

      // console.log('o.design_skin - ', o.design_skin, cthis);
      // -- skin-wave
      if (o.design_skin == 'skin-wave') {

        controls_left_pos = 0;
        if (cthis.find('.the-thumb').length > 0) {
          controls_left_pos += cthis.find('.the-thumb').width() + 20;
        }

        controls_left_pos += 70;

        var sh = selfClass._scrubbar.eq(0).height();


        if (selfClass.skinwave_mode == 'small') {
          controls_left_pos -= 80;
          sh = 5;

          controls_left_pos += 13;
          selfClass.$conPlayPause.css({
            //'left' : controls_left_pos
          })

          controls_left_pos += selfClass.$conPlayPause.outerWidth() + 10;


        }


        if (selfClass._metaArtistCon && selfClass._metaArtistCon.css('display') != 'none') {


          if (!(o.design_skin == 'skin-wave' && selfClass.skinwave_mode == 'small')) {
            selfClass._metaArtistCon.css({
              //'left': controls_left_pos
            });

            if (o.design_skin == 'skin-wave' && selfClass.skinwave_mode != 'small') {
              selfClass._metaArtistCon.css({
                //'width': tw - controls_left_pos - selfClass._apControlsRight.outerWidth()
              });
            }
          }

          controls_left_pos += selfClass._metaArtistCon.outerWidth();

          //console.log(selfClass._metaArtistCon, selfClass._metaArtistCon.outerWidth());
        }


        controls_right_pos = 0;

        if (selfClass.$controlsVolume && selfClass.$controlsVolume.css('display') != 'none') {
          controls_right_pos += 55;
        }


        // ---------- calculate dims small
        if (selfClass.skinwave_mode == 'small') {

          selfClass._scrubbar.css({
            //'left' : controls_left_pos
          })


          //sw =  ( tw - controls_left_pos - controls_right_pos );


          sw = selfClass._scrubbar.width();

          //console.log(sw,controls_left_pos,controls_right_pos);


          selfClass._scrubbar.find('.scrub-bg--img').eq(0).css({
            'width': sw
          })
          selfClass._scrubbar.find('.scrub-prog--img').eq(0).css({
            'width': sw
          })
          //cthis.find('.comments-holder').eq(0).css({
          //    'width' :  selfClass._scrubbar.width()
          //    ,'left' : controls_left_pos
          //});


        }


        if (o.skinwave_wave_mode == 'canvas') {

          if (cthis.attr('data-pcm')) {


            if (selfClass._scrubbarbg_canvas.width() == 100) {
              selfClass._scrubbarbg_canvas.width(selfClass._scrubbar.width());
            }


            // console.log('selfClass.data_source - ', selfClass.data_source);
            if (selfClass.data_source != 'fake') {


              // -- if inter definied then clear timeout and call
              if (draw_canvas_inter) {
                clearTimeout(draw_canvas_inter);
                draw_canvas_inter = setTimeout(draw_canvas_inter_func, 500);
              } else {
                draw_canvas_inter_func();
                draw_canvas_inter = 1;
              }
            }
          }
        }
      }


      if (o.design_skin == 'skin-minimal') {


        // console.log('skin_minimal_button_size - ' ,skin_minimal_button_size);

        skin_minimal_button_size = selfClass._apControls.width();
        if (selfClass.skin_minimal_canvasplay) {
          selfClass.skin_minimal_canvasplay.style.width = skin_minimal_button_size;
          selfClass.skin_minimal_canvasplay.width = skin_minimal_button_size;
          selfClass.skin_minimal_canvasplay.style.height = skin_minimal_button_size;
          selfClass.skin_minimal_canvasplay.height = skin_minimal_button_size;


          // skin_minimal_button_size = sanitize_to_css_size(skin_minimal_button_size);


          $(selfClass.skin_minimal_canvasplay).css({
            'width': skin_minimal_button_size
            , 'height': skin_minimal_button_size
          });
        }


      }


      if (o.design_skin == 'skin-default') {
        if (selfClass.$currTime) {
          //console.log(o.design_skin, parseInt(selfClass._metaArtistCon.css('left'),10) + selfClass._metaArtistCon.outerWidth() + 10);
          var _metaArtistCon_l = parseInt(selfClass._metaArtistCon.css('left'), 10);
          var _metaArtistCon_w = selfClass._metaArtistCon.outerWidth();

          if (selfClass._metaArtistCon.css('display') == 'none') {
            selfClass._metaArtistCon_w = 0;
          }
          if (isNaN(selfClass._metaArtistCon_l)) {
            selfClass._metaArtistCon_l = 20;
          }
        }

      }

      if (o.design_skin == 'skin-minion') {
        //console.log();
        aux2 = parseInt(selfClass.$conControls.find('.con-playpause').eq(0).offset().left, 10) - parseInt(selfClass.$conControls.eq(0).offset().left, 10) - 18;
        selfClass.$conControls.find('.prev-btn').eq(0).css({
          'top': 0,
          'left': aux2
        })
        aux2 += 36;
        selfClass.$conControls.find('.next-btn').eq(0).css({
          'top': 0,
          'left': aux2
        })
      }


      if (o.embedded == 'on') {
        //console.log(window.frameElement)
        if (window.frameElement) {
          //window.frameElement.height = cthis.height();
          //console.log(window.frameElement.height, cthis.outerHeight())


          var args = {
            height: cthis.outerHeight()
          };


          if (o.embedded_iframe_id) {

            args.embedded_iframe_id = o.embedded_iframe_id;
          }


          var message = {
            name: "resizeIframe",
            params: args
          };
          window.parent.postMessage(message, '*');
        }

      }


      draw_scrub_prog();

      // draw_curr_time();


      if (o.settings_trigger_resize > 0) {

        if (o.parentgallery && $(o.parentgallery).get(0) != undefined && $(o.parentgallery).get(0).api_handleResize != undefined) {
          $(o.parentgallery).get(0).api_handleResize();
        }
      }

    }


    function reconstruct_player() {

      // console.log('reconstruct_player() ', o.restyle_player_over_400,o.restyle_player_under_400);

      if (o.restyle_player_over_400 && o.restyle_player_under_400) {


        //console.log('reconstruct_player() ',o.restyle_player_over_400,' is_under_400 - ', is_under_400, cthis.attr('class'));


        if (is_under_400) {
          console.log("RESTYLING WITH CLASS -> ", o.restyle_player_under_400);
          cthis.removeClass(o.restyle_player_over_400);
          cthis.addClass(o.restyle_player_under_400);
        } else {

          console.log("RESTYLING WITH CLASS -> ", o.restyle_player_over_400);
          cthis.removeClass(o.restyle_player_under_400);
          cthis.addClass(o.restyle_player_over_400);
        }

        // detect_skinwave_mode();
        (dzsapHelpers.player_detect_skinwave_mode.bind(selfClass))();
        apply_skinwave_mode_class();

        //console.error("selfClass._audioplayerInner.find('.meta-artist-con').eq(0) -> ", selfClass._audioplayerInner.find('.meta-artist-con').eq(0));

        selfClass._audioplayerInner.append(cthis.find('.meta-artist-con'));

        cthis.find('.ap-controls').remove();
        selfClass._audioplayerInner.children('.the-thumb-con').remove();


        if (is_under_400) {
          console.log("RESTYLING WITH CLASS -> ", o.restyle_player_under_400);
          cthis.removeClass(o.restyle_player_over_400);
          cthis.addClass(o.restyle_player_under_400);
        } else {

          cthis.css({
            'padding-top': ''
          });
          console.log("RESTYLING WITH CLASS -> ", o.restyle_player_over_400);
          cthis.removeClass(o.restyle_player_under_400);
          cthis.addClass(o.restyle_player_over_400);
        }

        dzsapStructure.setup_structure(selfClass, {
          'setup_inner_player': false
          , 'setup_media': false
          , 'setup_otherstructure': true
          , 'call_from': "reconstruct"
        });


        setup_listeners();
      }
    }


    function draw_canvas_inter_func() {
      // console.log('draw_canvas_inter_func', 'skinwave_wave_mode_canvas_waves_number - ', o.skinwave_wave_mode_canvas_waves_number);


      // console.log(cthis,"_scrubbarbg_canvas.get(0) -> ",_scrubbarbg_canvas.get(0));
      dzsapWaveFunctions.draw_canvas(selfClass._scrubbarbg_canvas.get(0), cthis.attr('data-pcm'), "#" + o.design_wave_color_bg, {
        call_from: 'canvas_normal_pcm_bg',
        selfClass,
        'skinwave_wave_mode_canvas_waves_number': parseInt(o.skinwave_wave_mode_canvas_waves_number, 10),
        'skinwave_wave_mode_canvas_waves_padding': parseInt(o.skinwave_wave_mode_canvas_waves_padding)
      });
      dzsapWaveFunctions.draw_canvas(selfClass._scrubbarprog_canvas.get(0), cthis.attr('data-pcm'), "#" + o.design_wave_color_progress, {
        call_from: 'canvas_normal_pcm_prog',
        selfClass,
        'skinwave_wave_mode_canvas_waves_number': parseInt(o.skinwave_wave_mode_canvas_waves_number, 10),
        'skinwave_wave_mode_canvas_waves_padding': parseInt(o.skinwave_wave_mode_canvas_waves_padding)
      });

      draw_canvas_inter = 0;
    }

    function volume_handleMouse(e) {
      var _t = $(this);
      /**
       * from 0 to 1
       * @type {number}
       */
      var mouseXRelativeToVolume = null;

      //var mx = e.clientX - selfClass.$controlsVolume.offset().left;
      if (selfClass.$controlsVolume.find('.volume_static').length) {

        mouseXRelativeToVolume = Number((e.pageX - (selfClass.$controlsVolume.find('.volume_static').eq(0).offset().left)) / (selfClass.$controlsVolume.find('.volume_static').eq(0).width()));
      }

      if (!mouseXRelativeToVolume) {
        return false;
      }
      if (e.type == 'mousemove') {
        if (volume_dragging) {

          if (_t.parent().hasClass('volume-holder') || _t.hasClass('volume-holder')) {
            // todo: nothing ?
          }

          if (o.design_skin == 'skin-redlights') {
            mouseXRelativeToVolume *= 10;
            mouseXRelativeToVolume = Math.round(mouseXRelativeToVolume);
            //console.log(mouseXRelativeToVolume);
            mouseXRelativeToVolume /= 10;
          }


          volume_setVolume(mouseXRelativeToVolume, {
            call_from: "set_by_mousemove"
          });
          muted = false;
        }

      }
      if (e.type == 'mouseleave') {

      }
      if (e.type == 'click') {

        //console.log(_t, _t.offset().left)


        if (_t.parent().hasClass('volume-holder')) {


          mouseXRelativeToVolume = 1 - ((e.pageY - (selfClass.$controlsVolume.find('.volume_static').eq(0).offset().top)) / (selfClass.$controlsVolume.find('.volume_static').eq(0).height()));

        }
        if (_t.hasClass('volume-holder')) {
          mouseXRelativeToVolume = 1 - ((e.pageY - (selfClass.$controlsVolume.find('.volume_static').eq(0).offset().top)) / (selfClass.$controlsVolume.find('.volume_static').eq(0).height()));

          // console.log(mouseXRelativeToVolume);

        }

        //console.log(mouseXRelativeToVolume);

        volume_setVolume(mouseXRelativeToVolume, {
          call_from: "set_by_mouseclick"
        });
        muted = false;
      }

      if (e.type == 'mousedown') {

        volume_dragging = true;
        cthis.addClass('volume-dragging');


        if (_t.parent().hasClass('volume-holder')) {


          mouseXRelativeToVolume = 1 - ((e.pageY - (selfClass.$controlsVolume.find('.volume_static').eq(0).offset().top)) / (selfClass.$controlsVolume.find('.volume_static').eq(0).height()));

        }

        // console.log('mouseXRelativeToVolume - ', mouseXRelativeToVolume);

        volume_setVolume(mouseXRelativeToVolume, {
          call_from: "set_by_mousedown"
        });
        muted = false;
      }
      if (e.type == 'mouseup') {

        volume_dragging = false;
        cthis.removeClass('volume-dragging');

      }

    }

    function handleMouseOnScrubbar(e) {
      var mousex = e.pageX;


      if ($(e.target).hasClass('sample-block-start') || $(e.target).hasClass('sample-block-end')) {
        return false;
      }

      if (e.type == 'mousemove') {
        selfClass._scrubbar.children('.scrubBox-hover').css({
          'left': (mousex - selfClass._scrubbar.offset().left)
        });


        if (o.scrub_show_scrub_time == 'on') {

          // console.log('selfClass.$currTime - ',selfClass.$currTime);

          if (selfClass.timeTotal) {
            var aux = (mousex - selfClass._scrubbar.offset().left) / selfClass._scrubbar.outerWidth() * selfClass.timeTotal;


            if (selfClass.$currTime) {
              selfClass.$currTime.html(dzsapHelpers.formatTime(aux));
              selfClass.$currTime.addClass('scrub-time');

            }

            scrub_showing_scrub_time = true;
          }
        }

      }
      if (e.type == 'mouseleave') {

        scrub_showing_scrub_time = false;

        if (selfClass.$currTime) {
          selfClass.$currTime.removeClass('scrub-time');

        }

        draw_curr_time();

      }
      if (e.type == 'click') {


        if (cthis.hasClass('prevent-bubble')) {

          if (e && e.stopPropagation) {
            e.preventDefault();
            e.stopPropagation();
            ;
            // return false;
          }
        }


        if (sw == 0) {

          sw = selfClass._scrubbar.width();
        }
        if (sw == 0) {
          sw = 300;
        }
        var targetPositionOnScrub = ((e.pageX - (selfClass._scrubbar.offset().left)) / (sw) * selfClass.timeTotal);


        //console.log(e.target,e.pageX, (selfClass._scrubbar.offset().left), (sw), selfClass.timeTotal, targetPositionOnScrub);

        if (selfClass.pseudo_sample_time_start == 0) {

          if (selfClass.sample_time_start > 0) {
            targetPositionOnScrub -= selfClass.sample_time_start;
          }
        }

        if (selfClass._actualPlayer) {


          setTimeout(function () {
            if (selfClass._actualPlayer.get(0) && selfClass._actualPlayer.get(0).api_pause_media) {

              selfClass._actualPlayer.get(0).api_seek_to_perc(targetPositionOnScrub / selfClass.timeTotal, {
                'call_from': 'from_feeder_to_feed'
              });
            }
          }, 50);
        }


        seek_to(targetPositionOnScrub, {
          'call_from': 'handleMouseOnScrubbar'
        });

        // return false;

        if (o.autoplay_on_scrub_click == 'on') {

          if (selfClass.player_playing == false) {
            play_media({
              'called_from': 'handleMouseOnScrubbar'
            });
          }
        }

        if (cthis.hasClass('from-wc_loop')) {
          return false;
        }
      }

    }

    function seek_to_perc(argperc, pargs) {

      if (selfClass._actualPlayer) {
        selfClass.timeTotal = time_total_for_visual;
      }
      seek_to((argperc * selfClass.timeTotal), pargs);
    }

    /**
     * seek to seconds
     * @param arg - number of settings
     * @param pargs -- optiona arguments
     * @returns {boolean}
     */
    function seek_to(arg, pargs) {
      //arg = nr seconds

      var margs = {
        'call_from': 'default'
        , 'deeplinking': 'off' // -- default or "auto" or "user action"
        , 'call_from_type': 'default' // -- default or "auto" or "user action"
      };

      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      if (margs.call_from == 'from_feeder_to_feed') {

      }

      if (arg == 0) {
        selfClass.timeCurrent = 0;
      }

      // console.log('%c seek_to() - margs - ', ConstantsDzsAp.DEBUG_STYLE_1, margs, 'arg - ', arg)

      if (margs.deeplinking == 'on') {
        var newlink = dzsapHelpers.add_query_arg(window.location.href, 'audio_time', arg);


        var stateObj = {foo: "bar"};
        history.pushState(stateObj, null, newlink);
      }


      // console.log('seek_to arg - ',arg, 'type - ',type, cthis);
      arg = dzsapHelpers.sanitize_from_point_time(arg);


      if (selfClass.pseudo_sample_time_start) {
        if (arg < selfClass.pseudo_sample_time_start) {
          arg = selfClass.pseudo_sample_time_start;
        }
        if (arg > selfClass.pseudo_sample_time_end) {
          arg = selfClass.pseudo_sample_time_end;
        }
      }


      // console.log('cthis.hasClass(\'first-played\') - ',cthis.hasClass('first-played'));

      // console.log('curr_time_first_set - ',curr_time_first_set);
      if (selfClass._actualPlayer) {


        var args = {
          type: selfClass.actualDataTypeOfMedia,
          fakeplayer_is_feeder: 'on'
        }


        if (selfClass._actualPlayer.length && selfClass._actualPlayer.data('feeding-from') != cthis.get(0)) {


          // console.log('margs -7 ',margs, 'arg - ',arg);
          if (margs.call_from != 'handle_end' && margs.call_from != 'from_playfrom' && margs.call_from != 'last_pos') {
            // -- if it is not user action

            args.called_from = 'seek_to from player source->' + (cthis.attr('data-source')) + ' < -  ' + 'old call from - ' + margs.call_from;
            if (selfClass._actualPlayer.get(0).api_change_media) {
              selfClass._actualPlayer.get(0).api_change_media(cthis, args);
            } else {
              console.log('not inited ? ', selfClass._actualPlayer);
            }


          } else {

            selfClass.timeCurrent = arg;
            time_curr_for_visual = arg;
            time_curr_for_real = arg;

            cthis.data('promise-to-play-footer-player-from', arg);

          }
        }



        setTimeout(function () {

          if (selfClass._actualPlayer.get(0) && selfClass._actualPlayer.get(0).api_pause_media) {
            if (margs.call_from != 'from_playfrom' && margs.call_from != 'last_pos') {
              selfClass._actualPlayer.get(0).api_seek_to(arg, {
                'call_from': 'from_feeder_to_feed'
              });
            }

          }
        }, 50);

        return false;
      }


      if (selfClass.audioType == 'youtube') {
        try {

          selfClass.$mediaNode_.seekTo(arg);
        } catch (err) {
          console.log('yt seek err - ', err);
        }
      }

      handleTickChange({
        'fire_only_once': true
      })
      setTimeout(function () {
        handleTickChange({
          'fire_only_once': true
        })
      }, 20);


      if (selfClass.audioType == 'selfHosted') {
        if (0) {

          //console.log('arg - ',arg);
          selfClass.lastTimeInSeconds = arg;

          if (inter_audiobuffer_workaround_id != 0) {
            selfClass.timeCurrent = arg;
          }

          pause_media({
            'audioapi_setlasttime': false
          });
          play_media({
            'called_from': 'audio_buffer ( seek_to() )'
          });
        } else {

          // console.log('seek to -> ', arg);
          if (selfClass.$mediaNode_ && typeof (selfClass.$mediaNode_.currentTime) != 'undefined') {

            try {
              selfClass.$mediaNode_.currentTime = arg;
            } catch (e) {
              console.log('error on scrub', e, ' arg - ', arg);

            }

            // console.log('selfClass.$mediaNode_.currentTime -> ',selfClass.$mediaNode_.currentTime);
          }

          return false;

        }

      }


    }

    /**
     * seek to ( only visual )
     * @param argperc
     */
    function seek_to_visual(argperc) {


      //console.log(selfClass.timeTotal);
      if (selfClass.timeTotal == 0) {
        if (selfClass.$mediaNode_ && selfClass.$mediaNode_.duration) {
          selfClass.timeTotal = selfClass.$mediaNode_.duration;
        }
      }

      if (selfClass._actualPlayer) {
        selfClass.timeCurrent = time_curr_for_visual;
        selfClass.timeTotal = time_total_for_visual;
      }

      selfClass.timeCurrent = argperc * selfClass.timeTotal;

      curr_time_first_set = true;


      handleTickChange({
        'fire_only_once': true
      })
      setTimeout(function () {
        handleTickChange({
          'fire_only_once': true
        })
      }, 20);
    }

    function set_playback_speed(arg) {
      //=== outputs a playback speed from 0.1 to 10

      if (selfClass.audioType == 'youtube') {
        selfClass.$mediaNode_.setPlaybackRate(arg);
      }
      if (selfClass.audioType == 'selfHosted') {
        selfClass.$mediaNode_.playbackRate = arg;

      }

    }

    /**
     * outputs a volume from 0 to 1
     * @param arg 0 <-> 1
     * @param pargs
     * @returns {boolean}
     */
    function volume_setVolume(arg, pargs) {

      var margs = {

        'call_from': 'default'
      };

      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      if (arg > 1) {
        arg = 1;
      }
      if (arg < 0) {
        arg = 0;
      }

      // console.log('[dzsap] [volume] volume_setVolume()', arg, margs, selfClass.cthis);


      if (margs.call_from == 'from_fake_player_feeder_from_init_loaded') {
        // -- lets prevent call from the init_loaded set_volume if the volume has been changed
        if (selfClass._sourcePlayer) {
          if (o.default_volume != 'default') {
            volume_set_by_user = true;
          }
          if (volume_set_by_user) {
            return false;
          } else {
            volume_set_by_user = true;
            // console.log("SET VOLUME BY USER", cthis);
          }
        }
      }

      if (margs.call_from == 'set_by_mouseclick' || margs.call_from == 'set_by_mousemove') {
        volume_set_by_user = true;
      }

      // console.log("set_volume()",arg, cthis, margs);

      if (selfClass.audioType == 'youtube') {
        if (selfClass.$mediaNode_ && selfClass.$mediaNode_.setVolume) {
          selfClass.$mediaNode_.setVolume(arg * 100);
        }
      }
      if (selfClass.audioType == 'selfHosted') {
        if (selfClass.$mediaNode_) {

          // console.log('volume - ',arg, arg* o.watermark_volume, 'selfClass.$mediaNode_ - ',selfClass.$mediaNode_,selfClass.$mediaNode_.src, 'volume - ',arg, arg* o.watermark_volume, 'selfClass.$mediaNode_ - ',selfClass.$mediaNode_,selfClass.$mediaNode_.children, selfClass.$mediaNode_.children[0].src);
          selfClass.$mediaNode_.volume = arg;

          if (selfClass.$watermarkMedia_) {
            selfClass.$watermarkMedia_.volume = arg * o.watermark_volume;
          }
        } else {
          if (selfClass.$mediaNode_) {
            $(selfClass.$mediaNode_).attr('preload', 'metadata');
          }

        }

      }

      //console.log(selfClass.$controlsVolume.children('.volume_active'));


      volume_setOnlyVisual(arg, margs);

      if (selfClass._sourcePlayer) {
        margs.call_from = ('from_fake_player')
        if (selfClass._sourcePlayer.get(0) && selfClass._sourcePlayer.get(0).api_visual_set_volume(arg, margs)) {
          selfClass._sourcePlayer.get(0).api_visual_set_volume(arg, margs);
        }
      }

      if (selfClass._actualPlayer) {
        // console.log('try to set volume on actual player ( fake player ) ', 'selfClass._actualPlayer - ', selfClass._actualPlayer, margs);
        if (margs.call_from != ('from_fake_player')) {
          // margs.call_from = ('from_fake_player_feeder')
          if (margs.call_from == 'from_init_loaded') {

            margs.call_from = ('from_fake_player_feeder_from_init_loaded')
          } else {

            margs.call_from = ('from_fake_player_feeder')
          }
          if (selfClass._actualPlayer && selfClass._actualPlayer.get(0) && selfClass._actualPlayer.get(0).api_set_volume(arg, margs)) {
            selfClass._actualPlayer.get(0).api_set_volume(arg, margs);
          }
        }
      }

    }


    function volume_setOnlyVisual(arg, margs) {

      // console.log('')


      if (selfClass.$controlsVolume.hasClass('controls-volume-vertical')) {

        //console.log('ceva');
        selfClass.$controlsVolume.find('.volume_active').eq(0).css({
          'height': (selfClass.$controlsVolume.find('.volume_static').eq(0).height() * arg)
        });
      } else {

        selfClass.$controlsVolume.find('.volume_active').eq(0).css({
          'width': (selfClass.$controlsVolume.find('.volume_static').eq(0).width() * arg)
        });
      }


      if (o.design_skin == 'skin-wave' && o.skinwave_dynamicwaves == 'on') {
        //console.log(arg);
        selfClass._scrubbar.find('.scrub-bg-img').eq(0).css({
          'transform': 'scaleY(' + arg + ')'
        })
        selfClass._scrubbar.find('.scrub-prog-img').eq(0).css({
          'transform': 'scaleY(' + arg + ')'
        })

      }


      if (localStorage != null && selfClass.the_player_id) {

        //console.log(selfClass.the_player_id);

        localStorage.setItem('dzsap_last_volume_' + selfClass.the_player_id, arg);

      }

      volume_lastVolume = arg;
    }


    function volume_handleClickMuteIcon(e) {

      if (muted == false) {
        last_vol_before_mute = volume_lastVolume;
        volume_setVolume(0, {
          call_from: "from_mute"
        });
        muted = true;
      } else {
        volume_setVolume(last_vol_before_mute, {
          call_from: "from_unmute"
        });
        muted = false;
      }
    }

    function pause_media_visual(pargs) {

      if (selfClass._sourcePlayer) {
        //console.log('has selfClass._sourcePlayer and will pause that too - ',selfClass._sourcePlayer);
      }

      var margs = {
        'call_from': 'default'
      };


      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      // console.log('pause_media_visual',margs);

      if (o.design_animateplaypause != 'on') {
        selfClass.$conPlayPause.children('.playbtn').css({
          'display': 'block'
        });
        selfClass.$conPlayPause.children('.pausebtn').css({
          'display': 'none'
        });
      } else {

      }


      selfClass.$conPlayPause.removeClass('playing');
      cthis.removeClass('is-playing');
      selfClass.player_playing = false;

      //console.log("PAUSE MEDIA VISUAL")


      if (cthis.parent().hasClass('zoomsounds-wrapper-bg-center')) {
        cthis.parent().removeClass('is-playing');
      }


      if (o.parentgallery) {
        o.parentgallery.removeClass('player-is-playing');
      }


      sw_suspend_enter_frame = true;


      if (action_audio_pause) {
        action_audio_pause(cthis);
      }
    }

    function pause_media(pargs) {
      //console.log('pause_media()', cthis);

      if (selfClass._sourcePlayer) {
        //console.log('has selfClass._sourcePlayer and will pause that too - ',selfClass._sourcePlayer);
      }

      var margs = {
        'audioapi_setlasttime': true,
        'donot_change_media': false,
        'call_actual_player': true,
      };

      if (destroyed) {
        return false;
      }

      if (pargs) {
        margs = $.extend(margs, pargs);
      }


      pause_media_visual({
        'call_from': 'pause_media'
      });



      if (margs.call_actual_player && margs.donot_change_media !== true) {
        if (selfClass._actualPlayer != null) {
          var args = {
            type: selfClass.actualDataTypeOfMedia,
            fakeplayer_is_feeder: 'on'
          }
          if (selfClass._actualPlayer && selfClass._actualPlayer.length && selfClass._actualPlayer.data('feeding-from') != cthis.get(0)) {
            args.called_from = 'pause_media from player ' + cthis.attr('data-source');
            selfClass._actualPlayer.get(0).api_change_media(cthis, args);
          }
          setTimeout(function () {
            if (selfClass._actualPlayer.get(0) && selfClass._actualPlayer.get(0).api_pause_media) {
              selfClass._actualPlayer.get(0).api_pause_media();
            }
          }, 100);

          selfClass.player_playing = false;
          cthis.removeClass('is-playing');
          if (cthis.parent().hasClass('zoomsounds-wrapper-bg-center')) {
            cthis.parent().removeClass('is-playing');
          }
          return;
        }
      }


      dzsapMediaFuncs.media_pause(selfClass, () => {
        // console.log('selfClass._sourcePlayer - ', selfClass._sourcePlayer, '(cthis) - ', cthis);
        if (selfClass._sourcePlayer) {
          if (selfClass._sourcePlayer.get(0) && selfClass._sourcePlayer.get(0).api_pause_media_visual) {
            selfClass._sourcePlayer.get(0).api_pause_media_visual({
              'call_from': 'pause_media in child player'
            });
          }
        }
      })


      selfClass.player_playing = false;
      cthis.removeClass('is-playing');


      if (cthis.parent().hasClass('zoomsounds-wrapper-bg-center')) {
        cthis.parent().removeClass('is-playing');
      }

    }

    function play_media_visual(margs) {


      if (o.design_animateplaypause != 'on') {

        selfClass.$conPlayPause.children('.playbtn').css({
          'display': 'none'
        });
        selfClass.$conPlayPause.children('.pausebtn').css({
          'display': 'block'
        });
      }


      //return false;
      selfClass.player_playing = true;
      sw_suspend_enter_frame = false;

      //return false;
      cthis.addClass('is-playing');
      cthis.addClass('first-played');

      selfClass.$conPlayPause.addClass('playing');

      if (cthis.parent().hasClass('zoomsounds-wrapper-bg-center')) {
        cthis.parent().addClass('is-playing');
      }

      if (o.parentgallery) {
        o.parentgallery.addClass('player-is-playing');
      }


      if (_sticktobottom) {
        _sticktobottom.addClass('audioplayer-loaded');
      }

      //console.log(cthis, margs);

      if (action_audio_play) {
        action_audio_play(cthis);
      }
      if (action_audio_play2) {
        action_audio_play2(cthis);
      }


    }

    function play_media(pargs) {

      //                console.log(dzsap_list);


      var margs = {
        'api_report_play_media': true
        , 'called_from': 'default'
        , 'retry_call': 0
      }
      if (pargs) {
        margs = $.extend(margs, pargs)
      }

      if (!setuped_media) {
        setup_media({'called_from': margs.called_from + '[play_media .. not setuped]'});
      }


      // console.log('.play_media() -3 ',margs,cthis, 'type - ',type, 'selfClass.$mediaNode_ - ', selfClass.$mediaNode_);
      //return false ;
      //return;

      if (margs.called_from === 'api_sync_players_prev') {
        // console.log('o.parentgallery - ',o.parentgallery);

        player_index_in_gallery = cthis.parent().children('.audioplayer,.audioplayer-tobe').index(cthis);

        if (o.parentgallery && o.parentgallery.get(0) && o.parentgallery.get(0).api_goto_item) {
          o.parentgallery.get(0).api_goto_item(player_index_in_gallery);
        }
      }
      // console.log('selfClass.spectrum_audioContext_buffer - ', selfClass.spectrum_audioContext_buffer);
      if (dzsapHelpers.is_ios() && selfClass.spectrum_audioContext_buffer === 'waiting') {
        setTimeout(function () {
          pargs.call_from_aux = 'waiting audioCtx_buffer or ios';
          play_media(pargs);
        }, 500);
        return false;
      }

      if (margs.called_from == 'click_playpause') {
        // -- lets setup the playlist
      }


      if (cthis.hasClass('media-setuped') == false && selfClass._actualPlayer == null) {
        console.log('warning: media not setuped, there might be issues', cthis.attr('id'));
      }


      if (margs.called_from.indexOf('feed_to_feeder')>-1) {
        if (cthis.hasClass('dzsap-loaded') == false) {
          init_loaded();
          var delay = 300;
          if (dzsapHelpers.is_android_good()) {
            delay = 0;
          }
          if (margs.call_from_aux != 'with delay') {
            if (delay) {
              setTimeout(function () {
                margs.call_from_aux = 'with delay';
                play_media(margs);
              }, delay);
            } else {
              play_media(margs);
            }
            return false;
          }

        }
      }


      //console.log(o.type);
      if (selfClass.audioType != 'fake') {

        //return false;
      }


      dzsapHelpers.player_stopOtherPlayers(dzsap_list, selfClass);


      if (destroyed_for_rebuffer) {
        setup_media({
          'called_from': 'play_media() .. destroyed for rebuffer'
        });
        if (dzsHelpers.isInt(playfrom)) {
          seek_to(playfrom, {
            'call_from': 'destroyed_for_rebuffer_playfrom'
          });
        }
        destroyed_for_rebuffer = false;
      }

      // console.log(o.google_analytics_send_play_event, window._gaq, google_analytics_sent_play_event);
      if (o.google_analytics_send_play_event === 'on' && window._gaq && google_analytics_sent_play_event === false) {
        //if(window.console){ console.log( 'sent event'); }
        window._gaq.push(['_trackEvent', 'ZoomSounds Play', 'Play', 'zoomsounds play - ' + dataSrc]);
        google_analytics_sent_play_event = true;
      }
      // console.log(o.google_analytics_send_play_event, window.ga, google_analytics_sent_play_event);

      if (!window.ga) {
        if (window.__gaTracker) {
          window.ga = window.__gaTracker;
        }
      }

      if (o.google_analytics_send_play_event == 'on' && window.ga && google_analytics_sent_play_event == false) {
        if (window.console) {
          console.log('sent event');
        }
        google_analytics_sent_play_event = true;
        window.ga('send', {
          hitType: 'event',
          eventCategory: 'zoomsounds play - ' + dataSrc,
          eventAction: 'play',
          eventLabel: 'zoomsounds play - ' + dataSrc
        });
      }

      //===media functions

      if (selfClass._sourcePlayer) {

        //console.log(cthis, selfClass._sourcePlayer);

        if (selfClass._sourcePlayer.get(0) && selfClass._sourcePlayer.get(0).api_pause_media_visual) {
          selfClass._sourcePlayer.get(0).api_play_media_visual({
            'api_report_play_media': false
          });
        }

      }

      // console.log("TYPE IS ",type, selfClass._actualPlayer);

      if (selfClass._actualPlayer) {
        // -- the actual player is the footer player

        //console.log("SUBMIT PLAY TO fakeplayer", selfClass._actualPlayer);
        var args = {
          type: selfClass.actualDataTypeOfMedia,
          fakeplayer_is_feeder: 'on',
          call_from: 'play_media_audioplayer'
        }

        try {
          if (margs.called_from == 'click_playpause') {
            // -- let us reset up the playlist


            if (o.parentgallery) {
              o.parentgallery.get(0).api_regenerate_sync_players_with_this_playlist();
              selfClass._actualPlayer.get(0).api_regenerate_playerlist_inner();
            }

            // console.log("we regenerate playlist here");
          }

          if (selfClass._actualPlayer && selfClass._actualPlayer.length && selfClass._actualPlayer.data('feeding-from') != cthis.get(0)) {

            args.called_from = 'play_media from player 22 ' + cthis.attr('data-source') + ' < -  ' + 'old call from - ' + margs.called_from;

            if (selfClass._actualPlayer.get(0).api_change_media) {
              selfClass._actualPlayer.get(0).api_change_media(cthis, args);
            }

            if (cthis.hasClass('first-played') == false) {
              if (cthis.data('promise-to-play-footer-player-from')) {
                seek_to(cthis.data('promise-to-play-footer-player-from'));
                setTimeout(function () {
                  cthis.data('promise-to-play-footer-player-from', '');
                }, 1000);
              }
            }

          }
          setTimeout(function () {
            if (selfClass._actualPlayer.get(0) && selfClass._actualPlayer.get(0).api_play_media) {
              selfClass._actualPlayer.get(0).api_play_media({
                'called_from': '[feed_to_feeder]'
              });
            }
          }, 100);


          // console.log('ajax view submitted', cthis, selfClass.ajax_view_submitted);
          if (selfClass.ajax_view_submitted == 'off') {
            (dzsapAjax.ajax_submit_views.bind(selfClass))();
          }
          return;


        } catch (err) {
          console.log('no fake player..', err);
        }
      }


      if (selfClass.audioType == 'youtube') {

        dzsapHelpers.youtube_playMedia(selfClass, margs, yt_inited, yt_curr_id);
      }
      if (selfClass.audioType == 'normal' || selfClass.audioType == 'detect' || selfClass.audioType == 'audio') {
        selfClass.audioType = 'selfHosted';
      }
      if (selfClass.audioType == 'selfHosted') {


      }


      //console.log('watermark - .play', selfClass.$watermarkMedia_)
      if (selfClass.$watermarkMedia_) {
        //console.log('watermark - .play', selfClass.$watermarkMedia_, selfClass.$watermarkMedia_.play)
        if (selfClass.$watermarkMedia_.play) {
          selfClass.$watermarkMedia_.play();
        }
      }


      dzsapMediaFuncs.media_tryToPlay(selfClass, () => {

        //return false;
        play_media_visual(margs);


        //console.log(selfClass.ajax_view_submitted);


        if (selfClass._sourcePlayer) {
          window.dzsap_currplayer_focused = selfClass._sourcePlayer.get(0);
          if (selfClass._sourcePlayer.get(0) && selfClass._sourcePlayer.get(0).api_pause_media_visual) {
            selfClass._sourcePlayer.get(0).api_try_to_submit_view();
          }

        } else {

          window.dzsap_currplayer_focused = cthis.get(0);
          try_to_submit_view();
        }


        if (selfClass.keyboard_controls.play_trigger_step_back == 'on') {

          if (dzsap_currplayer_focused) {

            dzsap_currplayer_focused.api_step_back(selfClass.keyboard_controls.step_back_amount);
          }
        }
      }, (err) => {
        console.log('error autoplay playing -  ', err);
        setTimeout(() => {
          pause_media();
          console.log('trying to pause')
        }, 30);
      })


    }


    function try_to_submit_view() {
      // console.log('try_to_submit_view', cthis, selfClass.ajax_view_submitted);
      if (selfClass.ajax_view_submitted == 'auto') {
        selfClass.ajax_view_submitted = 'off';
      }
      if (selfClass.ajax_view_submitted == 'off') {

        (dzsapAjax.ajax_submit_views.bind(selfClass))();
      }
    }


  }
}


function register_dzsap_plugin() {
  (function ($) {


    window.dzsap_list_for_sync_build = function () {
    };


    Math.easeIn = function (t, b, c, d) {
      // console.log('math.easein')

      return -c * (t /= d) * (t - 2) + b;

    };


    dzsapHelpers.assignHelperFunctionsToJquery($);


    // -- define player here
    $.fn.audioplayer = function (argOptions) {
      var finalOptions = {};
      var defaultOptions = Object.assign({}, require('./configs/_settingsPlayer').default_opts);
      finalOptions = dzsapHelpers.convertPluginOptionsToFinalOptions(this, defaultOptions, argOptions);


      // console.log('finalOptions -- ',finalOptions);
      this.each(function () {
        var _ag = new DzsAudioPlayer(this, finalOptions, $);
        return this;
      })
    }


    // -- defined gallery here
    // --
    // AUDIO GALLERY
    // --


    dzsapPlaylist.registerToJquery($);
    window.dzsag_init = function (selector, settings) {
      if (typeof (settings) != "undefined" && typeof (settings.init_each) != "undefined" && settings.init_each === true) {
        if (Object.keys(settings).length === 1) {
          settings = undefined;
        }

        $(selector).each(function () {
          var _t = $(this);
          _t.audiogallery(settings)
        });
      } else {
        $(selector).audiogallery(settings);
      }
    };

  })(jQuery);
}


function register_dzsap_aux_script() {
  jQuery(document).ready(function ($) {


    // -- main call
    // console.log('song changers -> ', $('.audioplayer-song-changer'));


    $('body').append('<style class="dzsap--style"></style>');

    window.dzsap__style = $('.dzsap--style');

    $(window).on('resize.dzsapmain', handle_resize_dzsap_main);

    // -- remove focus on input focus
    $(document).on('focus.dzsap', 'input', function () {
      // console.log("FOCUS - ");
      window.dzsap_currplayer_focused = null;
    })

    var inter_resize = 0;

    function handle_resize_dzsap_main() {

      clearTimeout(inter_resize);
      inter_resize = setTimeout(function () {
        handle_resize_dzsap_main_doit();
      }, 300)


    }

    function handle_resize_dzsap_main_doit() {

      // console.log('$(\'.dzsap-sticktobottom\') - ',$('.dzsap-sticktobottom'));
      if ($('.dzsap-sticktobottom').length) {


        dzsap_sticktobottom_con = $('.dzsap-sticktobottom').eq(0);
      }

      if (dzsap_sticktobottom_con) {
        // console.log('dzsap_sticktobottom_con - ',dzsap_sticktobottom_con);

        var aux = 'body .dzsap-sticktobottom:not(.audioplayer-loaded)';

        // console.log('dzsap_sticktobottom_con.outerHeight() - ',dzsap_sticktobottom_con.outerHeight());
        aux += '{';
        aux += 'bottom: -' + (dzsap_sticktobottom_con.outerHeight()) + 'px';
        aux += '}';

        window.dzsap__style.html(aux);

      }
    }

    handle_resize_dzsap_main();

    $('audio.zoomsounds-from-audio').each(function () {
      var _t = $(this);
      //console.log(_t);

      _t.after('<div class="audioplayer-tobe auto-init skin-silver" data-source="' + _t.attr('src') + '"></div>');

      _t.remove();
    })


    $('.audioplayer,.audioplayer-tobe').each(function () {
      var _t2 = $(this);

      if (_t2.hasClass('auto-init')) {
        if (_t2.hasClass('audioplayer-tobe') == true) {

          if (window.dzsap_init) {

            dzsap_init(_t2, {
              init_each: true
            });
          }
        }
      }
    })

    //console.log('dzsap_list_for_sync_players - ', dzsap_list_for_sync_players);

    //console.log($('.zoomvideogallery.auto-init'));

    dzsag_init('.audiogallery.auto-init', {
      init_each: true
    });


    // console.log('we are hier');


    dzsapHelpers.jQueryAuxBindings($);


    // $(document).off('click.dzsap_multisharer');


  });


  dzsapHelpers.registerTextWidth(jQuery);

}


function is_safari() {
  return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
}


window.requestAnimFrame = (function () {
  //console.log(callback);
  // return function( callback,element) {
  //     console.log('wow');
  //     window.setTimeout(callback, 1000 / 2);
  // };;
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function ( /* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();


window.dzsap_currplayer_focused = null;
window.dzsap_currplayer_from_share = null;
window.dzsap_mouseover = false;


// console.log('window.dzsap_init_calls - ', window.dzsap_init_calls);

function dzsap_call_init_calls() {
  // console.log('window.dzsap_call_init_calls - ',window.dzsap_call_init_calls);
  for (var key in window.dzsap_init_calls) {
    window.dzsap_init_calls[key](jQuery);
  }
  window.dzsap_init_calls = [];

}

window.dzsap_call_init_calls = dzsap_call_init_calls;

if (window.jQuery) {
  register_dzsap_plugin();
  register_dzsap_aux_script();
  jQuery(document).ready(function ($) {
    dzsap_call_init_calls()
  })
} else {
  var script = document.createElement('script');
  document.head.appendChild(script);
  script.type = 'text/javascript';
  script.src = "//ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js";
  script.onload = function () {
    register_dzsap_plugin();
    register_dzsap_aux_script();
    dzsap_call_init_calls()
  }
}


window.dzsap_init = function (selector, settings) {

  //console.log(selector);
  if (typeof (settings) != "undefined" && typeof (settings.init_each) != "undefined" && settings.init_each == true) {
    var element_count = 0;
    for (var e in settings) {
      element_count++;
    }
    if (element_count === 1) {
      settings = undefined;
    }

    jQuery(selector).each(function () {
      var _t = jQuery(this);
      if (settings && typeof (settings.call_from) == 'undefined') {
        settings.call_from = 'dzsap_init';
      }


      _t.audioplayer(settings)
    });
  } else {
    jQuery(selector).audioplayer(settings);
  }

  window.dzsap_lasto = settings;


  dzsapHelpers.dzsapInitjQueryRegisters();
};
dzsapHelpers.miscFunctions();
