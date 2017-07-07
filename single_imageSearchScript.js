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
                    var make = obj.objects[0].vehicleAnnotation.attributes.system.make.name;
                    var model = obj.objects[0].vehicleAnnotation.attributes.system.model.name;
                    var color = obj.objects[0].vehicleAnnotation.attributes.system.color.name;
                    if (!make) {
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
                    thumbnail.title = "Make: " + make + ", Model:" + model + ", Color: " + color;
                    setTimeout(function() {
                        $("#imgSearchBtn")[0].parentNode.insertBefore(thumbnail, $("#imgSearchBtn")[0]);
                    }, 1000);

                    if (!$("input[type=checkbox][name=make]")[0]) {
                        $("[name=searchQuery]").val(make + " " + model + " " + color);
                        $("[name=searchQuery]").parents("form:eq(0)").submit();
                        return;
                    }

                    $("input[type=checkbox][name=make],input[type=checkbox][name=model],input[type=checkbox][name=bodyColor]").each(function() {
                        $(this)[0].checked = false;
                        $(this).attr("syncstate", "loaded");
                    });

                    $("input[type=checkbox][name=make]").each(function() {
                        if ($(this).val().toLowerCase().indexOf(make.toLowerCase()) !== -1) {
                            $(this).trigger("click");
                            vehicleFound = true;
                        }
                    });
                    if (vehicleFound) {
                        checkBusyStatus(function() {
                            var checkModelEntries = function() {
                                if (!$("input[type=checkbox][name=model]")[0] || $($("input[type=checkbox][name=model]")[0]).attr("syncstate") === "loaded") {
                                    setTimeout(function() {
                                        checkModelEntries();
                                    }, 50);
                                } else {
                                    var modelFound = false;

                                    $("input[type=checkbox][name=bodyColor]").each(function() {
                                        $(this)[0].checked = false;
                                        $(this).attr("syncstate", "loaded");
                                    });

                                    $("input[type=checkbox][name=model]").each(function() {
                                        if ($(this).val().toLowerCase().indexOf(model.toLowerCase()) !== -1) {
                                            $(this).trigger("click");
                                            modelFound = true;
                                        }
                                    });

                                    if (modelFound) {
                                        checkBusyStatus(function() {
                                            var checkColorEntries = function() {
                                                if (!$("input[type=checkbox][name=bodyColor]")[0] || $($("input[type=checkbox][name=bodyColor]")[0]).attr("syncstate") === "loaded") {
                                                    setTimeout(function() {
                                                        checkColorEntries();
                                                    }, 50);
                                                } else {
                                                    var colorFound = false;
                                                    $("input[type=checkbox][name=bodyColor]").each(function() {
                                                        if ($(this).val().toLowerCase().indexOf(color.toLowerCase()) !== -1) {
                                                            $(this).trigger("click");
                                                            colorFound = true;
                                                        }
                                                    });
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
                                                }
                                            };
                                            checkColorEntries();
                                        });
                                    } else {
                                        $("#bodyMaskElement").css({
                                            "display": "none"
                                        });
                                        showProcessing(false);
                                    }
                                }
                            };
                            checkModelEntries();
                        });
                    } else {
                        $("#bodyMaskElement").css({
                            "display": "none"
                        });
                        showProcessing(false);
                    }
                } catch (exjs) {
                    /*handle failure here*/
                    $("#bodyMaskElement").css({
                        "display": "none"
                    });
                    showProcessing(false);
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
        var theCSS = "" + ".searchBarDivider{position:absolute;left:60px;top:25px;}\n" + ".searchBarDivider.shiftRight{left:120px;-webkit-transition:left 1s;transition:left 1s;}\n" + ".searchField{padding-left:55px !important;}\n" + ".searchField.shiftRight{padding-left:110px !important;-webkit-transition:padding-left 1s;transition:padding-left 1s;}\n";
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
