const dzsapHelpers = require('./_dzsap_helpers');
const ZoomSoundsNav = require('./components/_nav');

const Constants = require('../configs/_constants').constants;

// Constants.DEMO;

class DzsApPlaylist {
  constructor(argThis, argOptions, $) {

    this.argThis = argThis;
    this.argOptions = argOptions;
    this.$ = $;
    this.navClass = null;


    this.init();
  }

  init() {
    // console.log('this -> ', this);


    var $ = this.$;
    var selfGallery = this;
    //console.log("INITED");
    var o = selfGallery.argOptions;
    var cgallery = $(selfGallery.argThis);
    var cid = 'ag1';
    var currNr = -1 // -- the current player that is playing
      , lastCurrNr = 0
      , nrChildren = 0
      , tempNr = 0;
    var busy = true;
    var i = 0;


    var dzsap_currplayer_focused = null;
    var _sliderMain, _sliderClipper, _navMain, _navClipper, _cache;
    var busy = false,
      first = true,
      destroyed = true,
      skin_redlight_give_controls_right_to_all_players = false // -- if the mode is mode-showall and the skin of the player is redlights, then make all players with controls right
    ;



    var aux_error = 20; //==erroring for the menu scroll

    var trying_to_get_track_data = false;


    var arr_menuitems = [];
    var track_data = []; // -- the whole track data views / likes etc.

    var str_alertBeforeRate = 'You need to comment or rate before downloading.';


    var duration_viy = 20;

    var target_viy = 0;

    var begin_viy = 0;

    var finish_viy = 0;

    var change_viy = 0;

    selfGallery.goto_item = goto_item;
    selfGallery.handleResize = handleResize;


    selfGallery.initOptions = o;
    if (window.dzsap_settings && typeof (window.dzsap_settings.str_alertBeforeRate) != 'undefined') {
      str_alertBeforeRate = window.dzsap_settings.str_alertBeforeRate;
    }

    cgallery.get(0).currNr_2 = -1; // -- we use this as backup currNR for mode-showall ( hack )

    init();

    function init() {
      // -- init gallery here

      // console.log('o.settings_ap before data-player-options - ',o.settings_ap);
      // console.log('%c o gallery','background-color: #ccc;',$.extend({},o));


      if (o.settings_ap == 'default') {

        if (cgallery.attr('data-player-options')) {
          o.settings_ap = dzsapHelpers.convertPluginOptionsToFinalOptions(cgallery.get(0), {}, null, 'data-player-options');
        }else{
          const _firstPlayer = cgallery.find('.audioplayer, .audioplayer-tobe').eq(0);
          if(_firstPlayer){

            o.settings_ap = dzsapHelpers.convertPluginOptionsToFinalOptions(_firstPlayer.get(0), {}, null);
          }
        }
      }


      // console.log('o.settings_ap after data-player-options - ',Object.assign({}, o.settings_ap));
      if (o.settings_ap == 'default') {
        o.settings_ap = {};
      }


      if (o.design_menu_width == 'default') {
        o.design_menu_width = '100%';
      }
      if (o.design_menu_height == 'default') {
        o.design_menu_height = '200';
      }


      if (cgallery.hasClass('skin-wave')) {
        o.design_skin = 'skin-wave';
      }
      if (cgallery.hasClass('skin-default')) {
        o.design_skin = 'skin-default';
      }
      if (cgallery.hasClass('skin-aura')) {
        o.design_skin = 'skin-aura';
      }


      cgallery.addClass(o.settings_mode);


      cgallery.append('<div class="slider-main"><div class="slider-clipper"></div></div>');

      cgallery.addClass('menu-position-' + o.design_menu_position);

      _sliderMain = cgallery.find('.slider-main').eq(0);


      var auxlen = cgallery.find('.items').children('.audioplayer-tobe').length;

      // --- if there is a single audio player in the gallery - theres no point of a menu


      o.settings_ap.disable_player_navigation = o.disable_player_navigation;
      if (auxlen == 0 || auxlen == 1) {
        o.design_menu_position = 'none';
        o.settings_ap.disable_player_navigation = 'on';
      }


      // console.log('ZoomSoundsNav - ', ZoomSoundsNav);

      selfGallery.navClass = new ZoomSoundsNav.ZoomSoundsNav(selfGallery);


      if (o.design_menu_position == 'top') {
        _sliderMain.before(selfGallery.navClass.get_structZoomsoundsNav());
      }
      if (o.design_menu_position == 'bottom') {
        _sliderMain.after(selfGallery.navClass.get_structZoomsoundsNav());
      }

      // console.log('[settingsap] o.settings_ap -', o.settings_ap);
      if (o.settings_php_handler) {

      } else {
        if (o.settings_ap.settings_php_handler) {
          o.settings_php_handler = o.settings_ap.settings_php_handler;
        }
      }


      if (typeof cgallery.attr('id')) {
        cid = cgallery.attr('id');
      } else {

        var ind = 0;
        while ($('ag' + ind).length == 0) {
          ind++;
        }


        cid = 'ag' + ind;

        cgallery.attr('id', cid);
      }


      _sliderClipper = cgallery.find('.slider-clipper').eq(0);
      _navMain = cgallery.find('.nav-main').eq(0);
      _navClipper = cgallery.find('.nav-clipper').eq(0);

      if (cgallery.children('.extra-html').length) {
        cgallery.append(cgallery.children('.extra-html'));
      }

      if (o.settings_mode == 'mode-showall') {
        _sliderClipper.addClass('layout-' + o.mode_showall_layout);
      }

      selfGallery.navClass.set_elements(_navMain, _navClipper, cgallery);


      reinit();

      //console.log(arr_menuitems);

      selfGallery.navClass.init_ready();


      parse_track_data();


      if (dzsapHelpers.can_history_api() == false) {
        o.settings_enable_linking = 'off';
      }


      if (cgallery.css('opacity') == 0) {
        cgallery.animate({
          'opacity': 1
        }, 1000);
      }

      $(window).bind('resize', handleResize);
      handleResize();
      setTimeout(handleResize, 1000);


      cgallery.get(0).api_skin_redlights_give_controls_right_to_all = function () {

        // -- void f()

        skin_redlight_give_controls_right_to_all_players = true;
      }


      if (dzsapHelpers.get_query_arg(window.location.href, 'audiogallery_startitem_' + cid)) {
        tempNr = Number(dzsapHelpers.get_query_arg(window.location.href, 'audiogallery_startitem_' + cid));

        lastCurrNr = tempNr;
        if (Number(dzsapHelpers.get_query_arg(window.location.href, 'audiogallery_startitem_' + cid)) && Number(dzsapHelpers.get_query_arg(window.location.href, 'audiogallery_startitem_' + cid)) > 0) {

          // console.log(cid,o.force_autoplay_when_coming_from_share_link)

          // -- caution .. coming from share link will trigger autoplay!!!
          if (o.force_autoplay_when_coming_from_share_link == 'on') {
            o.autoplay = 'on';
          }
        }
      }
      // console.log('%c o gallery','background-color: #ccc;',$.extend({},o));


      if (o.settings_mode == 'mode-normal') {

        goto_item(tempNr, {
          'called_from': 'init'
        });
      }


      if (o.settings_mode == 'mode-showall') {
        // -- mode-showall

        _sliderClipper.children().each(function () {
          var _t = $(this);

          //console.log(_t);

          var ind = _t.parent().children('.audioplayer,.audioplayer-tobe').index(_t);

          if (_t.hasClass('audioplayer-tobe')) {
            //console.log(o.settings_ap);


            var player_args = Object.assign({}, o.settings_ap);
            player_args.parentgallery = cgallery;
            player_args.call_from = 'mode show-all';
            player_args.action_audio_play = mode_showall_listen_for_play;

            // -- showall
            _t.audioplayer(player_args);

            //console.log(ind);

            ind = String(ind + 1);

            if (ind.length < 2) {
              ind = '0' + ind;
            }

            if (o.mode_showall_layout == 'one-per-row' && o.settings_mode_showall_show_number != 'off') {

              _t.before('<div class="number-wrapper"><span class="the-number">' + ind + '</span></div>')
              _t.after('<div class="clear for-number-wrapper"></div>')
            }
          }

        })


        if ($.fn.isotope && o.mode_showall_layout != 'one-per-row') {

          // -- we have isotope

          // console.log('_sliderClipper.find(\'.audioplayer,.audioplayer-tobe\') - ' ,_sliderClipper.find('.audioplayer,.audioplayer-tobe'));
          _sliderClipper.find('.audioplayer,.audioplayer-tobe').addClass('isotope-item');
          setTimeout(function () {

            _sliderClipper.prepend('<div class="grid-sizer"></div>');
            _sliderClipper.isotope({
              // options
              itemSelector: '.isotope-item',
              layoutMode: 'fitRows',
              percentPosition: true,
              masonry: {
                columnWidth: '.grid-sizer'
              }
            });
            _sliderClipper.addClass('isotoped');
            setTimeout(function () {
              _sliderClipper.isotope('layout')
            }, 900);
          }, Constants.PLAYLIST_TRANSITION_DURATION);


          _sliderClipper.append('<div class="clear"></div>');
        }


        //console.log('dada2', skin_redlight_give_controls_right_to_all_players);


        if (skin_redlight_give_controls_right_to_all_players) {

          _sliderClipper.children('.audioplayer').each(function () {

            var _t = $(this);

            //console.log(_t);

            if (_t.find('.ap-controls-right').eq(0).prev().hasClass('controls-right') == false) {
              _t.find('.ap-controls-right').eq(0).before('<div class="controls-right"> </div>');
            }
          });
        }

      }


      cgallery.find('.download-after-rate').bind('click', click_downloadAfterRate);

      cgallery.get(0).api_regenerate_sync_players_with_this_playlist = regenerate_sync_players_with_this_playlist;
      cgallery.get(0).api_goto_next = goto_next;
      cgallery.get(0).api_goto_prev = goto_prev;
      cgallery.get(0).api_goto_item = goto_item;
      cgallery.get(0).api_gallery_handle_end = gallery_handle_end;
      cgallery.get(0).api_toggle_menu_state = toggle_menu_state;
      cgallery.get(0).api_handleResize = handleResize;
      cgallery.get(0).api_player_commentSubmitted = player_commentSubmitted;
      cgallery.get(0).api_player_rateSubmitted = player_rateSubmitted;
      cgallery.get(0).api_reinit = reinit;
      cgallery.get(0).api_play_curr_media = play_curr_media;
      cgallery.get(0).api_get_nr_children = get_nr_children;
      cgallery.get(0).api_init_player_from_gallery = init_player_from_gallery;
      cgallery.get(0).api_filter = filter;
      cgallery.get(0).api_destroy = destroy_gallery;


      setInterval(calculate_on_interval, 1000);


      setTimeout(init_loaded, 700);


      if (o.enable_easing == 'on') {

        handle_frame();
      }
      //console.log(cgallery);

      cgallery.addClass('dzsag-inited');

      cgallery.addClass('transition-' + o.playlistTransition);
      cgallery.addClass('playlist-transition-' + o.playlistTransition);


    }


    function destroy_gallery() {


      if (destroyed) {
        return false;
      }


      // $(window).off('resize.dzsap');

      cgallery.remove();
      cgallery = null;

      destroyed = true;
    }

    function filter(argby, arg) {
      if (!(argby)) {
        argby = 'title';
      }

      const filterForIsotope = (argthis) => {


        // console.log(this, typeof this, argthis);
        var _t = $(argthis);
        var referenceVal = '';

        if (argby == 'title') {
          referenceVal = _t.find('.the-name').text();
        }

        // console.log('argby - ',argby, ' | ', _t, _t.find('.the-name'));
        // console.log('$(this).find(\'.the-name\') - ',referenceVal, ' | ', arg);

        if (arg == '') {
          return true;
        }
        if (referenceVal.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
          return true;
        }
        return false;
        // console.log(arg2,this,arg);
      }
      if (_sliderClipper.hasClass('isotoped')) {
        _sliderClipper.isotope({
          filter: filterForIsotope
        });
      } else {
        _sliderClipper.children().each(function () {
          var sw = filterForIsotope(this);
          // console.log('sw - ',sw);
          if (sw) {
            $(this).fadeIn('fast');
          } else {

            // console.warn("OUT FAST");
            $(this).fadeOut('fast');
          }
        })
      }
    }

    function regenerate_sync_players_with_this_playlist() {

      // -- in case we play from playlist we overwrite whole footer playlist

      dzsap_list_for_sync_players = [];

      _sliderClipper.children('.audioplayer,.audioplayer-tobe').each(function () {
        var _t = $(this);
        _t.addClass('feeded-whole-playlist');

        if (_t.attr('data-do-not-include-in-list') != 'on') {
          dzsap_list_for_sync_players.push(_t);
        }
      })
    }


    function init_parse_track_data() {

      if (trying_to_get_track_data) {
        return false;
      }

      trying_to_get_track_data = true;

      var data = {
        action: 'dzsap_get_views_all',
        postdata: '1',
      };


      if (o.settings_php_handler) {
        $.ajax({
          type: "POST",
          url: o.settings_php_handler,
          data: data,
          success: function (response) {
            //if(typeof window.console != "undefined" ){ console.log('Ajax - get - comments - ' + response); }

            cgallery.attr('data-track-data', response);
            parse_track_data();

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

    function parse_track_data() {
      if (cgallery.attr('data-track-data')) {
        try {
          track_data = JSON.parse(cgallery.attr('data-track-data'));
        } catch (err) {
          console.log(err);
        }

        if (track_data && track_data.length) {

          selfGallery.navClass.parseTrackData(track_data);
          //console.warn(foundnr, track_data.length);
        }


      }

      //console.log(' track_data - ' ,track_data);
    }

    function get_nr_children() {
      return nrChildren;
    }

    function find_player_id(arg) {
      if (arg.attr('data-player-id')) {
        return arg.attr('data-player-id');
      } else {
        if (arg.attr('id')) {
          return arg.attr('id');
        } else {
          if (arg.attr('data-source')) {
            return dzsapHelpers.dzs_clean_string(arg.attr('data-source'));
          }
        }
      }
    }

    function reinit() {


      //console.log('reinit()', cgallery.find('.items').eq(0).children(), cgallery.find('.items').eq(0).children().length);

      var notInitedPlayersLength = cgallery.find('.items').eq(0).children('.audioplayer-tobe').length;
      arr_menuitems = [];

      var player_id = '';

      //console.log('reinit - ', cgallery.find('.items').eq(0).children());

      for (i = 0; i < notInitedPlayersLength; i++) {
        // -- construct palyers here
        var _c = cgallery.find('.items').children('.audioplayer-tobe').eq(0);

        //console.log('_c) - ',_c);

        var menuDescriptionHtml = '';

        if (_c.find('.menu-description').html()) {
          menuDescriptionHtml = _c.find('.menu-description').html();
        } else {
          menuDescriptionHtml = '';

          if (_c.find('.feed-artist').length || _c.find('.feed-songname').length) {

            menuDescriptionHtml = ``;
            if(_c.attr('data-thumb')){
              menuDescriptionHtml+=`<div class="menu-item-thumb-con"><div class="menu-item-thumb" style="background-image: url(${_c.attr('data-thumb')})"></div></div>`;
            }
            menuDescriptionHtml += `<div class="menu-artist-info"><span class="the-artist">${_c.find('.feed-artist').html()}</span><span class="the-name">${_c.find('.feed-songname').html()}</span></div>`
          }
        }

        var auxer = {
          'menu_description': menuDescriptionHtml
          , 'player_id': find_player_id(_c)
        }

        arr_menuitems.push(auxer)
        //cgallery.find('.items').children().eq(0).find('.menu-description').remove();

        // console.log('_c - ',_c);


        _sliderClipper.append(_c);

        // if (o.settings_mode == 'mode-showall') {
        //   _c.wrap('<div class=""></div>')
        // }

      }


      // console.log('arr_menuitems - ', arr_menuitems);
      for (i = 0; i < arr_menuitems.length; i++) {
        var extra_class = '';
        if (arr_menuitems[i].menu_description && arr_menuitems[i].menu_description.indexOf('<div class="menu-item-thumb-con"><div class="menu-item-thumb" style="') == -1) {
          extra_class += ' no-thumb';
        }


        var aux = '<div class="menu-item' + extra_class + '"  data-menu-index="' + i + '" data-gallery-id="' + cid + '" data-playerid="' + arr_menuitems[i].player_id + '">'

        if (cgallery.hasClass('skin-aura')) {
          aux += '<div class="menu-item-number">' + (++nrChildren) + '</div>';
        }

        aux += arr_menuitems[i].menu_description;


        if (cgallery.hasClass('skin-aura') && String(arr_menuitems[i].menu_description).indexOf('menu-item-views') == 1) {

          if (track_data && track_data.length > 0) {

            aux += '<div class="menu-item-views"></div>';
          } else {

            init_parse_track_data();
            aux += '<div class="menu-item-views">' + dzsapSvgs.svg_play_icon + ' ' + '<span class="the-count">{{views_' + arr_menuitems[i].player_id + '}}' + '</span></div>';
          }

        }


        aux += '</div>';

        _navClipper.append(aux);


        if (cgallery.hasClass('skin-aura')) {

          if (arr_menuitems[i] && arr_menuitems[i].menu_description && arr_menuitems[i].menu_description.indexOf('float-right') > -1) {
            _navClipper.children().last().addClass('has-extra-info')
          }
        }
        // nrChildren++;
      }
    }

    function init_loaded() {
      // -- gallery

      cgallery.addClass('dzsag-loaded');
    }

    function click_downloadAfterRate() {
      var _t = $(this);


      if (_t.hasClass('active') == false) {
        alert(str_alertBeforeRate)
        return false;
      }
    }


    function play_curr_media() {

      if (typeof (_sliderClipper.children().eq(currNr).get(0)) != 'undefined') {
        if (typeof (_sliderClipper.children().eq(currNr).get(0).api_play_media) != 'undefined') {
          _sliderClipper.children().eq(currNr).get(0).api_play_media({
            'call_from': 'play_curr_media_gallery'
          });
        }

      }
    }

    function mode_showall_listen_for_play(arg) {

      //console.log('mode_showall_listen_for_play()',currNr, arg);

      if (o.settings_mode == 'mode-showall') {

        var ind = _sliderClipper.children('.audioplayer,.audioplayer-tobe').index(arg);
        //console.log(ind);
        currNr = ind;
        cgallery.get(0).currNr_2 = ind;
        //console.log(cgallery,currNr)
      }
      //console.log('mode_showall_listen_for_play()',currNr,this, cgallery.get(0).currNr_2);
    }

    function handle_frame() {

      // -- cgallery

      if (isNaN(target_viy)) {
        target_viy = 0;
      }

      if (duration_viy === 0) {
        requestAnimFrame(handle_frame);
        return false;
      }

      begin_viy = target_viy;
      change_viy = selfGallery.navClass.finish_viy - begin_viy;


      //console.log('handle_frame', finish_viy, duration_viy, target_viy);

      //console.log(duration_viy);


      target_viy = Number(Math.easeIn(1, begin_viy, change_viy, duration_viy).toFixed(4));
      ;


      if (dzsapHelpers.is_ios() == false && dzsapHelpers.is_android() == false) {
        _navClipper.css({
          'transform': 'translateY(' + target_viy + 'px)'
        });
      }


      //console.log(_blackOverlay,target_bo);;

      requestAnimFrame(handle_frame);
    }


    function toggle_menu_state() {

      selfGallery.navClass.toggle_menu_state();
    }

    function gallery_handle_end() {

      if (o.autoplayNext == 'on') {

        goto_next();
      }
    }

    function player_commentSubmitted() {
      _navClipper.children('.menu-item').eq(currNr).find('.download-after-rate').addClass('active');

    }

    function player_rateSubmitted() {
      _navClipper.children('.menu-item').eq(currNr).find('.download-after-rate').addClass('active');
    }

    function calculateDims() {
      //                console.log('calculateDims');


      // console.log('_sliderClipper.hasClass(\'isotoped\') - ',_sliderClipper.hasClass('isotoped'));
      if (o.settings_mode != 'mode-showall' && _sliderClipper.hasClass('isotoped') == false && o.mode_normal_video_mode != 'one') {
        // -- mode normal, not isotope
        if (_sliderClipper.children().eq(currNr).hasClass('zoomsounds-wrapper-bg-bellow') == false) {
          _sliderClipper.css('height', _sliderClipper.children().eq(currNr).outerHeight());

        }
      }

      if (_sliderClipper.hasClass('isotoped') == false) {
        // -- not isotope
        setTimeout(function () {
          _sliderClipper.css('height', 'auto');
        }, Constants.PLAYLIST_TRANSITION_DURATION);
      }

      //                _navMain.show();

      //                return;


      selfGallery.navClass.calculateDims();

      if (o.embedded == 'on') {
        //console.log(window.frameElement)
        if (window.frameElement) {
          window.frameElement.height = cgallery.height();
          //console.log(window.frameElement.height, cgallery.outerHeight())
        }
      }
    }


    function calculate_on_interval() {
      // -- @called on setInterval

      selfGallery.navClass.calculateDims();

      // -- this is for player ? todo ...
      if (0 && o.gallery_gapless_play == 'on') {
        var args = {
          'call_from': 'gapless_play'
        }

        if (o.parentgallery && cthis.hasClass('active-from-gallery')) {
          var _c = o.parentgallery;
          // console.log(_c);
          // console.log(_c.data('currNr'));


          var _cach = _sliderClipper.children().eq(Number(_c.data('currNr')) + 1);


          if (!(_cach.data('gapless-inited') == true)) {

            var args = {
              preload_method: "auto"
              , "autoplay": "off"
              , "call_from": "gapless_play"
            }


            _c.get(0).api_init_player_from_gallery(_cach, args);

            _cach.data('gapless-inited', true);

            setTimeout(function () {
              _cach.get(0).api_handleResize();
            }, 1000)
          }
        }
      }


      // console.log('nm_maindim - ' ,nc_maindim);
    }


    function handleResize() {

      if (o.settings_mode != 'mode-showall' && _sliderClipper.hasClass('isotoped') == false) {
        setTimeout(function () {
          //console.log(_sliderClipper.children().eq(currNr), _sliderClipper.children().eq(currNr).height())
          _sliderClipper.css('height', _sliderClipper.children().eq(currNr).outerHeight());
        }, 500);
      }

      calculateDims();

    }

    function transition_end(newCurrNr) {
      _sliderClipper.children().eq(lastCurrNr).removeClass('transitioning-out');

      _sliderClipper.children().eq(newCurrNr).removeClass('transitioning-in');
      lastCurrNr = currNr;
      busy = false;
    }

    function transition_bg_end() {
      cgallery.parent().children('.the-bg').eq(0).remove();
      busy = false;
    }

    function goto_prev() {
      tempNr = currNr;
      tempNr--;

      var sw_goto_item = true;


      if (tempNr < 0) {
        tempNr = _sliderClipper.children().length - 1;

        if (o.loop_playlist == 'off') {
          sw_goto_item = false;
        }
      }

      if (sw_goto_item) {

        goto_item(tempNr);
      }
    }

    function goto_next() {
      // console.warn('ag','goto_next()', currNr,cgallery.get(0).currNr_2);
      tempNr = currNr;


      var sw_goto_item = true;

      if (o.settings_mode == 'mode-showall') {
        tempNr = cgallery.get(0).currNr_2;
      }
      tempNr++;
      if (tempNr >= _sliderClipper.children().length) {
        tempNr = 0;

        if (o.loop_playlist == 'off') {
          sw_goto_item = false;
        }
      }


      if (sw_goto_item) {

        goto_item(tempNr);
      }
    }

    function goto_item(newCurrNr, pargs) {


      var margs = {

        'ignore_arg_currNr_check': false
        , 'ignore_linking': false // -- does not change the link if set to true
        , donotopenlink: "off"
        , called_from: "default"
      }

      if (pargs) {
        margs = $.extend(margs, pargs);
      }

      // console.log('goto_item()', arg, busy);

      if (busy == true) {
        return;
      }

      if (newCurrNr == "last") {
        newCurrNr = _sliderClipper.children().length - 1;
      }

      // console.log('goto_item()', currNr, newCurrNr, '(currNr == newCurrNr)', currNr == newCurrNr, busy, newCurrNr=="last");


      if (!!(currNr == newCurrNr)) {

        if (_sliderClipper && _sliderClipper.children().eq(currNr).get(0) && _sliderClipper.children().eq(currNr).get(0).api_play_media) {
          _sliderClipper.children().eq(currNr).get(0).api_play_media({
            'call_from': 'gallery'
          });
        }
        return;
      }

      var _audioplayerToBeActive = _sliderClipper.children('.audioplayer,.audioplayer-tobe').eq(newCurrNr);

      // console.warn('_audioplayerToBeActive - ', _audioplayerToBeActive);
      // console.warn('currNr - ', currNr);
      var currNr_last_vol = '';

      if (currNr > -1) {
        if (typeof (_sliderClipper.children().eq(currNr).get(0)) != 'undefined') {
          if (typeof (_sliderClipper.children().eq(currNr).get(0).api_pause_media) != 'undefined') {
            _sliderClipper.children().eq(currNr).get(0).api_pause_media();
          }
          if (typeof (_sliderClipper.children().eq(currNr).get(0).api_get_last_vol) != 'undefined') {
            currNr_last_vol = _sliderClipper.children().eq(currNr).get(0).api_get_last_vol();
          }

        }


        _navClipper.children().removeClass('active active-from-gallery');


        if (o.mode_normal_video_mode == 'one') {

        } else {

          if (o.settings_mode != 'mode-showall') {



            //console.log(o.playlistTransition);
            _sliderClipper.children().eq(currNr).removeClass('active active-from-gallery');
            _navClipper.children().eq(currNr).removeClass('active active-from-gallery');


          }
        }

      }


      // --  setting settings
      if (o.settings_ap.design_skin == 'sameasgallery') {
        o.settings_ap.design_skin = o.design_skin;
      }

      // console.log('o.settings_ap HERE IT IS 2 - ',$.extend({}, o.settings_ap), currNr);


      // console.log('%c o.autoplay from gallery - ','background-color: #dadada;',o.autoplay);

      // -- if this is  the first audio
      if (currNr == -1 && o.autoplay == 'on') {
        o.settings_ap.autoplay = 'on';
      }
      // console.log('o.settings_ap HERE IT IS 24 - ',$.extend({}, o.settings_ap));

      // -- if this is not the first audio
      if (currNr > -1 && o.autoplayNext == 'on') {
        o.settings_ap.autoplay = 'on';
      }
      o.settings_ap.parentgallery = cgallery;

      o.settings_ap.design_menu_show_player_state_button = o.design_menu_show_player_state_button;
      o.settings_ap.cue = 'on';
      if (first == true) {
        if (o.cueFirstMedia == 'off') {
          o.settings_ap.cue = 'off';
        }

        first = false;
      }

      // -- setting settings END


      var args_player = $.extend({}, o.settings_ap);

      // console.log('o.settings_ap HERE IT IS 3 - ',$.extend({}, o.settings_ap));

      args_player.volume_from_gallery = currNr_last_vol;
      args_player.call_from = 'gotoItem';
      args_player.player_navigation = o.player_navigation;

      // console.log('lets init player here', arg);
      if (o.mode_normal_video_mode == 'one' && newCurrNr > -1 && margs.called_from != 'init') {
        // -- video mode -> one


        // console.error('lets init player here', arg);

        var _c = _sliderClipper.children().eq(0).get(0);
        _audioplayerToBeActive = _sliderClipper.children().eq(0);

        if (_c) {
          if (_c.api_play_media) {

            // console.log('_sliderClipper.children().eq(arg) -5 ',_sliderClipper.children().eq(arg));
            _c.api_change_media(_sliderClipper.children().eq(newCurrNr), {
              'called_from': 'goto_item -- mode_normal_video_mode()',
              'modeOneGalleryIndex': newCurrNr,
              'source_player_do_not_update': 'on',
              // ,'fakeplayer_is_feeder':'on'
            });

            if (o.autoplayNext == 'on') {
              setTimeout(function () {
                _c.api_play_media();
              }, 200);
            }
          }
        }
      } else {

        // -- init player from gallery
        init_player_from_gallery(_audioplayerToBeActive, args_player);

      }



      // -- actions after init
      if (o.autoplayNext == 'on') {
        if (o.settings_mode == 'mode-showall') {
          currNr = cgallery.get(0).currNr_2;
        }
        if (!!(currNr > -1 && _audioplayerToBeActive.get(0) && _audioplayerToBeActive.get(0).api_play)) {
          _audioplayerToBeActive.get(0).api_play();
        }
      }

      if(o.settings_ap.playfrom == undefined || o.settings_ap.playfrom=="0"){
        if(_audioplayerToBeActive.get(0) && _audioplayerToBeActive.get(0).api_seek_to_0){
          _audioplayerToBeActive.get(0).api_seek_to_0();
        }else{
          console.log('_audioplayerToBeActive not found - ',_audioplayerToBeActive);
        }
      }

      // console.log('o.settings_ap - ', o.settings_ap);
      // -- end actions after init

      dzsap_currplayer_focused = _audioplayerToBeActive.get(0);


      if (o.settings_mode != 'mode-showall') {
        _sliderClipper.children().eq(currNr).addClass('transitioning-out');
        _audioplayerToBeActive.removeClass('transitioning-out-complete');
        _audioplayerToBeActive.addClass('transitioning-in');
        setTimeout((_arg)=>{
          _arg.addClass('transitioning-out-complete')
        },Constants.PLAYLIST_TRANSITION_DURATION, _sliderClipper.children().eq(currNr));

        if (_audioplayerToBeActive.attr('data-type') != 'link') {
          if (margs.ignore_linking == false && o.settings_enable_linking == 'on') {
            var stateObj = {foo: "bar"};
            history.pushState(stateObj, null, dzsapHelpers.add_query_arg(window.location.href, 'audiogallery_startitem_' + cid, (newCurrNr)));
          }
        }

        if (o.playlistTransition == 'fade') {
          setTimeout(transition_end, Constants.PLAYLIST_TRANSITION_DURATION, newCurrNr);
          busy = true;
        }
        if (o.playlistTransition == 'direct') {
          transition_end(newCurrNr);
        }
      }

      _audioplayerToBeActive.addClass('active active-from-gallery');
      _navClipper.children().eq(newCurrNr).addClass('active active-from-gallery');

      // -- background parent

      // console.log('_audioplayerToBeActive - ',_audioplayerToBeActive);


      var bgimage = '';

      if (_audioplayerToBeActive.attr("data-bgimage")) {
        bgimage = _audioplayerToBeActive.attr("data-bgimage");
      }

      if (_audioplayerToBeActive.attr("data-wrapper-image")) {
        bgimage = _audioplayerToBeActive.attr("data-wrapper-image");
      }


      if (bgimage && cgallery.parent().hasClass('ap-wrapper') && cgallery.parent().children('.the-bg').length > 0) {

        // console.warn("ENTER HIER");
        cgallery.parent().children('.the-bg').eq(0).after('<div class="the-bg" style="background-image: url(' + bgimage + ');"></div>')
        cgallery.parent().children('.the-bg').eq(0).css({
          'opacity': 1
        })


        cgallery.parent().children('.the-bg').eq(1).css({
          'opacity': 0
        })
        cgallery.parent().children('.the-bg').eq(1).animate({
          'opacity': 1
        }, {
          queue: false,
          duration: 1000,
          complete: transition_bg_end,
          step: function () {
            busy = true;
          }
        })
        busy = true;
      }


      //console.log('set currNr', currNr, o.settings_mode);

      if (o.settings_mode != 'mode-showall') {

        currNr = newCurrNr;

        cgallery.data('currNr', currNr);
      }


      //console.log('_sliderClipper.children().eq(currNr) - ',_sliderClipper.children().eq(currNr));
      if (_sliderClipper.children().eq(currNr).get(0) && _sliderClipper.children().eq(currNr).get(0).api_handleResize && _sliderClipper.children().eq(currNr).hasClass('media-setuped')) {


        //console.log('_sliderClipper.children().eq(currNr) - ',_sliderClipper.children().eq(currNr));
        _sliderClipper.children().eq(currNr).get(0).api_handleResize();
      }

      calculateDims();
    }

    function init_player_from_gallery(_cache, pargs) {

      var player_args = $.extend({}, o.settings_ap);


      if (pargs) {
        player_args = $.extend(player_args, pargs);
      }

      // console.log('init_player_from_gallery',margs_player);
      // console.log('currNr_last_vol', currNr_last_vol);

      if (_cache.hasClass('audioplayer-tobe')) {
        o.settings_ap.call_from = 'init player from gallery';
        // console.log('player_args - ', player_args);
        _cache.audioplayer(player_args);
      }
    }
  }
}

exports.registerToJquery = function ($) {
  $.fn.audiogallery = function (argOptions) {
    var finalOptions = {};
    var defaultOptions = require('../configs/_settingsPlaylist').default_opts;
    finalOptions = dzsapHelpers.convertPluginOptionsToFinalOptions(this, defaultOptions, argOptions);



    this.each(function () {

      var _ag = new DzsApPlaylist(this, finalOptions, $);

      // console.log('this playlist -2 ', this);
      this.linkedClassInstance = _ag;
    });
  }

}
