class Source {

    constructor() {
        // this.site_url = hostName;
        this.toolbarvar = [];
        this.permissions = {
            "Read": "0",
            "Print": "1",
            "Delete": "1",
            "back": "1",
            "Next": "1",
            "insert": "0",
            "Save": "1",
            "Edit": "1",
        }

    }


    initToolPermi(toolEle, toolPer) {
        var $this = this;
        //initaite basic icons
        toolPer["exportxlsx"] = "1";
        toolPer["doc"] = "1";
        var toolbarItems = []
        //show action btn depened on logged user permissions
        for (const key in toolPer) {
            if (toolPer[key] == "1") {
                var keyLowerCase = key.toLocaleLowerCase();
                var icon = "";
                var disabed = false;
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
                    location: 'before',
                    widget: 'dxButton',
                    disabled: disabed,
                    options: {
                        icon: icon,
                    },
                    onClick: eval(`$this.${keyLowerCase}Form`)
                }
                toolbarItems.push(toolbarItem);
            }

        }

        $(toolEle).dxToolbar({
            items: toolbarItems,
            rtlEnabled: true,
        });
    }

    //form system menu data
    initMasterMenu(toolEle, Menu, type) {
        var $this = this;
        //change property names to the devexpress accepted propreties name
        var menuData = JSON.stringify(Menu);
        menuData = JSON.parse(menuData.replace(/title/g, "text").replace(/childs/g, "items"));
        if (type == "tree") {
            $(toolEle).dxTreeView({
                items: menuData,
                rtlEnabled: true,
                width: 300,
                onItemRendered: (e) => {
                    if (e.itemData.url) {
                        addPageTemp(e.itemData.url, e.itemData.text, e.itemData.form_name);
                    }
                },
                onItemClick: (e) => {
                    if (e.itemData.url) {
                        window.location.hash = `/${e.itemData.form_name}`;
                    } else {
                        window.location.hash = `/`;
                    }
                }
            })
        } else {
            // add header menu items
            $(toolEle).dxMenu({
                items: menuData,
                rtlEnabled: true,
                onItemRendered: (e) => {
                    if (e.itemData.url) {
                        addPageTemp(e.itemData.url, e.itemData.text, e.itemData.form_name);
                    }
                },
                onItemClick: (e) => {
                    if (e.itemData.url) {
                        window.location.hash = `/${e.itemData.form_name}`;
                    } else {
                        window.location.hash = `/`;
                    }
                }
            })
        }

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
            success: (response) => {
                console.log(response);
                $this.initToolPermi($("#master-toolbar"), $this.permissions);
                $this.initMasterMenu($("#master-sidebar"), response, "tree");
                $this.initMasterMenu($("#master-menu"), response, "menu");
                router();
            },
            error: () => {

            }

        })

    }

    init() {
        var $this = this;
        $this.initRequest("system_menu.json");

    }

}

const source = new Source();
source.init();