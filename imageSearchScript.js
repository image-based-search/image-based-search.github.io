(function(){
	if(window.imageSearchScriptInjected){
		return;
	}
	
	var checkAriaBusy=function(cb){
		if($("[aria-busy]")[0] && $("[aria-busy]")[0].getAttribute("aria-busy")==="true"){
    		document.documentElement.scrollTop=0;
    		document.body.scrollTop=0;
    		showProcessing(false);
    		if((typeof cb)==="function"){
    			setTimeout(function(){cb();},0);
    		}
		}else{
			if((typeof cb)==="function"){
				setTimeout(function(){checkAriaBusy(cb);},100);
			}else{
				setTimeout(function(){checkAriaBusy();},100);
			}
		}
	};

	var analyzeImage=function(e,r){
		var image = r; 
		var xmlhttp = new XMLHttpRequest();
		var result;
		xmlhttp.onreadystatechange = function () {
		  if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
		    result = xmlhttp.responseText;
		    var obj=JSON.parse(result);
		    try{
		    	var vehicleFound=false;
		    	var make=obj.objects[0].vehicleAnnotation.attributes.system.make.name;
		    	var model=obj.objects[0].vehicleAnnotation.attributes.system.model.name;
		    	var color=obj.objects[0].vehicleAnnotation.attributes.system.color.name;

		    	var thumbnail=document.createElement("img");
				thumbnail.src=e;
				thumbnail.style.width="70px";
				thumbnail.style.position="absolute";
				thumbnail.style.left="-165px";
				$("#imgSearchBtn")[0].parentNode.insertBefore(thumbnail,$("#imgSearchBtn")[0]);
		    	thumbnail.title="Make: "+make+", Model:"+model+", Color: "+color;

		    	$("input[type=checkbox][name=make]").each(function(){
		    		if($(this).val().toLowerCase().indexOf(make.toLowerCase())!==-1){
		    			$(this).trigger("click");
		    			vehicleFound=true;
		    		}
		    	});
		    	if(vehicleFound){
		    		checkAriaBusy(function(){
		    			var checkModelAndColorEntries=function(){
		    				if(!$("input[type=checkbox][name=model]")[0] || !$("input[type=checkbox][name=bodyColor]")){
		    					setTimeout(function(){
		    						checkModelAndColorEntries();
		    					},50);
		    				}else{
				    			var modelOrColorFound=false;
		    					$("input[type=checkbox][name=model]").each(function(){
						    		if($(this).val().toLowerCase().indexOf(model.toLowerCase())!==-1){
						    			$(this).trigger("click");
						    			modelOrColorFound=true;
						    		}
						    	});
						    	$("input[type=checkbox][name=bodyColor]").each(function(){
						    		if($(this).val().toLowerCase().indexOf(color.toLowerCase())!==-1){
						    			$(this).trigger("click");
						    			modelOrColorFound=true;
						    		}
						    	});
						    	if(modelOrColorFound){
						    		checkAriaBusy();
						    	}
		    				}
		    			};
		    			checkModelAndColorEntries();
		    		});
		    	}
		    }catch(exjs){
		    	/*handle failure here*/
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
		a.length > 185 && (a = a.substr(0, 184) + "...");
		processSelectedImage(e, a, t);
		showProcessing(true);
	};
	var interval=0;
	var showProcessing=function(o){
		if(!o){
			clearInterval(interval);
			$("#imgSearchBtn").html("Image Search");
		}else{
			var msgs=["Processing .","Processing . .","Processing . . ."];
			var ctr=0;
			interval=setInterval(function(){
				$("#imgSearchBtn").html(msgs[ctr%3]);
				ctr++;
			},200);
		}
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
