sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("karina.komarovich.controller.StoreDetails", {
		onInit: function(){
			this.getOwnerComponent().getRouter().getRoute("StoreDetails").attachPatternMatched(this._onGetStoreId, this);
		},

		_onGetStoreId: function(oEvent){
			var storeId =  oEvent.mParameters.arguments.storeId;
		},

		onNavToStoresOverview: function () {
			this.getOwnerComponent().getRouter().navTo("StoresOverview");
		},

		onNavToProductDetails: function () {
			this.getOwnerComponent().getRouter().navTo("ProductDetails", { storeId: 1, productId: 1 });
		}
	});
});
