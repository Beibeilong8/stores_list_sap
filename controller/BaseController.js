sap.ui.define([
	"sap/ui/core/mvc/Controller",
], function (Controller, ) {
	"use strict";
	/**
	* Constants for validation input
	*/
	var bValidationError;

	return Controller.extend("karina.komarovich.controller.BaseController", {
		/**
		 * Navigation to of the Pages.
		 */
		navigateTo: function (sName, oParameters) {
			this.getOwnerComponent().getRouter().navTo(sName, oParameters);
		},
		/**
		 * Validation of form method.
		 *
		 * @param {Array} array for validation.
		 */
		onValidationCheck(aInputs){
			bValidationError = false
			aInputs.forEach((item) => {this.onValidationInputCheck(item)})
			return bValidationError
		},
		/**
		 * Validation of input form method.
		 *
		 * @param {Object}  input for validation.
		 */
		onValidationInputCheck(oInput){
			try{
				oInput.getBinding("value").getType().validateValue(oInput.getValue());
				oInput.setValueState("None");
				bValidationError === true ? true : false;
			} catch (oErr){
				oInput.setValueState("Error");
				bValidationError = true;
			}
			return bValidationError
		},
	});
});