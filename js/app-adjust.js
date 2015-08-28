var useCache=false;

//ajustes iniciales de la app, son llamados desde appflow
function InitiAdjust(){
	//SaveVersion("");
	//localStorage.clear();
	
	storageCache= localStorage;
	
	useCache=true;
	
	defaultAnimation= "left2";
	currentScreen="#splash";
	home="#splash";
	
	$(".pageMia").hide();;
	
	$(currentScreen).show();
	
	

	if(!localStorage.secciones){
		if(useCache){
			SetCache();
		}
	}else{
		
	}
	
	if(!localStorage.tags){
		tags={};
	}else{
		tags= JSON.parse(localStorage.tags);
	}
	
	if(!localStorage.fontSize){
		SetFontSize("medium");
		localStorage.fontSize="medium";
		currentFontSize="medium";
		$("#font"+currentFontSize).addClass("font-selected");
	}else{
		SetFontSize(localStorage.fontSize);
		currentFontSize=localStorage.fontSize;
		$("#font"+currentFontSize).addClass("font-selected");
	}
	
	$("#btn-scrollup").css("top",row2);
	
	if(checkMac()){
		$(".salida").css("display","none");
	}
	$(".slide").css('height',row8);
	console.log($(".slide").css('height'));
	
	$(".slide").css("width",widthApp-3+"px");
	$("#contenedor-slides").css("width",widthApp*4+"px");
	$('#flecha-slider').css('left',widthApp*0.15);
	
	showRemaining();
	setInterval( function () { time() }, 1000);
	
}

$(document).ready(function(){
	//seteo de tap de botones y de input
	$('body').on('tap','.reloadImage',function(event){
		$(event.target).removeAttr("src").attr("src",$(event.target).attr("iniSrc"));
	});
	
	$('body').on('tap','.boton-article-rugby',function(event){
		var article=$(this).attr('id_article');
		GetArticlePage(article,"#article");
	});
					
	$('body').on('tap','.exitButt',function(){
		$("#overlayBlack").fadeIn();
		$("#rejectExit").fadeIn();
		$("#confirmExit").fadeIn();
		$("#shareButton").hide();
		$("#emailButton").hide();
		$("#formMail").hide();
		$("#enviado").hide();
		$("#errorEnvio").hide();
	});
	
	$('body').on('tap','#confirmExit',function(){
		Cocoon.App.exit();
	});
	$('body').on('tap','.rejectExit',function(){
		$("#overlayBlack").fadeOut();
	});

	$('body').on('tap','#nota_enviar',function(event){
		$("#overlayBlack").fadeIn();
		$("#rejectExit").fadeIn();
		$("#confirmExit").hide();
		$("#shareButton").fadeIn();
		$("#emailButton").fadeIn();
		$("#formMail").hide();
		$("#enviado").hide();
		$("#errorEnvio").hide();
	});
	
	$('body').on('tap','#shareButton',function(event){
		Cocoon.Social.share("Le comparto este producto del vademécum de Biogénesis Bagó "+urlProducto+currentProductoId);
			$("#overlayBlack").fadeOut();
	});
	
	$('body').on('tap','#sendEmail',function(event){
		$("#formMail").fadeOut();
		var toInput=$("#toInput").val();
		var fromInput=$("#fromInput").val();
		
		$.post("http://ni54.com/oncologia2/server/index.php?r=producto/sendProducto",{id:currentProductoId,from:fromInput,to:toInput}).done(function(data){
			if(data=="ok"){
				
				$("#enviado").fadeIn();
				
				setTimeout(function(){$("#overlayBlack").fadeOut()},3000);
			}else{
				$("#errorEnvio").fadeIn();
			}
		});
	});
	
	$('body').on('tap','#emailButton',function(event){
		
		$("#rejectExit").fadeOut();
		$("#confirmExit").fadeOut();
		$("#shareButton").fadeOut();
		$("#emailButton").fadeOut();
		setTimeout(function(){ $("#formMail").fadeIn();},500);
		
	});
	
	$('body').on('tap','#boton-recargar',function(event){
		$("#boton-recargar").fadeOut();
		$("#boton-offline").fadeOut();
		$("#loading_state").html("Loading...");
		CheckUpdates();
	});
	
	$('body').on('tap','#boton-offline',function(event){
		SetHash('#menu');
	});
	
	$('body').on('tap','.btn-lupa',function(event){
		if($("#busqueda-menu").val()!=""){
			currentBusqueda=$("#busqueda-menu").val();
			$("#busqueda-menu").val("");
			if(currentBusqueda!=lastBusqueda){
				$("#busqueda .loader").show();
				$("#contenido_busqueda .content").hide();
			}
			animationType=animationSearch;
			SetHash("#busqueda");
		}
	});
	
	$('body').on('tap','.btn-lupa-blanca',function(event){
		
		if($( ".buscador_seccion" ).css("width")=="0px"){
			
			$( ".buscador_seccion" ).animate({
				width:"78%"
			}, 300, function() {
				$( ".buscador_seccion input" ).focus();
			});
		}else if($( ".buscador_seccion input" ).val()==""){
			$( ".buscador_seccion" ).animate({
				width:"0%"
			}, 300, function() {
				
			});
		}else{
			currentBusqueda=$( ".buscador_seccion input" ).val();
			$( ".buscador_seccion input" ).val("");
			animationType=animationSearch;
			if(currentBusqueda!=lastBusqueda){
				$("#busqueda .loader").show();
				$("#contenido_busqueda .content").hide();
			}
			SetHash("#busqueda");
		}
	});
	
	$("#busqueda-menu").keyup(function(event){
		if(event.keyCode == 13){
			currentBusqueda=$("#busqueda-menu").val();
			$("#busqueda-menu").val("");
			animationType=animationSearch;
			if(currentBusqueda!=lastBusqueda){
				$("#busqueda .loader").show();
				$("#contenido_busqueda .content").hide();
			}
			SetHash("#busqueda");
		}
	});
	$('body').on('keyup', "#busqueda-menu2" ,function(event){
		if(event.keyCode == 13){
			currentBusqueda=$("#busqueda-menu2").val();
			$("#busqueda-menu2").val("");
			animationType=animationSearch;
			if(currentBusqueda!=lastBusqueda){
				$("#busqueda .loader").show();
				$("#contenido_busqueda .content").hide();
			}
			SetHash("#busqueda");
		}
	});
	
	$('body').on('tap','#btn-scrolldown',function(event){
		ScrollDown();
	});
	
	$('body').on('tap','#btn-scrollup',function(event){
		ScrollUp();
	});
	
	var hideNoticia=false;
	$('body').on('tap','.return-noticias',function(event){
		if(!hideNoticia){
			
			console.log("return noticia");
			hideNoticia=true;
			setTimeout(function(){hideNoticia=false;$("#article").hide();
			$("#noticias .content").fadeIn();},100);	
		}
	});
	
	$('body').on('tap','#boton-menu-fuente',function(event){
		
		if($( "#menu-fuente" ).css("opacity")=="0"){
			$( "#menu-fuente" ).animate({
				opacity:'1'
			}, 300, function() {
				
			});
		}else{
			$( "#menu-fuente" ).animate({
				opacity:'0'
			}, 300, function() {
				
			});
		}
	});
	
});

function EndAdjust(){
	if(currentScreen=="#configuracion"){
		$(".boton-config").css("opacity","0.2");
	}else{
		$(".boton-config").css("opacity","1");
	}
	
	if(currentScreen=="#seccion"&&!returning){
		lastScreen="#seccion";
		if(seccionToGo!=currentSeccion){
			currentSeccion=seccionToGo;
			GetSeccion(seccionToGo);
		}
	}
	
	if(currentScreen=="#speakers"){
		lastScreen="#speakers";
		GetSpeakers();
	}
	
	if(currentScreen=="#videos"){
		lastScreen="#videos";
		GetVideos();
	}
	
	if(currentScreen=="#busqueda"){
		lastScreen="#busqueda";
		if(currentBusqueda!=lastBusqueda){
			lastBusqueda= currentBusqueda;
			GetBusqueda(currentBusqueda);
		}
	}
	returning=false;
}

function GetAgenda(){
	
	$("#contenido_seccion .content").html("");
	$("#contenido_seccion .content").show();
	idSeccion= parseInt(idSeccion);
	var articulos=[97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127];
	var content="";
	content+='<div class="row-half"></div>';
	
	content+="<div class='separador-dia'>Viernes 31</div>"
	
	$.each(articulos,function(index,value){
		
		var producto=GetArticle(value);
		
		if(value==98){
			content+="<div class='separador-agenda'>Essentials of tumour immunology</div>"
		}
		if(value==103){
			content+="<div class='separador-agenda'>Essentials in immunotherapies</div>"
		}
		if(value==108){
			content+="<div class='separador-agenda'>Cancer Immunology: Basic Principles and Historical Perspectives</div>"
		}
		if(value==116){
			content+="<div class='separador-dia'>Sábado 1</div>"
			
		}
		if(value==117){
			content+="<div class='separador-agenda'>Cancer Immunology: Melanoma</div>"
		}
		
		if(value==102||value==107||value==111||value==115||value==121||value==127){
			content+='<div class="producto_lista" id="nota_'+producto.id+'" id_nota="'+producto.id+'" style="opacity:1;border-bottom-color:'+coloresSecciones[idSeccion]+'">';
		}else{
			content+='<div class="producto_lista nota-button" id="nota_'+producto.id+'" id_nota="'+producto.id+'" style="opacity:1;border-bottom-color:'+coloresSecciones[idSeccion]+'">';
		}
		
		var widthTarget="35%";
		var cuantityTarget=0;
		var auxContent="";
		
		console.log(producto);
		if(value==102||value==107||value==111||value==115||value==121||value==127){
			content+='<div class="center-to-parent"style="padding:10px;"><p class="fecha-evento">'+producto.link+' hrs</p><h4>'+producto.nombre.toUpperCase()+'</h4></div>';
		}else{
			content+='<div class="center-to-parent"style="padding:10px;"><p class="fecha-evento">'+producto.link+' hrs<span class="more-info-button">+</span></p><h4>'+producto.nombre.toUpperCase()+'</h4></div>';
		}
		if(producto.descripcion){
			content+='<p style="color:#404040;font-size:14px;text-align:left;padding-left:5%;">'+producto.descripcion+'</p>';
		}
		content+='</div><div class="row-half"></div>';
		$("#contenido_seccion .content").append(content);
		
		content="";
		
		$("#seccion .loader").hide();
	});
	
	$("#seccion .loader").hide();
	content+='<div class="row-1"></div>';
	
	$("#contenido_seccion .content").append(content);
	
}




var segundos = -1;
var minutos = 10;
var horas = 12;
var dias = 49;



function time(){
	segundos--;
	if (segundos<0){
		segundos = 59;
		minutos--;
	}
	document.getElementById('segundo').innerHTML = segundos + '<p style="margin-top:-2%;font-size:3vw;">SEGS</p>';
	
	
	if(minutos<0){
		minutos=59;
		horas--;
	}
	document.getElementById('minuto').innerHTML =  minutos +  '<p style="margin-top:-2%;font-size:3vw;">MINS</p>';
	
	if (horas<0){
		horas=23;
		dias--
	}
	document.getElementById('hora').innerHTML = horas +  '<p style="margin-top:-2%;font-size:3vw;">HRS</p>';
	
	if(dias<0){
		dias=0;
	}
	document.getElementById('dia').innerHTML = dias +   '<p style="margin-top:-2%;font-size:3vw;">DÍAS</p>';
	
}

var currentSlide=1;

function ChangeSlide(slideNumber){
	if(slideNumber==1){
		
		
		
		$('#flecha-slider').transition({
			x:widthApp*0,
			duration: transitionTime*2,
			complete: function(){
			}
		});
		
		$('#contenedor-slides').transition({
			x:0+'px',
			duration: transitionTime*2,
			complete: function(){
			}
			});
		
		currentSlide=1;
	}else if(slideNumber==2){
		
		
		$('#flecha-slider').transition({
			x:widthApp*0.215,
			duration: transitionTime*2,
			complete: function(){
			}
		});
		
		
		$('#contenedor-slides').transition({
			x:-widthApp+'px',
			duration: transitionTime*2,
			complete: function(){
			}
			});
		
		currentSlide=2;
	}else if(slideNumber==3){
		
		
		$('#flecha-slider').transition({
			x:widthApp*0.43,duration: transitionTime*2,
			complete: function(){
			}
		});
		
		
		$('#contenedor-slides').transition({
			x:-widthApp*2+'px',
			duration: transitionTime*2,
			complete: function(){
			}
			});
		currentSlide=3;
	}else if(slideNumber==4){
		
	}
}


var end = new Date('09/18/2015 5:00 PM');

    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var _day = _hour * 24;
    var timer;
	
	

    function showRemaining() {
        var now = new Date();
        var distance = end - now;
       /* if (distance < 0) {

            clearInterval(timer);
            //document.getElementById('countdown').innerHTML = 'EXPIRED!';

            return;
        }*/
		dias = Math.floor(distance / _day);
		horas = Math.floor((distance % _day) / _hour);
		minutos = Math.floor((distance % _hour) / _minute);
		segundos = Math.floor((distance % _minute) / _second);

       	document.getElementById('dia').innerHTML = dias;
        	document.getElementById('hora').innerHTML = horas;
       	document.getElementById('minuto').innerHTML = minutos ;
       	document.getElementById('segundo').innerHTML = segundos;
    }
	

	
	//elminar, deprecada
function GetSpeakers(){
	var producto= GetArticle(128);
	var contenido= GetContenido(128);
	var toReturn='';
	
	currentProductoId=128;
	
	for(a=0;a<contenido.length;a+=2){
		toReturn+='<div class="contenido_producto">'+contenido[a+1]+'</div>';
	}
	
	$("#listaSpeakers").html('<div>'+toReturn+'</div>');
	$("#speakers .loader").hide();
}

//eliminar, deprecada
function GetVideos(){
	var producto= GetArticle(129);
	var contenido= GetContenido(129);
	var toReturn='';
	
	currentProductoId=129;
	
	for(a=0;a<contenido.length;a+=2){
		toReturn+='<div class="contenido_producto">'+contenido[a+1]+'</div>';
	}
	
	$("#listaVideos").html('<div>'+toReturn+'</div>');
	$("#videos .loader").hide();
	//$("#listaSpeakers .content").fadeIn();
}



function ArticleSectionTemplate(idSeccion,selector,index,producto){
		
	
	
		var content="";
		
		console.log(GetImage(producto.id));
		console.log(producto.id);
		var imagen=GetImage(producto.id);
		
		var template="";
		
		if(imagen!='http://ni54.com/rugbyServer/index.php?r=imagen/view&id='){
			
			template='<div  style="margin-top:9%;" class="noticia-1 boton-article-rugby"  href="#article" id_article="${id}" >\
			<img class="img-noticia-1" src="${imagen}" />\
			<h1 class="h1-noticia-1">${titulo}</h1>\
			<p class="description-noticia-1">${bajada}</p>\
			<a class="ver-mas-img a-noticias" ><p class="ver-mas" >Ver más</p></a>\
			</div>	\
			<div class="linea"></div>';			
		}else{
			
			template='<div class="noticia-2 boton-article-rugby" href="#article" id_article="${id}">\
				<h1 class="h1-noticia-2">${titulo}</h1>\
				<p class="description-noticia-2">${bajada}</p>\
				<a class="ver-mas-img a-noticias "  ><p class="ver-mas" > Ver más</p>  </a>\
				</div>			\
			<div class="linea"></div>';
		}
		
		template=template.replace("${imagen}",GetImage(producto.id))	;
		
		template=template.replace("${titulo}",producto.nombre);
		template=template.replace("${id}",producto.id);
		template=template.replace("${bajada}",producto.descripcion);
		
		content= template;
		
		/*content+='<div class="producto_lista boton-article" id="nota_'+producto.id+'" id_article="'+producto.id+'" style="opacity:1;border-bottom-color:'+coloresSecciones[idSeccion]+'" href="#article">';
		
		var widthTarget="35%";
		var cuantityTarget=0;
		var auxContent="";
	
		content+='<div class="center-to-parent"style="padding:10px;"><p class="fecha-evento">10 hrs <span class="more-info-button">+</span></p><h4>'+producto.nombre.toUpperCase()+'</h4></div>';
		if(producto.descripcion){
			content+='<p style="color:#404040;font-size:14px;text-align:left;padding-left:5%;">'+producto.descripcion+'</p>';
		}
		content+='</div><div class="row-half"></div>';*/
	
	
		//$(selector+ " .loader").hide();
		return content;
}

function ArticlePageTemplate(producto,contenido){
	var imagen=GetImage(producto.id);
	var template="";
		
		if(imagen!='http://ni54.com/rugbyServer/index.php?r=imagen/view&id='){
			
			template='<div  style="margin-top:9%;" class="noticia-1"  >\
			<img class="img-noticia-1" src="${imagen}" />\
			<h1 class="h1-noticia-1">${titulo}</h1>\
			<p class="description-noticia-1">${bajada}</p>\
			</div>	\
			<div class="return-noticias"  ><img src="img/volver.png" style="width:100%;"></div>\
			<div class="linea"></div>';			
		}else{
			
			template='<div class="noticia-2">\
				<h1 class="h1-noticia-2">${titulo}</h1>\
				<p class="description-noticia-2">${bajada}</p>\
				<div class="return-noticias"  ><img src="img/volver.png" style="width:100%;"></div>\
				</div>			\
			<div class="linea"></div>';
		}
		template=template.replace("${imagen}",GetImage(producto.id))	;
		
		template=template.replace("${titulo}",producto.nombre);
		template=template.replace("${id}",producto.id);
		var contenidoStr="";
		for(a=0;a<contenido.length;a+=2){
			contenidoStr+=contenido[a+1];
		}
		template=template.replace("${bajada}",contenidoStr);
		
	return template;
}