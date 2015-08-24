window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
        window.setTimeout(a, 1E3 / 60)
    }
}();

var Defender = (function(){ 
	var IE = "ActiveXObject" in window ;
	var gameCanvas , gameCtx ;
	var defenderList = [] ;
	var imageList = ["background","fighter","swordman","atkUp","monster_normal","invoke","choose_soldier","choose_soldier_back","description","close","reset","confirm"] ;
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
	var monsterIdList = ['monster_normal'];
	var roleDescriptionList = ['fighter','swordman','archer','magician'] ;
	var soldierMap = {} ; 
	var monsterMap = {} ;
	var monsterList = [] ;

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
		initSoldierMap : function(){
			var fighter = common.createSoldier(0,10,60,150,1,10,100) ;
			soldierMap['fighter'] = fighter ;

			var swordman = common.createSoldier(1,30,75,170,1,20,1000) ;
			var effect = common.createEffect(0,0,1,10,2) ;
			var atkUp = common.createSkill("atkUp","add atk.",1,[],0,effect) ;
			swordman.skill.push(atkUp);
			soldierMap['swordman'] = swordman ;
		},
		initMonsterMap : function(){
			var normal = common.createMonster(0,0,330,100,100,3,1);
			monsterMap['normal'] = normal ;
		},
		createMonsterSkill : function(){

		},
		createMonster : function(id,x,y,nowHp,maxHp,def,speed,skill,effect){
			var monster = {
				id : id || 0 ,
				x : x || 0 ,
				y : y || 0 ,
				nowHp : nowHp || 0 ,
				maxHp : maxHp || 0 ,
				def : def || 0 ,
				speed : speed || 0 ,	//per 20ms 
				skill : skill || [] ,
				effect : effect || [] ,
				move : function(){
					this.x += this.speed ;
				},
				showMonster : function(){
					gameCtx.drawImage(canvasMap[common.getMonster(monster.id)],this.x,this.y) ;
				},
				showHp : function(){
					gameCtx.font="30px Arial";
					gameCtx.fillText(this.nowHp+ '/' + this.maxHp ,this.x,this.y-10) ;
				},
				showAll : function(){
					this.showMonster();
					this.showHp();
				}
			};
			return monster
		},
		createSoldier : function(id,atk,speed,range,level,transferLevel,goalExp,isPicked){
			var soldier = {
				id : id || 0 , // role type
				atk : atk || 0 ,
				speed : speed || 0 ,  // 1 attack need sec
				range : range || 0 ,
				level : level || 1 ,
				transferLevel : transferLevel || 99999 ,
				nowExp : 0 ,
				goalExp : goalExp || 100 ,
				isPicked : isPicked || false ,
				point : 0 ,	// remain skill point
				skill : [] ,
				atkTimer : speed , 
				attack : function(x){
					if ( this.atkTimer >= 0 ){
						this.atkTimer -- ; 
						return ;
					} 
					this.atkTimer = this.speed ;
					for ( var i = 0 ; i < monsterList.length ; i ++ ){
						if ( Math.abs(monsterList[i].x-x) <= this.range ){
							monsterList[i].nowHp -= this.atk ;
							return ;
						}
					}
				}
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
		getRole : function(index){
			return roleList[index] ;
		},
		getMonster : function(index){
			return monsterIdList[index] ;
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
			common.initMonsterMap();
			common.initMySoldierList();
			//
			loadPage.init();
			//
			common.repaint();
		},
		repaint : function(){
			try {
				if ( nowPage === 'loadPage' ){
					loadPage.showAll();
				}
				else if ( nowPage === 'preStage' ){
					preStage.showAll();
				} else if ( nowPage.match('stage') !== null ){
					stage[nowStage].showAll();
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
			if ( loadImageProgress === imageList.length ){
				nowPage = 'preStage' ;
				preStage.init();
			}
		}
	}

	var preStage = {
		invokeList : [] ,
		isShowChooseSoldier : false ,
		isInitInvoke : false ,
		nowPickInvoke : null ,
		background : {} ,
		resetButton : {} ,
		confirmButton : {} ,
		init : function(){
			preStage.isShowChooseSoldier = false ;
			preStage.initBackground();
			preStage.initResetButton();
			preStage.initConfirmButton();
			preStage.initInvoke();
		},
		initBackground : function(){
			background = { x:0 , y:0 , w: canvasMap['background'].width , h: canvasMap['background'].height} ;
		},
		initResetButton : function(){
			preStage.resetButton = { x : 500 , y : 100 , w : canvasMap['reset'].width , h : canvasMap['reset'].height } ;
		},
		initConfirmButton : function(){
			preStage.confirmButton = { x : 200 , y : 100 , w : canvasMap['confirm'].width , h : canvasMap['confirm'].height } ;
		},
		initInvoke : function(){
			if ( preStage.isInitInvoke === true )
				return ;
			preStage.invokeList = [] ;
			for ( var i = 0 ; i < 12 ; i ++ ){
				preStage.invokeList.push({x:i*100+100,y:roadTopY,w:canvasMap['invoke'].width,h:canvasMap['invoke'].height,soldier:{id:-1}});
				preStage.invokeList.push({x:i*100+100,y:roadBottomY,w:canvasMap['invoke'].width,h:canvasMap['invoke'].height,soldier:{id:-1}});
			}
			preStage.isInitInvoke = true ;
		},
		toStage : function(){
			stage[nowStage].init();
			nowPage = nowStage ;
		},
		setMouseEnterInvokeOver: function(index){
			document.body.style.cursor = "pointer" ;
			mouseOver = 'invoke' + index ;
		},
		setMouseEnterInvokeClick :function(index){
			preStage.pickSoldier.init();
			preStage.nowPickInvoke = index ;
			document.body.style.cursor = "default" ;
		},
		setMouseEnterResetButtonOver: function(){
			document.body.style.cursor = "pointer" ;
			mouseOver = 'resetButton' ;
		},
		setMouseEnterConfirmButtonOver: function(){
			document.body.style.cursor = "pointer" ;
			mouseOver = 'confirmButton' ;
		},
		setMouseEnterConfirmButtonClick: function(){
			document.body.style.cursor = "default" ;
			mouseOver = 'confirmButton' ;
			preStage.toStage();
		},
		setMouseEnterResetButtonClick: function(){
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				mySoldierList[i].isPicked = false ;
			} 
			preStage.isInitInvoke = false ;
			preStage.init();
		},
		setMouseEnterSoldierOver: function(index){
			document.body.style.cursor = "pointer" ;
			mouseOver = 'soldier' + index ;
		},
		detectMouseEnterOver: function(temp,offsetX,offsetY,ratio){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.invokeList[i].soldier.id === -1 &&
					common.isMouseEnterRange(temp,preStage.invokeList[i].x,preStage.invokeList[i].y,preStage.invokeList[i].w,preStage.invokeList[i].h,offsetX,offsetY,ratio) ){
					preStage.setMouseEnterInvokeOver(i) ;
					return ;
				} else if (preStage.invokeList[i].soldier.id !== -1 &&
					common.isMouseEnterRange(temp,preStage.invokeList[i].x,preStage.invokeList[i].y,preStage.invokeList[i].w,preStage.invokeList[i].h,offsetX,offsetY,ratio) ) {
					preStage.setMouseEnterSoldierOver(i) ;
					return ;
				}
			}
			if ( common.isMouseEnterRange(temp,preStage.resetButton.x,preStage.resetButton.y,preStage.resetButton.w,preStage.resetButton.h,offsetX,offsetY,ratio) ){
				preStage.setMouseEnterResetButtonOver() ;
				return ;
			} else if ( common.isMouseEnterRange(temp,preStage.confirmButton.x,preStage.confirmButton.y,preStage.confirmButton.w,preStage.confirmButton.h,offsetX,offsetY,ratio) ){
				preStage.setMouseEnterConfirmButtonOver() ;
				return ;
			}
			common.setMouseEnterNone();
		},
		detectMouseEnterClick: function(temp,offsetX,offsetY,ratio){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.invokeList[i].soldier.id === -1 &&
					common.isMouseEnterRange(temp,preStage.invokeList[i].x,preStage.invokeList[i].y,preStage.invokeList[i].w,preStage.invokeList[i].h,offsetX,offsetY,ratio) ){
					preStage.setMouseEnterInvokeClick(i) ;
					return ;
				}
			}
			if ( common.isMouseEnterRange(temp,preStage.resetButton.x,preStage.resetButton.y,preStage.resetButton.w,preStage.resetButton.h,offsetX,offsetY,ratio) ){
				preStage.setMouseEnterResetButtonClick() ;
				return ;
			} else if ( common.isMouseEnterRange(temp,preStage.confirmButton.x,preStage.confirmButton.y,preStage.confirmButton.w,preStage.confirmButton.h,offsetX,offsetY,ratio) ){
				preStage.setMouseEnterConfirmButtonClick() ;
				return ;
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
		showInvoke :function(){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.invokeList[i].soldier.id === -1 ){
					gameCtx.drawImage(canvasMap['invoke'],preStage.invokeList[i].x,preStage.invokeList[i].y);
				} else {
					gameCtx.drawImage(canvasMap[common.getRole(preStage.invokeList[i].soldier.id)],preStage.invokeList[i].x,preStage.invokeList[i].y);
				}
			}
		},
		showBackground : function(){
			gameCtx.drawImage(canvasMap['background'],background.x,background.y);
		},
		showResetButton : function(){
			gameCtx.drawImage(canvasMap['reset'],preStage.resetButton.x,preStage.resetButton.y);
		},
		showConfirmButton : function(){
			gameCtx.drawImage(canvasMap['confirm'],preStage.confirmButton.x,preStage.confirmButton.y);
		},
		showSoldierRange : function(){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( mouseOver === 'soldier' + i ){
					gameCtx.fillStyle="#2894FF";
					gameCtx.globalAlpha = 0.5;
					gameCtx.beginPath();
					gameCtx.arc(preStage.invokeList[i].x+canvasMap[common.getRole(preStage.invokeList[i].soldier.id)].width/2
						,preStage.invokeList[i].y+canvasMap[common.getRole(preStage.invokeList[i].soldier.id)].height/2,
						preStage.invokeList[i].soldier.range,
						0,Math.PI*2,true);
					gameCtx.closePath();
					gameCtx.fill();
					gameCtx.fillStyle="#000000";
					gameCtx.globalAlpha = 1;
					return ;
				}
			}
		},
		showAll : function(){
			document.onmousemove = preStage.mouseOver ;
			document.onclick = preStage.mouseClick ;
			preStage.showBackground();
			preStage.showDescription();
			preStage.showResetButton();
			preStage.showConfirmButton();
			preStage.showInvoke();
			if ( preStage.isShowChooseSoldier === true )
				preStage.pickSoldier.showAll() ;
			preStage.showSoldierRange();
		},
		showDescription : function(){
			gameCtx.drawImage(canvasMap['description'],0,600);
		},
		pickSoldier : {
			pickSoldierList : [] ,
			closeButton : { } ,
			init : function(){
				preStage.isShowChooseSoldier = true ;
				preStage.pickSoldier.pickSoldierList = [] ;
				preStage.pickSoldier.initSoldierList();
				preStage.pickSoldier.initCloseButton();
			} ,
			initSoldierList : function(){
				for ( var i = 0 , j = 0; i < mySoldierList.length ; i ++ ){
					if ( mySoldierList[i].isPicked === false ){
						var x = j*200+500 , y = 250 ;
						preStage.pickSoldier.pickSoldierList.push({x:x,y:y,w:canvasMap['choose_soldier_back'].width,h:canvasMap['choose_soldier_back'].height,soldierIndex:i});
						j ++ ;
					}
				}
			} , 
			initCloseButton : function(){
				preStage.pickSoldier.closeButton = { x : 100 , y : 100 , w : canvasMap['close'].width , h : canvasMap['close'].height } ;
			},
			setMouseEnterPickSoldierOver : function(index){
				document.body.style.cursor = "pointer" ;
				mouseOver = "pickSoldier" + index ;
			},
			setInvokeToSoldier : function(index){
				preStage.invokeList[preStage.nowPickInvoke].soldier = mySoldierList[index] ;
				preStage.invokeList[preStage.nowPickInvoke].w = canvasMap[common.getRole(mySoldierList[index].id)].width;
				preStage.invokeList[preStage.nowPickInvoke].h = canvasMap[common.getRole(mySoldierList[index].id)].height;
				mySoldierList[index].isPicked = true ;
				preStage.init();
			},
			setMouseEnterPickSoldierClick : function(index){
				document.body.style.cursor = "pointer" ;
				preStage.pickSoldier.setInvokeToSoldier(index);
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
						preStage.pickSoldier.setMouseEnterPickSoldierClick(preStage.pickSoldier.pickSoldierList[i].soldierIndex) ;
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
						preStage.pickSoldier.setMouseEnterPickSoldierOver(preStage.pickSoldier.pickSoldierList[i].soldierIndex) ;
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
				var x = preStage.pickSoldier.pickSoldierList[index].x ;
				var y = preStage.pickSoldier.pickSoldierList[index].y ;
				gameCtx.drawImage(canvasMap['choose_soldier_back'],x,y) ;
			},
			showMySoldierInfo: function(pickIndex,soldierIndex){
				var role = common.getRole(mySoldierList[soldierIndex].id) ;
				var x = preStage.pickSoldier.pickSoldierList[pickIndex].x ;
				var y = preStage.pickSoldier.pickSoldierList[pickIndex].y ;
				gameCtx.font="30px Arial";
				gameCtx.drawImage(canvasMap[role],x,150);
				gameCtx.fillText("Level : "+mySoldierList[soldierIndex].level,x,250) ;
				gameCtx.fillText("Dmage : "+mySoldierList[soldierIndex].atk,x,300) ;
				gameCtx.fillText("Speed : "+mySoldierList[soldierIndex].speed,x,350) ;
				gameCtx.fillText("Range : "+mySoldierList[soldierIndex].range,x,400) ;
				gameCtx.fillText("Exp : "+mySoldierList[soldierIndex].nowExp+ " / "+mySoldierList[soldierIndex].goalExp,x,450) ;
				gameCtx.fillText("Point : "+mySoldierList[soldierIndex].point,x,500) ;
				for ( var i = 0 ; i < mySoldierList[soldierIndex].skill.length ; i ++ ){
					var skill = mySoldierList[soldierIndex].skill[i] ;
					gameCtx.drawImage(canvasMap[skill.name],x,550+i*100) ;
					gameCtx.fillText("Skill Level : "+skill.nowLevel,x,600+i*100) ;
				}
			},
			showMySoldierList :function(){
				for ( var i = 0 , j = 0 ; i < mySoldierList.length ; i ++ ){
					if ( mySoldierList[i].isPicked === false ){
						preStage.pickSoldier.showMySoldierBack(j) ;
						preStage.pickSoldier.showMySoldierInfo(j,i) ;
						j ++ ;
					}
				}
			},
			showAll: function(){
				document.onmousemove = preStage.pickSoldier.mouseOver ;
				document.onclick = preStage.pickSoldier.mouseClick ;
				gameCtx.drawImage(canvasMap['choose_soldier'],canvasWidth/2-canvasMap['choose_soldier'].width/2,canvasHeight/2-canvasMap['choose_soldier'].height/2);
				preStage.pickSoldier.showMySoldierList();
				for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
					if ( mouseOver === 'pickSoldier' + i ) {
						gameCtx.fillText(roleDescriptionList[i],100,700,500,500);
						break ; 
					}
				}
				preStage.pickSoldier.showCloseButton();
			}
		}
	};

	var stage = {
		isShowChooseSoldier : false ,
		isInitInvoke : false ,
		nowPickInvoke : null ,
		background : {} ,
		monsterAllList : [] ,
		addMonster : function(){
			if( stage.addMonsterTimer > 0){
				stage.addMonsterTimer -- ;
				return ; 
			} else if ( stage.monsterAllList.length !== 0 ) {
				monsterList.push(stage.monsterAllList.shift());
				stage.addMonsterTimer = 200 ;
			} else {
				return ;
			}
		},
		showMonster : function(){
			for ( var i = 0 ; i < monsterList.length ; i ++ ){
				if ( monsterList[i].nowHp <= 0 ){
					monsterList.splice(i,1) ;
					i -- ;
				} else {
					monsterList[i].move();
					monsterList[i].showAll();
				}
			}
		},
		soldierEvent : function(){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.invokeList[i].soldier.id !== -1 ){
					preStage.invokeList[i].soldier.attack(preStage.invokeList[i].x);
				}
			}
		},
		stage1 : {
			initMonsterList : function(){
				for ( var i = 0 ; i < 10 ; i ++ ){
					var normal = common.clone(monsterMap['normal']);
					stage.monsterAllList.push(normal);
				}
			},
			init : function(){
				stage.stage1.initMonsterList();
			},
			showAll : function(){
				document.onmousemove = preStage.mouseOver ;
				document.onclick = preStage.mouseClick ;
				stage.addMonster();
				preStage.showBackground();
				preStage.showDescription();
				preStage.showInvoke();
				stage.showMonster();
				preStage.showSoldierRange();
				stage.soldierEvent();
			}
		}
	}

	window.onload = common.init();
})();
