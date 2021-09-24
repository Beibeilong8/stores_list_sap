sap.ui.define([
	"karina/komarovich/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("karina.komarovich.controller.ProductDetails", {
		onNavToStoresOverview: function () {
			this.navigateTo("StoresOverview");
		},
		onNavToStoreDetails: function () {
			this.navigateTo("StoreDetails", { storeId: 1 });
		},
	});
});
