sap.ui.define([
	"karina/komarovich/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, Filter, FilterOperator, Sorter, JSONModel, MessageToast, MessageBox) {
	"use strict";
	var sProductId;

	return BaseController.extend("karina.komarovich.controller.ProductDetails", {
		onInit: function(){

			this.getOwnerComponent().getRouter().getRoute("ProductDetails").attachPatternMatched(this.onPatternMatched, this);

			var oModel = new JSONModel({});
			// create JSONModel, which will be used for a new product creation purposes (just for convenience)
			var oNewCommentModel = new JSONModel({
				"Author": "",
				"Message": "",
				"Rating": 0,
				"Posted": "",
				"ProductId": 0
			});
			// set the new product model to the view
			this.getView().setModel(oNewCommentModel, "newCommentModel");
			this.getView().setModel(oModel, "appView");
		},

		// onAfterRendering: function () {
		// 	var oODataModel = this.getView().getModel("odata");
		// 	var oCommentsTable = this.byId("CommentsList");
		// 	var oBinding = oCommentsTable.getBinding("items");
		// 	var oAppView = this.getView().getModel("appView");
	  
		// 	oBinding.attachDataReceived(function () {
		// 	  var oCtx = oCommentsTable.getBindingContext("odata");
		// 	  var sStoresPath = oODataModel.createKey("/ProductComments", oCtx.getObject());
		// 	//   var aStatuses = ["ALL", "OK", "STORAGE", "OUT_OF_STOCK"];
	  
		// 	//   aStatuses.forEach(function (sStatus) {
		// 	// 	var oParams = {
		// 	// 	  success: function (sCount) {
		// 	// 		oAppView.setProperty(
		// 	// 		  "/" + sStatus.toLowerCase() + "ProductsCount",
		// 	// 		  sCount
		// 	// 		);
		// 	// 	  },
		// 	// 	};
	  
		// 		// oODataModel.read(sStoresPath + "/rel_Products/$count", oParams);
		// 	//   });
		// 	});
		// },

		onPatternMatched: function (oEvent) {
			var that = this;
			sProductId = oEvent.mParameters.arguments.productId;
			var oODataModel = that.getView().getModel("odata");
			this.onFilterComments()
			oODataModel.metadataLoaded().then(function (){
				var sKey = oODataModel.createKey("/ProductComments", { id: sProductId});
				that.getView().bindObject({
					path: sKey,
					model: "odata"
				});
			});
		},


		/**
		* "Create" comment button press event handler.
		* 
		*  @param {sap.ui.base.Event} oEvent event object
		*/
	   onCreateCommentPress: function () {
		   var that 			= this,
			   oODataModel 		= this.getView().getModel("odata"),
			   oNewCommentModel	= this.getView().getModel("newCommentModel");

		   // create a new product object
		   var oNewComment = {
				"Author": 	oNewCommentModel.getProperty("/Author"),
				"Message": 	oNewCommentModel.getProperty("/Message"),
				"Rating": 	oNewCommentModel.getProperty("/Rating"),
				"Posted": "",
				"ProductId": sProductId
		   };

		   // execute "create" request
		   oODataModel.create("/ProductComments", oNewComment, {
			   success: function () {
				   MessageToast.show("{i18n>StoreCreateSuccessMessage}");
				   that.oDialog.close();
			   },
			   error: function () {
				   MessageBox.error("{i18n>StoreCreateErrorMessage}");
			   }
		   });
	   },
		
		onFilterComments: function (sProductId){
			var oBinding = this.byId("CommentsList").getBinding("items"),
				sfilterValue = new Filter("ProductId", FilterOperator.EQ, sProductId),
				sSortValue = new Sorter("Posted", true);

			oBinding.filter(sfilterValue);
			oBinding.sort(sSortValue);
		},

		onNavToStoresOverview: function () {
			this.navigateTo("StoresOverview");
		},

		onNavToStoreDetails: function () {

			var sStoreId = this.getView().getBindingContext("odata")
			var i = sStoreId.getProperty("storeId");
			this.navigateTo("StoreDetails", { storeId: sStoreId});
		},
	});
});
