sap.ui.define([
	"sap/ui/core/mvc/Controller",
], function (Controller) {
	"use strict";

	return Controller.extend("karina.komarovich.controller.BaseController", {
		navigateTo: function (sName, oParameters) {
			this.getOwnerComponent().getRouter().navTo(sName, oParameters);
		},
	});
});