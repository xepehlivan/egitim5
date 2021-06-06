sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"../model/formatter"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast, formatter) {
	"use strict";

	return Controller.extend("renova.egitim5.controller.Master", {
		formatter: formatter,
		onInit: function () {
			// var aJsonData = [{
			// 	BookNo: 1,
			// 	BookName: "Satranç",
			// 	Writer: "Zweig",
			// 	Summary: 'Summarry 1',
			// 	TurkishTranslation: true,
			// 	ReleaseDate: new Date("01.01.1985"),
			// 	PictureUrl: ""
			// }, {
			// 	BookNo: 2,
			// 	BookName: "Şeker Portakalı",
			// 	Writer: "Mauro",
			// 	Summary: 'Summarry 2',
			// 	TurkishTranslation: false,
			// 	ReleaseDate: new Date("01.04.1983"),
			// 	PictureUrl: "https://i.dr.com.tr/cache/600x600-0/originals/0000000064031-1.jpg"
			// }];

			//json model
			// var oJsonModel = new JSONModel(aJsonData);
			// this.getView().setModel(oJsonModel, "BookModel");
		},
		onAfterRendering: function () {
			var that = this;
			var sRequest = {
				User: 'xepehlivan'
			};
			this.getView().getModel().callFunction("/CheckDate", {
				method: "GET",
				urlParameters: sRequest,
				async: true,
				success: function (oData, oResponse) {
					if (oData.CheckDate.Flag) {
						//that._getData();
						//that._getDataWithFm();
						that._getBookWithRfc();
						// that._getBookJson();
						return;
					}
					MessageBox.error(oData.CheckDate.Message);
				},
				error: function () {

				}
			});

		},
		_getData: function () {
			var that = this;
			var aFilters = [];
			aFilters.push(new Filter("BookNo", FilterOperator.EQ, '1'));
			this.getView().getModel().read("/BookSet", {
				filters: null,
				async: true,
				success: function (oData, oResponse) {
					var oJsonModel = new JSONModel(oData.results);
					that.getView().setModel(oJsonModel, "BookModel");
				},
				error: function (oData, oResponse) {

				}
			});
		},
		_getDataWithFm: function () {
			var that = this;
			var sRequest = {
				User: 'xepehlivan'
			};
			this.getView().getModel().callFunction("/GetBooks", {
				method: "GET",
				urlParameters: sRequest,
				async: true,
				success: function (oData, oResponse) {
					var oJsonModel = new JSONModel(oData.results);
					that.getView().setModel(oJsonModel, "BookModel");
				},
				error: function () {

				}
			});
		},
		_getBookWithRfc: function () {
			var that = this;
			this.getView().getModel().read("/EtBookSet", {
				filters: null,
				async: true,
				success: function (oData, oResponse) {
					var oJsonModel = new JSONModel(oData.results);
					that.getView().setModel(oJsonModel, "BookModel");
				},
				error: function (oData, oResponse) {

				}
			});
		},
		_getBookJson: function () {
			var that = this;
			this.getView().getModel().callFunction("/GetBookJson", {
				method: "GET",
				urlParameters: null,
				async: true,
				success: function (oData, oResponse) {
					var aData = JSON.parse(oData.GetBookJson.JsonData);
					var oJsonModel = new JSONModel(aData);
					that.getView().setModel(oJsonModel, "BookModel");
				},
				error: function () {

				}
			});
		},
		onGetDetail: function (oEvent) {
			var that = this;
			var sBookNo = oEvent.getSource().getBindingContext("BookModel").getProperty().BookNo;
			this.getView().getModel().read("/BookSet('" + sBookNo + "')", {
				filters: null,
				async: true,
				success: function (oData, oResponse) {

				},
				error: function (oData, oResponse) {

				}
			});
		},

		onAddBook: function () {
			var oJsonModel = new JSONModel({});
			this.getView().setModel(oJsonModel, "BookDetailModel");
			this._getBookDialog().open();
			sap.ui.getCore().byId("inputBookNo").setEditable(true);
		},
		onSaveBook: function () {
			var that = this;
			var sBookDetail = this.getView().getModel("BookDetailModel").getData();
			if (sap.ui.getCore().byId("inputBookNo").getEditable()) {
				this._getBusyDialog().open();
				this.getView().getModel().create("/BookSet", sBookDetail, {
					success: function (oData, oResponse) {
						that._getBusyDialog().close();
						if (oResponse.headers["sap-message"] !== undefined) {
							var sReturn = JSON.parse(oResponse.headers["sap-message"]).message;
							if (sReturn !== "") {
								MessageBox.error(sReturn);
								return;
							}
						}
						MessageBox.success("İşlem başarılı");
						that._getBookDialog().close();
					},
					error: function (oData, oResponse) {
						that._getBusyDialog().close();
					}
				});

			} else {
				this.getView().getModel().update("/BookSet('" + sBookDetail.BookNo + "')", sBookDetail, {
					success: function (oData, oResponse) {
						that._getBusyDialog().close();
						if (oResponse.headers["sap-message"] !== undefined) {
							var sReturn = JSON.parse(oResponse.headers["sap-message"]).message;
							if (sReturn !== "") {
								MessageBox.error(sReturn);
								return;
							}
						}
						MessageBox.success("İşlem başarılı");
						that._getBookDialog().close();
					},
					error: function (oData, oResponse) {
						that._getBusyDialog().close();
					}
				});
			}

		},
		onEditBook: function (oEvent) {
			var oJsonModel = new JSONModel(oEvent.getSource().getBindingContext("BookModel").getProperty());
			this.getView().setModel(oJsonModel, "BookDetailModel");
			this._getBookDialog().open();
			sap.ui.getCore().byId("inputBookNo").setEditable(false);
		},
		onDeleteBook: function (oEvent) {
			var that = this;
			var iIndex = parseInt(oEvent.getSource().getBindingContext("BookModel").getPath().split("/")[1]);
			var oProperty = oEvent.getSource().getBindingContext("BookModel").getProperty();
			MessageBox.error(oProperty.BookName + " isimli kitap silinecek. Devam etmek istiyor musunuz ?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (sAction) {
					if (sAction === "YES") {
						that.onDeleteConfirm(oProperty.BookNo);
						return;
					}
					MessageToast.show("Silme işlemi iptal eildi.");
					return;
				}
			});
		},
		onDeleteConfirm: function (sBookNo) {
			var that = this;
			this._getBusyDialog().open();
			this.getView().getModel().remove("/BookSet('" + sBookNo + "')", {
				success: function (oData, oResponse) {
					that._getBusyDialog().close();
					that._getData();
				},
				error: function (oData, oResponse) {
					that._getBusyDialog().close();
				}
			});
		},
		onSearchBook: function (oEvent) {
			var sQuery = oEvent.getParameters().query;
			var aFilter = [];
			if (sQuery !== "") {
				aFilter.push(new Filter("BookName", FilterOperator.Contains, sQuery));
			}

			//filter binding
			var oBookTable = this.getView().byId("idBookTable");
			var oBindingItems = oBookTable.getBinding("items");
			oBindingItems.filter(aFilter);
		},
		onSelectBook: function (oEvent) {
			var oJsonModel = new JSONModel(oEvent.getSource().getSelectedItem().getBindingContext("BookModel").getProperty());
			this.getView().setModel(oJsonModel, "BookDetailModel");
			this._getBookDialog().open();
		},

		//Onaylama/Reddetme
		onSendStatus: function () {
			var aBooks = [];
			var aSelectedItems = this.byId("idBookTable").getSelectedItems();
			if (this.byId("idBookTable").getSelectedItem() === null) {
				MessageBox.error("Lütfen en az 1 satır seçiniz");
				return;
			}

			if (this.byId("cBoxStatus").getSelectedKey() === "") {
				MessageBox.error("Lütfen statü seçiniz");
				return;
			}

			for (var i = 0; i < aSelectedItems.length; i++) {
				var oProperty = aSelectedItems[i].getBindingContext("BookModel").getProperty();
				aBooks.push({
					BookNo: oProperty.BookNo
				});
			}

			var sRequest = {
				OperationType: this.byId("cBoxStatus").getSelectedKey(),
				HeadertoBooks: aBooks,
				HeadertoReturns: []
			};

			this.getView().getModel().create("/HeaderSet", sRequest, {
				async: true,
				success: function (oData, oResponse) {

				},
				error: function (oData, oResponse) {

				}

			});
		},
		onGetDataWithExp: function () {
			// var that = this;
			// var sStatu = this.byId("cBoxStatus").getSelectedKey();
			// if (sStatu === "") {
			// 	MessageBox.error("Lütfen statü seçiniz");
			// 	return;
			// }

			// this.getView().getModel().read("/HeaderSet('" + sStatu + "')", {
			// 	async: true,
			// 	urlParameters:{
			// 		"$expand" : "HeadertoBooks,HeadertoReturns",
			// 	},
			// 	success: function (oData, oResponse) {

			// 	},
			// 	error: function (oData, oResponse) {

			// 	}
			// });

			var that = this;
			// var sStatu = this.byId("cBoxStatus").getSelectedKey();
			// if (sStatu === "") {
			// 	MessageBox.error("Lütfen statü seçiniz");
			// 	return;
			// }

			this.getView().getModel().read("/HeaderSet", {
				async: true,
				urlParameters: {
					"$expand": "HeadertoBooks,HeadertoReturns",
				},
				success: function (oData, oResponse) {

				},
				error: function (oData, oResponse) {

				}
			});
		},
		onSendDataWithJson: function () {
			var that = this;
			var aBooks = [];
			var aSelectedItems = this.byId("idBookTable").getSelectedItems();
			if (this.byId("idBookTable").getSelectedItem() === null) {
				MessageBox.error("Lütfen en az 1 satır seçiniz");
				return;
			}

			if (this.byId("cBoxStatus").getSelectedKey() === "") {
				MessageBox.error("Lütfen statü seçiniz");
				return;
			}

			for (var i = 0; i < aSelectedItems.length; i++) {
				var oProperty = aSelectedItems[i].getBindingContext("BookModel").getProperty();
				aBooks.push({
					BookNo: oProperty.BookNo
				});
			}

			var sRequest = {
				OperationType: this.byId("cBoxStatus").getSelectedKey(),
				JsonData: JSON.stringify(aBooks)
			};
			this.getView().getModel().callFunction("/SetBookJson", {
				method: "GET",
				urlParameters: sRequest,
				async: true,
				success: function (oData, oResponse) {
					if (oData.SetBookJson.Flag) {
						//that._getData();
						//that._getDataWithFm();
						that._getBookWithRfc();
						return;
					}
				},
				error: function () {

				}
			});
		},

		//dialogs
		_getBookDialog: function () {
			this._oBookDialog = sap.ui.getCore().byId("dialogBook");
			if (!this._oBookDialog) {
				this._oBookDialog = sap.ui.xmlfragment("renova.egitim5.fragments.Book", this);
				this.getView().addDependent(this._oBookDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oBookDialog);
			}
			return this._oBookDialog;
		},
		_getBusyDialog: function () {
			this._oBusyDialog = sap.ui.getCore().byId("busyDialog");
			if (!this._oBusyDialog) {
				this._oBusyDialog = sap.ui.xmlfragment("renova.egitim5.fragments.Busy", this);
				this.getView().addDependent(this._oBusyDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oBusyDialog);
			}
			return this._oBusyDialog;
		}
	});
});