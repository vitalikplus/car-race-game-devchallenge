var renderer = PIXI.autoDetectRenderer(840, 900, {
  transparent: true,
  resolution: 1
});

document.getElementById('display').appendChild(renderer.view);

var stage = new PIXI.Container();

PIXI.loader
  .add("images/car-yellow.png")
  .add("images/road1.png")
  .add("images/race-map.png")
  .load(setup);

var road = [];
var text;
var map;
var myCar = {
  pixi: {},
  position: {
    x: renderer.width / 2,
    y: renderer.height
  },
  speed: 0,
  maxSpeed: {
    level1: 10,
    level2: 25,
    level3: 40,
    level4: 60,
    level5: 90
  },
  accelerationX: {
    level1: 1,
    level2: 2,
    level3: 3,
    level4: 4,
    level5: 5
  },
  accelerationY: {
    level1: 1,
    level2: 2,
    level3: 3,
    level4: 4,
    level5: 5    
  },
  roundDistance: 0,
  totalDistance: 0,
  round: 1,
  powerLevel: 'level1'
}

var myCompetitors = [];
var myCompetitor = {
  pixi: {},
  position: {
    x: 100,
    y: renderer.height
  },
  roundDistance: 0,
  totalDistance: 0,
  round: 1,
  speed: 1,
  powerLevel: 'level1',
  nastyType: 'static'
}

var roadHoles = [];

const MAX_X = 840;
const MIN_X = 0;
const ROAD_TILE_HEIGHT = 650;
const ROUND_LENGTH = 1000;

function setup() {

  // init road
  for (let i = 1; i <= 3; i += 1) {
    let newRoad = new PIXI.Sprite(PIXI.loader.resources["images/road1.png"].texture);
    road.push(newRoad);
    stage.addChild(newRoad)
  };

  road[0].y = -650;
  road[1].y = 0;
  road[2].y = 650;

  // init my car
  myCar.pixi = new PIXI.Sprite( PIXI.loader.resources["images/car-yellow.png"].texture );
  stage.addChild(myCar.pixi);
  prepareCar(myCar);

  // init competors cars
  for (let i = 0; i < 3; i +=1 ) {
    let competitor = {};
    Object.assign(competitor, myCompetitor);
    competitor.position.x = Math.random() * renderer.width; 
    competitor.position.y = Math.random() * (ROUND_LENGTH / 10); 
    myCompetitors.push(competitor);
  }

  myCompetitors.forEach(function (competitor) {
    competitor.pixi = new PIXI.Sprite( PIXI.loader.resources["images/car-yellow.png"].texture );
    stage.addChild(competitor.pixi);
    prepareCar(competitor);
  })

  // init map and text
  initTextAndMap();
  
  animationLoop();
}

function animationLoop() {
  requestAnimationFrame(animationLoop);

  if (myCar.speed) incrementPosition(null, myCar.speed);
  calculateCompetitors();

  renderer.render(stage);
}

window.addEventListener('keydown', keydownHandler)

function keydownHandler (event) {
  if (event.which !== 37 &&
    event.which !== 38 && 
    event.which !== 39 &&
    event.which !== 40) return;

  event.preventDefault();

  switch (event.which) {
    // key is up
    case 38:
      myCar.speed += myCar.accelerationY[myCar.powerLevel];
      if (myCar.speed > myCar.maxSpeed[myCar.powerLevel]) myCar.speed = myCar.maxSpeed[myCar.powerLevel];
      break;
    // key is down
    case 40:
      myCar.speed -= myCar.accelerationY[myCar.powerLevel];
      if (myCar.speed <= 0) myCar.speed = 0;
      break;
    // key is left
    case 37:
      incrementPosition(-myCar.accelerationX[myCar.powerLevel], null);
      break;
    // key is right
    case 39:
      incrementPosition(myCar.accelerationX[myCar.powerLevel], null);
      break;
  }
}

function incrementPosition (vX, vY) {
  if (vX) {
    myCar.pixi.x += vX; 
    if (myCar.pixi.x >= MAX_X) myCar.pixi.x = MAX_X;
    else if (myCar.pixi.x <= MIN_X) myCar.pixi.x = MIN_X;
  }
  if (vY) {
    if (road[0].y >= 2 * ROAD_TILE_HEIGHT) road[0].y = -ROAD_TILE_HEIGHT;
    if (road[1].y >= 2 * ROAD_TILE_HEIGHT) road[1].y = -ROAD_TILE_HEIGHT;
    if (road[2].y >= 2 * ROAD_TILE_HEIGHT) road[2].y = -ROAD_TILE_HEIGHT;
    road[0].y += vY;
    road[1].y += vY;
    road[2].y += vY;
    myCar.roundDistance += vY;
    if (myCar.distance >= ROUND_LENGTH) {
      myCar.round += 1;
      myCar.roundDistance = 0;
    }
    myCar.totalDistance = myCar.roundDistance + myCar.round * ROUND_LENGTH;
    updateText();
  }
  // collision With Car
  var collisionWithCar = false;
  myCompetitors.forEach( function (competitor) {
    if (boxesIntersect(myCar.pixi, competitor.pixi)) collisionWithCar = true;
  })
  if (collisionWithCar) myCar.speed = 0;

  // collision with hole
  var collisionWithHole = false;
  roadHoles.forEach(function (hole) {
    if (boxesIntersect(myCar.pixi, hole.pixi)) collisionWithHole = true;
  })
  if (collisionWithHole) myCar.speed -= myCar.accelerationX;
  if (myCar.speed <= 0) myCar.speed = 0;

}

function keyupHandler(event) {
  // console.log('UP=',event.which);
}

function prepareCar(car) {
  car.pixi.rotation = 3.14159;
  car.pixi.anchor.set(0.5, 0);
  car.pixi.scale.set(0.5, 0.5);
  car.pixi.x = car.position.x;
  car.pixi.y = car.position.y;
}

function updateText() {
  textContent.text = (myCar.roundDistance / 100).toFixed()   + 'm          ' + myCar.speed + 'm/s      ' + myCar.round + '     ';
}

function updateMap() {

}

function boxesIntersect(a, b) {
  var ab = a.getBounds();
  var bb = b.getBounds();
  return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

function initTextAndMap() {
  textHeader = new PIXI.Text('Distance: Speed: Round: Place: ', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: 'brown',
  });
  stage.addChild(textHeader);
  textHeader.position.set(20, 20);

  textContent = new PIXI.Text('', {
    fontFamily: 'Arial',
    fontSize: 30,
    fill: 'brown',
  });
  stage.addChild(textContent);
  textContent.position.set(20, 50);

  map = new PIXI.Sprite(PIXI.loader.resources["images/race-map.png"].texture);
  stage.addChild(map);
  map.anchor.set(1, 0);
  map.position.set(renderer.width - 20, 20);
  map.scale.set(0.3, 0.3)  
}

function calculateCompetitors() {
  myCompetitors.forEach(function (competitor) {
    competitor.pixi.position.y += competitor.speed;
    competitor.position.y += competitor.speed;
    competitor.roundDistance += competitor.speed;
  })
}