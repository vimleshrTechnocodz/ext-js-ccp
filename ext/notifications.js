//Notification

//Variables
var chatList = [];
var userList = [];
var userListData = [];
var me;
var selectedConversation = {};
var selectWorkSpace = {};
var listenerID = constent.UNIQUE_LISTENER_ID;
var appID = constent.APP_ID; // Not sharing actual keys
var region = constent.REGION;
var authKey = constent.AUTH_KEY;
var workspaceList = [];
var token = "";
const getToken = () => {
  // token = localStorage.getItem("workspaceToken");
  token = localStorage.getItem("CCPRO_AUTH_TOKEN");
  if (token) {
    token = JSON.parse(JSON.parse(token)).access_token;
    getWorkspace();
    return;
  } else {
    console.log("Please log in");
    return;
  }
  // var myHeaders = new Headers();
  // myHeaders.append("app-key", constent.APP_KEY);
  // myHeaders.append("user-id", "uid_1");

  // var requestOptions = {
  //   method: "POST",
  //   headers: myHeaders,
  //   redirect: "follow",
  // };

  // fetch("https://ccpro.webcase.me/api/auth/get_token", requestOptions)
  //   .then((response) => {
  //     response.headers.forEach(function (val, key) {
  //       if (key === "token") {
  //         token = "Bearer " + val;
  //         localStorage.setItem("workspaceToken", token);
  //         getWorkspace();
  //       }
  //     });
  //     return response.text();
  //   })
  //   .then((result) => {
  //     console.log(result, "Success");
  //   })
  //   .catch((error) => console.log("error", error));
  // console.log(token, "token");
};

////Set setWorkspace
const setCurrentWorkspace = (workspace = {}) => {
  selectWorkSpace = workspace;
  setNotificationMessages();
  //localStorage.setItem("workspaceObject", JSON.stringify(workspace));
};

////Get setWorkspace
const getCurrentWorkspace = () => {
  return selectWorkSpace;
  // var retrievedObject = localStorage.getItem("workspaceObject");
  // if (retrievedObject) return JSON.parse(retrievedObject);
  // else return {};
};
///Ping Active token
setInterval(() => {
  var actWS = localStorage.getItem("ACTIVE_WORKSPACE");
  if (actWS && JSON.parse(actWS).st_guid !== selectWorkSpace.st_guid) {
    setCurrentWorkspace(JSON.parse(actWS));
    getConversation();
    console.log(JSON.parse(actWS), "ACTIVE_WORKSPACE");
  }
}, 1000);
///Set Notification Template

const setNotificationMessages = () => {
  var cnt = 0;

  var messages = [];
  var workspace = workspaceList.find(
    (ws) => ws.st_guid === getCurrentWorkspace().st_guid
  );
  if (workspace && workspace.js_users) {
    var urs = workspace.js_users.filter((ur) => ur.uid !== me.uid);
    urs.forEach((us) => {
      if (us.messages && us.unreadMessageCount) {
        messages = [
          ...messages,
          us.messages.filter((me) => !me.fromSelf)[
            us.messages.filter((me) => !me.fromSelf).length - 1
          ],
        ];
      }
      cnt = cnt + (us.unreadMessageCount ? us.unreadMessageCount : 0);
    });
    newNotification(cnt);
  }
  if (messages.length) {
    var popp = "<div id='notipop' class='notipop'><ul>";
    popp =
      popp +
      "<li class='chatcoumt'><i class='fa fa-comments-o'></i> Chat Messages <span> " +
      cnt +
      "</span></li>";
    popp = popp + "<li class='notititle'>Notifications </li>";
    messages.forEach((mes) => {
      popp =
        popp +
        "<li class='notimsg'><i class='fa fa-comments-o'></i> " +
        (mes?.content
          ? mes.content
          : mes.data?.url
          ? "<img src='" + mes.data?.url + "' style='width: 50px;'/>"
          : mes.data?.customData?.sticker_url
          ? "<img src='" +
            mes.data?.customData?.sticker_url +
            "' style='width: 50px;'/>"
          : "") +
        "<span class='msg-time'>" +
        timeSince(new Date(mes.time * 1000)) +
        "</spa>";
      (" </li>");
    });
    popp =
      popp +
      "<li class='chatbtn'>  <button>See All Notifications </button></li>";
    popp = popp + "</ul></div>";
    document.getElementById("notificationcount").innerHTML = cnt + popp;
  }
};

const getWorkspace = async () => {
  var myHeaders = new Headers();
  myHeaders.append("token", "");
  myHeaders.append("Authorization", "Bearer " + token);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  fetch(
    "https://ccpro.webcase.me/api/user/workspaces/?user_id=" +
      me.uid +
      "&user_role=default",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      var groupListJson = JSON.parse(result).data.data;
      workspaceList = [
        ...workspaceList,
        ...groupListJson.map((g) =>
          g
            ? {
                ...g,
                js_users: [] /*JSON.parse(g.js_users).map((u) =>
                  u ? { uid: u, name: u } : {}
                )*/,
              }
            : []
        ),
      ];
      const ids = workspaceList.map((o) => o.st_guid);
      const filtered = workspaceList.filter(
        ({ st_guid }, index) => !ids.includes(st_guid, index + 1)
      );
      workspaceList = filtered;
      getGroups();
      getUsers();
    })
    .catch((error) => console.log("error", error));
};

const newNotification = (data) => {
  document.getElementById("notificationcount").innerHTML = data;
};
//Group List
const listGroup = (workspaceList = []) => {
  if (workspaceList.length) {
    document.getElementById("grouplist").innerHTML = "";
    workspaceList.forEach((workspace) => {
      var li = document.createElement("li");
      li.setAttribute("class", "gitem");
      li.setAttribute("guid", workspace.st_guid);
      li.addEventListener("click", () => {
        // if (workspace.st_guid !== getCurrentWorkspace().st_guid)
        //   getConversation();
        setCurrentWorkspace(workspace);
        listUser(workspace.js_users);
        listUserMessages();
        var elems = document.querySelectorAll(".gactive");
        [].forEach.call(elems, function (el) {
          el.classList.remove("gactive");
        });
        li.classList.add("gactive");
        var countMsg = 0;
        if (workspace.js_users) {
          var urs = workspace.js_users.filter((ur) => ur.uid !== me.uid);
          urs.forEach((us) => {
            if (us.messages) {
              countMsg =
                countMsg + us.messages.filter((me) => !me.fromSelf).length;
            }
          });
        }
      });
      if (workspace.st_guid === getCurrentWorkspace().st_guid)
        li.classList.add("gactive");
      var countMsg = 0;
      if (workspace.js_users) {
        var urs = workspace.js_users.filter((ur) => ur.uid !== me.uid);
        urs.forEach((us) => {
          if (us.messages) {
            countMsg =
              countMsg + (us.unreadMessageCount ? us.unreadMessageCount : 0);
          }
        });
      }
      document.getElementById("grouplist").appendChild(li);
      li.innerHTML =
        li.innerHTML +
        workspace.st_name +
        "<span class='noticount'>" +
        countMsg +
        "</span>";
    });
  }
  if (getCurrentWorkspace().js_users) listUser(getCurrentWorkspace().js_users);
};
//Make user list
const listUser = (users = []) => {
  var data = "";

  document.getElementById("userlist").innerHTML = "";
  users.forEach((u) => {
    if (u.guid !== me.uid) {
      var countMsg = workspaceList
        ? workspaceList
            .find((g) => g.st_guid === getCurrentWorkspace().st_guid)
            ?.js_users.find((ur) => ur.guid === u.guid)?.unreadMessageCount
        : 0;
      var latestMsg =
        u.messages && u.messages.filter((mgs) => mgs.fromSelf === false).length
          ? u.messages.filter((mgs) => mgs.fromSelf === false)[
              u.messages.filter((mgs) => mgs.fromSelf === false).length - 1
            ].content
          : "";
      var act = " ";
      if (selectedConversation && u.guid === selectedConversation.guid)
        act = " active ";

      var li = document.createElement("li");
      li.setAttribute(
        "class",
        u.status === "online " + act ? u.status : "offline " + act
      );
      li.addEventListener("click", (e) => {
        var elems = document.querySelectorAll(".active");
        [].forEach.call(elems, function (el) {
          el.classList.remove("active");
        });
        li.classList.add("active");

        setReciverId(u.guid);
        document.getElementsByClassName("chat-text-area")[0].style.display =
          "block";
      });
      document.getElementById("userlist").appendChild(li);
      li.innerHTML =
        li.innerHTML +
        u.name +
        "<span class='noticount'>" +
        (countMsg ? countMsg : 0) +
        "</span>";
      //data= data+ "<li uid='"+ uID +"' class='"+u.status+ act+"' onclick='setReciverId(this)'><span>"+ u.name +"</span><i>"+ latestMsg +"</i></li>";
    }
  });
};

//////////comChat
const getLoggedin = () => {
  var appSetting = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(region)
    .build();
  CometChat.init(appID, appSetting).then(() => {
    CometChat.getLoggedinUser().then(
      (user) => {
        if (user) {
          me = user;
          getToken();
          //document.getElementById("chatBox").style.display = "block";
        } else {
          //document.getElementById("chatBox").style.display = "none";
        }
      },
      (error) => {
        console.log("Some Error Occured", { error });
      }
    );
  });
};
setInterval(() => {
  if (!token) {
    getLoggedin();
    console.log("Checking...");
  }
}, 1000);
getLoggedin();
//Get Groups
const getGroups = () => {
  let limit = 100;
  let groupsRequest = new CometChat.GroupsRequestBuilder()
    .setLimit(limit)
    .build();
  groupsRequest.fetchNext().then(
    (groupList) => {
      console.log("Groups list fetched successfully", groupList);
      workspaceList = workspaceList.map((ws) => {
        return {
          ...ws,
          js_users: [
            ...ws.js_users,
            ...groupList
              .filter((gr) => gr.guid.match(ws.st_guid + "-"))
              .map((e) => {
                return { ...e };
              }),
          ],
        };
      });
      getConversation();
    },
    (error) => {
      console.log("Groups list fetching failed with error", error);
    }
  );
};
//get User
const getUsers = () => {
  let limit = 30;
  let usersRequest = new CometChat.UsersRequestBuilder()
    .setLimit(limit)
    .build();
  usersRequest.fetchNext().then(
    (userList) => {
      userListData = userList;
      workspaceList = workspaceList.map((w) => {
        return {
          ...w,
          js_users: w.js_users.map((ur) => {
            var usr = userList.find((ul) => ul.uid === ur.uid);
            if (usr) return { ...ur, name: usr.name };
            else return ur;
          }),
        };
      });
    },
    (error) => {
      console.log("User list fetching failed with error:", error);
    }
  );
};

//Get member by group
const getGroupMembers = (GUID = "") => {
  if (GUID) {
    let limit = 30;
    let groupMemberRequest = new CometChat.GroupMembersRequestBuilder(GUID)
      .setLimit(limit)
      .build();

    groupMemberRequest.fetchNext().then(
      (groupMembers) => {
        console.log("Group Member list fetched successfully:", groupMembers);
      },
      (error) => {
        console.log("Group Member list fetching failed with exception:", error);
      }
    );
  }
};
//get Conversation
const getConversation = () => {
  document.getElementById("notificationcount").classList.add("act");
  ///Get Conversation Start////
  let limit = 50;
  let conversationRequest = new CometChat.ConversationsRequestBuilder()
    .setLimit(limit)
    .withUserAndGroupTags(true)
    .build();
  conversationRequest.fetchNext().then(
    (conversationList) => {
      console.log("Conversations list received:", { ...conversationList });

      workspaceList = workspaceList.map((ws) => {
        return {
          ...ws,
          js_users: [
            ...ws.js_users.filter(
              (us) =>
                !conversationList.find(
                  (co) => co.conversationId === "group_" + us.guid
                )
            ),
            ...conversationList
              .filter(
                (c) =>
                  c.conversationId.match(
                    "group_" + ws.st_guid + "-teamgroup-"
                  ) || c.conversationId.match("group_" + ws.st_guid + "-team-")
              )
              .map((e) => {
                return {
                  ...e.lastMessage.receiver,
                  unreadMessageCount: e.unreadMessageCount,
                  messages: [
                    {
                      data: e.lastMessage?.data ? e.lastMessage.data : {},
                      content: e.lastMessage.text ? e.lastMessage.text : "",
                      fromSelf: false,
                      time: e.lastMessage.sentAt,
                      avatar: "",
                    },
                  ],
                };
              }),
          ],
        };
      });
      console.log(workspaceList, "helloo");
      // workspaceList = workspaceList.map((ws) => {
      //   return {
      //     ...ws,
      //     js_users: ws.js_users.map((juser) => {
      //       if (juser.guid) {
      //         var conversation = conversationList.find((cl) =>
      //           cl.conversationId.match(juser.guid)
      //         );

      //         if (conversation) {
      //           return {
      //             ...juser,
      //             unreadMessageCount: conversation.unreadMessageCount,
      //             messages: [
      //               {
      //                 data: conversation.lastMessage?.data
      //                   ? conversation.lastMessage.data
      //                   : {},
      //                 content: conversation.lastMessage.text
      //                   ? conversation.lastMessage.text
      //                   : "",
      //                 fromSelf: false,
      //                 time: conversation.lastMessage.sentAt,
      //                 avatar: "",
      //               },
      //             ],
      //           };
      //         } else {
      //           return { ...juser };
      //         }
      //       } else {
      //         var conversation = conversationList.find((cl) =>
      //           cl.conversationId.match(juser.uid)
      //         );
      //         if (conversation) {
      //           return {
      //             ...juser,
      //             unreadMessageCount: conversation.unreadMessageCount,
      //             messages: [
      //               {
      //                 data: conversation.lastMessage?.data
      //                   ? conversation.lastMessage.data
      //                   : {},
      //                 content: conversation.lastMessage.text
      //                   ? conversation.lastMessage.text
      //                   : "",
      //                 fromSelf: false,
      //                 time: conversation.lastMessage.sentAt,
      //                 avatar: "",
      //               },
      //             ],
      //           };
      //         } else {
      //           return { ...juser };
      //         }
      //       }
      //     }),
      //   };
      // });
      document.getElementById("notificationcount").classList.remove("act");
      setNotificationMessages();
      //listGroup(workspaceList);
    },
    (error) => {
      console.log("Conversations list fetching failed with error:", error);
    }
  );
  console.log(conversationRequest);
  ///Get Conversation End////
};

//Set reciver ID
const setReciverId = (uid) => {
  var cUid = uid;
  selectedConversation = getCurrentWorkspace().js_users?.find(
    (u) => u.uid === cUid || u.guid === cUid
  );
  listUserMessages(workspaceList);
};

//Send Message
const sendMessage = () => {
  document.getElementsByClassName("loader")[0].style.display = "block";
  let receiverID;
  console.log(selectedConversation);
  if (selectedConversation) {
    if (selectedConversation.uid) {
      receiverID = selectedConversation.uid;
      receiverType = CometChat.RECEIVER_TYPE.USER;
    } else {
      receiverID = selectedConversation.guid;
      receiverType = CometChat.RECEIVER_TYPE.GROUP;
    }

    let messageText = document.getElementById("message").value;
    let textMessage = new CometChat.TextMessage(
      receiverID,
      messageText,
      receiverType
    );

    CometChat.sendMessage(textMessage).then(
      (message) => {
        console.log("Message sent successfully:", message);
        setMessages({ ...message.receiver }, message, true);
        document.getElementById("message").value = "";
        document.getElementsByClassName("loader")[0].style.display = "none";
      },
      (error) => {
        console.log("Message sending failed with error:", error);
      }
    );
  } else {
    alert("Please select user");
  }
};
///Set Message list
const setMessages = (userMessageData, message, mymsg = false) => {
  workspaceList = workspaceList.map((workspace) => {
    console.log(userMessageData.uid);
    if (workspace.st_guid === getCurrentWorkspace().st_guid) {
      return {
        ...workspace,
        js_users: workspace.js_users.map((u) => {
          if (
            (u.guid &&
              userMessageData.guid &&
              u.guid === userMessageData.guid) ||
            (u.uid && userMessageData.uid && u.uid === userMessageData.uid)
          ) {
            return {
              ...u,
              unreadMessageCount: u.unreadMessageCount
                ? !mymsg
                  ? u.unreadMessageCount + 1
                  : u.unreadMessageCount
                : 1,
              messages: u.messages
                ? [
                    ...u.messages,
                    {
                      data: message?.data ? message.data : {},
                      content: message.text,
                      fromSelf: mymsg,
                      time: message.sentAt,
                      avatar: userMessageData.avatar
                        ? userMessageData.avatar
                        : "https://picsum.photos/200",
                    },
                  ]
                : [
                    {
                      content: message.text,
                      user: { ...message.sender },
                      fromSelf: mymsg,
                      time: message.sentAt,
                      avatar: userMessageData.avatar
                        ? userMessageData.avatar
                        : "https://picsum.photos/200",
                    },
                  ],
            };
          } else {
            return u;
          }
        }),
      };
    } else {
      return workspace;
    }
  });
  if (!mymsg) {
    getConversation();
  } else {
    listGroup(workspaceList);
    setNotificationMessages();
  }
  listUserMessages(workspaceList);
};
//List user message
const listUserMessages = (workspaceListData = workspaceList) => {
  var messagesList = "";
  console.log(workspaceListData, getCurrentWorkspace(), "ppppp");
  var wsp = workspaceListData.find(
    (w) => w.st_guid === getCurrentWorkspace().st_guid
  );

  if (wsp) {
    var uData = wsp.js_users.find(
      (ud) =>
        (ud.uid &&
          selectedConversation.uid &&
          ud.uid === selectedConversation.uid) ||
        (ud.guid &&
          selectedConversation.guid &&
          ud.guid === selectedConversation.guid)
    );
    if (uData && uData.messages) {
      uData.messages.forEach((m) => {
        if (m.fromSelf) {
          if (me.avatar) var img = "<img src='" + me.avatar + "' />";
          else var img = "<img src='https://picsum.photos/200' />";
        } else var img = "<img src='" + m.avatar + "' />";
        var content =
          "<p><span class='chatcontent'>" + m.content + "</span><br>";
        var time =
          "<span class='chat-time'>" +
          timeSince(new Date(m.time * 1000)) +
          "</span></p>";
        messagesList =
          messagesList +
          "<div class='chat-list-data " +
          m.fromSelf +
          "'>" +
          img +
          content +
          time +
          "</div>";
      });
    }
  }
  document.getElementById("currentmessage").innerHTML = messagesList;
};
///Time Formate

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

////User Listener
/*CometChat.addUserListener(
            listenerID,
            new CometChat.UserListener({
                onUserOnline: onlineUser => {                   
                   
                    if(userList.find(u=>u.uid === onlineUser.uid)){
                         userList=userList.map(u=>u.uid === onlineUser.uid? {...onlineUser}: u);
                    }else{
                        userList=[...userList,{...onlineUser}];
                    }                     
                    console.log("On User Online:", onlineUser.uid );
                    listUser(userList); 
                },
                onUserOffline: offlineUser => {                   
                    if (userList.find(u => u.uid === offlineUser.uid)) {
                        userList = userList.map(u => u.uid === offlineUser.uid ? { ...offlineUser } : u);
                    } else {                        
                        userList = [...userList, {...offlineUser}];
                    }                           
                    
                    console.log("On User Offline:", offlineUser.uid);
                    listUser(userList);
                }
            })
        );*/

///Recived listener
CometChat.addMessageListener(
  listenerID,
  new CometChat.MessageListener({
    onTextMessageReceived: (textMessage) => {
      console.log("Text message received successfully", textMessage);
      chatList = [...chatList, { ...textMessage }];
      console.log(chatList);
      if (textMessage.receiverType === "group") {
        setMessages({ ...textMessage.receiver }, textMessage);
      } else setMessages({ ...textMessage.sender }, textMessage);
    },
    onMediaMessageReceived: (mediaMessage) => {
      console.log("Media message received successfully", mediaMessage);
      chatList = [...chatList, { ...mediaMessage }];
      console.log(chatList);
      if (mediaMessage.receiverType === "group") {
        setMessages({ ...mediaMessage.receiver }, textMessage);
      } else setMessages({ ...mediaMessage.sender }, textMessage);
    },
    onCustomMessageReceived: (customMessage) => {
      console.log("Custom message received successfully", customMessage);
      chatList = [...chatList, { ...customMessage }];
      if (customMessage.receiverType === "group") {
        setMessages({ ...customMessage.receiver }, textMessage);
      } else setMessages({ ...customMessage.sender }, textMessage);
    },
  })
);
