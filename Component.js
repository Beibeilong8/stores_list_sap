sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, BaseController) {
	"use strict";

	return UIComponent.extend("karina.komarovich.Component", {
		metadata: {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			// var oODataModel = new ODataModel("http://localhost:3000/odata", {

			// 	defaultBindingMode: "TwoWay"
			// });

			// this.setModel(oODataModel, "odata");

			// window.odatamodel = oODataModel;

			this.getRouter().initialize();
		}
	});
});