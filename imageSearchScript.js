(function(){
	if(window.imageSearchScriptInjected){
		return;
	}
	
	var analyzeImage=function(e,r){
		var image = r; 
		var xmlhttp = new XMLHttpRequest();
		var result;
	
		xmlhttp.onreadystatechange = function () {
		  if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
		    result = xmlhttp.responseText;
		    var obj=JSON.parse(result);
		    try{
		    	var make=obj.objects[0].vehicleAnnotation.attributes.system.make.name;
		    	$("input[type=checkbox][name=make]").each(function(){
		    		if($(this).val().toLowerCase().indexOf(make.toLowerCase())!==-1){
		    			$(this).trigger("click");
		    		}
		    	});
		    	var checkAriaBusy=function(){
		    		if($("[aria-busy]")[0] && $("[aria-busy]")[0].getAttribute("aria-busy")==="true"){
			    		document.documentElement.scrollTop=0;
			    		document.body.scrollTop=0;
		    		}else{
		    			setTimeout(function(){checkAriaBusy();},100);
		    		}
		    	};
		    	checkAriaBusy();
		    }catch(exjs){
		    	/*handle failure here*/
		    	console.log("Error:",exjs);
		    }
		  }
		}
	
		xmlhttp.open("POST", "https://dev.sighthoundapi.com/v1/recognition?objectType=vehicle,licenseplate");
		xmlhttp.setRequestHeader("Content-type", "application/octet-stream");
		xmlhttp.setRequestHeader("X-Access-Token", "ZO0PdOzYeXQlsxtf4G3FhL9hoof5GuFP3Oz7");
		xmlhttp.send(image);
	};
	
	var _handleFileUpload=function(e) {
        var t, r = e.target.files[0];
        if (r instanceof Blob) {
            var a = new FileReader;
            a.onload = function(e) {
                t = e.target.result,
                handleImageUpload(t, r)
            };
            a.readAsDataURL(r);
        }
    }
	
	var handleImageUpload=function(e, t) {
		var r = e, a = r.split(",")[1];
		a.length > 185 && (a = a.substr(0, 184) + "..."),
		processSelectedImage(e, a, t)
	};
	
	var processSelectedImage=function(e, t, r) {
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
	
	var frag=document.createDocumentFragment();
	var searchForm=$("[name=searchQuery]").parents("form:eq(0)")[0];
	
	var fileInputField=document.createElement("input");
	fileInputField.type="file";
	fileInputField.name="fileinputfield";
	fileInputField.id="fileinputfield";
	fileInputField.style.display="none";
	frag.appendChild(fileInputField);
	
	var imgSearchBtn=document.createElement("div");
	imgSearchBtn.innerHTML="Image Search";
	imgSearchBtn.id="imgSearchBtn";
	imgSearchBtn.style.display="inline-block";
	imgSearchBtn.style.textTransform="none";
	imgSearchBtn.style.fontWeight="bold";
	imgSearchBtn.style.position="absolute";
	imgSearchBtn.style.top="30px";
	imgSearchBtn.style.left="-85px";
	frag.appendChild(imgSearchBtn);
	
	searchForm.parentNode.appendChild(frag);
	
	$("#imgSearchBtn").on("click",function(e){
		fileInputField.click();
	});
	
	$("#fileinputfield").on("change",function(e){
		_handleFileUpload(e);
	});
	window.imageSearchScriptInjected=true;
}());

/*

bookmarklet code:

javascript:(function(){var scr=document.createElement("script");scr.src="https://image-based-search.github.io/imageSearchScript.js";document.getElementsByTagName("head")[0].appendChild(scr);}());

*/
