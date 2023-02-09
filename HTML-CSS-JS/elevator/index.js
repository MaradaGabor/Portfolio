"use strict";

const display = document.getElementById("display");
const arrow = document.getElementsByClassName("arrow")[0];
let inMoving = false;
let isDoorOpen = true;
let currentFloor = 0;
const SPEED = 500;

const statusUpdate = function (displayAction) {
  display.value = displayAction;
};

const toggleArrowDislay = function (floor) {
  if (arrow.style.visibility === "visible") {
    arrow.style.visibility = "hidden";
  } else {
    arrow.style.visibility = "visible";

    floor > currentFloor
      ? (arrow.style.rotate = "0deg")
      : (arrow.style.rotate = "180deg");
  }
};

statusUpdate(currentFloor);

const toggleFloorButton = function (floor) {
  document.getElementById(`btn--floor--${floor}`).classList.toggle("active");
};

async function openDoor() {
  if (!inMoving) {
    inMoving = true;
    isDoorOpen ? "" : await toogleDoor();
    inMoving = false;
  }
}

async function closeDoor() {
  if (!inMoving) {
    inMoving = true;
    isDoorOpen ? await toogleDoor() : "";
    inMoving = false;
  }
}

function alarm() {
  document.getElementById(`btn--alarm`).classList.toggle("alarm");
}

async function press(floor) {
  if (!inMoving) {
    inMoving = true;
    if (floor !== currentFloor) {
      toggleFloorButton(floor);
      isDoorOpen ? await toogleDoor() : "";
      await moveElevator(floor);
      await toogleDoor();
      toggleFloorButton(floor);
      inMoving = false;
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function toogleDoor() {
  isDoorOpen
    ? statusUpdate("CLOSING DOOR...")
    : statusUpdate("OPENING DOOR...");
  await sleep(3 * SPEED);
  isDoorOpen ? (isDoorOpen = false) : (isDoorOpen = true);
  isDoorOpen ? statusUpdate("DOOR OPEN") : statusUpdate("DOOR CLOSED");
}

async function moveElevator(floor) {
  toggleArrowDislay(floor);

  //wait 2 sec to start the elevator
  statusUpdate("LIFT STARTING");
  await sleep(1 * SPEED);

  //elevator started moving
  //let's say each floor takes 3 sec for the elevator

  do {
    statusUpdate(currentFloor);
    await sleep(3 * SPEED);
    currentFloor < floor ? (currentFloor += 1) : (currentFloor -= 1);
    statusUpdate(currentFloor);
  } while (currentFloor !== floor);
  await sleep(2 * SPEED);
  toggleArrowDislay(floor);
}
