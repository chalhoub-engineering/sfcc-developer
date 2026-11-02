'use strict';

var server = require('server');

server.extend(module.superModule);

server.append('Variation', function (req, res, next) {
    var Site = require('dw/system/Site');
    if ('isProductFullFillmentServiceEnable' in Site.current.preferences.custom && Site.getCurrent().getCustomPreferenceValue('isProductFullFillmentServiceEnable')) {
        var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
        var fulfillmentModel = require('*/cartridge/scripts/models/fullfillmentModel');

        var viewData = res.getViewData();
        var fulfillmentContent = null;

        if (viewData.product.availability.messages[0] === 'In Stock') {
            fulfillmentContent = fulfillmentModel.getFulfillmentContent(
                viewData.queryString,
                req.locale.id
            );
        }

        res.json({
            product: viewData.product,
            resources: productHelper.getResources(),
            fullfillmentContent: fulfillmentContent
        });
    }

    next();
});

module.exports = server.exports();