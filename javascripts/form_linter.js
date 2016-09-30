
/*
Stand-alone JS, not a module.  To add to a test session, create a browser
bookmarklet with the following address:
javascript:$('body').append('<script class="linter" src="js/spec/form/form_linter.js"></script>');

alternately, paste this into the developer console:
$('body').append('<script class="linter" src="js/spec/form/form_linter.js"></script>');
 */

(function() {
  var FormLinter,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  FormLinter = (function() {
    var $body;

    $body = $('body');

    FormLinter.start = function() {
      if (window.linter != null) {
        return linter.help();
      }
      return new FormLinter();
    };

    function FormLinter() {
      this.lintExit = bind(this.lintExit, this);
      this.lintView = bind(this.lintView, this);
      this.lintItem = bind(this.lintItem, this);
      this.lintForm = bind(this.lintForm, this);
      if (typeof App === "undefined" || App === null) {
        _.defer((function(_this) {
          return function() {
            _this.stop(true);
            return alert("Please activate the linter after you have logged in.");
          };
        })(this));
        return false;
      }
      this._addMarkup();
      console.clear();
      setTimeout(this.help, 0);
    }

    FormLinter.prototype.help = function() {
      return console.info("%c/**************************************************************************************************/\n/ Form Linter is active! To quit, type \"linter.stop()\" in the console.  To see this message again, /\n/ type \"linter.help()\" in the console.                                                             /\n/ For best results, log in with credentials which grant you some kind of audio accommodation.      /\n/**************************************************************************************************/", "background-color: #060; color:white; border-radius: 6px");
    };

    FormLinter.prototype.item = function() {
      var item;
      item = App.getCurrentItem();
      if (item != null) {
        return console.info("Current item is " + item.id);
      } else {
        return console.warn("I don't see an item.");
      }
    };

    FormLinter.prototype.stop = function(silent) {
      if (silent == null) {
        silent = false;
      }
      delete window['linter'];
      $('.linter').remove();
      this._listeners(false);
      if (!silent) {
        return console.info("Form Linter stopped.  Goodbye!");
      }
    };

    FormLinter.prototype._removeListeners = function() {
      return console.warn("Do Something");
    };

    FormLinter.prototype._addMarkup = function() {
      this._addCss();
      this._addMenu();
      return this._listeners(true);
    };

    FormLinter.prototype._listeners = function(shouldListen) {
      var fn;
      fn = shouldListen ? 'on' : 'off';
      return ['lintUser', 'lintForm', 'lintView', 'lintExit'].forEach((function(_this) {
        return function(btn) {
          return $("#linterMenu ." + btn)[fn]('click', _this[btn]);
        };
      })(this));
    };

    FormLinter.prototype.audioType = function() {
      return this.userType = !_.isEmpty(App.get('audioConfiguration')) ? App.get('audioConfiguration').configType : 'none';
    };

    FormLinter.prototype.lintUser = function() {
      var accommodationStrings;
      if (App.get('studentProfile') == null) {
        return;
      }
      accommodationStrings = _.keys(App.get('studentProfile').get('accommodations'));
      console.info('Student profile has the following accommodation strings', accommodationStrings);
      if (!_.isEmpty(App.get('audioConfiguration'))) {
        return console.info("Student is a " + (App.get('audioConfiguration').configType) + " user with these settings:", App.get('audioConfiguration'));
      }
    };

    FormLinter.prototype.lintForm = function() {
      this._passageExistenceCheck();
      return console.info("%cForm checks out... more TBD", "color: #999");
    };

    FormLinter.prototype.lintItem = function() {
      var ref, ref1;
      this._itemContainsCorrectAudioType();
      return console.log((ref = App.getCurrentItem()) != null ? (ref1 = ref.get('itemImage')) != null ? ref1.audioProperties : void 0 : void 0);
    };

    FormLinter.prototype._itemContainsCorrectAudioType = function() {};

    FormLinter.prototype._passageExistenceCheck = function() {
      var passageIds, pids;
      pids = _.filter(App.get('itemCollection').pluck('passageid'), function(p) {
        return p != null;
      });
      passageIds = _.filter(pids, function(p) {
        return App.get('passageCollection').get(p) == null;
      });
      if (passageIds.length > 0) {
        return console.error("The following passage(s) were referenced in the items, but don't exist in the passage collection:", passageIds);
      }
    };

    FormLinter.prototype.lintView = function() {
      var playRequest;
      playRequest = this._populatePlayRequest(App.get('currentView'));
      console.log("Playing audio on this page would look like this:", playRequest);
      return this._inspectPlayRequest(playRequest);
    };

    FormLinter.prototype._inspectPlayRequest = function(pr) {
      var mp3s, ref, ref1, ref2;
      console.groupCollapsed("%cPlay request analysis (click to inspect)", "color: #009");
      mp3s = [];
      if (pr.staticPage != null) {
        mp3s = this._getMP3s(pr.staticPage.tokens);
        this._inspectPRpart(mp3s, "Static content");
      } else {
        this._inspectPRpart(this._getMP3s((ref = pr.passage) != null ? ref.tokens : void 0), 'Passage');
        this._inspectPRpart(this._getMP3s((ref1 = pr.prompt) != null ? ref1.tokens : void 0), 'Prompt');
        if (pr.item_options != null) {
          console.groupCollapsed("Options");
          pr.item_options.forEach((function(_this) {
            return function(option) {
              return _this._inspectPRpart(_this._getMP3s(option.tokens), "Option \"" + option.letter + "\"");
            };
          })(this));
          console.groupEnd();
        }
        this._inspectPRpart(this._getMP3s((ref2 = pr.scoregroup) != null ? ref2.tokens : void 0), 'Scoregroup');
      }
      return console.groupEnd();
    };

    FormLinter.prototype._inspectPRpart = function(mp3s, label) {
      if (label == null) {
        label = "";
      }
      if (mp3s == null) {
        return;
      }
      console.group(label);
      if (mp3s.length === 0) {
        console.warn("No audio resources are indicated for this part!");
      } else if (!mp3s.hasTokens) {
        console.info("This part has starting points, but no tokens suitable for highlighting.");
      }
      mp3s.forEach(function(src) {
        return console.info(src);
      });
      return console.groupEnd();
    };

    FormLinter.prototype._getMP3s = function($tokens) {
      var $startpoints, mediaIds;
      if ($tokens == null) {
        return;
      }
      $startpoints = $tokens.filter('.drc_voice_startpt[data-ttsindex=0]');
      mediaIds = _.map($startpoints, function(sp) {
        var blob, mediaId;
        mediaId = sp.dataset['mediaId'];
        blob = App.get('blobCollection').get(mediaId);
        return {
          'mediaId': mediaId,
          'a.drc_voice_startpt': sp,
          'mediaSrc': blob != null ? blob.get('src') : void 0,
          'isDownloaded': blob != null ? blob.has('blobURL') : void 0,
          'isHVA': blob != null ? blob.has('hva') : void 0,
          'isTTS': blob != null ? blob.has('tts') : void 0,
          'isVIA': blob != null ? blob.has('via') : void 0
        };
      });
      mediaIds.hasTokens = $startpoints.length < $tokens.length;
      return mediaIds;
    };

    FormLinter.prototype._populatePlayRequest = function(parent) {
      var pr, ref, vid, view;
      pr = new Backbone.Model({
        event: "play",
        type: "PAGE_CONTENT"
      });
      parent.trigger('tts:populatePlayRequest', pr);
      ref = parent.subviews;
      for (vid in ref) {
        view = ref[vid];
        view.trigger('tts:populatePlayRequest', pr);
      }
      return pr;
    };

    FormLinter.prototype.lintExit = function() {
      return this.stop();
    };

    FormLinter.prototype._addMenu = function() {
      var menu;
      menu = "<div class=\"linter\" id=\"linterMenu\">\n<button class=\"lintUser\">This User</button>\n<button class=\"lintForm\">This Form</button>\n<button class=\"lintView\">This Page</button>\n<button class=\"lintExit\">(exit)</button>\n</div>";
      return $body.append(menu);
    };

    FormLinter.prototype._addCss = function() {
      var styles;
      styles = "<style class=\"linter\" id=\"linterStyle\">\n#linterMenu {\n  position: absolute;\n  top: 5px;\n  left: 5px;\n}\n#linterMenu button {\n  margin: 4px;\n  width: 70px;\n  display: block;\n  border: 1px #ccc outset;\n  padding: 4px;\n  border-radius: 6px;\n  outline: none;\n  cursor: help;\n  color: #fff /* buttontext */;\n  background-color: #090;\n  border-color: buttonface;\n}\n#linterMenu button:active {\n  background-color: #ccc;\n  border: 1px #666 inset;\n}\n</style>";
      return $body.append(styles);
    };

    return FormLinter;

  })();

  window.linter = FormLinter.start();

}).call(this);
