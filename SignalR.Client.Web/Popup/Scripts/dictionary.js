 $(document).ready(function () {
    var myLayout = $('body').layout({
        // enable showOverflow on west-pane so CSS popups will overlap north pane
        west__showOverflowOnHover: true,
        //      reference only - these options are NOT required because 'true' is the default
        closable: false,    // pane can open & close
        resizable: false,    // when open, pane can be resized
        slidable: false,    // when closed, pane can 'slide' open over other panes - closes on mouse-out
        // some resizing/toggling settings
        north__slidable: false,   // OVERRIDE the pane-default of 'slidable=true'
        north__resizable: false,   // OVERRIDE the pane-default of 'resizable=true'
        north__togglerLength_closed: '100%',   // toggle-button is full-width of resizer-bar
        north__spacing_open: 0, // no resizer-bar when open (zero height)
        north__spacing_closed: 20, // big resizer-bar when open (zero height)
        south__minSize: .25,
        south__resizable: false,    // OVERRIDE the pane-default of 'resizable=true'
        south__togglerTip_closed: "Run JUEL expressions against the live dictionary",
        south__sliderTip:  "Run JUEL expressions against the live dictionary",
        south__initClosed:  false,
        south__spacing_closed: 20, // big resizer-bar when open (zero height)
        center__size: .5,
        north__size: .5,
        north__minSize: .25,
        north__maxSize: .25
    });
    $(".ui-layout-resizer-south").append("<span class=\"resizercontent\">Expression Console</span>");
    $(".ui-layout-resizer-south").addClass("ui-draggable-disabled ui-draggable ui-state-disabled"); //Fix rendering bug when init closed is true
});