/*
 * majaX
 *
 * Copyright 2013, Simon Waldherr - http://simon.waldherr.eu/
 * Released under the MIT Licence
 * http://simon.waldherr.eu/license/mit/
 *
 * Github:  https://github.com/simonwaldherr/majaX.js/
 * Version: 0.2.6
 */

/*jslint browser: true, white: true, indent: 2, bitwise: true, regexp: true */
/*global ActiveXObject, window */
/*exported majaX */

var majaX, majax;

majaX = function (data, successcallback, errorcallback) {
  "use strict";
  var url, method, port, type, typed, header, faildata, ajax, ajaxTimeout, mimes, mimetype, senddata, sendkeys, sendstring, regex,
    urlparts = {},
    i = 0;
  if (data.url === undefined) {
    return false;
  }

  regex = /((http[s]?:\/\/)?([\.:\/?&]+)?([^\.:\/?&]+)?)/gm;
  urlparts.regex = data.url.match(regex);
  urlparts.clean = {
    'protocol': '',
    'domain': '',
    'port': '',
    'path': '',
    'fileextension': '',
    'query': ''
  };

  for (i = 0; i < urlparts.regex.length; i += 1) {
    if (majax.countChars(urlparts.regex[i], '://') === 1) {
      urlparts.clean.protocol = urlparts.regex[i] === undefined ? false : urlparts.regex[i].split('://')[0];
      urlparts.clean.domain = urlparts.regex[i] === undefined ? false : urlparts.regex[i].split('://')[1];
    } else if ((majax.countChars(urlparts.regex[i], '/') === 0) && (majax.countChars(urlparts.regex[i], ':') === 0) && (urlparts.clean.path === '')) {
      urlparts.clean.domain += urlparts.regex[i] === undefined ? false : urlparts.regex[i];
    } else if ((majax.countChars(urlparts.regex[i], ':') === 1) && (urlparts.clean.path === '')) {
      urlparts.clean.port = urlparts.regex[i] === undefined ? false : urlparts.regex[i].split(':')[1];
    } else if ((majax.countChars(urlparts.regex[i], '?') === 0) && (majax.countChars(urlparts.regex[i], '&') === 0) && (urlparts.clean.query === '')) {
      urlparts.clean.path += urlparts.regex[i] === undefined ? false : urlparts.regex[i];
    } else {
      urlparts.clean.query += urlparts.regex[i] === undefined ? false : urlparts.regex[i];
    }
  }
  if (urlparts.clean.path.indexOf(".") !== -1) {
    urlparts.clean.fileextension = urlparts.clean.path.split('.')[urlparts.clean.path.split('.').length - 1];
  }
  mimes = {
    'txt'  : 'text/plain',
    'json' : 'application/json',
    'atom' : 'application/atom+xml',
    'rss'  : 'application/rss+xml',
    'soap' : 'application/soap+xml',
    'xml'  : 'application/xml',
    'svg'  : 'image/svg+xml',
    'css'  : 'text/css',
    'csv'  : 'text/csv',
    'html' : 'text/html',
    'vcf'  : 'text/vcard',
    'gif'  : 'image/gif',
    'jpeg' : 'image/jpeg',
    'jpg'  : 'image/jpeg',
    'png'  : 'image/png',
    'tiff' : 'image/tiff',
    'mp3'  : 'audio/mpeg',
    'mp4'  : 'video/mpeg',
    'mpeg' : 'video/mpeg',
    'mpg'  : 'video/mpeg',
    'm4a'  : 'audio/mp4',
    'ogg'  : 'audio/ogg',
    'oga'  : 'audio/ogg',
    'webma': 'audio/webm',
    'wav'  : 'audio/wav'
  };

  url      = data.url === undefined ? false : data.url;
  method   = data.method === undefined ? 'GET' : data.method.toUpperCase();
  port     = data.port === undefined ? urlparts.clean.port === undefined ? '80' : urlparts.clean.port : data.port;
  typed    = data.type === undefined ? urlparts.clean.fileextension === undefined ? 1 : 2 : 3;
  typed    = data.mimetype === undefined ? typed : 4;
  type     = data.type === undefined ? urlparts.clean.fileextension === undefined ? 'txt' : urlparts.clean.fileextension.toLowerCase() : data.type.toLowerCase();
  mimetype = data.mimetype === undefined ? mimes[urlparts.clean.fileextension] === undefined ? mimes[type] === undefined ? 'text/plain' : mimes[type] : mimes[urlparts.clean.fileextension] : data.mimetype;
  senddata = data.data === undefined ? false : data.data;
  faildata = data.faildata === undefined ? false : data.faildata;
  header   = data.header === undefined ? {} : data.header;
  successcallback = data.success !== undefined ? data.success : successcallback;
  errorcallback   = data.error !== undefined ? data.error : errorcallback;

  if (header['Content-type'] === undefined) {
    header['Content-type'] = 'application/x-www-form-urlencoded';
  }
  if (method === 'DEBUG') {
    return {
      "url"      : url,
      "urlparts" : urlparts.clean,
      "port"     : port,
      "type"     : type,
      "mime"     : mimetype,
      "data"     : data
    };
  }
  ajax = (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : (XMLHttpRequest && new XMLHttpRequest()) || null;
  ajaxTimeout = window.setTimeout(function () {
    ajax.abort();
  }, 6000);
  ajax.onreadystatechange = function () {
    var jsoncontent, status;
    if (ajax.readyState === 4) {
      status = ajax.status.toString().charAt(0);
      clearTimeout(ajaxTimeout);
      ajax.headersObject = majax.getRespHeaders(ajax.getAllResponseHeaders());
      if ((status !== '2') && (status !== '3')) {
        errorcallback(faildata, ajax);
      } else {
        if (method === 'API') {
          if (urlparts.clean.domain === 'github.com') {
            jsoncontent = JSON.parse(ajax.responseText);
            if (jsoncontent.content !== undefined) {
              jsoncontent.content = majax.base64_decode(jsoncontent.content.replace(/\n/gmi, ''));
              successcallback(jsoncontent, ajax);
            } else {
              successcallback(JSON.parse(ajax.responseText), ajax);
            }
          }
        } else if (method === 'HEAD') {
          successcallback(ajax.responseText, ajax);
        } else {
          if (typed < 3) {
            mimetype = ajax.headersObject['Content-Type'];
          }
          if (mimetype.indexOf('json') !== -1) {
            successcallback(JSON.parse(ajax.responseText), ajax);
          } else if (mimetype.indexOf('xml') !== -1) {
            successcallback(majax.getXMLasObject(ajax.responseText), ajax);
          } else if (mimetype.indexOf('csv') !== -1) {
            successcallback(majax.getCSVasArray(ajax.responseText), ajax);
          } else if ((mimetype.indexOf('image') !== -1) || (mimetype.indexOf('video') !== -1) || (mimetype.indexOf('audio') !== -1) || (mimetype.indexOf('user-defined') !== -1)) {
            successcallback(ajax.response, ajax);
          } else {
            successcallback(ajax.responseText, ajax);
          }
        }
      }
    }
  };
  i = 0;
  sendstring = '';
  if (senddata !== false) {
    for (sendkeys in senddata) {
      if (typeof senddata[sendkeys] === 'string') {
        if (i !== 0) {
          sendstring += '&';
        }
        sendstring += sendkeys + '=' + senddata[sendkeys];
        i += 1;
      }
    }
  }
  if (method === 'API') {
    if (urlparts.clean.domain === 'github.com') {
      mimetype = 'json';
      if (urlparts.clean.path.split('/')[2] === undefined) {
        ajax.open('GET', 'https://api.github.com/users/' + urlparts.clean.path.split('/')[1] + '/repos', true);
        majax.setReqHeaders(ajax, header);
        ajax.send();
      } else if (urlparts.clean.path.split('/')[3] === undefined) {
        ajax.open('GET', 'https://api.github.com/repos/' + urlparts.clean.path.split('/')[1] + '/' + urlparts.clean.path.split('/')[2] + '/contents/', true);
        majax.setReqHeaders(ajax, header);
        ajax.send();
      } else {
        ajax.open('GET', 'https://api.github.com/repos/' + urlparts.clean.path.split('/')[1] + '/' + urlparts.clean.path.split('/')[2] + '/contents/' + urlparts.clean.path.split('/', 4)[3], true);
        majax.setReqHeaders(ajax, header);
        ajax.send();
      }
    }
  } else {
    if (method !== 'POST') {
      if (sendstring !== '') {
        if (urlparts.clean.query !== '') {
          url = url + '&' + sendstring;
        } else {
          url = url + '?' + sendstring;
        }
      }
    }

    if (method === 'GET') {
      ajax.open('GET', url, true);
      majax.overrideMime(ajax, mimetype);
      majax.setReqHeaders(ajax, header);
      ajax.send();
    } else if (method === 'POST') {
      ajax.open('POST', url, true);
      majax.overrideMime(ajax, mimetype);
      majax.setReqHeaders(ajax, header);
      ajax.send(sendstring);
    } else {
      if (method === 'HEAD') {
        mimetype = 'none';
      }
      ajax.open(method, url, true);
      majax.overrideMime(ajax, mimetype);
      majax.setReqHeaders(ajax, header);
      ajax.send();
    }
  }
};

majax = {
  setReqHeaders: function (ajax, headerObject) {
    "use strict";
    var key;
    if (headerObject !== false) {
      if (typeof headerObject === 'object') {
        for (key in headerObject) {
          if (typeof headerObject[key] === 'string') {
            ajax.setRequestHeader(key, headerObject[key]);
          }
        }
      }
    }
  },
  getRespHeaders: function (headerString) {
    "use strict";
    var i, string, header, headerObject = {};
    if (typeof headerString === 'string') {
      string = headerString.split(/\n/);
      for (i = 0; i < string.length; i += 1) {
        if (typeof string[i] === 'string') {
          header = string[i].split(': ');
          if ((header[0].length > 3) && (header[1].length > 3)) {
            headerObject[header[0].trim()] = header[1].trim();
          }
        }
      }
    }
    return headerObject;
  },
  overrideMime: function (ajax, mimetype) {
    "use strict";
    if (mimetype === 'application/xml') {
      ajax.overrideMimeType(mimetype);
      ajax.responseType = '';
    } else if ((mimetype.indexOf('image') !== -1) || (mimetype.indexOf('video') !== -1) || (mimetype.indexOf('audio') !== -1)) {
      ajax.overrideMimeType("text/plain; charset=x-user-defined");
      ajax.responseType = 'arraybuffer';
    }
  },
  countChars: function (string, split) {
    "use strict";
    string = string.split(split);
    if (typeof string === 'object') {
      return string.length - 1;
    }
    return 0;
  },
  getText: function (string) {
    "use strict";
    var re = /<([^<>]*)>([^\/]*)<(\/[^<>]*)>/gmi;
    if (typeof string === 'string') {
      return string.replace(re, '');
    }
  },
  getXMLasObject: function (xmlstring) {
    "use strict";
    var xmlroot, foo = {};
    if (typeof xmlstring === 'object') {
      return majax.returnChilds(foo, xmlstring, 1);
    }
    xmlroot = document.createElement('div');
    xmlroot.innerHTML = xmlstring;
    return majax.returnChilds(foo, xmlroot, 1);
  },
  returnChilds: function (element, node, deep) {
    "use strict";
    var i, ii, obj, key, plaintext, returnArray = [],
      childs = node.childNodes.length;
    ii = 0;
    for (i = 0; i < childs; i += 1) {
      if (node.childNodes[i].localName !== null) {
        element[ii] = {};
        for (key in node.childNodes[i]) {
          if (node.childNodes[i][key] !== undefined) {
            if ((typeof node.childNodes[i][key] === 'string') || (typeof node.childNodes[i][key] === 'number')) {
              obj = node.childNodes[i][key];
              if ((key !== 'accessKey') && (key !== 'baseURI') && (key !== 'className') && (key !== 'contentEditable') && (key !== 'dir') && (key !== 'namespaceURI') && (obj !== "") && (key !== key.toUpperCase()) && (obj !== 0) && (key !== 'childs') && (key !== 'textContent') && (key !== 'nodeType') && (key !== 'tabIndex') && (key !== 'innerHTML') && (key !== 'outerHTML')) {
                element[ii][key] = obj;
              } else if ((key === 'innerHTML') || (key === 'outerHTML')) {
                element[ii][key] = majax.escapeHtmlEntities(obj);
              }
            }
          }
        }
        if (node.childNodes[i].innerHTML !== undefined) {
          plaintext = majax.getText(node.childNodes[i].innerHTML).trim();
          if (plaintext !== "") {
            element[ii].textContent = plaintext;
          }
          if (node.childNodes[i].childNodes.length > 1) {
            element[ii].childs = majax.returnChilds(returnArray, node.childNodes[i], deep + 1);
          }
          ii += 1;
        }
      }
    }
    return element;
  },
  isEmpty: function (obj) {
    "use strict";
    var emptyObj = {}, emptyArr = [];
    if ((obj === emptyObj) || (obj === emptyArr) || (obj === null) || (obj === undefined)) {
      return true;
    }
    return false;
  },
  cleanArray: function (actual) {
    "use strict";
    var newArray = [],
      clean,
      i = 0;
    for (i = 0; i < actual.length; i += 1) {
      if ((typeof actual[i] === 'string') || (typeof actual[i] === 'number')) {
        newArray.push(actual[i]);
      } else if (typeof actual[i] === 'object') {
        clean = majax.cleanArray(actual[i]);
        if (clean[0] !== '') {
          newArray.push(majax.cleanArray(actual[i]));
        }
      }
    }
    return newArray;
  },
  cleanObject: function (actual) {
    "use strict";
    var newArray = {}, key;
    for (key in actual) {
      if (actual[key] !== undefined) {
        if ((typeof actual[key] !== 'object') && (typeof actual[key] !== 'function') && (typeof actual[key] !== '') && (!majax.isEmpty(actual[key]))) {
          newArray[key] = actual[key];
        } else if (typeof actual[key] === 'object') {
          if ((!majax.isEmpty(majax.cleanObject(actual[key]))) && (actual[key] !== null)) {
            newArray[key] = majax.cleanObject(actual[key]);
          }
        }
      }
    }
    return newArray;
  },
  getCSVasArray: function (csvstring) {
    "use strict";
    var regexCSV, arrayCSV, arrMatches, strMatchedDelimiter, strMatchedValue, strDelimiter = ';';
    regexCSV = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    arrayCSV = [
      []
    ];
    arrMatches = regexCSV.exec(csvstring);
    while (arrMatches) {
      strMatchedDelimiter = arrMatches[1];
      if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
        arrayCSV.push([]);
      }
      if (arrMatches[2]) {
        strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
      } else {
        strMatchedValue = arrMatches[3];
      }
      arrayCSV[arrayCSV.length - 1].push(strMatchedValue);
      arrMatches = regexCSV.exec(csvstring);
    }
    return majax.cleanArray(arrayCSV);
  },
  base64_encode: function (s) {
    "use strict";
    if (typeof window.btoa !== 'function') {
      var m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        r = "",
        i = 0,
        a, b, c, d, x, y, z;
      while (i < s.length) {
        i += 1;
        x = s.charCodeAt(i);
        i += 1;
        y = s.charCodeAt(i);
        i += 1;
        z = s.charCodeAt(i);
        a = x >> 2;
        b = ((x & 3) << 4) | (y >> 4);
        c = ((y & 15) << 2) | (z >> 6);
        d = z & 63;
        if (isNaN(y)) {
          c = d = 64;
        } else if (isNaN(z)) {
          d = 64;
        }
        r += m.charAt(a) + m.charAt(b) + m.charAt(c) + m.charAt(d);
      }
      return r;
    }
    return window.btoa(s);
  },
  base64_decode: function (s) {
    "use strict";
    if (typeof window.btoa !== 'function') {
      var m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        r = "",
        i = 0,
        a, b, c, d, x, y, z;
      s = s.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < s.length) {
        i += 1;
        a = m.indexOf(s.charAt(i));
        i += 1;
        b = m.indexOf(s.charAt(i));
        i += 1;
        c = m.indexOf(s.charAt(i));
        i += 1;
        d = m.indexOf(s.charAt(i));
        x = (a << 2) | (b >> 4);
        y = ((b & 15) << 4) | (c >> 2);
        z = ((c & 3) << 6) | d;
        r += String.fromCharCode(x) + (c !== 64 ? String.fromCharCode(y) : "") + (d !== 64 ? String.fromCharCode(z) : "");
      }
      return r;
    }
    return window.atob(s);
  },
  escapeHtmlEntities: function (text) {
    "use strict";
    return text.replace(/[\u00A0-\u2666<>\&]/g, function (c) {
      var entityTable={34:'quot',38:'amp',39:'apos',60:'lt',62:'gt',160:'nbsp',161:'iexcl',162:'cent',163:'pound',164:'curren',165:'yen',166:'brvbar',167:'sect',168:'uml',169:'copy',170:'ordf',171:'laquo',172:'not',173:'shy',174:'reg',175:'macr',176:'deg',177:'plusmn',178:'sup2',179:'sup3',180:'acute',181:'micro',182:'para',183:'middot',184:'cedil',185:'sup1',186:'ordm',187:'raquo',188:'frac14',189:'frac12',190:'frac34',191:'iquest',192:'Agrave',193:'Aacute',194:'Acirc',195:'Atilde',196:'Auml',197:'Aring',198:'AElig',199:'Ccedil',200:'Egrave',201:'Eacute',202:'Ecirc',203:'Euml',204:'Igrave',205:'Iacute',206:'Icirc',207:'Iuml',208:'ETH',209:'Ntilde',210:'Ograve',211:'Oacute',212:'Ocirc',213:'Otilde',214:'Ouml',215:'times',216:'Oslash',217:'Ugrave',218:'Uacute',219:'Ucirc',220:'Uuml',221:'Yacute',222:'THORN',223:'szlig',224:'agrave',225:'aacute',226:'acirc',227:'atilde',228:'auml',229:'aring',230:'aelig',231:'ccedil',232:'egrave',233:'eacute',234:'ecirc',235:'euml',236:'igrave',237:'iacute',238:'icirc',239:'iuml',240:'eth',241:'ntilde',242:'ograve',243:'oacute',244:'ocirc',245:'otilde',246:'ouml',247:'divide',248:'oslash',249:'ugrave',250:'uacute',251:'ucirc',252:'uuml',253:'yacute',254:'thorn',255:'yuml',402:'fnof',913:'Alpha',914:'Beta',915:'Gamma',916:'Delta',917:'Epsilon',918:'Zeta',919:'Eta',920:'Theta',921:'Iota',922:'Kappa',923:'Lambda',924:'Mu',925:'Nu',926:'Xi',927:'Omicron',928:'Pi',929:'Rho',931:'Sigma',932:'Tau',933:'Upsilon',934:'Phi',935:'Chi',936:'Psi',937:'Omega',945:'alpha',946:'beta',947:'gamma',948:'delta',949:'epsilon',950:'zeta',951:'eta',952:'theta',953:'iota',954:'kappa',955:'lambda',956:'mu',957:'nu',958:'xi',959:'omicron',960:'pi',961:'rho',962:'sigmaf',963:'sigma',964:'tau',965:'upsilon',966:'phi',967:'chi',968:'psi',969:'omega',977:'thetasym',978:'upsih',982:'piv',8226:'bull',8230:'hellip',8242:'prime',8243:'Prime',8254:'oline',8260:'frasl',8472:'weierp',8465:'image',8476:'real',8482:'trade',8501:'alefsym',8592:'larr',8593:'uarr',8594:'rarr',8595:'darr',8596:'harr',8629:'crarr',8656:'lArr',8657:'uArr',8658:'rArr',8659:'dArr',8660:'hArr',8704:'forall',8706:'part',8707:'exist',8709:'empty',8711:'nabla',8712:'isin',8713:'notin',8715:'ni',8719:'prod',8721:'sum',8722:'minus',8727:'lowast',8730:'radic',8733:'prop',8734:'infin',8736:'ang',8743:'and',8744:'or',8745:'cap',8746:'cup',8747:'int',8756:'there4',8764:'sim',8773:'cong',8776:'asymp',8800:'ne',8801:'equiv',8804:'le',8805:'ge',8834:'sub',8835:'sup',8836:'nsub',8838:'sube',8839:'supe',8853:'oplus',8855:'otimes',8869:'perp',8901:'sdot',8968:'lceil',8969:'rceil',8970:'lfloor',8971:'rfloor',9001:'lang',9002:'rang',9674:'loz',9824:'spades',9827:'clubs',9829:'hearts',9830:'diams',338:'OElig',339:'oelig',352:'Scaron',353:'scaron',376:'Yuml',710:'circ',732:'tilde',8194:'ensp',8195:'emsp',8201:'thinsp',8204:'zwnj',8205:'zwj',8206:'lrm',8207:'rlm',8211:'ndash',8212:'mdash',8216:'lsquo',8217:'rsquo',8218:'sbquo',8220:'ldquo',8221:'rdquo',8222:'bdquo',8224:'dagger',8225:'Dagger',8240:'permil',8249:'lsaquo',8250:'rsaquo',8364:'euro'};
      return '&' + (entityTable[c.charCodeAt(0)] || '#' + c.charCodeAt(0)) + ';';
    });
  }
};
