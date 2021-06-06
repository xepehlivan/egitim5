sap.ui.define([], function () {
	"use strict";
	return {
		turkishTranslationText: function (bTranslation) {
			if (bTranslation) {
				return "Çeviri Var";
			}
			return "Çeviri Yok";
		}
	};
});