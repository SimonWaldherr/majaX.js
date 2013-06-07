#
# * majaX
# *
# * Copyright 2013, Simon Waldherr - http://simon.waldherr.eu/
# * Released under the MIT Licence
# * http://simon.waldherr.eu/license/mit/
# *
# * Github:  https://github.com/simonwaldherr/majaX.js/
# * Version: 0.2.4
#

majaX = undefined
majax = undefined
majaX = (data, successcallback, errorcallback) ->
  "use strict"
  url = undefined
  method = undefined
  port = undefined
  type = undefined
  typed = undefined
  header = undefined
  faildata = undefined
  ajax = undefined
  ajaxTimeout = undefined
  mimes = undefined
  mimetype = undefined
  senddata = undefined
  sendkeys = undefined
  sendstring = undefined
  regex = undefined
  urlparts = {}
  i = 0
  return false  if data.url is `undefined`
  regex = /((http[s]?:\/\/)?([\.:\/?&]+)?([^\.:\/?&]+)?)/g
  urlparts.regex = data.url.match(regex)
  urlparts.clean =
    protocol: ""
    domain: ""
    port: ""
    path: ""
    fileextension: ""
    query: ""

  i = 0
  while i < urlparts.regex.length
    if majax.countChars(urlparts.regex[i], "://") is 1
      urlparts.clean.protocol = (if urlparts.regex[i] is `undefined` then false else urlparts.regex[i].split("://")[0])
      urlparts.clean.domain = (if urlparts.regex[i] is `undefined` then false else urlparts.regex[i].split("://")[1])
    else if (majax.countChars(urlparts.regex[i], "/") is 0) and (majax.countChars(urlparts.regex[i], ":") is 0) and (urlparts.clean.path is "")
      urlparts.clean.domain += (if urlparts.regex[i] is `undefined` then false else urlparts.regex[i])
    else if (majax.countChars(urlparts.regex[i], ":") is 1) and (urlparts.clean.path is "")
      urlparts.clean.port = (if urlparts.regex[i] is `undefined` then false else urlparts.regex[i].split(":")[1])
    else if (majax.countChars(urlparts.regex[i], "?") is 0) and (majax.countChars(urlparts.regex[i], "&") is 0) and (urlparts.clean.query is "")
      urlparts.clean.path += (if urlparts.regex[i] is `undefined` then false else urlparts.regex[i])
    else
      urlparts.clean.query += (if urlparts.regex[i] is `undefined` then false else urlparts.regex[i])
    i++
  urlparts.clean.fileextension = urlparts.clean.path.split(".")[urlparts.clean.path.split(".").length - 1]  if urlparts.clean.path.indexOf(".") isnt -1
  mimes =
    txt: "text/plain"
    json: "application/json"
    atom: "application/atom+xml"
    rss: "application/rss+xml"
    soap: "application/soap+xml"
    xml: "application/xml"
    svg: "image/svg+xml"
    css: "text/css"
    csv: "text/csv"
    html: "text/html"
    vcf: "text/vcard"
    gif: "image/gif"
    jpeg: "image/jpeg"
    jpg: "image/jpeg"
    png: "image/png"
    tiff: "image/tiff"
    mp3: "audio/mpeg"
    mp4: "video/mpeg"
    mpeg: "video/mpeg"
    mpg: "video/mpeg"
    m4a: "audio/mp4"
    ogg: "audio/ogg"
    oga: "audio/ogg"
    webma: "audio/webm"
    wav: "audio/wav"

  url = (if data.url is `undefined` then false else data.url)
  method = (if data.method is `undefined` then "GET" else data.method.toUpperCase())
  port = (if data.port is `undefined` then (if urlparts.clean.port is `undefined` then "80" else urlparts.clean.port) else data.port)
  typed = (if data.type is `undefined` then (if urlparts.clean.fileextension is `undefined` then 1 else 2) else 3)
  typed = (if data.mimetype is `undefined` then typed else 4)
  type = (if data.type is `undefined` then (if urlparts.clean.fileextension is `undefined` then "txt" else urlparts.clean.fileextension.toLowerCase()) else data.type.toLowerCase())
  mimetype = (if data.mimetype is `undefined` then (if mimes[urlparts.clean.fileextension] is `undefined` then "text/plain" else mimes[urlparts.clean.fileextension]) else data.mimetype)
  senddata = (if data.data is `undefined` then false else data.data)
  faildata = (if data.faildata is `undefined` then false else data.faildata)
  header = (if data.header is `undefined` then {} else data.header)
  header["Content-type"] = "application/x-www-form-urlencoded"  if header["Content-type"] is `undefined`
  if method is "DEBUG"
    return (
      url: url
      urlparts: urlparts.clean
      port: port
      type: type
      mime: mimetype
      data: data
    )
  ajax = (if (window.ActiveXObject) then new ActiveXObject("Microsoft.XMLHTTP") else (XMLHttpRequest and new XMLHttpRequest()) or null)
  ajaxTimeout = window.setTimeout(->
    ajax.abort()
  , 6000)
  ajax.onreadystatechange = ->
    jsoncontent = undefined
    status = undefined
    if ajax.readyState is 4
      status = ajax.status.toString().charAt(0)
      if (status isnt "2") and (status isnt "3")
        errorcallback faildata, ajax
      else
        clearTimeout ajaxTimeout
        ajax.headersObject = majax.getRespHeaders(ajax.getAllResponseHeaders())
        if method is "API"
          if urlparts.clean.domain is "github.com"
            jsoncontent = JSON.parse(ajax.responseText)
            if jsoncontent.content isnt `undefined`
              jsoncontent.content = majax.base64_decode(jsoncontent.content.replace(/\n/g, ""))
              successcallback jsoncontent, ajax
            else
              successcallback JSON.parse(ajax.responseText), ajax
        else
          mimetype = ajax.headersObject["Content-Type"]  if typed < 3
          if mimetype.indexOf("json") isnt -1
            successcallback JSON.parse(ajax.responseText), ajax
          else if mimetype.indexOf("xml") isnt -1
            successcallback majax.getXMLasObject(ajax.responseText), ajax
          else if mimetype.indexOf("csv") isnt -1
            successcallback majax.getCSVasArray(ajax.responseText), ajax
          else if (mimetype.indexOf("image") isnt -1) or (mimetype.indexOf("video") isnt -1) or (mimetype.indexOf("audio") isnt -1) or (mimetype.indexOf("user-defined") isnt -1)
            successcallback ajax.response, ajax
          else
            successcallback ajax.responseText, ajax

  i = 0
  sendstring = ""
  if senddata isnt false
    for sendkeys of senddata
      sendstring += "&"  if i isnt 0
      sendstring += sendkeys + "=" + senddata[sendkeys]
      i++
  if method is "API"
    if urlparts.clean.domain is "github.com"
      mimetype = "json"
      if urlparts.clean.path.split("/")[3] is `undefined`
        ajax.open "GET", "https://api.github.com/repos/" + urlparts.clean.path.split("/")[1] + "/" + urlparts.clean.path.split("/")[2] + "/contents/", true
        majax.setReqHeaders ajax, header
        ajax.send()
      else
        ajax.open "GET", "https://api.github.com/repos/" + urlparts.clean.path.split("/")[1] + "/" + urlparts.clean.path.split("/")[2] + "/contents/" + urlparts.clean.path.split("/", 4)[3], true
        majax.setReqHeaders ajax, header
        ajax.send()
  else
    if method isnt "POST"
      if sendstring isnt ""
        if urlparts.clean.query isnt ""
          url = url + "&" + sendstring
        else
          url = url + "?" + sendstring
    if method is "GET"
      ajax.open "GET", url, true
      majax.overrideMime ajax, mimetype
      majax.setReqHeaders ajax, header
      ajax.send()
    else if method is "POST"
      ajax.open "POST", url, true
      majax.overrideMime ajax, mimetype
      majax.setReqHeaders ajax, header
      ajax.send sendstring
    else
      mimetype = "none"  if method is "HEAD"
      ajax.open method, url, true
      majax.overrideMime ajax, mimetype
      majax.setReqHeaders ajax, header
      ajax.send()

majax =
  setReqHeaders: (ajax, headerObject) ->
    "use strict"
    key = undefined
    if headerObject isnt false
      if typeof headerObject is "object"
        for key of headerObject
          ajax.setRequestHeader key, headerObject[key]  if typeof headerObject[key] is "string"

  getRespHeaders: (headerString) ->
    "use strict"
    i = undefined
    string = undefined
    header = undefined
    headerObject = {}
    if typeof headerString is "string"
      string = headerString.split(/\n/)
      i = 0
      while i < string.length
        if typeof string[i] is "string"
          header = string[i].split(": ")
          headerObject[header[0].trim()] = header[1].trim()  if (header[0].length > 3) and (header[1].length > 3)
        i++
    headerObject

  overrideMime: (ajax, mimetype) ->
    "use strict"
    if mimetype is "application/xml"
      ajax.overrideMimeType mimetype
      ajax.responseType = ""
    else if (mimetype.indexOf("image") isnt -1) or (mimetype.indexOf("video") isnt -1) or (mimetype.indexOf("audio") isnt -1)
      ajax.overrideMimeType "text/plain; charset=x-user-defined"
      ajax.responseType = "arraybuffer"

  countChars: (string, split) ->
    "use strict"
    string = string.split(split)
    return string.length - 1  if typeof string is "object"
    0

  getText: (string) ->
    "use strict"
    re = /<([^<>]*)>([^\/]*)<(\/[^<>]*)>/g
    string.replace re, ""  if typeof string is "string"

  getXMLasObject: (xmlstring) ->
    "use strict"
    xmlroot = undefined
    foo = {}
    return majax.returnChilds(foo, xmlstring, 1)  if typeof xmlstring is "object"
    xmlroot = document.createElement("div")
    xmlroot.innerHTML = xmlstring
    majax.returnChilds foo, xmlroot, 1

  returnChilds: (element, node, deep) ->
    "use strict"
    i = undefined
    ii = undefined
    obj = undefined
    key = undefined
    plaintext = undefined
    returnArray = []
    childs = node.childNodes.length
    ii = 0
    i = 0
    while i < childs
      if node.childNodes[i].localName isnt null
        element[ii] = {}
        for key of node.childNodes[i]
          obj = node.childNodes[i][key]
          if (typeof obj is "string") or (typeof obj is "number")
            if (key isnt "accessKey") and (key isnt "baseURI") and (key isnt "className") and (key isnt "contentEditable") and (key isnt "dir") and (key isnt "namespaceURI") and (obj isnt "") and (key isnt key.toUpperCase()) and (obj isnt 0) and (key isnt "childs") and (key isnt "textContent") and (key isnt "nodeType") and (key isnt "tabIndex") and (key isnt "innerHTML") and (key isnt "outerHTML")
              element[ii][key] = obj
            else element[ii][key] = majax.escapeHtmlEntities(obj)  if (key is "innerHTML") or (key is "outerHTML")
        if node.childNodes[i].innerHTML isnt `undefined`
          plaintext = majax.getText(node.childNodes[i].innerHTML).trim()
          element[ii].textContent = plaintext  if plaintext isnt ""
          element[ii].childs = majax.returnChilds(returnArray, node.childNodes[i], deep + 1)  if node.childNodes[i].childNodes.length > 1
          ii++
      i++
    element

  isEmpty: (obj) ->
    "use strict"
    emptyObj = {}
    emptyArr = []
    return true  if (obj is emptyObj) or (obj is emptyArr) or (obj is null) or (obj is `undefined`)
    false

  cleanArray: (actual) ->
    "use strict"
    newArray = []
    clean = undefined
    i = 0
    i = 0
    while i < actual.length
      if (typeof actual[i] is "string") or (typeof actual[i] is "number")
        newArray.push actual[i]
      else if typeof actual[i] is "object"
        clean = majax.cleanArray(actual[i])
        newArray.push majax.cleanArray(actual[i])  if clean[0] isnt ""
      i++
    newArray

  cleanObject: (actual) ->
    "use strict"
    newArray = {}
    key = undefined
    for key of actual
      if (typeof actual[key] isnt "object") and (typeof actual[key] isnt "function") and (typeof actual[key] isnt "") and (not majax.isEmpty(actual[key]))
        newArray[key] = actual[key]
      else newArray[key] = majax.cleanObject(actual[key])  if (not majax.isEmpty(majax.cleanObject(actual[key]))) and (actual[key] isnt null)  if typeof actual[key] is "object"
    newArray

  getCSVasArray: (csvstring) ->
    "use strict"
    regexCSV = undefined
    arrayCSV = undefined
    arrMatches = undefined
    strMatchedDelimiter = undefined
    strMatchedValue = undefined
    strDelimiter = ";"
    regexCSV = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi")
    arrayCSV = [[]]
    arrMatches = regexCSV.exec(csvstring)
    while arrMatches
      strMatchedDelimiter = arrMatches[1]
      arrayCSV.push []  if strMatchedDelimiter.length and (strMatchedDelimiter isnt strDelimiter)
      if arrMatches[2]
        strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"")
      else
        strMatchedValue = arrMatches[3]
      arrayCSV[arrayCSV.length - 1].push strMatchedValue
      arrMatches = regexCSV.exec(csvstring)
    majax.cleanArray arrayCSV

  base64_encode: (s) ->
    "use strict"
    if typeof window.btoa isnt "function"
      m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
      r = ""
      i = 0
      a = undefined
      b = undefined
      c = undefined
      d = undefined
      x = undefined
      y = undefined
      z = undefined
      while i < s.length
        x = s.charCodeAt(i++)
        y = s.charCodeAt(i++)
        z = s.charCodeAt(i++)
        a = x >> 2
        b = ((x & 3) << 4) | (y >> 4)
        c = ((y & 15) << 2) | (z >> 6)
        d = z & 63
        if isNaN(y)
          c = d = 64
        else d = 64  if isNaN(z)
        r += m.charAt(a) + m.charAt(b) + m.charAt(c) + m.charAt(d)
      return r
    window.btoa s

  base64_decode: (s) ->
    "use strict"
    if typeof window.btoa isnt "function"
      m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
      r = ""
      i = 0
      a = undefined
      b = undefined
      c = undefined
      d = undefined
      x = undefined
      y = undefined
      z = undefined
      s = s.replace(/[^A-Za-z0-9\+\/\=]/g, "")
      while i < s.length
        a = m.indexOf(s.charAt(i++))
        b = m.indexOf(s.charAt(i++))
        c = m.indexOf(s.charAt(i++))
        d = m.indexOf(s.charAt(i++))
        x = (a << 2) | (b >> 4)
        y = ((b & 15) << 4) | (c >> 2)
        z = ((c & 3) << 6) | d
        r += String.fromCharCode(x) + ((if c isnt 64 then String.fromCharCode(y) else "")) + ((if d isnt 64 then String.fromCharCode(z) else ""))
      return r
    window.atob s

  escapeHtmlEntities: (text) ->
    "use strict"
    text.replace /[\u00A0-\u2666<>\&]/g, (c) ->
      entityTable =
        34: "quot"
        38: "amp"
        39: "apos"
        60: "lt"
        62: "gt"
        160: "nbsp"
        161: "iexcl"
        162: "cent"
        163: "pound"
        164: "curren"
        165: "yen"
        166: "brvbar"
        167: "sect"
        168: "uml"
        169: "copy"
        170: "ordf"
        171: "laquo"
        172: "not"
        173: "shy"
        174: "reg"
        175: "macr"
        176: "deg"
        177: "plusmn"
        178: "sup2"
        179: "sup3"
        180: "acute"
        181: "micro"
        182: "para"
        183: "middot"
        184: "cedil"
        185: "sup1"
        186: "ordm"
        187: "raquo"
        188: "frac14"
        189: "frac12"
        190: "frac34"
        191: "iquest"
        192: "Agrave"
        193: "Aacute"
        194: "Acirc"
        195: "Atilde"
        196: "Auml"
        197: "Aring"
        198: "AElig"
        199: "Ccedil"
        200: "Egrave"
        201: "Eacute"
        202: "Ecirc"
        203: "Euml"
        204: "Igrave"
        205: "Iacute"
        206: "Icirc"
        207: "Iuml"
        208: "ETH"
        209: "Ntilde"
        210: "Ograve"
        211: "Oacute"
        212: "Ocirc"
        213: "Otilde"
        214: "Ouml"
        215: "times"
        216: "Oslash"
        217: "Ugrave"
        218: "Uacute"
        219: "Ucirc"
        220: "Uuml"
        221: "Yacute"
        222: "THORN"
        223: "szlig"
        224: "agrave"
        225: "aacute"
        226: "acirc"
        227: "atilde"
        228: "auml"
        229: "aring"
        230: "aelig"
        231: "ccedil"
        232: "egrave"
        233: "eacute"
        234: "ecirc"
        235: "euml"
        236: "igrave"
        237: "iacute"
        238: "icirc"
        239: "iuml"
        240: "eth"
        241: "ntilde"
        242: "ograve"
        243: "oacute"
        244: "ocirc"
        245: "otilde"
        246: "ouml"
        247: "divide"
        248: "oslash"
        249: "ugrave"
        250: "uacute"
        251: "ucirc"
        252: "uuml"
        253: "yacute"
        254: "thorn"
        255: "yuml"
        402: "fnof"
        913: "Alpha"
        914: "Beta"
        915: "Gamma"
        916: "Delta"
        917: "Epsilon"
        918: "Zeta"
        919: "Eta"
        920: "Theta"
        921: "Iota"
        922: "Kappa"
        923: "Lambda"
        924: "Mu"
        925: "Nu"
        926: "Xi"
        927: "Omicron"
        928: "Pi"
        929: "Rho"
        931: "Sigma"
        932: "Tau"
        933: "Upsilon"
        934: "Phi"
        935: "Chi"
        936: "Psi"
        937: "Omega"
        945: "alpha"
        946: "beta"
        947: "gamma"
        948: "delta"
        949: "epsilon"
        950: "zeta"
        951: "eta"
        952: "theta"
        953: "iota"
        954: "kappa"
        955: "lambda"
        956: "mu"
        957: "nu"
        958: "xi"
        959: "omicron"
        960: "pi"
        961: "rho"
        962: "sigmaf"
        963: "sigma"
        964: "tau"
        965: "upsilon"
        966: "phi"
        967: "chi"
        968: "psi"
        969: "omega"
        977: "thetasym"
        978: "upsih"
        982: "piv"
        8226: "bull"
        8230: "hellip"
        8242: "prime"
        8243: "Prime"
        8254: "oline"
        8260: "frasl"
        8472: "weierp"
        8465: "image"
        8476: "real"
        8482: "trade"
        8501: "alefsym"
        8592: "larr"
        8593: "uarr"
        8594: "rarr"
        8595: "darr"
        8596: "harr"
        8629: "crarr"
        8656: "lArr"
        8657: "uArr"
        8658: "rArr"
        8659: "dArr"
        8660: "hArr"
        8704: "forall"
        8706: "part"
        8707: "exist"
        8709: "empty"
        8711: "nabla"
        8712: "isin"
        8713: "notin"
        8715: "ni"
        8719: "prod"
        8721: "sum"
        8722: "minus"
        8727: "lowast"
        8730: "radic"
        8733: "prop"
        8734: "infin"
        8736: "ang"
        8743: "and"
        8744: "or"
        8745: "cap"
        8746: "cup"
        8747: "int"
        8756: "there4"
        8764: "sim"
        8773: "cong"
        8776: "asymp"
        8800: "ne"
        8801: "equiv"
        8804: "le"
        8805: "ge"
        8834: "sub"
        8835: "sup"
        8836: "nsub"
        8838: "sube"
        8839: "supe"
        8853: "oplus"
        8855: "otimes"
        8869: "perp"
        8901: "sdot"
        8968: "lceil"
        8969: "rceil"
        8970: "lfloor"
        8971: "rfloor"
        9001: "lang"
        9002: "rang"
        9674: "loz"
        9824: "spades"
        9827: "clubs"
        9829: "hearts"
        9830: "diams"
        338: "OElig"
        339: "oelig"
        352: "Scaron"
        353: "scaron"
        376: "Yuml"
        710: "circ"
        732: "tilde"
        8194: "ensp"
        8195: "emsp"
        8201: "thinsp"
        8204: "zwnj"
        8205: "zwj"
        8206: "lrm"
        8207: "rlm"
        8211: "ndash"
        8212: "mdash"
        8216: "lsquo"
        8217: "rsquo"
        8218: "sbquo"
        8220: "ldquo"
        8221: "rdquo"
        8222: "bdquo"
        8224: "dagger"
        8225: "Dagger"
        8240: "permil"
        8249: "lsaquo"
        8250: "rsaquo"
        8364: "euro"

      "&" + (entityTable[c.charCodeAt(0)] or "#" + c.charCodeAt(0)) + ";"
