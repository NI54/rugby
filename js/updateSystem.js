

var urlVersionCheck="http://ni54.com/rugbyServer/index.php?r=producto/checkVersion";
var urlDownloadProduct="http://ni54.com/rugbyServer/index.php?r=producto/downloadProduct";
var urlDownloadContent="http://ni54.com/rugbyServer/index.php?r=producto/downloadContent";
var urlDownloadImage="http://ni54.com/rugbyServer/index.php?r=producto/getImage";
var urlProducto="http://ni54.com/bago/server/index.php?r=producto/view&id=";

//variables de coneccion
var estadoActualización="comprobando";
//indice de las updates actuales para asi mostrarlo graficamente
var currentUpdateIndex=0;
//lista de updates
var updatesList='null';

//object donde se guardan las tags
var tags;

//si utiliza la función de bajar y guardar imagenes, o simplemente guarda las urls
var storeImages=false;

//nombres de cada seccion en parituclar. Los index corresponden a los de la db
var secciones=["","Noticias","Sabado","Antiparasitarios Externos","Antiparasitarios Internos","Endectocidas","Antibióticos","Reproductivos","Vitamínicos y Minerales","Farmacéuticos","Salud Ambiental","Nutrición","","","",""];
//colores de cada seccion en parituclar. Los index corresponden a los de la db
var coloresSecciones=["","#1693c7","#7f7d82","#06563d","#529261","#7f781a","#e10927","#ee803c","#06527e","#77486a","#73d4ff","#dea02e","","","",""];

//indice del producto actual siendo mostrado
var currentProductoId=-1;
//indice del producto anterior mostrado
var lastProductoId=-1;

//copia en memoria del localstorage
var storageCache;

//busqueda actual
var currentBusqueda="";
//busqueda anterior
var lastBusqueda="";

//animación que se ejecuta al buscar
var animationSearch="left2";

//tag a la que ir
var tagToGo="";


//comprobacion de updates
function CheckUpdates(){
	estadoActualización="Checking";
	$.post(urlVersionCheck,{version:localStorage.getItem("version")},function(data){}).done(function(data){
		
		if(data!=""){
			data= data.split("-");
			updatesList=data;
			currentUpdateIndex=0;
			$("#loading_state").html("Updating...");
			//si hay updates, manda a bajarlas
			Update();
			
		}else{
			//sino va al menu
			$("#loading_state").html("Welcome");
			StartApp();
			}
	}).fail(function(){
		$("#loading_state").html("Connection error");
		if(localStorage.getItem("version")!=""){
			//mostrar el ver contenido local
			$("#boton-offline").fadeIn();
		}
		$("#boton-recargar").fadeIn();
		//mostrar el "volver a cargar"
	});
}


//Revisa si hay updates en la lista, sino termina el update
function Update(){
	if(updatesList.length>currentUpdateIndex){
		//lama a la primera update de la lista
		UpdateArticles();
	}else{
		//una vez todo actualizado, guarda los tags y secciones en localstorage
		FinishUpdate();
	}
}

//baja el articulo a updatear
function UpdateArticles(){
	$.post(urlDownloadProduct,{id:updatesList[currentUpdateIndex]},function(data){}).done(function(data){
			//guarda la data en un object
			originalData= data;
			//console.log(data);
			data = data.split(";");
			var auxProduct= {
			id:parseInt(data[0]),
			nombre:data[1],
			seccion:parseInt(data[2]),
			target:data[3],
			tags:data[4],
			link:data[5],
			fecha:data[6],
			isCode:data[7],
			descripcion: data[8]};
			//guarda las tags
			SaveTags(auxProduct.tags,auxProduct.id);
			SaveProducto("producto"+auxProduct.id,originalData);
			UpdateArticleContent(updatesList[currentUpdateIndex],auxProduct);
			
		}).fail(function(data){
			//console.log("faillllll");
			$("#loading_state").html("Error de conexión");
			if(localStorage.getItem("version")!=""){
				//mostrar el ver contenido local
				$("#boton-offline").fadeIn();
			}
			$("#boton-recargar").fadeIn();
		});
}

//bajar el contenido del articulo
function UpdateArticleContent(article,auxProduct){
	//baja el contenido del producto, osea, sus secciones internas
	console.log("article es ");
	console.log(article);
	$.post(urlDownloadContent,{id:article},function(dataContent){}).done(function(dataContent){
		//guarda el contenido
		SaveContent("content"+auxProduct.id,dataContent);
		//llama a la imagen del producto
		UpdateArticleImage(auxProduct);
	}).fail(function(data){
		$("#loading_state").html("Error de conexión");
		if(localStorage.getItem("version")!=""){
			//mostrar el ver contenido local
			$("#boton-offline").fadeIn();
		}
		$("#boton-recargar").fadeIn();
	});
}

//baja las imagenes del articulo
function UpdateArticleImage(auxProduct){
	$.post(urlDownloadImage,{id:updatesList[currentUpdateIndex]},function(dataImage){}).done(function(dataImage){
		//guarda la imagen
		SaveImagen(auxProduct.id,dataImage);
		//procede a la siguiente instancia de la iteracion de actualizaciones
		currentUpdateIndex++;
		SaveVersion(auxProduct.fecha);
		$("#loading_state").html("Updating...");
		Update();
	}).fail(function(data){	
		$("#loading_state").html("Error de conexión");
		if(localStorage.getItem("version")!=""){
			//mostrar el ver contenido local
			$("#boton-offline").fadeIn();
		}
		$("#boton-recargar").fadeIn();
	});
}

//función que se ejecuta al terminar de actualizar
function FinishUpdate(){
	currentUpdateIndex= updatesList.length;
	try {
		localStorage.secciones=JSON.stringify(secciones);
		localStorage.tags=JSON.stringify(tags);
		storageCache= localStorage;
	}catch(e){
		ErrorSaving();
		return;
	}
	
	$("#loading_state").html("Update complete");
	
	StartApp();
}

//función de inicio de la app
function StartApp(){
	AppendScript();
	setTimeout(function(){ 
	//y tras un delay va al menu
		SetHash("home");
	}, 1000);
	
	//script map oncologia
	var mapCanvas = document.getElementById('map-canvas');
	var mapOptions = {
		center: new google.maps.LatLng(-33.02133, -71.56816),
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(mapCanvas, mapOptions);
	//fin scrip map	
}

//Añade scrips al codigo, bajados desde las updates. Sirven como "parches"
function AppendScript(){
	//append scripts bajados del server, borrando viejos si es que hay	
	var keyword= "code";
	keyword= keyword.toUpperCase();
	keyword= keyword.trim();
	keyword= removeDiacritics(keyword);
	
	var content="";
	
	console.log(keyword.length);
	
	if(keyword in tags && tags[keyword].length>0){
	$.each(tags[keyword], function( index, value ) {
		
		var contenido=GetContenido(value);
		
		for(a=0;a<contenido.length;a+=2){
		content+='<div class="contenido_producto">'+contenido[a+1]+'</div>';
		}

	});
	}
	
	$("#app").append(content);
	
}

//guarda laversion actual
function SaveVersion(dateToSet){
	//console.log(dateToSet);
	try {
		bakeString+="localStorage.setItem('version', '"+dateToSet+"');";
		localStorage.setItem("version",dateToSet);
	}catch(e){
		ErrorSaving();
	}
}

//error al guardar un articulo
function ErrorSaving(){
	//console.log("faillllll");
	$("#loading_state").html("Error de conexión");
	if(localStorage.getItem("version")!=""){
		//mostrar el ver contenido local
		$("#boton-offline").fadeIn();
	}
	$("#boton-recargar").fadeIn();
}

//obtiene el poducto en cuestion
function GetArticle(id){
	var data=storageCache["producto"+id];
	data = data.split(";");
	var auxProduct= {
		id:data[0],
		nombre:data[1],
		seccion:data[2],
		target:data[3],
		tags:data[4],
		link:data[5],
		fecha:data[6],
		isCode:data[7],
		descripcion:data[8]
	};
	return auxProduct;
}
//obtiene el contenido de un producto
function GetContenido(id){
	var contenido= storageCache["content"+id];
	contenido= contenido.split(";;;;;");
	return contenido;
}
//obtiene el prodyucto parseado para se rmostrado en la app, inyectandolo directamente
function GetArticlePage(id,selector){
	var producto= GetArticle(id);
	var contenido= GetContenido(id);
	var toReturn='';
	
	currentProductoId=id;
	
	if(producto.isCode==0){
		//for(a=0;a<contenido.length;a+=2){
			//toReturn+='<div class="contenido_producto">'+contenido[a+1]+'</div>';
		//}
		//$("#imagen_nota").attr("src",GetImage(id) );
		//console.log("no is codeeeee");
		//var idSeccion= producto.seccion;
		//$(selector).html('<h3 style="width:85%;">'+producto.nombre.toUpperCase()+'</h3><div>'+toReturn+'</div><div class="row-half"></div>');
		$(selector).html( ArticlePageTemplate(producto,contenido));
	}else{
		for(a=0;a<contenido.length;a+=2){
			console.log(contenido[a+1]);
			toReturn+=contenido[a+1];
		}
		console.log("is codeeeee "+id);
		console.log(toReturn);
		$(selector).html(toReturn);
	}
	$(selector+" .loader").hide();
	$(selector).parent().find(".content").hide();
	$(selector).fadeIn();
}

//obtiene la imagen de un producto, es directamente el src para ser puesto en la tag img
function GetImage(id){
	if(storeImages){
		var dataImage = storageCache["imagen"+id];
		return "data:image/png;base64," + dataImage;
	}else{
		var dataImage = storageCache["imagen"+id];
		return storageCache["imagen"+id];
	}
}
//guarda un producto
function SaveProducto(id,data){
	try {
		bakeString+="localStorage.setItem('"+id+"', '"+data+"');";
	localStorage.setItem(id, data);
	}catch(e){
		ErrorSaving();
	}
}
var bakeString="";
//guarda el contenido de un producto
function SaveContent(id,data){
	try {
		bakeString+="localStorage.setItem('"+id+"', '"+data+"');";
		localStorage.setItem(id, data);
	}catch(e){
		ErrorSaving();
	}
	
}
//guarda una imagen en formato base64 (obtiene ya los datos formateados desde el servidor)
function SaveImagen(id,imgData){
	//console.log(imgData);
	
	if(storeImages){
		try {
			localStorage.setItem("imagen"+id, imgData);
		}catch(e){
			ErrorSaving();
		}
	}else{
		localStorage.setItem("imagen"+id, imgData);
	}
	
}
//guarda las tags
function SaveTags(tagsProducto,id){
	//console.log(tagsProducto);
	tagsProducto= tagsProducto.toUpperCase();
	var listaTags= tagsProducto.split(",");
	$.each(listaTags,function(index,value){
		if(value!=""){
			if(tags.hasOwnProperty(value)){
				if(tags[value].indexOf(id)==-1 ){
					tags[value].push(id);
				}
			}else{
				tags[value]=[id];
			}
		}
	});
}
//obtiene la seccion ya formateada basada en el id de la seccion
function GetSeccion(idSeccion,selector){
	
	if (typeof(selector)==='undefined') selector = "#seccion";
	
	$(selector+" .content").html("");
	$(selector+" .content").show();
	
	idSeccion= parseInt(idSeccion);
	
	console.log(secciones[idSeccion]);
	
	var keyword;
	if(idSeccion!=-1){
	keyword= secciones[idSeccion];
	}else{
	keyword= tagToGo;
	}
	keyword= keyword.toUpperCase();
	keyword= keyword.trim();
	keyword= removeDiacritics(keyword);
	
	var content="";
	content+='<div class="row-half"></div>';
	
	console.log(keyword.length);
	
	if(keyword in tags && tags[keyword].length>0){
	$.each(tags[keyword].reverse(), function( index, value ) {
		var producto=GetArticle(value);
		content+= ArticleSectionTemplate(idSeccion,selector,index,producto,content);
	});
	
	}
	console.log(content);
	
	
	$(selector+ " .loader").hide();
	content+='<div class="row-1"></div>';
	
	$(selector+" .content").append(content);
	
}

//obtiene los productos que posee la tag indicada y devuelva ya la lista de busqueda formateada
function GetBusqueda(keyword){
	$("#contenido_busqueda .content").html("");
	$("#contenido_busqueda .content").show();
	keyword= keyword.toUpperCase();
	keyword= keyword.trim();
	keyword= removeDiacritics(keyword);
	
	var content="";
	content+='<div class="row-1 header-seccion" style="background-color:lightgray;position:relative;left:5px;padding-left:0;" >\
		<h2 class="center-to-parent">'+"Búsqueda"+'</h2><image class="center-to-parent image-titulo-seccion" src="images/'+ "lupa-gris.png" +'">\
		</div>';
	if(keyword in tags && tags[keyword].length>0){
		$.each(tags[keyword], function( index, value ) {
		var producto=GetArticle(value);
		
		content+='<div class="row-4 producto_lista nota-button" id="nota_'+producto.id+'" id_nota="'+producto.id+'" style="opacity:0;border-bottom-color:'+"gray"+'">';
		content+='<div class="lista_container_imagen"><img src="'+GetImage(producto.id)+'" onerror="$(this).attr(\'iniSrc\',$(this).attr(\'src\'));$(this).attr(\'src\',\'images/reload.png\');$(this).addClass(\'reloadImage\');" ></div>';
		var cuantityTarget=0;
		var auxContent="";
		if(producto.target[0]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/caballo.png">';
		}
		if(producto.target[1]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/cabra.png">';
		}
		if(producto.target[2]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/chancho.png">';
		}
		if(producto.target[3]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/conejo.png">';
		}
		if(producto.target[4]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/gallina.png">';
		}
		if(producto.target[5]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/perro.png">';
		}
		if(producto.target[6]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/gato.png">';
		}
		if(producto.target[7]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/oveja.png">';
		}
		if(producto.target[8]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/pez.png">';
		}
		if(producto.target[9]!="0"){
			cuantityTarget++;
			auxContent+='<img src="images/vaca.png">';
		}
		var widthTarget="35%";
		if(cuantityTarget<4){
			widthTarget="30%";
		}else if(cuantityTarget<7){
			widthTarget="65%";
		}else{
			widthTarget="100%";
		}
		content+='<div align="left" class="lista_container_target">';
		content+='<div align="left"style="height:100%;;width:'+widthTarget+';float:right;">'
		content+=auxContent;
		content+='</div>';
		content+='</div>';
		content+='<div style="height:23%"><h3 >'+producto.nombre.toUpperCase()+'</h3></div>';
		if(producto.descripcion){
			content+='<p style="color:#404040;font-size:14px;text-align:left;padding-left:5%;">'+producto.descripcion+'</p>';
		}
		content+='</div>';
		$("#contenido_busqueda .content").append(content);
		
		$("#busqueda .loader").hide();
		$('#nota_'+producto.id).animate({opacity:1},1000);
		content="";
		
		$("#contenido_busqueda").scrollTop(0);
	
		});
	}else{
		content+="<div class='row-1'><p style='padding-left:5%;padding-right:5%;text-align:left;'>No se han encontrado resultados de la búsqueda</p></div>"
	}
	$("#busqueda .loader").hide();
	content+='<div class="row-1"></div>';
	
	$("#contenido_busqueda .content").append(content);
	
}


var defaultDiacriticsRemovalap = [
{'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
{'base':'AA','letters':'\uA732'},
{'base':'AE','letters':'\u00C6\u01FC\u01E2'},
{'base':'AO','letters':'\uA734'},
{'base':'AU','letters':'\uA736'},
{'base':'AV','letters':'\uA738\uA73A'},
{'base':'AY','letters':'\uA73C'},
{'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
{'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
{'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779'},
{'base':'DZ','letters':'\u01F1\u01C4'},
{'base':'Dz','letters':'\u01F2\u01C5'},
{'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
{'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
{'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
{'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
{'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
{'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'},
{'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
{'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
{'base':'LJ','letters':'\u01C7'},
{'base':'Lj','letters':'\u01C8'},
{'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
{'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
{'base':'NJ','letters':'\u01CA'},
{'base':'Nj','letters':'\u01CB'},
{'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
{'base':'OI','letters':'\u01A2'},
{'base':'OO','letters':'\uA74E'},
{'base':'OU','letters':'\u0222'},
{'base':'OE','letters':'\u008C\u0152'},
{'base':'oe','letters':'\u009C\u0153'},
{'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
{'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'},
{'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
{'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
{'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
{'base':'TZ','letters':'\uA728'},
{'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
{'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
{'base':'VY','letters':'\uA760'},
{'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
{'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'},
{'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
{'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
{'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
{'base':'aa','letters':'\uA733'},
{'base':'ae','letters':'\u00E6\u01FD\u01E3'},
{'base':'ao','letters':'\uA735'},
{'base':'au','letters':'\uA737'},
{'base':'av','letters':'\uA739\uA73B'},
{'base':'ay','letters':'\uA73D'},
{'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
{'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
{'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
{'base':'dz','letters':'\u01F3\u01C6'},
{'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
{'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
{'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
{'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
{'base':'hv','letters':'\u0195'},
{'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
{'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
{'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
{'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
{'base':'lj','letters':'\u01C9'},
{'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
{'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
{'base':'nj','letters':'\u01CC'},
{'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
{'base':'oi','letters':'\u01A3'},
{'base':'ou','letters':'\u0223'},
{'base':'oo','letters':'\uA74F'},
{'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
{'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
{'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
{'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
{'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
{'base':'tz','letters':'\uA729'},
{'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'},
{'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
{'base':'vy','letters':'\uA761'},
{'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
{'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
{'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
{'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}
];

var diacriticsMap = {};
for (var i=0; i < defaultDiacriticsRemovalap.length; i++){
	var letters = defaultDiacriticsRemovalap[i].letters;
	for (var j=0; j < letters.length ; j++){
		diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
	}
}

function removeDiacritics (str) {
	return str.replace(/[^\u0000-\u007E]/g, function(a){ 
	   return diacriticsMap[a] || a; 
	});
}    


$(document).ready(function(){
	$('body').on('tap','.boton-seccion',function(event){
		
		if(!isChanging){
			
		var animType= "";
		if( $(event.target).attr('animation-tap')!=undefined){
			animType=$(event.target).attr('animation-tap');
		}else if($(event.target).parent().attr('animation-tap')!=undefined){
			animType=$(event.target).parent().attr('animation-tap');
			console.log($(event.target).html());
		}else{
			if(currentScreen!="#menu"){
			animType= defaultAnimation;
			}else{
				animType="left2";
			}
		}
		animationType=animType;
		if($(this).attr('href')=="#seccion"){
			console.log("entra a boton seccion");
			seccionToGo=$(this).attr('id_seccion');
			if(currentSeccion!=seccionToGo){
				currentProductoId=-1;
				$("#seccion .loader").show();
				$("#contenido_seccion .content").hide();
				
			}
			SetHash("#seccion");
		}
		
		}
		 
	});
	
	$('body').on('tap','.boton-article',function(event){
		console.log("entra article");
		if(!isChanging){
			
		var animType= "";
		if( $(event.target).attr('animation-tap')!=undefined){
			animType=$(event.target).attr('animation-tap');
		}else if($(event.target).parent().attr('animation-tap')!=undefined){
			animType=$(event.target).parent().attr('animation-tap');
			console.log($(event.target).html());
		}else{
			if(currentScreen!="#menu"){
			animType= defaultAnimation;
			}else{
				animType="left2";
			}
		}
		
		
		if($(this).attr('href')=="#article"){
			
			seccionToGo=$(this).attr('id_seccion');
			$("#article .loader").hide();
			if(currentSeccion!=seccionToGo){
				currentProductoId=-1;
				$("#article .loader").hide();
				$("#contenidoPage .content").hide();
				
			}
			
			SetHash("#article");
			var article=$(this).attr('id_article');
			GetArticlePage(article,"#article");
		}
		
		}
		 
	});
	
	$('body').on('tap','.boton-tag',function(event){
		
		if(!isChanging){
			
		var animType= "";
		if( $(event.target).attr('animation-tap')!=undefined){
			animType=$(event.target).attr('animation-tap');
		}else if($(event.target).parent().attr('animation-tap')!=undefined){
			animType=$(event.target).parent().attr('animation-tap');
			console.log($(event.target).html());
			
		}else{
			if(currentScreen!="#menu"){
			animType= defaultAnimation;
			}else{
				animType="left2";
			}
		}
		animationType=animType;
		
		if($(this).attr('href')=="#seccion"){
			seccionToGo=-1;
			tagToGo=$(this).attr('tag');
			if(currentSeccion!=seccionToGo){
				currentProductoId=-1;
				$("#seccion .loader").show();
				$("#contenido_seccion .content").hide();
				
			}
			SetHash("#seccion");
			GetSeccion(seccionToGo);
			
		}
		
		}
		 
	});
});