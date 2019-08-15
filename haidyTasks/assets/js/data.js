var system_menu = [{
        "form_name": "البيانات الاساسية",
        "title": "البيانات الاساسية",
        "url": "",
        "permission": {
            "Read": "0",
            "Print": "1",
            "Delete": "1",
            "back": "1",
            "Next": "1",
            "insert": "0",
            "Save": "1",
            "Edit": "1",
        },

    },
    {
        "form_name": "التحكم",
        "title": "التحكم",
        "permission": {
            "Read": "0",
            "Print": "1",
            "Delete": "1",
            "back": "1",
            "Next": "1",
            "insert": "0",
            "Save": "1",
            "Edit": "1",
        },
        "childs": [{
                "form_name": "تفضيلات",
                "title": "تفضيلات"
            }, {
                "form_name": "الالوان",
                "title": "الالوان"
            }, {
                "form_name": "تغيير الفرع ",
                "title": "تغيير الفرع ",
            },
            {
                "form_name": "الشاشات النشطة",
                "title": "الشاشات النشطة"
            },
            {
                "form_name": "الشاشات الحديثة",
                "title": "الشاشات الحديثة",
                "childs": [{
                    "form_name": "شاشة1",
                    "title": "شاشة1"
                }]

            }
        ]

    }
];



var products = [{
        text: "البيانات الاساسية",
    },

    {
        text: "التحكم",
        items: [{
                text: "تفضيلات",
            }, {
                text: "الالوان",
            }, {
                text: "تغيير الفرع "
            },
            {
                text: "الشاشات النشطة"
            },
            {
                text: "الشاشات الحديثة",
                items: [{
                    text: "شاشة1"
                }]

            }
        ]

    },
    {
        text: "الحركات المالية"
    },
    {
        text: "الحسابات العامة"
    }

];
var prod = [{
    id: "1_1_1",
    text: "البيانات الاساسية",
    items: [{
        id: "1_1_1_1",
        text: "HD Video Player",
        price: 220,
        image: "images/products/1.png"
    }, {
        id: "1_1_1_2",
        text: "SuperHD Video Player",
        image: "images/products/2.png",
        price: 270
    }]
}, {
    id: "1_1_2",
    text: "Televisions",
    expanded: true,
    items: [{
        id: "1_1_2_1",
        text: "SuperLCD 42",
        image: "images/products/7.png",
        price: 1200
    }, {
        id: "1_1_2_2",
        text: "SuperLED 42",
        image: "images/products/5.png",
        price: 1450
    }, {
        id: "1_1_2_3",
        text: "SuperLED 50",
        image: "images/products/4.png",
        price: 1600
    }, {
        id: "1_1_2_4",
        text: "SuperLCD 55",
        image: "images/products/6.png",
        price: 1350
    }, {
        id: "1_1_2_5",
        text: "SuperLCD 70",
        image: "images/products/9.png",
        price: 4000
    }]
}, {
    id: "1_1_3",
    text: "Monitors",
    expanded: true,
    items: [{
        id: "1_1_3_1",
        text: "19\"",
        expanded: true,
        items: [{
            id: "1_1_3_1_1",
            text: "DesktopLCD 19",
            image: "images/products/10.png",
            price: 160
        }]
    }, {
        id: "1_1_3_2",
        text: "21\"",
        items: [{
            id: "1_1_3_2_1",
            text: "DesktopLCD 21",
            image: "images/products/12.png",
            price: 170
        }, {
            id: "1_1_3_2_2",
            text: "DesktopLED 21",
            image: "images/products/13.png",
            price: 175
        }]
    }]
}, {
    id: "1_1_4",
    text: "Projectors",
    items: [{
        id: "1_1_4_1",
        text: "Projector Plus",
        image: "images/products/14.png",
        price: 550
    }, {
        id: "1_1_4_2",
        text: "Projector PlusHD",
        image: "images/products/15.png",
        price: 750
    }]


}, {
    id: "1_2",
    text: "Braeburn",
    items: [{
        id: "1_2_1",
        text: "Video Players",
        items: [{
            id: "1_2_1_1",
            text: "HD Video Player",
            image: "images/products/1.png",
            price: 240
        }, {
            id: "1_2_1_2",
            text: "SuperHD Video Player",
            image: "images/products/2.png",
            price: 300
        }]
    }, {
        id: "1_2_2",
        text: "Televisions",
        items: [{
            id: "1_2_2_1",
            text: "SuperPlasma 50",
            image: "images/products/3.png",
            price: 1800
        }, {
            id: "1_2_2_2",
            text: "SuperPlasma 65",
            image: "images/products/8.png",
            price: 3500
        }]
    }, {
        id: "1_2_3",
        text: "Monitors",
        items: [{
            id: "1_2_3_1",
            text: "19\"",
            items: [{
                id: "1_2_3_1_1",
                text: "DesktopLCD 19",
                image: "images/products/10.png",
                price: 170
            }]
        }, {
            id: "1_2_3_2",
            text: "21\"",
            items: [{
                id: "1_2_3_2_1",
                text: "DesktopLCD 21",
                image: "images/products/12.png",
                price: 180
            }, {
                id: "1_2_3_2_2",
                text: "DesktopLED 21",
                image: "images/products/13.png",
                price: 190
            }]
        }]
    }]

}, {
    id: "1_3",
    text: "E-Mart",
    items: [{
        id: "1_3_1",
        text: "Video Players",
        items: [{
            id: "1_3_1_1",
            text: "HD Video Player",
            image: "images/products/1.png",
            price: 220
        }, {
            id: "1_3_1_2",
            text: "SuperHD Video Player",
            image: "images/products/2.png",
            price: 275
        }]
    }, {
        id: "1_3_3",
        text: "Monitors",
        items: [{
            id: "1_3_3_1",
            text: "19\"",
            items: [{
                id: "1_3_3_1_1",
                text: "DesktopLCD 19",
                image: "images/products/10.png",
                price: 165
            }]
        }, {
            id: "1_3_3_2",
            text: "21\"",
            items: [{
                id: "1_3_3_2_1",
                text: "DesktopLCD 21",
                image: "images/products/12.png",
                price: 175
            }]
        }]
    }]
}, {
    id: "1_4",
    text: "Walters",
    items: [{
        id: "1_4_1",
        text: "Video Players",
        items: [{
            id: "1_4_1_1",
            text: "HD Video Player",
            image: "images/products/1.png",
            price: 210
        }, {
            id: "1_4_1_2",
            text: "SuperHD Video Player",
            image: "images/products/2.png",
            price: 250
        }]
    }, {
        id: "1_4_2",
        text: "Televisions",
        items: [{
            id: "1_4_2_1",
            text: "SuperLCD 42",
            image: "images/products/7.png",
            price: 1100
        }, {
            id: "1_4_2_2",
            text: "SuperLED 42",
            image: "images/products/5.png",
            price: 1400
        }, {
            id: "1_4_2_3",
            text: "SuperLED 50",
            image: "images/products/4.png",
            price: 1500
        }, {
            id: "1_4_2_4",
            text: "SuperLCD 55",
            image: "images/products/6.png",
            price: 1300
        }, {
            id: "1_4_2_5",
            text: "SuperLCD 70",
            image: "images/products/9.png",
            price: 4000
        }, {
            id: "1_4_2_6",
            text: "SuperPlasma 50",
            image: "images/products/3.png",
            price: 1700
        }]
    }, {
        id: "1_4_3",
        text: "Monitors",
        items: [{
            id: "1_4_3_1",
            text: "19\"",
            items: [{
                id: "1_4_3_1_1",
                text: "DesktopLCD 19",
                image: "images/products/10.png",
                price: 160
            }]
        }, {
            id: "1_4_3_2",
            text: "21\"",
            items: [{
                id: "1_4_3_2_1",
                text: "DesktopLCD 21",
                image: "images/products/12.png",
                price: 170
            }, {
                id: "1_4_3_2_2",
                text: "DesktopLED 21",
                image: "images/products/13.png",
                price: 180
            }]
        }]
    }, {
        id: "1_4_4",
        text: "Projectors",
        items: [{
            id: "1_4_4_1",
            text: "Projector Plus",
            image: "images/products/14.png",
            price: 550
        }, {
            id: "1_4_4_2",
            text: "Projector PlusHD",
            image: "images/products/15.png",
            price: 750
        }]
    }]


}];