(function() {
    if (window.imageSearchScriptInjected) {
        return;
    }

    var checkBusyStatus = function(cb) {
        $("form[name=vehicleFilter]").attr("syncstate", "waiting");
        var _chk = function(cb) {
            document.documentElement.scrollTop = 0;
            document.getElementsByTagName("body")[0].scrollTop = 0;
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

    var mobileMenuClick = function() {
        var mobileMenuElem = document.querySelectorAll("li.mobileMenu")[0];
        if (mobileMenuElem) {
            mobileMenuElem.click();
        }
    };

    var showErrorMessage = function(errorcode) {
        var msgSrc = "";
        var cssConfig;
        switch (errorcode) {
        case "err_proc":
            {
                msgSrc = "https://image-based-search.github.io/images/err_processingreq.png";
                var pos = $("input[name=searchQuery]")[0].getBoundingClientRect();
                cssConfig = {
                    "z-index": 22,
                    "position": "fixed"
                };
                cssConfig["top"] = (pos.top + 35) + "px";
                cssConfig["left"] = (pos.left - 15) + "px";
                break;
            }
        case "err_nocar":
            {
                msgSrc = "https://image-based-search.github.io/images/err_novehiclefound.png";
                var pos = $("input[name=searchQuery]")[0].getBoundingClientRect();
                cssConfig = {
                    "z-index": 22,
                    "position": "fixed"
                };
                cssConfig["top"] = (pos.top + 35) + "px";
                cssConfig["left"] = (pos.left - 15) + "px";
                break;
            }
        }
        if (msgSrc) {
            var errMsg = document.createElement("img");
            errMsg.id = "is_error_msg";
            errMsg.src = msgSrc;
            if (cssConfig) {
                for (var s in cssConfig) {
                    errMsg.style[s] = cssConfig[s];
                }
            }
            document.getElementsByTagName("body")[0].appendChild(errMsg);
            setTimeout(function() {
                $("#is_error_msg")[0] && ($("#is_error_msg")[0].parentNode.removeChild($("#is_error_msg")[0]));
            }, 5000);
            if (!window.is_resizehandler_attached) {
                window.onresize = function() {
                    $("#is_error_msg")[0] && ($("#is_error_msg")[0].parentNode.removeChild($("#is_error_msg")[0]));
                }
                ;
                window.is_resizehandler_attached = "yes";
            }
        }
    };

    var analyzeImage = function(e, r, imageurl) {
        var image = r;
        if (imageurl) {
            image = {
                image: imageurl
            };
            image = JSON.stringify(image);
        }
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
                        showErrorMessage("err_nocar");
                        return;
                    }

                    $("#searchBarDivider").addClass("shiftRight");
                    $("input[name=searchQuery]").addClass("shiftRight");

                    var thumbnail = document.createElement("img");
                    thumbnail.src = imageurl || e;
                    thumbnail.id = "thumbnailImage";
                    /*thumbnail.title = thumbnailTitle;*/

                    if ($("#preview_car_image")[0]) {
                        $("#preview_car_image")[0].parentNode.removeChild($("#preview_car_image")[0]);
                    }

                    var preview = document.createElement("img");
                    preview.src = imageurl || e;
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
                                                showProcessing(false);
                                                mobileMenuClick();
                                            });
                                        } else {
                                            showProcessing(false);
                                            mobileMenuClick();
                                        }
                                    });
                                } else {
                                    showProcessing(false);
                                    mobileMenuClick();
                                }
                            });
                        } else {
                            showProcessing(false);
                            mobileMenuClick();
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
                    showProcessing(false);
                    window.console && console.log && console.log(exjs);
                    showErrorMessage("err_proc");
                }
            } else if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
                showProcessing(false);
                showErrorMessage("err_proc");
            }
        }

        xmlhttp.open("POST", "https://dev.sighthoundapi.com/v1/recognition?objectType=vehicle");
        xmlhttp.setRequestHeader("X-Access-Token", "ZO0PdOzYeXQlsxtf4G3FhL9hoof5GuFP3Oz7");
        if (!imageurl) {
            xmlhttp.setRequestHeader("Content-type", "application/octet-stream");
        } else {
            xmlhttp.setRequestHeader("Content-type", "application/json");
        }
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

        showProcessing(true);
    };

    var showProcessing = function(o) {
        var isDesktop = true;
        if (document.querySelectorAll("#dimensionDiv")[0].offsetWidth < 801) {
            isDesktop = false;
        }
        if (!o) {
            $("#imgSearchBtn").html("<img src=\"https://image-based-search.github.io/images/camera.png\">");
            $("#bodyMaskElement").css({
                "display": "none"
            });
            if (isDesktop) {
                document.querySelectorAll("#searchProcessingWaitStyle")[0].parentNode.removeChild(document.querySelectorAll("#searchProcessingWaitStyle")[0]);
                document.querySelectorAll("main")[0].style.height = "auto";
            }
        } else {
            $("#imgSearchBtn").html("<img src=\"https://image-based-search.github.io/images/loading_spinner.gif\" style=\"position:relative;top:8px;left:10px;\">");
            $("#bodyMaskElement").css({
                "display": "block"
            });
            if (isDesktop) {
                loadCSS("main>[data-params*=\"cardName:VehicleSearchResults\"]>.deck>[data-params*=\"cardName:vehicleFilters\"]{display:none;}", "searchProcessingWaitStyle");
                document.querySelectorAll("main>[data-params*=\"cardName:VehicleSearchResults\"]>.deck>[data-params*=\"cardName:vehicleFilters\"]")[0].style.display = "none";
                document.querySelectorAll("main")[0].style.height = "1000px";
            }
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
    var loadCSS = function(cssConfig, styleID) {
        var stl = document.createElement("style");
        if (styleID) {
            stl.id = styleID;
        }
        stl.type = "text/css";
        if (stl.styleSheet) {
            stl.styleSheet.cssText = cssConfig;
        } else {
            stl.appendChild(document.createTextNode(cssConfig));
        }
        document.getElementsByTagName("head")[0].appendChild(stl);
    };
    var injectCSS = function() {
        var theCSS = "\n" + 
        "@media (min-width: 801px) {\n" + 
        "    #imgSearchBtn {\n" + 
        "        display:inline-block;\n" + 
        "        position: absolute;\n" + 
        "        top: 24px;\n" + 
        "        left: 20px;\n" + 
        "        z-index: 5;\n" + 
        "    }\n" + 
        "}\n" + 
        "\n" + 
        "@media (max-width: 800px) {\n" + 
        "    .cta.open ~ div[role=search] {\n" + 
        "        outline:none !important;\n" + 
        "    }\n" + 
        "\n" + 
        "    #imgSearchBtn {\n" + 
        "        display: none;\n" + 
        "    }\n" + 
        "\n" + 
        "    .cta.open ~ [role='search'] #imgSearchBtn {\n" + 
        "        display: inline-block;\n" + 
        "        position: absolute;\n" + 
        "        top: 135px;\n" + 
        "        left: 22px;\n" + 
        "        z-index: 5;\n" + 
        "    }\n" + 
        "}\n" + 
        "\n" + 
        "@media (min-width: 801px) {\n" + 
        "    .searchBarDivider {\n" + 
        "        position:absolute;\n" + 
        "        left: 60px;\n" + 
        "        top: 25px;\n" + 
        "    }\n" + 
        "\n" + 
        "    .searchBarDivider.shiftRight {\n" + 
        "        left: 120px;\n" + 
        "        -webkit-transition: left 1s;\n" + 
        "        transition: left 1s;\n" + 
        "    }\n" + 
        "}\n" + 
        "\n" + 
        "@media (max-width: 800px) {\n" + 
        "    .searchBarDivider {\n" + 
        "        display:none;\n" + 
        "    }\n" + 
        "\n" + 
        "    .cta.open ~ [role='search'] .searchBarDivider {\n" + 
        "        display: block;\n" + 
        "        position: absolute;\n" + 
        "        left: 60px;\n" + 
        "        top: 135px;\n" + 
        "    }\n" + 
        "\n" + 
        "    .cta.open ~ [role='search'] .searchBarDivider.shiftRight {\n" + 
        "        left: 120px;\n" + 
        "        -webkit-transition: left 1s;\n" + 
        "        transition: left 1s;\n" + 
        "    }\n" + 
        "}\n" + 
        "\n" + 
        "@media (min-width: 801px) {\n" + 
        "    #thumbnailImage {\n" + 
        "        height:30px;\n" + 
        "        position: absolute;\n" + 
        "        left: 58px;\n" + 
        "        top: 26px;\n" + 
        "        z-index: 5;\n" + 
        "        border-radius: 7px;\n" + 
        "    }\n" + 
        "}\n" + 
        "\n" + 
        "@media (max-width: 800px) {\n" + 
        "    #thumbnailImage {\n" + 
        "        display:none;\n" + 
        "    }\n" + 
        "\n" + 
        "    .cta.open ~ [role='search'] #thumbnailImage {\n" + 
        "        display: block;\n" + 
        "        height: 30px;\n" + 
        "        position: absolute;\n" + 
        "        left: 58px;\n" + 
        "        top: 135px;\n" + 
        "        z-index: 5;\n" + 
        "        border-radius: 7px;\n" + 
        "    }\n" + 
        "}\n" + 
        "\n" + 
        "@media (max-width: 800px) {\n" + 
        "    #is_previewbox {\n" + 
        "        display:none !important;\n" + 
        "    }\n" + 
        "}\n" + 
        "\n" + 
        ".searchField {\n" + 
        "    padding-left: 55px !important;\n" + 
        "}\n" + 
        "\n" + 
        ".searchField.shiftRight {\n" + 
        "    padding-left: 110px !important;\n" + 
        "    -webkit-transition: padding-left 1s;\n" + 
        "    transition: padding-left 1s;\n" + 
        "}\n" + 
        "\n" + 
        ".gg-chatbox, .gg-chat-tab {\n" + 
        "    display: none !important;\n" + 
        "}\n" + 
        "\n" + 
        "#is_previewbox {\n" + 
        "    position: fixed;\n" + 
        "    z-index: 20;\n" + 
        "    display: none;\n" + 
        "}\n" + 
        "\n" + 
        "#is_previewboxbg {\n" + 
        "    position: absolute;\n" + 
        "    top: 0px;\n" + 
        "    left: 0px;\n" + 
        "    z-index: 22;\n" + 
        "}\n" + 
        "\n" + 
        "#is_previewboxdiv {\n" + 
        "    position: absolute;\n" + 
        "    left: 20px;\n" + 
        "    top: 33px;\n" + 
        "    width: 372px;\n" + 
        "    height: 240px;\n" + 
        "    z-index: 25\n" + 
        "}\n" + 
        "\n" + 
        "#is_optionsUI {\n" + 
        "    position: fixed;\n" + 
        "    left: 50%;\n" + 
        "    top: 50%;\n" + 
        "    background-color: rgb(255, 255, 255);\n" + 
        "    width: 600px;\n" + 
        "    height: 70px;\n" + 
        "    margin-left: -300px;\n" + 
        "    margin-top: -35px;\n" + 
        "    border-radius: 11px;\n" + 
        "    z-index: 536870911;\n" + 
        "}\n" + 
        "\n" + 
        "#is_uplBtn {\n" + 
        "    cursor: pointer;\n" + 
        "    width: 200px;\n" + 
        "    height: 40px;\n" + 
        "    background-color: rgb(0, 0, 0);\n" + 
        "    color: rgb(255, 255, 255);\n" + 
        "    font-weight: bold;\n" + 
        "    position: absolute;\n" + 
        "    top: 15px;\n" + 
        "    left: 20px;\n" + 
        "    padding: 10px;\n" + 
        "    border-radius: 50px;\n" + 
        "    text-align: center;\n" + 
        "}\n" + 
        "\n" + 
        "#is_optionsUI_divider {\n" + 
        "    position: absolute;\n" + 
        "    top: 10px;\n" + 
        "    left: 230px;\n" + 
        "    font-size: 40px;\n" + 
        "}\n" + 
        "\n" + 
        "#is_urlfield {\n" + 
        "    position: absolute;\n" + 
        "    top: 15px;\n" + 
        "    left: 260px;\n" + 
        "    width: 240px;\n" + 
        "    height: 40px;\n" + 
        "    border: 1px solid rgb(0, 0, 0);\n" + 
        "    outline: none;\n" + 
        "    padding-left: 10px;\n" + 
        "}\n" + 
        "\n" + 
        "#is_gobtn {\n" + 
        "    cursor: pointer;\n" + 
        "    background-color: rgb(0, 0, 0);\n" + 
        "    color: rgb(255, 255, 255);\n" + 
        "    border-radius: 11px;\n" + 
        "    padding: 10px;\n" + 
        "    position: absolute;\n" + 
        "    left: 520px;\n" + 
        "    top: 15px;\n" + 
        "}\n" + 
        "\n" + 
        "#is_closebtn {\n" + 
        "    cursor: pointer;\n" + 
        "    border-radius: 100px;\n" + 
        "    border: 1px solid rgb(0, 0, 0);\n" + 
        "    background-color: rgb(255, 255, 255);\n" + 
        "    position: absolute;\n" + 
        "    top: -25px;\n" + 
        "    right: -25px;\n" + 
        "    width: 40px;\n" + 
        "    height: 40px;\n" + 
        "    text-align: center;\n" + 
        "    font-size: 30px;\n" + 
        "}\n";
        loadCSS(theCSS, "imageSearch_CSS");
    };
    injectCSS();

    var showSearchOptions = function() {
        var isDesktop = true;
        if (document.querySelectorAll("#dimensionDiv")[0].offsetWidth < 801) {
            isDesktop = false;
        }
        if (!isDesktop) {
            $("#fileinputfield")[0].click();
            return;
        }
        $("#bodyMaskElement")[0].style.display = "block";
        var optionsUI = document.createElement("div");
        optionsUI.id = "is_optionsUI";

        var uplButton = document.createElement("div");
        uplButton.id = "is_uplBtn";
        uplButton.innerHTML = "Upload Vehicle Picture";

        uplButton.onclick = function() {
            setTimeout(function() {
                hideSearchOptions();
            }, 500);
            $("#fileinputfield")[0].click();
        }
        ;

        var divider = document.createElement("div");
        divider.id = "is_optionsUI_divider";
        divider.innerHTML = "/";

        var urlField = document.createElement("input");
        urlField.id = "is_urlfield";
        urlField.setAttribute("placeholder", "Enter an image url");

        var goBtn = document.createElement("div");
        goBtn.id = "is_gobtn";
        goBtn.innerHTML = "Search";
        goBtn.onclick = function() {
            if ($("#thumbnailImage")[0]) {
                $("#thumbnailImage")[0].parentNode.removeChild($("#thumbnailImage")[0]);
            }

            $("#searchBarDivider").removeClass("shiftRight");
            $("input[name=searchQuery]").removeClass("shiftRight");

            showProcessing(true);
            analyzeImage(null, null, $("#is_urlfield")[0].value);
            hideSearchOptions(true);
        }
        ;

        var closeBtn = document.createElement("div");
        closeBtn.id = "is_closebtn";
        closeBtn.innerHTML = "&#215";
        closeBtn.onclick = function() {
            hideSearchOptions();
        }
        ;

        optionsUI.appendChild(uplButton);
        optionsUI.appendChild(divider);
        optionsUI.appendChild(urlField);
        optionsUI.appendChild(goBtn);
        optionsUI.appendChild(closeBtn);

        document.getElementsByTagName("body")[0].appendChild(optionsUI);
    };

    var hideSearchOptions = function(hideOnlyOptionsInterface) {
        $("#is_optionsUI")[0].parentNode.removeChild($("#is_optionsUI")[0]);
        if (hideOnlyOptionsInterface) {
            return;
        }
        $("#bodyMaskElement")[0].style.display = "none";
    };

    $("div.menu").css("flex-basis", "65%");
    new Image().src = "https://image-based-search.github.io/images/loading_spinner.gif";
    new Image().src = "https://image-based-search.github.io/images/previewbox.png";
    new Image().src = "https://image-based-search.github.io/images/err_processingreq.png";
    new Image().src = "https://image-based-search.github.io/images/err_novehiclefound.png";

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
        showSearchOptions();
    });

    $("#fileinputfield").on("change", function(e) {
        _handleFileUpload(e);
    });

    var bodyMask = document.createElement("div");
    bodyMask.style.position = "fixed";
    bodyMask.style.top = bodyMask.style.right = bodyMask.style.bottom = bodyMask.style.left = "0px";
    bodyMask.style.opacity = 0.8;
    bodyMask.style.backgroundColor = "#000";
    bodyMask.style.zIndex = Math.pow(2, 28) - 1;
    bodyMask.style.display = "none";
    bodyMask.id = "bodyMaskElement";
    document.getElementsByTagName("body")[0].appendChild(bodyMask);

    var dimensionDiv = document.createElement("div");
    dimensionDiv.id = "dimensionDiv";
    dimensionDiv.style.top = dimensionDiv.style.right = dimensionDiv.style.bottom = dimensionDiv.style.left = "0px";
    dimensionDiv.style.visibility = "hidden";
    dimensionDiv.style.zIndex = -100;
    document.getElementsByTagName("body")[0].appendChild(dimensionDiv);

    window.imageSearchScriptInjected = true;
}());

/*

bookmarklet code:

javascript:(function(){var scr=document.createElement("script");scr.src="https://image-based-search.github.io/imageSearchScript.js";document.getElementsByTagName("head")[0].appendChild(scr);}());

*/
