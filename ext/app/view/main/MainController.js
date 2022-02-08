Ext.define("Chat.view.main.MainController", {
  extend: "Ext.app.ViewController",
  alias: "controller.main",
  onItemSelected: function () {
    Ext.Msg.confirm("Confirm", "Are you sure", "onConfirm");
  },
  onConfirm: function (choice) {
    if (choice === "yes") {
      //
    }
  },
});
