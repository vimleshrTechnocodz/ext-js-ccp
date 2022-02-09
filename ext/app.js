const getNotificationIcon = () => {
  return [
    {
      xtype: "button",
      text: "<span id='notificationcount'>0</span>",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "5px",
        overflow: "visible",
        background: "url(/bell.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        border: 0,
        width: "50px",
        height: "23px",
      },
      scale: "small",
      handler: function (event, toolEl, owner, tool) {
        var pop = document.getElementById("notipop");
        if (pop.style.display === "block") pop.style.display = "none";
        else pop.style.display = "block";
      },
    },
    {
      xtype: "button",
      text: "Chat Now",
      menu: new Ext.menu.Menu({
        items: [
          // these will render as dropdown menu items when the arrow is clicked:
          {
            text: "Item 1",
            handler: function () {
              alert("Item 1 clicked");
            },
          },
          {
            text: "Item 2",
            handler: function () {
              alert("Item 2 clicked");
            },
          },
        ],
      }),
      handler: function (event, toolEl, owner, tool) {
        alert("hi");
      },
    },
  ];
};

Ext.onReady(function () {
  Ext.create("Ext.Panel", {
    renderTo: "helloExt",
    defaults: {
      flex: 1,
    },
    style: {
      height: "auto",
      overflow: "visible",
      zIndex: "9",
    },
    // items: {
    //   html: "First Panel",
    //   style: {
    //     background: "red",
    //     height: 500,
    //   },
    // },

    header: {
      xtype: "header",
      style: {
        background: "#4ea5a9",
        border: 0,
        minHeight: 60,
        height: "-webkit-fill-available",
        overflow: "visible",
        zIndex: "9",
      },
      titlePosition: 0,
      tools: getNotificationIcon(),
    },
  });
});
