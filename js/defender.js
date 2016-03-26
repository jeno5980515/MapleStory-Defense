window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
        window.setTimeout(a, 1E3 / 60)
    }
}();

var Defender = (function(){ 
	var IE = "ActiveXObject" in window ;
	var gameCanvas , gameCtx ;
	var defenderList = [] ;
	var imageList = ["background","beginner_stand","atkUp","snail_move","invoke","choose_soldier","choose_soldier_back","description","close","reset","confirm","beginner_hit","beginner_attack","beginner_attack_effect","snail_hit","number_damage","snail_die","hp","hp_bar","bg_stage1_path_top","bg_stage1_path_mid","bg_stage1_path_bottom","bg_stage1_front","bg_stage1_back_bottom","bg_stage1_back_top","bg_stage1_stand","number_damage2","create","exp_bar","exp","levelup","clear","fail","start","quit","restart","info","info_back","info_card","info_close","fullscreen","tick","login","new","load","login_board",
	"orange-mushroom_move","orange-mushroom_hit","orange-mushroom_die","shroom_move","shroom_hit","shroom_die",
	"bg_town_back0","bg_town_back1","bg_town_back2","bg_town_back3","bg_town_back4","bg_town_back5","bg_town_back6","bg_town_back7",
	"box","battle","status","choose_soldier_back2","choose_soldier2","skill","up","upgrade","skill_back","item","equip","console","up","down","name","end_chat","chat","mission","chat_back","choose_transfer4","transfer",
	"tag0","tag1","tag2","map_0",
	"money","item_0","item_1",
	"archer_stand","archer_attack","archer_hit","archer_attack_effect","archer_skill0_icon","archer_skill0_hit","archer_skill0_effect","archer_skill0","archer_skill1_icon",
	"magician_stand","magician_attack","magician_hit","magician_attack_effect","magician_skill0_icon","magician_skill0_hit","magician_skill0_effect","magician_skill0","magician_skill1_icon","magician_skill1_hit","magician_skill1_effect","magician_skill1",
	"rogue_stand","rogue_attack","rogue_hit","rogue_attack_effect","rogue_skill0_icon","rogue_skill0_hit","rogue_skill0_effect","rogue_skill0","rogue_skill0_hit_effect","rogue_skill1_icon","rogue_skill1_hit","rogue_skill1_effect","rogue_skill1",
	"swordman_stand","swordman_attack","swordman_hit","swordman_attack_effect","swordman_skill0_icon","swordman_skill0_hit","swordman_skill0_effect","swordman_skill0","swordman_skill1_icon","swordman_skill1_hit","swordman_skill1_effect","swordman_skill1",
	"bat_move","bat_hit","bat_die",
	"ironhog_move","ironhog_hit","ironhog_die"] ;
	var loadImageProgress = 0 ;
	var imgMap = {} ;
	var canvasMap = {} ;
	var canvasWidth = 1350 , canvasHeight = 780 ;
	var roadBottomY = 470 ;
	var roadTopY = 210 ;
	var nowPage = 'loadPage' ; 
	var nowStage = 'stage1' ;
	var mouseOver = 'none' ;
	var nowChooseSoldier ;
	var roleList = ['beginner','archer','magician','rogue',"swordman"] ;
	var monsterIdList = ['snail','bat',"ironhog","orange-mushroom","shroom"];
	var roleDescriptionList = ['beginner','archer','magician','rogue',"swordman"] ;
	var monsterDescriptionList = ['snail','bat',"ironhog","orange-mushroom"] ;
	var itemIdList = ["sword","sapphireStaff"] ;
	var soldierMap = {} ; 
	var monsterMap = {} ;
	var itemMap = {} ;
	var monsterList = [] ;
	var monsterTypeList = [] ;
	var animationList = [] ;
	var mySoldierList = [] ;
	var invokeList = [] ;
	var fullscreen = {} ;
	var doneStage = 0 ;
	var money = 0 ;
	var itemList = [] ;
	var tempItemList = [] ;
	var tempMoney = 0 ;
	var invokeAnimationTimer = 0 , invokeAnimationDelay = 5 , invokeAnimationNowFrame = 0 , invokeAnimationTotalFrame = 8 ;

	var login = {
		background : {} ,
		board : {} ,
		newButton : {} ,
		loadButton : {} ,
		init : function(){
			this.initObject();
		},
		initObject : function(){
			this.background = { x : -50 , y : -150 , w : canvasMap["login"].width * 1.8, h : canvasMap["login"].height * 1.8, canvas : "login" } ;
			this.board = { x : 490 , y : 440 , w : canvasMap["login_board"].width , h : canvasMap["login_board"].height , canvas : "login_board" } ;
			this.newButton = { x : 587 , y : 510 , w : canvasMap["new"].width , h : canvasMap["new"].height , canvas : "new" } ;
			this.loadButton = { x : 587 , y : 600 , w : canvasMap["load"].width , h : canvasMap["load"].height , canvas : "load" } ;
		},
		showBackground : function(){
			common.drawObject(this.background);
			common.drawObject(this.board);
			common.drawObject(this.newButton);
			if ( localStorage.getItem("item") !== null )
				common.drawObject(this.loadButton);
		},
		showAll : function(){
			common.setMouseEvent(login.mouseOver,login.mouseClick);
			this.showBackground();
		},
		setMouseEnterNewButtonOver : function(){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterNewButtonClick : function(){
			document.body.style.cursor = "default" ;
			nowPage = "town";
			town.init();
			preStage.initInvoke();
		},
		setMouseEnterLoadButtonClick : function(){
			document.body.style.cursor = "default" ;
			nowPage = "town";
			town.init();
			preStage.initInvoke();

			var item = JSON.parse(localStorage.getItem("item")) ;
			itemList = [] ;
			for ( var i = 0 ; i < item.length ; i ++ ){
				itemList.push(common.clone(itemMap[itemIdList[item[i].id]]));
			}
			var soldier = JSON.parse(localStorage.getItem("soldier")) ;
			mySoldierList = [] ;
			for ( var i = 0 ; i < soldier.length ; i ++ ){
				mySoldierList.push(common.clone(soldierMap[roleList[soldier[i].id]]));
				for ( var j = 0 ; j < soldier[i].level-1 ; j ++ ){
					mySoldierList[i].upgrade(1) ;
				}
				mySoldierList[i].nowExp = soldier[i].exp ;
				mySoldierList[i].point = soldier[i].point ;
				for ( var j = 0 ; j < soldier[i].skill.length ; j ++ ){
					for ( k = 0 ; k < soldier[i].skill[j].level ; k ++ ){
						mySoldierList[i].skill[j].upgrade() ;
					}
				} 
				for ( var e in soldier[i].equip ){
					mySoldierList[i].equipment[e] = common.clone(itemMap[itemIdList[soldier[i].equip[e].id]]);
				}
			}
			doneStage = JSON.parse(localStorage.getItem("stage"));
			money = JSON.parse(localStorage.getItem("money"));
			var invoke = JSON.parse(localStorage.getItem("invoke")) ; 
			preStage.pickSoldier.pickSoldierList = [] ;
			preStage.pickSoldier.initSoldierList();
			for ( var i = 0 ; i < invoke.length ; i ++ ){
				if ( invoke[i] !== null ){
					var index = invoke[i] ;
					invokeList[i].index = index ;
					invokeList[i].soldier = mySoldierList[index] ;
					preStage.pickSoldier.pickSoldierList.splice(index,1);
					mySoldierList[index].isPicked = true ;
					preStage.isShowChooseSoldier = false ;
					invokeList[i].x += 24 ;
					invokeList[i].y += 54 ;
				}
			}
			town.refreshItemList();
		},
		detectMouseEnterOver : function(temp,offsetX,offsetY,ratio){
			if ( common.isMouseEnterRange(temp,login.newButton,offsetX,offsetY,ratio) ){
				login.setMouseEnterNewButtonOver() ;
				return ;
			} else if ( localStorage.getItem("item") !== null ){
				if ( common.isMouseEnterRange(temp,login.loadButton,offsetX,offsetY,ratio) ){
					login.setMouseEnterNewButtonOver() ;
					return ;
				}
			}
			common.setMouseEnterNone();
		},
		detectMouseEnterClick : function(temp,offsetX,offsetY,ratio){
			if ( common.isMouseEnterRange(temp,login.newButton,offsetX,offsetY,ratio) ){
				login.setMouseEnterNewButtonClick() ;
				return ;
			} else if ( localStorage.getItem("item") !== null ){
				if ( common.isMouseEnterRange(temp,login.loadButton,offsetX,offsetY,ratio) ){
					login.setMouseEnterLoadButtonClick() ;
					return ;
				}
			}
			common.setMouseEnterNone();
		},
		mouseOver :function(e){
			var info = common.getSizeInfo(e) ;
			login.detectMouseEnterOver(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		mouseClick: function(e){
			var info = common.getSizeInfo(e) ;
			login.detectMouseEnterClick(info.temp,info.offsetX,info.offsetY,info.ratio);
		}
	}

	var setting = {				
		setMouseEvent : function(over,click){
			document.addEventListener("click",click);
			document.addEventListener("mousemove",over); // ??
		} ,
		setMouseEnterFullscreenClick : function(){
			var canvas = document.querySelector("canvas") ;
			  if (!document.fullscreenElement &&    // alternative standard method
			      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  
			    if (canvas.requestFullscreen) {
			      canvas.requestFullscreen();
			    } else if (canvas.msRequestFullscreen) {
			      canvas.msRequestFullscreen();
			    } else if (canvas.mozRequestFullScreen) {
			      canvas.mozRequestFullScreen();
			    } else if (canvas.webkitRequestFullscreen) {
			      canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			    }
			  } else {
			    if (document.exitFullscreen) {
			      document.exitFullscreen();
			    } else if (document.msExitFullscreen) {
			      document.msExitFullscreen();
			    } else if (document.mozCancelFullScreen) {
			      document.mozCancelFullScreen();
			    } else if (document.webkitExitFullscreen) {
			      document.webkitExitFullscreen();
			    }
			  }
		},
		setMouseEnterFullscreenOver : function(){
			document.body.style.cursor = "pointer" ;
		},
		mouseOver :function(e){
			var info = common.getSizeInfo(e) ;
			setting.detectMouseEnterOver(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		mouseClick: function(e){
			var info = common.getSizeInfo(e) ;
			setting.detectMouseEnterClick(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		detectMouseEnterOver : function(temp,offsetX,offsetY,ratio){
			if ( common.isMouseEnterRange(temp,fullscreen,offsetX,offsetY,ratio) ){
				setting.setMouseEnterFullscreenOver() ;
				return ;
			}
		},
		detectMouseEnterClick : function(temp,offsetX,offsetY,ratio){
			if ( common.isMouseEnterRange(temp,fullscreen,offsetX,offsetY,ratio) ){
				setting.setMouseEnterFullscreenClick() ;
				return ;
			}
		}
	}

	var common = {
		save : function(){
			var item = [] ;
			for ( var i = 0 ; i < itemList.length ; i ++ ){
				item.push({id:itemList[i].id});
			}
			var soldier = [] ;
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				var skill = [] ;
				for ( var j = 0 ; j < mySoldierList[i].skill.length ; j ++ ){
					skill.push({ 
						level : mySoldierList[i].skill[j].nowLevel
					}) ;
				}
				var equip = {} ;
				for ( var e in mySoldierList[i].equipment ){
					equip[e] = {} ;
					equip[e].id = mySoldierList[i].equipment[e].id ;
				}
				soldier.push({
					id : mySoldierList[i].id , exp : mySoldierList[i].nowExp , level : mySoldierList[i].level , point : mySoldierList[i].point , skill : skill , equip : equip 
				} );
			}

			localStorage.setItem("item", JSON.stringify(item));
			localStorage.setItem("money", money);
			localStorage.setItem("stage", doneStage);
			localStorage.setItem("soldier", JSON.stringify(soldier));
			var invoke = [] ;
			for ( var i = 0 ; i < invokeList.length ; i ++ ){
				invoke.push(invokeList[i].index);
			}
			localStorage.setItem("invoke", JSON.stringify(invoke));
		},
		createItem : function(data){
			var item = {
				name : data.name || "" ,
				id : data.id || 0 ,
				canvas : "item_"+data.id ,
				point : data.point || 0 ,
				effect : data.effect || [] ,
				f : data.f ,
				description : data.description || "" ,
				type : data.type ,
				role : data.role || [0,1,2,3,4]
			}
			return item ;
		},
      	wrapText : function(t, maxWidth, lineHeight) {
      		var context = gameCtx , x = t.x , y = t.y , text = t.text ;
			var words = text.split(' ');
			var line = '';
			for (var n = 0; n < words.length; n++) {
				var testLine = line + words[n] + ' ';
				var metrics = context.measureText(testLine);
				var testWidth = metrics.width;
				if (testWidth > maxWidth && n > 0) {
					context.fillText(line, x, y);
					line = words[n] + ' ';
					y += lineHeight;
				}
				else {
					line = testLine;
				}
			}
			context.fillText(line, x, y);
			return y ;
		},
		drawObject : function(obj){
			if ( obj.text === undefined ){
				var ratio = 1 ; 
				if ( obj.ratio !== undefined )
					ratio = obj.ratio ;
				if ( obj.nowFrame === undefined )
					gameCtx.drawImage(canvasMap[obj.canvas],obj.x,obj.y,obj.w*ratio,obj.h*ratio);
				else if ( obj.canvas !== undefined )
					gameCtx.drawImage(canvasMap[obj.canvas],obj.nowFrame*obj.w,0,obj.w,obj.h,obj.x,obj.y,obj.w*ratio,obj.h*ratio);
			} else {
				if ( obj.font !== undefined )
					gameCtx.font= obj.font ;
				if ( obj.fillStyle !== undefined ){
					gameCtx.fillStyle = obj.fillStyle ;
				}
				gameCtx.fillText(obj.text,obj.x,obj.y);
			}
		},
		createAnimation : function(obj){
			animationList.push(obj);
		},
		loopAnimation : function(obj){
			if ( obj.timer < obj.delay  ){
				obj.timer ++ ;
			} else if ( obj.timer >= obj.delay  ){
				obj.nowFrame  ++ ;
				obj.timer = 0 ;
				if ( obj.nowFrame >= obj.totalFrame ){
					obj.nowFrame = 0 ;
				}
			}
		},
		cloneCanvas : function(canvas){
			var newCanvas = document.createElement("canvas") ;
			var newContent = newCanvas.getContext("2d") ;
			newCanvas.width = canvas.width ;
			newCanvas.height = canvas.height ;
			newContent.drawImage(canvas,0,0) ;
			return newCanvas ;
		},
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
		        	if ( obj[attr].tagName === "CANVAS" ){
		        		copy[attr] = common.cloneCanvas(obj[attr]);
		        	} else if (obj.hasOwnProperty(attr)) copy[attr] = common.clone(obj[attr]);
		        }
		        return copy;
		    }
		},
		initNumberDamage : function(){
			for ( var i = 0 ; i < 10 ; i ++ ){
				var numberCanvas = canvasMap["number_damage"] ;
				var canvas = document.createElement("canvas") ;
				var ctx = canvas.getContext('2d');
				var w = numberCanvas.width / 10  ;
				var h = numberCanvas.height ;
				canvas.width = w ;
				canvas.height = h ;
				ctx.drawImage(numberCanvas,w*i,0,w,h,0,0,w,h);
				canvasMap["number_damage_"+i] = canvas ;
				
			}
			for ( var i = 0 ; i < 11 ; i ++ ){
				var numberCanvas = canvasMap["number_damage2"] ;
				var canvas = document.createElement("canvas") ;
				var ctx = canvas.getContext('2d');
				var w = numberCanvas.width / 11  ;
				var h = numberCanvas.height ;
				canvas.width = w ;
				canvas.height = h ;
				ctx.drawImage(numberCanvas,w*i,0,w,h,0,0,w,h);
				canvasMap["number_damage2_"+i] = canvas ;
					
			}
		},
		createSkillFunctionActive : function(data){
			var createEffectFunction = data.createEffectFunction ;
			var createHitFunction = data.createHitFunction ;
			var getTargetFunction = data.getTargetFunction ;
			var s = data.state ;
			var f = function(x,y,range,state,canvas,atk,effect,ratio,attackType){
				if ( state === s ){
					createEffectFunction(x,y,range,state,canvas,this.target);
					createHitFunction(x,y,range,state,canvas,this.target,atk,effect,ratio,attackType) ;
					if ( canvas.timer <= canvas.delay ){
						canvas.timer ++ ;
						return { state : s , done : false } ;
					} else {
						canvas.timer = 0 ;
						canvas.nowFrame ++ ;
						if ( canvas.nowFrame >= canvas.totalFrame ){
							canvas.nowFrame = 0 ;								
							this.target = [] ;
							for ( var i = 0 ; i < canvas.animationBoolean.length ; i ++  ){
								canvas.animationBoolean[i] = false ;
							}							
							for ( var i = 0 ; i < canvas.effectBoolean.length ; i ++  ){
								canvas.effectBoolean[i] = false ;
							}
							this.timer = 0 ;
							return { state : "stand" , done : true } ;
						} else {
							return { state : s , done : false } ;
						}
					}
				} else if ( state === "stand" && this.timer >= this.speed ){
					getTargetFunction(x,y,range,state,canvas,this.target);
					if ( this.target.length !== 0 ){
						return { state : s , done : false } ;
					} else {
						return { state : "stand" , done : false } ;
					}
				} else {
					if ( this.timer < this.speed )
						this.timer ++ ;
					return { state : "stand" , done : false } ;
				}
			}
			return f ;
		},
		initItemMap : function(){
			var sword = common.createItem({
				id : 0 ,
				name : "Sword" ,
				type : "weapon" ,
				description : "Increase damage." ,
				point : 2 ,
				role : [0] ,
				f : function(d){
					d.itemAtk += this.point ;
				}
			});
			itemMap["sword"] = sword ;
			var sapphireStaff = common.createItem({
				id : 1 ,
				name : "Sapphire Staff" ,
				type : "weapon" ,
				description : "Increase damage." ,
				role : [2] ,
				point : 3 ,
				f : function(d){
					d.itemAtk += this.point ;
				}
			});
			itemMap["sapphireStaff"] = sapphireStaff ;
		},
		initSoldierMap : function(){

			var beginner = common.createSoldier({
				name : "Beginner" ,
				description : "The soldier is a newbie without anything." ,
				id : 0,
				atk : 15,
				speed: 60,
				range: 150,
				level: 1,
				transferLevel: 2,
				hitFrame: 3,
				standFrame: 5,
				attackFrame: 3,
				attackEffectFrame: 2,
				attackEffectDx : -27 ,
				attackEffectDy : 5 ,
				attackAnimationFrame: 1,
				attackAnimationBeginFrame:2,
				attackOffsetX : -3 ,
				attackType : ["physical"],
				upgrade : function(n){
					if ( this.level < 10) 
						this.goalExp = Math.round(2*this.goalExp) ;
					else if ( this.level < 30 ) {
						this.goalExp = Math.round(1.5*this.goalExp) ;
					} else if ( this.level < 40 ) {
						this.goalExp = Math.round(1.4*this.goalExp) ;
					} else if ( this.level < 50 ) {
						this.goalExp = Math.round(1.3*this.goalExp) ;
					} else if ( this.level < 60 ) {
						this.goalExp = Math.round(1.2*this.goalExp) ;
					} else if ( this.level < 70 ) {
						this.goalExp = Math.round(1.1*this.goalExp) ;
					} else if ( this.level < 80 ) {
						this.goalExp = Math.round(1.09*this.goalExp) ;
					} 
					this.level ++ ;
					this.atk += n* 2 ;
				}
			}) ;
			soldierMap['beginner'] = beginner ;

			var doubleArrow = common.createSkill({
				name : "Double Arrow" ,
				canvasName : "archer_skill0" ,
				description : "Attack a monster twice." ,
				needLevel : 1 ,
				needSkill : [] ,
				effect : [] ,
				speed : 200 ,
				timer : 200 ,
				target : [] ,
				ratio : 0.7 ,
				ratioUpgrade : 0.1 ,
				type : "active" ,	
				upgrade : function(){
					if ( this.nowLevel > 0){
						var r = this.ratio * 10 ; 
						var u = this.ratioUpgrade * 10 ;
						this.ratio = (r + u )/ 10 ;
					}
					this.nowLevel ++ ;
				},		
				canvas : {
					state : "doubleArrow" ,
					w : canvasMap["archer_skill0"].width / 6 ,
					h : canvasMap["archer_skill0"].height ,
					canvas : "archer_skill0" ,
					nowFrame : 0 ,
					totalFrame : 6 ,
					delay : 5 ,
					timer : 0 ,
					effectFrame : [2,5] ,
					effectBoolean : [false,false],
					animationFrames : 0 ,
					animationBeginFrame : [2,5] ,
					animationBoolean : [false,false] ,
					attackEffectDx : -56 ,
					attackEffectDy : 40 ,
					attackEffectVx : 0 ,
					attackEffectVy : 0 ,
					hitDx : 0 ,
					hitDy : 27 ,
					offsetX : 0 ,
					offsetY : -5 
				} , 
				f : common.createSkillFunctionActive({
					state : "doubleArrow" ,
					createEffectFunction : function(x,y,range,state,canvas){
						for ( var i = 0 ; i < canvas.animationBeginFrame.length ; i ++  ){
							if ( canvas.animationBeginFrame[i] === canvas.nowFrame && canvas.animationBoolean[i] === false ){
								common.createAnimation({
									canvas : "archer_skill0_effect" ,
									x : x + canvas.attackEffectDx  ,
									y : y + canvas.attackEffectDy ,
									nowFrame : 0 ,
									timer : 0 ,
									delay : 5 ,
									totalFrame : 1 ,
									dx : canvas.attackEffectVx ,
									dy : canvas.attackEffectVy ,
									width : canvasMap["archer_skill0_effect"].width  , 
									height : canvasMap["archer_skill0_effect"].height  
								});
								canvas.animationBoolean[i] = true ;
								break ;
							}
						}
					} ,
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio,attackType){
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								var atkSum = { result : Math.round((atk)*ratio), state : [] } ;
								for ( var j = 0 ; j < effect.length ; j ++ ){
									effect[j].f(atkSum);
								}
								target[i].isHit({id:-1,canvas:"archer_skill0_hit",atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:6,width:canvasMap["archer_skill0_hit"].width/6,height:canvasMap["archer_skill0_hit"].height,type:"archer_skill0",attackType:attackType}) ;
								canvas.effectBoolean[i] = true ;
								break ;
							}
						}
					},
					getTargetFunction : function(x,y,range,state,canvas,target){
						var countMax = 2 , count = 0 ;
						for ( var i = 0 ; i < monsterList.length && count < countMax ; i ++ ){
							if ( Math.abs(monsterList[i].x-x) <= range && monsterList[i].hitAble === true ){
								target.push(monsterList[i]);
								count ++ ;
								i = -1 ;
							} 
						}
					}
				}) 

			}) ;

			var criticalArrow = common.createSkill({
				name : "Critical Arrow" ,
				description : "Have the probability to deal more damage." ,
				canvasName : "archer_skill1" ,
				needLevel : 1 ,
				needSkill : [] ,
				effect : [] ,
				target : "enemy" ,
				type : "passive" ,				
				probability : 0.5 ,
				probabilityUpgrade : 0.05 , 
				ratio : 1.5 ,		
				ratioUpgrade : 0.1 ,
				upgrade : function(){
					if ( this.nowLevel > 0){
						var r = this.ratio * 10 ; 
						var u = this.ratioUpgrade * 10 ;
						this.ratio = (r + u )/ 10 ;

						var r = this.probability * 100 ; 
						var u = this.probabilityUpgrade * 100 ;
						this.probability = Math.round((r + u ))/ 100 ;
					}
					if ( this.probability >= 0.8 ){
						this.probabilityUpgrade = 0 ;
					} 
					this.nowLevel ++ ;
				},	
				f : function(d){
					var r = Math.random();
					if ( r < this.probability ){
						d.result *= this.ratio ;
						d.state.push({
							name : "critical"
						}) ;
					} else {
						return ;
					}
				},
				init : function(effect){
					effect.push(this) ;
					this.isInit = true ;
				}

			}) ;

			var archer = common.createSoldier({
				description : "The soldier deals damage widely and fast. Have critical attacks and deal extra damage to sky monster." ,
				name : "Archer" ,
				id : 1,
				atk : 30,
				speed: 40,
				range: 200,
				level: 1,
				transferLevel: 15,
				hitFrame: 2,
				standFrame: 5,
				attackFrame: 3,
				attackEffectFrame: 2,
				attackEffectDx : -50 ,
				attackEffectDy : 40 ,
				attackAnimationFrame: 1,
				attackAnimationBeginFrame:1,
				standOffsetY : -5 ,
				attackOffsetY : -5 ,
				hitDx : 5 ,
				hitDy : 5 ,
				skill : [doubleArrow,criticalArrow] ,
				attackType : ["physical","sky"],
				upgrade : function(n){
					if ( this.level < 10) 
						this.goalExp = Math.round(2*this.goalExp) ;
					else if ( this.level < 30 ) {
						this.goalExp = Math.round(1.5*this.goalExp) ;
					} else if ( this.level < 40 ) {
						this.goalExp = Math.round(1.4*this.goalExp) ;
					} else if ( this.level < 50 ) {
						this.goalExp = Math.round(1.3*this.goalExp) ;
					} else if ( this.level < 60 ) {
						this.goalExp = Math.round(1.2*this.goalExp) ;
					} else if ( this.level < 70 ) {
						this.goalExp = Math.round(1.1*this.goalExp) ;
					} else if ( this.level < 80 ) {
						this.goalExp = Math.round(1.09*this.goalExp) ;
					} 
					this.level ++ ;
					this.atk += n* 2 ;
				}
			}) ;
			soldierMap['archer'] = archer ;
			
			var magicClaw = common.createSkill({
				name : "Magic Claw" ,
				canvasName : "magician_skill0" ,
				description : "Attack a monster twice." ,
				needLevel : 1 ,
				needSkill : [] ,
				effect : [] ,
				speed : 200 ,
				timer : 200 ,
				target : [] ,
				type : "active" ,
				ratio : 0.7 ,
				ratioUpgrade : 0.1 ,		
				upgrade : function(){
					if ( this.nowLevel > 0){
						var r = this.ratio * 10 ; 
						var u = this.ratioUpgrade * 10 ;
						this.ratio = (r + u )/ 10 ;
					}
					this.nowLevel ++ ;
				},				
				canvas : {
					state : "magicClaw" ,
					w : canvasMap["magician_skill0"].width / 3 ,
					h : canvasMap["magician_skill0"].height ,
					canvas : "magician_skill0" ,
					nowFrame : 0 ,
					totalFrame : 3 ,
					delay : 10 ,
					timer : 0 ,
					effectFrame : [0,2] ,
					effectBoolean : [false,false],
					animationFrames : 0 ,
					animationBeginFrame : [1,2] ,
					animationBoolean : [false,false] ,
					attackEffectDx : -36 ,
					attackEffectDy : 0 ,
					attackEffectVx : 0 ,
					attackEffectVy : 0 ,
					hitDx : 0 ,
					hitDy : 7 ,
					offsetX : -40 ,
					offsetY : -15 
				} , 
				f : common.createSkillFunctionActive({
					state : "magicClaw" ,
					createEffectFunction : function(x,y,range,state,canvas){
						for ( var i = 0 ; i < canvas.animationBeginFrame.length ; i ++  ){
							if ( canvas.animationBeginFrame[i] === canvas.nowFrame && canvas.animationBoolean[i] === false ){
								common.createAnimation({
									canvas : "magician_skill0_effect" ,
									x : x + canvas.attackEffectDx  ,
									y : y + canvas.attackEffectDy ,
									nowFrame : 0 ,
									timer : 0 ,
									delay : 5 ,
									totalFrame : 4 ,
									dx : canvas.attackEffectVx ,
									dy : canvas.attackEffectVy ,
									width : canvasMap["magician_skill0_effect"].width / 4 , 
									height : canvasMap["magician_skill0_effect"].height  
								});
								canvas.animationBoolean[i] = true ;
							}
						}
					} ,
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio,attackType){
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								var atkSum = { result : Math.round((atk )*ratio) , state : [] } ;
								for ( var j = 0 ; j < effect.length ; j ++ ){
									effect[j].f(atkSum);
								}
								if ( i === 0 ){
									target[0].isHit({id:-1,canvas:"magician_skill0_hit",atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:5,width:canvasMap["magician_skill0_hit"].width/5,height:canvasMap["magician_skill0_hit"].height,type:"magician_skill0",attackType:attackType}) ;
								}
								else {
									target[0].isHit({id:-1,atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:5,width:canvasMap["magician_skill0_hit"].width/5,height:canvasMap["magician_skill0_hit"].height,attackType:attackType}) ;

								}
								canvas.effectBoolean[i] = true ;
								break ;
							}
						}
					},
					getTargetFunction : function(x,y,range,state,canvas,target){
						for ( var i = 0 ; i < monsterList.length  ; i ++ ){
							if ( Math.abs(monsterList[i].x-x) <= range && monsterList[i].hitAble === true ){
								target.push(monsterList[i]);
								break ;
							} 
						}
					}
				}) 

			}) ;

			
			var magicBomb = common.createSkill({
				name : "Magic Bomb" ,
				canvasName : "magician_skill1" ,
				description : "Attack monsters in the range." ,
				needLevel : 1 ,
				needSkill : [] ,
				effect : [] ,
				speed : 500 ,
				timer : 500 ,
				target : [] ,
				type : "active" ,
				ratio : 1.5 ,	
				ratioUpgrade : 0.1 ,
				upgrade : function(){
					if ( this.nowLevel > 0){
						var r = this.ratio * 10 ; 
						var u = this.ratioUpgrade * 10 ;
						this.ratio = (r + u )/ 10 ;
					}
					this.nowLevel ++ ;
				},				
				canvas : {
					state : "magicBomb" ,
					w : canvasMap["magician_skill1"].width / 3 ,
					h : canvasMap["magician_skill1"].height ,
					canvas : "magician_skill1" ,
					nowFrame : 0 ,
					totalFrame : 3 ,
					delay : 10 ,
					timer : 0 ,
					effectFrame : [2] ,
					effectBoolean : [false],
					animationFrames : 0 ,
					animationBeginFrame : [1] ,
					animationBoolean : [false] ,
					attackEffectDx : -110 ,
					attackEffectDy : -20 ,
					attackEffectVx : 0 ,
					attackEffectVy : 0 ,
					hitDx : -40 ,
					hitDy : 0 ,
					offsetX : -40 ,
					offsetY : -15 
				} , 
				f : common.createSkillFunctionActive({
					state : "magicBomb" ,
					createEffectFunction : function(x,y,range,state,canvas){
						var name = "magician_skill1_effect" , total = 7 ;
						for ( var i = 0 ; i < canvas.animationBeginFrame.length ; i ++  ){
							if ( canvas.animationBeginFrame[i] === canvas.nowFrame && canvas.animationBoolean[i] === false ){
								common.createAnimation({
									canvas : name ,
									x : x + canvas.attackEffectDx  ,
									y : y + canvas.attackEffectDy ,
									nowFrame : 0 ,
									timer : 0 ,
									delay : 5 ,
									totalFrame : total ,
									dx : canvas.attackEffectVx ,
									dy : canvas.attackEffectVy ,
									width : canvasMap[name].width / total , 
									height : canvasMap[name].height  
								});
								canvas.animationBoolean[i] = true ;
							}
						}
					} ,
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio,attackType){
						var name = "magician_skill1" , total = 7 ;
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								for ( var j = 0 ; j < target.length ; j ++ ){
									var atkSum = { result : Math.round((atk)*ratio) , state : [] } ;
									for ( var k = 0 ; k < effect.length ; j ++ ){
										effect[k].f(atkSum);
									}
									if ( j === 0 ){
										target[j].isHit({id:-1,canvas:name+"_hit",atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name,attackType:attackType}) ;
									}
									else {
										target[j].isHit({id:-1,atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,attackType:attackType}) ;
									}
								}
								canvas.effectBoolean[i] = true ;
								break ;
							}
						}
					},
					getTargetFunction : function(x,y,range,state,canvas,target){
						var count = 0 , r = 120 ;
						for ( var i = 0 ; i < monsterList.length  ; i ++ ){
							if ( Math.abs(monsterList[i].x-x) <= range && monsterList[i].hitAble === true ){
								var mx = monsterList[i].x ;
								for ( var j = 0 ; j < monsterList.length ; j ++ ){
									if ( Math.abs(monsterList[j].x-mx) <= r && monsterList[j].hitAble === true ){
										target.push(monsterList[j]);
									}
								}  
								break ;
							} 
						}
					}
				}) 

			}) ;

			var magician = common.createSoldier({
				name : "Magician" ,
				description : "The soldier deals magic damage widely, powerfully but slowly. Have the skill to deal damage to groups."  ,
				id : 2,
				atk : 60,
				speed: 100,
				range: 300,
				level: 1,
				transferLevel: 15,
				hitFrame: 3,
				effectTotalFrame : 4 ,
				standFrame: 5,
				attackFrame: 3,
				attackEffectFrame: 2,
				attackAnimationFrame: 1,
				attackAnimationBeginFrame:1,
				attackEffectDx : -20 ,
				attackEffectDy : 35 ,
				standOffsetX : -15 ,
				standOffsetY : -15 ,
				attackOffsetX : -30 ,
				attackOffsetY : -15 ,
				hitDy : 20 ,
				attackEffectDelay : 1 ,
				skill : [magicBomb,magicClaw],
				attackType : ["magic"],
				upgrade : function(n){
					if ( this.level < 10) 
						this.goalExp = Math.round(2*this.goalExp) ;
					else if ( this.level < 30 ) {
						this.goalExp = Math.round(1.5*this.goalExp) ;
					} else if ( this.level < 40 ) {
						this.goalExp = Math.round(1.4*this.goalExp) ;
					} else if ( this.level < 50 ) {
						this.goalExp = Math.round(1.3*this.goalExp) ;
					} else if ( this.level < 60 ) {
						this.goalExp = Math.round(1.2*this.goalExp) ;
					} else if ( this.level < 70 ) {
						this.goalExp = Math.round(1.1*this.goalExp) ;
					} else if ( this.level < 80 ) {
						this.goalExp = Math.round(1.09*this.goalExp) ;
					} 
					this.level ++ ;
					this.atk += n* 2 ;
				}
			}) ;

			soldierMap['magician'] = magician ;


			var disorder = common.createSkill({
				name : "Disorder" ,
				canvasName : "rogue_skill0" ,
				description : "Reduce the defense of a monster." ,
				needLevel : 1 ,
				needSkill : [] ,
				effect : [] ,
				speed : 100 ,
				timer : 100 ,
				target : [] ,
				type : "active" ,
				ratio : 0.5 ,
				effectRatio : 0.7 ,	
				ratioUpgrade : 0.1 ,	
				upgrade : function(){
					if ( this.nowLevel > 0){
						var r = this.effectRatio * 10 ; 
						var u = this.ratioUpgrade * 10 ;
						this.effectRatio = (r + u )/ 10 ;
					}
					this.nowLevel ++ ;
				},		
				canvas : {
					state : "disorder" ,
					w : canvasMap["rogue_skill0"].width / 3 ,
					h : canvasMap["rogue_skill0"].height ,
					canvas : "rogue_skill0" ,
					nowFrame : 0 ,
					totalFrame : 3 ,
					delay : 10 ,
					timer : 0 ,
					effectFrame : [2] ,
					effectBoolean : [false],
					animationFrames : 0 ,
					animationBeginFrame : [1] ,
					animationBoolean : [false] ,
					attackEffectDx : -30 ,
					attackEffectDy : 25 ,
					attackEffectVx : 0 ,
					attackEffectVy : 0 ,
					hitDx : 999 ,
					hitDy : 999 ,
					offsetX : -15 ,
					offsetY : 5 
				} , 
				f : common.createSkillFunctionActive({
					state : "disorder" ,
					createEffectFunction : function(x,y,range,state,canvas){
						var name = "rogue_skill0_effect" , total = 1 ;
						for ( var i = 0 ; i < canvas.animationBeginFrame.length ; i ++  ){
							if ( canvas.animationBeginFrame[i] === canvas.nowFrame && canvas.animationBoolean[i] === false ){
								common.createAnimation({
									canvas : name ,
									x : x + canvas.attackEffectDx  ,
									y : y + canvas.attackEffectDy ,
									nowFrame : 0 ,
									timer : 0 ,
									delay : 5 ,
									totalFrame : total ,
									dx : canvas.attackEffectVx ,
									dy : canvas.attackEffectVy ,
									width : canvasMap[name].width / total , 
									height : canvasMap[name].height  
								});
								canvas.animationBoolean[i] = true ;
							}
						}
					} ,
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio,attackType){
						var name = "rogue_skill0" , total = 10 , hitEffectFrame = 10 , hitEffectDx = 9 , hitEffectDy = -20 , hitEffectDelay = 5 , hitEffectVx = 0 ;
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								var atkSum = { result : Math.round((atk)*ratio) , state : [ { name : "disorder"  , ratio : ratio , remain : -1  } ] } ;
								hitEffectVx = target[0].speed ;
								target[0].isHit({canvas:name+"_hit",atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name,hitEffectFrame:hitEffectFrame,buff:true,hitEffectDx:hitEffectDx,hitEffectDy:hitEffectDy,hitEffectDelay:hitEffectDelay,hitEffectVx:hitEffectVx,attackType:attackType}) ;
								canvas.effectBoolean[i] = true ;
								break ;
							}
						}
					},
					getTargetFunction : function(x,y,range,state,canvas,target){
						var count = 0 ;
						for ( var i = 0 ; i < monsterList.length  ; i ++ ){
							if ( Math.abs(monsterList[i].x-x) <= range && monsterList[i].hitAble === true ){
								var u = false ;
								for ( var j = 0 ; j < monsterList[i].effect.length ; j ++ ){
									if ( monsterList[i].effect[j].name === "disorder" ){
										u = true ;
										break ;
									} 
								} 
								if ( u === false ){
									target.push(monsterList[i]);
									break ;
								}
							} 
						}
					}
				}) 

			}) ;


			var doubleStab = common.createSkill({
				name : "Double Stab" ,
				canvasName : "rogue_skill1" ,
				description : "Attack a monster twice." ,
				needLevel : 1 ,
				needSkill : [] ,
				effect : [] ,
				speed : 100 ,
				timer : 100 ,
				target : [] ,
				ratio : 0.7 ,
				type : "active" ,	
				ratioUpgrade : 0.1 ,
				upgrade : function(){
					if ( this.nowLevel > 0){
						var r = this.ratio * 10 ; 
						var u = this.ratioUpgrade * 10 ;
						this.ratio = (r + u )/ 10 ;
					}
					this.nowLevel ++ ;
				},				
				canvas : {
					state : "doubleStab" ,
					w : canvasMap["rogue_skill1"].width / 3 ,
					h : canvasMap["rogue_skill1"].height ,
					canvas : "rogue_skill1" ,
					nowFrame : 0 ,
					totalFrame : 3 ,
					delay : 8 ,
					timer : 0 ,
					effectFrame : [0,2] ,
					effectBoolean : [false,false],
					animationFrames : 0 ,
					animationBeginFrame : [2] ,
					animationBoolean : [false] ,
					attackEffectDx : -50 ,
					attackEffectDy : 20 ,
					attackEffectVx : 0 ,
					attackEffectVy : 0 ,
					hitDx : 25 ,
					hitDy : 7 ,
					offsetX : -30 ,
					offsetY : 5
				} , 
				f : common.createSkillFunctionActive({
					state : "doubleStab" ,
					createEffectFunction : function(x,y,range,state,canvas){
						var name = "rogue_skill1_effect" , total = 1 ;
						for ( var i = 0 ; i < canvas.animationBeginFrame.length ; i ++  ){
							if ( canvas.animationBeginFrame[i] === canvas.nowFrame && canvas.animationBoolean[i] === false ){
								common.createAnimation({
									canvas : name ,
									x : x + canvas.attackEffectDx  ,
									y : y + canvas.attackEffectDy ,
									nowFrame : 0 ,
									timer : 0 ,
									delay : 5 ,
									totalFrame : total ,
									dx : canvas.attackEffectVx ,
									dy : canvas.attackEffectVy ,
									width : canvasMap[name].width  , 
									height : canvasMap[name].height  
								});
								canvas.animationBoolean[i] = true ;
								break ;
							}
						}
					} ,
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio,attackType){
						var name = "rogue_skill1" , total = 5 ; 
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								var atkSum = { result : Math.round((atk)*ratio), state : [] } ;
								for ( var j = 0 ; j < effect.length ; j ++ ){
									effect[j].f(atkSum);
								}
								if ( i === 0 ){
									target[0].isHit({canvas:name+"_hit",atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name,attackType:attackType}) ;
								} else {
									target[0].isHit({atk:atkSum,attackType:attackType}) ;	
								}
								canvas.effectBoolean[i] = true ;
								break ;
							}
						}
					},
					getTargetFunction : function(x,y,range,state,canvas,target){
						for ( var i = 0 ; i < monsterList.length  ; i ++ ){
							if ( Math.abs(monsterList[i].x-x) <= range && monsterList[i].hitAble === true ){
								target.push(monsterList[i]);
								break ;
							} 
						}
					}
				}) 

			}) ;

			var rogue = common.createSoldier({
				name : "Rogue" ,
				description : "The soldier deals damage fast but narrowly. Have the skill to decrease the defense of a monster." ,
				id : 3,
				atk : 50,
				speed: 30,
				range: 100,
				level: 1,
				transferLevel: 15,
				hitFrame: 3,
				standFrame: 5,
				attackFrame: 3,
				attackEffectFrame: 2,
				attackEffectDx : -38 ,
				attackEffectDy : 20 ,
				attackAnimationFrame: 1,
				attackAnimationBeginFrame:2,
				standOffsetX : 5 ,
				standOffsetY : 5 ,
				attackOffsetX : -20 ,
				attackOffsetY : 7 ,
				skill : [disorder,doubleStab],
				attackType : ["physical"],
				upgrade : function(n){
					if ( this.level < 10) 
						this.goalExp = Math.round(2*this.goalExp) ;
					else if ( this.level < 30 ) {
						this.goalExp = Math.round(1.5*this.goalExp) ;
					} else if ( this.level < 40 ) {
						this.goalExp = Math.round(1.4*this.goalExp) ;
					} else if ( this.level < 50 ) {
						this.goalExp = Math.round(1.3*this.goalExp) ;
					} else if ( this.level < 60 ) {
						this.goalExp = Math.round(1.2*this.goalExp) ;
					} else if ( this.level < 70 ) {
						this.goalExp = Math.round(1.1*this.goalExp) ;
					} else if ( this.level < 80 ) {
						this.goalExp = Math.round(1.09*this.goalExp) ;
					} 
					this.level ++ ;
					this.atk += n* 2 ;
				}
			}) ;
			soldierMap['rogue'] = rogue ;

		
			var slashBlast = common.createSkill({
				name : "Slash Blast" ,
				canvasName : "swordman_skill0" ,
				description : "Attack monsters in the range." ,
				needLevel : 1 ,
				needSkill : [] ,
				effect : [] ,
				speed : 500 ,
				timer : 500 ,
				target : [] ,
				type : "active" ,
				ratio : 1.3 ,	
				ratioUpgrade : 0.1 ,
				upgrade : function(){
					if ( this.nowLevel > 0){
						var r = this.ratio * 10 ; 
						var u = this.ratioUpgrade * 10 ;
						this.ratio = (r + u )/ 10 ;
					}
					this.nowLevel ++ ;
				},			
				canvas : {
					state : "slashBlast" ,
					w : canvasMap["swordman_skill0"].width / 3 ,
					h : canvasMap["swordman_skill0"].height ,
					canvas : "swordman_skill0" ,
					nowFrame : 0 ,
					totalFrame : 3 ,
					delay : 10 ,
					timer : 0 ,
					effectFrame : [2] ,
					effectBoolean : [false],
					animationFrames : 0 ,
					animationBeginFrame : [0] ,
					animationBoolean : [false] ,
					attackEffectDx : -200 ,
					attackEffectDy : -80 ,
					attackEffectVx : 0 ,
					attackEffectVy : 0 ,
					hitDx : 5 ,
					hitDy : 0 ,
					offsetX : -24 ,
					offsetY : 7 
				} , 
				f : common.createSkillFunctionActive({
					state : "slashBlast" ,
					createEffectFunction : function(x,y,range,state,canvas){
						var name = "swordman_skill0_effect" , total = 12 ;
						for ( var i = 0 ; i < canvas.animationBeginFrame.length ; i ++  ){
							if ( canvas.animationBeginFrame[i] === canvas.nowFrame && canvas.animationBoolean[i] === false ){
								common.createAnimation({
									canvas : name ,
									x : x + canvas.attackEffectDx  ,
									y : y + canvas.attackEffectDy ,
									nowFrame : 0 ,
									timer : 0 ,
									delay : 5 ,
									totalFrame : total ,
									dx : canvas.attackEffectVx ,
									dy : canvas.attackEffectVy ,
									width : canvasMap[name].width / total , 
									height : canvasMap[name].height  
								});
								canvas.animationBoolean[i] = true ;
							}
						}
					} ,
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio,attackType){
						var name = "swordman_skill0" , total = 4 ;
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								for ( var j = 0 ; j < target.length ; j ++ ){
									var atkSum = { result : Math.round((atk)*ratio) , state : [] } ;
									for ( var k = 0 ; k < effect.length ; j ++ ){
										effect[k].f(atkSum);
									}
									target[j].isHit({id:-1,canvas:name+"_hit",atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name,attackType:attackType}) ;
								}
								canvas.effectBoolean[i] = true ;
								break ;
							}
						}
					},
					getTargetFunction : function(x,y,range,state,canvas,target){
						var count = 0 , r = 150 ;
						for ( var i = 0 ; i < monsterList.length  ; i ++ ){
							if ( Math.abs(monsterList[i].x-x) <= range && monsterList[i].hitAble === true ){
								var mx = monsterList[i].x ;
								for ( var j = 0 ; j < monsterList.length ; j ++ ){
									if ( Math.abs(monsterList[j].x-mx) <= r && monsterList[j].hitAble === true ){
										target.push(monsterList[j]);
									}
								}  
								break ;
							} 
						}
					}
				}) 

			}) ;

		
			var powerStrike = common.createSkill({
				name : "Power Strike" ,
				canvasName : "swordman_skill1" ,
				description : "Deal powerful damage to a monster." ,
				needLevel : 1 ,
				needSkill : [] ,
				effect : [] ,
				speed : 300 ,
				timer : 300 ,
				target : [] ,
				type : "active" ,
				ratio : 1.5 ,	
				ratioUpgrade : 0.1 ,
				upgrade : function(){
					if ( this.nowLevel > 0){
						var r = this.ratio * 10 ; 
						var u = this.ratioUpgrade * 10 ;
						this.ratio = (r + u )/ 10 ;
					}
					this.nowLevel ++ ;
				},			
				canvas : {
					state : "powerStrike" ,
					w : canvasMap["swordman_skill1"].width / 3 ,
					h : canvasMap["swordman_skill1"].height ,
					canvas : "swordman_skill1" ,
					nowFrame : 0 ,
					totalFrame : 3 ,
					delay : 13 ,
					timer : 0 ,
					effectFrame : [2] ,
					effectBoolean : [false],
					animationFrames : 0 ,
					animationBeginFrame : [0] ,
					animationBoolean : [false] ,
					attackEffectDx : -70 ,
					attackEffectDy : -80 ,
					attackEffectVx : 0 ,
					attackEffectVy : 0 ,
					hitDx : -35 ,
					hitDy : 0 ,
					offsetX : -24 ,
					offsetY : -11 
				} , 
				f : common.createSkillFunctionActive({
					state : "powerStrike" ,
					createEffectFunction : function(x,y,range,state,canvas){
						var name = "swordman_skill1_effect" , total = 12 ;
						for ( var i = 0 ; i < canvas.animationBeginFrame.length ; i ++  ){
							if ( canvas.animationBeginFrame[i] === canvas.nowFrame && canvas.animationBoolean[i] === false ){
								common.createAnimation({
									canvas : name ,
									x : x + canvas.attackEffectDx  ,
									y : y + canvas.attackEffectDy ,
									nowFrame : 0 ,
									timer : 0 ,
									delay : 5 ,
									totalFrame : total ,
									dx : canvas.attackEffectVx ,
									dy : canvas.attackEffectVy ,
									width : canvasMap[name].width / total , 
									height : canvasMap[name].height  
								});
								canvas.animationBoolean[i] = true ;
							}
						}
					} ,
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio){
						var name = "swordman_skill1" , total = 2 ;
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								var atkSum = { result : Math.round((atk)*ratio) , state : [] } ;
								for ( var k = 0 ; k < effect.length ; j ++ ){
									effect[k].f(atkSum);
								}
								target[0].isHit({id:-1,canvas:name+"_hit",atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name}) ;
								canvas.effectBoolean[i] = true ;
								break ;
							}
						}
					},
					getTargetFunction : function(x,y,range,state,canvas,target){
						for ( var i = 0 ; i < monsterList.length  ; i ++ ){
							if ( Math.abs(monsterList[i].x-x) <= range && monsterList[i].hitAble === true ){
								target.push(monsterList[i]);
							} 
						}
					}
				}) 

			}) ;

			var swordman = common.createSoldier({
				name : "Swordman" ,
				description : "The soldier deals damage widely, powerfully but slowly. Have the skill to deal damage to groups."  ,
				id : 4,
				atk : 60,
				speed: 150,
				range: 200,
				level: 1,
				transferLevel: 15,
				hitFrame: 3,
				standFrame: 5,
				attackFrame: 3,
				attackEffectFrame: 2,
				attackEffectDx : -70 ,
				attackEffectDy : -10 ,
				attackAnimationFrame: 1,
				attackAnimationBeginFrame:2,
				standOffsetX : -20 ,
				standOffsetY : 5 ,
				attackOffsetX : -48 ,
				attackOffsetY : -7 ,
				skill : [slashBlast,powerStrike],
				attackType : ["physical"],
				upgrade : function(n){
					if ( this.level < 10) 
						this.goalExp = Math.round(2*this.goalExp) ;
					else if ( this.level < 30 ) {
						this.goalExp = Math.round(1.5*this.goalExp) ;
					} else if ( this.level < 40 ) {
						this.goalExp = Math.round(1.4*this.goalExp) ;
					} else if ( this.level < 50 ) {
						this.goalExp = Math.round(1.3*this.goalExp) ;
					} else if ( this.level < 60 ) {
						this.goalExp = Math.round(1.2*this.goalExp) ;
					} else if ( this.level < 70 ) {
						this.goalExp = Math.round(1.1*this.goalExp) ;
					} else if ( this.level < 80 ) {
						this.goalExp = Math.round(1.09*this.goalExp) ;
					} 
					this.level ++ ;
					this.atk += n* 2 ;
				}
			}) ;
			soldierMap['swordman'] = swordman ;

		},
		initMonsterMap : function(){
			var snail = common.createMonster({
				id: 0,
				maxHp: 100,
				def: 3,
				speed: 1,
				moveFrame: 9,
				hitFrame: 1,
				dieFrame: 9,
				offsetX : 0 ,
				offsetY : 9 ,
				money : 10 ,
				item : [{name:"sword",probability:0.1},{name:"sapphireStaff",probability:0.05}] 
			});
			monsterMap['snail'] = snail ;

			var bat = common.createMonster({
				id: 1,
				maxHp: 150,
				def: 5,
				speed: 1.5,
				moveFrame: 2,
				hitFrame: 1,
				dieFrame: 4,
				dieDx : 25 ,
				offsetY : -5 ,
				offsetX : 0 ,
				attribute:[{
					name : "sky" ,
					ratio : 1.3 
				}]
			});
			monsterMap['bat'] = bat ;

			var ironhog = common.createMonster({
				id: 2,
				maxHp: 200,
				def: 10,
				speed: 1.3,
				moveFrame: 3,
				hitFrame: 1,
				dieFrame: 2,
				offsetY : -5 ,
				attribute:[{
					name : "physical" ,
					ratio : 0.5
				},{
					name : "magic" ,
					ratio : 1.5 
				}]
			});
			monsterMap['ironhog'] = ironhog ;

			var orangeMushroom = common.createMonster({
				id: 3,
				maxHp: 500,
				def: 5,
				speed: 1.5,
				moveFrame: 3,
				hitFrame: 1,
				dieFrame: 3,
				offsetX : 0 ,
				offsetY : -10 ,
				hitDy : 25 ,
				money : 25 ,
				item : [{name:"sword",probability:0.1},{name:"sapphireStaff",probability:0.05}] 
			});
			monsterMap['orange-mushroom'] = orangeMushroom ;

			var shroom = common.createMonster({
				id: 4,
				maxHp: 350,
				def: 3,
				speed: 1.8,
				moveFrame: 4,
				hitFrame: 1,
				dieFrame: 4,
				offsetX : 0 ,
				offsetY : 5 ,
				hitDy : 25 ,
				money : 20 ,
				item : [{name:"sword",probability:0.1},{name:"sapphireStaff",probability:0.05}] 
			});
			monsterMap['shroom'] = shroom ;

		},
		createMonsterSkill : function(){

		},
		createMonster : function(data){
			var monster = {
				state : "move" ,
				id : data.id || 0 ,
				x : data.x || 0 ,
				y : data.y || 370 ,
				money : data.money || 0 ,
				nowHp : data.nowHp || data.maxHp ,
				maxHp : data.maxHp || 0 ,
				def : data.def || 0 ,
				speed : data.speed || 0 ,	//per 20ms 
				skill : data.skill || [] ,
				effect : data.effect || [] ,
				hitAble : data.hitAble || true ,
				tempSpeed : data.speed || 0 ,
				tempDef : data.def || 0 ,
				attribute : data.attribute || [] ,
				offsetX : data.offsetX || 0 ,
				offsetY : data.offsetY || 0 ,
				hpDx : data.hpDx || 0 ,
				hpDy : data.hpDy || 0 ,
				item : data.item || [] ,
				hitDy : data.hitDy || 0 ,
				isFall : false ,
				move : {
					nowFrame : 0 ,
					totalFrame : data.moveFrame ,
					canvas : null 
				} ,
				hit : {
					nowFrame : 0 ,
					totalFrame : data.hitFrame ,
					canvas : null 
				},
				die : {
					nowFrame : 0 ,
					totalFrame : data.dieFrame ,
					canvas : null 
				} ,
				init : function(){
					this.setStateCanvas();
					return this ;
				},
				showNumberDamage : function(damage,c){
					var d = damage.toString();
					var dx = 0 ;
					var dy = 0 ;
					if ( c === false ){
						var w = canvasMap["number_damage_0"].width ; 
						var h = canvasMap["number_damage_0"].height ;
						for ( var i = 0 ; i < d.length ; i ++ ){
							common.createAnimation({
								canvas : "number_damage_"+d[i] ,
								x : this.x + dx - w*d.length / 2  + this.speed*15  , 
								y : this.y + dy - h + this.offsetY,
								dy : -1 ,
								dx : 0 , 
								nowFrame : 0 ,
								delay : 30 ,
								timer : 0 ,
								totalFrame : 1 ,
								width : canvasMap["number_damage_"+d[i]].width , 
								height : canvasMap["number_damage_"+d[i]].height  
							});
							dx += 30 ;
							dy /= 4 ;
							dy = (1 - dy) * 4  ;
						}
					} else {				
						var w = canvasMap["number_damage2_0"].width ; 
						var h = canvasMap["number_damage2_0"].height ;
						common.createAnimation({
							canvas : "number_damage2_10" ,
							x : this.x + dx - w*d.length / 2  + this.speed * 15,
							y : this.y + dy - h + this.offsetY,
							dy : -1 ,
							dx : 0 , 
							nowFrame : 0 ,
							delay : 30 ,
							timer : 0 ,
							totalFrame : 1 ,
							width : canvasMap["number_damage2_10"].width , 
							height : canvasMap["number_damage2_10"].height  
						});
						for ( var i = 0 ; i < d.length ; i ++ ){
							common.createAnimation({
								canvas : "number_damage2_"+d[i] ,
								x : this.x + dx - w*d.length / 2 + this.speed*15,
								y : this.y + dy - h + this.offsetY,
								dy : -1 ,
								dx : 0 , 
								nowFrame : 0 ,
								delay : 30 ,
								timer : 0 ,
								totalFrame : 1 ,
								width : canvasMap["number_damage2_"+d[i]].width , 
								height : canvasMap["number_damage2_"+d[i]].height  
							});
							dx += 30 ;
							dy /= 4 ;
							dy = (1 - dy) * 4  ;
						}		
					}
					
				},
				isDie : function(){
					if ( this.isFall === false ){
						var di = 0 ;
						var tempAnimation = [] ;
						for ( var i = 0 ; i < this.item.length ; i ++ ){
							var r = Math.random();
							if ( r < this.item[i].probability ){
								var item = common.clone(itemMap[this.item[i].name]) ;
								tempItemList.push(item);
								tempAnimation.push({
									canvas : item.canvas ,
									x : this.x + di + 20,
									y : this.y - 10 ,
									nowFrame : 0 ,
									delay : 70 ,
									timer : 0 ,
									totalFrame : 0,
									width : canvasMap[item.canvas].width , 
									height : canvasMap[item.canvas].height ,
									ratio : 0.7 ,
									effect : [{type:"rotate",speed:17,remain:30},{type:"gravity",remain:30,vy:-10}] ,
									degree : 45 
								});
								di += 50 ;
							}
						}
						var r = Math.random();
						if ( r <= 0.5 ){
							tempAnimation.push({
								canvas : "money" ,
								x : this.x + di + 20 ,
								y : this.y - 8 ,
								nowFrame : 0 ,
								delay : 70 ,
								timer : 0 ,
								totalFrame : 0,
								width : canvasMap["money"].width / 4 , 
								height : canvasMap["money"].height ,
								ratio : 1 ,
								effect : [{type:"rotate",speed:17,remain:30},{type:"gravity",remain:30,vy:-10}] ,
								degree : 45 
							});
							tempMoney += this.money ;
						}
						for ( var i = 0 ; i < tempAnimation.length ; i ++ ){
							tempAnimation[i].x -= tempAnimation.length * 50 / 2  ;
							common.createAnimation(tempAnimation[i]);
						}
					}
					this.isFall = true ;
					this.nowHp = 0 ;
					this.hitAble = false ;
					this.state = "die" ;
				},
				isMove : function(){
					if ( preStage.isGameOver === true || preStage.isGameWin === true )
						return ;
					this.x += this.tempSpeed ;
					if ( this.x >= canvasWidth ){
						preStage.isGameOver = true ;
					}
				},
				showMonster : function(){
					var state = this.state ;
					var nowFrame = this[state].nowFrame ;
					var totalFrame = this[state].totalFrame ;
					var canvas = this[state].canvas ;
					var w = this[state].w ;
					var h = this[state].h ;
					var offsetX = this[state].offsetX || 0 , offsetY = this[state].offsetY || 0 ;
					gameCtx.drawImage(canvasMap[canvas],w*nowFrame,0,w,h,this.x-w/2,this.y+this.offsetY-h/2,w,h);
					if ( this[state].timer < this[state].delay  ){
						this[state].timer ++ ;
					} else if ( this[state].timer >= this[state].delay  ){
						this[state].nowFrame  ++ ;
						this[state].timer = 0 ;
						if ( this[state].nowFrame >= this[state].totalFrame ){
							this[state].nowFrame = 0 ;
							if ( this.nowHp > 0 )
								this.state = "move" ;
							else {
								monsterList.splice(monsterList.indexOf(this),1) ;
							}
						}
					}
					
				},
				showHp : function(){
					var state = this.state ;
					var w = this["move"].w ;
					var h = this["move"].h ;
					gameCtx.drawImage(canvasMap["hp_bar"],this.x-canvasMap["hp_bar"].width/2,this.y-25+this.offsetY-h/2);
					gameCtx.drawImage(canvasMap["hp"],this.x-canvasMap["hp_bar"].width/2+3,this.y-22.5+this.offsetY-h/2,canvasMap["hp"].width*(this.nowHp/this.maxHp)*46,canvasMap["hp"].height+0.5);
					//gameCtx.fillText(this.nowHp+ '/' + this.maxHp ,this.x,this.y-10) ;
				},
				calculateDamage : function(result){
					var d = this.tempDef * 0.06 / ( 1+0.06*this.tempDef) ;
					return Math.round(result * (1 - d)) ;
				},
				isHit : function(data){
					var dx = data.dx || 0 , dy = data.dy || 0 ;
					this.state = "hit" ;
					var atk = data.atk.result ;
					var state = data.atk.state ;
					var critical = false ;
					var type = data.type ; 
					var attackType = data.attackType || [] ;
					for ( var i = 0 ; i < state.length ; i ++ ){
						if ( state[i].name === "critical" ){
							critical = true ;
							break ;
						} else {							
							state[i].canvas = {
								canvas : type+"_hit_effect" ,
								x : data.hitEffectDx -  canvasMap[type+"_hit_effect"].width / data.totalFrame/2 + this.hpDx ,
								y : data.hitEffectDy+this.offsetY - this["move"].h/2 - canvasMap[type+"_hit_effect"].height/2,
								nowFrame : 0 ,
								delay : data.hitEffectDelay || 5 ,
								timer : 0 ,
								dx : data.hitEffectVx ,
								totalFrame : data.hitEffectFrame ,
								width : canvasMap[type+"_hit_effect"].width / data.totalFrame , 
								height : canvasMap[type+"_hit_effect"].height 
							}
							if ( state[i].name === "disorder" ){
								if ( this.effect.length === 0 ){
									this.effect.push(state[i]) ;
									this.refreshState();
								} else {
									for ( var j = 0 ; j < this.effect.length ; j ++ ){
										if ( this.effect[j].name === "disorder" ){
											this.effect[j].ratio = state[i].ratio ;
											this.refreshState();
											break ;
										} 
										if ( j === this.effect.length - 1 ){
											this.effect.push(state[i]) ;
											this.refreshState();
										}
									}
								}
							}
						} 
					}
					for ( var i = 0 ; i < this.attribute.length ; i ++ ){
						var name = this.attribute[i].name ;
						for ( var j = 0 ; j < attackType.length ; j ++ ){
							if ( attackType[j] === name ){
								atk *= this.attribute[i].ratio ;
								break ;
							}
						}
					}
					var damage = this.calculateDamage(atk)  ;					
					if ( damage < 0 && data.buff === undefined ){
						damage = 0 ;
					}
					this.nowHp -= damage ;
					if ( canvasMap[type+"_hit"] !== undefined ){
						common.createAnimation({
							canvas : type+"_hit" || data.canvas,
							x : this.x - canvasMap[type+"_hit"].width / data.totalFrame/2 + this.speed * 10 + dx , 
							y : this.y + this.offsetY - this["move"].h/2 + this.hitDy + dy - canvasMap[type+"_hit"].height/2 ,
							nowFrame : 0 ,
							delay : data.delay || 5 ,
							timer : 0 ,
							totalFrame : data.totalFrame ,
							width : canvasMap[type+"_hit"].width / data.totalFrame , 
							height : canvasMap[type+"_hit"].height 
						});
					}
					
					if ( damage >= 0 )
						this.showNumberDamage(damage,critical) ;

				},
				showAll : function(){
					this.showMonster();
					if ( this.state !== "die" )
						this.showHp();
					this.showState();
				},				
				setStateCanvas : function(){
					var w = canvasMap[monsterIdList[this.id]+"_move"].width ;
					var h = canvasMap[monsterIdList[this.id]+"_move"].height ;
					var canvas = canvasMap[monsterIdList[this.id]+"_move"] ;
					this.move = {
						nowFrame : 0 ,
						totalFrame : data.moveFrame ,
						w : w / data.moveFrame ,
						h : h ,
						canvas : monsterIdList[this.id]+"_move" ,
						delay : 10 ,
						timer : 0 ,
						offsetX : this.offsetX || 0 ,
						offsetY : this.offsetY || 0
					}
					var w = canvasMap[monsterIdList[this.id]+"_hit"].width ;
					var h = canvasMap[monsterIdList[this.id]+"_hit"].height ;
					var canvas = canvasMap[monsterIdList[this.id]+"_hit"] ;
					this.hit = {
						nowFrame : 0 ,
						totalFrame : data.hitFrame ,
						w : w / data.hitFrame ,
						h : h ,
						canvas : monsterIdList[this.id]+"_hit" ,
						delay : 10 ,
						timer : 0 ,
						offsetX : this.offsetX || 0 ,
						offsetY : this.offsetY || 0
					}

					var w = canvasMap[monsterIdList[this.id]+"_die"].width ;
					var h = canvasMap[monsterIdList[this.id]+"_die"].height ;
					var canvas = canvasMap[monsterIdList[this.id]+"_die"] ;
					this.die = {
						nowFrame : 0 ,
						totalFrame : data.dieFrame ,
						w : w / data.dieFrame ,
						h : h ,
						canvas : monsterIdList[this.id]+"_die" ,
						delay : 10 ,
						timer : 0 ,
						offsetX : data.dieDx || 0 ,
						offsetY : data.dieDy || 0
					}
				},
				refreshState : function(){
					this.tempDef = this.def ;
					for ( var i = 0 ; i < this.effect.length ; i ++ ){
						if ( this.effect[i].name === "disorder" ){
							this.tempDef = Math.round(this.tempDef*(1 - this.effect[i].ratio)) ;
						}
					}
				},
				showState : function(){
					for ( var i = 0 ; i < this.effect.length ; i ++ ){
						if ( this.effect[i].remain !== -1 ){
							if ( this.effect[i].remain === 0 ){
								this.effect.splice(i, 1) ;
								i -- ;
								continue ;
							} else {
								this.effect[i].remain -- ;
							}
						}
						if ( this.effect[i].canvas !== undefined && animationList.indexOf(this.effect[i].animation) === -1 ){
							this.effect[i].animation = common.clone(this.effect[i].canvas);
							this.effect[i].animation.x += this.x ;
							this.effect[i].animation.y += this.y ;
							common.createAnimation(this.effect[i].animation);
						}

					}
				}
			}.init();
			return monster
		},
		createSoldier : function(data){
			var soldier = {
				description : data.description || "" ,
				name : data.name || "" ,
				state : "stand" ,
				stand : {
					nowFrame : 0 ,
					totalFrame : 0 ,
					canvas : null 
				} ,
				attack : {
					nowFrame : 0 ,
					totalFrame : 0 ,
					canvas : null 
				},
				id : data.id || 0 , // role type
				atk : data.atk || 0 ,
				tempAtk : data.atk || 0 ,
				itemAtk : 0 ,
				speed : data.speed || 0 ,  // 1 attack need sec
				tempSpeed : data.speed || 0 ,
				range : data.range || 0 ,
				level : data.level || 1 ,
				effectTotalFrame : data.effectTotalFrame || 1 ,
				transferLevel : data.transferLevel || 99999 ,
				nowExp : 0 ,
				goalExp : 10 ,
				isPicked : data.isPicked || false ,
				point : 0 ,	// remain skill point
				skill : data.skill || [] ,
				atkTimer : 0 , 
				target : [] ,
				attackEffectDx : data.attackEffectDx || 0,
				attackEffectDy : data.attackEffectDy || 0,
				hitFrame : data.hitFrame ,
				effect : data.effect || [] ,
				attackType : data.attackType || [] ,
				tempAttackType : data.attackType || [] ,
				hitDx : data.hitDx || 0 ,
				hitDy : data.hitDy || 0 ,
				standOffsetX : data.standOffsetX || 0 ,
				standOffsetY : data.standOffsetY || 0 ,
				attackOffsetX : data.attackOffsetX || 0 ,
				attackOffsetY : data.attackOffsetY || 0 ,
				attackEffectVx : data.attackEffectVx || 0 ,
				attackEffectVy : data.attackEffectVy || 0 ,
				attackEffectDelay : data.attackEffectDelay || 10 ,
				equipment : {} ,
				upgrade : data.upgrade ,
				init : function(){
					this.setStateCanvas();
					return this ;
				},
				refreshState : function(){
					this.itemAtk = 0 ;
					for ( var e in this.equipment ){
						if ( this.equipment[e] !== undefined )
							this.equipment[e].f(this);
					}
					this.tempAtk = this.atk + this.itemAtk ;
				},
				reset : function(){
					this.state = "stand" ;
					this.effect = [] ;
					this.tempSpeed = this.speed ;
					this.atkTimer = this.stand.timer = this.stand.nowFrame = this.attack.timer = this.attack.nowFrame = 0 ;
					this.attack.animationBoolean = false ;
					for ( var i = 0 ; i < this.skill.length ; i ++ ){
						this.skill[i].reset(); 
					}
				},
				equip : function(index){
					var item = itemList[index] ;
					var type = item.type ;
					if ( this.equipment[type] !== undefined ){
						itemList[index] = this.equipment[type] ;
					} else {
						itemList.splice(index,1);
					}
					this.equipment[type] = common.clone(item) ;
					town.refreshItemList();
					this.refreshState();
				},
				removeEquip : function(type){
					var item = this.equipment[type] ;
					itemList.push(common.clone(this.equipment[type]));
					this.equipment[type] = undefined ;
					town.refreshItemList();
					town.initCharacterObject();
					this.refreshState();
				},
				isAttack : function(x,y){
					if ( preStage.isGameOver === true || preStage.isGameWin === true )
						return ;
					for ( var i = 0 ; i < this.skill.length ; i ++ ){
						if ( this.skill[i].nowLevel > 0 ){
							if (  this.skill[i].type === "active" && ( this.state === "stand" || this.state === this.skill[i].canvas.state ) && this.atkTimer <= 0  ){
								this.tempAttackType = this.attackType ;
								var result = this.skill[i].f(x,y,this.range,this.state,this[this.state],this.tempAtk,this.effect,this.skill[i].ratio,this.tempAttackType) ;
								var state = result.state ;
								var done = result.done ;
								if ( state === "stand" && done === true ){
									this.atkTimer = this.speed ;
								}
								this.state = state ;
							} else if ( this.skill[i].type === "passive" ){
								if ( this.skill[i].isInit === false ){
									this.skill[i].init(this.effect);
								}
							} else {
								var result = this.skill[i].f(x,y,this.range,"null",this[this.state],this.tempAtk) ;
							}
						}
					}
					if ( this.state === "attack" ){
						if ( this.attack.animationBeginFrame === this.attack.nowFrame && this.attack.animationBoolean === false ){
							common.createAnimation({
								canvas : roleList[this.id]+"_attack_effect" ,
								x : x + this.attackEffectDx ,
								y : y + this.attackEffectDy ,
								nowFrame : 0 ,
								timer : 0 ,
								delay : this.attackEffectDelay ,
								dx : this.attackEffectVx ,
								dy : this.attackEffectVy ,
								totalFrame : this.effectTotalFrame ,
								width : canvasMap[roleList[this.id]+"_attack_effect"].width / this.effectTotalFrame , 
								height : canvasMap[roleList[this.id]+"_attack_effect"].height  
							});
							this.attack.animationBoolean = true ;
						}
						if ( this.attack.effectFrame === this.attack.nowFrame ){
							this.tempAttackType = this.attackType ;
							for ( var i = 0 ; i < this.target.length ; i ++  ){
								var atkSum = { result : this.tempAtk , state : [] } ;
								for ( var j = 0 ; j < this.effect.length ; j ++ ){
									this.effect[j].f(atkSum);
								}
								this.target[i].isHit({id:this.id,atk:atkSum,dx:this.hitDx,dy:this.hitDy,totalFrame:this.hitFrame,type:roleList[this.id],attackType:this.tempAttackType}) ;
							}
							this.target = [] ;
						}
					} 
					if ( this.state === "stand" || this.state === "attack" ){
						if ( this[this.state].timer < this[this.state].delay  ){
							this[this.state].timer ++ ;
						} else if ( this[this.state].timer >= this[this.state].delay  ){
							this[this.state].nowFrame  ++ ;
							this[this.state].timer = 0 ;
							if ( this[this.state].nowFrame >= this[this.state].totalFrame ){
								this[this.state].nowFrame = 0 ;
								this.attack.animationBoolean = false ;
								this.state = "stand" ;
							}
						}
					}
					if ( this.state !== "attack" && this.atkTimer >= 0 ){
						this.atkTimer -- ; 
						return ;
					} 
					if ( this.state === "stand" ){
						for ( var i = 0 ; i < monsterList.length ; i ++ ){
							if ( Math.abs(monsterList[i].x-x) <= this.range && monsterList[i].hitAble === true ){
								this.atkTimer = this.speed ;
								this.attack.timer = 0 ;
								this.state = "attack" ;					
								this.target.push(monsterList[i]);
								return ;
							}
						}	
					}				
				},
				setStateCanvas : function(){
					var w = canvasMap[roleList[this.id]+"_stand"].width ;
					var h = canvasMap[roleList[this.id]+"_stand"].height ;
					var canvas = canvasMap[roleList[this.id]+"_stand"] ;
					this.stand = {
						nowFrame : 0 ,
						totalFrame : data.standFrame ,
						w : w / data.standFrame ,
						h : h ,
						canvas : roleList[this.id]+"_stand" ,
						delay : 10 ,
						timer : 0 ,
						offsetX : this.standOffsetX ,
						offsetY : this.standOffsetY
					}

					var w = canvasMap[roleList[this.id]+"_attack"].width ;
					var h = canvasMap[roleList[this.id]+"_attack"].height ;
					var canvas = canvasMap[roleList[this.id]+"_attack"] ;
					this.attack = {
						nowFrame : 0 ,
						totalFrame : data.attackFrame ,
						w : w / data.attackFrame ,
						h : h ,
						canvas : roleList[this.id]+"_attack" ,
						delay : 10 ,
						timer : 0 , 
						effectFrame : data.attackEffectFrame ,
						animationFrames : data.attackAnimationFrame ,
						animationBeginFrame : data.attackAnimationBeginFrame ,
						animationBoolean : false ,
						offsetX : this.attackOffsetX ,
						offsetY : this.attackOffsetY
					}
					for ( var i = 0 ; i < this.skill.length ; i ++ ){
						if ( this.skill[i].type === "active"){
							this[this.skill[i].canvas.state] = this.skill[i].canvas ;
						}
					}
				}
			}.init();
			return soldier ;
		},
		createEffect : function(data){
			var effect = {
				target : data.target || 0 ,
				probability : data.probability || 1 ,
				ratio : data.ratio || 1 ,
				f : data.f 
			}
			return effect ;
		},
		createSkill : function(data){
			var skill = {
				name : data.name || "" ,
				description : data.description || "" ,
				state : data.state || "" ,
				needLevel : data.needLevel || 1 ,
				needSkill : data.needSkill || [] ,
				nowLevel : data.nowLevel || 0 ,
				topLevel : data.topLevel || 99 ,
				effect : data.effect || [] ,
				type : data.type || "passive" ,
				f : data.f ,
				effectRatio : data.effectRatio || -1 ,
				timer : data.timer || 0 ,
				speed : data.speed || 0 ,
				target : data.target || [] ,
				isInit : false ,
				ratio : data.ratio || 1 ,
				ratioUpgrade : data.ratioUpgrade || 0 ,
				probability : data.probability || 1 ,
				probabilityUpgrade : data.probabilityUpgrade || 0 ,
				canvasName : data.canvasName || null ,
				upgrade : data.upgrade || null 
			}
			if ( data.canvas !== undefined ){
				skill["canvas"] = data.canvas ;
				skill.reset = function(){
					this.timer = this.speed ;
					this.target = [] ;
					this.canvas.nowFrame = 0 ;
					this.canvas.timer = 0 ;
					for ( var i = 0 ; i < this.canvas.effectBoolean.length ; i ++ ){
						this.canvas.effectBoolean[i] = false ;
					} 
					for ( var i = 0 ; i < this.canvas.animationBoolean.length ; i ++ ){
						this.canvas.animationBoolean[i] = false ;
					} 
				}
			} else {
				skill["init"] = data.init ;
				skill.reset = function(){
					this.isInit = false ;
				}
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
		setMouseEvent : function(over,click,dblclick){
			document.onclick = click ;
			document.onmousemove = over ;
			if ( dblclick !== undefined ){
				document.ondblclick = dblclick ;
			} else {
				document.ondblclick = function(){
					;
				}
			}
		} ,
		setMouseEnterNone : function(){
			document.body.style.cursor = "default" ;
			mouseOver = 'none' ;
		},
		isMouseEnterRange : function(temp,obj,offsetX,offsetY,ratio){
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  
				var tempX = temp.x , tempY = temp.y ;
				var x = obj.x , y = obj.y , sizeX = obj.w , sizeY = obj.h ;
				var w = ratio.w , h = ratio.h ;
				if ( Math.abs( (tempX - (x + sizeX / 2) * w / canvasWidth  ) - ((offsetX - w) / 2) )  <=  sizeX / 2 * w / canvasWidth &&
					 Math.abs( (tempY - (y + sizeY / 2 ) * h / canvasHeight + 12 ) - ((offsetY - h ) / 2) )  <=  sizeY / 2 * h / canvasHeight   ) {
					return true ;
				} 
				return false ;
			} else {
				var tempX = temp.x , tempY = temp.y ;
				var x = obj.x , y = obj.y , sizeX = obj.w , sizeY = obj.h ;
				var w = ratio.w , h = ratio.h ;
				if ( Math.abs( (tempX - (x + sizeX / 2) *  window.innerWidth / canvasWidth  )  )  <=  sizeX / 2 * window.innerWidth / canvasWidth &&
					 Math.abs( (tempY - (y + sizeY / 2 ) * window.innerHeight / canvasHeight )  )  <=  sizeY / 2 * window.innerHeight / canvasHeight   ) {
					return true ;
				} 
				return false ;
			}
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

			for ( var i = 0 ; i < 8 ; i ++ ){
				mySoldierList.push(common.clone(soldierMap['beginner']));
			}
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
			/*
			common.initSoldierMap();
			common.initMonsterMap();
			common.initmySoldierList();
			*/
			//
			loadPage.init();
			//
			common.repaint();
		},
		repaint : function(){
			try {
				if ( nowPage === 'loadPage' ){
					loadPage.showAll();
				} else if ( nowPage === "login" ){
					login.showAll();
				} else if ( nowPage === 'preStage' ){
					preStage.showAll();
				} else if ( nowPage.match('stage') !== null ){
					stage[nowStage].showAll();
					common.save();
				} else if ( nowPage === "town" ){
					town.showAll();
					common.save();
				}
				common.drawObject(fullscreen);
				setting.setMouseEvent(setting.mouseOver,setting.mouseClick);
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
				fullscreen = { x : 1220 , y : 20 , canvas : "fullscreen" , w : canvasMap["fullscreen"].width ,h : canvasMap["fullscreen"].height } ;		
				common.initSoldierMap();
				common.initMonsterMap();
				common.initItemMap();
				common.initMySoldierList();
				common.initNumberDamage();
				login.init();
				nowPage = 'login' ;
			}
		}
	}

	var preStage = {
		isShowChooseSoldier : false ,
		isShowInfo : false ,
		isInitInvoke : false ,
		isPickSoldier : null ,
		nowPickInvoke : null ,
		isGameStart : false ,
		isGameWin : false ,
		isGameOver : false ,
		resetButton : {} ,
		confirmButton : {} ,
		quitButton : {} ,
		restartButton : {} ,
		infoButton : {} ,
		init : function(){
			preStage.pickSoldier.pickSoldierList = [] ;
			this.isGameStart = false ;
			this.isShowChooseSoldier = false ;
			this.isShowInfo = false ;
			this.isInitInvoke = false ;
			this.isPickSoldier = null ;
			this.nowPickInvoke = null ;
			this.isGameWin = false ;
			this.isGameOver = false ;
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				//mySoldierList[i].isPicked = false ;
				mySoldierList[i].reset();
			} 

			preStage.initBackground();
			preStage.initButton();
			//preStage.initInvoke();
			//
			stage[nowStage].initMonsterList();
			preStage.monsterInfo.init();	
			animationList = [] ;
		},
		setMouseEvent : function(a, b) {
	        document.onclick = b;
	        document.onmousemove = a;
	        //document.ontouchend = b
    	},
		initBackground : function(){
			background = { x:0 , y:0 , w: canvasMap['background'].width , h: canvasMap['background'].height} ;
		},
		initButton : function(){
			preStage.resetButton = { x : 610 , y : 700 , w : canvasMap['reset'].width , h : canvasMap['reset'].height } ;
			preStage.quitButton = { x : 810 , y : 700 , w : canvasMap['quit'].width , h : canvasMap['quit'].height } ;
			preStage.confirmButton = { x : 410 , y : 700 , w : canvasMap['confirm'].width , h : canvasMap['confirm'].height } ;
			preStage.restartButton = { x : 410 , y : 700 , w : canvasMap['restart'].width , h : canvasMap['restart'].height } ;
			preStage.infoButton = { x : 1110 , y : 695 , w : canvasMap['info'].width / 12, h : canvasMap['info'].height , nowFrame : 0 , totalFrame : 12 , timer : 0 , delay : 5 } ;
		},
		initInvoke : function(){
			if ( preStage.isInitInvoke === true )
				return ;
			invokeList = [] ;
			for ( var i = 0 ; i < 6 ; i ++ ){
				invokeList.push({x:i*210+90-24,y:roadTopY-54,w:canvasMap['invoke'].width/invokeAnimationTotalFrame,h:canvasMap['invoke'].height,soldier:{id:-1}});
				invokeList.push({x:i*210+170-24,y:roadBottomY-54,w:canvasMap['invoke'].width/invokeAnimationTotalFrame,h:canvasMap['invoke'].height,soldier:{id:-1}});
			}
			preStage.isInitInvoke = true ;
		},
		toStage : function(){
			stage[nowStage].init();
			nowPage = nowStage ;
		},
		setMouseEnterInvokeOver: function(index){
			if ( preStage.isGameStart === false ){
				document.body.style.cursor = "pointer" ;
				mouseOver = 'invoke' + index ;
			}
		},
		setMouseEnterInvokeClick :function(index){
			if ( preStage.isGameStart === false ){
				preStage.pickSoldier.init();
				preStage.nowPickInvoke = index ;
				document.body.style.cursor = "default" ;
			}
		},
		setMouseEnterResetButtonOver: function(){
			if ( preStage.isGameStart === false ){
				document.body.style.cursor = "pointer" ;
				mouseOver = 'resetButton' ;
			}
		},
		setMouseEnterConfirmButtonOver: function(){
			document.body.style.cursor = "pointer" ;
			mouseOver = 'confirmButton' ;
		},
		setMouseEnterConfirmButtonClick: function(){
			tempItemList = [] ;
			tempMoney = 0 ;
			document.body.style.cursor = "default" ;
			monsterList = [];
			nowPage = "preStage" ;
			preStage.isGameStart = false ;
			preStage.isGameWin = false ;
			preStage.isGameOver = false ;
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				//mySoldierList[i].isPicked = false ;
				mySoldierList[i].reset();
			} 
			animationList = [] ;
			preStage.isInitInvoke = false ;
			//preStage.initInvoke();	
			stage[nowStage].initMonsterList();	
			preStage.toStage();
		},		
		setMouseEnterQuitButtonOver: function(){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterQuitButtonClick: function(){
			document.body.style.cursor = "default" ;
			nowPage = "town" ;
			town.init();

		},
		setMouseEnterInfoButtonOver: function(){
			if ( preStage.isGameStart === false ){
				document.body.style.cursor = "pointer" ;
				mouseOver = 'infoButton' ;
			}
		},
		setMouseEnterInfoButtonClick: function(){
			if ( preStage.isGameStart === false ){
				document.body.style.cursor = "default" ;
				preStage.isShowInfo = true ;
			}
		},
		setMouseEnterResetButtonClick: function(){
			tempItemList = [] ;
			tempMoney = 0 ;
			if ( preStage.isGameStart === false ){
				for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
					mySoldierList[i].isPicked = false ;
				} 
				preStage.isInitInvoke = false ;
				preStage.initInvoke();	
			}
		},
		setMouseEnterRestartButtonClick: function(){
			tempItemList = [] ;
			tempMoney = 0 ;
			monsterList = [];
			nowPage = "preStage" ;
			preStage.isGameStart = false ;
			preStage.isGameWin = false ;
			preStage.isGameOver = false ;
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				//mySoldierList[i].isPicked = false ;
				mySoldierList[i].reset();
			} 
			animationList = [] ;
			preStage.isInitInvoke = false ;
			//preStage.initInvoke();	
			stage[nowStage].initMonsterList();	

		},
		setMouseEnterSoldierOver: function(index){
			document.body.style.cursor = "pointer" ;
			mouseOver = 'soldier' + index ;
		},
		setMouseEnterSoldierClick: function(index){
			document.body.style.cursor = "pointer" ;
			preStage.isPickSoldier = index ;
			mouseOver = "none" ;
		},
		detectMouseEnterOver : function(temp,offsetX,offsetY,ratio){
			for ( var i = 0 ; i < invokeList.length ; i ++ ){
				if ( invokeList[i].soldier.id === -1 &&
					common.isMouseEnterRange(temp,invokeList[i],offsetX,offsetY,ratio) ){
					preStage.setMouseEnterInvokeOver(i) ;
					return ;
				} else if (invokeList[i].soldier.id !== -1 &&
					common.isMouseEnterRange(temp,invokeList[i],offsetX,offsetY,ratio) ) {
					preStage.setMouseEnterSoldierOver(i) ;
					return ;
				}
			}
			if ( common.isMouseEnterRange(temp,preStage.resetButton,offsetX,offsetY,ratio) ){
				preStage.setMouseEnterResetButtonOver() ;
				return ;
			} else if ( common.isMouseEnterRange(temp,preStage.confirmButton,offsetX,offsetY,ratio) ){
				if ( preStage.isGameStart === false )
					preStage.setMouseEnterConfirmButtonOver() ;				
				else if ( preStage.isGameWin === true && stage.exp > 0 ){
					return ;
				} else {
					if ( preStage.isGameStart === true )
						preStage.setMouseEnterConfirmButtonOver() ;
				}
				return ;
			} else if ( common.isMouseEnterRange(temp,preStage.infoButton,offsetX,offsetY,ratio) ){
				preStage.setMouseEnterInfoButtonOver() ;
				return ;
			} else if ( common.isMouseEnterRange(temp,preStage.quitButton,offsetX,offsetY,ratio) ){
				if ( preStage.isGameWin === true && stage.exp > 0 ){
					return ;
				}
				preStage.setMouseEnterQuitButtonOver() ;
				return ;
			} 
			common.setMouseEnterNone();
		},
		detectMouseEnterClick : function(temp,offsetX,offsetY,ratio){
			for ( var i = 0 ; i < invokeList.length ; i ++ ){
				if ( invokeList[i].soldier.id === -1 &&
					common.isMouseEnterRange(temp,invokeList[i],offsetX,offsetY,ratio) ){
					preStage.setMouseEnterInvokeClick(i) ;
					return ;
				} else if (invokeList[i].soldier.id !== -1 &&
					common.isMouseEnterRange(temp,invokeList[i],offsetX,offsetY,ratio) ){
					preStage.setMouseEnterSoldierClick(i) ;
					return ;
				}
			}
			if ( common.isMouseEnterRange(temp,preStage.resetButton,offsetX,offsetY,ratio) ){
				preStage.setMouseEnterResetButtonClick() ;
				return ;
			} else if ( common.isMouseEnterRange(temp,preStage.confirmButton,offsetX,offsetY,ratio) ){
				if ( preStage.isGameStart === false )
					preStage.setMouseEnterConfirmButtonClick() ;				
				else if ( preStage.isGameWin === true && stage.exp > 0 ){
					return ;
				} else {
					if ( preStage.isGameStart === true )
						preStage.setMouseEnterRestartButtonClick() ;
				}
				return ;
			} else if ( common.isMouseEnterRange(temp,preStage.infoButton,offsetX,offsetY,ratio) ){
				preStage.setMouseEnterInfoButtonClick() ;
				return ;
			} else if ( common.isMouseEnterRange(temp,preStage.quitButton,offsetX,offsetY,ratio) ){				
				if ( preStage.isGameWin === true && stage.exp > 0 ){
					return ;
				}
				preStage.setMouseEnterQuitButtonClick() ;
				return ;
			}
			preStage.isPickSoldier = null ;
			common.setMouseEnterNone();
		},
		mouseOver :function(e){
			var info = common.getSizeInfo(e) ;
			preStage.detectMouseEnterOver(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		mouseClick: function(e){
			var info = common.getSizeInfo(e) ;
			preStage.detectMouseEnterClick(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		showInvoke :function(stage){
			for ( var i = 0 ; i < invokeList.length ; i ++ ){
				if ( invokeList[i].soldier.id === -1 ){
					gameCtx.drawImage(canvasMap['bg_'+stage+"_stand"],invokeList[i].x+24,invokeList[i].y+57+54);
					var w = canvasMap['invoke'].width / invokeAnimationTotalFrame ;
					var h = canvasMap['invoke'].height ;
					if ( preStage.isGameStart === false )
						gameCtx.drawImage(canvasMap['invoke'],invokeAnimationNowFrame*w,0,w,h,invokeList[i].x,invokeList[i].y,w,h);

					//gameCtx.drawImage(canvasMap['invoke'],invokeAnimationNowFrame*w,0,w,h,invokeList[i].x-24,invokeList[i].y-54,w,h);

				} else {
					gameCtx.drawImage(canvasMap['bg_'+stage+"_stand"],invokeList[i].x,invokeList[i].y+57);
					var state = invokeList[i].soldier.state ;
					var nowFrame = invokeList[i].soldier[state].nowFrame ; 
					var canvas = invokeList[i].soldier[state].canvas ;
					var w = invokeList[i].soldier[state].w ;
					var h = invokeList[i].soldier[state].h ;
					gameCtx.drawImage(canvasMap[canvas],w*nowFrame,0,w,h,invokeList[i].x+invokeList[i].soldier[state].offsetX,invokeList[i].y+invokeList[i].soldier[state].offsetY,w,h);

				}
			}
			if ( preStage.isGameStart === false ){
				if ( invokeAnimationTimer <= invokeAnimationDelay ){
					invokeAnimationTimer ++ ;
				} else {
					invokeAnimationTimer = 0 ;
					invokeAnimationNowFrame ++ ;
					if ( invokeAnimationNowFrame >= invokeAnimationTotalFrame ){
						invokeAnimationNowFrame = 0 ;
					}
				}
			}
		},
		showBackground : function(stage){
			for ( var i = 0 ; i < 3 ; i ++ ){
				gameCtx.drawImage(canvasMap['bg_'+stage+"_back_top"],i*canvasMap['bg_'+stage+"_back_top"].width,-130);
			} 
			for ( var i = 0 ; i < 2 ; i ++ ){
				gameCtx.drawImage(canvasMap['bg_'+stage+"_back_bottom"],i*canvasMap['bg_'+stage+"_back_bottom"].width,100);
				gameCtx.drawImage(canvasMap['bg_'+stage+"_back_bottom"],i*canvasMap['bg_'+stage+"_back_bottom"].width-canvasMap['bg_'+stage+"_back_bottom"].width/2,200);
			} 
			gameCtx.drawImage(canvasMap['bg_'+stage+"_front"],0,-115);
			for ( var i = 0 ; i < 5 ; i ++ ){
				gameCtx.drawImage(canvasMap['bg_'+stage+"_path_top"],i*canvasMap['bg_'+stage+"_path_top"].width,380);
				gameCtx.drawImage(canvasMap['bg_'+stage+"_path_mid"],i*canvasMap['bg_'+stage+"_path_mid"].width,canvasMap['bg_'+stage+"_path_top"].height+380);
				gameCtx.drawImage(canvasMap['bg_'+stage+"_path_bottom"],i*canvasMap['bg_'+stage+"_path_bottom"].width,canvasMap['bg_'+stage+"_path_top"].height+canvasMap['bg_'+stage+"_path_mid"].height+380);
			}
		},
		showButton : function(){
			if ( preStage.isGameStart === false )
				gameCtx.drawImage(canvasMap['reset'],preStage.resetButton.x,preStage.resetButton.y);
			if ( preStage.isGameStart === false )
				gameCtx.drawImage(canvasMap['confirm'],preStage.confirmButton.x,preStage.confirmButton.y);
			if ( preStage.isGameWin === true && stage.exp > 0 ){
				;
			} else {
				if ( preStage.isGameStart === true )
					gameCtx.drawImage(canvasMap['restart'],preStage.restartButton.x,preStage.restartButton.y);
				gameCtx.drawImage(canvasMap['quit'],preStage.quitButton.x,preStage.quitButton.y);
				if ( preStage.isGameWin === true ){
					if ( parseInt(nowStage.substring(5)) > doneStage ){
						doneStage = parseInt(nowStage.substring(5)) ;
					}
					itemList = itemList.concat(tempItemList);
					tempItemList = [] ;
					money += tempMoney ;
					tempMoney = 0 ;
				}
			}
			if ( preStage.isGameStart === false ){
				gameCtx.drawImage(canvasMap['info'],preStage.infoButton.nowFrame*preStage.infoButton.w,0,preStage.infoButton.w,preStage.infoButton.h,preStage.infoButton.x,preStage.infoButton.y,preStage.infoButton.w,preStage.infoButton.h);
				common.loopAnimation(preStage.infoButton);
			}
		},
		showAll : function(){
			common.setMouseEvent(preStage.mouseOver,preStage.mouseClick);
			var s = parseInt(nowStage.substring(5)) ;
			s = parseInt((s - 1)/ 5) + 1 ;
			preStage.showBackground("stage"+s);
			preStage.showDescription();
			preStage.showButton();
			preStage.showInvoke("stage"+s);
			if ( preStage.isShowChooseSoldier === true )
				preStage.pickSoldier.showAll() ;
			else if ( preStage.isShowInfo === true ){
				preStage.monsterInfo.showAll() ;
			}
			stage.soldierEvent();
		},
		showDescription : function(){
			//gameCtx.drawImage(canvasMap['description'],0,600);
		},
		pickSoldier : {
			pickSoldierList : [] ,
			closeButton : { } ,
			chooseBack : {} ,
			init : function(){
				preStage.isShowChooseSoldier = true ;
				preStage.pickSoldier.pickSoldierList = [] ;
				preStage.pickSoldier.initSoldierList();
				preStage.pickSoldier.initCloseButton();
			} ,
			initSoldierList : function(){
				var y1 = 189 , y2 = 396 ;
				var x = 0 , y = y1 ;
				for ( var i = 0 , j = 0 , k = 0 ; i < mySoldierList.length ; i ++ ){
					if ( mySoldierList[i].isPicked === false ){
						x = j*165+349  ;
						preStage.pickSoldier.pickSoldierList.push({x:x,y:y,w:canvasMap['choose_soldier_back'].width,h:canvasMap['choose_soldier_back'].height,soldierIndex:i});
						j ++ ;
						if ( j >= 4 ){
							 j = 0 , y = y2 ;
						}
					}
				}
			} , 
			initCloseButton : function(){
				this.chooseBack = { x : canvasWidth/2-canvasMap['choose_soldier'].width/2 , y : canvasHeight/2-canvasMap['choose_soldier'].height/2 , w : canvasMap['choose_soldier'].width , h : canvasMap['choose_soldier'].height , canvas : 'choose_soldier' } ;
				preStage.pickSoldier.closeButton = { x : 990 , y : 160 , w : canvasMap['close'].width , h : canvasMap['close'].height } ;
			},
			setMouseEnterPickSoldierOver : function(index){
				document.body.style.cursor = "pointer" ;
				mouseOver = "pickSoldier" + index ;
			},
			setInvokeToSoldier : function(index){
				invokeList[preStage.nowPickInvoke].index = index ;
				invokeList[preStage.nowPickInvoke].soldier = mySoldierList[index] ;
				preStage.pickSoldier.pickSoldierList.splice(index,1);
				//invokeList[preStage.nowPickInvoke].w = canvasMap[common.getRole(mySoldierList[index].id)+"_stand"].width/3;
				//invokeList[preStage.nowPickInvoke].h = canvasMap[common.getRole(mySoldierList[index].id)+"_stand"].height;
				mySoldierList[index].isPicked = true ;
				preStage.isShowChooseSoldier = false ;
				invokeList[preStage.nowPickInvoke].x += 24 ;
				invokeList[preStage.nowPickInvoke].y += 54 ;
				//preStage.init();
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
				if ( preStage.isShowChooseSoldier === true ){
					for ( var i = 0 ; i < preStage.pickSoldier.pickSoldierList.length ; i ++ ){
						if ( common.isMouseEnterRange(temp,preStage.pickSoldier.pickSoldierList[i],offsetX,offsetY,ratio) ){
							preStage.pickSoldier.setMouseEnterPickSoldierClick(preStage.pickSoldier.pickSoldierList[i].soldierIndex) ;
							return ;
						}
					}
					if ( common.isMouseEnterRange(temp,preStage.pickSoldier.closeButton,offsetX,offsetY,ratio) ){
						preStage.pickSoldier.setMouseEnterCloseButtonClick(i) ;
						return ;
					}
					if ( common.isMouseEnterRange(temp,preStage.pickSoldier.chooseBack,offsetX,offsetY,ratio) ){
						return ;
					}
					preStage.isShowChooseSoldier = false ;
					mouseOver = "none" ;
				} else if ( preStage.isShowInfo === true ){
					for ( var i = 0 ; i < preStage.monsterInfo.monsterInfoList.length ; i ++ ){
						if ( common.isMouseEnterRange(temp,preStage.monsterInfo.monsterInfoList[i],offsetX,offsetY,ratio) ){
							preStage.monsterInfo.setMouseEnterPickSoldierClick(i) ;
							return ;
						}
					}
					if ( common.isMouseEnterRange(temp,preStage.monsterInfo.closeButton,offsetX,offsetY,ratio) ){
						preStage.monsterInfo.setMouseEnterCloseButtonClick(i) ;
						return ;
					}
					if ( common.isMouseEnterRange(temp,preStage.monsterInfo.infoBack,offsetX,offsetY,ratio) ){
						return ;
					}
					preStage.isShowInfo = false ;
					if ( preStage.monsterInfo.isChooseMonster === false )
						mouseOver = "none" ;
				} else {
					common.setMouseEnterNone();
				}
			},
			detectMouseEnterOver : function(temp,offsetX,offsetY,ratio){
				if ( preStage.isShowChooseSoldier === true ){
					for ( var i = 0 ; i < preStage.pickSoldier.pickSoldierList.length ; i ++ ){
						if ( common.isMouseEnterRange(temp,preStage.pickSoldier.pickSoldierList[i],offsetX,offsetY,ratio) ){
							preStage.pickSoldier.setMouseEnterPickSoldierOver(preStage.pickSoldier.pickSoldierList[i].soldierIndex) ;
							return ;
						}
					}
					if ( common.isMouseEnterRange(temp,preStage.pickSoldier.closeButton,offsetX,offsetY,ratio) ){
						preStage.pickSoldier.setMouseEnterCloseButtonOver(i) ;
						return ;
					}
				} else if ( preStage.isShowInfo === true ){
					for ( var i = 0 ; i < preStage.monsterInfo.monsterInfoList.length ; i ++ ){
						if ( common.isMouseEnterRange(temp,preStage.monsterInfo.monsterInfoList[i],offsetX,offsetY,ratio) ){
							preStage.monsterInfo.setMouseEnterPickSoldierOver(i) ;
							return ;
						}
					}
					if ( common.isMouseEnterRange(temp,preStage.monsterInfo.closeButton,offsetX,offsetY,ratio) ){
						preStage.monsterInfo.setMouseEnterCloseButtonOver(i) ;
						return ;
					}
					if ( preStage.monsterInfo.isChooseMonster === false )
						mouseOver = "none" ;
					document.body.style.cursor = "default" ;
				} else {
					common.setMouseEnterNone();
				}
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
				var x = preStage.pickSoldier.pickSoldierList[pickIndex].x + 53;
				var y = preStage.pickSoldier.pickSoldierList[pickIndex].y + 45;
				gameCtx.font="12px Courier New";
				gameCtx.fillStyle = "white" ;
				gameCtx.drawImage(canvasMap[role+"_stand"],canvasMap[role+"_stand"].width/5*mySoldierList[soldierIndex].stand.nowFrame,0,canvasMap[role+"_stand"].width/5,canvasMap[role+"_stand"].height,x+mySoldierList[soldierIndex].standOffsetX,y+mySoldierList[soldierIndex].standOffsetY,canvasMap[role+"_stand"].width/5,canvasMap[role+"_stand"].height);
				if ( mySoldierList[soldierIndex].stand.timer < mySoldierList[soldierIndex].stand.delay  ){
					mySoldierList[soldierIndex].stand.timer ++ ;
				} else if ( mySoldierList[soldierIndex].stand.timer >= mySoldierList[soldierIndex].stand.delay  ){
					mySoldierList[soldierIndex].stand.nowFrame  ++ ;
					mySoldierList[soldierIndex].stand.timer = 0 ;
					if ( mySoldierList[soldierIndex].stand.nowFrame >= mySoldierList[soldierIndex].stand.totalFrame ){
						mySoldierList[soldierIndex].stand.nowFrame = 0 ;
					}
				}
				gameCtx.fillText(mySoldierList[soldierIndex].name,x,y+98);
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
				common.setMouseEvent(preStage.pickSoldier.mouseOver,preStage.pickSoldier.mouseClick);
				common.drawObject(this.chooseBack);
				preStage.pickSoldier.showMySoldierList();
				preStage.pickSoldier.showCloseButton();
			}
		},
		monsterInfo : {
			monsterInfoList : [] ,
			closeButton : {} ,
			infoBack : {} ,
			isChooseMonster : false ,
			init : function(){
				this.isChooseMonster = false ;
				this.monsterInfoList = [] ;
				this.initMonsterInfoList() ;
				this.initCloseButton();
			},
			initCloseButton : function(){
				this.infoBack = { x : canvasWidth/2-canvasMap['info_back'].width/2 , y : canvasHeight/2-canvasMap['info_back'].height/2 , canvas : 'info_back' , w : canvasMap['info_back'].width , h : canvasMap['info_back'].height };
				this.closeButton = { x : 1025 , y : 137 , w : canvasMap['info_close'].width , h : canvasMap['info_close'].height } ;
			},
			showAll: function(){
				common.setMouseEvent(preStage.pickSoldier.mouseOver,preStage.pickSoldier.mouseClick);
				common.drawObject(this.infoBack);
				preStage.monsterInfo.showMonsterInfoList();
				preStage.monsterInfo.showMonsterDetail();
				this.showCloseButton();
			},	
			showCloseButton : function(){
				gameCtx.drawImage(canvasMap['info_close'],this.closeButton.x,this.closeButton.y);
			},	
			showMonsterDetail : function(){
				//need improvement
				gameCtx.font="20px Courier New";
				gameCtx.fillStyle = "white" ;
				if ( mouseOver !== "none" ){
					for ( var i = 0 ; i < monsterTypeList.length ; i ++ ){
						if ( mouseOver === "monsterInfo" + i ){
							gameCtx.fillText("HP : "+monsterTypeList[i].maxHp,360,460);
							gameCtx.fillText("Speed : "+monsterTypeList[i].speed,360,510);
							gameCtx.fillText("Defense : "+monsterTypeList[i].def,360,560);
							for ( var j = 0 ; j < monsterTypeList[i].attribute.length ; j ++ ){
								var type = "increase" ;
								var ratio = monsterTypeList[i].attribute[j].ratio ;
								ratio *= 100 ;
								if ( monsterTypeList[i].attribute[j].ratio < 1 ){
									type = "reduce" ;
									ratio = 100 - ratio ;
								} else {
									ratio -= 100 ;
								}
								gameCtx.fillText("* "+monsterTypeList[i].attribute[j].name+" attack "+type+" "+ratio+"%",580,460+j*30);
							}
							return ;
						}
					}
				}
				
			},			
			showMonsterCard :function(index){
				var x = preStage.monsterInfo.monsterInfoList[index].x ;
				var y = preStage.monsterInfo.monsterInfoList[index].y ;
				gameCtx.drawImage(canvasMap['info_card'],x,y) ;
				gameCtx.drawImage(canvasMap[monsterIdList[monsterTypeList[index].id]+"_move"],monsterTypeList[index].move.nowFrame*monsterTypeList[index].move.w,0,monsterTypeList[index].move.w,monsterTypeList[index].move.h,x+canvasMap['info_card'].width/2-monsterTypeList[index].move.w/2,y+monsterTypeList[index].offsetY+canvasMap['info_card'].height/2-monsterTypeList[index].move.h/2,monsterTypeList[index].move.w,monsterTypeList[index].move.h) ;
				common.loopAnimation(monsterTypeList[index].move);
			},
			showMonsterInfoList :function(){
				for ( var i = 0 ; i < monsterTypeList.length ; i ++ ){
					preStage.monsterInfo.showMonsterCard(i) ;
				}
			},
			initMonsterInfoList : function(){
				var y1 = 189 ;
				var x = 0 , y = y1 ;
				monsterTypeList = [] ;
				//need improvement
				monsterTypeList.push(common.clone(stage.monsterAllList[0]));
				for ( var i = 1  ; i < stage.monsterAllList.length ; i ++ ){
					for ( var j = 0 ; j < monsterTypeList.length ; j ++ ){
						if ( monsterTypeList[j].id === stage.monsterAllList[i].id ){
							break ;
						} else if ( j === monsterTypeList.length - 1 ){
							monsterTypeList.push(common.clone(stage.monsterAllList[i]));
						}
					}
				}
				for ( var i = 0 , j = 0 ; i < monsterTypeList.length ; i ++ , j ++ ){
					var x = j*122+375  , y = 200 ;
					preStage.monsterInfo.monsterInfoList.push({x:x,y:y,w:canvasMap['info_card'].width,h:canvasMap['info_card'].height,soldierIndex:i});
					if ( j >= 5 )
						j = -1 ;
				}
			},
			setMouseEnterPickSoldierOver : function(index){
				document.body.style.cursor = "pointer" ;
				mouseOver = "monsterInfo" + index ;
				preStage.monsterInfo.isChooseMonster = true ;
			},
			setMouseEnterPickSoldierClick : function(index){
				document.body.style.cursor = "pointer" ;
				mouseOver = "monsterInfo" + index ;
				preStage.monsterInfo.isChooseMonster = true ;
			},			
			setMouseEnterCloseButtonOver : function(index){
				document.body.style.cursor = "pointer" ;
			},
			setMouseEnterCloseButtonClick : function(index){
				document.body.style.cursor = "default" ;
				preStage.isShowInfo = false ;
			},
		}
	};

	var stage = {
		isShowChooseSoldier : false ,
		isInitInvoke : false ,
		nowPickInvoke : null ,
		background : {} ,
		monsterAllList : [] ,
		gameOver : {} ,
		win : {} ,
		exp : 0 ,
		expTotal : 0 ,
		expIsCount : false ,
		expTimer : 0 ,
		expDelay : 10 ,
		addMonsterTimer : 0 ,
		addMonsterDelay : 100 ,
		winTimer : 0 ,
		winDelay : 10 ,
		winNowFrame : 0 ,
		winTotalFrame : 3 ,
		initExp : function(exp){
			stage.exp = exp ;
			stage.expTotal = exp ;
		},
		showAnimation : function(){
			for ( var i = 0 ; i < animationList.length ; i ++ ){
				var dx = animationList[i].dx || 0 , dy = animationList[i].dy || 0 ;
				var ratio = animationList[i].ratio || 1 ;
				if ( animationList[i].effect === undefined ||  animationList[i].effect.length === 0 ){
					gameCtx.drawImage(canvasMap[animationList[i].canvas],animationList[i].nowFrame*animationList[i].width,0,animationList[i].width,animationList[i].height,animationList[i].x+dx,animationList[i].y+dy,animationList[i].width*ratio,animationList[i].height*ratio);
				} else {
					gameCtx.save();
					for ( var j = 0 ; j < animationList[i].effect.length ; j ++ ){
						if ( animationList[i].effect[j].type === "rotate" ){
							if (animationList[i].timer >= animationList[i].delay - animationList[i].effect[j].remain  ) {
								gameCtx.translate(animationList[i].x+animationList[i].width/2 ,animationList[i].y+animationList[i].height/2);
								gameCtx.rotate( animationList[i].degree * Math.PI/180 );
								gameCtx.translate(-1*(animationList[i].width)/2,-1*animationList[i].height/2);
							} else {
								animationList[i].degree += animationList[i].effect[j].speed ;
								gameCtx.translate(animationList[i].x+animationList[i].width/2 ,animationList[i].y+animationList[i].height/2);
								gameCtx.rotate( animationList[i].degree * Math.PI/180 );
								gameCtx.translate(-1*(animationList[i].width)/2,-1*animationList[i].height/2);
							}
						} else if ( animationList[i].effect[j].type === "gravity" ) {
							if (animationList[i].timer >= animationList[i].delay - animationList[i].effect[j].remain  ) {
								;
							} else {
								animationList[i].effect[j].vy += 0.98 / 2 ;
								animationList[i].y += animationList[i].effect[j].vy ;
							}
						}
					}
					gameCtx.drawImage(canvasMap[animationList[i].canvas],animationList[i].nowFrame*animationList[i].width,0,animationList[i].width,animationList[i].height,0+dx,0+dy,animationList[i].width*ratio,animationList[i].height*ratio);
					//gameCtx.drawImage(animationList[i].canvas,0,0,animationList[i].width*ratio,animationList[i].height*ratio);
					gameCtx.restore();
				}
				animationList[i].x += dx , animationList[i].y += dy ;
				if ( animationList[i].timer < animationList[i].delay  ){
					animationList[i].timer ++ ;
				} else if ( animationList[i].timer >= animationList[i].delay  ){
					animationList[i].nowFrame  ++ ;
					animationList[i].timer = 0 ;
					if ( animationList[i].nowFrame >= animationList[i].totalFrame ){
						animationList.splice(i, 1);
						i -- ;
					}
				}
			}
		},
		showLevelUp : function(index){
			for ( var i = 0 ; i < invokeList.length ; i ++ ) {
				if ( invokeList[i].soldier.id !== -1 ){
					if ( invokeList[i].isLevelUp === true ){
						common.createAnimation({
							canvas : "levelup" ,
							x : invokeList[i].x - 120 ,
							y : invokeList[i].y - 260,
							nowFrame : 0 ,
							timer : 0 ,
							delay : 5 ,
							totalFrame : 21 ,
							width : canvasMap["levelup"].width / 21  , 
							height : canvasMap["levelup"].height  
						});
						invokeList[i].isLevelUp = false ;
						//gameCtx.fillText("Level Up !!",invokeList[i].x,invokeList[i].y-25) ;	
					}
				}
			}	
		},
		setLevelUp : function(index){
			var temp = invokeList[index].soldier.goalExp - invokeList[index].soldier.nowExp ;
			invokeList[index].isLevelUp = true ;
			invokeList[index].soldier.nowExp = 0 ;
			invokeList[index].soldier.point ++ ;
			invokeList[index].soldier.upgrade(1);
			invokeList[index].soldier.refreshState();
		},
		showAddExp : function(){
			this.expDelay = 0 ;
			for ( var i = 0 ; i < invokeList.length ; i ++ ) {
				if ( invokeList[i].soldier.id !== -1 ){
					var exp = invokeList[i].soldier.nowExp ;
					gameCtx.drawImage(canvasMap["exp_bar"],invokeList[i].x-8,invokeList[i].y-20);
					var goalExp = invokeList[i].soldier.goalExp ;
					gameCtx.drawImage(canvasMap["exp"],invokeList[i].x+1-8,invokeList[i].y+1-20,canvasMap["exp"].width*(exp/goalExp)*68,canvasMap["exp"].height-1);
				}
			}
			if ( this.expTimer <= this.expDelay ){
				this.expTimer ++ ;
				return ;
			} else {
				this.expTimer = 0 ;
				if ( stage.exp <= 0 ){
					return ;
				} else {
					if ( this.expIsCount === false ){
						var count = 0 ;
						for ( var i = 0 ; i < invokeList.length ; i ++ ) {
							if ( invokeList[i].soldier.id !== -1 ){
								count ++ ;
							}
						}
						this.exp = Math.round(this.exp / count) ;
						this.expIsCount = true ;
					}
					for ( var i = 0 ; i < invokeList.length ; i ++ ) {
						if ( invokeList[i].soldier.id !== -1 ){
							invokeList[i].soldier.nowExp ++ ;
							if ( invokeList[i].soldier.nowExp >= invokeList[i].soldier.goalExp ){
								stage.setLevelUp(i);
							}
						}
					}
					this.exp -- ;
				}
			}
		},
		addMonster : function(){
			if ( preStage.isGameWin === true || preStage.isGameOver === true )
				return ;
			if( stage.addMonsterTimer > 0){
				stage.addMonsterTimer -- ;
				return ; 
			} else if ( stage.monsterAllList.length !== 0 ) {
				monsterList.push(stage.monsterAllList.shift());
				stage.addMonsterTimer = stage.addMonsterDelay ;
			} else {
				return ;
			}
		},
		showMonster : function(){
			monsterList.sort(function(a, b){
			    var keyA = a.x,
			        keyB = b.x;
			    // Compare the 2 dates
			    if(keyA > keyB) return -1;
			    if(keyA < keyB) return 1;
			    return 0;
			});
			for ( var i = 0 ; i < monsterList.length ; i ++ ){
				if ( monsterList[i].nowHp <= 0 ){
					monsterList[i].isDie() ;
					monsterList[i].showAll();
					if ( monsterList.length === 0 && stage.monsterAllList.length === 0 ){
						preStage.isGameWin = true ;
					}
				} else {
					if ( monsterList.length === 0 && stage.monsterAllList.length === 0 ){
						preStage.isGameWin = true ;
					}
					monsterList[i].isMove();
					monsterList[i].showAll();
				}
			}
		},
		soldierEvent : function(){
			for ( var i = 0 ; i < invokeList.length ; i ++ ){
				if ( invokeList[i].soldier.id !== -1 ){
					invokeList[i].soldier.isAttack(invokeList[i].x,invokeList[i].y);
				}
			}
		},
		toGameOver : function(){
			this.winTotalFrame = 10 ;
			this.winDelay = 5 ;
			gameCtx.drawImage(canvasMap['fail'],this.winNowFrame*canvasMap['fail'].width/10,0,canvasMap['fail'].width/10,canvasMap['fail'].height,stage.win.x+100,stage.win.y+100,canvasMap['fail'].width/10,canvasMap['fail'].height);
			if ( this.winTimer <= this.winDelay ){
				this.winTimer ++ ;
				return ;
			} else {
				this.winTimer = 0 ;
				this.winNowFrame ++ ;
				if ( this.winNowFrame >= this.winTotalFrame  )
					this.winNowFrame = 0 ;
			}
		},
		toGameWin : function(){
			this.winTotalFrame = 3 ;
			gameCtx.drawImage(canvasMap['clear'],this.winNowFrame*canvasMap['clear'].width/3,0,canvasMap['clear'].width/3,canvasMap['clear'].height,stage.win.x,stage.win.y,canvasMap['clear'].width/3,canvasMap['clear'].height);
			if ( this.winTimer <= this.winDelay ){
				this.winTimer ++ ;
			} else {
				this.winTimer = 0 ;
				if ( this.winNowFrame < this.winTotalFrame - 1 )
					this.winNowFrame ++ ;
			}
			stage.showAddExp();
		},
		detectGame : function(){
			if ( preStage.isGameOver === true ){
				stage.toGameOver();
			} else if ( preStage.isGameWin === true ){
				stage.toGameWin();
			}
		},
		initWin : function(){
			stage.win = { x: 350 , y : 230 , w : canvasMap['clear'].width/3 , h:canvasMap['clear'].height} ;
		},
		init : function(){
			this.exp = 0 ,
			this.expTotal = 0 ,
			this.expIsCount = false ,
			this.expTimer = 0 ,
			this.addMonsterTimer = 0 ,
			this.winTimer = 0 ,
			this.winNowFrame = 0 ;
			stage.initWin();
			preStage.isGameStart = true ;
			common.createAnimation({
				canvas : "start" ,
				x : 440  ,
				y : 310,
				nowFrame : 0 ,
				timer : 0 ,
				delay : 5 ,
				totalFrame : 7 ,
				width : canvasMap["start"].width / 7  , 
				height : canvasMap["start"].height  
			});
		},
		stage1 : {
			initMonsterList : function(){
				monsterList = [] ;
				stage.addMonsterTimer = 0 ;
				stage.monsterAllList = [] ;
				for ( var i = 0 ; i < 10 ; i ++ ){
					stage.monsterAllList.push(common.clone(monsterMap['snail']));
				}
			},
			init : function(){
				stage.init();
				stage.initExp(100);
				stage.addMonsterDelay = 100 ;
			},
			showAll : function(){
				common.setMouseEvent(preStage.mouseOver,preStage.mouseClick);
				stage.addMonster();
				preStage.showBackground("stage1");
				preStage.showDescription();
				preStage.showInvoke("stage1");
				stage.showMonster();
				stage.soldierEvent();
				stage.detectGame();
				stage.showLevelUp();
				stage.showAnimation();
				preStage.showButton();
			}
		},		
		stage2 : {
			initMonsterList : function(){
				monsterList = [] ;
				stage.addMonsterTimer = 0 ;
				stage.monsterAllList = [] ;
				for ( var i = 0 ; i < 10 ; i ++ ){
					stage.monsterAllList.push(common.clone(monsterMap['orange-mushroom']));
				}
			},
			init : function(){
				stage.init();
				stage.initExp(200);
				stage.addMonsterDelay = 100 ;
			},
			showAll : function(){
				common.setMouseEvent(preStage.mouseOver,preStage.mouseClick);
				stage.addMonster();
				preStage.showBackground("stage1");
				preStage.showDescription();
				preStage.showInvoke("stage1");
				stage.showMonster();
				stage.soldierEvent();
				stage.detectGame();
				stage.showLevelUp();
				stage.showAnimation();
				preStage.showButton();
			}
		},
		stage3 : {
			initMonsterList : function(){
				monsterList = [] ;
				stage.addMonsterTimer = 0 ;
				stage.monsterAllList = [] ;
				for ( var i = 0 ; i < 10 ; i ++ ){
					stage.monsterAllList.push(common.clone(monsterMap['shroom']));
				}
			},
			init : function(){
				stage.init();
				stage.initExp(250);
				stage.addMonsterDelay = 30 ;
			},
			showAll : function(){
				common.setMouseEvent(preStage.mouseOver,preStage.mouseClick);
				stage.addMonster();
				preStage.showBackground("stage1");
				preStage.showDescription();
				preStage.showInvoke("stage1");
				stage.showMonster();
				stage.soldierEvent();
				stage.detectGame();
				stage.showLevelUp();
				stage.showAnimation();
				preStage.showButton();
			}
		}
	}
	
	var town = {
		box : {} ,
		battle : {} ,
		mission : {} ,
		map : {} ,
		character : {} ,
		nowTag : {} ,
		showPage : "none" ,
		soldierList : [] ,
		isChooseSoldier : false ,
		consoleContent : {} ,
		chat : {} ,
		item : null ,
		isTransfer : "none" ,
		transferChoose : {} ,
		init : function(){
			this.isChooseSoldier = false ;
			this.isTransfer = "none" ;
			this.item = null ;
			this.soldierList = [] ;
			this.showPage = "none" ;
			this.initObject();
			animationList = [] ;
		},
		refreshItemList : function(){
			var page = this.character.item.nowPage ;
			town.character.item.list = [] ;
			var x = town.character.item.x + 21 , y = town.character.item.y + 60;
			for ( var i = page * 8 ; i < itemList.length && i < page * 8 + 8 ; i ++ ){
				var item = itemList[i] ;
				town.character.item.list.push({x:x,y:y,w:canvasMap[item.canvas].width,h:canvasMap[item.canvas].height,canvas:item.canvas}) ;
				x += 72 ;
				if ( i % 4 === 3 ){
					x = town.character.item.x + 21 , y += 70 ;
				}
			}
		},
		initTransferObject : function(){
			this.soldierList = [] ;
			var x = this.transfer.chooseSoldier.x , y = this.transfer.chooseSoldier.y+14 ;
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				x = i * 165 + 20  ;
				this.soldierList.push({x:x,y:y,w:canvasMap['choose_soldier_back2'].width,h:canvasMap['choose_soldier_back2'].height,canvas:'choose_soldier_back2'});
			}
		},
		initCharacterObject : function(){
			this.soldierList = [] ;
			var x = this.character.chooseSoldier.x , y = this.character.chooseSoldier.y+14 ;
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				x = i * 165 + 20  ;
				var skill = [] ;
				for ( var j = 0 ; j < mySoldierList[i].skill.length ; j ++ ){
					var x2 = this.character.skill.x + 14 , y2 = this.character.skill.y + j * 74 + 54;
					var n = 1 ;
					if ( mySoldierList[i].skill[j].nowLevel <= 0 ){
						n = 2
					}
					var u = 1 ;
					if ( mySoldierList[i].point <= 0 || mySoldierList[i].skill[j].nowLevel >= mySoldierList[i].skill[j].topLevel ){
						u = 0 ;
					} 
					var s = { x : x2 , y : y2 , canvas : "skill_back" , w : canvasMap["skill_back"].width , h : canvasMap["skill_back"].height ,
						icon : { x : x2 + 7 , y : y2 + 5, canvas : mySoldierList[i].skill[j].canvasName+"_icon" , nowFrame : n , w : canvasMap[mySoldierList[i].skill[j].canvasName+"_icon"].width/3 , h : canvasMap[mySoldierList[i].skill[j].canvasName+"_icon"].height , ratio : 1.7 } ,
						upgrade : { x : x2 + 235 , y : y2 + 39, canvas : "upgrade" , w : canvasMap["upgrade"].width / 2 , h : canvasMap["upgrade"].height , nowFrame : u } ,
						name : { x : x2 + 75, y : y2 + 27, text : mySoldierList[i].skill[j].name } ,
						nowLevel : { x : x2 + 75, y : y2 + 59 , text : mySoldierList[i].skill[j].nowLevel } 
					} ;
					skill.push(s);
				}
				var equip = [] ;
				if ( mySoldierList[i].equipment["weapon"] !== undefined ){

					equip.push({x : 555 , y : 305 , canvas:mySoldierList[i].equipment["weapon"].canvas , w : canvasMap[mySoldierList[i].equipment["weapon"].canvas].width , h : canvasMap[mySoldierList[i].equipment["weapon"].canvas].height , item : mySoldierList[i].equipment["weapon"] }) ;
				}
				this.soldierList.push({x:x,y:y,w:canvasMap['choose_soldier_back2'].width,h:canvasMap['choose_soldier_back2'].height,canvas:'choose_soldier_back2',skill:skill,equip:equip});
			}
		},
		initConsole : function(){
			town.item = null ;
			town.character.console = { x : 1040 , y : 240 , w : canvasMap["console"].width , h : canvasMap["console"].height , canvas : "console" ,
				icon : { x : 1050 , y : 250 } ,
				name : { x : 1115 , y : 285 } ,
				content : [{ x : 1060 , y : 340 } ] 
			};
			town.transfer.console = { x : 1040 , y : 240 , w : canvasMap["console"].width , h : canvasMap["console"].height , canvas : "console" ,
				icon : { x : 1050 , y : 250 } ,
				content : [{ x : 1060 , y : 285 } ] 
			};
		},
		initObject : function(){
			this.nowTag = 	{ x : 540 , y : 295 , w : canvasMap["tag2"].width / 4 , h : canvasMap["tag2"].height , canvas : "tag2" , nowFrame : 0 , totalFrame : 4 , timer : 0 , delay : 5  } ;
			this.box = { x : 1100 , y : 505 , w : canvasMap["box"].width , h : canvasMap["box"].height };
			this.battle = { x : 100 , y : 530 , w : canvasMap["battle"].width , h : canvasMap["battle"].height };
			this.map = { x : canvasWidth/2-canvasMap['map_0'].width/2 ,y : canvasHeight/2-canvasMap['map_0'].height/2 , w : canvasMap["map_0"].width  , h :canvasMap["map_0"].height , canvas : "map_0" ,
				closeButton : {
					x : 1140 , y : 20 , w : canvasMap["close"].width , h : canvasMap["close"].height , canvas : "close"
				} ,
				tag : [
					{ x : 457 , y : 231 , w : canvasMap["tag1"].width / 7 , h : canvasMap["tag1"].height , canvas : "tag1" , nowFrame : 0 , totalFrame : 7 , timer : 0 , delay : 5 , stage : 1 },
					{ x : 470 , y : 281 , w : canvasMap["tag1"].width / 7 , h : canvasMap["tag1"].height , canvas : "tag1" , nowFrame : 0 , totalFrame : 7 , timer : 0 , delay : 5 , stage : 2 },
					{ x : 490 , y : 335 , w : canvasMap["tag1"].width / 7 , h : canvasMap["tag1"].height , canvas : "tag1" , nowFrame : 0 , totalFrame : 7 , timer : 0 , delay : 5 , stage : 3 }
				] 
			};
			this.character = { 
				chooseSoldier : { x : 8 , y : 540 , w : canvasMap["choose_soldier2"].width , h : canvasMap["choose_soldier2"].height , canvas : "choose_soldier2" },
				status : { x : 690 , y : 280 , w : canvasMap["status"].width , h : canvasMap["status"].height , canvas : "status" },
				skill : { x : 10 , y : 50 , w : canvasMap["skill"].width , h : canvasMap["skill"].height , canvas : "skill" },
				item : { x : 690 , y : 30 , w: canvasMap["item"].width , h : canvasMap["item"].height , canvas : "item" ,
					list : [] ,
					nowPage : 0 , 
					up : { x : 995 , y : 85 , w: canvasMap["up"].width , h : canvasMap["up"].height , canvas : "up" } ,
					down : { x : 995 , y : 180 , w: canvasMap["down"].width , h : canvasMap["down"].height , canvas : "down" } 
				},
				equip : { x : 342 , y : 30 , w : canvasMap["equip"].width , h : canvasMap["equip"].height , canvas : "equip" },
				console : { x : 1040 , y : 240 , w : canvasMap["console"].width , h : canvasMap["console"].height , canvas : "console" ,
					icon : { x : 1050 , y : 250 } ,
					name : { x : 1115 , y : 285 } ,
					content : [{ x : 1060 , y : 340 } ] 
				}

			};
			this.mission = { x : 540 , y : 533 , w : canvasMap["mission"].width , h : canvasMap["mission"].height , canvas : "mission" } ;
			this.transfer = {	
				chooseSoldier : { x : 8 , y : 540 , w : canvasMap["choose_soldier2"].width , h : canvasMap["choose_soldier2"].height , canvas : "choose_soldier2" },
				console : { x : 1040 , y : 240 , w : canvasMap["console"].width , h : canvasMap["console"].height , canvas : "console" ,
					icon : { x : 1050 , y : 250 } ,
					name : { x : 1115 , y : 285 , font : "30px Arial" , fillStyle : "black" } ,
					content : [{ x : 1060 , y : 340 } ] 
				},
				button : {x : canvasWidth/2-canvasMap['transfer'].width/2 + 10 , y : canvasHeight/2-canvasMap['transfer'].height/2 + 25, h : canvasMap['transfer'].height , w : canvasMap['transfer'].width , canvas : 'transfer' }
			};
			this.chat = { x : canvasWidth/2-canvasMap['chat'].width/2 , y : canvasHeight/2-canvasMap['chat'].height/2 , w : canvasMap['chat'].width , h : canvasMap['chat'].height , canvas : 'chat' , 
				//transferTextTag : { x : canvasWidth/2-canvasMap['chat'].width/2 + 300 , y : canvasHeight/2-canvasMap['chat'].height/2 + 300 , w : canvasMap['text_tag'].width , h : canvasMap['text_tag'].height , canvas : canvasMap['text_tag']}  ,
				transferTextBack : { x : canvasWidth/2-canvasMap['chat_back'].width/2 - 120  , y : canvasHeight/2-canvasMap['chat_back'].height/2 + 50 , canvas : "chat_back" , w : 310 , h : 50 } ,
				transferText : { x : canvasWidth/2-canvasMap['chat'].width/2 + 300 , y : canvasHeight/2-canvasMap['chat'].height/2 + 300 , text : "I want to transfer jobs." , font : "30px Arial" , fillStyle : "blue"  }  
			} ;
			this.transferChoose = {
				beginner : { x : canvasWidth/2-canvasMap['choose_transfer4'].width/2 , y : canvasHeight/2-canvasMap['choose_transfer4'].height/2 - 200 , w : canvasMap["choose_transfer4"].width , h : canvasMap["choose_transfer4"].height , canvas : "choose_transfer4" ,
					list : [
						{ x : canvasWidth/2-canvasMap['choose_transfer4'].width/2 + 10 , y : canvasHeight/2-canvasMap['choose_transfer4'].height/2 - 200 + 14, h : canvasMap['choose_soldier_back2'].height , w : canvasMap['choose_soldier_back2'].width , canvas : 'choose_soldier_back2' , soldier : soldierMap["archer"]},
						{ x : canvasWidth/2-canvasMap['choose_transfer4'].width/2 + 10 + 165 , y : canvasHeight/2-canvasMap['choose_transfer4'].height/2 - 200 + 14, h : canvasMap['choose_soldier_back2'].height , w : canvasMap['choose_soldier_back2'].width , canvas : 'choose_soldier_back2' , soldier : soldierMap["magician"]},
						{ x : canvasWidth/2-canvasMap['choose_transfer4'].width/2 + 10 + 165 *2 , y : canvasHeight/2-canvasMap['choose_transfer4'].height/2 - 200 + 14, h : canvasMap['choose_soldier_back2'].height , w : canvasMap['choose_soldier_back2'].width , canvas : 'choose_soldier_back2' , soldier : soldierMap["rogue"]},
						{ x : canvasWidth/2-canvasMap['choose_transfer4'].width/2 + 10 + 165 *3, y : canvasHeight/2-canvasMap['choose_transfer4'].height/2 - 200 + 14, h : canvasMap['choose_soldier_back2'].height , w : canvasMap['choose_soldier_back2'].width , canvas : 'choose_soldier_back2' , soldier : soldierMap["swordman"]}
					]
				}
			}
			this.initCharacterObject();
			this.refreshItemList();
			this.initTransferObject();
		},
		showBackground : function(){
			gameCtx.drawImage(canvasMap['bg_town_back5'],0,0);
			gameCtx.drawImage(canvasMap['bg_town_back3'],100,0);
			gameCtx.drawImage(canvasMap['bg_town_back4'],100,0);
			
			//gameCtx.drawImage(canvasMap['background'],background.x,background.y);

			//gameCtx.drawImage(canvasMap['bg_town_back5'],-100,-300);
			for ( var i = 0 ; i < 3 ; i ++ ){
				gameCtx.drawImage(canvasMap["bg_town_back7"],i*canvasMap["bg_town_back7"].width,-130);
			} 
			for ( var i = 0 ; i < 2 ; i ++ ){
				gameCtx.drawImage(canvasMap["bg_stage1_back_bottom"],i*canvasMap["bg_stage1_back_bottom"].width,100);
				gameCtx.drawImage(canvasMap["bg_stage1_back_bottom"],i*canvasMap["bg_stage1_back_bottom"].width-canvasMap["bg_stage1_back_bottom"].width/2,200);
			} 
			gameCtx.drawImage(canvasMap['bg_town_back3'],-200,100);
			gameCtx.drawImage(canvasMap['bg_town_back0'],400,100);
			gameCtx.drawImage(canvasMap["bg_stage1_front"],0,165);
			gameCtx.drawImage(canvasMap['bg_town_back4'],500,100);
			for ( var i = 0 ; i < 5 ; i ++ ){
				gameCtx.drawImage(canvasMap["bg_stage1_path_top"],i*canvasMap["bg_stage1_path_top"].width,600);
				gameCtx.drawImage(canvasMap["bg_stage1_path_mid"],i*canvasMap["bg_stage1_path_mid"].width,canvasMap["bg_stage1_path_top"].height+600);
				gameCtx.drawImage(canvasMap["bg_stage1_path_mid"],i*canvasMap["bg_stage1_path_mid"].width,canvasMap["bg_stage1_path_top"].height+canvasMap["bg_stage1_path_mid"].height+600);
				gameCtx.drawImage(canvasMap["bg_stage1_path_bottom"],i*canvasMap["bg_stage1_path_bottom"].width,canvasMap["bg_stage1_path_top"].height+canvasMap["bg_stage1_path_mid"].height+canvasMap["bg_stage1_path_mid"].height+600);
			}
			gameCtx.drawImage(canvasMap['bg_town_back1'],350,500);
			gameCtx.drawImage(canvasMap['bg_town_back0'],-100,580);
		},	
		setMouseEnterTagOver : function(tag){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterTagClick : function(tag){
			document.body.style.cursor = "default" ;
			nowPage = "preStage" ;
			nowStage = "stage" + tag.stage ;
			preStage.init();
		},
		setMouseEnterMapCloseOver : function(){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterMapCloseClick : function(){
			town.showPage = "none" ;
			document.body.style.cursor = "default" ;
		},	
		setMouseEnterBattleOver : function(){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterBattleClick : function(){
			document.body.style.cursor = "pointer" ;
			town.showPage = "map" ;
		},			
		setMouseEnterMissionOver : function(){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterMissionClick : function(){
			document.body.style.cursor = "default" ;
			town.showPage = "mission" ;
		},		
		setMouseEnterBoxOver : function(){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterBoxClick : function(){
			document.body.style.cursor = "pointer" ;
			town.showPage = "character" ;
		},		
		setMouseEnterSoldierOver : function(i){
			town.isChooseSoldier = true ;
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterTransferChooseClick : function(i){
			document.body.style.cursor = "default" ;
			town.initConsole();
			var s = town.transferChoose[town.isTransfer].list[i].soldier ;
			town.transfer.console.soldier = s ;
			town.transfer.console.icon = "none" ;
			town.transfer.console.content[0].text = s.description  ;
		},
		setMouseEnterSoldierClick : function(i){
			town.isChooseSoldier = true ;
			mouseOver = "soldier" + i ;
			town.initConsole();
			if ( town.showPage === "character" ){	
				town.initCharacterObject();	
				var s = mySoldierList[i] ;
				town.character.console.icon = "none" ;
				town.character.console.name.x -= 50 , town.character.console.name.y += 10 ;
				town.character.console.name.text = mySoldierList[i].name ;
				var text = "AttackType : "  ;
				for ( var i = 0 ; i < s.attackType.length ; i ++ ){
					text += s.attackType[i] ;
					if ( i !== s.attackType.length - 1 )
						text += " , " ;
				}
				town.character.console.content[0].text = text ;
				town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Transfer Level : "+ mySoldierList[i].transferLevel});
			} else if ( town.showPage === "transfer" ){
				var s = mySoldierList[i] ;
				town.transfer.console.icon = "none" ;
				town.transfer.console.content[0].text = mySoldierList[i].description  ;
				if ( mySoldierList[i].level >= mySoldierList[i].transferLevel ) {
					town.isTransfer = mySoldierList[i].name.substr(0, 1).toLowerCase() + mySoldierList[i].name.substr(1) ;
				} else {
					town.isTransfer = "none" ;
				}
			}
		},
		setMouseEnterSkillOver : function(i){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterUpgradeOver : function(i){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterEquipOver : function(i,j){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterEquipClick : function(i,j){
			town.initConsole();
			town.item = this.soldierList[i].equip[j].item ;
			town.character.console.icon.canvas = town.item.canvas ;
			town.character.console.icon.w = canvasMap[town.item.canvas].width ;
			town.character.console.icon.h = canvasMap[town.item.canvas].height ;
			town.character.console.icon.x += 10 , town.character.console.icon.y += 10 ; 
			town.character.console.name.x += 10 , town.character.console.name.y += 10 ;
			town.character.console.name.text = town.item.name ;
			town.character.console.content[0].text = town.item.description ;
			if ( town.item.type !== undefined ){
				town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Type : "+town.item.type});
			} 
			if ( town.item.point !== undefined ){
				town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Point : "+town.item.point});
			} 
		},
		setMouseEnterEquipDblclick : function(i,j){
			var type = this.soldierList[i].equip[j].item.type ;
			mySoldierList[i].removeEquip(type) ;
		},
		setMouseEnterItemPageOver : function(i){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterItemPageClick : function(i){
			town.character.item.nowPage += i ;
			town.refreshItemList();
		},
		setMouseEnterTransferTextOver : function(){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterTransferTextClick : function(){
			town.showPage = "transfer" ;
			document.body.style.cursor = "default" ;
		},
		setMouseEnterItemOver : function(i){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterItemClick : function(i){
			town.initConsole();
			town.item = itemList[i] ;
			town.character.console.icon.canvas = itemList[i].canvas ;
			town.character.console.icon.w = canvasMap[itemList[i].canvas].width ;
			town.character.console.icon.h = canvasMap[itemList[i].canvas].height ;
			town.character.console.icon.x += 10 , town.character.console.icon.y += 10 ; 
			town.character.console.name.x += 10 , town.character.console.name.y += 10 ;
			town.character.console.name.text = itemList[i].name ;
			town.character.console.content[0].text = itemList[i].description ;
			if ( itemList[i].type !== undefined ){
				town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Type : "+itemList[i].type});
			} 
			if ( itemList[i].point !== undefined ){
				town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Point : "+itemList[i].point});
			} 
		},		
		setMouseEnterItemDblClick : function(j){
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				if ( mouseOver === "soldier" + i ){
					if ( itemList[town.character.item.nowPage*8+j].role.indexOf(mySoldierList[i].id) !== -1 ){
						mySoldierList[i].equip(town.character.item.nowPage*8+j) ;
						town.initCharacterObject();
					}
					return ;
				}
			}
		},
		setMouseEnterSkillClick : function(i,j){
			this.character.console.content = [{ x : 1060 , y : 340 }] ;
			var skill = mySoldierList[i].skill[j] ;
			town.character.console.icon.canvas = skill.canvasName+"_icon" ;
			town.character.console.icon.w = canvasMap[skill.canvasName+"_icon"].width / 3 ;
			town.character.console.icon.h = canvasMap[skill.canvasName+"_icon"].height ;
			if ( mySoldierList[i].skill[j].nowLevel > 0 )
				town.character.console.icon.nowFrame = 1 ;
			else 
				town.character.console.icon.nowFrame = 2 ;
			town.character.console.icon.ratio = 1.7 ;
			town.character.console.name.text = skill.name ;
			town.character.console.content[0].text = skill.description ;
			if ( skill.type === "active" ){
				if ( skill.effectRatio !== -1)	{
					var text = skill.effectRatio*100+"%" ;
					if ( skill.nowLevel > 0 && skill.ratioUpgrade > 0 ){
						text += " (" + (skill.effectRatio*100+skill.ratioUpgrade*100 )+"%)" ;
					}
					town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Ratio : "+text});
				}
				else {
					var text = skill.ratio*100+"%" ;
					if ( skill.nowLevel > 0 && skill.ratioUpgrade > 0 ){
						text += " (" + (skill.ratio*100+skill.ratioUpgrade*100 )+"%)" ;
					}
					town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Ratio : "+text});
				}
				town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Speed : "+skill.speed});
			} else {
				if ( skill.ratio !== undefined){
					var text = skill.ratio*100+"%" ;
					if ( skill.nowLevel > 0 && skill.ratioUpgrade > 0 ){
						text += " (" + (skill.ratio*100+skill.ratioUpgrade*100 )+"%)" ;
					}
					town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Ratio : "+text});
				}
				if ( skill.probability !== undefined){
					var text = Math.round(skill.probability*100)+"%" ;
					if ( skill.nowLevel > 0 && skill.probabilityUpgrade > 0 ){
						text += " (" + Math.round((skill.probability*1000+skill.probabilityUpgrade*1000 )/10)+"%)" ;
					}
					town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Prob : "+text});
				}
			}
		},
		setMouseEnterUpgradeClick : function(i,j){
			document.body.style.cursor = "default" ;
			mySoldierList[i].point -- ;
			mySoldierList[i].skill[j].upgrade();
			town.initCharacterObject();
			town.setMouseEnterSkillClick(i,j);
		},
		setMouseEnterTransferButtonClick : function(){
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				if ( mouseOver === "soldier" + i ){
					var level = mySoldierList[i].level ;
					var nowExp = mySoldierList[i].nowExp ;
					var goalExp = mySoldierList[i].goalExp ;
					var point = mySoldierList[i].point ;
					for ( var e in mySoldierList[i].equipment )
						mySoldierList[i].removeEquip(e) ;

					mySoldierList[i] = common.clone(town.transfer.console.soldier);
					mySoldierList[i].nowExp = nowExp ;
					mySoldierList[i].goalExp = goalExp ;
					mySoldierList[i].point = point ;
					mySoldierList[i].level = 1 ;
					for ( var j = 0 ; j < level-1 ; j ++ )
						mySoldierList[i].upgrade(1);
					break ;
				}
			}
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				mySoldierList[i].isPicked = false ;
			} 
			preStage.isInitInvoke = false ;
			preStage.initInvoke();	
			town.initConsole();
			town.isTransfer = "none" ;
			town.transfer.console.soldier = undefined ;
		},
		detectMouseEnterOver : function(temp,offsetX,offsetY,ratio){
			if ( town.showPage === "map"  ){
				for ( var i = 0 ; i < this.map.tag.length ; i ++ ){
					if ( this.map.tag[i].stage <= doneStage + 1  ){
						if ( common.isMouseEnterRange(temp,town.map.tag[i],offsetX,offsetY,ratio) ){
							town.setMouseEnterTagOver(town.map.tag[i]) ;
							return ;
						} 			
					}	
				}
				if ( common.isMouseEnterRange(temp,town.map.closeButton,offsetX,offsetY,ratio) ){
					town.setMouseEnterMapCloseOver() ;
					return ;
				}
				document.body.style.cursor = "default" ;
			} else if ( town.showPage === "character" ){
				for ( var i = 0 ; i < town.soldierList.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,town.soldierList[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterSoldierOver(i) ;
						return ;
					} 
				}
				for ( var i = 0 ; i < town.soldierList.length ; i ++ ){
					if ( mouseOver === "soldier" + i ){
						for ( var j = 0 ; j < town.soldierList[i].skill.length ; j ++ ){
							if ( town.soldierList[i].skill[j].upgrade.nowFrame === 1 ){
								if ( common.isMouseEnterRange(temp,town.soldierList[i].skill[j].upgrade,offsetX,offsetY,ratio) ){
									town.setMouseEnterUpgradeOver(j) ;
									return ;
								} 
							}
						}
					}
				}
				for ( var i = 0 ; i < town.soldierList.length ; i ++ ){
					if ( mouseOver === "soldier" + i ){
						for ( var j = 0 ; j < town.soldierList[i].skill.length ; j ++ ){
							if ( common.isMouseEnterRange(temp,town.soldierList[i].skill[j],offsetX,offsetY,ratio) ){
								town.setMouseEnterSkillOver(j) ;
								return ;
							} 
						}
					}
				}
				for ( var i = 0 ; i < town.character.item.list.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,town.character.item.list[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterItemOver(i) ;
						return ;
					} 
				}
				for ( var i = 0 ; i < this.soldierList.length ; i ++ ){
					if ( mouseOver === "soldier" + i ){
						for ( var j = 0 ; j < this.soldierList[i].equip.length ; j ++ ){
							if ( common.isMouseEnterRange(temp,this.soldierList[i].equip[j],offsetX,offsetY,ratio) ){
								town.setMouseEnterEquipOver(i,j) ;
								return ;
							} 
						}
						break ;
					}
				}
				if ( common.isMouseEnterRange(temp,this.character.item.up,offsetX,offsetY,ratio) ){
					if ( town.character.item.nowPage > 0 ){
						town.setMouseEnterItemPageOver(-1) ;
						return ;
					}
				} else if ( common.isMouseEnterRange(temp,this.character.item.down,offsetX,offsetY,ratio) ){
					if ( (town.character.item.nowPage+1)*8 < itemList.length ){
						town.setMouseEnterItemPageOver(1) ;
						return ;
					}
				} 
				document.body.style.cursor = "default" ;
			} else if ( town.showPage === "mission" ){
				if ( common.isMouseEnterRange(temp,town.chat.transferTextBack,offsetX,offsetY,ratio) ){
					town.setMouseEnterTransferTextOver() ;
					return ;
				}
				common.setMouseEnterNone();
			} else if ( town.showPage === "transfer" ){
				if ( town.isTransfer !== "none" ){
					for ( var i = 0 ; i < town.transferChoose[town.isTransfer].list.length ; i ++ ){
						if ( common.isMouseEnterRange(temp,town.transferChoose[town.isTransfer].list[i],offsetX,offsetY,ratio) ){
							town.setMouseEnterSoldierOver(i) ;
							return ;
						} 
					}
				}
				for ( var i = 0 ; i < town.soldierList.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,town.soldierList[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterSoldierOver(i) ;
						return ;
					} 
				}
				if ( town.transfer.console.soldier !== undefined ){
					if ( common.isMouseEnterRange(temp,town.transfer.button,offsetX,offsetY,ratio) ){
						town.setMouseEnterSoldierOver(i) ;
						return ;
					} 
				}
				document.body.style.cursor = "default" ;
			} else {
				if ( common.isMouseEnterRange(temp,town.box,offsetX,offsetY,ratio) ){
					town.setMouseEnterBoxOver() ;
					return ;
				} else if ( common.isMouseEnterRange(temp,town.battle,offsetX,offsetY,ratio) ){
					town.setMouseEnterBattleOver() ;
					return ;
				} else if ( common.isMouseEnterRange(temp,town.mission,offsetX,offsetY,ratio) ){
					town.setMouseEnterMissionOver() ;
					return ;
				} else {
					common.setMouseEnterNone();
				}
			}
			/*
			if ( town.isChooseSoldier === false ){
				common.setMouseEnterNone();
			}
			*/
		},
		detectMouseEnterClick : function(temp,offsetX,offsetY,ratio){
			if ( town.showPage === "map" ){				
				for ( var i = 0 ; i < this.map.tag.length ; i ++ ){
					if ( this.map.tag[i].stage <= doneStage + 1  ){
						if ( common.isMouseEnterRange(temp,town.map.tag[i],offsetX,offsetY,ratio) ){
							town.setMouseEnterTagClick(town.map.tag[i]) ;
							return ;
						} 	
					}			
				}
				if ( common.isMouseEnterRange(temp,town.map,offsetX,offsetY,ratio) ){
					return ;
				} 
				if ( common.isMouseEnterRange(temp,town.map.closeButton,offsetX,offsetY,ratio) ){
					town.setMouseEnterMapCloseClick() ;
					return ;
				} 
				town.showPage = "none" ;
			}  else if ( town.showPage === "character" ){
				for ( var i = 0 ; i < town.soldierList.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,town.soldierList[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterSoldierClick(i) ;
						return ;
					} 
				}
				for ( var i = 0 ; i < town.soldierList.length ; i ++ ){
					if ( mouseOver === "soldier" + i ){
						for ( var j = 0 ; j < town.soldierList[i].skill.length ; j ++ ){
							if ( town.soldierList[i].skill[j].upgrade.nowFrame === 1 ){
								if ( common.isMouseEnterRange(temp,town.soldierList[i].skill[j].upgrade,offsetX,offsetY,ratio) ){
									town.setMouseEnterUpgradeClick(i,j) ;
									return ;
								} 
							}
						}
					}
				}
				for ( var i = 0 ; i < town.soldierList.length ; i ++ ){
					if ( mouseOver === "soldier" + i ){
						for ( var j = 0 ; j < town.soldierList[i].skill.length ; j ++ ){
							if ( common.isMouseEnterRange(temp,town.soldierList[i].skill[j],offsetX,offsetY,ratio) ){
								town.setMouseEnterSkillClick(i,j) ;
								return ;
							} 
						}
					}
				}				
				for ( var i = 0 ; i < town.character.item.list.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,town.character.item.list[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterItemClick(i+town.character.item.nowPage*8) ;
						return ;
					} 
				}
				for ( var i = 0 ; i < this.soldierList.length ; i ++ ){
					if ( mouseOver === "soldier" + i ){
						for ( var j = 0 ; j < this.soldierList[i].equip.length ; j ++ ){
							if ( common.isMouseEnterRange(temp,this.soldierList[i].equip[j],offsetX,offsetY,ratio) ){
								town.setMouseEnterEquipClick(i,j) ;
								return ;
							} 
						}
						break ;
					}
				}
				if ( common.isMouseEnterRange(temp,this.character.item.up,offsetX,offsetY,ratio) ){
					if ( town.character.item.nowPage > 0 ){
						town.setMouseEnterItemPageClick(-1) ;
						return ;
					}
				} else if ( common.isMouseEnterRange(temp,this.character.item.down,offsetX,offsetY,ratio) ){
					if ( (town.character.item.nowPage+1)*8 < itemList.length ){
						town.setMouseEnterItemPageClick(1) ;
						return ;
					}
				} 
				if ( common.isMouseEnterRange(temp,town.character.console,offsetX,offsetY,ratio) ){
					return ;
				} else if ( common.isMouseEnterRange(temp,town.character.skill,offsetX,offsetY,ratio) ){
					return ;
				} else if ( common.isMouseEnterRange(temp,town.character.item,offsetX,offsetY,ratio) ){
					return ;
				} else if ( common.isMouseEnterRange(temp,town.character.equip,offsetX,offsetY,ratio) ){
					return ;
				} else if ( common.isMouseEnterRange(temp,town.character.status,offsetX,offsetY,ratio) ){
					return ;
				} else if ( common.isMouseEnterRange(temp,town.character.chooseSoldier,offsetX,offsetY,ratio) ){
					return ;
				} 
				town.showPage = "none" ;
			} else if ( town.showPage === "mission" ){
				if ( common.isMouseEnterRange(temp,town.chat.transferTextBack,offsetX,offsetY,ratio) ){
					town.setMouseEnterTransferTextClick() ;
					return ;
				}
				if ( common.isMouseEnterRange(temp,town.chat,offsetX,offsetY,ratio) ){
					return ;
				} 
				town.showPage = "none" ;
			} else if ( town.showPage === "transfer" ){
				if ( town.isTransfer !== "none" ){
					for ( var i = 0 ; i < town.transferChoose[town.isTransfer].list.length ; i ++ ){
						if ( common.isMouseEnterRange(temp,town.transferChoose[town.isTransfer].list[i],offsetX,offsetY,ratio) ){
							town.setMouseEnterTransferChooseClick(i) ;
							return ;
						} 
					}
				}
				for ( var i = 0 ; i < town.soldierList.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,town.soldierList[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterSoldierClick(i) ;
						return ;
					} 
				}				
				if ( town.transfer.console.soldier !== undefined ){
					if ( common.isMouseEnterRange(temp,town.transfer.button,offsetX,offsetY,ratio) ){
						town.setMouseEnterTransferButtonClick() ;
						return ;
					} 
				}
				town.initConsole();
				town.isTransfer = "none" ;
				town.transfer.console.soldier = undefined ;
				common.setMouseEnterNone();
				town.showPage = "none" ;
			} else {
				if ( common.isMouseEnterRange(temp,town.box,offsetX,offsetY,ratio) ){
					town.setMouseEnterBoxClick() ;
					return ;
				} else if ( common.isMouseEnterRange(temp,town.battle,offsetX,offsetY,ratio) ){
					town.setMouseEnterBattleClick() ;
					return ;
				} else if ( common.isMouseEnterRange(temp,town.mission,offsetX,offsetY,ratio) ){
					town.setMouseEnterMissionClick() ;
					return ;
				} 		
				if ( common.isMouseEnterRange(temp,town.character.status,offsetX,offsetY,ratio) ){
					return ;
				} 
				if ( common.isMouseEnterRange(temp,town.character.chooseSoldier,offsetX,offsetY,ratio) ){
					return ;
				} 
				town.showPage = "none" ;
			}
			common.setMouseEnterNone();
		},
		detectMouseEnterDblClick : function(temp,offsetX,offsetY,ratio){
			if ( town.showPage === "character" ){	
				for ( var i = 0 ; i < town.character.item.list.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,town.character.item.list[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterItemDblClick(i) ;
						return ;
					} 
				}
				for ( var i = 0 ; i < this.soldierList.length ; i ++ ){
					if ( mouseOver === "soldier" + i ){
						for ( var j = 0 ; j < this.soldierList[i].equip.length ; j ++ ){
							if ( common.isMouseEnterRange(temp,this.soldierList[i].equip[j],offsetX,offsetY,ratio) ){
								town.setMouseEnterEquipDblclick(i,j) ;
								return ;
							} 
						}
						return ;
					}
				}
			} else {
				;
			}
		},
		mouseOver :function(e){
			var info = common.getSizeInfo(e) ;
			town.detectMouseEnterOver(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		mouseClick: function(e){
			var info = common.getSizeInfo(e) ;
			town.detectMouseEnterClick(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		mouseDblclick: function(e){
			var info = common.getSizeInfo(e) ;
			town.detectMouseEnterDblClick(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		showObject : function(){
			gameCtx.drawImage(canvasMap['box'],this.box.x,this.box.y);
			gameCtx.drawImage(canvasMap['battle'],this.battle.x,this.battle.y);
			gameCtx.drawImage(canvasMap['mission'],this.mission.x,this.mission.y);
		},
		showMap : function(){
			gameCtx.drawImage(canvasMap[this.map.canvas],this.map.x,this.map.y);
			gameCtx.drawImage(canvasMap[this.map.closeButton.canvas],this.map.closeButton.x,this.map.closeButton.y);
			//tag
			for ( var i = 0 ; i < this.map.tag.length ; i ++ ){
				if ( this.map.tag[i].stage <= doneStage + 1 ){
					gameCtx.drawImage(canvasMap[this.map.tag[i].canvas],this.map.tag[i].nowFrame*this.map.tag[i].w,0,this.map.tag[i].w,this.map.tag[i].h,this.map.tag[i].x,this.map.tag[i].y,this.map.tag[i].w,this.map.tag[i].h);
					common.loopAnimation(this.map.tag[i]);
				}
				if ( this.map.tag[i].stage === doneStage + 1 ){
					this.nowTag.x = this.map.tag[i].x + this.map.tag[i].w/2 - this.nowTag.w/2;
					this.nowTag.y = this.map.tag[i].y - this.map.tag[i].h/2 - this.nowTag.h/2 ;
					common.drawObject(this.nowTag);
					common.loopAnimation(this.nowTag);
				}
			}
		},	
		showTransferChoose : function(type){
			if ( type === "beginner" ){
				common.drawObject(this.transferChoose[type]);
				for ( var i = 0 ; i < this.transferChoose[type].list.length ; i ++ ){
					common.drawObject(this.transferChoose[type].list[i]);
					var s = this.transferChoose[type].list[i].soldier ;
					var role = common.getRole(s.id) ;
					var x = this.transferChoose[type].list[i].x + 52, y = this.transferChoose[type].list[i].y + 43 ;
					gameCtx.drawImage(canvasMap[role+"_stand"],canvasMap[role+"_stand"].width/5*s.stand.nowFrame,0,canvasMap[role+"_stand"].width/5,canvasMap[role+"_stand"].height,x+s.standOffsetX,y+s.standOffsetY,canvasMap[role+"_stand"].width/5,canvasMap[role+"_stand"].height);
					if ( s.stand.timer < s.stand.delay  ){
						s.stand.timer ++ ;
					} else if ( s.stand.timer >= s.stand.delay  ){
						s.stand.nowFrame  ++ ;
						s.stand.timer = 0 ;
						if ( s.stand.nowFrame >= s.stand.totalFrame ){
							s.stand.nowFrame = 0 ;
						}
					}
					gameCtx.fillText(s.name,x,y+100);
				}
			} 
			if ( town.transfer.console.soldier !== undefined ){
				common.drawObject(town.transfer.button);
			}
		},
		showTransfer : function(){

			common.drawObject(this.transfer.console);

			if ( this.transfer.console.icon === "none" ){
				gameCtx.fillStyle = "black" ;
				gameCtx.font="24px Arial";
				var height = 34 ;
				var y = common.wrapText(this.transfer.console.content[0],this.transfer.console.w-20,height);
			}

			common.drawObject(this.transfer.chooseSoldier);
			gameCtx.font="12px Courier New";
			gameCtx.fillStyle = "white" ;
			for ( var i = 0 ; i < this.soldierList.length ; i ++ ){
				common.drawObject(this.soldierList[i]);
				var role = common.getRole(mySoldierList[i].id) ;
				var x = this.soldierList[i].x + 52, y = this.soldierList[i].y + 43 ;
				gameCtx.drawImage(canvasMap[role+"_stand"],canvasMap[role+"_stand"].width/5*mySoldierList[i].stand.nowFrame,0,canvasMap[role+"_stand"].width/5,canvasMap[role+"_stand"].height,x+mySoldierList[i].standOffsetX,y+mySoldierList[i].standOffsetY,canvasMap[role+"_stand"].width/5,canvasMap[role+"_stand"].height);
				if ( mySoldierList[i].stand.timer < mySoldierList[i].stand.delay  ){
					mySoldierList[i].stand.timer ++ ;
				} else if ( mySoldierList[i].stand.timer >= mySoldierList[i].stand.delay  ){
					mySoldierList[i].stand.nowFrame  ++ ;
					mySoldierList[i].stand.timer = 0 ;
					if ( mySoldierList[i].stand.nowFrame >= mySoldierList[i].stand.totalFrame ){
						mySoldierList[i].stand.nowFrame = 0 ;
					}
				}
				gameCtx.fillText(mySoldierList[i].name,x,y+100);
				if ( mySoldierList[i].level >= mySoldierList[i].transferLevel ) {
					gameCtx.drawImage(canvasMap["tick"],this.soldierList[i].x+10,this.soldierList[i].y+10);
				}
			}
			if ( this.isTransfer === "beginner" ){
				this.showTransferChoose("beginner") ;
			}
		},		
		showMission : function(){
			common.drawObject(this.chat);
			//common.drawObject(this.chat.transferTextTag);
			common.drawObject(this.chat.transferTextBack);
			common.drawObject(this.chat.transferText);

		},	
		showCharacter : function(){

			gameCtx.fillStyle = "black" ;
			gameCtx.font="24px Arial";

			common.drawObject(this.character.status);
			common.drawObject(this.character.skill);


			common.drawObject(this.character.item);
			for ( var i = 0 ; i < this.character.item.list.length ; i ++ ){
				common.drawObject(this.character.item.list[i]);
			}
			if ( town.character.item.nowPage > 0 )
				common.drawObject(this.character.item.up);
			if ( (town.character.item.nowPage+1)*8 < itemList.length )
				common.drawObject(this.character.item.down);

			gameCtx.fillText(money,this.character.item.x+65,this.character.item.y+230);

			common.drawObject(this.character.equip);
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				if ( mouseOver === "soldier" + i ){
					for ( var j = 0 ; j < this.soldierList[i].equip.length ; j ++ ){
						common.drawObject(this.soldierList[i].equip[j]);
					}
					break ;
				}
			}
			common.drawObject(this.character.console);
			if ( this.character.console.icon.canvas !== undefined && this.character.console.icon.canvas !== null ){
				common.drawObject(this.character.console.icon);
				common.drawObject(this.character.console.name);
				gameCtx.font="24px Arial";
				var height = 34 ;
				var y = common.wrapText(this.character.console.content[0],this.character.console.w-20,height);
				for ( var i = 1 ; i < this.character.console.content.length ; i ++ ){
					if ( i === 1 )
						this.character.console.content[i].y = y + height ;
					else 
						this.character.console.content[i].y = this.character.console.content[i-1].y + height ;

					common.drawObject(this.character.console.content[i]);
				}
			} else if ( this.character.console.icon === "none" ){
				common.drawObject(this.character.console.name);
				gameCtx.font="24px Arial";
				var height = 34 ;
				var y = common.wrapText(this.character.console.content[0],this.character.console.w-20,height);
				for ( var i = 1 ; i < this.character.console.content.length ; i ++ ){
					if ( i === 1 )
						this.character.console.content[i].y = y + height ;
					else 
						this.character.console.content[i].y = this.character.console.content[i-1].y + height ;

					common.drawObject(this.character.console.content[i]);
				}
			}
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				if ( mouseOver === "soldier" + i ){
					gameCtx.fillText(mySoldierList[i].name,this.character.status.x+120,this.character.status.y+88);
					gameCtx.fillText(mySoldierList[i].level,this.character.status.x+120,this.character.status.y+127);
					gameCtx.fillText(mySoldierList[i].nowExp+"/"+mySoldierList[i].goalExp,this.character.status.x+120,this.character.status.y+163);
					var atkText = mySoldierList[i].atk ;
					if ( mySoldierList[i].itemAtk > 0 ){
						atkText += " (+" + mySoldierList[i].itemAtk + ")" ;
					} else if ( mySoldierList[i].itemAtk < 0  ){
						atkText += " (-" + mySoldierList[i].itemAtk + ")" ;
					}
					gameCtx.fillText(atkText,this.character.status.x+147,this.character.status.y+212);
					gameCtx.fillText(mySoldierList[i].speed,this.character.status.x+147,this.character.status.y+250);
					for ( var j = 0 ; j < this.soldierList[i].skill.length ; j ++ ){
						common.drawObject(this.soldierList[i].skill[j]);
						common.drawObject(this.soldierList[i].skill[j].icon);
						common.drawObject(this.soldierList[i].skill[j].upgrade);
						common.drawObject(this.soldierList[i].skill[j].name);
						common.drawObject(this.soldierList[i].skill[j].nowLevel);
					}
					gameCtx.fillText(mySoldierList[i].point,this.character.skill.x+180,this.character.skill.y+388);
					break ;
				}
			}

			common.drawObject(this.character.chooseSoldier);
			gameCtx.font="12px Courier New";
			gameCtx.fillStyle = "white" ;
			for ( var i = 0 ; i < this.soldierList.length ; i ++ ){
				common.drawObject(this.soldierList[i]);
				var role = common.getRole(mySoldierList[i].id) ;
				var x = this.soldierList[i].x + 52, y = this.soldierList[i].y + 43 ;
				gameCtx.drawImage(canvasMap[role+"_stand"],canvasMap[role+"_stand"].width/5*mySoldierList[i].stand.nowFrame,0,canvasMap[role+"_stand"].width/5,canvasMap[role+"_stand"].height,x+mySoldierList[i].standOffsetX,y+mySoldierList[i].standOffsetY,canvasMap[role+"_stand"].width/5,canvasMap[role+"_stand"].height);
				if ( mySoldierList[i].stand.timer < mySoldierList[i].stand.delay  ){
					mySoldierList[i].stand.timer ++ ;
				} else if ( mySoldierList[i].stand.timer >= mySoldierList[i].stand.delay  ){
					mySoldierList[i].stand.nowFrame  ++ ;
					mySoldierList[i].stand.timer = 0 ;
					if ( mySoldierList[i].stand.nowFrame >= mySoldierList[i].stand.totalFrame ){
						mySoldierList[i].stand.nowFrame = 0 ;
					}
				}
				gameCtx.fillText(mySoldierList[i].name,x,y+100);

			}
			if ( town.item !== null ){
				for ( var i = 0 ; i < this.soldierList.length ; i ++ ){
					for ( var j = 0 ; j < town.item.role.length ; j ++ ){
						if ( town.item.role[j] === mySoldierList[i].id ){ 
							gameCtx.drawImage(canvasMap["tick"],this.soldierList[i].x+10,this.soldierList[i].y+10);
							break ;
						}
					}
				}
				
			}
		},
		showAll : function(){
			common.setMouseEvent(town.mouseOver,town.mouseClick,town.mouseDblclick);
			this.showBackground();
			this.showObject();
			if ( town.showPage === "map" ){
				this.showMap();
			} else if ( town.showPage === "character" ){
				this.showCharacter();
			} else if ( town.showPage === "mission" ){
				this.showMission();
			} else if ( town.showPage === "transfer" ){
				this.showTransfer();
			}
		}
	}

	window.onload = common.init();
})();

window.addEventListener("load", function() {
    FastClick.attach(document.body)
}, !1);


