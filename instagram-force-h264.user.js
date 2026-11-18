// ==UserScript==
// @name         Force Instagram H.264
// @namespace    zorbiks-instagram-h264
// @author       Zorbiks
// @version      1.0
// @description  Forces Instagram to serve only H.264 video by blocking VP9/AV1/HEVC support detection.
// @match        https://www.instagram.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Override canPlayType to reject non-H.264 codecs
    const originalCanPlayType = HTMLVideoElement.prototype.canPlayType;
    HTMLVideoElement.prototype.canPlayType = function(type) {
        if (!type) return '';

        // If it asks for avc1 (H.264), allow it
        if (type.includes('avc1')) {
            return originalCanPlayType.call(this, type);
        }

        // Block VP9, AV1, HEVC/H.265 to force fallback
        if (type.includes('vp09') || type.includes('av01') || type.includes('hev1') || type.includes('hvc1')) {
            return '';
        }

        return originalCanPlayType.call(this, type);
    };

    // Override MediaSource.isTypeSupported to report non-H.264 codecs as unsupported
    if (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported) {
        const originalIsTypeSupported = MediaSource.isTypeSupported;
        MediaSource.isTypeSupported = function(type) {
            if (!type) return false;

            if (type.includes('avc1')) {
                return originalIsTypeSupported.call(MediaSource, type);
            }

            if (type.includes('vp09') || type.includes('av01') || type.includes('hev1') || type.includes('hvc1')) {
                return false;
            }

            return originalIsTypeSupported.call(MediaSource, type);
        };
    }
})();