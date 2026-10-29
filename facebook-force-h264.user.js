// ==UserScript==
// @name         Force Facebook H.264
// @namespace    zorbiks-facebook-h264
// @author       Zorbiks
// @version      1.0
// @description  Forces Facebook to serve only H.264 video by blocking VP9/AV1/HEVC support detection.
// @author       You
// @match        *://*.facebook.com/*
// @match        *://*.fbcdn.net/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Codecs to block (VP8, VP9, AV1, HEVC)
    const BLOCKED_CODEC_PATTERN = /vp0?[89]|av01|hev1|hvc1/i;

    // 1. Override MediaSource.isTypeSupported (the main check)
    const originalIsTypeSupported = MediaSource.isTypeSupported;
    MediaSource.isTypeSupported = function(type) {
        if (BLOCKED_CODEC_PATTERN.test(type)) {
            return false;
        }
        return originalIsTypeSupported.call(MediaSource, type);
    };

    // 2. Override HTMLVideoElement.prototype.canPlayType (fallback check)
    const originalCanPlayType = HTMLVideoElement.prototype.canPlayType;
    HTMLVideoElement.prototype.canPlayType = function(type) {
        if (BLOCKED_CODEC_PATTERN.test(type)) {
            return '';
        }
        return originalCanPlayType.call(this, type);
    };

    // 3. Override MediaSource.prototype.addSourceBuffer (safety net)
    const originalAddSourceBuffer = MediaSource.prototype.addSourceBuffer;
    MediaSource.prototype.addSourceBuffer = function(mimeType) {
        if (BLOCKED_CODEC_PATTERN.test(mimeType)) {
            console.warn('[Force H.264] Blocked source buffer for codec:', mimeType);
            // Throw an error to prevent the player from trying to use it
            throw new Error('Codec not supported by user script policy');
        }
        return originalAddSourceBuffer.call(this, mimeType);
    };

    // 4. Override navigator.mediaCapabilities.decodingInfo (modern API)
    if (navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo) {
        const originalDecodingInfo = navigator.mediaCapabilities.decodingInfo.bind(navigator.mediaCapabilities);
        navigator.mediaCapabilities.decodingInfo = function(config) {
            if (config && config.video && config.video.contentType) {
                if (BLOCKED_CODEC_PATTERN.test(config.video.contentType)) {
                    return Promise.resolve({
                        supported: false,
                        smooth: false,
                        powerEfficient: false
                    });
                }
            }
            return originalDecodingInfo(config);
        };
    }

    console.log('[Force H.264] Codec overrides installed. Facebook should now use H.264.');
})();
