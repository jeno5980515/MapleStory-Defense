window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
        window.setTimeout(a, 1E3 / 60)
    }
}();

var Defender = (function(){ 
	var IE = "ActiveXObject" in window ;
	var gameCanvas , gameCtx ;
	var defenderList = [] ;
	var imageList = ["background","beginner_stand","atkUp","snail_move","invoke","choose_soldier","choose_soldier_back","description","close","reset","confirm","beginner_hit","beginner_attack","beginner_attack_effect","snail_hit","number_damage","snail_die","hp","hp_bar","bg_stage1_path_top","bg_stage1_path_mid","bg_stage1_path_bottom","bg_stage1_front","bg_stage1_back_bottom","bg_stage1_back_top","bg_stage1_stand","number_damage2","create","exp_bar","exp","levelup","clear","fail","start","quit","restart","info","info_back","info_card","info_close","fullscreen",
	"bg_town_back0","bg_town_back1","bg_town_back2","bg_town_back3","bg_town_back4","bg_town_back5","bg_town_back6","bg_town_back7",
	"box","battle","status","choose_soldier_back2","choose_soldier2","skill","up","upgrade","skill_back","item","equip","console",
	"tag0","tag1","tag2","map_0",
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
	var monsterIdList = ['snail','bat',"ironhog"];
	var roleDescriptionList = ['beginner','archer','magician','rogue',"swordman"] ;
	var monsterDescriptionList = ['snail','bat',"ironhog"] ;
	var soldierMap = {} ; 
	var monsterMap = {} ;
	var monsterList = [] ;
	var monsterTypeList = [] ;
	var animationList = [] ;
	var mySoldierList = [] ;
	var fullscreen = {} ;
	var doneStage = 0 ;
	var money = 0 ;
	var invokeAnimationTimer = 0 , invokeAnimationDelay = 5 , invokeAnimationNowFrame = 0 , invokeAnimationTotalFrame = 8 ;

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
					gameCtx.drawImage(obj.canvas,obj.x,obj.y,obj.w*ratio,obj.h*ratio);
				else 
					gameCtx.drawImage(obj.canvas,obj.nowFrame*obj.w,0,obj.w,obj.h,obj.x,obj.y,obj.w*ratio,obj.h*ratio);
			} else {
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
		initSoldierMap : function(){

			var beginner = common.createSoldier({
				id : 0,
				atk : 15,
				speed: 60,
				range: 150,
				level: 1,
				transferLevel: 10,
				hitFrame: 3,
				standFrame: 5,
				attackFrame: 3,
				attackEffectFrame: 2,
				attackEffectDx : -27 ,
				attackEffectDy : 5 ,
				attackAnimationFrame: 1,
				attackAnimationBeginFrame:2,
				attackOffsetX : -3 ,
				attackType : ["physical"]
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
					if ( this.nowLevel > 0)
						this.ratio += this.ratioUpgrade ;
					this.nowLevel ++ ;
				},		
				canvas : {
					state : "doubleArrow" ,
					w : canvasMap["archer_skill0"].width / 6 ,
					h : canvasMap["archer_skill0"].height ,
					canvas : canvasMap["archer_skill0"] ,
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
									canvas : canvasMap["archer_skill0_effect"] ,
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
								target[i].isHit({id:-1,canvas:canvasMap["archer_skill0_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:6,width:canvasMap["archer_skill0_hit"].width/6,height:canvasMap["archer_skill0_hit"].height,type:"archer_skill0",attackType:attackType}) ;
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
						this.ratio += this.ratioUpgrade ;
						this.probability += this.probabilityUpgrade;
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
				id : 1,
				atk : 30,
				speed: 40,
				range: 200,
				level: 1,
				transferLevel: 10,
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
				hitDy : 45 ,
				skill : [doubleArrow,criticalArrow] ,
				attackType : ["sky","physical"]
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
					if ( this.nowLevel > 0)
						this.ratio += this.ratioUpgrade ;
					this.nowLevel ++ ;
				},				
				canvas : {
					state : "magicClaw" ,
					w : canvasMap["magician_skill0"].width / 3 ,
					h : canvasMap["magician_skill0"].height ,
					canvas : canvasMap["magician_skill0"] ,
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
									canvas : canvasMap["magician_skill0_effect"] ,
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
									target[0].isHit({id:-1,canvas:canvasMap["magician_skill0_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:5,width:canvasMap["magician_skill0_hit"].width/5,height:canvasMap["magician_skill0_hit"].height,type:"magician_skill0",attackType:attackType}) ;
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
					if ( this.nowLevel > 0)
						this.ratio += this.ratioUpgrade ;
					this.nowLevel ++ ;
				},				
				canvas : {
					state : "magicBomb" ,
					w : canvasMap["magician_skill1"].width / 3 ,
					h : canvasMap["magician_skill1"].height ,
					canvas : canvasMap["magician_skill1"] ,
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
					hitDy : -80 ,
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
									canvas : canvasMap[name] ,
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
										target[j].isHit({id:-1,canvas:canvasMap[name+"_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name,attackType:attackType}) ;
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
						var count = 0 , r = 100 ;
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
				id : 2,
				atk : 60,
				speed: 100,
				range: 300,
				level: 1,
				transferLevel: 10,
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
				attackType : ["magic"]
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
					if ( this.nowLevel > 0)
						this.effectRatio += this.ratioUpgrade ;
					this.nowLevel ++ ;
				},		
				canvas : {
					state : "disorder" ,
					w : canvasMap["rogue_skill0"].width / 3 ,
					h : canvasMap["rogue_skill0"].height ,
					canvas : canvasMap["rogue_skill0"] ,
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
									canvas : canvasMap[name] ,
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
								target[0].isHit({canvas:canvasMap[name+"_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name,hitEffectFrame:hitEffectFrame,buff:true,hitEffectDx:hitEffectDx,hitEffectDy:hitEffectDy,hitEffectDelay:hitEffectDelay,hitEffectVx:hitEffectVx,attackType:attackType}) ;
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
					if ( this.nowLevel > 0)
						this.ratio += this.ratioUpgrade ;
					this.nowLevel ++ ;
				},				
				canvas : {
					state : "doubleStab" ,
					w : canvasMap["rogue_skill1"].width / 3 ,
					h : canvasMap["rogue_skill1"].height ,
					canvas : canvasMap["rogue_skill1"] ,
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
					hitDx : -42 ,
					hitDy : -40 ,
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
									canvas : canvasMap[name] ,
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
									target[0].isHit({canvas:canvasMap[name+"_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name,attackType:attackType}) ;
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
				id : 3,
				atk : 50,
				speed: 30,
				range: 100,
				level: 1,
				transferLevel: 10,
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
				attackType : ["physical"]
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
					if ( this.nowLevel > 0)
						this.ratio += this.ratioUpgrade ;
					this.nowLevel ++ ;
				},			
				canvas : {
					state : "slashBlast" ,
					w : canvasMap["swordman_skill0"].width / 3 ,
					h : canvasMap["swordman_skill0"].height ,
					canvas : canvasMap["swordman_skill0"] ,
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
					hitDx : -15 ,
					hitDy : -20 ,
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
									canvas : canvasMap[name] ,
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
									target[j].isHit({id:-1,canvas:canvasMap[name+"_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name,attackType:attackType}) ;
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
					if ( this.nowLevel > 0)
						this.ratio += this.ratioUpgrade ;
					this.nowLevel ++ ;
				},			
				canvas : {
					state : "powerStrike" ,
					w : canvasMap["swordman_skill1"].width / 3 ,
					h : canvasMap["swordman_skill1"].height ,
					canvas : canvasMap["swordman_skill1"] ,
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
					hitDx : -50 ,
					hitDy : -13 ,
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
									canvas : canvasMap[name] ,
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
								target[0].isHit({id:-1,canvas:canvasMap[name+"_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name}) ;
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
				id : 4,
				atk : 60,
				speed: 150,
				range: 200,
				level: 1,
				transferLevel: 10,
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
				attackType : ["physical"]
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
				offsetX : 20 ,
				offsetY : -3 ,
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
				offsetY : -25 ,
				offsetX : 10 ,
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
				offsetY : -33 ,
				hpDx : 15 ,
				attribute:[{
					name : "physical" ,
					ratio : 0.5
				},{
					name : "magic" ,
					ratio : 1.5 
				}]
			});
			monsterMap['ironhog'] = ironhog ;
		},
		createMonsterSkill : function(){

		},
		createMonster : function(data){
			var monster = {
				state : "move" ,
				id : data.id || 0 ,
				x : data.x || 0 ,
				y : data.y || 370 ,
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
						for ( var i = 0 ; i < d.length ; i ++ ){
							common.createAnimation({
								canvas : canvasMap["number_damage_"+d[i]] ,
								x : this.x + dx + this.offsetX +this.hpDx,
								y : this.y + dy - 30 + this.offsetY+this.hpDy,
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
						common.createAnimation({
							canvas : canvasMap["number_damage2_10"] ,
							x : this.x + dx - 15 + this.offsetX+this.hpDx,
							y : this.y + dy - 45 + this.offsetY+this.hpDy,
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
								canvas : canvasMap["number_damage2_"+d[i]] ,
								x : this.x + dx - 15 + this.offsetX+this.hpDx ,
								y : this.y + dy - 45 + this.offsetY+this.hpDy,
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
					gameCtx.drawImage(canvas,w*nowFrame,0,w,h,this.x+this.offsetX+offsetX,this.y+this.offsetY+offsetY,w,h);
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
					gameCtx.drawImage(canvasMap["hp_bar"],this.x-5+this.offsetX+this.hpDx,this.y-25+this.offsetY+this.hpDy);
					gameCtx.drawImage(canvasMap["hp"],this.x-2+this.offsetX+this.hpDx,this.y-22.5+this.offsetY+this.hpDy,canvasMap["hp"].width*(this.nowHp/this.maxHp)*46,canvasMap["hp"].height+0.5);
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
								canvas : canvasMap[type+"_hit_effect"] ,
								x : data.hitEffectDx +this.offsetX + this.hpDx ,
								y : - 45 + data.hitEffectDy+this.offsetY+this.hpDy ,
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
							canvas : canvasMap[type+"_hit"] || data.canvas,
							x : this.x + dx + this.offsetX +this.hpDx,
							y : this.y  - 45 + dy + this.offsetY+this.hpDy ,
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
						canvas : canvas ,
						delay : 10 ,
						timer : 0 
					}
					var w = canvasMap[monsterIdList[this.id]+"_hit"].width ;
					var h = canvasMap[monsterIdList[this.id]+"_hit"].height ;
					var canvas = canvasMap[monsterIdList[this.id]+"_hit"] ;
					this.hit = {
						nowFrame : 0 ,
						totalFrame : data.hitFrame ,
						w : w / data.hitFrame ,
						h : h ,
						canvas : canvas ,
						delay : 10 ,
						timer : 0 
					}

					var w = canvasMap[monsterIdList[this.id]+"_die"].width ;
					var h = canvasMap[monsterIdList[this.id]+"_die"].height ;
					var canvas = canvasMap[monsterIdList[this.id]+"_die"] ;
					this.die = {
						nowFrame : 0 ,
						totalFrame : data.dieFrame ,
						w : w / data.dieFrame ,
						h : h ,
						canvas : canvas ,
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
				init : function(){
					this.setStateCanvas();
					return this ;
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
				isAttack : function(x,y){
					if ( preStage.isGameOver === true || preStage.isGameWin === true )
						return ;
					for ( var i = 0 ; i < this.skill.length ; i ++ ){
						if ( this.skill[i].nowLevel > 0 ){
							if (  this.skill[i].type === "active" && ( this.state === "stand" || this.state === this.skill[i].canvas.state ) && this.atkTimer <= 0  ){
								this.tempAttackType = this.attackType ;
								var result = this.skill[i].f(x,y,this.range,this.state,this[this.state],this.atk,this.effect,this.skill[i].ratio,this.tempAttackType) ;
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
								var result = this.skill[i].f(x,y,this.range,"null",this[this.state],this.atk) ;
							}
						}
					}
					if ( this.state === "attack" ){
						if ( this.attack.animationBeginFrame === this.attack.nowFrame && this.attack.animationBoolean === false ){
							common.createAnimation({
								canvas : canvasMap[roleList[this.id]+"_attack_effect"] ,
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
								var atkSum = { result : this.atk , state : [] } ;
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
						canvas : canvas ,
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
						canvas : canvas ,
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
		setMouseEvent : function(over,click){
			document.onclick = click ;
			document.onmousemove = over ;
			//document.ontouchend = click ;
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
			mySoldierList.push(common.clone(soldierMap['beginner']));
			mySoldierList.push(common.clone(soldierMap['archer']));
			mySoldierList.push(common.clone(soldierMap['magician']));
			mySoldierList.push(common.clone(soldierMap['rogue']));
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
				}
				else if ( nowPage === 'preStage' ){
					preStage.showAll();
				} else if ( nowPage.match('stage') !== null ){
					stage[nowStage].showAll();
				} else if ( nowPage === "town" ){
					town.showAll();
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
				fullscreen = { x : 1220 , y : 20 , canvas : canvasMap["fullscreen"] , w : canvasMap["fullscreen"].width ,h : canvasMap["fullscreen"].height } ;		
				common.initSoldierMap();
				common.initMonsterMap();
				common.initMySoldierList();
				common.initNumberDamage();
				nowPage = 'town' ;
				town.init();
				//preStage.init();
			}
		}
	}

	var preStage = {
		invokeList : [] ,
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
			this.invokeList = [] ;
			this.isShowInfo = false ;
			this.isInitInvoke = false ;
			this.isPickSoldier = null ;
			this.nowPickInvoke = null ;
			this.isGameWin = false ;
			this.isGameOver = false ;
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				mySoldierList[i].isPicked = false ;
				mySoldierList[i].reset();
			} 

			preStage.initBackground();
			preStage.initButton();
			preStage.initInvoke();
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
			preStage.invokeList = [] ;
			for ( var i = 0 ; i < 6 ; i ++ ){
				preStage.invokeList.push({x:i*210+90-24,y:roadTopY-54,w:canvasMap['invoke'].width/invokeAnimationTotalFrame,h:canvasMap['invoke'].height,soldier:{id:-1}});
				preStage.invokeList.push({x:i*210+170-24,y:roadBottomY-54,w:canvasMap['invoke'].width/invokeAnimationTotalFrame,h:canvasMap['invoke'].height,soldier:{id:-1}});
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
			document.body.style.cursor = "default" ;
			mouseOver = 'confirmButton' ;
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
			if ( preStage.isGameStart === false ){
				for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
					mySoldierList[i].isPicked = false ;
				} 
				preStage.isInitInvoke = false ;
				preStage.initInvoke();	
			}
		},
		setMouseEnterRestartButtonClick: function(){
			monsterList = [];
			nowPage = "preStage" ;
			preStage.isGameStart = false ;
			preStage.isGameWin = false ;
			preStage.isGameOver = false ;
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				mySoldierList[i].isPicked = false ;
				mySoldierList[i].reset();
			} 
			animationList = [] ;
			preStage.isInitInvoke = false ;
			preStage.initInvoke();	
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
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.invokeList[i].soldier.id === -1 &&
					common.isMouseEnterRange(temp,preStage.invokeList[i],offsetX,offsetY,ratio) ){
					preStage.setMouseEnterInvokeOver(i) ;
					return ;
				} else if (preStage.invokeList[i].soldier.id !== -1 &&
					common.isMouseEnterRange(temp,preStage.invokeList[i],offsetX,offsetY,ratio) ) {
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
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.invokeList[i].soldier.id === -1 &&
					common.isMouseEnterRange(temp,preStage.invokeList[i],offsetX,offsetY,ratio) ){
					preStage.setMouseEnterInvokeClick(i) ;
					return ;
				} else if (preStage.invokeList[i].soldier.id !== -1 &&
					common.isMouseEnterRange(temp,preStage.invokeList[i],offsetX,offsetY,ratio) ){
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
		showInvoke :function(){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.invokeList[i].soldier.id === -1 ){
					gameCtx.drawImage(canvasMap['bg_'+nowStage+"_stand"],preStage.invokeList[i].x+24,preStage.invokeList[i].y+57+54);
					var w = canvasMap['invoke'].width / invokeAnimationTotalFrame ;
					var h = canvasMap['invoke'].height ;
					if ( preStage.isGameStart === false )
						gameCtx.drawImage(canvasMap['invoke'],invokeAnimationNowFrame*w,0,w,h,preStage.invokeList[i].x,preStage.invokeList[i].y,w,h);

					//gameCtx.drawImage(canvasMap['invoke'],invokeAnimationNowFrame*w,0,w,h,preStage.invokeList[i].x-24,preStage.invokeList[i].y-54,w,h);

				} else {
					gameCtx.drawImage(canvasMap['bg_'+nowStage+"_stand"],preStage.invokeList[i].x,preStage.invokeList[i].y+57);
					var state = preStage.invokeList[i].soldier.state ;
					var nowFrame = preStage.invokeList[i].soldier[state].nowFrame ; 
					var canvas = preStage.invokeList[i].soldier[state].canvas ;
					var w = preStage.invokeList[i].soldier[state].w ;
					var h = preStage.invokeList[i].soldier[state].h ;
					gameCtx.drawImage(canvas,w*nowFrame,0,w,h,preStage.invokeList[i].x+preStage.invokeList[i].soldier[state].offsetX,preStage.invokeList[i].y+preStage.invokeList[i].soldier[state].offsetY,w,h);

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
		showBackground : function(){
			gameCtx.drawImage(canvasMap['background'],background.x,background.y);
			for ( var i = 0 ; i < 3 ; i ++ ){
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_back_top"],i*canvasMap['bg_'+nowStage+"_back_top"].width,-130);
			} 
			for ( var i = 0 ; i < 2 ; i ++ ){
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_back_bottom"],i*canvasMap['bg_'+nowStage+"_back_bottom"].width,100);
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_back_bottom"],i*canvasMap['bg_'+nowStage+"_back_bottom"].width-canvasMap['bg_'+nowStage+"_back_bottom"].width/2,200);
			} 
			gameCtx.drawImage(canvasMap['bg_'+nowStage+"_front"],0,-115);
			for ( var i = 0 ; i < 5 ; i ++ ){
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_path_top"],i*canvasMap['bg_'+nowStage+"_path_top"].width,380);
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_path_mid"],i*canvasMap['bg_'+nowStage+"_path_mid"].width,canvasMap['bg_'+nowStage+"_path_top"].height+380);
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_path_bottom"],i*canvasMap['bg_'+nowStage+"_path_bottom"].width,canvasMap['bg_'+nowStage+"_path_top"].height+canvasMap['bg_'+nowStage+"_path_mid"].height+380);
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
			}
			if ( preStage.isGameStart === false ){
				gameCtx.drawImage(canvasMap['info'],preStage.infoButton.nowFrame*preStage.infoButton.w,0,preStage.infoButton.w,preStage.infoButton.h,preStage.infoButton.x,preStage.infoButton.y,preStage.infoButton.w,preStage.infoButton.h);
				common.loopAnimation(preStage.infoButton);
			}
		},
		showAll : function(){
			common.setMouseEvent(preStage.mouseOver,preStage.mouseClick);
			preStage.showBackground();
			preStage.showDescription();
			preStage.showButton();
			preStage.showInvoke();
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
				this.chooseBack = { x : canvasWidth/2-canvasMap['choose_soldier'].width/2 , y : canvasHeight/2-canvasMap['choose_soldier'].height/2 , w : canvasMap['choose_soldier'].width , h : canvasMap['choose_soldier'].height , canvas : canvasMap['choose_soldier'] } ;
				preStage.pickSoldier.closeButton = { x : 990 , y : 160 , w : canvasMap['close'].width , h : canvasMap['close'].height } ;
			},
			setMouseEnterPickSoldierOver : function(index){
				document.body.style.cursor = "pointer" ;
				mouseOver = "pickSoldier" + index ;
			},
			setInvokeToSoldier : function(index){
				preStage.invokeList[preStage.nowPickInvoke].soldier = mySoldierList[index] ;
				preStage.pickSoldier.pickSoldierList.splice(index,1);
				//preStage.invokeList[preStage.nowPickInvoke].w = canvasMap[common.getRole(mySoldierList[index].id)+"_stand"].width/3;
				//preStage.invokeList[preStage.nowPickInvoke].h = canvasMap[common.getRole(mySoldierList[index].id)+"_stand"].height;
				mySoldierList[index].isPicked = true ;
				preStage.isShowChooseSoldier = false ;
				preStage.invokeList[preStage.nowPickInvoke].x += 24 ;
				preStage.invokeList[preStage.nowPickInvoke].y += 54 ;
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
				gameCtx.fillText(roleList[mySoldierList[soldierIndex].id],x,y+98);
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
				this.infoBack = { x : canvasWidth/2-canvasMap['info_back'].width/2 , y : canvasHeight/2-canvasMap['info_back'].height/2 , canvas : canvasMap['info_back'] , w : canvasMap['info_back'].width , h : canvasMap['info_back'].height };
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
							gameCtx.fillText("Defence : "+monsterTypeList[i].def,360,560);
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
				gameCtx.drawImage(canvasMap[monsterIdList[monsterTypeList[index].id]+"_move"],monsterTypeList[index].move.nowFrame*monsterTypeList[index].move.w,0,monsterTypeList[index].move.w,monsterTypeList[index].move.h,x+monsterTypeList[index].offsetX+22,y+monsterTypeList[index].offsetY+80,monsterTypeList[index].move.w,monsterTypeList[index].move.h) ;
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
		addMonsterDelay : 70 ,
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
				gameCtx.drawImage(animationList[i].canvas,animationList[i].nowFrame*animationList[i].width,0,animationList[i].width,animationList[i].height,animationList[i].x+dx,animationList[i].y+dy,animationList[i].width,animationList[i].height);
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
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ) {
				if ( preStage.invokeList[i].soldier.id !== -1 ){
					if ( preStage.invokeList[i].isLevelUp === true ){
						common.createAnimation({
							canvas : canvasMap["levelup"] ,
							x : preStage.invokeList[i].x - 120 ,
							y : preStage.invokeList[i].y - 260,
							nowFrame : 0 ,
							timer : 0 ,
							delay : 5 ,
							totalFrame : 21 ,
							width : canvasMap["levelup"].width / 21  , 
							height : canvasMap["levelup"].height  
						});
						preStage.invokeList[i].isLevelUp = false ;
						//gameCtx.fillText("Level Up !!",preStage.invokeList[i].x,preStage.invokeList[i].y-25) ;	
					}
				}
			}	
		},
		setLevelUp : function(index){
			var temp = preStage.invokeList[index].soldier.goalExp - preStage.invokeList[index].soldier.nowExp ;
			preStage.invokeList[index].isLevelUp = true ;
			preStage.invokeList[index].soldier.nowExp = 0 ;
			preStage.invokeList[index].soldier.level ++ ;
			if ( preStage.invokeList[index].soldier.level < 10) 
				preStage.invokeList[index].soldier.goalExp = Math.round(2*preStage.invokeList[index].soldier.goalExp) ;
			else if ( preStage.invokeList[index].soldier.level < 30 ) {
				preStage.invokeList[index].soldier.goalExp = Math.round(1.5*preStage.invokeList[index].soldier.goalExp) ;
			} else if ( preStage.invokeList[index].soldier.level < 40 ) {
				preStage.invokeList[index].soldier.goalExp = Math.round(1.4*preStage.invokeList[index].soldier.goalExp) ;
			} else if ( preStage.invokeList[index].soldier.level < 50 ) {
				preStage.invokeList[index].soldier.goalExp = Math.round(1.3*preStage.invokeList[index].soldier.goalExp) ;
			} else if ( preStage.invokeList[index].soldier.level < 60 ) {
				preStage.invokeList[index].soldier.goalExp = Math.round(1.2*preStage.invokeList[index].soldier.goalExp) ;
			} else if ( preStage.invokeList[index].soldier.level < 70 ) {
				preStage.invokeList[index].soldier.goalExp = Math.round(1.1*preStage.invokeList[index].soldier.goalExp) ;
			} else if ( preStage.invokeList[index].soldier.level < 80 ) {
				preStage.invokeList[index].soldier.goalExp = Math.round(1.09*preStage.invokeList[index].soldier.goalExp) ;
			} 
			preStage.invokeList[index].soldier.atk += 2 ;
			preStage.invokeList[index].soldier.tempAtk += 2 ;
			preStage.invokeList[index].soldier.point ++ ;
		},
		showAddExp : function(){
			this.expDelay = 0 ;
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ) {
				if ( preStage.invokeList[i].soldier.id !== -1 ){
					var exp = preStage.invokeList[i].soldier.nowExp ;
					gameCtx.drawImage(canvasMap["exp_bar"],preStage.invokeList[i].x-8,preStage.invokeList[i].y-20);
					var goalExp = preStage.invokeList[i].soldier.goalExp ;
					gameCtx.drawImage(canvasMap["exp"],preStage.invokeList[i].x+1-8,preStage.invokeList[i].y+1-20,canvasMap["exp"].width*(exp/goalExp)*68,canvasMap["exp"].height-1);
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
						for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ) {
							if ( preStage.invokeList[i].soldier.id !== -1 ){
								count ++ ;
							}
						}
						this.exp = Math.round(this.exp / count) ;
						this.expIsCount = true ;
					}
					for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ) {
						if ( preStage.invokeList[i].soldier.id !== -1 ){
							preStage.invokeList[i].soldier.nowExp ++ ;
							if ( preStage.invokeList[i].soldier.nowExp >= preStage.invokeList[i].soldier.goalExp ){
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
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.invokeList[i].soldier.id !== -1 ){
					preStage.invokeList[i].soldier.isAttack(preStage.invokeList[i].x,preStage.invokeList[i].y);
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
				canvas : canvasMap["start"] ,
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
				for ( var i = 0 ; i < 1 ; i ++ ){
					stage.monsterAllList.push(common.clone(monsterMap['snail']));
					stage.monsterAllList.push(common.clone(monsterMap['bat']));
					stage.monsterAllList.push(common.clone(monsterMap['ironhog']));
				}
			},
			initMonsterIdList : function(){

			},
			init : function(){
				stage.init();
				stage.initExp(100);
				//stage.stage1.initMonsterList();
			},
			showAll : function(){
				common.setMouseEvent(preStage.mouseOver,preStage.mouseClick);
				stage.addMonster();
				preStage.showBackground();
				preStage.showDescription();
				preStage.showInvoke();
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
		map : {} ,
		character : {} ,
		nowTag : {} ,
		showPage : "none" ,
		soldierList : [] ,
		isChooseSoldier : false ,
		consoleContent : {} ,
		init : function(){
			this.isChooseSoldier = false ;
			this.soldierList = [] ;
			this.showPage = "none" ;
			this.initObject();
			animationList = [] ;
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
					var s = { x : x2 , y : y2 , canvas : canvasMap["skill_back"] , w : canvasMap["skill_back"].width , h : canvasMap["skill_back"].height ,
						icon : { x : x2 + 7 , y : y2 + 5, canvas : canvasMap[mySoldierList[i].skill[j].canvasName+"_icon"] , nowFrame : n , w : canvasMap[mySoldierList[i].skill[j].canvasName+"_icon"].width/3 , h : canvasMap[mySoldierList[i].skill[j].canvasName+"_icon"].height , ratio : 1.7 } ,
						upgrade : { x : x2 + 235 , y : y2 + 39, canvas : canvasMap["upgrade"] , w : canvasMap["upgrade"].width / 2 , h : canvasMap["upgrade"].height , nowFrame : u } ,
						name : { x : x2 + 75, y : y2 + 27, text : mySoldierList[i].skill[j].name } ,
						nowLevel : { x : x2 + 75, y : y2 + 59 , text : mySoldierList[i].skill[j].nowLevel } 
					} ;
					skill.push(s);
				}
				this.soldierList.push({x:x,y:y,w:canvasMap['choose_soldier_back2'].width,h:canvasMap['choose_soldier_back2'].height,canvas:canvasMap['choose_soldier_back2'],skill:skill});
			}
		},
		initConsole : function(){
			town.character.console = { x : 1040 , y : 240 , w : canvasMap["console"].width , h : canvasMap["console"].height , canvas : canvasMap["console"] ,
				icon : { x : 1050 , y : 250 } ,
				name : { x : 1115 , y : 285 } ,
				content : [{ x : 1060 , y : 340 } ] 
			};
		},
		initObject : function(){
			this.nowTag = 	{ x : 540 , y : 295 , w : canvasMap["tag2"].width / 4 , h : canvasMap["tag2"].height , canvas : canvasMap["tag2"] , nowFrame : 0 , totalFrame : 4 , timer : 0 , delay : 5  } ;
			this.box = { x : 1100 , y : 505 , w : canvasMap["box"].width , h : canvasMap["box"].height };
			this.battle = { x : 100 , y : 530 , w : canvasMap["battle"].width , h : canvasMap["battle"].height };
			this.map = { x : canvasWidth/2-canvasMap['map_0'].width/2 ,y : canvasHeight/2-canvasMap['map_0'].height/2 , w : canvasMap["map_0"].width  , h :canvasMap["map_0"].height , canvas : canvasMap["map_0"] ,
				closeButton : {
					x : 1140 , y : 20 , w : canvasMap["close"].width , h : canvasMap["close"].height , canvas : canvasMap["close"]
				} ,
				tag : [
					{ x : 457 , y : 229 , w : canvasMap["tag1"].width / 7 , h : canvasMap["tag1"].height , canvas : canvasMap["tag1"] , nowFrame : 0 , totalFrame : 7 , timer : 0 , delay : 5 , stage : 1 }
				] 
			};
			this.character = { 
				chooseSoldier : { x : 8 , y : 540 , w : canvasMap["choose_soldier2"].width , h : canvasMap["choose_soldier2"].height , canvas : canvasMap["choose_soldier2"] },
				status : { x : 690 , y : 280 , w : canvasMap["status"].width , h : canvasMap["status"].height , canvas : canvasMap["status"] },
				skill : { x : 10 , y : 50 , w : canvasMap["skill"].width , h : canvasMap["skill"].height , canvas : canvasMap["skill"] },
				item : { x : 690 , y : 30 , w: canvasMap["item"].width , h : canvasMap["item"].height , canvas : canvasMap["item"] },
				equip : { x : 342 , y : 30 , w : canvasMap["equip"].width , h : canvasMap["equip"].height , canvas : canvasMap["equip"] },
				console : { x : 1040 , y : 240 , w : canvasMap["console"].width , h : canvasMap["console"].height , canvas : canvasMap["console"] ,
					icon : { x : 1050 , y : 250 } ,
					name : { x : 1115 , y : 285 } ,
					content : [{ x : 1060 , y : 340 } ] 
				}

			};

			this.initCharacterObject();
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
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_back_bottom"],i*canvasMap['bg_'+nowStage+"_back_bottom"].width,100);
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_back_bottom"],i*canvasMap['bg_'+nowStage+"_back_bottom"].width-canvasMap['bg_'+nowStage+"_back_bottom"].width/2,200);
			} 
			gameCtx.drawImage(canvasMap['bg_town_back3'],-200,100);
			gameCtx.drawImage(canvasMap['bg_town_back0'],400,100);
			gameCtx.drawImage(canvasMap['bg_'+nowStage+"_front"],0,165);
			gameCtx.drawImage(canvasMap['bg_town_back4'],500,100);
			for ( var i = 0 ; i < 5 ; i ++ ){
				gameCtx.drawImage(canvasMap["bg_stage1_path_top"],i*canvasMap['bg_'+nowStage+"_path_top"].width,600);
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_path_mid"],i*canvasMap['bg_'+nowStage+"_path_mid"].width,canvasMap['bg_'+nowStage+"_path_top"].height+600);
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_path_mid"],i*canvasMap['bg_'+nowStage+"_path_mid"].width,canvasMap['bg_'+nowStage+"_path_top"].height+canvasMap['bg_'+nowStage+"_path_mid"].height+600);
				gameCtx.drawImage(canvasMap['bg_'+nowStage+"_path_bottom"],i*canvasMap['bg_'+nowStage+"_path_bottom"].width,canvasMap['bg_'+nowStage+"_path_top"].height+canvasMap['bg_'+nowStage+"_path_mid"].height+canvasMap['bg_'+nowStage+"_path_mid"].height+600);
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
		setMouseEnterSoldierClick : function(i){
			town.isChooseSoldier = true ;
			document.body.style.cursor = "pointer" ;
			mouseOver = "soldier" + i ;
			town.initConsole();
		},
		setMouseEnterSkillOver : function(i){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterUpgradeOver : function(i){
			document.body.style.cursor = "pointer" ;
		},
		setMouseEnterSkillClick : function(i,j){
			this.character.console.content = [{ x : 1060 , y : 340 }] ;
			var skill = mySoldierList[i].skill[j] ;
			town.character.console.icon.canvas = canvasMap[skill.canvasName+"_icon"] ;
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
						text += " (to" + (skill.effectRatio+skill.ratioUpgrade )*100+"%)" ;
					}
					town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Ratio : "+text});
				}
				else {
					var text = skill.ratio*100+"%" ;
					if ( skill.nowLevel > 0 && skill.ratioUpgrade > 0 ){
						text += " (to" + (skill.ratio+skill.ratioUpgrade )*100+"%)" ;
					}
					town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Ratio : "+text});
				}
				town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Speed : "+skill.speed});
			} else {
				if ( skill.ratio !== undefined){
					var text = skill.ratio*100+"%" ;
					if ( skill.nowLevel > 0 && skill.ratioUpgrade > 0 ){
						text += " (to" + (skill.ratio+skill.ratioUpgrade )*100+"%)" ;
					}
					town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Ratio : "+text});
				}
				if ( skill.chance !== undefined){
					var text = skill.probability*100+"%" ;
					if ( skill.nowLevel > 0 && skill.probabilityUpgrade > 0 ){
						text += " (to" + (skill.probability+skill.probabilityUpgrade )*100+"%)" ;
					}
					town.character.console.content.push({x:town.character.console.content[0].x,y:0,text:"Probability : "+text});
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
		detectMouseEnterOver : function(temp,offsetX,offsetY,ratio){
			if ( town.showPage === "map"  ){
				for ( var i = 0 ; i < this.map.tag.length ; i ++ ){
					if ( common.isMouseEnterRange(temp,town.map.tag[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterTagOver(town.map.tag[i]) ;
						return ;
					} 				
				}
				if ( common.isMouseEnterRange(temp,town.map.closeButton,offsetX,offsetY,ratio) ){
					town.setMouseEnterMapCloseOver() ;
					return ;
				}
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
				document.body.style.cursor = "default" ;
			} else {
				if ( common.isMouseEnterRange(temp,town.box,offsetX,offsetY,ratio) ){
					town.setMouseEnterBoxOver() ;
					return ;
				} else if ( common.isMouseEnterRange(temp,town.battle,offsetX,offsetY,ratio) ){
					town.setMouseEnterBattleOver() ;
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
					if ( common.isMouseEnterRange(temp,town.map.tag[i],offsetX,offsetY,ratio) ){
						town.setMouseEnterTagClick(town.map.tag[i]) ;
						return ;
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
			} else {
				if ( common.isMouseEnterRange(temp,town.box,offsetX,offsetY,ratio) ){
					town.setMouseEnterBoxClick() ;
					return ;
				} else if ( common.isMouseEnterRange(temp,town.battle,offsetX,offsetY,ratio) ){
					town.setMouseEnterBattleClick() ;
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
		mouseOver :function(e){
			var info = common.getSizeInfo(e) ;
			town.detectMouseEnterOver(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		mouseClick: function(e){
			var info = common.getSizeInfo(e) ;
			town.detectMouseEnterClick(info.temp,info.offsetX,info.offsetY,info.ratio);
		},
		showObject : function(){
			gameCtx.drawImage(canvasMap['box'],this.box.x,this.box.y);
			gameCtx.drawImage(canvasMap['battle'],this.battle.x,this.battle.y);
		},
		showMap : function(){
			gameCtx.drawImage(this.map.canvas,this.map.x,this.map.y);
			gameCtx.drawImage(this.map.closeButton.canvas,this.map.closeButton.x,this.map.closeButton.y);
			//tag
			for ( var i = 0 ; i < this.map.tag.length ; i ++ ){
				gameCtx.drawImage(this.map.tag[i].canvas,this.map.tag[i].nowFrame*this.map.tag[i].w,0,this.map.tag[i].w,this.map.tag[i].h,this.map.tag[i].x,this.map.tag[i].y,this.map.tag[i].w,this.map.tag[i].h);
				common.loopAnimation(this.map.tag[i]);
				if ( this.map.tag[i].stage === doneStage + 1 ){
					this.nowTag.x = this.map.tag[i].x + this.map.tag[i].w/2 - this.nowTag.w/2;
					this.nowTag.y = this.map.tag[i].y - this.map.tag[i].h/2 - this.nowTag.h/2 ;
					common.drawObject(this.nowTag);
					common.loopAnimation(this.nowTag);
				}
			}
		},		
		showCharacter : function(){

			gameCtx.fillStyle = "black" ;
			gameCtx.font="24px Arial";

			common.drawObject(this.character.status);
			common.drawObject(this.character.skill);


			common.drawObject(this.character.item);
			common.drawObject(this.character.equip);
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
			}
			for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
				if ( mouseOver === "soldier" + i ){
					gameCtx.fillText(common.getRole(mySoldierList[i].id),this.character.status.x+120,this.character.status.y+88);
					gameCtx.fillText(mySoldierList[i].level,this.character.status.x+120,this.character.status.y+127);
					gameCtx.fillText(mySoldierList[i].nowExp+"/"+mySoldierList[i].goalExp,this.character.status.x+120,this.character.status.y+163);
					gameCtx.fillText(mySoldierList[i].atk,this.character.status.x+147,this.character.status.y+212);
					gameCtx.fillText(mySoldierList[i].speed,this.character.status.x+147,this.character.status.y+250);
					for ( var j = 0 ; j < this.soldierList[i].skill.length ; j ++ ){
						common.drawObject(this.soldierList[i].skill[j]);
						common.drawObject(this.soldierList[i].skill[j].icon);
						common.drawObject(this.soldierList[i].skill[j].upgrade);
						common.drawObject(this.soldierList[i].skill[j].name);
						common.drawObject(this.soldierList[i].skill[j].nowLevel);
					}
					/*
					for ( var j = 0 ; j < mySoldierList[i].skill.length ; j ++ ){
						var canvas = canvasMap[mySoldierList[i].skill[j].canvasName+"_icon"] ;
						gameCtx.drawImage(canvas,canvas.width/3*1,0,canvas.width/3,canvas.height,this.character.skill.x+13,this.character.skill.y+j*49+39,canvas.width/3*1.2,canvas.height*1.2);
						gameCtx.fillText(mySoldierList[i].skill[j].name,this.character.skill.x+60,this.character.skill.y+j*49+50);
						gameCtx.fillText(mySoldierList[i].skill[j].nowLevel,this.character.skill.x+60,this.character.skill.y+j*49+73);
						if ( mySoldierList[i].point >= 0 && mySoldierList[i].skill[j].nowLevel < mySoldierList[i].skill[j].topLevel ){
							gameCtx.drawImage(canvasMap["upgrade"],canvasMap["upgrade"].width/2,0,canvasMap["upgrade"].width/2,canvasMap["upgrade"].height,this.character.skill.x+169,this.character.skill.y+j*49+62,canvasMap["upgrade"].width/2,canvasMap["upgrade"].height);
						} else {
							gameCtx.drawImage(canvasMap["upgrade"],0,0,canvasMap["upgrade"].width/2,canvasMap["upgrade"].height,this.character.skill.x+169,this.character.skill.y+j*49+62,canvasMap["upgrade"].width/2,canvasMap["upgrade"].height);
						}
					}
					*/
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
				gameCtx.fillText(common.getRole(mySoldierList[i].id),x,y+100);

				
			}
		},
		showAll : function(){
			common.setMouseEvent(town.mouseOver,town.mouseClick);
			this.showBackground();
			this.showObject();
			if ( town.showPage === "map" ){
				this.showMap();
			} else if ( town.showPage === "character" ){
				this.showCharacter();
			} 
		}
	}

	window.onload = common.init();
})();

window.addEventListener("load", function() {
    FastClick.attach(document.body)
}, !1);


