sap.ui.define([
	"karina/komarovich/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, Filter, FilterOperator, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("karina.komarovich.controller.StoresOverview", {
		onInit: function (){
			// create JSONModel, which will be used for a new product creation purposes (just for convenience)
			var oNewStoreModel = new JSONModel({
				"Name": "",
				"Email": "",
				"PhoneNumber": 0,
				"Address": "",
				"Established": "",
				"FloorArea": 0
			});
			// set the new product model to the view
			this.getView().setModel(oNewStoreModel, "newStoreModel");
		},
		onNavToStoreDetails: function (oEvent) {
			// get the binding context of a selected item (it contains information about a single product)
			var sStoreId = oEvent.getSource().getBindingContext("odata").getObject("id");
			this.navigateTo("StoreDetails", { storeId: sStoreId });
		},

		/**
		 * "Search" event handler of the "SearchField".
		 *
		 * @param {sap.ui.base.Event} oEvent event object.
		 */
		onStoresSearch: function (oEvent) {
			var oStoressTable = this.byId("StoresTable");

			var oItemsBinding = oStoressTable.getBinding("items");

			// get the search string from control
			var sQuery = oEvent.getParameter("query");

			var oFilter = new Filter("Name", FilterOperator.Contains, sQuery);

			// execute filtering (passing the filter object)
			oItemsBinding.filter(oFilter);
		},

		onOpenDialogCreateStore: function () {
			var oView = this.getView();

			// if the dialog was not created before, then create it (lazy loading)
			if (!this.oDialog) {
				// use the xmlfragment factory function to get the controls from fragment
				// 1. it is recommended to pass the parent view's id as a first parameter to establish correct
				// prefixing of the controls' id's inside the fragment
				// 2. as an optional third parameter, the link to the object that will be used as a source of event
				// handlers can be passed
				this.oDialog = sap.ui.xmlfragment(oView.getId(), "karina.komarovich.view.fragments.CreateStoreDialog", this);

				// call the "addDependent" method in order to propagate all models and bindings from the view to
				// the controls from fragment
				oView.addDependent(this.oDialog);
				
			}

			// set context to the dialog
			this.oDialog.bindObject({
				path: "/formFields"
			});

			// open the dialog
			this.oDialog.open();
		},

		/**
		 * "Create" store button press event handler.
		 * 
		 *  @param {sap.ui.base.Event} oEvent event object
		 */
		onCreateStorePress: function () {
			var that = this,
				oODataModel = this.getView().getModel("odata"),
				oNewStoreModel	= this.getView().getModel("newStoreModel");

			// create a new product object
			var oNewStore = {
				"Name": 		oNewStoreModel.getProperty("/Name"),
				"Email": 		oNewStoreModel.getProperty("/Email"),
				"PhoneNumber": 	oNewStoreModel.getProperty("/PhoneNumber"),
				"Address": 		oNewStoreModel.getProperty("/Address"),
				"Established": 	oNewStoreModel.getProperty("/Established"),
				"FloorArea": 	oNewStoreModel.getProperty("/FloorArea")
			};

			// execute "create" request
			oODataModel.create("/Stores", oNewStore, {
				success: function () {
					MessageToast.show("{i18n>StoreCreateSuccessMessage}");
					that.oDialog.close();
				},
				error: function () {
					MessageBox.error("{i18n>StoreCreateErrorMessage}");
				}
			});
		},

		/**
		 * "Cancel" button press event handler (in the dialog).
		 */
		onCancelPress: function () {
			this.oDialog.close();
		},

		/**
		 * After dialog close event handler.
		 */
		onAfterClose: function () {
			var oFormModel = this.getView().getModel();
			var oODataModel = this.getView()
			var Two = oODataModel.getModel("odata");
			var mFormFields = oFormModel.getProperty("/formFields");

			// reset the values
			Object.keys(mFormFields).forEach(function (sKey) {
				oFormModel.setProperty("/formFields/" + sKey);
			});
		}
	});
});


