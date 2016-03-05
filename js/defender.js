window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
        window.setTimeout(a, 1E3 / 60)
    }
}();

var Defender = (function(){ 
	var IE = "ActiveXObject" in window ;
	var gameCanvas , gameCtx ;
	var defenderList = [] ;
	var imageList = ["background","beginner_stand","swordman","atkUp","snail_move","invoke","choose_soldier","choose_soldier_back","description","close","reset","confirm","gameover","win","beginner_hit","beginner","beginner_attack","swordman_hit","beginner_attack_effect","snail","snail_hit","number_damage","snail_die","hp","hp_bar","bg_stage1_path_top","bg_stage1_path_mid","bg_stage1_path_bottom","bg_stage1_front","bg_stage1_back_bottom","bg_stage1_back_top","bg_stage1_stand","number_damage2",
	"archer","archer_stand","archer_attack","archer_hit","archer_attack_effect","archer_skill0_icon","archer_skill0_hit","archer_skill0_effect","archer_skill0","archer_skill1_icon",
	"magician","magician_stand","magician_attack","magician_hit","magician_attack_effect","magician_skill0_icon","magician_skill0_hit","magician_skill0_effect","magician_skill0","magician_skill1_icon","magician_skill1_hit","magician_skill1_effect","magician_skill1"] ;
	var loadImageProgress = 0 ;
	var imgMap = {} ;
	var canvasMap = {} ;
	var canvasWidth = 1350 , canvasHeight = 780 ;
	var roadBottomY = 450 ;
	var roadTopY = 230 ;
	var nowPage = 'loadPage' ; 
	var nowStage = 'stage1' ;
	var mySoldierList = [] ;
	var mouseOver = 'none' ;
	var nowChooseSoldier ;
	var roleList = ['beginner','archer','magician'] ;
	var monsterIdList = ['snail'];
	var roleDescriptionList = ['beginner','archer','magician'] ;
	var monsterDescriptionList = ['snail'] ;
	var soldierMap = {} ; 
	var monsterMap = {} ;
	var monsterList = [] ;
	var animationList = [] ;
	var isGameStart = false ;
	var invokeAnimationTimer = 0 , invokeAnimationDelay = 5 , invokeAnimationNowFrame = 0 , invokeAnimationTotalFrame = 8 ;

	var common = {
		createAnimation : function(obj){
			animationList.push(obj);
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
			var f = function(x,y,range,state,canvas,atk,effect,ratio){
				if ( state === s ){
					createEffectFunction(x,y,range,state,canvas,this.target);
					createHitFunction(x,y,range,state,canvas,this.target,atk,effect,ratio) ;
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
				attackAnimationBeginFrame:2
			}) ;
			soldierMap['beginner'] = beginner ;

			var doubleArrow = common.createSkill({
				name : "Double Arrow" ,
				canvasName : "archer_skill0" ,
				needLevel : 1 ,
				needSkill : [] ,
				nowLevel : 1 ,
				effect : [] ,
				speed : 200 ,
				timer : 200 ,
				target : [] ,
				ratio : 0.7 ,
				type : "active" ,				
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
					attackEffectDy : 47 ,
					attackEffectVx : 0 ,
					attackEffectVy : 0 ,
					hitDx : 0 ,
					hitDy : 27 ,
					offsetX : 0 ,
					offsetY : 0 
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
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio){
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								var atkSum = { result : Math.round((atk - target[i].def)*ratio), state : [] } ;
								for ( var j = 0 ; j < effect.length ; j ++ ){
									effect[j].f(atkSum);
								}
								target[i].isHit({id:-1,canvas:canvasMap["archer_skill0_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:6,width:canvasMap["archer_skill0_hit"].width/6,height:canvasMap["archer_skill0_hit"].height,type:"archer_skill0"}) ;
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
				canvasName : "archer_skill1" ,
				needLevel : 1 ,
				needSkill : [] ,
				nowLevel : 1 ,
				effect : [] ,
				target : "enemy" ,
				type : "passive" ,				
				probability : 0.5 , 
				ratio : 2 ,	
				f : function(d){
					var r = Math.random();
					if ( r < this.probability ){
						d.result *= this.ratio ;
						d.state.push("critical") ;
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
				attackEffectDy : 45 ,
				attackAnimationFrame: 1,
				attackAnimationBeginFrame:1,
				hitDx : 5 ,
				hitDy : 45 ,
				skill : [doubleArrow,criticalArrow] 
			}) ;
			soldierMap['archer'] = archer ;
			
			var magicClaw = common.createSkill({
				name : "Magic Claw" ,
				canvasName : "magician_skill0" ,
				needLevel : 1 ,
				needSkill : [] ,
				nowLevel : 1 ,
				effect : [] ,
				speed : 200 ,
				timer : 200 ,
				target : [] ,
				type : "active" ,
				ratio : 0.7 ,				
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
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio){
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								var atkSum = { result : Math.round((atk - target[0].def)*ratio) , state : [] } ;
								for ( var j = 0 ; j < effect.length ; j ++ ){
									effect[j].f(atkSum);
								}
								if ( i === 0 ){
									target[0].isHit({id:-1,canvas:canvasMap["magician_skill0_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:5,width:canvasMap["magician_skill0_hit"].width/5,height:canvasMap["magician_skill0_hit"].height,type:"magician_skill0"}) ;
								}
								else {
									target[0].isHit({id:-1,atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:5,width:canvasMap["magician_skill0_hit"].width/5,height:canvasMap["magician_skill0_hit"].height}) ;

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
				needLevel : 1 ,
				needSkill : [] ,
				nowLevel : 1 ,
				effect : [] ,
				speed : 500 ,
				timer : 500 ,
				target : [] ,
				type : "active" ,
				ratio : 1.5 ,				
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
					createHitFunction : function(x,y,range,state,canvas,target,atk,effect,ratio){
						var name = "magician_skill1" , total = 7 ;
						for ( var i = 0 ; i < canvas.effectFrame.length ; i ++ ){
							if ( canvas.effectFrame[i] === canvas.nowFrame && canvas.effectBoolean[i] === false ){
								for ( var j = 0 ; j < target.length ; j ++ ){
									var atkSum = { result : Math.round((atk - target[j].def)*ratio) , state : [] } ;
									for ( var k = 0 ; k < effect.length ; j ++ ){
										effect[k].f(atkSum);
									}
									if ( j === 0 ){
										target[j].isHit({id:-1,canvas:canvasMap[name+"_hit"],atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height,type:name}) ;
									}
									else {
										target[j].isHit({id:-1,atk:atkSum,dx:canvas.hitDx,dy:canvas.hitDy,totalFrame:total,width:canvasMap[name+"_hit"].width/total,height:canvasMap[name+"_hit"].height}) ;
									}
								}
								canvas.effectBoolean[i] = true ;
								break ;
							}
						}
					},
					getTargetFunction : function(x,y,range,state,canvas,target){
						var count = 0 , r = 70 ;
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
				skill : [magicBomb,magicClaw]
			}) ;

			soldierMap['magician'] = magician ;

		},
		initMonsterMap : function(){
			var snail = common.createMonster(0,0,370,100,100,3,1,[],[],9,1,9,true);
			monsterMap['snail'] = snail ;
		},
		createMonsterSkill : function(){

		},
		createMonster : function(id,x,y,nowHp,maxHp,def,speed,skill,effect,moveFrame,hitFrame,dieFrame,hitAble){
			var monster = {
				state : "move" ,
				id : id || 0 ,
				x : x || 0 ,
				y : y || 0 ,
				nowHp : nowHp || 0 ,
				maxHp : maxHp || 0 ,
				def : def || 0 ,
				speed : speed || 0 ,	//per 20ms 
				skill : skill || [] ,
				effect : effect || [] ,
				hitAble : hitAble || true ,
				move : {
					nowFrame : 0 ,
					totalFrame : moveFrame ,
					canvas : null 
				} ,
				hit : {
					nowFrame : 0 ,
					totalFrame : hitFrame ,
					canvas : null 
				},
				die : {
					nowFrame : 0 ,
					totalFrame : dieFrame ,
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
								x : this.x + dx ,
								y : this.y + dy - 30 ,
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
							x : this.x + dx - 15,
							y : this.y + dy - 45,
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
								x : this.x + dx - 15 ,
								y : this.y + dy - 45 ,
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
					if ( stage.isGameOver === true || stage.isGameWin === true )
						return ;
					this.x += this.speed ;
					if ( this.x >= canvasWidth ){
						stage.isGameOver = true ;
					}
				},
				showMonster : function(){
					var state = this.state ;
					var nowFrame = this[state].nowFrame ;
					var totalFrame = this[state].totalFrame ;
					var canvas = this[state].canvas ;
					var w = this[state].w ;
					var h = this[state].h ;
					gameCtx.drawImage(canvas,w*nowFrame,0,w,h,this.x,this.y,w,h);
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
					gameCtx.drawImage(canvasMap["hp_bar"],this.x-5,this.y-25);
					gameCtx.drawImage(canvasMap["hp"],this.x-2,this.y-22.5,canvasMap["hp"].width*(this.nowHp/this.maxHp)*46,canvasMap["hp"].height+0.5);
					//gameCtx.fillText(this.nowHp+ '/' + this.maxHp ,this.x,this.y-10) ;
				},
				isHit : function(data){
					var dx = data.dx || 0 , dy = data.dy || 0 ;
					this.state = "hit" ;
					var atk = data.atk.result ;
					var state = data.atk.state ;
					var c = false ;
					for ( var i = 0 ; i < state.length ; i ++ ){
						if ( state[i] === "critical" ){
							c = true ;
							break ;
						} 
					}
					var type = data.type ; 
					var damage = atk  ;
					this.nowHp -= damage ;
					if ( canvasMap[type+"_hit"] !== undefined ){
						common.createAnimation({
							canvas : canvasMap[type+"_hit"] || data.canvas,
							x : this.x + dx ,
							y : this.y - 45 + dy ,
							nowFrame : 0 ,
							delay : data.delay || 5 ,
							timer : 0 ,
							totalFrame : data.totalFrame ,
							width : canvasMap[type+"_hit"].width / data.totalFrame , 
							height : canvasMap[type+"_hit"].height 
						});
					}
					this.showNumberDamage(damage,c) ;
				},
				showAll : function(){
					this.showMonster();
					if ( this.state !== "die" )
						this.showHp();
				},				
				setStateCanvas : function(){
					var w = canvasMap[monsterIdList[this.id]+"_move"].width ;
					var h = canvasMap[monsterIdList[this.id]+"_move"].height ;
					var canvas = canvasMap[monsterIdList[this.id]+"_move"] ;
					this.move = {
						nowFrame : 0 ,
						totalFrame : moveFrame ,
						w : w / moveFrame ,
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
						totalFrame : hitFrame ,
						w : w / hitFrame ,
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
						totalFrame : dieFrame ,
						w : w / dieFrame ,
						h : h ,
						canvas : canvas ,
						delay : 10 ,
						timer : 0 
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
				speed : data.speed || 0 ,  // 1 attack need sec
				range : data.range || 0 ,
				level : data.level || 1 ,
				effectTotalFrame : data.effectTotalFrame || 1 ,
				transferLevel : data.transferLevel || 99999 ,
				nowExp : 0 ,
				goalExp : 0 ,
				isPicked : data.isPicked || false ,
				point : 0 ,	// remain skill point
				skill : data.skill || [] ,
				atkTimer : 0 , 
				target : [] ,
				attackEffectDx : data.attackEffectDx || 0,
				attackEffectDy : data.attackEffectDy || 0,
				hitFrame : data.hitFrame ,
				effect : [] ,
				hitDx : data.hitDx || 0 ,
				hitDy : data.hitDy || 0 ,
				standOffsetX : data.standOffsetX || 0 ,
				standOffsetY : data.standOffsetY || 0 ,
				attackOffsetX : data.attackOffsetX || 0 ,
				attackOffsetY : data.attackOffsetY || 0 ,
				attackEffectVx : data.attackEffectVx || 0 ,
				attackEffectVy : data.attackEffectVy || 0 ,
				attackEffectDelay : data.attackEffectDelay || 3 ,
				init : function(){
					this.setStateCanvas();
					return this ;
				},
				isAttack : function(x,y){
					if ( stage.isGameOver === true || stage.isGameWin === true )
						return ;
					for ( var i = 0 ; i < this.skill.length ; i ++ ){
						if (  this.skill[i].type === "active" && ( this.state === "stand" || this.state === this.skill[i].canvas.state ) && this.atkTimer <= 0 ){
							var result = this.skill[i].f(x,y,this.range,this.state,this[this.state],this.atk,this.effect,this.skill[i].ratio) ;
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
							for ( var i = 0 ; i < this.target.length ; i ++  ){
								var atkSum = { result : this.atk - this.target[i].def , state : [] } ;
								for ( var j = 0 ; j < this.effect.length ; j ++ ){
									this.effect[j].f(atkSum);
								}
								this.target[i].isHit({id:this.id,atk:atkSum,dx:this.hitDx,dy:this.hitDy,totalFrame:this.hitFrame,type:roleList[this.id]}) ;
							}
							this.target = [] ;
							this.attack.animationBoolean = false ;
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
				effect : data.effect || [] ,
				type : data.type || "passive" ,
				f : data.f ,
				timer : data.timer || 0 ,
				speed : data.speed || 0 ,
				target : data.target || [] ,
				isInit : false ,
				ratio : data.ratio || 1 ,
				probability : data.probability || 1 ,
				canvasName : data.canvasName || null 
			}
			if ( data.canvas !== undefined ){
				skill["canvas"] = data.canvas ;
			} else {
				skill["init"] = data.init ;
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
			mySoldierList.push(common.clone(soldierMap['beginner']));
			mySoldierList.push(common.clone(soldierMap['archer']));
			mySoldierList.push(common.clone(soldierMap['magician']));
			//mySoldierList.push(common.clone(soldierMap['beginner']));
			//mySoldierList.push(common.clone(soldierMap['beginner']));
			//mySoldierList.push(common.clone(soldierMap['swordman']));
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
			common.initMySoldierList();
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
		isPickSoldier : null ,
		nowPickInvoke : null ,
		background : {} ,
		resetButton : {} ,
		confirmButton : {} ,
		init : function(){
			common.initSoldierMap();
			common.initMonsterMap();
			common.initMySoldierList();
			common.initNumberDamage();
			preStage.isShowChooseSoldier = false ;
			preStage.isPickSoldier = null ;
			preStage.initBackground();
			preStage.initResetButton();
			preStage.initConfirmButton();
			preStage.initInvoke();	
		},
		setMouseEvent : function(a, b) {
	        document.onclick = b;
	        document.onmousemove = a;
	        document.ontouchend = b
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
			if ( isGameStart === false ){
				document.body.style.cursor = "pointer" ;
				mouseOver = 'invoke' + index ;
			}
		},
		setMouseEnterInvokeClick :function(index){
			if ( isGameStart === false ){
				preStage.pickSoldier.init();
				preStage.nowPickInvoke = index ;
				document.body.style.cursor = "default" ;
			}
		},
		setMouseEnterResetButtonOver: function(){
			if ( isGameStart === false ){
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
		setMouseEnterResetButtonClick: function(){
			if ( isGameStart === false ){
				for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
					mySoldierList[i].isPicked = false ;
				} 
				preStage.isInitInvoke = false ;
				preStage.initInvoke();	
			}
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
				} else if (preStage.invokeList[i].soldier.id !== -1 &&
					common.isMouseEnterRange(temp,preStage.invokeList[i].x,preStage.invokeList[i].y,preStage.invokeList[i].w,preStage.invokeList[i].h,offsetX,offsetY,ratio) ){
					preStage.setMouseEnterSoldierClick(i) ;
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
			preStage.isPickSoldier = null ;
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
					gameCtx.drawImage(canvasMap['bg_'+nowStage+"_stand"],preStage.invokeList[i].x+24,preStage.invokeList[i].y+57+54);
					var w = canvasMap['invoke'].width / invokeAnimationTotalFrame ;
					var h = canvasMap['invoke'].height ;
					if ( isGameStart === false )
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
			if ( isGameStart === false ){
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
			if ( preStage.isPickSoldier !== null ){
				gameCtx.fillStyle="#2894FF";
				gameCtx.globalAlpha = 0.5;
				gameCtx.beginPath();
				gameCtx.arc(preStage.invokeList[preStage.isPickSoldier].x+canvasMap[common.getRole(preStage.invokeList[preStage.isPickSoldier].soldier.id)].width/2
					,preStage.invokeList[preStage.isPickSoldier].y+canvasMap[common.getRole(preStage.invokeList[preStage.isPickSoldier].soldier.id)].height/2,
					preStage.invokeList[preStage.isPickSoldier].soldier.range,
					0,Math.PI*2,true);
				gameCtx.closePath();
				gameCtx.fill();
				gameCtx.fillStyle="#000000";
				gameCtx.globalAlpha = 1;
				return ;
			}
		},
		showSoldierDetail : function(){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( preStage.isPickSoldier === i ) {
					var soldier = preStage.invokeList[i] ;
					gameCtx.fillText("Level:"+soldier.soldier.level,200,650);
					var exp = Math.floor(soldier.soldier.nowExp);
					gameCtx.fillText("Exp:"+exp+"/"+soldier.soldier.goalExp,200,700);
					gameCtx.fillText("Attack:"+soldier.soldier.atk,350,650);
					gameCtx.fillText("Range:"+soldier.soldier.range,350,700);
					gameCtx.fillText("Speed:"+soldier.soldier.speed,500,670);
					if ( soldier.soldier.skill.length !== 0 ){
						gameCtx.fillText("Skill:",650,670);
						for ( var i = 0 ; i < soldier.soldier.skill.length ; i ++ ){
							var skill = soldier.soldier.skill[i] ;
							var canvasName = skill.canvasName ;
							var w = canvasMap[canvasName+"_icon"].width / 3 ;
							var h = canvasMap[canvasName+"_icon"].height ;
							if ( skill.nowLevel <= 0 ){
								gameCtx.drawImage(canvasMap[canvasName+"_icon"],w*2,0,w,h,650+i*100,670,w,h) ;
							} else if ( skill.timer === skill.speed ){
								gameCtx.drawImage(canvasMap[canvasName+"_icon"],w*1,0,w,h,650+i*100,670,w,h) ;
							} else {
								gameCtx.drawImage(canvasMap[canvasName+"_icon"],w*0,0,w,h,650+i*100,670,w,h) ;
							}
						}
					}
					return; ; 
				}
			}
		},
		showSoldierOver : function(){

			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ){
				if ( mouseOver === 'soldier' + i ) {
					var soldier = preStage.invokeList[i] ;
					gameCtx.fillText("Level:"+soldier.soldier.level,200,650);
					var exp = Math.floor(soldier.soldier.nowExp);
					gameCtx.fillText("Exp:"+exp+"/"+soldier.soldier.goalExp,200,700);
					gameCtx.fillText("Attack:"+soldier.soldier.atk,350,650);
					gameCtx.fillText("Range:"+soldier.soldier.range,350,700);
					gameCtx.fillText("Speed:"+soldier.soldier.speed,500,670);
					if ( soldier.soldier.skill.length !== 0 ){
						gameCtx.fillText("Skill:",650,670);
						for ( var i = 0 ; i < soldier.soldier.skill.length ; i ++ ){
							var skill = soldier.soldier.skill[i] ;
							var canvasName = skill.canvasName ;
							console.log(canvasName);
							var w = canvasMap[canvasName+"_icon"].width / 3 ;
							var h = canvasMap[canvasName+"_icon"].height ;
							if ( skill.nowLevel <= 0 ){
								gameCtx.drawImage(canvasMap[canvasName+"_icon"],w*2,0,w,h,650+i*100,670,w,h) ;
							} else if ( skill.timer === skill.speed ){
								gameCtx.drawImage(canvasMap[canvasName+"_icon"],w*1,0,w,h,650+i*100,670,w,h) ;
							} else {
								gameCtx.drawImage(canvasMap[canvasName+"_icon"],w*0,0,w,h,650+i*100,670,w,h) ;
							}
						}
					}
					return; ; 
				}
			}
		},
		showAll : function(){
			common.setMouseEvent(preStage.mouseOver,preStage.mouseClick);
			preStage.showBackground();
			preStage.showDescription();
			preStage.showResetButton();
			preStage.showConfirmButton();
			preStage.showInvoke();
			if ( preStage.isShowChooseSoldier === true )
				preStage.pickSoldier.showAll() ;
			if ( preStage.isPickSoldier !== null ) {
				preStage.showSoldierDetail();
			}
			if ( mouseOver.match('soldier') !== null  )  {
				preStage.showDescription();
				preStage.showSoldierOver();
			} 
			preStage.showSoldierRange();
			stage.soldierEvent();
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
				preStage.pickSoldier.pickSoldierList.splice(index,1);
				preStage.invokeList[preStage.nowPickInvoke].w = canvasMap[common.getRole(mySoldierList[index].id)+"_stand"].width;
				preStage.invokeList[preStage.nowPickInvoke].h = canvasMap[common.getRole(mySoldierList[index].id)+"_stand"].height;
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
					var canvasName = skill.canvasName ;
					var w = canvasMap[canvasName+"_icon"].width / 3
					var h = canvasMap[canvasName+"_icon"].height  ;
					gameCtx.drawImage(canvasMap[canvasName+"_icon"],w*1,0,w,h,x,550+i*100,w,h) ;
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

				common.setMouseEvent(preStage.pickSoldier.mouseOver,preStage.pickSoldier.mouseClick);

				gameCtx.drawImage(canvasMap['choose_soldier'],canvasWidth/2-canvasMap['choose_soldier'].width/2,canvasHeight/2-canvasMap['choose_soldier'].height/2);
				preStage.pickSoldier.showMySoldierList();
				for ( var i = 0 ; i < mySoldierList.length ; i ++ ){
					if ( mouseOver === 'pickSoldier' + i ) {
						gameCtx.fillText(roleList[mySoldierList[i].id],100,650);
						gameCtx.fillText(roleDescriptionList[mySoldierList[i].id],100,700);
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
		gameOver : {} ,
		win : {} ,
		isGameWin : false ,
		isGameOver : false ,
		exp : 0 ,
		expTotal : 0 ,
		addMonsterTimer : 0 ,
		addMonsterDelay : 50 ,
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
						gameCtx.fillText("Level Up !!",preStage.invokeList[i].x,preStage.invokeList[i].y-25) ;	
					}
				}
			}	
		},
		setLevelUp : function(index){
			var temp = preStage.invokeList[index].soldier.goalExp - preStage.invokeList[index].soldier.nowExp ;
			preStage.invokeList[index].isLevelUp = true ;
			preStage.invokeList[index].soldier.nowExp = 0 ;
			preStage.invokeList[index].soldier.level ++ ;
			preStage.invokeList[index].soldier.goalExp = 10*(0.5+preStage.invokeList[index].soldier.level/2) ;
		},
		showAddExp : function(){
			for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ) {
				if ( preStage.invokeList[i].soldier.id !== -1 ){
					var exp = Math.floor( preStage.invokeList[i].soldier.nowExp );
					gameCtx.fillText(exp+'/'+preStage.invokeList[i].soldier.goalExp,preStage.invokeList[i].x,preStage.invokeList[i].y) ;
				}
			}
			if ( stage.exp <= 0 ){
				return ;
			} else {
				var e = stage.expTotal / 100 ;
				for ( var i = 0 ; i < preStage.invokeList.length ; i ++ ) {
					if ( preStage.invokeList[i].soldier.id !== -1 ){
						preStage.invokeList[i].soldier.nowExp += e ;
						if ( preStage.invokeList[i].soldier.nowExp >= preStage.invokeList[i].soldier.goalExp ){
							stage.setLevelUp(i);
						}
					}
				}
				stage.exp -= e ;
			}
		},
		addMonster : function(){
			if ( stage.isGameWin === true || stage.isGameOver === true )
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
			for ( var i = 0 ; i < monsterList.length ; i ++ ){
				if ( monsterList[i].nowHp <= 0 ){
					monsterList[i].isDie() ;
					monsterList[i].showAll();
					if ( monsterList.length === 0 && stage.monsterAllList.length === 0 ){
						stage.isGameWin = true ;
					}
				} else {
					if ( monsterList.length === 0 && stage.monsterAllList.length === 0 ){
						stage.isGameWin = true ;
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
			gameCtx.drawImage(canvasMap['gameover'],stage.gameOver.x,stage.gameOver.y);
		},
		toGameWin : function(){
			gameCtx.drawImage(canvasMap['win'],stage.win.x,stage.win.y);
			stage.showAddExp();
		},
		detectGame : function(){
			if ( stage.isGameOver === true ){
				stage.toGameOver();
			} else if ( stage.isGameWin === true ){
				stage.toGameWin();
			}
		},
		initGameOver : function(){
			stage.gameOver = { x: 300 , y : 300 , w : canvasMap['gameover'].width , h:canvasMap['gameover'].height} ;
		},
		initWin : function(){
			stage.win = { x: 300 , y : 300 , w : canvasMap['win'].width , h:canvasMap['win'].height} ;
		},
		init : function(){
			stage.initGameOver();
			stage.initWin();
			isGameStart = true ;
		},
		stage1 : {
			initMonsterList : function(){
				for ( var i = 0 ; i < 10 ; i ++ ){
					stage.monsterAllList.push(common.clone(monsterMap['snail']));
				}
			},
			init : function(){
				stage.init();
				stage.initExp(10);
				stage.stage1.initMonsterList();
			},
			showBackground : function(){
				gameCtx.drawImage(canvasMap['background'],background.x,background.y);
			},
			showAll : function(){
				common.setMouseEvent(preStage.mouseOver,preStage.mouseClick);
				stage.addMonster();
				preStage.showBackground();
				preStage.showDescription();
				preStage.showInvoke();
				stage.showMonster();
				if ( preStage.isPickSoldier !== null ) {
					preStage.showSoldierDetail();
				}
				if ( mouseOver.match('soldier') !== null  )  {
					preStage.showDescription();
					preStage.showSoldierOver();
				} 
				preStage.showSoldierRange();
				stage.soldierEvent();
				stage.detectGame();
				stage.showLevelUp();
				stage.showAnimation();
			}
		}
	}
	
	window.onload = common.init();
})();

window.addEventListener("load", function() {
    FastClick.attach(document.body)
}, !1);
