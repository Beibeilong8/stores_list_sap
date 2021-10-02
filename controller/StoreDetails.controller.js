sap.ui.define([
	"karina/komarovich/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, Sorter, MessageToast, MessageBox) {
	"use strict";
	/**
	* Constants for save store id
	*/
	var sStoreId;
	/**
	* Constants for sorting modes
	*/
	var SORT_NONE	= "";
	/**
	* Constants for sorting modes
	*/
	var SORT_ASC	= "ASC";
	/**
	* Constants for sorting modes
	*/
	var SORT_DESC	= "DESC";
	/**
	* Constants for array products create and edite input
	*/
	var aProductInputs;

	return BaseController.extend("karina.komarovich.controller.StoreDetails", {
		/**
		 * Controller's "init" lifecycle method.
		 */
		onInit: function(){
			this.getOwnerComponent().getRouter().getRoute("StoreDetails").attachPatternMatched(this.onPatternMatched, this);
			var oModel = new JSONModel({
				sortType: SORT_NONE,
			});
			this.oModel = oModel
			var oNewProductModel = new JSONModel({
				Name: "",
				Price: "",
				Specs: "",
				Rating: "",
				SupplierInfo: "",
				MadeIn: "",
				ProductionCompanyName: "",
				Status: "",
				createNewProduct: true
			});

			this.getView().setModel(oNewProductModel, "newProductModel");
			this.getView().setModel(oModel, "appView");
		},
		/**
		 * Controller's lifecycle method after rendering.
		 */
		onAfterRendering: function () {
			var oODataModel 	= this.getView().getModel("odata");
			var oAppView 		= this.getView().getModel("appView");
			var oProductsTable 	= this.byId("ProductsTable");
			var oBinding 		= oProductsTable.getBinding("items");
	  
			oBinding.attachDataReceived(function () {
			  var oCtx 			= oProductsTable.getBindingContext("odata");
			  var sStoresPath 	= oODataModel.createKey("/Stores", oCtx.getObject());
			  var aStatuses 	= ["ALL", "OK", "STORAGE", "OUT_OF_STOCK"];
	  
			  aStatuses.forEach(function (sStatus) {
				var oParams = {
				  success: function (sCount) {
					oAppView.setProperty(
					  "/" + sStatus.toLowerCase() + "ProductsCount",
					  sCount
					);
				  },
				};
				if (sStatus !== "ALL") {
					oParams.filters = [new Filter("Status", FilterOperator.EQ, sStatus)];
				};
				oODataModel.read(sStoresPath + "/rel_Products/$count", oParams);
			  });
			});
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
			sStoreId 		= oEvent.getParameter("arguments").storeId;

			oODataModel.metadataLoaded().then(function (){
				var sKey = oODataModel.createKey("/Stores", { id: sStoreId });
				that.getView().bindObject({
					path: sKey,
					model: "odata"
				});
			});
		},
		/**
		 * "Search" event handler of the "SearchField".
		 *
		 * @param {sap.ui.base.Event} oEvent event object.
		 */
		onProductSearch: function (oEvent) {
			var oProductsTable 	= this.byId("ProductsTable");
			var oItemsBinding 	= oProductsTable.getBinding("items");
			var sQuery 			= oEvent.getParameter("query");
			oItemsBinding.filter(new Filter({
				filters: [
				  new Filter({
					path: "Name",
					operator: FilterOperator.Contains,
					value1: sQuery
				  }),
				  new Filter({
					path: "Specs",
					operator: FilterOperator.Contains,
					value1: sQuery
				  }),
				  new Filter({
					path: "SupplierInfo",
					operator: FilterOperator.Contains,
					value1: sQuery
				  }),
				  new Filter({
					path: "MadeIn",
					operator: FilterOperator.Contains,
					value1: sQuery
				  }),
				  new Filter({
					path: "ProductionCompanyName",
					operator: FilterOperator.Contains,
					value1: sQuery
				  }),
				]
			  }));
		},
		/**
		 * "Filter" event handler of the "Filters".
		 *
		 * @param {sap.ui.base.Event} oEvent event object.
		 */
		onFilterSelect: function (oEvent){
			var oBinding 		= this.byId("ProductsTable").getBinding("items");
			var sKey 			= oEvent.getParameter("key");
			var sfilterValue 	= new Filter("Status", FilterOperator.Contains, "");

			if (sKey !== "ALL") {
				sfilterValue = new Filter("Status", FilterOperator.EQ, sKey);
			}
			oBinding.filter(sfilterValue);			
		},
		/**
		 * "Sort" button press event handler.
		 * 
		 * @param {sap.ui.base.Event} oEvent event object.
		 * @param {string} sSortColumn sorting column.
		 * 
		 */
		onSortButtonPress: function (oEvent, sSortColumn) {
			var sSortType = this.oModel.getProperty("/sortType");
			var sSortIcon;
			switch (sSortType) {
				case SORT_NONE: {
					sSortType = SORT_ASC;
					sSortIcon = "sort-ascending";
					break;
				}

				case SORT_ASC: {
					sSortType = SORT_DESC;
					sSortIcon = "sort-descending";
					break;
				}

				case SORT_DESC: {
					sSortType = SORT_NONE;
					sSortIcon = "sort";
					break;
				}
			};
			var oProductsTable = this.byId("ProductsTable");
			this.oModel.setProperty("/sortType", sSortType);
			oEvent.getSource().setIcon(`sap-icon://${sSortIcon}`);
			if(sSortType === SORT_NONE){
				oProductsTable.getBinding("items").sort(null);
				return
			};
			var bSortDesc 	= sSortType === SORT_DESC;
			var oSorter 	= new Sorter(sSortColumn, bSortDesc);
			oProductsTable.getBinding("items").sort(oSorter);
			oProductsTable.getBinding().sort(null);
		},
		/**
		 * "Edit" product button press event handler.
		 * 
		 *  @param {sap.ui.base.Event} oEvent event object
		 */
		onEditProductPress: function(oEvent){
			var oView 		= this.getView();
			var oCtx 		= oEvent.getSource().getBindingContext("odata");
			var oODataModel = oCtx.getModel("odata");
			oView.getModel("appView").setProperty("/createNewProduct", false);
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment(oView.getId(), "karina.komarovich.view.fragments.CreateProductDialog", this);
				oView.addDependent(this.oDialog);
			}
			this.oDialog.setBindingContext(oCtx);
			this.oDialog.setModel(oODataModel);
			this.oDialog.open();
		},
		/**
		* "Create" product button press event handler.
		* 
		*  @param {sap.ui.base.Event} oEvent event object
		*/
		onSaveChangesProductPress: function () {
			if(!this.onValidationCheck(aProductInputs)){
				var oODataModel = this.getView().getModel("odata");
				oODataModel.submitChanges();
				oODataModel.deleteCreatedEntry(this.oDialog.getBindingContext());
				this.oDialog.close();
			};
		},
		/**
		 * "Delete" product button press event handler.
		 */
		onDeleteProductPress: function (oEvent) {
			var that 	= this;
			var oCtx 	= oEvent.getSource().getBindingContext("odata");
			var	oBundle = this.getView().getModel("i18n").getResourceBundle();
			
			MessageBox.confirm(oBundle.getText("ProductDeleteApproval"), (oAction) => {
				if(oAction ==="OK"){
					var oODataModel = that.getView().getModel("odata");
					var sKey 		= oODataModel.createKey("/Products", oCtx.getObject());
					// execute "delete" request of the entity, specified in a key
					oODataModel.remove(sKey, {
						success: function () {
							MessageToast.show(oBundle.getText("ProductDeleteSuccessMessage"));
						},
						error: function () {
							MessageBox.error(oBundle.getText("ProductDeleteErrorMessage"));
						}
					});
				}
			})
		},
		/**
		 * "Create product" button press event handler (open the dialog).
		 */
		onOpenDialogCreateProduct: function () {
			var oView 		= this.getView();
			var oODataModel = oView.getModel("odata");
			oView.getModel("appView").setProperty("/createNewProduct", true);
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment(oView.getId(), "karina.komarovich.view.fragments.CreateProductDialog", this);
				oView.addDependent(this.oDialog);
			}
			var oEntryCtx = oODataModel.createEntry("/Products", {properties: {StoreId: sStoreId}});
			this.oDialog.setBindingContext(oEntryCtx);
			this.oDialog.setModel(oODataModel);
			this.oDialog.open();
			aProductInputs = [
				this.getView().byId("ProductName"),
				this.getView().byId("ProductPrice"),
				this.getView().byId("ProductSpecs"),
				this.getView().byId("ProductRating"),
				this.getView().byId("ProductSupplier"),
				this.getView().byId("ProductMadeIn"),
				this.getView().byId("ProductCompany")
			];
			aProductInputs.forEach((item) => {item.setValueState("None")});
		},
		/**
		 * "Delete" store button press event handler.
		 */
		onDeleteStorePress: function (oEvent) {
			var that 	= this;
			var	oBundle = this.getView().getModel("i18n").getResourceBundle();
			MessageBox.confirm(oBundle.getText("StoreDeleteApproval"), (oAction) => {
				if(oAction ==="OK"){
					var oODataModel = that.getView().getModel("odata");
					var sKey 		= oODataModel.createKey("/Stores", { id: sStoreId});
					oODataModel.remove(sKey, {
						success: function () {
							MessageToast.show(oBundle.getText("StoreDeleteSuccessMessage"));
							that.navigateTo("StoresOverview");
						},
						error: function () {
							MessageBox.error(oBundle.getText("StoreDeleteErrorMessage"));
						}
					});
				}
			})		
		},
		/**
		 * "Cancel" button press event handler (in the dialog).
		 */
		onCancelPress: function () {
			var oODataModel = this.getView().getModel("odata");
			var oCtx 		= this.oDialog.getBindingContext();

			oODataModel.deleteCreatedEntry(oCtx);
			this.oDialog.close();
		},
		/**
		 * "NavToStores" event handler of the Page.
		 */
		onNavToStoresOverview: function () {
			this.navigateTo("StoresOverview");
		},
		/**
		 * "NavToComments" event handler of the Page.
		 */
		onNavToProductDetails: function (oEvent) {
			var sProductId = oEvent.getSource().getBindingContext("odata").getObject("id")
			this.navigateTo("ProductDetails", { storeId: sStoreId, productId: sProductId });
		}
	});
});