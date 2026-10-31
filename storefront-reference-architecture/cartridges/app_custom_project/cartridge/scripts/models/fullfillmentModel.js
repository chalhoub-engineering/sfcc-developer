'use strict';

// var CacheMgr = require('dw/system/CacheMgr');
var ContentMgr = require('dw/content/ContentMgr');
var Locale = require('dw/util/Locale');
var fullfillmentServiceModel = require('*/cartridge/scripts/models/fullfillmentService');

/**
 * Extract query parameter value.
 * @param {string} queryString - Request query string
 * @param {string} parameterKey - Parameter key
 * @returns {string|null} Parameter value
 */
function getQueryParameter(queryString, parameterKey) {
    var queryParams = queryString.split('&');

    return queryParams.filter(function (param) {
        return param.split('=')[0] === parameterKey;
    }).map(function (param) {
        return decodeURIComponent(
            param.split('=').slice(1).join('=')
        );
    })[0] || null;
}

/* function getCacheKey(sku, country) {
    return 'FULFILLMENT_' + country.toUpperCase() + '_' + sku;
} */

/**
 * Get fulfillment content based on selected product variant and country.
 * @param {string} queryString - Request query string
 * @param {string} localeId - Current request locale
 * @returns {string|null} Fulfillment content HTML
 */
function getFulfillmentContent(queryString, localeId) {
    if (!queryString) {
        return null;
    }
    
    var productId = getQueryParameter(queryString, 'pid');

    if (!productId) {
        return null;
    }

    var colorVariantProductKey = 'dwvar_' + productId + '_color';
    var sizeVariantProductKey = 'dwvar_' + productId + '_size';

    var colorVariantId = getQueryParameter(
        queryString,
        colorVariantProductKey
    );

    var sizeVariantId = getQueryParameter(
        queryString,
        sizeVariantProductKey
    );

    if (!colorVariantId || !sizeVariantId) {
        return null;
    }

    var countryCode = Locale.getLocale(localeId).country;

    // var fulfillmentCache = CacheMgr.getCache('fulfillmentCache');
    // var cacheKey = getCacheKey(colorVariantId, countryCode);
    // var cachedTier = fulfillmentCache.get(cacheKey);

    // if (!cachedTier) {
    var fullfillmentTier = fullfillmentServiceModel.callFullfillmentService({
        sku: colorVariantId,
        country: countryCode
    });

    if (!fullfillmentTier ||
        !fullfillmentTier.object ||
        !fullfillmentTier.object.tier) {
        return null;
    }
    // var cachedTier = fullfillmentTier.object.tier;
    // fulfillmentCache.put(cacheKey, cachedTier);
    // }

    var contentAsset = ContentMgr.getContent(
        fullfillmentTier.object.tier
    );

    if (!contentAsset || !contentAsset.online ||
        !contentAsset.custom.body ||
        !contentAsset.custom.body.markup) {
        return null;
    }

    return contentAsset.custom.body.markup;
}

module.exports = {
    getFulfillmentContent: getFulfillmentContent
};