const dzsHelpers = require('../js_common/_dzs_helpers');
const dzsapHelpers = require('./_dzsap_helpers');
exports.ajax_submit_views = function (argp) {

  // console.log('ajax_submit_views()',argp);

  // console.log('this - ', this);
  var selfClass = this;
  var $ = jQuery;
  var data = {
    action: 'dzsap_submit_views',
    postdata: 1,
    playerid: selfClass.the_player_id,
    currip: selfClass.currIp
  };


  if (selfClass.cthis.attr('data-playerid-for-views')) {
    data.playerid = selfClass.cthis.attr('data-playerid-for-views');
  }


  if (data.playerid == '') {
    data.playerid = dzs_clean_string(selfClass.data_source);
  }

  //                console.log(ajax_view_submitted);


  // -- submit view
  if (selfClass.urlToAjaxHandler) {
    $.ajax({
      type: "POST",
      url: selfClass.urlToAjaxHandler,
      data: data,
      success: function (response) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + response);
        }

        // -- increase number of hits
        var auxnr = selfClass.cthis.find('.counter-hits .the-number').html();
        auxnr = parseInt(auxnr, 10);
        if (selfClass.increment_views != 2) {
          auxnr++;
        }
        if (response) {
          if (dzsHelpers.decode_json(response)) {
            auxnr = dzsHelpers.decode_json(response)['number'];
          }
        }

        selfClass.cthis.find('.counter-hits .the-number').html(auxnr);

        selfClass.ajax_view_submitted = 'on';
      },
      error: function (arg) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + arg, arg);
        }
        ;


        var auxlikes = selfClass.cthis.find('.counter-hits .the-number').html();
        auxlikes = parseInt(auxlikes, 10);
        auxlikes++;
        selfClass.cthis.find('.counter-hits .the-number').html(auxlikes);

        selfClass.ajax_view_submitted = 'on';
      }
    });
    selfClass.ajax_view_submitted = 'on';
  }

}


exports.ajax_get_views = function (argp) {
  // -- only used for local ... wp gets this directly
  //only handles ajax call + result
  var mainarg = argp;
  var selfClass = this;
  var data = {
    action: 'dzsap_get_views',
    postdata: mainarg,
    playerid: selfClass.the_player_id
  };


  if (data.playerid == '') {
    data.playerid = dzsapHelpers.dzs_clean_string(data_source);
  }


  if (selfClass.urlToAjaxHandler) {

    jQuery.ajax({
      type: "POST",
      url: selfClass.urlToAjaxHandler,
      data: data,
      success: function (response) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + response);
        }

        // console.log(response);
        var responseViews = String('');


        var aux = dzsHelpers.decode_json(response);
        if (aux) {
          responseViews = aux.views;
          // console.log(' responseViews - ', responseViews, res);
        } else {
          responseViews = response;
        }

        if (!responseViews) {
          responseViews = '';
        }


        if (responseViews.indexOf('viewsubmitted') > -1) {
          responseViews = responseViews.replace('viewsubmitted', '');
          selfClass.ajax_view_submitted = 'on';
          selfClass.increment_views = 0;
        }

        if (responseViews == '') {
          responseViews = 0;
        }


        if (String(responseViews).indexOf('{{theip') > -1) {

          var auxa = /{\{theip-(.*?)}}/g.exec(responseViews);
          if (auxa[1]) {
            selfClass.currIp = auxa[1];
          }

          responseViews = responseViews.replace(/{\{theip-(.*?)}}/g, '');


        }


        // console.log('selfClass.increment_views', selfClass.increment_views);
        if (selfClass.increment_views == 1) {


          if (exports) {
            (exports.ajax_submit_views.bind(selfClass))();

          }
          //console.log('responseViews iz '+responseViews);
          responseViews = Number(responseViews) + selfClass.increment_views;
          ;
          //console.log(responseViews);
          selfClass.increment_views = 2;
        }

        var auxhtml = selfClass.cthis.find('.extra-html').eq(0).html();


        auxhtml = auxhtml.replace('{{get_plays}}', responseViews);


        selfClass.cthis.find('.extra-html').eq(0).html(auxhtml);
        selfClass.index_extrahtml_toloads--;


        if (selfClass.index_extrahtml_toloads == 0) {
          selfClass.cthis.find('.extra-html').addClass('active');
        }

      },
      error: function (arg) {

        selfClass.index_extrahtml_toloads--;
        if (selfClass.index_extrahtml_toloads == 0) {
          selfClass.cthis.find('.extra-html').addClass('active');
        }
      }
    });
  }
}


exports.ajax_submit_rating = function (argp) {
  //only handles ajax call + result
  var selfClass = this;
  var $ = jQuery;
  var mainarg = argp;
  var data = {
    action: 'dzsap_submit_rate',
    postdata: mainarg,
    playerid: selfClass.the_player_id
  };

  if (selfClass.starrating_alreadyrated > -1) {
    return;
  }
  selfClass.cthis.find('.star-rating-con').addClass('just-rated');


  if (selfClass.urlToAjaxHandler) {
    selfClass.initOptions.ajax({
      type: "POST",
      url: selfClass.urlToAjaxHandler,
      data: data,
      success: function (response) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + response);
        }
        ;


        var resp_arr = {};

        try {
          resp_arr = JSON.parse(response);
        } catch (e) {
          console.log(e);
        }

        var aux = selfClass.cthis.find('.star-rating-set-clip').outerWidth() / selfClass.cthis.find('.star-rating-bg').outerWidth();
        var nrrates = parseInt(selfClass.cthis.find('.counter-rates .the-number').html(), 10);

        nrrates++;

        var aux2 = ((nrrates - 1) * (aux * 5) + selfClass.starrating_index) / (nrrates)

        //                        console.log(aux, aux2, nrrates);

        setTimeout(function () {

          selfClass.cthis.find('.star-rating-con').removeClass('just-rated');
        }, 100);
        selfClass.cthis.find('.counter-rates .the-number').html(resp_arr.number);

        selfClass.cthis.find('.star-rating-con').attr('data-initial-rating-index', Number(resp_arr.index) / 5);
        selfClass.cthis.find('.star-rating-con .rating-prog').css('width', (Number(resp_arr.index) / 5 * 100) + '%');

        if (selfClass.initOptions.parentgallery && $(selfClass.initOptions.parentgallery).get(0) != undefined && $(selfClass.initOptions.parentgallery).get(0).api_player_rateSubmitted != undefined) {
          $(selfClass.initOptions.parentgallery).get(0).api_player_rateSubmitted();
        }

      },
      error: function (arg) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + arg, arg);
        }
        ;


        var aux = selfClass.selfClass.cthis.find('.star-rating-set-clip').outerWidth() / selfClass.cthis.find('.star-rating-bg').outerWidth();
        var nrrates = parseInt(selfClass.cthis.find('.counter-rates .the-number').html(), 10);

        nrrates++;

        var aux2 = ((nrrates - 1) * (aux * 5) + selfClass.starrating_index) / (nrrates)

        //                        console.log(aux, aux2, nrrates);
        selfClass.cthis.find('.star-rating-set-clip').width(aux2 * (parseInt(cthis.find('.star-rating-bg').width(), 10) / 5));
        selfClass.cthis.find('.counter-rates .the-number').html(nrrates);

        if (selfClass.initOptions.parentgallery && $(selfClass.initOptions.parentgallery).get(0) != undefined && $(selfClass.initOptions.parentgallery).get(0).api_player_rateSubmitted != undefined) {
          $(selfClass.initOptions.parentgallery).get(0).api_player_rateSubmitted();
        }

      }
    });
  }
}


exports.ajax_submit_like = function (argp, playerid, pargs) {

  // -- from gallery -- todo:replace with universal form!!

  //only handles ajax call + result


  var selfClass = this;
  var $ = jQuery;


  var mainarg = argp;
  var data = {
    action: 'dzsap_submit_like',
    postdata: mainarg,
    playerid: playerid
  };

  var margs = {
    refferer: null
  }

  if (pargs) {
    margs = $.extend(margs, pargs);
  }

  //console.log(margs,pargs,o.settings_php_handler);


  if (selfClass.urlToAjaxHandler) {

    $.ajax({
      type: "POST",
      url: selfClass.urlToAjaxHandler,
      data: data,
      success: function (response) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + response);
        }

        if (margs.refferer) {
          margs.refferer.addClass('active');
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


exports.ajax_submit_like = function (argp) {
  var selfClass = this;
  var $ = jQuery;

  //only handles ajax call + result
  var mainarg = argp;
  var data = {
    action: 'dzsap_submit_like',
    postdata: mainarg,
    playerid: selfClass.the_player_id
  };


  selfClass.cthis.find('.btn-like').addClass('disabled');

  if (selfClass.urlToAjaxHandler || selfClass.cthis.hasClass('is-preview')) {

    $.ajax({
      type: "POST",
      url: selfClass.urlToAjaxHandler,
      data: data,
      success: function (response) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + response);
        }

        selfClass.cthis.find('.btn-like').addClass('active');
        selfClass.cthis.find('.btn-like').removeClass('disabled');
        var auxlikes = selfClass.cthis.find('.counter-likes .the-number').html();
        auxlikes = parseInt(auxlikes, 10);
        auxlikes++;
        selfClass.cthis.find('.counter-likes .the-number').html(auxlikes);
      },
      error: function (arg) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + arg, arg);
        }
        ;


        selfClass.cthis.find('.btn-like').addClass('active');
        selfClass.cthis.find('.btn-like').removeClass('disabled');
        var auxlikes = selfClass.cthis.find('.counter-likes .the-number').html();
        auxlikes = parseInt(auxlikes, 10);
        auxlikes++;
        selfClass.cthis.find('.counter-likes .the-number').html(auxlikes);
      }
    });
  }
}

exports.ajax_retract_like = function (argp) {
  var selfClass = this;
  var $ = jQuery;

  //only handles ajax call + result
  var mainarg = argp;
  var data = {
    action: 'dzsap_retract_like',
    postdata: mainarg,
    playerid: selfClass.the_player_id
  };

  selfClass.cthis.find('.btn-like').addClass('disabled');


  if (selfClass.urlToAjaxHandler) {
    $.ajax({
      type: "POST",
      url: selfClass.urlToAjaxHandler,
      data: data,
      success: function (response) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + response);
        }

        selfClass.cthis.find('.btn-like').removeClass('active');
        selfClass.cthis.find('.btn-like').removeClass('disabled');
        var auxlikes = selfClass.cthis.find('.counter-likes .the-number').html();
        auxlikes = parseInt(auxlikes, 10);
        auxlikes--;
        selfClass.cthis.find('.counter-likes .the-number').html(auxlikes);
      },
      error: function (arg) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + arg, arg);
        }
        ;

        selfClass.cthis.find('.btn-like').removeClass('active');
        selfClass.cthis.find('.btn-like').removeClass('disabled');
        var auxlikes = selfClass.cthis.find('.counter-likes .the-number').html();
        auxlikes = parseInt(auxlikes, 10);
        auxlikes--;
        selfClass.cthis.find('.counter-likes .the-number').html(auxlikes);
      }
    });
  }
}


exports.ajax_comment_publish = function (argp) {
  // -- only handles ajax call + result
  var selfClass = this;
  var $ = jQuery;
  var o = selfClass.initOptions;

  console.log(' o - ', o, selfClass);

  var mainarg = argp;
  var data = {
    action: 'dzsap_front_submitcomment',
    postdata: mainarg,
    playerid: selfClass.the_player_id,
    comm_position: selfClass.commentPositionPerc,
    skinwave_comments_process_in_php: o.skinwave_comments_process_in_php,
    skinwave_comments_avatar: o.skinwave_comments_avatar,
    skinwave_comments_account: o.skinwave_comments_account
  };

  if (selfClass.cthis.find('*[name=comment-email]').length > 0) {

    data.email = selfClass.cthis.find('*[name=comment-email]').eq(0).val();
  }


  if (selfClass.urlToAjaxHandler) {
    jQuery.ajax({
      type: "POST",
      url: selfClass.urlToAjaxHandler,
      data: data,
      success: function (response) {
        if (response.charAt(response.length - 1) == '0') {
          response = response.slice(0, response.length - 1);
        }
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + response);
        }

        //console.log(data.postdata);


        var aux = '';
        if (selfClass.initOptions.skinwave_comments_process_in_php !== 'on') {

          // -- process the comment now, in javascript
          aux = (data.postdata);

        } else {

          // -- process php
          aux = '';
          aux += '<span class="dzstooltip-con" style="left:' + selfClass.commentPositionPerc + '"><span class="dzstooltip arrow-from-start transition-slidein arrow-bottom skin-black" style="width: 250px;"><span class="the-comment-author">@' + selfClass.initOptions.skinwave_comments_account + '</span> says:<br>';
          aux += dzsapHelpers.htmlEncode(data.postdata);


          aux += '</span><div class="the-avatar" style="background-image: url(' + selfClass.initOptions.skinwave_comments_avatar + ')"></div></span>';


        }

        // console.log(aux);
        // selfClass._commentsHolder.append(aux);

        selfClass._commentsHolder.children().each(function () {
          var _t2 = $(this);

          if (_t2.hasClass('dzstooltip-con') == false) {
            _t2.addClass('dzstooltip-con');
          }
        })

        selfClass._commentsHolder.append(aux);


        if (selfClass.action_audio_comment) {
          selfClass.action_audio_comment(selfClass.cthis, aux);
        }


        //jQuery('#save-ajax-loading').css('visibility', 'hidden');
      },
      error: function (arg) {
        if (typeof window.console != "undefined") {
          // console.log('Got this from the server: ' + arg, arg);
        }
        ;
        selfClass._commentsHolder.append(data.postdata);
      }
    });
  }
}



