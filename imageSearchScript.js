(function() {
    if (window.imageSearchScriptInjected) {
        return;
    }

    var checkBusyStatus = function(cb) {
        $("form[name=vehicleFilter]").attr("syncstate", "waiting");
        var _chk = function(cb) {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            if ($("form[name=vehicleFilter").attr("syncstate") !== "waiting") {
                if ((typeof cb) === "function") {
                    setTimeout(function() {
                        cb();
                    }, 0);
                }
            } else {
                setTimeout(function() {
                    _chk(cb);
                }, 100);
            }
        };
        _chk(cb);
    };

    var createLowerCaseValues = function() {
        $("input[type=checkbox][name=make],input[type=checkbox][name=model],input[type=checkbox][name=bodyColor]").each(function() {
            $(this).attr("data-lcaseval", $(this).val().toLowerCase());
        });
    };

    var analyzeImage = function(e, r) {
        var image = r;
        var xmlhttp = new XMLHttpRequest();
        var result;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                result = xmlhttp.responseText;
                var obj = JSON.parse(result);
                try {
                    var vehicleFound = false;
                    var makes = [];
                    var models = [];
                    var colors = [];
                    var thumbnailTitle = "";
                    var searchQuery = "";
                    for (var i = 0; i < obj.objects.length; i++) {
                        var v_make = obj.objects[i].vehicleAnnotation.attributes.system.make.name;
                        var v_model = obj.objects[i].vehicleAnnotation.attributes.system.model.name;
                        var v_color = obj.objects[i].vehicleAnnotation.attributes.system.color.name;
                        if (v_make) {
                            makes.push(v_make);
                            models.push(v_model);
                            colors.push(v_color);
                            thumbnailTitle += "Make: " + v_make + ", Model:" + v_model + ", Color: " + v_color;
                            searchQuery += v_make + " " + v_model + " " + v_color;
                            if (i < obj.objects.length - 1) {
                                thumbnailTitle += " / ";
                                searchQuery += " ";
                            }
                        }
                    }
                    if (!makes.length) {
                        showProcessing(false);
                        $("#bodyMaskElement").css({
                            "display": "none"
                        });
                        return;
                    }

                    $("#searchBarDivider").addClass("shiftRight");
                    $("input[name=searchQuery]").addClass("shiftRight");

                    var thumbnail = document.createElement("img");
                    thumbnail.src = e;
                    thumbnail.id = "thumbnailImage";
                    thumbnail.style.height = "30px";
                    thumbnail.style.position = "absolute";
                    thumbnail.style.left = "58px";
                    thumbnail.style.top = "26px";
                    thumbnail.style.zIndex = 5;
                    thumbnail.style.borderRadius = "7px";
                    /*thumbnail.title = thumbnailTitle;*/

                    if ($("#preview_car_image")[0]) {
                        $("#preview_car_image")[0].parentNode.removeChild($("#preview_car_image")[0]);
                    }

                    var preview = document.createElement("img");
                    preview.src = e;
                    preview.id = "preview_car_image";
                    preview.style.maxWidth = "360px";
                    preview.style.maxHeight = "220px";
                    preview.style.position = "absolute";
                    preview.style.top = "50%";
                    preview.style.left = "50%";
                    preview.style.visibility = "hidden";

                    setTimeout(function() {
                        $("#imgSearchBtn")[0].parentNode.insertBefore(thumbnail, $("#imgSearchBtn")[0]);
                        $("#thumbnailImage").on("mouseover", function(e) {
                            if (!$("#is_previewbox")[0]) {
                                var containerWidth = 426;
                                var containerHeight = 305;

                                var previewbox = document.createElement("div");
                                previewbox.id = "is_previewbox";
                                previewbox.style.width = containerWidth + "px";
                                previewbox.style.height = containerHeight + "px";

                                var previewboxbg = document.createElement("img");
                                previewboxbg.id = "is_previewboxbg";
                                previewboxbg.src = "https://image-based-search.github.io/images/previewbox.png";
                                previewboxbg.style.width = containerWidth + "px";
                                previewboxbg.style.height = containerHeight + "px";
                                previewbox.appendChild(previewboxbg);

                                var previewboxdiv = document.createElement("div");
                                previewboxdiv.id = "is_previewboxdiv";
                                previewbox.appendChild(previewboxdiv);

                                document.getElementsByTagName("body")[0].appendChild(previewbox);
                            }
                            var pos = $("input[name=searchQuery]")[0].getBoundingClientRect();
                            $("#is_previewbox")[0].style.top = (pos.top + 37) + "px";
                            $("#is_previewbox")[0].style.left = (pos.left + 128 - 400) + "px";
                            $("#is_previewbox")[0].style.display = "block";

                            $("#is_previewboxdiv")[0].appendChild(preview);

                            setTimeout(function() {
                                $("#preview_car_image")[0].style.marginTop = -($("#preview_car_image")[0].offsetHeight / 2) + "px";
                                $("#preview_car_image")[0].style.marginLeft = -($("#preview_car_image")[0].offsetWidth / 2) + "px";
                                $("#preview_car_image")[0].style.visibility = "visible";
                            }, 11);
                        });
                        $("#thumbnailImage").on("mouseout", function(e) {
                            $("#is_previewbox")[0] && ($("#is_previewbox")[0].style.display = "none");
                        });
                    }, 1000);

                    if (!$("input[type=checkbox][name=make]")[0]) {
                        $("[name=searchQuery]").val(searchQuery);
                        $("[name=searchQuery]").parents("form:eq(0)").submit();
                        return;
                    }

                    $("form[name=vehicleFilter] input[type=checkbox]:checked").each(function() {
                        if ($(this).attr("name") !== "make") {
                            $(this)[0].checked = false;
                        }
                    });
                    var alreadyCheckedMakesLength = $("input[type=checkbox][name=make]:checked").length;
                    var alreadyCheckedMakesCtr = 0;
                    $("input[type=checkbox][name=make]:checked").each(function() {
                        if (alreadyCheckedMakesCtr < alreadyCheckedMakesLength - 1) {
                            $(this)[0].checked = false;
                        } else {
                            $(this).trigger("click");
                        }
                        alreadyCheckedMakesCtr++;
                    });
                    var startProcessingData = function() {
                        createLowerCaseValues();
                        var matchedMakes = [];
                        for (var i = 0; i < makes.length; i++) {
                            if ($("input[type=checkbox][name=make][data-lcaseval*=\"" + makes[i].toLowerCase() + "\"]")[0]) {
                                matchedMakes.push(makes[i]);
                            }
                        }
                        for (var i = 0; i < matchedMakes.length; i++) {
                            var lastMake = false;

                            if (i === matchedMakes.length - 1) {
                                lastMake = true;
                            }
                            $("input[type=checkbox][name=make][data-lcaseval*=\"" + matchedMakes[i].toLowerCase() + "\"]").each(function() {
                                vehicleFound = true;
                                if (!lastMake) {
                                    $(this)[0].checked = true;
                                } else {
                                    $(this)[0].checked = false;
                                    $(this).trigger("click");
                                }
                            });
                        }
                        if (vehicleFound) {
                            checkBusyStatus(function() {
                                createLowerCaseValues();
                                var modelFound = false;

                                $("input[type=checkbox][name=bodyColor]:checked").each(function() {
                                    $(this)[0].checked = false;
                                });

                                var matchedModels = [];

                                for (var i = 0; i < models.length; i++) {
                                    if ($("input[type=checkbox][name=model][data-lcaseval*=\"" + models[i].toLowerCase() + "\"]")[0]) {
                                        matchedModels.push(models[i]);
                                    }
                                }

                                for (var i = 0; i < matchedModels.length; i++) {
                                    var lastModel = false;
                                    if (i === matchedModels.length - 1) {
                                        lastModel = true;
                                    }
                                    $("input[type=checkbox][name=model][data-lcaseval*=\"" + matchedModels[i].toLowerCase() + "\"]").each(function() {
                                        modelFound = true;
                                        if (!lastModel) {
                                            $(this)[0].checked = true;
                                        } else {
                                            $(this)[0].checked = false;
                                            $(this).trigger("click");
                                        }
                                    });
                                }
                                if (modelFound) {
                                    checkBusyStatus(function() {
                                        createLowerCaseValues();
                                        var colorFound = false;
                                        var matchedColors = [];

                                        for (var i = 0; i < colors.length; i++) {
                                            if ($("input[type=checkbox][name=bodyColor][data-lcaseval*=\"" + colors[i].toLowerCase() + "\"]")[0]) {
                                                matchedColors.push(colors[i]);
                                            }
                                        }

                                        for (var i = 0; i < matchedColors.length; i++) {
                                            var lastColor = false;
                                            if (i === matchedColors.length - 1) {
                                                lastColor = true;
                                            }
                                            $("input[type=checkbox][name=bodyColor][data-lcaseval*=\"" + matchedColors[i].toLowerCase() + "\"]").each(function() {
                                                colorFound = true;
                                                if (!lastColor) {
                                                    $(this)[0].checked = true;
                                                } else {
                                                    $(this)[0].checked = false;
                                                    $(this).trigger("click");
                                                }
                                            });
                                        }
                                        if (colorFound) {
                                            checkBusyStatus(function() {
                                                $("#bodyMaskElement").css({
                                                    "display": "none"
                                                });
                                                showProcessing(false);
                                            });
                                        } else {
                                            $("#bodyMaskElement").css({
                                                "display": "none"
                                            });
                                            showProcessing(false);
                                        }
                                    });
                                } else {
                                    $("#bodyMaskElement").css({
                                        "display": "none"
                                    });
                                    showProcessing(false);
                                }
                            });
                        } else {
                            $("#bodyMaskElement").css({
                                "display": "none"
                            });
                            showProcessing(false);
                        }
                    };
                    if (alreadyCheckedMakesLength === 0) {
                        startProcessingData();
                    } else {
                        checkBusyStatus(function() {
                            startProcessingData();
                        });
                    }
                } catch (exjs) {
                    /*handle failure here*/
                    $("#bodyMaskElement").css({
                        "display": "none"
                    });
                    showProcessing(false);
                    window.console && console.log && console.log(exjs);
                }
            } else if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
                $("#bodyMaskElement").css({
                    "display": "none"
                });
                showProcessing(false);
            }
        }

        xmlhttp.open("POST", "https://dev.sighthoundapi.com/v1/recognition?objectType=vehicle");
        xmlhttp.setRequestHeader("Content-type", "application/octet-stream");
        xmlhttp.setRequestHeader("X-Access-Token", "ZO0PdOzYeXQlsxtf4G3FhL9hoof5GuFP3Oz7");
        xmlhttp.send(image);
    };

    var _handleFileUpload = function(e) {
        var t, r = e.target.files[0];
        if (r instanceof Blob) {
            var a = new FileReader;
            a.onload = function(e) {
                t = e.target.result,
                handleImageUpload(t, r)
            }
            ;
            a.readAsDataURL(r);
        }
    };

    var handleImageUpload = function(e, t) {
        var r = e
          , a = r.split(",")[1];
        a.length > 185 && (a = a.substr(0, 184) + "...");
        processSelectedImage(e, a, t);
        if ($("#thumbnailImage")[0]) {
            $("#thumbnailImage")[0].parentNode.removeChild($("#thumbnailImage")[0]);
        }

        $("#searchBarDivider").removeClass("shiftRight");
        $("input[name=searchQuery]").removeClass("shiftRight");

        $("#bodyMaskElement").css({
            "display": "block"
        });
        showProcessing(true);
    };

    var showProcessing = function(o) {
        if (!o) {
            $("#imgSearchBtn").html("<img src=\"https://image-based-search.github.io/images/camera.png\">");
        } else {
            $("#imgSearchBtn").html("<img src=\"https://image-based-search.github.io/images/loading_spinner.gif\" style=\"position:relative;top:8px;left:10px;\">");
        }
    };
    var processSelectedImage = function(e, t, r) {
        var a = {
            contentType: "",
            body: ""
        };
        a = r instanceof Blob ? {
            contentType: "application/octet-stream",
            body: "<BINARY IMAGE DATA>"
        } : t ? {
            contentType: "application/json",
            body: {
                image: t
            }
        } : {
            contentType: "application/json",
            body: {
                image: e
            }
        };
        analyzeImage(e, r)
    };

    var injectCSS = function() {
        var theCSS = "" + 
        ".searchBarDivider{position:absolute;left:60px;top:25px;}\n" + 
        ".searchBarDivider.shiftRight{left:120px;-webkit-transition:left 1s;transition:left 1s;}\n" + 
        ".searchField{padding-left:55px !important;}\n" + 
        ".searchField.shiftRight{padding-left:110px !important;-webkit-transition:padding-left 1s;transition:padding-left 1s;}\n" + 
        ".gg-chatbox, .gg-chat-tab {display:none !important;}\n" + 
        "#is_previewbox{position:fixed;z-index:20;display:none;}\n" + 
        "#is_previewboxbg{position:absolute;top:0px;left:0px;z-index:22;}\n" + 
        "#is_previewboxdiv{position:absolute;left:20px;top:33px;width:372px;height:240px;z-index:25}\n";
        var stl = document.createElement("style");
        stl.type = "text/css";
        if (stl.styleSheet) {
            stl.styleSheet.cssText = theCSS;
        } else {
            stl.appendChild(document.createTextNode(theCSS));
        }
        document.getElementsByTagName("head")[0].appendChild(stl);
    };
    injectCSS();

    $("div.menu").css("flex-basis", "65%");
    new Image().src = "https://image-based-search.github.io/images/loading_spinner.gif";
    new Image().src = "https://image-based-search.github.io/images/previewbox.png";

    var frag = document.createDocumentFragment();
    var searchForm = $("[name=searchQuery]").parents("form:eq(0)")[0];
    searchForm.style.zIndex = 2;

    $("[name=searchQuery]")[0].className = "searchField";

    var fileInputField = document.createElement("input");
    fileInputField.type = "file";
    fileInputField.name = "fileinputfield";
    fileInputField.id = "fileinputfield";
    fileInputField.setAttribute("accept", "image/*");
    fileInputField.style.display = "none";
    frag.appendChild(fileInputField);

    var imgSearchBtn = document.createElement("div");
    imgSearchBtn.innerHTML = "<img src=\"https://image-based-search.github.io/images/camera.png\">";
    imgSearchBtn.id = "imgSearchBtn";
    imgSearchBtn.style.display = "inline-block";
    imgSearchBtn.style.textTransform = "none";
    imgSearchBtn.style.fontWeight = "bold";
    imgSearchBtn.style.position = "absolute";
    imgSearchBtn.style.top = "24px";
    imgSearchBtn.style.left = "20px";
    imgSearchBtn.style.zIndex = 5;
    frag.appendChild(imgSearchBtn);

    var divider = document.createElement("div");
    divider.id = "searchBarDivider";
    divider.style.borderRight = "1px solid #000";
    divider.style.height = "30px";
    divider.style.zIndex = 5;
    divider.className = "searchBarDivider";
    frag.appendChild(divider);

    searchForm.parentNode.style.maxHeight = "80px";
    searchForm.parentNode.appendChild(frag);

    $("#imgSearchBtn").on("click", function(e) {
        fileInputField.click();
    });

    $("#fileinputfield").on("change", function(e) {
        _handleFileUpload(e);
    });

    var bodyMask = document.createElement("div");
    bodyMask.style.position = "fixed";
    bodyMask.style.top = bodyMask.style.right = bodyMask.style.bottom = bodyMask.style.left = "0px";
    bodyMask.style.opacity = 0.8;
    bodyMask.style.backgroundColor = "#000";
    bodyMask.style.zIndex = Math.pow(2, 32) - 1;
    bodyMask.style.display = "none";
    bodyMask.id = "bodyMaskElement";
    document.body.appendChild(bodyMask);

    window.imageSearchScriptInjected = true;
}());

/*

bookmarklet code:

javascript:(function(){var scr=document.createElement("script");scr.src="https://image-based-search.github.io/imageSearchScript.js";document.getElementsByTagName("head")[0].appendChild(scr);}());

*/
