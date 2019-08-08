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
            // rtlEnabled: true,
        });
    }

    //form system menu data
    initMasterMenu(toolEle, Menu, type) {
        var $this = this;
        var menuData = [];

        for (const key in Menu) {


        }

        debugger;

        if (type == "tree") {
            $(toolEle).dxTreeView({
                items: Menu,
                // rtlEnabled: true,
                width: 300,
                // onItemClick: eval(`$this.${keyLowerCase}Item`)

            })
        } else {
            // add header menu items
            $(toolEle).dxMenu({
                items: Menu,
                // rtlEnabled: true,
                width: 300,
                // onItemClick: eval(`$this.${keyLowerCase}Item`)

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
            // url: url,
            success: () => {
                $this.initToolPermi($("#master-toolbar"), $this.permissions);
                $this.initMasterMenu($("#master-sidebar"), products, "tree")
                $this.initMasterMenu($("#master-menu"), products, "menu")
            },
            error: () => {

            }

        })

    }

    init() {
        var $this = this;
        $this.initToolPermi($("#master-toolbar"), $this.permissions);
        $this.initMasterMenu($("#master-sidebar"), products, "tree")
        $this.initMasterMenu($("#master-menu"), products, "menu")

    }

}

const source = new Source();
source.init();