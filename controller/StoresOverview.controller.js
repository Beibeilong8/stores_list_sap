sap.ui.define([
	"karina/komarovich/controller/BaseController",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, ResourceModel, Filter, FilterOperator) {
	"use strict";
	/**
	* Constants for array store create input
	*/
	var aStoreInputs;

	return BaseController.extend("karina.komarovich.controller.StoresOverview", {
		/**
		 * Controller's "init" lifecycle method.
		 */
		onInit: function (){
			var oI18NModel= new ResourceModel({ bundleName: "karina.komarovich.i18n.i18n"});
			this.getView().setModel(oI18NModel, "i18n");
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

			// execute filtering (passing the filter object)
			oItemsBinding.filter(new Filter({
				filters: [
					new Filter({
						path: "Name",
						operator: FilterOperator.Contains,
						value1: sQuery
					}),

					new Filter({
						path: "Address",
						operator: FilterOperator.Contains,
						value1: sQuery
					}),
				]
			}));
		},
		/**
		 * "Create Store" button press event handler (open the dialog).
		 */
		onOpenDialogCreateStore: function () {
			var oView = this.getView();
			var oODataModel = oView.getModel("odata");

			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment(oView.getId(), "karina.komarovich.view.fragments.CreateStoreDialog", this);
				oView.addDependent(this.oDialog);	
			}
			var oEntryCtx = oODataModel.createEntry("/Stores");
			this.oDialog.setBindingContext(oEntryCtx);
			this.oDialog.setModel(oODataModel);
			this.oDialog.open();
			aStoreInputs = [
				this.getView().byId("StoreName"),
				this.getView().byId("StoreEmail"),
				this.getView().byId("StorePhone"),
				this.getView().byId("StoreAddress"),
				this.getView().byId("StoreFloorArea"),
			];
			aStoreInputs.forEach((item) => {item.setValueState("None")});
		},
		/**
		 * "Create" store button press event handler.
		 */
		onCreateStorePress: function () {
			if(!this.onValidationCheck(aStoreInputs)){
				var oODataModel = this.getView().getModel("odata");
				oODataModel.submitChanges();
				oODataModel.deleteCreatedEntry(this.oDialog.getBindingContext());
				this.oDialog.close();
			};
		},
		/**
		 * "Cancel" button press event handler (in the dialog).
		 */
		onCancelPress: function () {
			var oODataModel = this.getView().getModel("odata");

			var oCtx = this.oDialog.getBindingContext();

			// delete the entry from requests queue
			oODataModel.deleteCreatedEntry(oCtx);
			this.oDialog.close();
		},
		/**
		 * "NavToProducts" event handler of the Page.
		 */
		onNavToStoreDetails: function (oEvent) {
			// get the binding context of a selected item (it contains information about a single product)
			var sStoreId = oEvent.getSource().getBindingContext("odata").getObject("id");
			this.navigateTo("StoreDetails", { storeId: sStoreId });
		},
	});
});


