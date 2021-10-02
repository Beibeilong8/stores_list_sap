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
	/**
	* Constants for save product id
	*/
	var sProductId;
	/**
	* Constants for save text product comment
	*/
	var sTextCommentValue;


	return BaseController.extend("karina.komarovich.controller.ProductDetails", {
		/**
		 * Controller's "init" lifecycle method.
		 */
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
		/**
		 * Controller's "patternMatched" method.
		 * 
		 * @param {sap.ui.base.Event} oEvent event object.
		 * 
		 */
		onPatternMatched: function (oEvent) {
			var that 		= this;
			var oODataModel = that.getView().getModel("odata");
				sProductId 	= oEvent.getParameter("arguments").productId;

			oODataModel.metadataLoaded().then(function (){
				that.getView().bindObject({
					path: 	oODataModel.createKey("/Products", {id: sProductId}),
					model: 	"odata"
				});
				that.byId("CommentsList").bindObject({
					path: 	"/ProductComments",
					model: 	"odata"
				});
				that.onFilterComments();
			});
		},
		/**
		* "Create" comment button press event handler.
		*/
	   	onCreateCommentPress: function () {
			var that 				= this;
			var oODataModel 		= this.getView().getModel("odata");
			var oAuthorComment 		= this.byId("AuthorName");
			var oRatingComment 		= this.byId("RatingProduct");
			var oTextComment		= this.byId("CommentProduct");
			var	oBundle 			= this.getView().getModel("i18n").getResourceBundle();
			
			if(!oAuthorComment.getValue() || !oRatingComment.getValue()){
				sTextCommentValue 	= oTextComment.getValue();
				if(!oAuthorComment.getValue()) {oAuthorComment.setValueState("Error")} 
				else {oAuthorComment.setValueState("None")}
				MessageBox.confirm(oBundle.getText("CommentCreateError"),(oAction) => {
					if(oAction ==="OK"){oTextComment.setValue(sTextCommentValue)}
				});
			};
		   	if(oAuthorComment.getValue() && oRatingComment.getValue()){
				if(!sTextCommentValue){
					sTextCommentValue = oTextComment.getValue();
				}
				var oEntryCtx = oODataModel.createEntry("/ProductComments", {
					properties: {
						Author: 	oAuthorComment.	getValue(),
						Message: 	sTextCommentValue,
						Rating: 	oRatingComment.	getValue(),
						Posted: 	"" + new Date,
						ProductId: 	sProductId
					}});
				oODataModel.	submitChanges();
				oODataModel.	deleteCreatedEntry(oEntryCtx);
				oAuthorComment.	setValue("");
				oRatingComment.	setValue(0);
				oAuthorComment.	setValueState("None")
			}

		},
		/**
		 * "Filter" event handler of the Products.
		 *
		 * @param {sap.ui.base.Event} oEvent event object.
		 */
		onFilterComments: function (){
			this.byId("CommentsList")
				.getBinding("items")
				.filter	(new Filter("ProductId", FilterOperator.EQ, sProductId))
				.sort	(new Sorter("Posted", true));
		},
		/**
		 * "NavToStores" event handler of the Page.
		 */
		onNavToStoresOverview: function () {
			this.navigateTo("StoresOverview");
		},
		/**
		 * "NavToProducts" event handler of the Page.
		 */
		onNavToStoreDetails: function (oEvent) {
			var oCtx = oEvent.getSource().getBindingContext("odata");
			var sStoreId = oCtx.getObject("StoreId")
			this.navigateTo("StoreDetails", { storeId: sStoreId});
		},
	});
});
