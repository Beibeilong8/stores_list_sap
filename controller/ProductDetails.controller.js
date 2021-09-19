sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("karina.komarovich.controller.ProductDetails", {
		onNavToStoresOverview: function () {
			this.getOwnerComponent().getRouter().navTo("StoresOverview");
		}
	});
});
