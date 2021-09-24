sap.ui.define([
	"karina/komarovich/controller/BaseController",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/mvc/Controller",
], function (Controller, ODataModel) {
	"use strict";

	return Controller.extend("karina.komarovich.controller.StoresOverview", {
		// onProductsTableItemSelect: function (oEvent) {
		// 	// get selected item from event object (Product table line)
		// 	var oSelectedListItem = oEvent.getParameter("ObjectListItem");

		// 	// get the binding context of a selected item (it contains information about a single product)
		// 	var oCtx = oSelectedListItem.getBindingContext("odata");

		// 	// set (transfer) the binding context to "ProductDetailForm" to make alive their relative bindings
		// 	this.byId("ProductDetailForm").setBindingContext(oCtx, "odata");
		// },
		onNavToStoreDetails: function (oEvent) {


			var oSelectedListItem = oEvent.getSource();

			// get the binding context of a selected item (it contains information about a single product)
			var oCtx = oSelectedListItem.getBindingContext("odata");

			var sPath = oCtx.sPath

			// this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());

			// set (transfer) the binding context to "ProductDetailForm" to make alive their relative bindings
			// this.byId("ProductDetailForm").setBindingContext(oCtx, "odata");

			// var oBindingContext = oItem.getBindingContext();
			var mRouteArguments = oEvent.getParameters("arguments");

			// get the "SupplierID" parameter from arguments
			// var sStoreID = oEvent.mParameters.arguments.storeId;
			var that = this;
			var oODataModel = that.getView().getModel("odata");
			oODataModel.metadataLoaded().then(function (){
				var sKey = oODataModel.createKey("/Stores", { id: sPath});
				that.getView().bingObject({
					path: sKey,
					model: "odata"
				});
			});
			// var oModel = this.getView().getModel();
			// var oSettingsModel = this.getView().getModel('settings');
			// oSettingsModel.setProperty("/StoreDetails", oModel.getProperty("StoreId", oBindingContext));
			// oEvent
			this.navigateTo("StoreDetails", { storeId: 1 });
		}
	});
});


		// onInit: function() {
		// 	// this.oData = new ODataModel("http://localhost:3000/odata", true);
		// 	// this.getView().setModel(this.oData);
		// },

		// onSearch: function (oEvent) {
		// 	// add filter for search
		// 	var aFilters = [];
		// 	var sQuery = oEvent.getSource().getValue();
		// 	if (sQuery && sQuery.length > 0) {
		// 		var filter = new Filter("Name", FilterOperator.Contains, sQuery);
		// 		aFilters.push(filter);
		// 	}

		// 	// update list binding
		// 	var oList = this.byId("idList");
		// 	var oBinding = oList.getBinding("items");
		// 	oBinding.filter(aFilters, "Application");
		// },


