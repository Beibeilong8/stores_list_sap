sap.ui.define([
	"karina/komarovich/controller/BaseController",
	"sap/ui/model/odata/ODataModel",
], function (BaseController) {
	"use strict";

	return BaseController.extend("karina.komarovich.controller.StoreDetails", {
		onInit: function(){
			this.getOwnerComponent().getRouter().getRoute("StoreDetails").attachPatternMatched(this._onGetStoreId, this);
			
		},

		// onAfterRendering: function () {
		// 	let oODataModel = this.getView().getModel("stores");
		// 	let oProductsTable = this.byId("productsTable");
		// 	let oBinding = oProductsTable.getBinding("items");
		// 	let oAppView = this.getView().getModel("appView");
	  
		// 	oBinding.attachDataReceived(function () {
		// 	  let oCtx = oProductsTable.getBindingContext("stores");
		// 	  let sStoresPath = oODataModel.createKey("/Stores", oCtx.getObject());
		// 	  let aStatuses = ["ALL", "OK", "STORAGE", "OUT_OF_STOCK"];
	  
		// 	  aStatuses.forEach(function (sStatus) {
		// 		let oParams = {
		// 		  success: function (sCount) {
		// 			oAppView.setProperty(
		// 			  "/" + sStatus.toLowerCase() + "ProductsCount",
		// 			  sCount
		// 			);
		// 		  },
		// 		};
	  
		// 		if (sStatus !== "ALL") {
		// 		  oParams.filters = [
		// 			new Filter("Status", FilterOperator.EQ, sStatus),
		// 		  ];
		// 		};
	  
		// 		oODataModel.read(sStoresPath + "/rel_Products/$count", oParams);
		// 	  });
		// 	});
		//   },

		_onGetStoreId: function(oEvent){
			var storeId =  oEvent.mParameters.arguments.storeId;
		},

		onNavToStoresOverview: function () {
			this.navigateTo("StoresOverview");
		},

		onNavToProductDetails: function () {
			this.navigateTo("ProductDetails", { storeId: 1, productId: 1 });
		}
	});
});
