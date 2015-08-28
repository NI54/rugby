		//hash actual
		var currentScreen="#splash";
		//hash anterior
		var previousScreen="";
		//auxiliar de hash anterior
		var lastScreen="";
		//hash del menu
		var menu="#menu";
		//hash del home
		var home="#home";
		
		//alto de la app
		var heightApp=600;
		//ancho de la app
		var widthApp=600;
		
		//si esta en proceso de cambiar de pantalla, osea, animando el cambio de pantalla
		var isChanging=false;
		
		//animacion actual para transicion de pantallas		
		var animationType="down";
		
		//animación default para transición de pantallas.
		var defaultAnimation="down";
		
		//array de historial de pantallas
		var historyArray= new Array();	
		
		//si anda intentando volver atras en historial
		var returning=false;
		
		//indica si la pagina actual tiene activado el scroll
		var scrolleable=false;
		
		//offset de la animacion en vertical, suele ser el tamaño del header
		var verticalAnimationOffset;
		
		//si el dispositivo soporta transiciones 3d
		var has3d;
		
		//id de la seccion actual
		var idSeccion=-1;
		//id del articulo actual
		var idArticulo=-1;
		
		//tamaño actual de fuente, a mejorar el sistema aun
		var currentFontSize="medium";
		
		//si el hash actual fue seteado a travez de botones o funciones (evita romper la app en web)
		var hashSet=true;
		
		//seccion a la que se dirige
		var seccionToGo;		
		//seccion actual
		var currentSeccion;	

		//tiempo de las transiciones de pantalla en milisegundos
		var transitionTime=300;
		//timepo de transicion para dispositivos viejos
		var transitionTimeOld=700;
		
		//previene que se active el ir hacia atras por teclas estandar en navegador y algunos moviles
		$(document).bind('keydown', function(event) {
		  if (event.keyCode == 27||event.keyCode == 8) {
			BackButton();
			
		  }
		});
		
		
		//funcion de ir hacia atras
		function BackButton(){
			
			event.preventDefault();
			animationType="right2";
		
			
			if(currentScreen=="#menu"){
				animationType="right2";
				if(historyArray.length>0){
					returning=true;
					var auxHash=historyArray.pop();
					if(auxHash=="splash"||auxHash=="#splash"){
						return;
					}
					if(currentScreen=="#menu"){
						animationType="left2";
					}
					
					SetHash(auxHash);
				}
			}else{
				animationType="right";
				if(currentScreen=="#article"){
					SetHash(lastScreen);
				}else{
					SetHash("menu");
				}
			}
			
		}
		
		//funciones que se ejecutan ni bien estar lista la app: inicialización de botones, bind de eventos,inicio de funciones iniciales
		$(document).ready(function(){
			
			
			$(".pageMia").hide();
			
			$('body').on('tap','.appButton,.botones_menu',function(event){
				
				if(!isChanging){
					var animType= "";
					if( $(event.target).attr('animation-tap')!=undefined){
						animType=$(event.target).attr('animation-tap');
						console.log("entra 1");
					}else if($(event.target).parent().attr('animation-tap')!=undefined){
						animType=$(event.target).parent().attr('animation-tap');
						console.log($(event.target).html());
						console.log("entra 2");
						
					}else{
						if(currentScreen!="#menu"){
							animType= defaultAnimation;
						}else{
							animType="left2";
						}
					}
					console.log(animType);
					animationType=animType;
					
					SetHash($(this).attr('href'));
										
				
				}
				 
			});
			
			$('body').on('tap','.nota-button',function(event){
				if(!isChanging){
					
					if($(event.target).hasClass("reloadImage")){
						return;
					}
					var animType= "left2";
					
					animationType=animType;
					
					lastProductoId=currentProductoId;
					currentProductoId=$(this).attr('id_nota');
					if(currentProductoId!=lastProductoId){
						$("#article .loader").fadeIn();
						$("#nota .content").hide();
					}
					SetHash("#article");
				}
			});	
			
			$('body').on('tap','.boton-config',function(){
				if(!isChanging){
					var animType= "right";
					
					animationType=animType;
					
					SetHash("#configuracion");
				}
			});
			
			$('body').on('tap','.boton-menu',function(event){
				
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
			
			$('body').on('tap','.volver',function(){
				animationType="right2";
				if(historyArray.length>0){
					returning=true;
					var auxHash=historyArray.pop();
					if(currentScreen=="#menu"){
						animationType="left2";
					}
					SetHash(auxHash);
				}
			});
			
			$('body').on('tap',".btn_menu",function(event){
				if(currentScreen!="#menu"){
					
					if( $(event.target).attr('animation-tap')!=undefined){
					var animType= $(event.target).attr('animation-tap');
					
					animationType=animType;
					}else{
						animationType="right";
					}
					SetHash("menu");
				}else{
					
					if(historyArray.length>0){
						returning=true;
						var auxHash=historyArray.pop();
						if(auxHash!="splash"&&auxHash!="#splash"){
							animationType="left2";
							SetHash(auxHash);
						}
					}
				}
			});
		
			//chequea si el dispositivo soporta transiciones 3d
			has3d=supports3d();
			
			//esconde el loader default de jquery mobile
			$('.ui-loader').attr('style','display:none;');
			
			//evento que se dispara al cambiar el historial, no funciona muy bien esta como backup por las dudas para inicial la app
			$(window).on('popstate',function(event) {
				if(event.originalEvent.state!=null){
					var hash = location.hash.replace( /^#/, '' );
					
				}
			});
			
			//evento que se ejecuta al resizear app
			$( window ).resize(function() {
				Resize();
			});
			
			//evento de cambio de hash
			$(window).on('hashchange',function(){
				HashChanged();
			});
			
			//llamado a risize para asegurarse se ejecute al menos una vez
			Resize();
			
			//ajustes iniciales, estan en la clase "app-adjust", son seteados por el usuario
			InitiAdjust();
			
			//desactiva screens iniciales(deprecada pero hay que reflotarla me parece, antes de initadjust seguro)
			DeactivateScreens();
			
			//Setea el hash al home, se sobreescribe con init adjust me parece?
			SetHash(home);
			
			//revisa si tiene scroll la pagina
			CheckScroll();
			//revisa el sistema de back e historial
			CheckBack();
			
		});
		
		//pone en fadein al splash, en pelea con initadjust creo?
		$(window).load(function(){
			$("#splash").fadeIn(1000);
			//llama a check updates 2 veces? raro
			setTimeout(function(){CheckUpdates();},1200)
		});
		
		//desactivar screens, deprecado quizas a reflotarlo?
		function DeactivateScreens(){
			
		}
		
		//se ejecuta en cambio de hash
		function HashChanged(){
			var currentdate = new Date();
			//comprueba si fue dada la directiva de cambio de hash por codigo, o fue resultado externo
			if(!isChanging&&hashSet){
				//entra si fue dada la directiva
				hashSet=false;
				var hash = location.hash.replace( /^#/, '' );
				var origiHash=hash;
				hash="#"+hash;
				SetScreen(hash)
				
			}else{
				//en caso de cambiar hash por error, principalmente por causa del backbutton
				var hash = location.hash.replace( /^#/, '' );
				hash="#"+hash;
				//solo podes apretar back en seccion, que te redirecciona a menu.
				if(hash=="#splash"){
					if(currentScreen=="#splash"){
						SetScreen(currentScreen);
					}else{
						SetScreen('#menu');
					}
					
				}else if(hash=="#menu"&&currentScreen=="#seccion"){
					SetScreen('#menu')
				}else if(currentScreen=="#article"){
					console.log("entra producto");
					if(hash=="#seccion"){
						hashSet=true;
						HashChanged();
					}else{
						SetHash("#seccion");
					}
				}else if(currentScreen=="#configuracion"){
					if(hash!="#splash"){
						hashSet=true;
						HashChanged();
					}
				}else{
					SetHash(currentScreen);
				}
			}
		}
		
		//setea la pantalla, se llama solo desde HashChanged
		function SetScreen(hash){
				if($(hash).length == 0) {
					SetHash(currentScreen);
					return;
				}else{
					
				}				
				previousScreen= currentScreen;
				
				currentScreen=hash;	
				
				if(currentScreen==previousScreen){
						return;
				}
				
				if(currentScreen==home){
					historyArray= new Array();
				}
				isChanging=true;
				Transition();
		}
		
		//chequea y llama la animacon correspondiente
		function Transition(){
			if(androidVersion>=4||checkMac()){
				switch(animationType){
					case "down":
						AnimateDown();
					break;
					case "up":
						AnimateUp();
					break;
					case "up2":
						AnimateUp2();
					break;
					case "down2":
						AnimateDown2();
					break;
					case "left":
						AnimateLeft();
					break;
					case "left2":
						AnimateLeft2();
					break;
					case "right":
						AnimateRight();
					break;
					case "right2":
						AnimateRight2();
					break;
					default:
						animationType= defaultAnimation;
					break;
				}
			}else{
				AnimateFade();
			}			
		}
		
		//se ejecuta al final de cada trancision
		function EndTransition(){
			$(previousScreen).hide();
			$(currentScreen).show();
			
			EndAdjust();
			
			CheckScroll();
			
			CheckBack();
			Resize();
			
		}
		
		//setea el hash y da la directva de que fue seteado por codigo
		function SetHash(hash){
			if(!isChanging&&!($("#overlayBlack").is(":visible"))){
				
				if($(hash).length == 0) {
					
				}
				hashSet=true;
				window.location.hash = hash;
			}
		}
		
		//revisa si requiere scroll la seccion, en cuyo caso lo sete y aplica el codigo correspondiente segun la version de android. En constante construccion
		function CheckScroll(){
			//chequea scrolling mediante el atributo de la pagina "scrolleable"
			if($(currentScreen).attr('scrolleable')!=undefined){
				if($(currentScreen).attr('scrolleable')=="on"){
					
					scrolleable=true;
					
					if(parseFloat(getAndroidVersion())<4&&!checkMac()){
						$(currentScreen).find('.contenidoPage').css('overflow','scroll');
						$(currentScreen).find('.contenidoPage').css('overflow-x','hidden');
						$("#btn-scrolldown").show();
						$("#btn-scrollup").hide();
					}else{
						$(currentScreen).find('.contenidoPage').css('overflow','scroll');
						$(currentScreen).find('.contenidoPage').css('overflow-x','hidden');
						$("#btn-scrolldown").hide();
						$("#btn-scrollup").hide();
					}
				}else{
					scrolleable=false;
					$(currentScreen).find('.contenidoPage').css('overflow','hidden');
					$("#btn-scrolldown").hide();
					$("#btn-scrollup").hide();
				}
			}else{
				scrolleable=false;
				$(currentScreen).find('.contenidoPage').css('overflow','hidden');
				$("#btn-scrolldown").hide();
				$("#btn-scrollup").hide();
			}
			//revisa tmb el atributo show header y le aplica un fadein o fadeout al mismo en caso de no usarse en una seccion en particular
			if($(currentScreen).attr('showHeader')!=undefined){
				if($(currentScreen).attr('showHeader')=="false"){
					FadeOutHeader();
				}else{
					FadeInHeader();
				}
			}else{
				FadeInHeader();
			}
			//revisa tmb el atributo show footer y le aplica un fadein o fadeout al mismo en caso de no usarse en una seccion en particular
			if($(currentScreen).attr('showFooter')!=undefined){
				if($(currentScreen).attr('showFooter')=="false"){
					$(".footer").fadeOut();
				}else{
					$(".footer").fadeIn();
				}
			}else{
				$(".footer").fadeIn();
			}
		}
		
		//revisa el backbutton, en caso de ser la ultima pantalla sale de la aplicacion (alterna boton volver y salir)
		function CheckBack(){
			if(!returning){
				if(previousScreen!="menu"){
					
					historyArray.push(previousScreen);
				}
			}else{
				//returning=false;
			}
			
			if(currentScreen!="home"&&currentScreen!="#home"){
				
			}else{
				
			}
		}
		
		//height de la app - header
		var heightAcortada3=10;
		//tamaño header
		var auxHHEad=10;
		//se encarga de hacer los seteos necesarios en caso de resizear la pag, habria que hacer chequeos diferidos para modo landscape y portrait
		function Resize(){
			
			SetRows();
			
			heightApp=$('#app').height();
			
			var rule = getStyleRule('.pageMia');
			
			auxHHEad=$(".header").height();
			
			heightAcortada3=heightApp-auxHHEad;
			
			rule.height = heightAcortada3+"px";
			
			widthApp= $('#app').width();
			rule.width = widthApp+"px";
						
			var heightAcortada=heightApp-80;
			var heightAcortada2=heightApp-90;
			
			CenterToParent();
			
			verticalAnimationOffset= $('.header').height();
		}
		
		
		//alinea elementos que tengan esta clase para que esten centrados en vertical con respecto a su parent
		function CenterToParent(){
			console.log("center to parent");
			$('.center-to-parent').each(function(index){
				
				var auxTop= ($(this).parent().outerHeight()-$(this).outerHeight())/2;
				
				$(this).css('top',auxTop+"px");
				
			});
		}
		
		//chequea si el dispositivo admite transformaciones 3d
		function supports3d() {
			var div = document.createElement('div'),
			ret = false,
			properties = ['perspectiveProperty', 'WebkitPerspective'];
			for (var i = properties.length - 1; i >= 0; i--){
				ret = ret ? ret : div.style[properties[i]] != undefined;
			};

			if (ret){
				var st = document.createElement('style');
				st.textContent = '@media (-webkit-transform-3d){#test3d{height:3px}}';
				document.getElementsByTagName('head')[0].appendChild(st);
				div.id = 'test3d';
				document.body.appendChild(div);
				
				ret = div.offsetHeight === 3;
				
				st.parentNode.removeChild(st);
				div.parentNode.removeChild(div);
			}
			return ret;
	}
	
	//setea a nivel hardcodeo a lo más bajo las propiedades de una clase para asi se apliquen a elementos que se introduscan por append o html()
	function getStyleRule(name) {
		for(var i=0; i<document.styleSheets.length; i++) {
			var ix, sheet = document.styleSheets[i];
			for (ix=0; ix<sheet.cssRules.length; ix++) {
				if (sheet.cssRules[ix].selectorText === name)
					return sheet.cssRules[ix].style;
			}
		}
		return null;
	}
	//funcion de chequeo de swipes
	$(function() {
		  
		if(parseFloat(getAndroidVersion())>=4 ||checkMac()){
			
			$("body").swipe( { fingers:'all', swipeLeft:swipe1, swipeRight:swipe1, allowPageScroll:"auto"} );
		}else{
			$("body").swipe( { fingers:'all', swipeLeft:swipe1, swipeRight:swipe1, swipeUp:swipe1, swipeDown:swipe1, allowPageScroll:"auto"} );
		}
		function swipe1(event, direction, distance, duration, fingerCount, fingerData) {
			  console.log("swippppeeee");
			if(direction=="left"){
				SwipeLeft();
			}else if(direction=="right"){
				SwipeRight();
			}else if(direction=="up"){
				SwipeUp();
			}else if(direction=="down"){
				SwipeDown();
			}
		}
	});
	
	
	function SwipeDown(){
		if(!scrolleable){
			var auxAttr= $(currentScreen).attr('down');
			if(auxAttr!=undefined){
				var animType= $(currentScreen).attr('animation-down');
				if(animType!=undefined){
					animationType=animType;
				}
				SetHash(auxAttr);
			}
		}else{
			if(parseFloat(getAndroidVersion())<4 &&!checkMac()){
				ScrollUp();
			}
		}
	}
	
	function SwipeUp(){
		if(!scrolleable){
			var auxAttr= $(currentScreen).attr('up');
			if(auxAttr!=undefined){
				var animType= $(currentScreen).attr('animation-up');
				if(animType!=undefined){
					animationType=animType;
				}
				SetHash(auxAttr);
			}
		}else{
			if(parseFloat(getAndroidVersion())<4 &&!checkMac()){
				ScrollDown();
			}
		}
	}
	
	function SwipeRight(){
		animationType="right";
		returning=true;
		if(currentScreen=="#article"){
			
			SetHash(lastScreen);
		}else{
			//SetHash("menu");
		}
		
		if(currentScreen=="#mainScreen"){
			if(currentSlide!=1){
				ChangeSlide(currentSlide-1);
			}
		}
	}
	
	function SwipeLeft(){
		returning=true;
		if(currentScreen=="#menu"){
			animationType="right2";
			if(historyArray.length>0){
				returning=true;
				var auxHash=historyArray.pop();
				if(auxHash=="splash"||auxHash=="#splash"){
					return;
				}
				if(currentScreen=="#menu"){
					animationType="left2";
				}
				
				SetHash(auxHash);
			}
		}else if(currentScreen=="#seccion"&&currentProductoId!=-1){
			console.log("back seccion to article");
			animationType="left2";
			
			SetHash("#article");
		}else if(currentScreen=="#configuracion"){
			animationType="left2";
			SetHash(previousScreen);
		}
		
		if(currentScreen=="#mainScreen"){
					if(currentSlide!=3){
						ChangeSlide(currentSlide+1);
					}
				}
	}

////////////////////////////////////////
////////////////////////////////////////
////////////////ANIMACIONES////////////////////

function AnimateDown(){
				
	
	$(previousScreen).css('position','absolute');
	
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');
	$(previousScreen).css('z-index','110');
	
	
	$(currentScreen).attr("style",'transform:initial;position:relative;z-index:100;');
	
	$(currentScreen).css('position','relative');
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('z-index','100');
	
	$(currentScreen).css('width',widthApp+'px');
	$(previousScreen).css('width',widthApp+'px');
	
	var bkColor=$(currentScreen).css("background-color");
	
	var auxHeight=heightApp+verticalAnimationOffset;
	
	CenterToParent();
	
	$(currentScreen).show();
	
	Resize();
	
	
	setTimeout(function(){
	$(previousScreen).transition({
		y: auxHeight+'px',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}

function AnimateDown2(){
	
	$(previousScreen).css('position','absolute');
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');
	
	$(currentScreen).css('position','relative');
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('z-index','100');
	
	$(currentScreen).css('width',widthApp+'px');
	$(previousScreen).css('width',widthApp+'px');
	
	var bkColor=$(currentScreen).css("background-color");
	
	var htmlPage=$(currentScreen).html();
	$(currentScreen).hide();
	
	var auxHeight=heightApp*-1+verticalAnimationOffset;
	
	htmlPage='<div align="center" class="pageMia" id="auxPage" style="background-color:'+bkColor+';width:'+widthApp+'px;transform:initial;position:absolute;z-index:150;top:'+auxHeight+'px;">'+htmlPage+'</div>';
	
	auxHeight=heightApp;
	
	$('#app').append(htmlPage);
	CenterToParent();
	
	$(previousScreen).show();
	
	Resize();
	
	setTimeout(function(){
	$('#auxPage').transition({
		y: auxHeight+'px',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}

function AnimateUp(){
				
	$(previousScreen).css('position','absolute');
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');
	
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('position','relative');
	$(currentScreen).css('z-index','100');
	
	$(previousScreen).css('right','0');
	$(previousScreen).css('top',auxHHEad+'px');
	$(currentScreen).css('right','0');
	$(currentScreen).css('top',auxHHEad+'px');
	
	$(currentScreen).css('width',widthApp+'px');
	$(previousScreen).css('width',widthApp+'px');
	
	var bkColor=$(currentScreen).css("background-color");
	
	var htmlPage=$(currentScreen).html();
	$(previousScreen).show();
	
	var auxHeight=heightApp+verticalAnimationOffset;
	
	htmlPage='<div align="center" class="pageMia" id="auxPage" style="background-color:'+bkColor+';width:'+widthApp+'px;transform:initial;position:absolute;z-index:150;top:'+auxHeight+'px;">'+htmlPage+'</div>';
	 
	auxHeight=heightApp;
	
	$('#app').append(htmlPage);
	CenterToParent();
	
	$(currentScreen).hide();
	
	Resize();
	
	setTimeout(function(){
	$('#auxPage').transition({
		y: '-'+auxHeight+'px',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}

function AnimateUp2(){
				
	$(previousScreen).css('position','absolute');
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');
	
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('position','relative');
	$(currentScreen).css('z-index','100');
	
	$(previousScreen).css('right','0');
	$(previousScreen).css('top',auxHHEad+'px');
	$(currentScreen).css('right','0');
	$(currentScreen).css('top',auxHHEad+'px');
	
	$(currentScreen).css('width',widthApp+'px');
	$(previousScreen).css('width',widthApp+'px');
	
	var bkColor=$(previousScreen).css("background-color");
	
	var htmlPage=$(previousScreen).html();
	
	
	var auxHeight=heightApp+verticalAnimationOffset;
	
	htmlPage='<div align="center" class="pageMia" id="auxPage" style="background-color:'+bkColor+';width:'+widthApp+'px;transform:initial;position:absolute;z-index:150;top:'+0+'px;overflow:hidden;">'+htmlPage+'</div>';
	 
	auxHeight=heightApp;
	
	$('#app').append(htmlPage);
	CenterToParent();
	
	$(previousScreen).hide();
	
	$(currentScreen).show();
	
	Resize();
	
	setTimeout(function(){
	$('#auxPage').transition({
		y: '-'+auxHeight+'px',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}


function AnimateLeft(){
	 
	$(previousScreen).css('position','absolute');
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');
	
	
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('position','relative');
	$(currentScreen).css('z-index','110');
	
	$(previousScreen).css('right','0');
	$(previousScreen).css('top',auxHHEad+'px');
	$(currentScreen).css('right','0');
	$(currentScreen).css('top',auxHHEad+'px');
	
	$(currentScreen).css('width',widthApp+'px');
	$(previousScreen).css('width',widthApp+'px');
	
	var bkColor=$(currentScreen).css("background-color");
	
	var htmlPage=$(currentScreen).html();
	$(previousScreen).show();
	
	var auxHeight=heightApp+verticalAnimationOffset;
	
	htmlPage='<div align="center" class="pageMia" id="auxPage" style="background-color:'+bkColor+';width:'+widthApp+'px;transform:initial;position:absolute;z-index:150;left:'+widthApp+'px;">'+htmlPage+'</div>';
	 
	auxHeight=heightApp;
	
	$('#app').append(htmlPage);
	CenterToParent();
	
	
	$(currentScreen).hide();
	
	Resize();
	
	setTimeout(function(){
	$('#auxPage').transition({
		x: '-'+widthApp+'px',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}


function AnimateRight(){
	
	$(previousScreen).css('transform','relative');
	$(previousScreen).css('position','absolute');
	
	$(previousScreen).css('transform-origin','center left');
	$(previousScreen).css('z-index','0');
	
	
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('position','absolute');
	$(currentScreen).css('z-index','100');
	$(currentScreen).css('transform-origin','center left');
	
	$(previousScreen).css('right','0');
	$(previousScreen).css('top',auxHHEad+'px');
	$(currentScreen).css('right','0');
	$(currentScreen).css('top',auxHHEad+'px');
	
	$(previousScreen).css('width',widthApp+'px');
	$(currentScreen).css('width',widthApp+'px');
	
	$(currentScreen).css('right',widthApp+'px');
	
	$(previousScreen).show();
	
	var auxHeight=heightApp+verticalAnimationOffset;
	
	auxHeight=heightApp;
	
	CenterToParent();
	$(currentScreen).show();
	
	Resize();
	
	setTimeout(function(){
	$(currentScreen).transition({
		x: widthApp+'px',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('background-image',"url('images/fondo.png')");
		$(currentScreen).css('background-position',"70% 80%");
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}

function AnimateRight2(){
	
	$(previousScreen).css('position','absolute');
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');
	
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('position','absolute');
	$(currentScreen).css('z-index','100');
	
	$(previousScreen).css('right','0');
	$(previousScreen).css('top',auxHHEad+'px');
	$(currentScreen).css('right','0');
	$(currentScreen).css('top',auxHHEad+'px');
	
	$(currentScreen).css('width',widthApp+'px');
	$(previousScreen).css('width',widthApp+'px');
	
	var bkColor=$(currentScreen).css("background-color");
	
	var htmlPage=$(previousScreen).html();
	
	var auxHeight=heightApp+verticalAnimationOffset;
	
	htmlPage='<div align="center" class="pageMia" id="auxPage" style="background-color:'+bkColor+';width:'+widthApp+'px;transform:initial;position:absolute;z-index:150;right:0px;top:'+auxHHEad+'px'+'">'+htmlPage+'</div>';
	 
	auxHeight=heightApp;
	
	$('#app').append(htmlPage);
	CenterToParent();
	
	$( "#auxPage" ).find( ".contenidoPage" ).scrollTop($(previousScreen).find(".contenidoPage").scrollTop());
	
	$(previousScreen).hide();
	$(currentScreen).show();
	
	Resize();
	
	setTimeout(function(){
	$('#auxPage').transition({
		x: widthApp+'px',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}

function AnimateLeft2(){
	
	$(previousScreen).css('position','absolute');
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');
	$(previousScreen).css('z-index','110');
	
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('position','absolute');
	$(currentScreen).css('z-index','100');
	
	$(previousScreen).css('right','0');
	$(previousScreen).css('top',auxHHEad+'px');
	$(currentScreen).css('right','0');
	$(currentScreen).css('top',auxHHEad+'px');
	
	$(currentScreen).css('width',widthApp+'px');
	$(previousScreen).css('width',widthApp+'px');
	
	var bkColor=$(currentScreen).css("background-color");
	
	var htmlPage=$(previousScreen).html();
	
	var auxHeight=heightApp+verticalAnimationOffset;
	
	htmlPage='<div align="center" class="pageMia" id="auxPage" style="background-color:'+bkColor+';width:'+widthApp+'px;transform:initial;position:absolute;z-index:150;right:0px;">'+htmlPage+'</div>';
	 
	auxHeight=heightApp;
	
	CenterToParent();
	
	$(previousScreen).show();
	$(currentScreen).show();
	
	Resize();
	
	setTimeout(function(){
	$(previousScreen).transition({
		x: -widthApp+'px',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}

function AnimateFade(){
	
	$(previousScreen).css('position','absolute');
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');
	$(previousScreen).css('z-index','110');
	$(previousScreen).css('opacity',1);
	
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('position','absolute');
	$(currentScreen).css('z-index','100');
	
	$(previousScreen).css('right','0');
	$(previousScreen).css('top',auxHHEad+'px');
	$(currentScreen).css('right','0');
	$(currentScreen).css('top',auxHHEad+'px');
	$(currentScreen).css('opacity',1);
	
	var bkColor=$(currentScreen).css("background-color");
	
	var auxHeight=heightApp+verticalAnimationOffset;
	
	auxHeight=heightApp;
	
	CenterToParent();
	
	$(previousScreen).show();
	$(currentScreen).show();
	
	Resize();
	setTimeout(function(){
	$(previousScreen).transition({
		opacity: 0,
		duration: transitionTimeOld,
		complete: function(){
		$('#auxPage').remove();
		$(currentScreen).css('transform','initial');
		$(currentScreen).css('position','initial');
		$(previousScreen).css('transform','initial');
		$(previousScreen).css('position','initial');
		
		isChanging=false;
		animationType=defaultAnimation;
		
		EndTransition();
		}
	});
	},100);
}

function AnimateFlipDown(){
	
	$(previousScreen).css('position','absolute');
	$(previousScreen).css('transform','initial');
	$(previousScreen).css('transform-origin','center left');

	$(currentScreen).css('position','relative');
	$(currentScreen).css('transform','initial');
	$(currentScreen).css('z-index','100');
	
	var bkColor=$(currentScreen).css("background-color");
	
	var htmlPage=$(previousScreen).html();
	var htmlPage2=$(currentScreen).html();
	
	var auxHeight=(heightApp-verticalAnimationOffset)/2;
	
	htmlPage='<div align="center" class="pageMia" id="auxPage" style="background-color:'+bkColor+';width:'+widthApp+'px;transform:initial;position:absolute;z-index:150;top:'+verticalAnimationOffset+'px;height:'+auxHeight+'px;transform-origin:center bottom;">'+htmlPage+'</div>';
	
	htmlPage2='<div align="center" class="pageMia" id="auxPage2" style="background-color:'+bkColor+';width:'+widthApp+'px;transform:initial;position:absolute;z-index:149;top:'+verticalAnimationOffset+'px;height:'+auxHeight+'px;overflow:hidden;transform-origin:center bottom; transform: rotateX(90deg);">'+htmlPage2+'</div>';
	
	$('#app').append(htmlPage);
	$('#app').append(htmlPage2);
	CenterToParent();
	
	$(previousScreen).show();
	$(currentScreen).hide();
	
	Resize();
	
	$('#auxPage').transition({
		rotateX:'90deg',
		duration: transitionTime,
		complete: function(){
		$('#auxPage').remove();
			$('#auxPage2').transition({
			rotateX:'180deg',
			duration: transitionTime,
			complete: function(){
				$(currentScreen).css('transform','initial');
				$(currentScreen).css('position','initial');
				$(previousScreen).css('transform','initial');
				$(previousScreen).css('position','initial');
				
				isChanging=false;
				animationType=defaultAnimation;
				
				EndTransition();
			} });
		}
	});
}


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var row1;
var row2;
var row3;
var row4;
var row5;
var row6;
var row7;
var row8;
var row9;
var row10;
var row11;
var row12;
var rowHalf;
//calculo de las clases rows, divide la pantalla en 12 filas a lo alto para asi poder alinear de forma mas sencilla el contenido. Ademas setea tmb un row-half para asi tener una unidad mas de separacion basada en este sistema
function SetRows(){
	
	var winHeight=$( window ).height();
	var baseHeight=winHeight/12;
	var rule = getStyleRule('.row-1');
	rule.height = baseHeight+"px";
	row1 = baseHeight+"px";
	rule = getStyleRule('.row-2');
	rule.height = baseHeight*2+"px";
	row2 = baseHeight*2+"px";
	
	rule = getStyleRule('.row-3');
	rule.height = baseHeight*3+"px";
	row3 = baseHeight*3+"px";
	
	rule = getStyleRule('.row-4');
	rule.height = baseHeight*4+"px";
	row4 = baseHeight*4+"px";
	rule = getStyleRule('.row-5');
	rule.height = baseHeight*5+"px";
	row5 = baseHeight*5+"px";
	rule = getStyleRule('.row-6');
	rule.height = baseHeight*6+"px";
	row6 = baseHeight*6+"px";
	rule = getStyleRule('.row-7');
	rule.height = baseHeight*7+"px";
	row7 = baseHeight*7+"px";
	rule = getStyleRule('.row-8');
	rule.height = baseHeight*8+"px";
	row8 = baseHeight*8+"px";
	rule = getStyleRule('.row-9');
	rule.height = baseHeight*9+"px";
	row9 = baseHeight*9+"px";
	rule = getStyleRule('.row-10');
	rule.height = baseHeight*10+"px";
	row10 = baseHeight*10+"px";
	rule = getStyleRule('.row-11');
	rule.height = baseHeight*11+"px";
	row11 = baseHeight*11+"px";
	rule = getStyleRule('.row-12');
	rule.height = baseHeight*12+"px";
	row12 = baseHeight*12+"px";
	rule = getStyleRule('.row-half');
	rule.height = baseHeight*0.5+"px";
	rowHalf = baseHeight*0.5+"px";
	
	$('.img-r').each(function(i){
		$(this).css('background-image','url('+$(this).attr("imagen")+')');
		$(this).css('background-position',$(this).attr("img-position"));
		$(this).css('background-size',$(this).attr("img-size"));
		$(this).css('background-repeat',$(this).attr("img-repeat"));
	});
	
}

//se llama al apretar el boton de scroll down o al hacer un swipe en los celulars de android infeiror a 4
function ScrollDown(){
	
	$(currentScreen+" .contenidoPage").animate({scrollTop:$(currentScreen+" .contenidoPage").scrollTop()+$(".pageMia").height()-100},'1000','swing',function(){
		$("#btn-scrollup").show();
		var auxScroll=$(currentScreen+" .contenidoPage").scrollTop();
		$(currentScreen+" .contenidoPage").scrollTop(auxScroll+100);
		var auxScroll2=$(currentScreen+" .contenidoPage").scrollTop();
		if(auxScroll==auxScroll2){
			$("#btn-scrolldown").hide();
		}else{
			$(currentScreen+" .contenidoPage").scrollTop(auxScroll);
			$("#btn-scrolldown").show();
		}
	} );
	
}

//se llama al apretar el boton de scroll up o al hacer un swipe en los celulars de android infeiror a 4
function ScrollUp(){
	
	$(currentScreen+" .contenidoPage").animate({scrollTop:$(currentScreen+" .contenidoPage").scrollTop()-$(".pageMia").height()-100},'1000','swing',function(){
		$("#btn-scrolldown").show();
		if($(currentScreen+" .contenidoPage").scrollTop()==0){
			$("#btn-scrollup").hide();
		}else{
			$("#btn-scrollup").show();
		}
	});
}
//obtiene la version de android del dispositivo
function getAndroidVersion(ua) {
	console.log(checkMac());
    ua = (ua || navigator.userAgent).toLowerCase(); 
    var match = ua.match(/android\s([0-9\.]*)/);
    return match ? match[1] : false;
};

//chequea si se ejecuta en una mac
function checkMac(ua){
	ua = (ua || navigator.userAgent).toLowerCase(); 
    var match = ua.match(/ipad/g);
    if( match){ return true;}
	match = ua.match(/iphone/g);
	return match ? true : false;
}

var androidVersion=parseFloat(getAndroidVersion());

//anima el header para que haga un fadein
function FadeInHeader(){
	 $( ".header" ).animate({
		opacity: 1
	  }, 300, function() {
		
	  });
}
//anima el header para que haga un fadeout
function FadeOutHeader(){
	$( ".header" ).animate({
		opacity: 0
	  }, 300, function() {
		
	  });
}

//setea la fuente a nivel rule, osea, a su más bajo nivel, para que asi afecte a todos los elementos agregados posterior al seteo.
function SetFontSize(sizeFont){
	/*$("#font"+currentFontSize).removeClass("font-selected");
	
	currentFontSize= sizeFont;
	$("#font"+currentFontSize).addClass("font-selected");
	localStorage.fontSize= sizeFont;
	var ruleP = getStyleRule('p');
	var ruleH5 = getStyleRule('h5');
	var ruleH3 = getStyleRule('h3');
	var ruleH2 = getStyleRule('h2');
	var ruleH4 = getStyleRule('h4');
	var twoLiner = getStyleRule('.twoLiner');
	var imageSeccion = getStyleRule('.image-titulo-seccion');
	if(currentFontSize=='medium'){
		ruleP['font-size']="14px";
		ruleP['line-height']="14px";
		ruleH5['font-size']="14px";
		ruleH5['line-height']="14px";
		ruleH3['font-size']="18px";
		ruleH3['line-height']="18px";
		ruleH2['font-size']="18px";
		ruleH2['line-height']="16px";
		ruleH2['margin']="0";
		ruleH2['padding-top']="5px";
		imageSeccion['height']="16px";
		
		ruleH4['font-size']="17px";
		twoLiner['font-size']="8px";
		ruleH4['line-height']="15px";
		ruleH4['padding-top']="5px";
	}else if(currentFontSize=='small'){
		ruleP['font-size']="9px";
		ruleP['line-height']="9px";
		ruleH5['font-size']="9px";
		ruleH5['line-height']="9px";
		ruleH3['font-size']="12px";
		ruleH3['line-height']="12px";
		ruleH2['font-size']="15px";
		ruleH2['line-height']="15px";
		ruleH2['padding-top']="5px";
		imageSeccion['height']="15px";
		
		ruleH2['margin']="0";
		ruleH4['font-size']="13px";
		twoLiner['font-size']="13px";
		ruleH4['line-height']="9px";
		ruleH4['padding-top']="5px";
	}else{
		ruleP['font-size']="24px";
		ruleP['line-height']="24px";
		ruleH5['font-size']="24px";
		ruleH5['line-height']="24px";
		ruleH3['font-size']="21px";
		ruleH3['line-height']="21px";
		ruleH2['font-size']="20px";
		ruleH2['line-height']="18px";
		ruleH2['margin']="0";
		ruleH2['padding-top']="5px";
		imageSeccion['height']="18px";
		
		ruleH4['font-size']="19px";
		twoLiner['font-size']="19px";
		ruleH4['line-height']="17px";
		ruleH4['padding-top']="5px";
	}*/
}