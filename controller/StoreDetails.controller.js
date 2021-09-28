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
	var sStoreId;

	// constants for sorting modes
	var SORT_NONE	= "";
	var SORT_ASC	= "ASC";
	var SORT_DESC	= "DESC";

	return BaseController.extend("karina.komarovich.controller.StoreDetails", {
		onInit: function(){

			this.getOwnerComponent().getRouter().getRoute("StoreDetails").attachPatternMatched(this.onPatternMatched, this);
			
			var oModel = new JSONModel({
				sortType: SORT_NONE
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
			});
			// set the new product model to the view
			this.getView().setModel(oNewProductModel, "newProductModel");
			this.getView().setModel(oModel, "appView");
		},

		onAfterRendering: function () {
			var oODataModel = this.getView().getModel("odata");
			var oProductsTable = this.byId("ProductsTable");
			var oBinding = oProductsTable.getBinding("items");
			var oAppView = this.getView().getModel("appView");
	  
			oBinding.attachDataReceived(function () {
			  var oCtx = oProductsTable.getBindingContext("odata");
			  var sStoresPath = oODataModel.createKey("/Stores", oCtx.getObject());
			  var aStatuses = ["ALL", "OK", "STORAGE", "OUT_OF_STOCK"];
	  
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
				  oParams.filters = [
					new Filter("Status", FilterOperator.EQ, sStatus),
				  ];
				};
	  
				oODataModel.read(sStoresPath + "/rel_Products/$count", oParams);
			  });
			});
		},

		onPatternMatched: function (oEvent) {
			var that = this;
			sStoreId = oEvent.mParameters.arguments.storeId;
			var oODataModel = that.getView().getModel("odata");
			oODataModel.metadataLoaded().then(function (){
				var sKey = oODataModel.createKey("/Stores", { id: sStoreId});
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
			var oProductsTable = this.byId("ProductsTable");

			var oItemsBinding = oProductsTable.getBinding("items");

			// get the search string from control
			var sQuery = oEvent.getParameter("query");

			var oFilter = new Filter("Name", FilterOperator.Contains, sQuery);

			// execute filtering (passing the filter object)
			oItemsBinding.filter(oFilter);
		},

		onFilterSelect: function (oEvent){
			var oBinding = this.byId("ProductsTable").getBinding("items"),
				sKey = oEvent.getParameter("key"),
				sfilterValue = new Filter("Status", FilterOperator.Contains, "")

			if (sKey !== "ALL") {
				sfilterValue = new Filter("Status", FilterOperator.EQ, sKey);
			}
			oBinding.filter(sfilterValue);			
		},

		/**
		 * "Sort" button press event handler.
		 */
		onSortButtonPress: function (oEvent) {
			// get current sorting type
			var sSortType = this.oModel.getProperty("/sortType");

			var sSortColumn = oEvent.oSource.mProperties.text

			// a bit of logic, how the types should replace each other
			switch (sSortType) {
				case SORT_NONE: {
					sSortType = SORT_ASC;
					break;
				}

				case SORT_ASC: {
					sSortType = SORT_DESC;
					break;
				}

				case SORT_DESC: {
					sSortType = SORT_ASC;
					break;
				}
			}

			// update the models' property with new sorting type
			this.oModel.setProperty("/sortType", sSortType);

			// get products table control
			var oProductsTable = this.byId("ProductsTable");

			var item = oProductsTable.mAggregations.columns.sSortColumn

			// get the "items" binding object from the products table
			var oItemsBinding = oProductsTable.getBinding("items");

			// create sorter object
			var bSortDesc = sSortType === SORT_DESC;
			var oSorter = new Sorter(sSortColumn, bSortDesc);

			// perform sorting
			oItemsBinding.sort(oSorter);
		},
					
		/**
		 * Formatter for the icon used in a sort trigger button.
		 *
		 * @param {string} sSortType sorting type.
		 *
		 * @returns {string} icon name.
		 */
		sortTypeFormatter: function (sSortType) {
			switch (sSortType) {
				case SORT_NONE: {
					return "sort";
				}
				case SORT_ASC: {
					return "sort-ascending";
				}
				case SORT_DESC: {
					return "sort-descending";
				}
				default: {
					return "sort";
				}
			}
		},
		/**
		 * "Create" supplier button press event handler.
		 * 
		 *  @param {sap.ui.base.Event} oEvent event object
		 */
		onCreateProductPress: function () {
			var that 				= this,
				oODataModel 		= this.getView().getModel("odata"),
				oNewProductModel	= this.getView().getModel("newProductModel");

			// create a new product object
			var oNewProduct = {
				"Name": 					oNewProductModel.getProperty("/Name"),
				"Price": 					oNewProductModel.getProperty("/Price"),
				"Specs": 					oNewProductModel.getProperty("/Specs"),
				"Rating": 					oNewProductModel.getProperty("/Rating"),
				"SupplierInfo": 			oNewProductModel.getProperty("/SupplierInfo"),
				"MadeIn": 					oNewProductModel.getProperty("/MadeIn"),
				"ProductionCompanyName": 	oNewProductModel.getProperty("/ProductionCompanyName"),
				"Status": 					oNewProductModel.getProperty("/Status"),
				"StoreId": 					sStoreId
			};

			// execute "create" request
			oODataModel.create("/Products", oNewProduct, {
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
		 * "Delete" product button press event handler.
		 *
		 * 
		 */
		onDeleteProductPress: function (oEvent) {
			var that = this;
			var oODataModel = that.getView().getModel("odata");
			var sProductId = oEvent.getSource().getBindingContext("odata").getObject("id")
			
			
			
			
			
			
			// execute "delete" request of the entity, specified in a key
			
			// MessageBox.confirm("{i18n>ProductDeleteApproval}", {
			// 	actions: ["Manage Products", MessageBox.Action.CLOSE],
			// 	emphasizedAction: "Manage Products",
			// 	onClose: function (sAction) {
			// 		MessageToast.show("Action selected: " + sAction);
			// 	}
			// });
			
			MessageBox.confirm("{i18n>ProductDeleteApproval}")
			oODataModel.remove(sProductId, {
				success: function () {
					MessageToast.show("{i18n>ProductDeleteSuccessMessage}");
				},
				error: function () {
					MessageBox.error("{i18nProductDeleteErrorMessage}");
				}
			});

		},
		onOpenDialogCreateProduct: function () {
			var oView = this.getView();

			// if the dialog was not created before, then create it (lazy loading)
			if (!this.oDialog) {
				// use the xmlfragment factory function to get the controls from fragment
				// 1. it is recommended to pass the parent view's id as a first parameter to establish correct
				// prefixing of the controls' id's inside the fragment
				// 2. as an optional third parameter, the link to the object that will be used as a source of event
				// handlers can be passed
				this.oDialog = sap.ui.xmlfragment(oView.getId(), "karina.komarovich.view.fragments.CreateProductDialog", this);

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
		 * "Delete" store button press event handler.
		 *
		 * 
		 */
		onDeleteStorePress: function () {
			var that = this;
			var oODataModel = that.getView().getModel("odata");
			var sKey = oODataModel.createKey("/Stores", { id: sStoreId});
			// execute "delete" request of the entity, specified in a key

			var func = MessageBox.confirm("{i18n>StoreDeleteApproval}")
			oODataModel.remove(sKey, {
				success: function () {
					MessageToast.show("{i18n>StoreDeleteSuccessMessage}");
					that.navigateTo("StoresOverview");
				},
				error: function () {
					MessageBox.error("{i18n>StoreDeleteErrorMessage}");
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

			var mFormFields = oFormModel.getProperty("/formFields");

			// reset the values
			Object.keys(mFormFields).forEach(function (sKey) {
				oFormModel.setProperty("/formFields/" + sKey);
			});
		},



		onNavToStoresOverview: function () {
			this.navigateTo("StoresOverview");
		},

		onNavToProductDetails: function (oEvent) {
			var sProductId = oEvent.getSource().getBindingContext("odata").getObject("id")
			this.navigateTo("ProductDetails", { storeId: sStoreId, productId: sProductId });
		}
	});
});
