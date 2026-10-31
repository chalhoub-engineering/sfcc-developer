'use strict';

/**
 * Callback function for the fulfillment service.
 * @returns {Object} The callback functions for the fulfillment service.
 */
function getServiceCallback() {
    return {
        createRequest: function (svcservice, params) {
            var serviceURL = svcservice.getConfiguration()
                .getCredential()
                .getURL();

            var queryString = '?sku=' + encodeURIComponent(params.sku) +
                '&country=' + encodeURIComponent(params.country);

            svcservice.setRequestMethod('GET');
            svcservice.addHeader('Content-Type', 'application/json');
            svcservice.setURL(serviceURL + queryString);
            return null;
        },
        parseResponse: function (response) {
            var textResponse = response.getText('UTF-8');
            return JSON.parse(textResponse);
        },
        filterLogMessage: function (msg) {
            var Logger = require('dw/system/Logger').getLogger('productFullfillmentService', 'productFullfillmentService');
            Logger.info(msg);
            return JSON.parse(msg);
        }
    };
}

/**
 * Calls the fulfillment service with the provided parameters and returns the result.
 * @param {Object} params - The parameters to send to the fulfillment service.
 * @returns {Object|null} The result from the fulfillment service, or null if an error occurred.
 */
function callFullfillmentService(params) {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var svc = null;
    var result = null;
    try {
        svc = LocalServiceRegistry.createService('appcustom.http.fullfillment.get', getServiceCallback());
        result = svc.call(params);
    } catch (e) {
        var Logger = require('dw/system/Logger').getLogger('productFullfillmentService', 'productFullfillmentService');
        Logger.error('productFullfillmentService API Error: ', e);
    }
    return result;
}

module.exports.callFullfillmentService = callFullfillmentService;