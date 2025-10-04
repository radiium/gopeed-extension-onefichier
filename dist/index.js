/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _apiKey = /*#__PURE__*/new WeakMap();
var _OneFichierApi_brand = /*#__PURE__*/new WeakSet();
/**
 * Extension Gopeed pour 1fichier.com
 * Télécharge via l'API Premium/Access/CDN
 */
var OneFichierApi = /*#__PURE__*/function () {
  function OneFichierApi(apiKey) {
    _classCallCheck(this, OneFichierApi);
    /**
     *
     * @param {string} url
     * @param {Record<string, any>} body
     * @returns {Promise<any>}
     */
    _classPrivateMethodInitSpec(this, _OneFichierApi_brand);
    _classPrivateFieldInitSpec(this, _apiKey, '');
    _classPrivateFieldSet(_apiKey, this, apiKey);
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('1fichier.com API key not configured. Please add your API key in the extension settings.');
    }
  }

  /**
   * Get file info
   * @param {{url: string}} body
   * @returns {Promise<{filename: string; size: number}>}
   */
  return _createClass(OneFichierApi, [{
    key: "getFileInfo",
    value: async function getFileInfo(body) {
      return _assertClassBrand(_OneFichierApi_brand, this, _post).call(this, 'https://api.1fichier.com/v1/file/info.cgi', body);
    }

    /**
     * Get file download link
     * @param {{url: string}} body
     * @returns {Promise<{url: string; status: 'OK'| 'KO'; message?: string}>}
     */
  }, {
    key: "getFileDownload",
    value: async function getFileDownload(body) {
      return _assertClassBrand(_OneFichierApi_brand, this, _post).call(this, 'https://api.1fichier.com/v1/download/get_token.cgi', body);
    }
  }]);
}();
async function _post(url, body) {
  var response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: "Bearer ".concat(_classPrivateFieldGet(_apiKey, this)),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return await response.json();
}
gopeed.events.onResolve(async function (ctx) {
  gopeed.logger.info("1fichier link resolution: ".concat(url));

  // Récupérer la clé API depuis les paramètres
  var url = ctx.req.url;
  var apiKey = gopeed.settings.apiKey;
  try {
    // Init API
    var api = new OneFichierApi(apiKey);
    gopeed.logger.debug("Appel API url: ".concat(url));

    // Retrieve file info
    var fileInfo = await api.getFileInfo({
      url: url
    });
    gopeed.logger.debug("R\xE9ponse API getFileInfo: ".concat(JSON.stringify(fileInfo)));

    // Generate download link
    var fileDownload = await api.getFileDownload({
      url: url,
      cdn: 0,
      restrict_ip: 0
    });
    gopeed.logger.debug("R\xE9ponse API getFileDownload: ".concat(JSON.stringify(fileDownload)));

    // Check valid download link
    if (fileDownload.status !== 'OK') {
      throw new Error("Erreur API 1fichier: ".concat(fileDownload.message || 'Erreur inconnue'));
    }
    if (!fileDownload.url) {
      throw new Error("Aucune URL de téléchargement retournée par l'API");
    }

    // Retourner les informations de résolution
    ctx.res = {
      name: '',
      size: fileInfo.size,
      range: false,
      files: [{
        name: fileInfo.filename,
        size: fileInfo.size,
        req: {
          url: fileDownload.url,
          headers: {}
        }
      }]
    };
    gopeed.logger.info('Résolution terminée avec succès');
  } catch (error) {
    gopeed.logger.error("Erreur: ".concat(error.message));
    throw new Error("Impossible de r\xE9soudre le t\xE9l\xE9chargement 1fichier: ".concat(error.message));
  }
});

// Note: Les jetons 1fichier.com supportent les range requests
// Gopeed gère automatiquement la reprise des téléchargements
// Le jeton est valable 5 minutes, la reprise est possible pendant 30 minutes
/******/ })()
;