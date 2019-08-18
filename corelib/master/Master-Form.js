class Source {
  constructor() {
    // this.site_url = hostName;
    this.toolbarvar = [];
    this.permissions = {
      Read: "1",
      Print: "1",
      Delete: "1",
      back: "1",
      Next: "1",
      insert: "1",
      Save: "1",
      Edit: "1",
      exportxlsx: "1",
      doc: "1"

    };

    this.sidebar = "";
    this.toolbar = "";
    this.headerMenu = "";
  }

  initToolPermi(toolEle, toolPer) {
    var $this = this;
    //initaite basic icons
    var toolbarItems = [];
    var disabed = true;
    //show action btn depened on logged user permissions
    for (const key in toolPer) {
      var keyLowerCase = key.toLocaleLowerCase();
      var icon = "";
      //disable or enable 
      if (toolPer[key] == "1") disabed = false;
      else disabed = true;
      //get the icon of the permission
      switch (keyLowerCase) {
        case "delete":
          icon = "trash";
          break;
        case "next":
          icon = "chevronnext";
          break;
        default:
          icon = keyLowerCase;
          break;
      }

      //handle tool status depend on permissions
      // if()

      //form tool items
      var toolbarItem = {
        location: "before",
        widget: "dxButton",
        disabled: disabed,
        options: {
          icon: icon
        },
        onClick: eval(`$this.${keyLowerCase}Form`)
      };
      toolbarItems.push(toolbarItem);

    }

    $this.toolbar = $(toolEle).dxToolbar({
      items: toolbarItems,
      rtlEnabled: true
    }).dxToolbar("option");

    // console.log($this.toolbar.items);
  }

  //form system menu data
  initMasterMenu(toolEle, Menu, type) {
    var $this = this;
    //change property names to the devexpress accepted propreties name
    var menuData = JSON.stringify(Menu);
    menuData = JSON.parse(
      menuData.replace(/title/g, "text").replace(/childs/g, "items")
    );
    if (type == "tree") {
      $this.sidebar = $(toolEle).dxTreeView({
        items: menuData,
        rtlEnabled: true,
        width: 300,
        activeStateEnabled: true,
        onItemRendered: e => {
          e.itemData.id = e.itemData.form_name;
          if (e.itemData.url) {
            addPageTemp(e.itemData.url, e.itemData.text, e.itemData.form_name);
          }
          console.log(e.itemData);
        },
        onItemClick: e => {
          if (e.itemData.permission)
            $this.initToolPermi($("#master-toolbar"), e.itemData.permission);

          if (e.itemData.url) {
            window.location.hash = `/${e.itemData.form_name}`;
          } else {
            window.location.hash = `/`;
          }
        }
      }).dxTreeView("instance");
      // console.log();
    } else {
      // add header menu items
      $(toolEle).dxMenu({
        items: menuData,
        rtlEnabled: true,
        onItemRendered: e => {
          if (e.itemData.url) {
            addPageTemp(e.itemData.url, e.itemData.text, e.itemData.form_name);
          }
        },
        onItemClick: e => {
          if (e.itemData.url) {
            window.location.hash = `/${e.itemData.form_name}`;
          } else {
            window.location.hash = `/`;
          }
        }
      });
    }
    debugger;
    // $this.sidebar.selectItem("Basic");

    $this.sidebar.selectItem(window.location.hash.slice(2));

  }

  //handle save  form action
  saveForm() {
    DevExpress.ui.notify("saved", "success", 600);
  }
  //handle delete action
  deleteForm() {
    DevExpress.ui.notify("deleted", "error", 600);
  }

  initRequest(url) {
    var $this = this;
    $.ajax({
      url: url,
      success: response => {
        $this.initMasterMenu($("#master-sidebar"), response, "tree");
        $this.initMasterMenu($("#master-menu"), response, "menu");
        $this.initToolPermi($("#master-toolbar"), $this.permissions);
        router();
      },
      error: () => {}
    });
  }

  init() {
    var $this = this;
    $this.initRequest("./corelib/master/system_menu.json");
  }
}

const source = new Source();
source.init();