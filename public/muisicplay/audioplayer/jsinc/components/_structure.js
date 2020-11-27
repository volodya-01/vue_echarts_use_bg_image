const dzsapSvgs = require('../_dzsap_svgs');

const dzsapHelpers = require('../_dzsap_helpers');

/**
 * setup player structure
 * @param selfClass
 * @param pargs
 * @returns {boolean}
 */
exports.setup_structure = function (selfClass, pargs) {

// -- setup structure here
  var $ = jQuery;
  var o = selfClass.initOptions;


  var margs = {
    'setup_inner_player': true
    , 'setup_media': true
    , 'setup_otherstructure': true
    , 'call_from': "default"


  }


  if (pargs) {
    margs = $.extend(margs, pargs);
  }

// console.log('%c .setup_structure', 'color: #da23da', margs);


  if (margs.call_from === 'reconstruct') {
    if (selfClass._metaArtistCon) {

      //selfClass._metaArtistCon.remove();
    }


    selfClass._metaArtistCon = null;
    if (selfClass.cthis.hasClass('skin-wave')) {
      o.design_skin = 'skin-wave';
    }
    if (selfClass.cthis.hasClass('skin-silver')) {
      o.design_skin = 'skin-silver';
    }
  }


  var structure_str_apControls = '<div class="ap-controls';
  // console.log('o.design_skin -' , o.design_skin);
  if (o.design_skin === 'skin-default') {
    structure_str_apControls += ' dzsap-color_inverse_ui_fill';
  }
  structure_str_apControls += '"></div>'

  if (margs.setup_inner_player) {
    selfClass.cthis.append('<div class="audioplayer-inner"></div>');
    selfClass._audioplayerInner = selfClass.cthis.children('.audioplayer-inner');
  }

  if (margs.setup_media) {
    selfClass._audioplayerInner.append('<div class="the-media"></div>');
    selfClass.$theMedia = selfClass._audioplayerInner.children('.the-media').eq(0);
  }

  // -- end setup inner


  if (!margs.setup_otherstructure) {
    return false;
  }

  if (o.design_skin !== 'skin-customcontrols') {
    selfClass._audioplayerInner.append(structure_str_apControls);
  }
  selfClass._apControls = selfClass._audioplayerInner.children('.ap-controls').eq(0);


  if (selfClass.cthis.attr('data-wrapper-image')) {
    var img = new Image();


    if (selfClass.cthis.hasClass('zoomsounds-no-wrapper') === false) {

      img.onload = function () {
        // console.log('image loaded', this, this.src);


        selfClass.cthis.css('background-image', 'url(' + this.src + ')');
        // selfClass._audioplayerInner.prepend('<div class="zoomsounds-bg" style="background-image: url('+this.src+'); "></div>');
        setTimeout(function () {

          selfClass.cthis.find('.zoomsounds-bg').addClass('loaded');


          if (selfClass.cthis.hasClass('zoomsounds-wrapper-bg-bellow')) {

            selfClass.cthis.css('padding-top', 200);
          }
        }, 100);
      }

      img.src = selfClass.cthis.attr('data-wrapper-image');
    }

  }


  var structure_str_scrubbar = '<div class="scrubbar">';
  var aux_str_con_controls = '';
  var aux_str_con_controls_part2 = '';
  var aux_str_volume = '';
  var aux_str_time = '';


  structure_str_scrubbar += '<div class="scrub-bg"></div><div class="scrub-buffer"></div>';

  structure_str_scrubbar += '<div class="scrub-prog';

  if (o.scrubbar_type !== 'wave') {
    structure_str_scrubbar += ' dzsap-color_brand_bg';
  }

  structure_str_scrubbar += '"></div><div class="scrubBox"></div><div class="scrubBox-prog"></div><div class="scrubBox-hover"></div>';
  aux_str_time = '<div class="total-time">00:00</div><div class="curr-time">00:00</div>';


  if (selfClass.sample_perc_start) {

    structure_str_scrubbar += '<div class="sample-block-start" style="width: ' + (selfClass.sample_perc_start * 100) + '%"></div>'
  }
  if (selfClass.sample_perc_end) {

    structure_str_scrubbar += '<div class="sample-block-end" style="left: ' + (selfClass.sample_perc_end * 100) + '%; width: ' + (100 - (selfClass.sample_perc_end * 100)) + '%"></div>'
  }

  structure_str_scrubbar += '</div>'; // -- end scrubbar


  if (o.controls_external_scrubbar) {
    structure_str_scrubbar = '';
  }


  var struct_con_playpause = '';


  if (o.settings_extrahtml_before_play_pause) {
    struct_con_playpause += o.settings_extrahtml_before_play_pause;


  }
// console.log(selfClass.cthis.find('.feed-dzsap-before-playpause'));

  struct_con_playpause += '<div class="con-playpause-con">';

  if (selfClass.cthis.find('.feed-dzsap-before-playpause').length) {
    struct_con_playpause += selfClass.cthis.find('.feed-dzsap-before-playpause').eq(0).html();
    selfClass.cthis.find('.feed-dzsap-before-playpause').remove();

  }

  struct_con_playpause += '<div class="con-playpause';

  if (selfClass.keyboard_controls.show_tooltips === 'on') {
    struct_con_playpause += ' dzstooltip-con';
  }

  struct_con_playpause += '">';
  if (selfClass.keyboard_controls.show_tooltips === 'on') {
    struct_con_playpause += dzsapHelpers.dzsap_generate_keyboard_tooltip(selfClass.keyboard_controls, 'pause_play');
  }


  struct_con_playpause += '<div class="playbtn player-but"><div class="the-icon-bg"></div><div class="dzsap-play-icon">';
  var has_svg_icons = false;
  if (selfClass.cthis.hasClass('skin-wave') || selfClass.cthis.hasClass('skin-pro') || selfClass.cthis.hasClass('skin-silver') || selfClass.cthis.hasClass('skin-redlights') || selfClass.cthis.hasClass('skin-default')) {
    has_svg_icons = true;
  }
// console.log("HMM dada", selfClass.cthis);

//console.log('selfClass.cthis.hasClass(\'skin-pro\') - ',selfClass.cthis.hasClass('skin-pro'));
  if (has_svg_icons) {
    // console.log("HMM dada2", selfClass.cthis);


    struct_con_playpause += dzsapSvgs.svg_play_icon;
  }

  struct_con_playpause += '</div>';
  struct_con_playpause += '</div>'; // -- end playbtn


  struct_con_playpause += '<div class="pausebtn player-but"';


  struct_con_playpause += '><div class="the-icon-bg"></div><div class="pause-icon">';


  if (has_svg_icons) {
    // console.log("HMM dada2", selfClass.cthis);


    struct_con_playpause += dzsapSvgs.svg_pause;
  }


  struct_con_playpause += '</div>';// -- end pause-icon
  struct_con_playpause += '</div>'; // -- end pausebtn


  struct_con_playpause += '';

  if (o.design_skin === 'skin-wave') {
    struct_con_playpause += o.skinwave_preloader_code;
  }


  struct_con_playpause += '</div>';
  if (selfClass.cthis.find('.feed-dzsap-after-playpause').length) {
    struct_con_playpause += selfClass.cthis.find('.feed-dzsap-after-playpause').eq(0).html();

    selfClass.cthis.find('.feed-dzsap-after-playpause').remove();
  }


  struct_con_playpause += '</div>';


// struct_con_playpause = '';
// console.log(' - struct_con_playpause - ',struct_con_playpause);


  aux_str_con_controls += '<div class="con-controls"><div class="the-bg"></div>' + struct_con_playpause;


  if (o.settings_extrahtml_in_float_left) {
    aux_str_con_controls += o.settings_extrahtml_in_float_left;
  }


//console.log(o.disable_timer, aux_str_con_controls);


  if (o.design_skin === 'skin-pro') {
    aux_str_con_controls += '<div class="con-controls--right">';

    aux_str_con_controls += '</div>';
  }


  var aux_str_con_volume = '<div class="controls-volume"><div class="volumeicon"></div><div class="volume_static"></div><div class="volume_active"></div><div class="volume_cut"></div></div>';
  if (o.disable_volume === 'on') {
    aux_str_con_volume = '';
  }


  if (o.design_skin === 'skin-default' || o.design_skin === 'skin-wave') {

    aux_str_con_controls += '<div class="ap-controls-right">';
    if (o.disable_volume !== 'on') {
      aux_str_con_controls += '<div class="controls-volume"><div class="volumeicon"></div><div class="volume_static"></div><div class="volume_active"></div><div class="volume_cut"></div></div>';
    }


    // console.log('aux_str_con_controls -> ',aux_str_con_controls);

    aux_str_con_controls += '</div>';
    // aux_str_con_controls += '<div class="clear"></div>';


  }

  aux_str_con_controls += '</div>'; // -- end con-controls


/// -- end STR

//console.log(o.disable_timer, aux_str_con_controls);


  if (o.design_skin === 'skin-wave' && selfClass.skinwave_mode === 'small') {
    aux_str_con_controls = '<div class="the-bg"></div><div class="ap-controls-left">' + struct_con_playpause + '</div>' + structure_str_scrubbar + '<div class="ap-controls-right">' + aux_str_con_volume + '<div class="extrahtml-in-float-right for-skin-wave-small">' + selfClass.settings_extrahtml_in_float_right + '</div></div>';


  } else {


    // -- other skins

    if (o.design_skin === 'skin-aria' || o.design_skin === 'skin-silver' || o.design_skin === 'skin-redlights' || o.design_skin === 'skin-steel') {



      //o.design_skin === 'skin-redlights' ||
      if (o.design_skin === 'skin-steel') {
        dzsapSvgs.playbtn_svg = '';
        dzsapSvgs.pausebtn_svg = '';
      }

      aux_str_con_controls = '<div class="the-bg"></div><div class="ap-controls-left">';


      if (o.design_skin === 'skin-silver') {

        aux_str_con_controls += struct_con_playpause;
      } else {

        // -- TODO: maybe convert all to struct_con_playpause


        aux_str_con_controls += '<div class="con-playpause';

        if (selfClass.keyboard_controls.show_tooltips === 'on') {
          aux_str_con_controls += ' dzstooltip-con';
        }

        aux_str_con_controls += '">';


        if (selfClass.keyboard_controls.show_tooltips === 'on') {
          aux_str_con_controls += dzsapHelpers.dzsap_generate_keyboard_tooltip(selfClass.keyboard_controls, 'pause_play');
        }


        aux_str_con_controls += '<div class="playbtn player-but playbtn-not-skin-silver"><div class="dzsap-play-icon">' + dzsapSvgs.playbtn_svg + '</div><div class="play-icon-hover"></div></div><div class="pausebtn" ';


        // console.log('o.design_animateplaypause - ',o.design_animateplaypause);
        if (o.design_animateplaypause !== 'on') {
          // aux_str_con_controls+=' style="display:none"';
        } else {
          selfClass.cthis.addClass('playing-animation');
        }

        aux_str_con_controls += '><div class="pause-icon">' + dzsapSvgs.pausebtn_svg + '</div><div class="pause-icon-hover"></div></div></div>'; // -- enc con-playpause

      }


      // console.log('selfClass.cthis.find(\'.feed-dzsap-after-playpause\') - ',selfClass.cthis.find('.feed-dzsap-after-playpause'));
      if (selfClass.cthis.find('.feed-dzsap-after-playpause').length) {
        aux_str_con_controls += selfClass.cthis.find('.feed-dzsap-after-playpause').eq(0).html();


        selfClass.cthis.find('.feed-dzsap-after-playpause').remove();
      }


      aux_str_con_controls += '</div>';


      if (selfClass.settings_extrahtml_in_float_right) {
        aux_str_con_controls += '<div class="controls-right">' + selfClass.settings_extrahtml_in_float_right + '</div>';

        //console.log(o._gall)
        //console.log('dada');

        if (o.design_skin === 'skin-redlights') {

          //console.log(o.parentgallery, o.parentgallery.get(0).api_skin_redlights_give_controls_right_to_all);
          if (o.parentgallery && o.parentgallery.get(0).api_skin_redlights_give_controls_right_to_all) {
            o.parentgallery.get(0).api_skin_redlights_give_controls_right_to_all();
          }
        }
      }

      //console.log('ceva');


      aux_str_con_controls += '<div class="ap-controls-right">';

      if (o.design_skin === 'skin-silver') {

        aux_str_con_controls += '<div class="controls-volume controls-volume-vertical"><div class="volumeicon"></div><div class="volume-holder"><div class="volume_static"></div><div class="volume_active"></div><div class="volume_cut"></div></div></div>';


        aux_str_con_controls += '</div>' + structure_str_scrubbar;
      } else {


        if (o.design_skin === 'skin-redlights') {

          if (o.disable_volume != 'on') {
            aux_str_con_controls += '<div class="controls-volume"><div class="volumeicon"></div><div class="volume_static">' + dzsapSvgs.svg_volume_static + '</div><div class="volume_active">' + dzsapSvgs.svg_volume + '</div><div class="volume_cut"></div></div>';
          }
        }

        aux_str_con_controls += structure_str_scrubbar;


        if (o.disable_timer != 'on') {
          aux_str_con_controls += '<div class="total-time">00:00</div>';
        }
      }


      if (o.design_skin === 'skin-silver') {

      } else {
        aux_str_con_controls += '</div>';
      }


    }


  }


  var settings_extrahtml_in_float_right_str = '';
// console.log('settings_extrahtml_in_float_right - ',settings_extrahtml_in_float_right);
  if (selfClass.settings_extrahtml_in_float_right) {
    // aux_str_con_controls += ;

    if (String(selfClass.settings_extrahtml_in_float_right).indexOf('dzsap-multisharer-but') > -1) {
      selfClass.isMultiSharer = true;
    }


    // console.log('%c selfClass.settings_extrahtml_in_float_right -3 [', 'color:#da21dd', selfClass.settings_extrahtml_in_float_right);
    if (o.design_skin === 'skin-wave' && selfClass.skinwave_mode === 'small') {

    } else {

      settings_extrahtml_in_float_right_str += '<div class="extrahtml-in-float-right from-setup_structure from-js-setup_structure">' + selfClass.settings_extrahtml_in_float_right + '</div>';
    }


  }


// -- end strings
// --------------


  selfClass._apControls.append(aux_str_con_controls);


  if (selfClass.cthis.hasClass('skin-wave-mode-alternate')) {
    if (selfClass.cthis.find('.scrubbar').length === 0) {
      selfClass._apControls.append(structure_str_scrubbar);
    }
  } else {
    if (selfClass.cthis.find('.scrubbar').length === 0) {
      selfClass._apControls.prepend(structure_str_scrubbar);
    }
  }


  selfClass._apControlsRight = null;

  if (selfClass._apControls.find('.ap-controls-right').length > 0) {
    selfClass._apControlsRight = selfClass.cthis.find('.ap-controls-right');
  }
  if (selfClass._apControls.find('.ap-controls-left').length > 0) {
    selfClass._apControlsLeft = selfClass._apControls.find('.ap-controls-left').eq(0);
  }


  if (o.design_skin === 'skin-pro') {
    selfClass._apControlsRight = selfClass.cthis.find('.con-controls--right').eq(0)
  }


// console.log('settings_extrahtml_in_float_right - ',settings_extrahtml_in_float_right);
  if (selfClass.settings_extrahtml_in_float_right) {
    // aux_str_con_controls += ;

    if (settings_extrahtml_in_float_right_str) {

      if (o.design_skin === 'skin-wave' || o.design_skin === 'skin-default') {

        selfClass.cthis.find('.ap-controls-right').eq(0).append(settings_extrahtml_in_float_right_str);
        // console.log('selfClass.cthis.find(\'.ap-controls-right\') - ', selfClass.cthis.find('.ap-controls-right'));
      }
      if (o.design_skin === 'skin-pro') {

        selfClass.cthis.find('.con-controls--right').eq(0).append(settings_extrahtml_in_float_right_str);
        // console.log('selfClass.cthis.find(\'.ap-controls-right\') - ', selfClass.cthis.find('.ap-controls-right'));
      }
    }
  }


// -- Todo: if we have footer, playlist btn we can place it in ap-controls-right

  if (selfClass.cthis.find('.feed-dzsap-after-con-controls').length) {
    selfClass._apControls.append(selfClass.cthis.find('.feed-dzsap-after-con-controls').eq(0).html());


    selfClass.cthis.find('.feed-dzsap-after-con-controls').remove();
  }


  if (o.controls_external_scrubbar) {
    selfClass._scrubbar = $(o.controls_external_scrubbar).children('.scrubbar').eq(0);
  } else {
    selfClass._scrubbar = selfClass._apControls.find('.scrubbar').eq(0);
  }
// console.info('_scrubbar - ' ,_scrubbar, o);


  selfClass.$$scrubbProg = selfClass._scrubbar.find('.scrub-prog').get(0);


  selfClass.$conControls = selfClass._apControls.children('.con-controls');
  selfClass.$conPlayPause = selfClass.cthis.find('.con-playpause').eq(0);
  selfClass._conPlayPauseCon = selfClass.cthis.find('.con-playpause-con').eq(0);
  selfClass.$controlsVolume = selfClass.cthis.find('.controls-volume').eq(0);


  (dzsapHelpers.player_constructArtistAndSongCon.bind(selfClass))(margs);


  if (o.design_skin === 'skin-wave' && o.disable_timer != 'on') {
    // -- no sense in adding time if external
    if (o.controls_external_scrubbar === '') {
      selfClass._scrubbar.append(aux_str_time);
    }
  }


  if (o.design_skin != 'skin-wave' && o.disable_timer != 'on') {
    // aux_str_con_controls += '<div class="curr-time">00:00</div><div class="total-time">00:00</div>';

    // -- all skins
    selfClass._apControls.append(aux_str_time);
  }


// -- end structure


// -- start assocations
  if (o.disable_timer != 'on') {
    selfClass.$currTime = selfClass.cthis.find('.curr-time').eq(0);
    selfClass.$totalTime = selfClass.cthis.find('.total-time').eq(0);

    if (o.design_skin === 'skin-steel') {
      if (selfClass.$currTime.length === 0) {
        selfClass.$totalTime.before('<div class="curr-time">00:00</div> <span class="separator-slash">/</span> ');
        //console.log('WHAT WHAT IN THE BUTT', _totalTime, _totalTime.prev(),  selfClass.cthis.find('.curr-time'));

        selfClass.$currTime = selfClass.$totalTime.prev().prev();

      }
    }

    //console.log(_currTime, _totalTime);
  }


  if (Number(o.sample_time_total) > 0) {

    selfClass.timeTotal = Number(o.sample_time_total);

    console.log(selfClass.$currTime, selfClass.timeTotal);
    if (selfClass.$totalTime) {

      // console.error("ENTER HERE");
      selfClass.$totalTime.html(dzsapHelpers.formatTime(selfClass.time_total_for_visual));
    }

    //console.log(_totalTime.html());

    //return false;
  }


  selfClass.struct_generate_thumb();


  if (o.design_skin === 'skin-wave' && o.parentgallery && typeof (o.parentgallery) != 'undefined' && o.design_menu_show_player_state_button === 'on') {
    if (o.design_skin === 'skin-wave') {
      if (selfClass._apControlsRight) {

        selfClass._apControlsRight.appendOnce('<div class="btn-menu-state player-but"> <div class="the-icon-bg"></div> ' + dzsapSvgs.svg_menu_state + '    </div></div>');
      } else {
        console.log('selfClass._apControlsRight not found ? ');
      }
    } else {
      selfClass._audioplayerInner.appendOnce('<div class="btn-menu-state"></div>');
    }
  }
// console.log(_controlsVolume,_theThumbCon , o.skinwave_place_thumb_after_volume);
  if (o.skinwave_place_metaartist_after_volume === 'on') {

    _controlsVolume.before(selfClass._metaArtistCon);
  }


  if (o.settings_extrahtml_after_artist) {
    selfClass._metaArtistCon.find('.the-artist').append(o.settings_extrahtml_after_artist);
  }

  if (o.skinwave_place_thumb_after_volume === 'on') {

    selfClass.$controlsVolume.before(selfClass.cthis.find('.the-thumb-con'));
  }
//                console.log(o.embed_code);


  if (o.design_skin === 'skin-wave') {


    // -- structure setup

    selfClass.setup_structure_scrub();


    if (o.skinwave_timer_static === 'on') {
      if (selfClass.$currTime) {
        selfClass.$currTime.addClass('static');
      }
      if (selfClass.$totalTime) {
        selfClass.$totalTime.addClass('static');
      }
    }


    selfClass._apControls.css({
      //'height': design_thumbh
    })


    //console.log('setup_lsiteners()');

    // console.log("PREPARE SCRUBBAR LOADED");
    if (o.skinwave_wave_mode === 'canvas') {

      setTimeout(function () {
        selfClass.cthis.addClass('scrubbar-loaded');
        selfClass._scrubbar.parent().addClass('scrubbar-loaded');


        // console.log(" SCRUBBAR  is LOADED",selfClass._scrubbar);
      }, 700); // -- tbc

    }

  }
// --- END skin-wave


  selfClass.check_multisharer();

  if (selfClass.cthis.hasClass('skin-minimal')) {
    // -- here is skin-minimal

    selfClass.cthis.find('.the-bg').before('<div class="skin-minimal-bg skin-minimal--outer-bg"></div><div class="skin-minimal-bg skin-minimal--inner-bg-under"></div><div class="skin-minimal-bg skin-minimal--inner-bg"></div><div class="skin-minimal-bg skin-minimal--inner-inner-bg"></div>')
    selfClass.cthis.find('.the-bg').append('<canvas width="100" height="100" class="playbtn-canvas"/>')
    selfClass.skin_minimal_canvasplay = selfClass.cthis.find('.playbtn-canvas').eq(0).get(0);

    if(selfClass.$conPlayPause){

      selfClass.$conPlayPause.children('.playbtn').append(dzsapSvgs.playbtn_svg);
      selfClass.$conPlayPause.children('.pausebtn').append(dzsapSvgs.pausebtn_svg);
    }

    setTimeout(function () {
      selfClass.isCanvasFirstDrawn = false;
    }, 200);
  }


  if (selfClass.cthis.hasClass('skin-minion')) {
    if (selfClass.cthis.find('.menu-description').length > 0) {
      //console.log('ceva');
      selfClass.$conPlayPause.addClass('with-tooltip');
      selfClass.$conPlayPause.prepend('<span class="dzstooltip" style="left:-7px;">' + selfClass.cthis.find('.menu-description').html() + '</span>');
      selfClass.$conPlayPause.children('span').eq(0).css('width', selfClass.$conPlayPause.children('span').eq(0).textWidth() + 10);
    }
  }


//console.log('o.player_navigation - ',o.player_navigation,o.parentgallery);


  if (o.player_navigation === 'default') {

    if (o.parentgallery) {

      o.player_navigation = 'on';
    }


    if (o.parentgallery && o.parentgallery.hasClass('mode-showall')) {
      o.player_navigation = 'off';
    }
  }

  if (o.disable_player_navigation === 'on') {

    o.player_navigation = 'off';
  }

  if (o.player_navigation === 'default') {

    o.player_navigation = 'off';
  }


// console.log('o.player_navigation - ',o.player_navigation);


  if (o.player_navigation === 'on') {

    var prev_btn_str = '<div class="prev-btn player-but"><div class="the-icon-bg"></div>' + dzsapSvgs.svg_prev_btn + ' </div>';

    var next_btn_str = '<div class="next-btn player-but"><div class="the-icon-bg"></div>' + dzsapSvgs.svg_next_btn + '  </div>';

    if (o.design_skin === 'skin-steel') {

      prev_btn_str = '<div class="prev-btn player-but">' + dzsapSvgs.svg_prev_btn_steel + '</div>';


      next_btn_str = '<div class="next-btn player-but">' + dzsapSvgs.svg_next_btn_steel + '</div>';

    }


    var auxs = prev_btn_str + next_btn_str;


    //console.log(o.parentgallery);


    // console.log(o.design_skin, selfClass.skinwave_mode);

    // -- create player navigation here
    if ((o.design_skin === 'skin-wave' && selfClass.skinwave_mode === 'small') || o.design_skin === 'skin-aria') {


      selfClass.$conPlayPause.before(prev_btn_str)
      selfClass.$conPlayPause.after(next_btn_str)


    } else {
      if (o.design_skin === 'skin-wave') {

        // _conPlayPause.after(auxs);

        // console.log('o.player_navigation - ',o.player_navigation);


        if (o.player_navigation === 'on') {

          selfClass._conPlayPauseCon.prependOnce(prev_btn_str, '.prev-btn');
          selfClass._conPlayPauseCon.appendOnce(next_btn_str, '.next-btn');
        }

      } else if (o.design_skin === 'skin-steel') {

        selfClass._apControlsLeft.prependOnce(prev_btn_str, '.prev-btn');

        if (selfClass._apControlsLeft.children('.the-thumb-con').length > 0) {
          //console.log(_theThumbCon.prev());

          if (selfClass._apControlsLeft.children('.the-thumb-con').eq(0).length > 0) {
            if (selfClass._apControlsLeft.children('.the-thumb-con').eq(0).prev().hasClass('next-btn') === false) {
              selfClass._apControlsLeft.children('.the-thumb-con').eq(0).before(next_btn_str);
            }
          }

        } else {

          selfClass._apControlsLeft.appendOnce(next_btn_str, '.next-btn');
        }
      } else {

        selfClass._audioplayerInner.appendOnce(auxs, '.prev-btn');
      }
    }


    // console.log("SETUPED PLAYER NAVIGATION yes ;) ");

  }


//console.log(o.settings_extrahtml);


  if (selfClass.cthis.find('.extra-html-extra').length) {
    if (o.settings_extrahtml === '') {

      o.settings_extrahtml = ' ';
    }
    var _c_html = selfClass.cthis.find('.extra-html-extra').eq(0).html();

    if (_c_html.length) {
      o.settings_extrahtml = _c_html;
      selfClass.cthis.find('.extra-html-extra').eq(0).html('');
    }
  }


  if (selfClass.cthis.hasClass('skinvariation-wave-bigtitles')) {

    if (selfClass.cthis.find('.controls-volume').length && selfClass._metaArtistCon.find('.controls-volume').length === 0) {
      selfClass._metaArtistCon.append('<br>');
      selfClass._metaArtistCon.append(selfClass.cthis.find('.controls-volume'));
    }

    // selfClass.cthis.find('.scrubbar').after('<img class="skip-15-sec" width="50" src="http://i.imgur.com/oObhtLE.jpg"/>');
  }

  if (selfClass.cthis.hasClass('skinvariation-wave-righter')) {

    selfClass._apControls.appendOnce('<div class="playbuttons-con"></div>');
    var _c = selfClass.cthis.find('.playbuttons-con').eq(0);
    _c.append(selfClass.cthis.find('.con-playpause-con'));

    // selfClass.cthis.find('.scrubbar').after('<img class="skip-15-sec" width="50" src="http://i.imgur.com/oObhtLE.jpg"/>');
  }



// -- do custom tweaks

  if (o.design_skin === 'skin-pro') {

    selfClass._apControlsRight.append(selfClass.$currTime);
    selfClass._apControlsRight.append(selfClass.$totalTime);
  }


  if (o.design_skin === 'skin-silver') {
    selfClass._scrubbar.after(selfClass._apControlsRight);
    selfClass._apControlsLeft.prepend(selfClass._metaArtistCon);
    selfClass._apControlsLeft.append(selfClass.$currTime);
    selfClass._apControlsRight.append(selfClass.$totalTime);
    // aux_str_con_controls += '<div class="curr-time">00:00</div>';


    // if (o.disable_timer != 'on') {
    //   aux_str_con_controls += '<div class="total-time">00:00</div>';
    // }
  }


  if (o.design_skin === 'skin-redlights') {
    selfClass._apControlsRight.append('<div class="ap-controls-right--top"></div>');
    selfClass._apControlsRight.append('<div class="ap-controls-right--bottom"></div>');
    selfClass._apControlsRight.find('.ap-controls-right--top').append(selfClass._apControlsRight.find('.meta-artist-con'));
    selfClass._apControlsRight.find('.ap-controls-right--top').append(selfClass._apControlsRight.find('.controls-volume'));
    selfClass._apControlsRight.find('.ap-controls-right--bottom').append(selfClass._apControlsRight.find('.scrubbar'));
  }


  if (margs.call_from === 'reconstruct') {
    if (selfClass.cthis.hasClass('skin-silver')) {
      selfClass._apControlsLeft.append(selfClass.cthis.find('.con-playpause'));
    }
  }


  if (selfClass.isMultiSharer) {
    selfClass.check_multisharer();
  }
// -- replaces / sanitizes here
  selfClass.setup_structure_sanitizers();
  selfClass.setup_structure_extras();


  selfClass.cthis.addClass('structure-setuped');


}
