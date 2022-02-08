Ext.define("Chat.view.main.Main", {
  extend: "Ext.tab.Panel",
  xtype: "app-main",
  requires: [],
  controller: "main",
  viewModel: "main",
  ui: "navigation",
  tabBarHeaderPosition: 1,
  titleRotation: 0,
  tabRotation: 0,
  header: {
    layout: {
      align: "stretchmax",
    },
    title: {
      bind: {
        text: "{name}",
      },
      flex: 0,
    },
    iconCls: "fa-th-list",
  },
  yabBar: {
    flex: 1,
    layout: {
      align: "stretch",
      overflowHandler: "none",
    },
  },
  resposiveConfig: {
    tall: {
      headerPosition: "top",
    },
    wide: {
      headerPosition: "left",
    },
  },
  defaults: {
    bodyPadding: 20,
    tabConfig: {
      resposiveConfig: {
        wide: {
          iconAlign: "left",
          textAlign: "left",
        },
        tall: {
          iconAlign: "top",
          textAlign: "center",
          width: 120,
        },
      },
    },
  },
  items: [
    {
      title: "Home",
      iconCls: "fa-home",
      items: [
        {
          xtype: "mainlist",
        },
      ],
    },
    {
      title: "Users",
      iconCls: "fa-user",
      bind: {
        html: "{loremIpsum}",
      },
    },
  ],
});
