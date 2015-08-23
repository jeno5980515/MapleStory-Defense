window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
        window.setTimeout(a, 1E3 / 60)
    }
}();


var Defender = (function(){ 
	var IE = "ActiveXObject" in window ;
	var gameCanvas , gameCtx ;
	var defenderList = [] ;
	var imageList = ["background","fighter","swordman","atkUp","monster_normal","invoke","choose_soldier","choose_soldier_back","description","close",
	"background","fighter","swordman","atkUp","monster_normal","invoke","choose_soldier","choose_soldier_back","description","close",
	"background","fighter","swordman","atkUp","monster_normal","invoke","choose_soldier","choose_soldier_back","description","close",
	"background","fighter","swordman","atkUp","monster_normal","invoke","choose_soldier","choose_soldier_back","description","close",
	"background","fighter","swordman","atkUp","monster_normal","invoke","choose_soldier","choose_soldier_back","description","close"] ;
	var loadImageProgress = 0 ;
	var imgMap = {} ;
	var canvasMap = {} ;
	var canvasWidth = 1350 , canvasHeight = 780 ;
	var roadBottomY = 450 ;
	var roadTopY = 250 ;
	var nowPage = 'loadPage' ; 
	var nowStage = 'stage1' ;
	var mySoldierList = [] ;
	var mouseOver = 'none' ;
	var nowChooseSoldier ;
	var roleList = ['fighter','swordman','archer','magician'] ;
	var roleDescriptionList = ['fighter','swordman','archer','magician'] ;
	var soldierMap = {} ; 

	var common = {
		clone : function(obj) {
		    if ( null === obj || "object" !== typeof obj ) 
		    	return obj;
		    if (obj instanceof Date) {
		        var copy = new Date();
		        copy.setTime(obj.getTime());
		        return copy;
		    }
		    if (obj instanceof Array) {
		        var copy = [];
		        for ( var i = 0, len = obj.length; i < len; ++i) {
		            copy[i] = common.clone(obj[i]);
		        }
		        return copy;
		    }
		    if (obj instanceof Object) {
		        var copy = {};
		        for (var attr in obj) {
		            if (obj.hasOwnProperty(attr)) copy[attr] = common.clone(obj[attr]);
		        }
		        return copy;
		    }
		},
		createSoldier : function(id,atk,speed,range,level,transferLevel,goalExp){
			var soldier = {
				id : id || 0 , // role type
				atk : atk || 0 ,
				speed : speed || 0 ,  // 1 attack need sec
				range : range || 0 ,
				level : level || 1 ,
				transferLevel : transferLevel || 99999 ,
				nowExp : 0 ,
				goalExp : goalExp || 100 ,
				point : 0 ,	// remain skill point
				skill : []  
			};
			return soldier ;
		},
		createEffect : function(type,target,valueType,value,plus){
			var effect = {
				type : type || 0 ,
				target : target || 0 ,
				valueType : valueType || 0 ,
				value : value || 0 ,
				plus : plus || 0 
			}
			return effect ;
		},
		createSkill : function(name,description,needLevel,needSkill,nowLevel,effect){
			var skill = {
				name : name || "" ,
				description : description || "" ,
				needLevel : needLevel || 1 ,
				needSkill : needSkill || [] ,
				nowLevel : nowLevel || 0 ,
				effect : effect || [] 
			}
			return skill ;
		},
		initSoldierMap : function(){
			var fighter = common.createSoldier(0,10,60,100,1,10,100) ;
			soldierMap['fighter'] = fighter ;

			var swordman = common.createSoldier(1,30,75,100,1,20,1000) ;
			var effect = common.createEffect(0,0,1,10,2) ;
			var atkUp = common.createSkill("atkUp","add atk.",1,[],0,effect) ;
			swordman.skill.push(atkUp);
			soldierMap['swordman'] = swordman ;
		},
		getRole : function(index){
			return roleList[index] ;
		},
		getSizeInfo : function(e){
			var temp = common.getMouseSite(e);
			var tempX = temp.x , tempY = temp.y ;
			var offsetX = SlEEPBAG.canvasAutoResizer.getGameArea().parentNode.clientWidth ;
			var offsetY = SlEEPBAG.canvasAutoResizer.getGameArea().parentNode.clientHeight ;
			var ratio = common.getRatio(offsetX,offsetY);
			var w = ratio.w , h = ratio.h ;
			return { 'temp' : temp , 'tempX': tempX , 'tempY' : tempY , 'offsetX' : offsetX , 'offsetY' : offsetY , 'ratio' : ratio , 'w' : w , 'h' : h} ;
		},
		setMouseEvent : function(over,click){
			document.onclick = click ;
			document.onmousemove = over ;
			document.ontouchend = click ;
		} ,
		setMouseEnterNone : function(){
			document.body.style.cursor = "default" ;
			mouseOver = 'none' ;
		},
		isMouseEnterRange : function(temp,x,y,sizeX,sizeY,offsetX,offsetY,ratio){
			var tempX = temp.x , tempY = temp.y ;
			var w = ratio.w , h = ratio.h ;
			if ( Math.abs( (tempX - (x + sizeX / 2) * w / canvasWidth  ) - ((offsetX - w) / 2) )  <=  sizeX / 2 * w / canvasWidth &&
				 Math.abs( (tempY - (y + sizeY / 2 ) * h / canvasHeight + 12 ) - ((offsetY - h ) / 2) )  <=  sizeY / 2 * h / canvasHeight   ) {
				return true ;
			} 
			return false ;
		},
		getMouseSite : function(e){
			var tempX , tempY ;
			if (IE) { 
				tempX = event.clientX + document.body.scrollLeft ;
				tempY = event.clientY + document.body.scrollTop;
			} else {  
				tempX = e.pageX ;
				tempY = e.pageY ;
			}   
			return {x:tempX,y:tempY} ;
		},
		getRatio : function(offsetX,offsetY){
			var ratio = canvasWidth / canvasHeight	;
			var ratio2 = offsetX / offsetY ;
			var w , h ;
			if ( ratio > ratio2 ){
				h = offsetX / ratio ;
				w = offsetX ;
			} else {
				w = offsetY * ratio ;
				h = offsetY ;
			}
			return {w:w,h:h} ;
		},
		makeAllImage : function(){
			for ( var i = 0 ; i < imageList.length ; i ++ ){
				var img = new Image();
				img.src = "img/" + imageList[i] + ".png" ;
				imgMap[imageList[i]] = img ;
				common.makeCache(i,img) ;
			}
		},
		makeCache : function(index,img){
			img.onload = function(){
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				canvas.width = img.width ;
				canvas.height = img.height ;
				ctx.drawImage(img,0,0,img.width,img.height) ;
				canvasMap[imageList[index]] = canvas ;
				loadImageProgress ++ ;
			}
		},
		initMySoldierList : function(){
			mySoldierList.push(common.clone(soldierMap['fighter']));
			mySoldierList.push(common.clone(soldierMap['swordman']));
		},
		init: function(){
			SlEEPBAG.canvasAutoResizer.load(function(self){
				self.canvasWidth = canvasWidth;
				self.canvasHeight = canvasHeight;
				var gameArea = self.getGameArea();
				document.body.appendChild(gameArea); 
			});
			gameCanvas = SlEEPBAG.canvasAutoResizer.getGameCanvas();
			gameCtx = gameCanvas.getContext("2d");
			SlEEPBAG.canvasAutoResizer.setCenter();
			common.makeAllImage();
			common.initSoldierMap();
			common.initMySoldierList();
			//
			loadPage.init();
			//
			common.repaint();
		},
		repaint : function(){
			if ( loadImageProgress < imageList.length )
				console.log(1);
			try {
				if ( nowPage === 'loadPage' ){
					loadPage.showAll();
				}
				else if ( nowPage === 'preStage' ){
					preStage.showAll();
				} 
			} catch ( e ){

			} 
			requestAnimationFrame(common.repaint);
		}
	};
	var loadPage = {
		background : {} ,
		init : function(){
			loadPage.initBackground();
		},
		initBackground : function(){
			var img = new Image();
			img.src = "img/background.png" ;
			img.onload = function(){	
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');
				canvas.width = img.width ;
				canvas.height = img.height ;
				ctx.drawImage(img,0,0,img.width,img.height) ;
				canvasMap['background'] = canvas ; 
				background = { x:0 , y :0 , w: canvas.width , h : canvas.height} ; 
			}
		},
		showBackground : function(){
			try{
				gameCtx.drawImage(canvasMap['background'],0,0) ;
			}catch(e){
				;
			}
		},
		showProgress : function(){
			gameCtx.font="50px Arial";
			gameCtx.fillText(loadImageProgress+ ' / ' +imageList.length,300,300) ;
		},
		showAll : function(){
			loadPage.showBackground();
			loadPage.showProgress();
		}
	}

	var preStage = {
		invokeList : [] ,
		isShowChooseSoldier : false ,
		background : {} ,
		init : function(){
			preStage.initBackground();
		},
		initBackground : function(){
			background = { x:0 , y:0 , w: canvasMap['background'].width , h: canvasMap['background'].height} ;
		},
		setMouseEnterInvokeOver: function(index){
			document.body.style.cursor = "pointer" ;
			mouseOver = 'invoke' + index ;
		},
		setMouseEnterInvokeClick :function(index){
			preStage.pickSoldier.init();
			document.body.style.cursor = "default" ;
		},
		detectMouseEnterOver: function(temp,offsetX,offsetY,ratio){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( common.isMouseEnterRange(temp,preStage.invokeList[i].x,preStage.invokeList[i].y,preStage.invokeList[i].w,preStage.invokeList[i].h,offsetX,offsetY,ratio) ){
					preStage.setMouseEnterInvokeOver(i) ;
					return ;
				}
			}
			common.setMouseEnterNone();
		},
		detectMouseEnterClick: function(temp,offsetX,offsetY,ratio){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( common.isMouseEnterRange(temp,preStage.invokeList[i].x,preStage.invokeList[i].y,preStage.invokeList[i].w,preStage.invokeList[i].h,offsetX,offsetY,ratio) ){
					preStage.setMouseEnterInvokeClick(i) ;
					return ;
				}
			}
			common.setMouseEnterNone();
		},
		mouseOver :function(e){
			var info = common.getSizeInfo(e) 
			preStage.detectMouseEnterOver(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		mouseClick: function(e){
			var info = common.getSizeInfo(e) 
			preStage.detectMouseEnterClick(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		setInvoke :function(){
			for ( var i = 1 ; i < 13 ; i ++ ){
				gameCtx.drawImage(canvasMap['invoke'],i*100,roadTopY);
				preStage.invokeList.push({x:i*100,y:roadTopY,w:canvasMap['invoke'].width,h:canvasMap['invoke'].height});
				gameCtx.drawImage(canvasMap['invoke'],i*100,roadBottomY);
				preStage.invokeList.push({x:i*100,y:roadBottomY,w:canvasMap['invoke'].width,h:canvasMap['invoke'].height});
			}
		},
		showBackground : function(){
			gameCtx.drawImage(canvasMap['background'],background.x,background.y);
		},
		showAll : function(){
			document.onmousemove = preStage.mouseOver ;
			document.onclick = preStage.mouseClick ;
			preStage.showBackground();
			preStage.showDescription();
			preStage.setInvoke();
			if ( preStage.isShowChooseSoldier === true )
				preStage.pickSoldier.showAll() ;
		},
		showDescription : function(){
			gameCtx.drawImage(canvasMap['description'],0,600);
		},
		pickSoldier : {
			pickSoldierList : [] ,
			closeButton : { } ,
			init : function(){
				preStage.isShowChooseSoldier = true ;
				preStage.pickSoldier.initSoldierList();
				preStage.pickSoldier.initCloseButton();
			} ,
			initSoldierList : function(){
				for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
					var x = i*200+500 , y = 250 ;
					preStage.pickSoldier.pickSoldierList.push({x:x,y:y,w:canvasMap['choose_soldier_back'].width,h:canvasMap['choose_soldier_back'].height});
				}
			} , 
			initCloseButton : function(){
				preStage.pickSoldier.closeButton = { x : 100 , y : 100 , w : canvasMap['close'].width , h : canvasMap['close'].height } ;
			},
			setMouseEnterPickSoldierOver : function(index){
				document.body.style.cursor = "pointer" ;
				mouseOver = "pickSoldier" + index ;
			},
			setMouseEnterCloseButtonOver : function(index){
				document.body.style.cursor = "pointer" ;
				mouseOver = "closeButton" ;
			},
			setMouseEnterCloseButtonClick : function(index){
				document.body.style.cursor = "pointer" ;
				preStage.isShowChooseSoldier = false ;
			},
			detectMouseEnterClick : function(temp,offsetX,offsetY,ratio){
				for ( var i = 0 ; i < preStage.pickSoldier.pickSoldierList.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,preStage.pickSoldier.pickSoldierList[i].x,preStage.pickSoldier.pickSoldierList[i].y,preStage.pickSoldier.pickSoldierList[i].w,preStage.pickSoldier.pickSoldierList[i].h,offsetX,offsetY,ratio) ){
						preStage.pickSoldier.setMouseEnterPickSoldierClick(i) ;
						return ;
					}
				}
				if ( common.isMouseEnterRange(temp,preStage.pickSoldier.closeButton.x,preStage.pickSoldier.closeButton.y,preStage.pickSoldier.closeButton.w,preStage.pickSoldier.closeButton.h,offsetX,offsetY,ratio) ){
					preStage.pickSoldier.setMouseEnterCloseButtonClick(i) ;
					return ;
				}
				common.setMouseEnterNone();
			},
			detectMouseEnterOver : function(temp,offsetX,offsetY,ratio){
				for ( var i = 0 ; i < preStage.pickSoldier.pickSoldierList.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,preStage.pickSoldier.pickSoldierList[i].x,preStage.pickSoldier.pickSoldierList[i].y,preStage.pickSoldier.pickSoldierList[i].w,preStage.pickSoldier.pickSoldierList[i].h,offsetX,offsetY,ratio) ){
						preStage.pickSoldier.setMouseEnterPickSoldierOver(i) ;
						return ;
					}
				}
				if ( common.isMouseEnterRange(temp,preStage.pickSoldier.closeButton.x,preStage.pickSoldier.closeButton.y,preStage.pickSoldier.closeButton.w,preStage.pickSoldier.closeButton.h,offsetX,offsetY,ratio) ){
					preStage.pickSoldier.setMouseEnterCloseButtonOver(i) ;
					return ;
				}
				common.setMouseEnterNone();
			},
			mouseOver : function(e){
				var info = common.getSizeInfo(e) ;
				preStage.pickSoldier.detectMouseEnterOver(info.temp,info.offsetX,info.offsetY,info.ratio);
			},
			mouseClick : function(e){
				var info = common.getSizeInfo(e) ;
				preStage.pickSoldier.detectMouseEnterClick(info.temp,info.offsetX,info.offsetY,info.ratio);
			},
			showCloseButton : function(){
				gameCtx.drawImage(canvasMap['close'],preStage.pickSoldier.closeButton.x,preStage.pickSoldier.closeButton.y);
			},
			showMySoldierBack :function(index){
				var x = index*200+500 , y = 250 ;
				gameCtx.drawImage(canvasMap['choose_soldier_back'],x,y) ;
			},
			showMySoldierInfo: function(index){
				var role = common.getRole(mySoldierList[index].id) ;
				gameCtx.font="30px Arial";
				gameCtx.drawImage(canvasMap[role],index*200+500,150);
				gameCtx.fillText("Level : "+mySoldierList[index].level,index*200+500,250) ;
				gameCtx.fillText("NowExp : "+mySoldierList[index].nowExp,index*200+500,300) ;
				gameCtx.fillText("GoalExp : "+mySoldierList[index].goalExp,index*200+500,350) ;
				gameCtx.fillText("Point : "+mySoldierList[index].point,index*200+500,400) ;
				for ( var i = 0 ; i < mySoldierList[index].skill.length ; i ++ ){
					var skill = mySoldierList[index].skill[i] ;
					gameCtx.drawImage(canvasMap[skill.name],index*200+500,500+i*100) ;
					gameCtx.fillText("Skill Level : "+skill.nowLevel,index*200+500,550+i*100) ;
				}
			},
			showMySoldierList :function(){
				for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
					preStage.pickSoldier.showMySoldierBack(i) ;
					preStage.pickSoldier.showMySoldierInfo(i) ;
				}
			},
			showAll: function(){
				document.onmousemove = preStage.pickSoldier.mouseOver ;
				document.onclick = preStage.pickSoldier.mouseClick ;
				gameCtx.drawImage(canvasMap['choose_soldier'],canvasWidth/2-canvasMap['choose_soldier'].width/2,canvasHeight/2-canvasMap['choose_soldier'].height/2);
				preStage.pickSoldier.showMySoldierList();
				for ( var i = 0 ; i < preStage.pickSoldier.pickSoldierList.length ; i ++ ){
					if ( mouseOver === 'pickSoldier' + i ) {
						gameCtx.fillText(roleDescriptionList[i],100,700,500,500);
						break ; 
					}
				}
				preStage.pickSoldier.showCloseButton();
			}
		}
	};

	window.onload = common.init();
})();
