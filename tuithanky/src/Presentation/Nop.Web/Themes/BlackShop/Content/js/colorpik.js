// colorpik


/*!
 * colpick Color Picker
 * https://github.com/mrgrain/colpick
 *
 * Copyright 2013, 2015 Moritz Kornher, Jose Vargas, Stefan Petre
 * Released under the MIT license and GPLv2 license
 * https://github.com/mrgrain/colpick/blob/master/LICENSE
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  var colpick = function () {
    var
      tpl = '<div class="colpick"><div class="colpick_color"><div class="colpick_color_overlay1"><div class="colpick_color_overlay2"><div class="colpick_selector_outer"><div class="colpick_selector_inner"></div></div></div></div></div><div class="colpick_hue"><div class="colpick_hue_arrs"><div class="colpick_hue_larr"></div><div class="colpick_hue_rarr"></div></div></div><div class="colpick_new_color"></div><div class="colpick_current_color"></div><div class="colpick_hex_field"><div class="colpick_field_letter">#</div><input type="text" maxlength="6" size="6" /></div><div class="colpick_rgb_r colpick_field"><div class="colpick_field_letter">R</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_rgb_g colpick_field"><div class="colpick_field_letter">G</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_rgb_b colpick_field"><div class="colpick_field_letter">B</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_hsb_h colpick_field"><div class="colpick_field_letter">H</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_hsb_s colpick_field"><div class="colpick_field_letter">S</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_hsb_b colpick_field"><div class="colpick_field_letter">B</div><input type="text" maxlength="3" size="3" /><div class="colpick_field_arrs"><div class="colpick_field_uarr"></div><div class="colpick_field_darr"></div></div></div><div class="colpick_submit"></div></div>',
      defaults = {
        showEvent: 'click',
        onShow: function () {
        },
        onBeforeShow: function () {
        },
        onHide: function () {
        },
        onChange: function () {
        },
        onSubmit: function () {
        },
        colorScheme: 'light',
        color: 'auto',
        livePreview: true,
        flat: false,
        layout: 'full',
        submit: 0,
        submitText: 'OK',
        height: 156,
        polyfill: false,
        styles: false
      },
      //Fill the inputs of the plugin
      fillRGBFields = function (hsb, cal) {
        var rgb = hsbToRgb(hsb);
        $(cal).data('colpick').fields
          .eq(1).val(rgb.r).end()
          .eq(2).val(rgb.g).end()
          .eq(3).val(rgb.b).end();
      },
      fillHSBFields = function (hsb, cal) {
        $(cal).data('colpick').fields
          .eq(4).val(Math.round(hsb.h)).end()
          .eq(5).val(Math.round(hsb.s)).end()
          .eq(6).val(Math.round(hsb.b)).end();
      },
      fillHexFields = function (hsb, cal) {
        $(cal).data('colpick').fields.eq(0).val(hsbToHex(hsb));
      },
      //Set the round selector position
      setSelector = function (hsb, cal) {
        $(cal).data('colpick').selector.css('backgroundColor', '#' + hsbToHex({ h: hsb.h, s: 100, b: 100 }));
        $(cal).data('colpick').selectorIndic.css({
          left: parseInt($(cal).data('colpick').height * hsb.s / 100, 10),
          top: parseInt($(cal).data('colpick').height * (100 - hsb.b) / 100, 10)
        });
      },
      //Set the hue selector position
      setHue = function (hsb, cal) {
        $(cal).data('colpick').hue.css('top', parseInt($(cal).data('colpick').height - $(cal).data('colpick').height * hsb.h / 360, 10));
      },
      //Set current and new colors
      setCurrentColor = function (hsb, cal) {
        $(cal).data('colpick').currentColor.css('backgroundColor', '#' + hsbToHex(hsb));
      },
      setNewColor = function (hsb, cal) {
        $(cal).data('colpick').newColor.css('backgroundColor', '#' + hsbToHex(hsb));
      },
      //Called when the new color is changed
      change = function () {
        var cal = $(this).parent().parent(), col;
        if (this.parentNode.className.indexOf('_hex') > 0) {
          cal.data('colpick').color = col = hexToHsb(fixHex(this.value));
          fillRGBFields(col, cal.get(0));
          fillHSBFields(col, cal.get(0));
        } else if (this.parentNode.className.indexOf('_hsb') > 0) {
          cal.data('colpick').color = col = fixHSB({
            h: parseInt(cal.data('colpick').fields.eq(4).val(), 10),
            s: parseInt(cal.data('colpick').fields.eq(5).val(), 10),
            b: parseInt(cal.data('colpick').fields.eq(6).val(), 10)
          });
          fillRGBFields(col, cal.get(0));
          fillHexFields(col, cal.get(0));
        } else {
          cal.data('colpick').color = col = rgbToHsb(fixRGB({
            r: parseInt(cal.data('colpick').fields.eq(1).val(), 10),
            g: parseInt(cal.data('colpick').fields.eq(2).val(), 10),
            b: parseInt(cal.data('colpick').fields.eq(3).val(), 10)
          }));
          fillHexFields(col, cal.get(0));
          fillHSBFields(col, cal.get(0));
        }
        setSelector(col, cal.get(0));
        setHue(col, cal.get(0));
        setNewColor(col, cal.get(0));
        cal.data('colpick').onChange.apply(cal.parent(), [col, hsbToHex(col), hsbToRgb(col), cal.data('colpick').el, 0]);
      },
      //Change style on blur and on focus of inputs
      blur = function () {
        $(this).parent().removeClass('colpick_focus');
      },
      focus = function () {
        $(this).parent().parent().data('colpick').fields.parent().removeClass('colpick_focus');
        $(this).parent().addClass('colpick_focus');
      },
      //Increment/decrement arrows functions
      downIncrement = function (ev) {
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        var field = $(this).parent().find('input').focus();
        var current = {
          el: $(this).parent().addClass('colpick_slider'),
          max: this.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (this.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
          y: ev.pageY,
          field: field,
          val: parseInt(field.val(), 10),
          preview: $(this).parent().parent().data('colpick').livePreview
        };
        $(document).mouseup(current, upIncrement);
        $(document).mousemove(current, moveIncrement);
      },
      moveIncrement = function (ev) {
        ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val - ev.pageY + ev.data.y, 10))));
        if (ev.data.preview) {
          change.apply(ev.data.field.get(0), [true]);
        }
        return false;
      },
      upIncrement = function (ev) {
        change.apply(ev.data.field.get(0), [true]);
        ev.data.el.removeClass('colpick_slider').find('input').focus();
        $(document).off('mouseup', upIncrement);
        $(document).off('mousemove', moveIncrement);
        return false;
      },
      //Hue slider functions
      downHue = function (ev) {
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        var current = {
          cal: $(this).parent(),
          y: $(this).offset().top
        };
        $(document).on('mouseup touchend', current, upHue);
        $(document).on('mousemove touchmove', current, moveHue);

        var pageY = ((ev.type == 'touchstart') ? ev.originalEvent.changedTouches[0].pageY : ev.pageY);
        change.apply(
          current.cal.data('colpick')
            .fields.eq(4).val(parseInt(360 * (current.cal.data('colpick').height - (pageY - current.y)) / current.cal.data('colpick').height, 10))
            .get(0),
          [current.cal.data('colpick').livePreview]
        );
        return false;
      },
      moveHue = function (ev) {
        var pageY = ((ev.type == 'touchmove') ? ev.originalEvent.changedTouches[0].pageY : ev.pageY);
        change.apply(
          ev.data.cal.data('colpick')
            .fields.eq(4).val(parseInt(360 * (ev.data.cal.data('colpick').height - Math.max(0, Math.min(ev.data.cal.data('colpick').height, (pageY - ev.data.y)))) / ev.data.cal.data('colpick').height, 10))
            .get(0),
          [ev.data.preview]
        );
        return false;
      },
      upHue = function (ev) {
        fillRGBFields(ev.data.cal.data('colpick').color, ev.data.cal.get(0));
        fillHexFields(ev.data.cal.data('colpick').color, ev.data.cal.get(0));
        $(document).off('mouseup touchend', upHue);
        $(document).off('mousemove touchmove', moveHue);
        return false;
      },
      //Color selector functions
      downSelector = function (ev) {
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        var current = {
          cal: $(this).parent(),
          pos: $(this).offset()
        };
        current.preview = current.cal.data('colpick').livePreview;

        $(document).on('mouseup touchend', current, upSelector);
        $(document).on('mousemove touchmove', current, moveSelector);

        var pageX, pageY;
        if (ev.type == 'touchstart') {
          pageX = ev.originalEvent.changedTouches[0].pageX;
          pageY = ev.originalEvent.changedTouches[0].pageY;
        } else {
          pageX = ev.pageX;
          pageY = ev.pageY;
        }

        change.apply(
          current.cal.data('colpick').fields
            .eq(6).val(parseInt(100 * (current.cal.data('colpick').height - (pageY - current.pos.top)) / current.cal.data('colpick').height, 10)).end()
            .eq(5).val(parseInt(100 * (pageX - current.pos.left) / current.cal.data('colpick').height, 10))
            .get(0),
          [current.preview]
        );
        return false;
      },
      moveSelector = function (ev) {
        var pageX, pageY;
        if (ev.type == 'touchmove') {
          pageX = ev.originalEvent.changedTouches[0].pageX;
          pageY = ev.originalEvent.changedTouches[0].pageY;
        } else {
          pageX = ev.pageX;
          pageY = ev.pageY;
        }

        change.apply(
          ev.data.cal.data('colpick').fields
            .eq(6).val(parseInt(100 * (ev.data.cal.data('colpick').height - Math.max(0, Math.min(ev.data.cal.data('colpick').height, (pageY - ev.data.pos.top)))) / ev.data.cal.data('colpick').height, 10)).end()
            .eq(5).val(parseInt(100 * (Math.max(0, Math.min(ev.data.cal.data('colpick').height, (pageX - ev.data.pos.left)))) / ev.data.cal.data('colpick').height, 10))
            .get(0),
          [ev.data.preview]
        );
        return false;
      },
      upSelector = function (ev) {
        fillRGBFields(ev.data.cal.data('colpick').color, ev.data.cal.get(0));
        fillHexFields(ev.data.cal.data('colpick').color, ev.data.cal.get(0));
        $(document).off('mouseup touchend', upSelector);
        $(document).off('mousemove touchmove', moveSelector);
        return false;
      },
      //Submit button
      clickSubmit = function () {
        var cal = $(this).parent();
        var col = cal.data('colpick').color;
        cal.data('colpick').origColor = col;
        setCurrentColor(col, cal.get(0));
        cal.data('colpick').onSubmit(col, hsbToHex(col), hsbToRgb(col), cal.data('colpick').el);
      },
      //Show/hide the color picker
      show = function (ev) {
        if (ev) {
          // Prevent the trigger of any direct parent
          ev.stopPropagation();
        }
        var cal = $('#' + $(this).data('colpickId'));
        if (ev && !cal.data('colpick').polyfill) {
          ev.preventDefault();
        }
        cal.data('colpick').onBeforeShow.apply(this, [cal.get(0)]);
        var pos = $(this).offset();
        var top = pos.top + this.offsetHeight;
        var left = pos.left;
        var viewPort = getViewport();
        var calW = cal.width();
        if (left + calW > viewPort.l + viewPort.w) {
          left -= calW;
        }
        cal.css({ left: left + 'px', top: top + 'px' });
        if (cal.data('colpick').onShow.apply(this, [cal.get(0)]) != false) {
          cal.show();
        }
        //Hide when user clicks outside
        $('html').mousedown({ cal: cal }, hide);
        cal.mousedown(function (ev) {
          ev.stopPropagation();
        })
      },
      hide = function (ev) {
        var cal = $('#' + $(this).data('colpickId'));
        if (ev) {
          cal = ev.data.cal;
        }
        if (cal.data('colpick').onHide.apply(this, [cal.get(0)]) != false) {
          cal.hide();
        }
        $('html').off('mousedown', hide);
      },
      getViewport = function () {
        var m = document.compatMode == 'CSS1Compat';
        return {
          l: window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
          w: window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth)
        };
      },
      //Fix the values if the user enters a negative or high value
      fixHSB = function (hsb) {
        return {
          h: Math.min(360, Math.max(0, hsb.h)),
          s: Math.min(100, Math.max(0, hsb.s)),
          b: Math.min(100, Math.max(0, hsb.b))
        };
      },
      fixRGB = function (rgb) {
        return {
          r: Math.min(255, Math.max(0, rgb.r)),
          g: Math.min(255, Math.max(0, rgb.g)),
          b: Math.min(255, Math.max(0, rgb.b))
        };
      },
      fixHex = function (hex) {
        var len = 6 - hex.length;
        if (len == 3) {
          var e = [];
          for (var j = 0; j < len; j++) {
            e.push(hex[j]);
            e.push(hex[j]);
          }
          hex = e.join('');
        } else {
          if (len > 0) {
            var o = [];
            for (var i = 0; i < len; i++) {
              o.push('0');
            }
            o.push(hex);
            hex = o.join('');
          }
        }
        return hex;
      },
      restoreOriginal = function () {
        var cal = $(this).parent();
        var col = cal.data('colpick').origColor;
        cal.data('colpick').color = col;
        fillRGBFields(col, cal.get(0));
        fillHexFields(col, cal.get(0));
        fillHSBFields(col, cal.get(0));
        setSelector(col, cal.get(0));
        setHue(col, cal.get(0));
        setNewColor(col, cal.get(0));
      };
    return {
      init: function (opt) {
        opt = $.extend({}, defaults, opt || {});
        //Set color
        if (opt.color === 'auto') {
        } else if (typeof opt.color == 'string') {
          opt.color = hexToHsb(opt.color);
        } else if (opt.color.r != undefined && opt.color.g != undefined && opt.color.b != undefined) {
          opt.color = rgbToHsb(opt.color);
        } else if (opt.color.h != undefined && opt.color.s != undefined && opt.color.b != undefined) {
          opt.color = fixHSB(opt.color);
        } else {
          return this;
        }

        //For each selected DOM element
        return this.each(function () {
          //If the element does not have an ID
          if (!$(this).data('colpickId')) {
            var options = $.extend({}, opt);
            //Color
            if (opt.color === 'auto') {
              options.color = $(this).val() ? hexToHsb($(this).val()) : { h: 0, s: 0, b: 0 };
            }
            options.origColor = options.color;

            //Polyfill
            if (typeof opt.polyfill == 'function') {
              options.polyfill = opt.polyfill(this);
            }
            if (options.polyfill && $(this).is('input') && this.type === "color") {
              return;
            }

            //Generate and assign a random ID
            var id = 'collorpicker_' + parseInt(Math.random() * 1000);
            $(this).data('colpickId', id);
            //Set the tpl's ID and get the HTML
            var cal = $(tpl).attr('id', id);
            //Add class according to layout
            cal.addClass('colpick_' + options.layout + (options.submit ? '' : ' colpick_' + options.layout + '_ns'));
            //Add class if the color scheme is not default
            if (options.colorScheme != 'light') {
              cal.addClass('colpick_' + options.colorScheme);
            }
            //Setup submit button
            cal.find('div.colpick_submit').html(options.submitText).click(clickSubmit);
            //Setup input fields
            options.fields = cal.find('input').change(change).blur(blur).focus(focus);
            cal.find('div.colpick_field_arrs').mousedown(downIncrement).end().find('div.colpick_current_color').click(restoreOriginal);
            //Setup hue selector
            options.selector = cal.find('div.colpick_color').on('mousedown touchstart', downSelector);
            options.selectorIndic = options.selector.find('div.colpick_selector_outer');
            //Store parts of the plugin
            options.el = this;
            options.hue = cal.find('div.colpick_hue_arrs');
            var huebar = options.hue.parent();
            //Paint the hue bar
            var UA = navigator.userAgent.toLowerCase();
            var isIE = navigator.appName === 'Microsoft Internet Explorer';
            var IEver = isIE ? parseFloat(UA.match(/msie ([0-9]*[\.0-9]+)/)[1]) : 0;
            var ngIE = (isIE && IEver < 10);
            var stops = ['#ff0000', '#ff0080', '#ff00ff', '#8000ff', '#0000ff', '#0080ff', '#00ffff', '#00ff80', '#00ff00', '#80ff00', '#ffff00', '#ff8000', '#ff0000'];
            if (ngIE) {
              var i, div;
              for (i = 0; i <= 11; i++) {
                div = $('<div></div>').attr('style', 'height:8.333333%; filter:progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr=' + stops[i] + ', endColorstr=' + stops[i + 1] + '); -ms-filter: "progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr=' + stops[i] + ', endColorstr=' + stops[i + 1] + ')";');
                huebar.append(div);
              }
            } else {
              var stopList = stops.join(',');
              huebar.attr('style', 'background:-webkit-linear-gradient(top,' + stopList + '); background: -o-linear-gradient(top,' + stopList + '); background: -ms-linear-gradient(top,' + stopList + '); background:-moz-linear-gradient(top,' + stopList + '); -webkit-linear-gradient(top,' + stopList + '); background:linear-gradient(to bottom,' + stopList + '); ');
            }
            cal.find('div.colpick_hue').on('mousedown touchstart', downHue);
            options.newColor = cal.find('div.colpick_new_color');
            options.currentColor = cal.find('div.colpick_current_color');
            //Store options and fill with default color
            cal.data('colpick', options);
            fillRGBFields(options.color, cal.get(0));
            fillHSBFields(options.color, cal.get(0));
            fillHexFields(options.color, cal.get(0));
            setHue(options.color, cal.get(0));
            setSelector(options.color, cal.get(0));
            setCurrentColor(options.color, cal.get(0));
            setNewColor(options.color, cal.get(0));
            //Append to body if flat=false, else show in place
            if (options.flat) {
              cal.appendTo(options.appendTo || this).show();
              cal.css(options.styles || {
                position: 'relative',
                display: 'block'
              });
            } else {
              cal.appendTo(options.appendTo || document.body);
              $(this).on(options.showEvent, show);
              cal.css(options.styles || {
                position: 'absolute'
              });
            }
          }
        });
      },
      //Shows the picker
      showPicker: function () {
        return this.each(function () {
          if ($(this).data('colpickId')) {
            show.apply(this);
          }
        });
      },
      //Hides the picker
      hidePicker: function () {
        return this.each(function () {
          if ($(this).data('colpickId')) {
            hide.apply(this);
          }
        });
      },
      //Sets a color as new and current (default)
      setColor: function (col, setCurrent) {
        setCurrent = (typeof setCurrent === "undefined") ? 1 : setCurrent;
        if (typeof col == 'string') {
          col = hexToHsb(col);
        } else if (col.r != undefined && col.g != undefined && col.b != undefined) {
          col = rgbToHsb(col);
        } else if (col.h != undefined && col.s != undefined && col.b != undefined) {
          col = fixHSB(col);
        } else {
          return this;
        }
        return this.each(function () {
          if ($(this).data('colpickId')) {
            var cal = $('#' + $(this).data('colpickId'));
            cal.data('colpick').color = col;
            cal.data('colpick').origColor = col;
            fillRGBFields(col, cal.get(0));
            fillHSBFields(col, cal.get(0));
            fillHexFields(col, cal.get(0));
            setHue(col, cal.get(0));
            setSelector(col, cal.get(0));

            setNewColor(col, cal.get(0));
            cal.data('colpick').onChange.apply(cal.parent(), [col, hsbToHex(col), hsbToRgb(col), cal.data('colpick').el, 1]);
            if (setCurrent) {
              setCurrentColor(col, cal.get(0));
            }
          }
        });
      },
      destroy: function () {
        $('#' + $(this).data('colpickId')).remove();
      }
    };
  }();
  //Color space conversions
  var hexToRgb = function (hex) {
    hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
    return { r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF) };
  };
  var hexToHsb = function (hex) {
    return rgbToHsb(hexToRgb(hex));
  };
  var rgbToHsb = function (rgb) {
    var hsb = { h: 0, s: 0, b: 0 };
    var min = Math.min(rgb.r, rgb.g, rgb.b);
    var max = Math.max(rgb.r, rgb.g, rgb.b);
    var delta = max - min;
    hsb.b = max;
    hsb.s = max != 0 ? 255 * delta / max : 0;
    if (hsb.s != 0) {
      if (rgb.r == max) hsb.h = (rgb.g - rgb.b) / delta;
      else if (rgb.g == max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
      else hsb.h = 4 + (rgb.r - rgb.g) / delta;
    } else hsb.h = -1;
    hsb.h *= 60;
    if (hsb.h < 0) hsb.h += 360;
    hsb.s *= 100 / 255;
    hsb.b *= 100 / 255;
    return hsb;
  };
  var hsbToRgb = function (hsb) {
    var rgb = {};
    var h = hsb.h;
    var s = hsb.s * 255 / 100;
    var v = hsb.b * 255 / 100;
    if (s == 0) {
      rgb.r = rgb.g = rgb.b = v;
    } else {
      var t1 = v;
      var t2 = (255 - s) * v / 255;
      var t3 = (t1 - t2) * (h % 60) / 60;
      if (h == 360) h = 0;
      if (h < 60) {
        rgb.r = t1;
        rgb.b = t2;
        rgb.g = t2 + t3
      }
      else if (h < 120) {
        rgb.g = t1;
        rgb.b = t2;
        rgb.r = t1 - t3
      }
      else if (h < 180) {
        rgb.g = t1;
        rgb.r = t2;
        rgb.b = t2 + t3
      }
      else if (h < 240) {
        rgb.b = t1;
        rgb.r = t2;
        rgb.g = t1 - t3
      }
      else if (h < 300) {
        rgb.b = t1;
        rgb.g = t2;
        rgb.r = t2 + t3
      }
      else if (h < 360) {
        rgb.r = t1;
        rgb.g = t2;
        rgb.b = t1 - t3
      }
      else {
        rgb.r = 0;
        rgb.g = 0;
        rgb.b = 0
      }
    }
    return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
  };
  var rgbToHex = function (rgb) {
    var hex = [
      rgb.r.toString(16),
      rgb.g.toString(16),
      rgb.b.toString(16)
    ];
    $.each(hex, function (nr, val) {
      if (val.length == 1) {
        hex[nr] = '0' + val;
      }
    });
    return hex.join('');
  };
  var hsbToHex = function (hsb) {
    return rgbToHex(hsbToRgb(hsb));
  };
  $.fn.extend({
    colpick: colpick.init,
    colpickHide: colpick.hidePicker,
    colpickShow: colpick.showPicker,
    colpickSetColor: colpick.setColor,
    colpickDestroy: colpick.destroy
  });
  $.extend({
    colpick: {
      rgbToHex: rgbToHex,
      rgbToHsb: rgbToHsb,
      hsbToHex: hsbToHex,
      hsbToRgb: hsbToRgb,
      hexToHsb: hexToHsb,
      hexToRgb: hexToRgb
    }
  });
  InitializePicker($);
}));

function InitializePicker($) {
  var init = function () {
    var docStylesheets = document.styleSheets;
    var protoStylesheet = null;

    for (var i = 0; i < docStylesheets.length; i++) {
      if (docStylesheets[i].ownerNode.getAttribute("id") === "proto-styles") {
        protoStylesheet = docStylesheets[i];
        break;
      }
    }

    if (protoStylesheet !== null) {
      return protoStylesheet;
    }

    return false;
  };
  
  $('.theme-element[data-position="colpick"] .color-picker').on("click", function (e) {
    e.preventDefault();
  });

  $(document).ready(function () {
    $('.theme-element[data-position="colpick"] .color-picker').colpick({
      layout: "hex",     
      onChange: function (hsb, hex, rgb, el, bySetColor) {
        $(el).val("#" + hex);
      }
    });

    var themeStyle = init();

    if (themeStyle) {
      var cssRules = themeStyle.cssRules;

      $(".color-picker").colpick({
        layout: "hex",     
        onChange: function (hsb, hex, rgb, el, bySetColor) {
            $(el).val("#" + hex);
            $(el).trigger("change");
          }
        })
        .each(function (i, e) {
          $(e).on("change", function () {
            var selectedColor = $(this).val();
            $("#clr").val(selectedColor);
          });
        });
    }
  });
}

function selectclr() {
  if (document.getElementById("theme-color") !== null) {
    $("#theme-color").remove();
  }
  var color = $(".color-picker").val();

  var divNode = document.createElement("div");
  divNode.id = "theme-color";
  //divNode.innerHTML = "<style>a:hover, .cart .product a:hover, .data-table .product a:hover, .data-table .info a:hover, .cart .product .edit-item a, .cart td.subtotal .discount, .cart td.subtotal .discount-additional-info, .eu-cookie-bar-notification a, .header-links a:hover, .footer-tax-shipping a, .footer-powered-by a, .footer-design-by a, .block .list .active > a, .block .list a:hover, .block .view-all a, .block .tags li a:hover, .product-tags-all-page li a:hover, .breadcrumb a:hover, .product-filter .group li a:hover, .filtered-items .item, .item-box .product-title a:hover, .item-box .tax-shipping-info a, .manufacturer-grid .title a:hover, .vendor-grid .title a:hover, .product-review-links a:hover, .overview .value a, .variant-overview .value a, .overview .button-2:hover, .variant-overview .button-2:hover, .overview .tax-shipping-info a, .variant-overview .tax-shipping-info a, .variant-overview .variant-name, .ui-datepicker-calendar .ui-state-active, .product-reviews-page h1 a, .product-review-item .review-info a, .product-review-helpfulness .vote, .wishlist-content .tax-shipping-info a, .wishlist-page .share-info a:hover, .compare-products-table .remove-button:hover, .email-a-friend-page .title h2, .apply-vendor-page .terms-of-service span, .apply-vendor-page .terms-of-service a, .inputs.accept-consent span, .inputs.accept-consent a, .return-request-page h1 a, .login-page .returning-wrapper .inputs.reversed a:hover, .external-auth-association a, .add-more-external-records a, .address-list-page .button-2:hover, .order-list-page .button-2:hover, .return-request-list-page a, .order-progress li.active-step a, .shopping-cart-page .checkout-attributes a, .shopping-cart-page .tax-shipping-info a, .cart-total .order-total, .terms-of-service a, .order-completed .details a, .opc .back-link a:hover, .order-details-page .order-overview .order-total strong, .order-details-page .download a, .sitemap-page .entity a:hover, .post-date, .news-date, .blog-page .tags a, .blogpost-page .tags a, .comment-info a.username:hover, .forum-search-box .advanced a:hover, .forums-table-section-title a:hover, .forums-table-section .forum-title a:hover, .forums-table-section .topic-title a:hover, .topic-post a.username:hover, .topic-post .post-actions .edit-post-button:hover, .topic-post .post-actions .delete-post-button:hover, .topic-post .post-actions .post-link-button, .private-message-send-page a, .ui-tabs-nav li.ui-state-active a, .private-messages-page td.subject a.pm-unread, .latest-posts .topic-title a:hover, .menu-toggle i, .shipment-details-page .tracking-number .tracking-url, .header-menu > ul > li > a:hover, h1 span, .mini-shopping-cart .name a:hover, .html-account-page .block .list a.active, .html-checkout-page .selected-checkout-attributes, .contact-page .contact-right ul li .contact-icon em, .sitemap_page .entity-title h2, .order-completed .details a, .follow-us .social li a:hover, .follow-us .social a:hover i, .header-menu > ul > li > a:hover, .header-menu ul li:hover > a, .header-menu ul li:hover > .sublist-toggle, .administration:hover, .category-m .category-wrapper:after, .category-m .category-wrapper:before, .poduct-no-reviews a:hover, a.tablinks.active-tab, .html-shopping-cart-page .cart td.subtotal h2, .html-shopping-cart-page .data-table td.total h2, .sitemap_page ul li a:hover, .contact-page .contact-right ul li .contact-icon h6 , .theme-color {color: " + color + " !important ;} .bs_home_feature_product_section,.bs_best_sellers.slick-prev,.bs_best_sellers.slick-next,.bs_news_home_main_left:before,.bs_home_category_item.title,.bs_category_home_main.slick-prev,.bs_category_home_main.slick-next,.bs_title_white h3:after,.bs_item_box_buttons.product-box-add-to-cart-button,.bs_item_box_buttons.add-to-wishlist-button,.bs_title_black h3:before,.bs_news_item.bs_news_date_day,.bs_blog_post.bs_blogs_date_day,.bs_primary_button:hover,.button-1:hover,.bs_secondary_button,.button-2,.bs_poll_main,.bs_primary_button:hover,.bs_poll:nth-of-type(even).bs_poll_options li.answer,.bs_newsletter-subscribe-button,.footer-block.follow-us.networks li,.bs_title_black h4:before,.bs_sub_category_item.title,.product-selectors.product-viewmode a.selected,.bs_title_white.title_bg_black h4::after,.bs_reg_login_section::before,.address-list.section.address-item.bs_edit_remove_buttons,.bs_product_name_breadcrumb,.jCarouselMainWrapper.slick-prev,.jCarouselMainWrapper.slick-next,.product-review-item.review-info,.order-item.bs_order_number,.html-account-page.block.list a:hover,.html-account-page.block.list.active > a,.bs_news_comment:nth-child(even),.bs_contactus_icon,.bs_email_icon,.bs_return_icon,.bs_search_icon,.bs_request_item.title,.slinky-theme-default,.ui-state-active,.ui-widget-content.ui-state-active,.ui-widget-header.ui-state-active,a.ui-button:active,.ui-button:active,.ui-button.ui-state-active:hover,.bs_service_box.l-icon,.footer,.bs_item_box_buttons.add-to-compare-list-button,.header-links a.ico-cart.cart-qty,.cart td,.data-table td,.forum-table td,.ui-dialog-content.back-in-stock-subscription-page.button-1,.header-links a.ico-wishlist.wishlist-qty,.newsletter-subscribe-button,.block.title,.block.view-all a:hover,.product-selectors > div,.pager li span,.pager li a: hover,.overview.bs_add_to_cart_button,.variant-overview.bs_add_to_cart_button,.ui-datepicker-header,.tooltip-container.tooltip-header,.write-review,.write-review.button-1,.wishlist-content.update-wishlist-button,.wishlist-content.wishlist-add-to-cart-button,.enter-password-form input[type='submit'],#check-availability-button:hover,.login-page.new-wrapper.text,.login-page.returning-wrapper.form-fields,.login-page.returning-wrapper.buttons,.order-progress,.cart-footer.totals,.cart-footer.checkout-button,.apply-shipping-button,.opc.allow.step-title,.opc.allow.step-title.number,.order-details-page.repost.button-2,.user-agreement-page.button-1,.order-details-page.total-info,.forums-table-section.view-all a,.forum-edit-page.buttons.button-1,.move-topic-page.buttons.button-1,.private-messages.buttons.button-1,.ui-tabs-nav li.ui-state-active a,.menu-toggle,.mini-shopping-cart input[type='button'],.login-page.new-wrapper,.login-page.returning - wrapper,.skltbs-theme-light.skltbs-tab.skltbs-active:focus,.skltbs-theme-light.skltbs-tab.skltbs-active:hover,.skltbs-theme-light.skltbs-tab.skltbs-active,.admin-header-links,.forums-table-section.view-all a:hover,.topic-post.pm-button,.profile-info-box.pm-button,.header-links a.ico-inbox.inbox-unread{background-color:" + color + " !important;} .ui-dialog-content .back-in-stock-subscription-page .button-1:hover, .eu-cookie-bar-notification button:hover, .contact-vendor .button-2:hover, .item-box .product-box-add-to-cart-button:hover, .compare-products-page .clear-list:hover, .apply-vendor-page .button-1:hover, .shopping-cart-page .common-buttons input:first-child:hover, .opc .allow .step-title .number, .order-details-page .repost .button-2:hover, .user-agreement-page .button-1:hover, .forums-table-section .view-all a:hover, .forum-edit-page .buttons .button-1:hover, .move-topic-page .buttons .button-1:hover, .private-messages .buttons .button-1:hover{background-color: " + color + " !important;filter:brightness(0.93);} .addthis_toolbox a:hover .at-icon-wrapper .at-icon {fill: " + color + ";} .header-lower, a.tablinks.active-tab, .btn-outline, .header-tools .logo-menu-part > .container, .active-step a:before,.overview .add-to-cart-button,.variant-overview .add-to-cart-button, .wishlist-content .update-wishlist-button,.wishlist-content .wishlist-add-to-cart-button, .registration-page .button-1,.registration-result-page .button-1,.login-page .button-1,.password-recovery-page .button-1,.account-page .button-1,.return-request-page .button-1, .compare-products-page .clear-list, .search-input .button-1, .blog-posts .buttons .read-more,.news-items .buttons .read-more, .checkout-page .button-1, .order-details-page .actions input:first-child,.order-details-page .page-title a.print-order-button, .write-review .button-1, .new-comment .button-1, .apply-vendor-page .button-1, .email-a-friend-page .button-1, .news-list-homepage .view-all a, .btn-solid, .category-m .category-wrapper .btn, .cart-footer .checkout-button , .theme-border {border-color: " + color+ " !important;} .ui-datepicker-calendar .ui-state-active {outline-color:" + color + " !important;} .overview .add-to-cart-button,.variant-overview .add-to-cart-button, .wishlist-content .update-wishlist-button,.wishlist-content .wishlist-add-to-cart-button, .registration-page .button-1,.registration-result-page .button-1,.login-page .button-1,.password-recovery-page .button-1,.account-page .button-1,.return-request-page .button-1, .compare-products-page .clear-list, .search-input .button-1, .blog-posts .buttons .read-more,.news-items .buttons .read-more, .checkout-page .button-1, .order-details-page .actions input:first-child,.order-details-page .page-title a.print-order-button, .write-review .button-1, .new-comment .button-1, .apply-vendor-page .button-1, .email-a-friend-page .button-1, .news-list-homepage .view-all a, .btn-solid, .category-m .category-wrapper .btn, .cart-footer .checkout-button, .cart-footer .checkout-button:hover, .checkout-page .button-1:hover, .contact-page .button-1:hover, .write-review .button-1:hover, .email-a-friend-page .button-1:hover, .new-comment .button-1:hover{background-image: linear-gradient(30deg, " + color + " 50%, transparent 50%) !important;} .contact-page .button-1:hover{background: " + color + " !important;}</style > ";
  var newCss = "<style>";
  newCss = newCss + ".bs_home_feature_product_section,.bs_best_sellers .slick-prev,.bs_best_sellers " +
    ".slick-next,.bs_news_home_main_left:before,.bs_home_category_item.title,.bs_category_home_main .slick-prev,.bs_category_home_main " +
    ".slick-next,.bs_title_white h3:after,.bs_item_box_buttons.product-box-add-to-cart-button,.bs_item_box_buttons.add-to-wishlist-button,h3:before,.bs_news_item.bs_news_date_day,.bs_blog_post.bs_blogs_date_day,.bs_primary_button:hover,.button-1:hover,.bs_secondary_button,.button-2,.bs_poll_main,.bs_newsletter-subscribe-button,.footer-block.follow-us.networks li,.bs_title_black h4:before,.bs_sub_category_item.title,.product-selectors.product-viewmode a.selected,.bs_title_white.title_bg_black h4:after,.bs_reg_login_section:before,.address-list.section.address-item.bs_edit_remove_buttons,.bs_product_name_breadcrumb,.jCarouselMainWrapper .slick-prev,.jCarouselMainWrapper.slick-next,.product-review-item.review-info,.order-item.bs_order_number,.html-account-page.block.list a:hover,.html-account-page.block.list.active > a,.bs_contactus_icon,.bs_email_icon,.bs_return_icon,.bs_search_icon,.bs_request_item.title,.slinky-menu,.ui-state-active,.ui-widget-content.ui-state-active,.ui-widget-header.ui-state-active,a.ui-button:active,.ui-button:active,.ui-button.ui-state-active:hover,.bs_service_box.l-icon,.footer,.bs_item_box_buttons.add-to-compare-list-button,.header-links a.ico-cart.cart-qty,.cart td,.data-table td,.forum-table td,.ui-dialog-content.back-in-stock-subscription-page.button-1,.header-links a.ico-wishlist.wishlist-qty,.newsletter-subscribe-button,.block.title,.block.view-all a:hover,.product-selectors > div,.pager li span,.pager li a: hover,.overview.bs_add_to_cart_button,.variant-overview.bs_add_to_cart_button,.ui-datepicker-header,.tooltip-container.tooltip-header,.write-review,.write-review.button-1,.wishlist-content.update-wishlist-button,.wishlist-content.wishlist-add-to-cart-button,.check-username-availability-button:hover,.login-page.new-wrapper.text,.login-page.returning-wrapper.form-fields,.login-page.returning-wrapper.buttons,.order-progress,.cart-footer.totals,.cart-footer.checkout-button,.apply-shipping-button,.opc.allow.step-title,.opc.allow.step-title.number,.order-details-page.repost.button-2,.user-agreement-page.button-1,.order-details-page.total-info,.forums-table-section.view-all a,.forum-edit-page.buttons.button-1,.move-topic-page.buttons.button-1,.private-messages.buttons.button-1,.ui-tabs-nav li.ui-state-active a,.menu-toggle,.login-page.new-wrapper,.login-page.returning-wrapper,.skltbs-theme-light.skltbs-tab.skltbs-active:focus,.skltbs-theme-light.skltbs-tab.skltbs-active:hover,.skltbs-theme-light.skltbs-tab.skltbs-active,.admin-header-links,.forums-table-section.view-all a:hover,.topic-post.pm-button,.profile-info-box.pm-button,.header-links a.ico-inbox.inbox-unread{background-color:" + color + "!important;}";
  newCss = newCss +"";
  newCss = newCss +"";
 // divNode.innerHTML = newCss;

  var color1 = `
.bs_home_feature_product_section,
.bs_best_sellers .slick-prev,
.bs_best_sellers .slick-next,
.bs_news_home_main_left::before,
.bs_home_category_item .title,
.bs_category_home_main .slick-prev,
.bs_category_home_main .slick-next,
.bs_title_white h3:after,
.bs_item_box_buttons .product-box-add-to-cart-button,
.bs_item_box_buttons .add-to-wishlist-button,
.bs_title_black h3:before,
.bs_news_item .bs_news_date_day,
.bs_blog_post .bs_blogs_date_day,
.bs_primary_button:hover,
.button-1:hover,
.bs_secondary_button,
.button-2,
.bs_poll_main,
[type="radio"]:checked + label:after,
[type="radio"]:not(:checked) + label:after,
.bs_poll:nth-of-type(even) .bs_primary_button:hover,
.bs_poll:nth-of-type(even) .bs_poll_options li.answer,
.bs_newsletter-subscribe-button,
.footer-block.follow-us .networks li,
.bs_title_black h4:before,
.bs_sub_category_item .title,
.product-selectors .product-viewmode a.selected,
.bs_title_white.title_bg_black h4::after,
.bs_reg_login_section::before,
.address-list .section.address-item .bs_edit_remove_buttons,
.bs_product_name_breadcrumb,
.jCarouselMainWrapper .slick-prev,
.jCarouselMainWrapper .slick-next,
.product-review-item .review-info,
.order-item .bs_order_number,
.html-account-page .block .list a:hover,
.html-account-page .block .list .active > a,
.bs_news_comment:nth-child(even),
.bs_contactus_icon,
.bs_email_icon,
.bs_return_icon,
.bs_search_icon,
.bs_request_item .title,
.slinky-theme-default,
.ui-state-active,
.ui-widget-content .ui-state-active,
.ui-widget-header .ui-state-active,
a.ui-button:active,
.ui-button:active,
.ui-button.ui-state-active:hover,
.bs_service_box .l-icon,
.footer,
.bs_item_box_buttons .add-to-compare-list-button,
.header-links a.ico-cart .cart-qty,
.cart td,
.data-table td,
.forum-table td,
.ui-dialog-content .back-in-stock-subscription-page .button-1,
.header-links a.ico-wishlist .wishlist-qty,
.newsletter-subscribe-button,
.block .title,
.block .view-all a:hover,
.product-selectors > div,
.pager li span,
.pager li a:hover,
.overview .bs_add_to_cart_button,
.variant-overview .bs_add_to_cart_button,
.ui-datepicker-header,
.tooltip-container .tooltip-header,
.write-review,
.write-review .button-1,
.wishlist-content .update-wishlist-button,
.wishlist-content .wishlist-add-to-cart-button,
.enter-password-form input[type="submit"],
#check-availability-button:hover,
.login-page .new-wrapper .text,
.login-page .returning-wrapper .form-fields,
.login-page .returning-wrapper .buttons,
.order-progress,
.cart-footer .totals,
.cart-footer .checkout-button,
.apply-shipping-button,
.opc .allow .step-title,
.opc .allow .step-title .number,
.order-details-page .repost .button-2,
.user-agreement-page .button-1,
.order-details-page .total-info,
.forums-table-section .view-all a,
.forum-edit-page .buttons .button-1,
.move-topic-page .buttons .button-1,
.private-messages .buttons .button-1,
.ui-tabs-nav li.ui-state-active a,
.menu-toggle,
.mini-shopping-cart input[type="button"],
.login-page .new-wrapper,
.login-page .returning-wrapper,
.skltbs-theme-light .skltbs-tab.skltbs-active:focus,
.skltbs-theme-light .skltbs-tab.skltbs-active:hover,
.skltbs-theme-light .skltbs-tab.skltbs-active,
.admin-header-links,
.forums-table-section .view-all a:hover,
.topic-post .pm-button,
.profile-info-box .pm-button,
.header-links a.ico-inbox .inbox-unread {
  background-color: ${color};
}`;

  var color2 = `
@media only screen and (max-width: 1024px) {
  #mySidenav,
  .login-page .returning-wrapper {
    background-color: ${color};
  }
  .footer-block .title,
  .bs_footer_link .footer-block .list li a:hover,
  .bs_footer_link .footer-block .list,
  .bs_footer_link .footer-block .list li a,
  .bs_read_icon {
    color: ${color};
  }
}`;

  var color3 = `.theme-custom .nivo-controlNav a.active, .apply-shipping-button:hover,
.bs_primary_button:hover,
.swal2-confirm.bs_secondary_button.swal2-styled,
.swal2-cancel.bs_secondary_button.swal2-styled,
.bs_primary_button:hover, .button-1:hover,
.forums-main-page .forums-header .basic .button-2.search-box-button:hover{
  background-color: ${color},!important;
}`;

  var color4 = `.cart .product .edit-item a:hover,
.bs_border_button:hover,
.ui-datepicker-calendar .ui-state-active{
  color: ${color},!important;
}`;

  var color5 = `.overview .bs_add_to_cart_button:hover,
.variant-overview .bs_add_to_cart_button:hover{
  box-shadow: ${color},!important;
}`;

  var color6 = `.wrm-border-btn .hottest-see-more:hover,
.bs_news_home_main_right,
.bs_poll:nth-of-type(even) .bs_primary_button,
.bs_service_box:hover,
.bs_primary_button,
.bs_secondary_button,
[type="checkbox"] + label:before,
.section.pickup-in-store label:before,
.bs_poll:nth-of-type(even) .bs_primary_button,
.product-grid .item-box,
.bs_category_product_list .item-box,
.product-grid .item-box,
.bs_category_product_list .item-box,
/*.bs_selected_checkout_attribute,*/
.bs_coupon_box .coupon-box, .bs_gift_card_box .giftcard-box,
.checkout-data .bs_billing_info_wrap, .checkout-data .bs_shipping_info_wrap,
.order-details-page .bs_billing_info_wrap, .order-details-page .bs_shipping_info_wrap,
.use-reward-points label:before,
.bs_news_comment:nth-child(odd) .user-info,
.shipment-details-page .shipment-details-area .order-info-wrap,
.shipment-details-page .shipment-details-area .shipping-info-wrap,
.shipment-details-page .shipment-details-area .order-info-wrap .bs_order_info_wrap,
.shipment-details-page .shipment-details-area .shipping-info-wrap .bs_shipping_info_wrap,
.bs_authentication_providers .method-list li,
.ui-state-active,
.ui-widget-content .ui-state-active,
.ui-widget-header .ui-state-active,
a.ui-button:active,
.ui-button:active,
.ui-button.ui-state-active:hover,
.header-links a.ico-wishlist .wishlist-qty,
.header-links a.ico-inbox .inbox-unread,
.header-links a.ico-cart .cart-qty,
.block .view-all a,
.pager li a,
.pager li span,
.attribute-squares .attribute-square,
.order-review-data > div,
.order-details-area > div,
.shipment-details-area > div{
  border-color: ${color}, !important;
}`;

  divNode.innerHTML = "<style>" + color1 + color2 + color3 + color4 + color5 + color6 + "</style>";

  document.head.appendChild(divNode);
}




// secondry-color 




$('.theme-element2[data-position="colpick2"] .color-picker2').on("click", function (e) {
  e.preventDefault();
});

$(document).ready(function () {
  $('.theme-element2[data-position="colpick2"] .color-picker2').colpick({
    layout: "hex",
    onChange: function (hsb, hex, rgb, el, bySetColor) {
      $(el).val("#" + hex);
    }
  });

  var themeStyle = init();

  if (themeStyle) {
    var cssRules = themeStyle.cssRules;

    $(".color-picker2").colpick({
      layout: "hex",
      onChange: function (hsb, hex, rgb, el, bySetColor) {
        $(el).val("#" + hex);
        $(el).trigger("change");
      }
    })
      .each(function (i, e) {
        $(e).on("change", function () {
          var selectedColor = $(this).val();
          $("#clr2").val(selectedColor);
        });
      });
  }
});

function selectclr2() {
  if (document.getElementById("theme-color2") !== null) {
    $("#theme-color2").remove();
  }
  var color = $(".color-picker2").val();

  var divNode = document.createElement("div");
  divNode.id = "theme-color2";
  //divNode.innerHTML = "<style>a:hover, .cart .product a:hover, .data-table .product a:hover, .data-table .info a:hover, .cart .product .edit-item a, .cart td.subtotal .discount, .cart td.subtotal .discount-additional-info, .eu-cookie-bar-notification a, .header-links a:hover, .footer-tax-shipping a, .footer-powered-by a, .footer-design-by a, .block .list .active > a, .block .list a:hover, .block .view-all a, .block .tags li a:hover, .product-tags-all-page li a:hover, .breadcrumb a:hover, .product-filter .group li a:hover, .filtered-items .item, .item-box .product-title a:hover, .item-box .tax-shipping-info a, .manufacturer-grid .title a:hover, .vendor-grid .title a:hover, .product-review-links a:hover, .overview .value a, .variant-overview .value a, .overview .button-2:hover, .variant-overview .button-2:hover, .overview .tax-shipping-info a, .variant-overview .tax-shipping-info a, .variant-overview .variant-name, .ui-datepicker-calendar .ui-state-active, .product-reviews-page h1 a, .product-review-item .review-info a, .product-review-helpfulness .vote, .wishlist-content .tax-shipping-info a, .wishlist-page .share-info a:hover, .compare-products-table .remove-button:hover, .email-a-friend-page .title h2, .apply-vendor-page .terms-of-service span, .apply-vendor-page .terms-of-service a, .inputs.accept-consent span, .inputs.accept-consent a, .return-request-page h1 a, .login-page .returning-wrapper .inputs.reversed a:hover, .external-auth-association a, .add-more-external-records a, .address-list-page .button-2:hover, .order-list-page .button-2:hover, .return-request-list-page a, .order-progress li.active-step a, .shopping-cart-page .checkout-attributes a, .shopping-cart-page .tax-shipping-info a, .cart-total .order-total, .terms-of-service a, .order-completed .details a, .opc .back-link a:hover, .order-details-page .order-overview .order-total strong, .order-details-page .download a, .sitemap-page .entity a:hover, .post-date, .news-date, .blog-page .tags a, .blogpost-page .tags a, .comment-info a.username:hover, .forum-search-box .advanced a:hover, .forums-table-section-title a:hover, .forums-table-section .forum-title a:hover, .forums-table-section .topic-title a:hover, .topic-post a.username:hover, .topic-post .post-actions .edit-post-button:hover, .topic-post .post-actions .delete-post-button:hover, .topic-post .post-actions .post-link-button, .private-message-send-page a, .ui-tabs-nav li.ui-state-active a, .private-messages-page td.subject a.pm-unread, .latest-posts .topic-title a:hover, .menu-toggle i, .shipment-details-page .tracking-number .tracking-url, .header-menu > ul > li > a:hover, h1 span, .mini-shopping-cart .name a:hover, .html-account-page .block .list a.active, .html-checkout-page .selected-checkout-attributes, .contact-page .contact-right ul li .contact-icon em, .sitemap_page .entity-title h2, .order-completed .details a, .follow-us .social li a:hover, .follow-us .social a:hover i, .header-menu > ul > li > a:hover, .header-menu ul li:hover > a, .header-menu ul li:hover > .sublist-toggle, .administration:hover, .category-m .category-wrapper:after, .category-m .category-wrapper:before, .poduct-no-reviews a:hover, a.tablinks.active-tab, .html-shopping-cart-page .cart td.subtotal h2, .html-shopping-cart-page .data-table td.total h2, .sitemap_page ul li a:hover, .contact-page .contact-right ul li .contact-icon h6 , .theme-color {color: " + color + " !important ;} .bs_home_feature_product_section,.bs_best_sellers.slick-prev,.bs_best_sellers.slick-next,.bs_news_home_main_left:before,.bs_home_category_item.title,.bs_category_home_main.slick-prev,.bs_category_home_main.slick-next,.bs_title_white h3:after,.bs_item_box_buttons.product-box-add-to-cart-button,.bs_item_box_buttons.add-to-wishlist-button,.bs_title_black h3:before,.bs_news_item.bs_news_date_day,.bs_blog_post.bs_blogs_date_day,.bs_primary_button:hover,.button-1:hover,.bs_secondary_button,.button-2,.bs_poll_main,.bs_primary_button:hover,.bs_poll:nth-of-type(even).bs_poll_options li.answer,.bs_newsletter-subscribe-button,.footer-block.follow-us.networks li,.bs_title_black h4:before,.bs_sub_category_item.title,.product-selectors.product-viewmode a.selected,.bs_title_white.title_bg_black h4::after,.bs_reg_login_section::before,.address-list.section.address-item.bs_edit_remove_buttons,.bs_product_name_breadcrumb,.jCarouselMainWrapper.slick-prev,.jCarouselMainWrapper.slick-next,.product-review-item.review-info,.order-item.bs_order_number,.html-account-page.block.list a:hover,.html-account-page.block.list.active > a,.bs_news_comment:nth-child(even),.bs_contactus_icon,.bs_email_icon,.bs_return_icon,.bs_search_icon,.bs_request_item.title,.slinky-theme-default,.ui-state-active,.ui-widget-content.ui-state-active,.ui-widget-header.ui-state-active,a.ui-button:active,.ui-button:active,.ui-button.ui-state-active:hover,.bs_service_box.l-icon,.footer,.bs_item_box_buttons.add-to-compare-list-button,.header-links a.ico-cart.cart-qty,.cart td,.data-table td,.forum-table td,.ui-dialog-content.back-in-stock-subscription-page.button-1,.header-links a.ico-wishlist.wishlist-qty,.newsletter-subscribe-button,.block.title,.block.view-all a:hover,.product-selectors > div,.pager li span,.pager li a: hover,.overview.bs_add_to_cart_button,.variant-overview.bs_add_to_cart_button,.ui-datepicker-header,.tooltip-container.tooltip-header,.write-review,.write-review.button-1,.wishlist-content.update-wishlist-button,.wishlist-content.wishlist-add-to-cart-button,.enter-password-form input[type='submit'],#check-availability-button:hover,.login-page.new-wrapper.text,.login-page.returning-wrapper.form-fields,.login-page.returning-wrapper.buttons,.order-progress,.cart-footer.totals,.cart-footer.checkout-button,.apply-shipping-button,.opc.allow.step-title,.opc.allow.step-title.number,.order-details-page.repost.button-2,.user-agreement-page.button-1,.order-details-page.total-info,.forums-table-section.view-all a,.forum-edit-page.buttons.button-1,.move-topic-page.buttons.button-1,.private-messages.buttons.button-1,.ui-tabs-nav li.ui-state-active a,.menu-toggle,.mini-shopping-cart input[type='button'],.login-page.new-wrapper,.login-page.returning - wrapper,.skltbs-theme-light.skltbs-tab.skltbs-active:focus,.skltbs-theme-light.skltbs-tab.skltbs-active:hover,.skltbs-theme-light.skltbs-tab.skltbs-active,.admin-header-links,.forums-table-section.view-all a:hover,.topic-post.pm-button,.profile-info-box.pm-button,.header-links a.ico-inbox.inbox-unread{background-color:" + color + " !important;} .ui-dialog-content .back-in-stock-subscription-page .button-1:hover, .eu-cookie-bar-notification button:hover, .contact-vendor .button-2:hover, .item-box .product-box-add-to-cart-button:hover, .compare-products-page .clear-list:hover, .apply-vendor-page .button-1:hover, .shopping-cart-page .common-buttons input:first-child:hover, .opc .allow .step-title .number, .order-details-page .repost .button-2:hover, .user-agreement-page .button-1:hover, .forums-table-section .view-all a:hover, .forum-edit-page .buttons .button-1:hover, .move-topic-page .buttons .button-1:hover, .private-messages .buttons .button-1:hover{background-color: " + color + " !important;filter:brightness(0.93);} .addthis_toolbox a:hover .at-icon-wrapper .at-icon {fill: " + color + ";} .header-lower, a.tablinks.active-tab, .btn-outline, .header-tools .logo-menu-part > .container, .active-step a:before,.overview .add-to-cart-button,.variant-overview .add-to-cart-button, .wishlist-content .update-wishlist-button,.wishlist-content .wishlist-add-to-cart-button, .registration-page .button-1,.registration-result-page .button-1,.login-page .button-1,.password-recovery-page .button-1,.account-page .button-1,.return-request-page .button-1, .compare-products-page .clear-list, .search-input .button-1, .blog-posts .buttons .read-more,.news-items .buttons .read-more, .checkout-page .button-1, .order-details-page .actions input:first-child,.order-details-page .page-title a.print-order-button, .write-review .button-1, .new-comment .button-1, .apply-vendor-page .button-1, .email-a-friend-page .button-1, .news-list-homepage .view-all a, .btn-solid, .category-m .category-wrapper .btn, .cart-footer .checkout-button , .theme-border {border-color: " + color+ " !important;} .ui-datepicker-calendar .ui-state-active {outline-color:" + color + " !important;} .overview .add-to-cart-button,.variant-overview .add-to-cart-button, .wishlist-content .update-wishlist-button,.wishlist-content .wishlist-add-to-cart-button, .registration-page .button-1,.registration-result-page .button-1,.login-page .button-1,.password-recovery-page .button-1,.account-page .button-1,.return-request-page .button-1, .compare-products-page .clear-list, .search-input .button-1, .blog-posts .buttons .read-more,.news-items .buttons .read-more, .checkout-page .button-1, .order-details-page .actions input:first-child,.order-details-page .page-title a.print-order-button, .write-review .button-1, .new-comment .button-1, .apply-vendor-page .button-1, .email-a-friend-page .button-1, .news-list-homepage .view-all a, .btn-solid, .category-m .category-wrapper .btn, .cart-footer .checkout-button, .cart-footer .checkout-button:hover, .checkout-page .button-1:hover, .contact-page .button-1:hover, .write-review .button-1:hover, .email-a-friend-page .button-1:hover, .new-comment .button-1:hover{background-image: linear-gradient(30deg, " + color + " 50%, transparent 50%) !important;} .contact-page .button-1:hover{background: " + color + " !important;}</style > ";
  var newCss = "<style>";
  newCss = newCss + ".bs_home_feature_product_section,.bs_best_sellers .slick-prev,.bs_best_sellers " +
    ".slick-next,.bs_news_home_main_left:before,.bs_home_category_item.title,.bs_category_home_main .slick-prev,.bs_category_home_main " +
    ".slick-next,.bs_title_white h3:after,.bs_item_box_buttons.product-box-add-to-cart-button,.bs_item_box_buttons.add-to-wishlist-button,h3:before,.bs_news_item.bs_news_date_day,.bs_blog_post.bs_blogs_date_day,.bs_primary_button:hover,.button-1:hover,.bs_secondary_button,.button-2,.bs_poll_main,.bs_newsletter-subscribe-button,.footer-block.follow-us.networks li,.bs_title_black h4:before,.bs_sub_category_item.title,.product-selectors.product-viewmode a.selected,.bs_title_white.title_bg_black h4:after,.bs_reg_login_section:before,.address-list.section.address-item.bs_edit_remove_buttons,.bs_product_name_breadcrumb,.jCarouselMainWrapper .slick-prev,.jCarouselMainWrapper.slick-next,.product-review-item.review-info,.order-item.bs_order_number,.html-account-page.block.list a:hover,.html-account-page.block.list.active > a,.bs_contactus_icon,.bs_email_icon,.bs_return_icon,.bs_search_icon,.bs_request_item.title,.slinky-menu,.ui-state-active,.ui-widget-content.ui-state-active,.ui-widget-header.ui-state-active,a.ui-button:active,.ui-button:active,.ui-button.ui-state-active:hover,.bs_service_box.l-icon,.footer,.bs_item_box_buttons.add-to-compare-list-button,.header-links a.ico-cart.cart-qty,.cart td,.data-table td,.forum-table td,.ui-dialog-content.back-in-stock-subscription-page.button-1,.header-links a.ico-wishlist.wishlist-qty,.newsletter-subscribe-button,.block.title,.block.view-all a:hover,.product-selectors > div,.pager li span,.pager li a: hover,.overview.bs_add_to_cart_button,.variant-overview.bs_add_to_cart_button,.ui-datepicker-header,.tooltip-container.tooltip-header,.write-review,.write-review.button-1,.wishlist-content.update-wishlist-button,.wishlist-content.wishlist-add-to-cart-button,.check-username-availability-button:hover,.login-page.new-wrapper.text,.login-page.returning-wrapper.form-fields,.login-page.returning-wrapper.buttons,.order-progress,.cart-footer.totals,.cart-footer.checkout-button,.apply-shipping-button,.opc.allow.step-title,.opc.allow.step-title.number,.order-details-page.repost.button-2,.user-agreement-page.button-1,.order-details-page.total-info,.forums-table-section.view-all a,.forum-edit-page.buttons.button-1,.move-topic-page.buttons.button-1,.private-messages.buttons.button-1,.ui-tabs-nav li.ui-state-active a,.menu-toggle,.login-page.new-wrapper,.login-page.returning-wrapper,.skltbs-theme-light.skltbs-tab.skltbs-active:focus,.skltbs-theme-light.skltbs-tab.skltbs-active:hover,.skltbs-theme-light.skltbs-tab.skltbs-active,.admin-header-links,.forums-table-section.view-all a:hover,.topic-post.pm-button,.profile-info-box.pm-button,.header-links a.ico-inbox.inbox-unread{background-color:" + color + "!important;}";
  newCss = newCss + "";
  newCss = newCss + "";
  // divNode.innerHTML = newCss;

  var color1 = `
section.bs_service_section,
.bs_home_news_section,
.bs_title_black h3:after,
.bs_poll_main::before,
.bs_poll_main::after,
.bs_poll:nth-of-type(even),
.bs_footer_subscribe_box,
.footer-block.follow-us,
.bs_title_black h4:after,
.category-grid.sub-category-grid,
.login-page,
.bs_title_white h4:after,
.registration-page,
.address-list .section.address-item,
.bs_procuct_each_attribute .bs_product_attrubute_value .select-wrapper select,
.bs_checkout_each_attribute .bs_checkout_attrubute_value .select-wrapper select,
.bs_product_attrubute_value .bs_text_input input, .bs_checkout_attrubute_value .bs_text_input input,
.bs_product_attrubute_value .bs_text_input textarea, .bs_checkout_attrubute_value .bs_text_input textarea,
.bs_product_attrubute_value .bs_date_picker .date-picker-wrapper select,
.bs_checkout_attrubute_value .bs_date_picker .date-picker-wrapper select,
.bs_rental_attributes.rental-attributes .attribute-item .attribute-data input,
.related-products-grid.bs_related_product_section,
.product-reviews-page,
.wishlist-page, .shopping-cart-page,
div#checkout-step-confirm-order,
.order-details-page,
.bs_news_comment:nth-child(odd),
.page.return-request-page,
.bs_search_box_main,
.shipment-details-page,
.login-page .topic-block .bs_title_black.title_bg_white h3::after,
.bs_authentication_enable,
.bs_authentication_providers,
.forum-edit-page .form-fields,
.forum-search-page .form-fields,
.private-message-send-page .form-fields,
.header-upper,
.pager li a,
.pager li span,
.overview .bs_add_to_cart_button:hover,
.variant-overview .bs_add_to_cart_button:hover,
.product-review-item,
.order-review-data > div,
.order-details-area > div,
.shipment-details-area > div,
.opc .step-title,
.sitemap-page .entity-body,
.side-2,
.header-menu .sublist li:hover > a,
.forums-header,
.topic-post .post-head,
.topic-post .username,
.topic-post .post-time,
.overview,
.skltbs-theme-light .skltbs-tab,
.gdpr-tools-page form .form-fields,
.bs_category_product_list .item-box .bs_item_box_buttons {
  background-color: ${color};
}`;

  var color2 = `
@media only screen and (max-width: 1024px) {
  #mySidenav,
  .login-page .returning-wrapper ,.bs_read_icon{
    background-color: ${color};
  }
  .footer-block .title,
  .bs_footer_link .footer-block .list li a:hover,
  .bs_footer_link .footer-block .list,
  .bs_footer_link .footer-block .list li a{
    color: ${color};
  }
}`;


  divNode.innerHTML = "<style>" + color1 + color2 + "</style>";

  document.head.appendChild(divNode);
}
