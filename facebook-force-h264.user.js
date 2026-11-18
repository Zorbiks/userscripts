// ==UserScript==
// @name         Facebook Force H.264
// @namespace    zorbiks-instagram-h264
// @author       Zorbiks
// @version      1.1
// @description  Force Facebook to use H.264 (AVC) video playback by blocking VP9, AV1, and HEVC
// @match        *://*.facebook.com/*
// @match        *://*.fbcdn.net/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const BLOCKED_CODECS = ['vp09', 'vp9', 'vp8', 'av01', 'av1', 'hev1', 'hvc1'];

    function isBlockedVideoCodec(type) {
        if (!type || typeof type !== 'string') return false;
        const lower = type.toLowerCase();

        // Only filter video MIME types
        if (!lower.includes('video/')) return false;

        // Explicitly allow H.264 / AVC
        if (lower.includes('avc1') || lower.includes('avc3')) return false;

        // Block modern/non-H.264 codecs
        return BLOCKED_CODECS.some(codec => lower.includes(codec));
    }

    // Hook HTMLVideoElement.prototype.canPlayType
    const origCanPlayType = HTMLVideoElement.prototype.canPlayType;
    HTMLVideoElement.prototype.canPlayType = function (type) {
        if (isBlockedVideoCodec(type)) {
            return '';
        }
        return origCanPlayType.call(this, type);
    };

    // Hook MediaSource.isTypeSupported
    if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported) {
        const origIsTypeSupported = MediaSource.isTypeSupported;
        MediaSource.isTypeSupported = function (type) {
            if (isBlockedVideoCodec(type)) {
                return false;
            }
            return origIsTypeSupported.call(this, type);
        };
    }

    // Hook navigator.mediaCapabilities.decodingInfo
    if (navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo) {
        const origDecodingInfo = navigator.mediaCapabilities.decodingInfo;
        navigator.mediaCapabilities.decodingInfo = function (config) {
            if (config && config.video && isBlockedVideoCodec(config.video.contentType)) {
                return Promise.resolve({
                    supported: false,
                    smooth: false,
                    powerEfficient: false
                });
            }
            return origDecodingInfo.call(this, config);
        };
    }
})();