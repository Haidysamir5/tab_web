$("#responsive-box").dxResponsiveBox({
    height: 200,
    rows: [{
            ratio: 2
        },
        {
            ratio: 2
        },
        {
            ratio: 2,
            screen: "xs"
        },
        {
            ratio: 1
        }
    ],
    cols: [{
            ratio: 1
        },
        {
            ratio: 2,
            screen: "lg"
        },
        {
            ratio: 1
        }
    ],
    singleColumnScreen: "sm",
    screenByWidth: function (width) {
        return (width < 700) ? 'sm' : 'lg';
    }
});