// DOM SELECTORS
const container = document.getElementById("container");
const clearBtn = document.getElementById("clear-btn");
const logo = document.getElementById("logo");

const startModal = document.getElementById("start-modal");
const numberModal = document.getElementById("number-modal");
const numErr = numberModal.querySelector(".error-message");
const namesModal = document.getElementById("names-modal");
const namesForm = namesModal.querySelector(".modal-content");
const numInput = document.getElementById("num");
const numBtn = document.getElementById("num-btn");
const namesBtn = document.getElementById("names-btn");

const optionsModal = document.getElementById("options-modal");
const optionsBtn = document.getElementById("options-btn");
const cancelBtn = document.getElementById("cancel-btn");
const optionsForm = optionsModal.querySelector(".modal-content");
const buttons = optionsModal.querySelector(".buttons");

const resultModal = document.getElementById("result-modal");

// TABLE SETUP

const suspects = ["Grün", "Gatow", "Orchidee", "Porz", "Bloom", "Gloria"];

const weapons = [
  "Leuchter",
  "Dolch",
  "Heizungsrohr",
  "Pistole",
  "Seil",
  "Rohrzange",
];

const rooms = [
  "Musikzimmer",
  "Billardzimmer",
  "Wintergarten",
  "Speisezimmer",
  "Badezimmer",
  "Küche",
  "Bibliothek",
  "Salon",
  "Arbeitszimmer",
];

const tableHeadings = ["Wer?", "Womit?", "Wo?"];
const tables = { suspects, weapons, rooms };

let playerNum =
  localStorage.getItem("playerNum") !== null
    ? JSON.parse(localStorage.getItem("playerNum"))
    : null;
let playerNames =
  localStorage.getItem("playerNames") !== null
    ? JSON.parse(localStorage.getItem("playerNames"))
    : null;
let players =
  localStorage.getItem("players") !== null
    ? JSON.parse(localStorage.getItem("players"))
    : {};
let maybes =
  localStorage.getItem("maybes") !== null
    ? JSON.parse(localStorage.getItem("maybes"))
    : {};

let selectData = {};
let isMaybe = false;
let result = [];

init();

// INITIALIZATIONS

// Initializes everything
function init() {
  // When player data is already in local storage, initialize game, otherwise get user input
  playerNames !== null ? setupGame() : openNumberModal();
}

// Sets up the whole game
function setupGame() {
  const tl = gsap.timeline({
    defaults: { duration: 0.5, ease: Power1.easeOut },
  });
  tl.to(".start-modal", { opacity: 0, display: "none", duration: 0.5 });
  tl.to(".logo img", { opacity: 1 });
  tl.to(".clear-btn", { opacity: 1 }, "-=0.2");
  tl.to(".container", { opacity: 1, zIndex: 4 }, "-=0.2");

  createTable();

  initSelects();

  if (Object.keys(players).length === 0) {
    initPlayersObject();
    initMaybesObject();
  }

  initSelectStyles();
}

function resetAnimation() {
  const tl = gsap.timeline({ defaults: { duration: 0 } });
  tl.to(".container", { opacity: 0, zIndex: -3 });
  tl.to(".logo img", { opacity: 0, transform: "scale(1)" });
  tl.to(".loading-container", { opacity: 1 });
  tl.to(".loading", { width: "0px" });
  tl.to(".clear-btn", { opacity: 0 });
  tl.to(".start-modal", { opacity: 1, duration: 1.5 });
}

function openNumberModal() {
  // GSAP START ANIMATION
  const tl = gsap.timeline({
    defaults: { ease: Power4.easeOut, duration: 0.5 },
  });

  tl.to(".start-modal", { display: "flex" });
  tl.to(".loading", {
    width: "calc(100% - 4px)",
    duration: 1,
    delay: 1,
  });
  tl.to(".loading-container", { opacity: 0, duration: 0 });
  tl.to(
    ".logo",
    {
      top: "42%",
      left: "42%",
      transform: "translate(-50%, -50%)", // Not working anymore, why? - compensate with top and left
      duration: 0,
    },
    "=-1"
  );
  tl.to(".logo img", {
    opacity: 1,
    transform: "scale(2)",
    ease: Bounce.easeOut,
    duration: 1,
  });
  tl.to(".start-modal", { opacity: 0.4 }, "-=1");
  tl.to(".logo", {
    top: 0,
    left: 0,
    transform: "scale(0.5)",
    delay: 1,
  });
  tl.to(".clear-btn", { opacity: 1, zIndex: 5 }, "-=1");
  tl.to("#number-modal", { opacity: 1, zIndex: 4 });
  tl.fromTo(
    ".modal-content",
    { transform: "scale(0)" },
    { transform: "scale(1)" }
  );
}

function setPlayerNumber(num) {
  playerNum = num;
  localStorage.setItem("playerNum", num);
}

function openNamesModal(num) {
  namesModal.classList.add("show-modal");

  for (let i = 1; i <= num; i++) {
    const input = document.createElement("div");
    input.classList.add("form-group");
    input.innerHTML = `
        <label>Spieler ${i}:</label>
        <input type="text" class="player-name">
        `;
    namesForm.insertBefore(input, namesBtn);
  }
}

function setPlayerNames(names) {
  playerNames = names;
  localStorage.setItem("playerNames", JSON.stringify(names));
}

// Initializes players obj
function initPlayersObject() {
  for (let i = 1; i <= playerNum; i++) {
    players[`player${i}`] = {
      suspects: [],
      weapons: [],
      rooms: [],
    };
  }
}

// Initializes maybe obj
function initMaybesObject() {
  for (let i = 1; i <= playerNum; i++) {
    maybes[`player${i}`] = [];
  }
}

// Initializes custom selects
function initSelects() {
  const selects = document.querySelectorAll(".custom-select");
  selects.forEach((select) => customSelect(select));
}

// Initializes style of the selected options in selects
function initSelectStyles() {
  Object.entries(players).forEach((entry) => {
    let player = entry[0];
    Object.entries(entry[1]).forEach((entry) => {
      let table = entry[0];
      entry[1].forEach((value, index) => {
        let row = index;
        let selectBox = convertToSelectedOption(table, player, row);
        if (selectBox !== undefined) {
          changeSelectStyle(selectBox, value);
        }
      });
    });
  });
}

// Creates a table depending on player number and names
function createTable() {
  container.innerHTML = ``;

  Object.entries(tables).forEach((entry, i) => {
    // Create wrapper with table heading and table
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    wrapper.innerHTML = `
        <h2>${tableHeadings[i]}</h2>
        <div class="table-head">
            <div class="cell column">
                <h3>Spieler</h3>
            </div>
        </div>
        <div id="${entry[0]}" class="table">
            <div class="names column"></div>
            <div class="close column"></div>
        </div>
        `;

    // Create tablehead
    const tableHead = wrapper.querySelector(".table-head");
    playerNames.forEach((player) => {
      const tableHeadCell = document.createElement("div");
      tableHeadCell.classList = "cell column";
      tableHeadCell.innerHTML = `<h3>${player}</h3>`;
      tableHead.appendChild(tableHeadCell);
    });

    // Create entries in names column and column for close buttons
    const namesColumn = wrapper.querySelector(".names");
    const closeColumn = wrapper.querySelector(".close");
    closeColumn.className = "close column";

    entry[1].forEach((name, j) => {
      const row = document.createElement("div");
      row.classList = `row-${j} cell`;
      row.setAttribute(`data-row`, `${j}`);
      row.innerHTML = `
            <h3>${name}</h3>
        `;
      namesColumn.appendChild(row);

      const closeBtn = document.createElement("div");
      closeBtn.className = `row-${j} cell`;
      closeBtn.setAttribute("data-row", `${j}`);
      closeBtn.setAttribute("data-table", `${entry[0]}`);
      closeBtn.innerHTML = `
                <button class="close-btn"><i class="fas fa-times"></i></button>
            `;

      closeColumn.appendChild(closeBtn);
    });

    // Create player columns
    playerNames.forEach((player, i) => {
      const table = wrapper.querySelector(".table");
      const column = document.createElement("div");
      column.className = `player${i + 1} column`;

      // Create cells with selects in each player column
      entry[1].forEach((name, j) => {
        const cell = document.createElement("div");
        cell.classList = `row-${j} cell`;
        cell.setAttribute("data-table", `${entry[0]}`);
        cell.setAttribute("data-player", `player${i + 1}`);
        cell.setAttribute("data-row", `${j}`);
        cell.innerHTML = `
                <div class="custom-select">
                    <select>
                        <option value="0">Yes</option>
                        <option value="1">No</option>
                        <option value="2">Maybe</option>
                    </select>
                </div>
            `;
        column.appendChild(cell);
      });
      table.insertBefore(column, closeColumn);
    });
    container.appendChild(wrapper);
  });
}

// Converts data from player object to corresponding select box
function convertToSelectedOption(tableID, player, row) {
  const table = document.getElementById(`${tableID}`);
  const column = table.querySelector(`.${player}`);
  const cell = column.children[row];
  const selectBox = cell.children[0].children[1];
  return selectBox;
}

// Converts select box to corresponding player data
function convertToPlayerData(selectBox) {
  const cell = selectBox.closest(".cell");
  const player = cell.getAttribute("data-player");
  const table = cell.getAttribute("data-table");
  const row = cell.getAttribute("data-row");
  return { table, player, row };
}

// Sets data for temporary use
function setData(data) {
  selectData = data;
}

// Gets data to identify last selected option
function getData() {
  return selectData;
}

// CUSTOM SELECT BOX

// Changes the select style to custom style
function customSelect(select) {
  // Create DIV that acts like the selected option
  let selectedOption = document.createElement("div");
  selectedOption.className = "option selected-option";
  select.appendChild(selectedOption);

  // DIV that contains the hidden options
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown hide";
  select.appendChild(dropdown);

  // Create DIV that acts like the hidden select options
  let options = [];

  for (let i = 0; i < 3; i++) {
    let option = document.createElement("div");
    option.className = "option";
    options.push(option);
  }

  // Define select options
  options[0].classList.add("yes");
  options[0].value = 0;
  options[1].classList.add("no");
  options[1].value = 1;
  options[2].classList.add("maybe");
  options[2].value = 2;

  // Append options to select element
  options.forEach((option) => dropdown.appendChild(option));
}

// Close all dropdowns
function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach((dropdown) => {
    dropdown.classList.add("hide");
    dropdown.previousSibling.classList.remove("dropdown-opened");
  });
}

// CLUEDO FUNCIONALITY

// Change the selection in the UI and save the selection in the players object
function changeSelection(option) {
  const data = convertToPlayerData(option);
  const value = option.value;
  const selectBox = option.parentElement.previousSibling;

  setSelection(data, value);

  if (value === 2) {
    openMaybeModal(selectBox);
  }

  changeSelectStyle(selectBox, value);

  closeAllDropdowns();
}

// Sets selection and saves in local storage
function setSelection(data, value) {
  players[data.player][data.table][data.row] = value;
  localStorage.setItem("players", JSON.stringify(players));
}

// Changes selected option style for a select
function changeSelectStyle(selectBox, value) {
  switch (value) {
    case null:
      selectBox.className = "option selected-option";
      break;
    case 0:
      selectBox.className = "option selected-option yes";
      changeRowStyle(selectBox, "scratch");
      checkMaybes(convertToPlayerData(selectBox));
      break;
    case 1:
      selectBox.className = "option selected-option no";
      checkRow(selectBox);
      break;
    case 2:
      selectBox.className = "option selected-option maybe";
      break;
  }
}

// Scratch a row when "yes" is clicked
function changeRowStyle(selectBox, string) {
  const obj = convertToPlayerData(selectBox);
  const table = document.getElementById(`${obj.table}`);
  const row = table.querySelectorAll(`.row-${obj.row}`);
  const closeBtn = row[row.length - 1];

  row[0].style.color = "#000";
  row.forEach((cell) => {
    cell.classList.add(`${string}`);

    // Hide select boxes in that row
    let box = cell.querySelector(".custom-select");
    if (box !== null) {
      box.style.opacity = "0";
    }
  });

  closeBtn.classList.add("show-close");
}

// Checks if all selects in a row show "no"
function checkRow(selectBox) {
  const data = convertToPlayerData(selectBox);
  const row = [];
  Object.entries(players).forEach((player) =>
    row.push(player[1][data.table][data.row])
  );
  if (row.every((value) => value === 1)) {
    changeRowStyle(selectBox, "highlight");
    checkResult();
  }
}

function checkResult() {
  Object.keys(tables).forEach((table) => {
    tableID = document.getElementById(`${table}`);
    const rows = tableID.querySelector(".highlight");
    if (rows) {
      const row = rows.getAttribute("data-row");
      const data = { table, row };
      const name = identName(data);
      result.includes(name) ? false : result.push(name);
      if (result.length === 3) {
        anounceResult();
      }
    }
  });
}

// Resets row style to default
function resetRowStyle(data) {
  const table = document.getElementById(`${data.table}`);
  const row = table.querySelectorAll(`.row-${data.row}`);

  row[0].style.color = "var(--primary-color)";
  row.forEach((cell) => {
    cell.classList.remove("scratch");
    cell.classList.remove("highlight");

    // Bring back select boxes
    let box = cell.querySelector(".custom-select");
    if (box !== null) {
      box.style.opacity = "1";
    }
  });
}

// Undos the "yes" selects when close Btn is clicked on scratched row
function resetYesEntry(data) {
  Object.entries(players).forEach((player) => {
    if (player[1][data.table][data.row] === 0) {
      player[1][data.table][data.row] = null;
      const selectBox = convertToSelectedOption(
        data.table,
        player[0],
        data.row
      );
      changeSelectStyle(selectBox, null);
    }
  });

  localStorage.setItem("players", JSON.stringify(players));
}

// Opens modal where other "maybe" options can be chosen
function openMaybeModal(selectBox) {
  const data = convertToPlayerData(selectBox);
  setData(data);

  // Open Options Info Modal and clear past input fields
  optionsModal.classList.add("show-modal");

  let inputs = optionsModal.querySelectorAll(".form-group");
  inputs.forEach((item) => item.parentNode.removeChild(item));

  let otherTables = Object.keys(tables).filter((table) => table !== data.table);

  otherTables.forEach((table) => {
    const input = document.createElement("div");
    input.classList.add("form-group");

    const select = document.createElement("select");
    select.setAttribute("data-table", table);
    const selectOptions = [];

    for (let i = 0; i < tables[table].length; i++) {
      const optionName = tables[table][i].trim();
      selectOptions.push(
        `<option value="${optionName}">${optionName}</option>`
      );
    }
    select.innerHTML = `${selectOptions}`;
    input.appendChild(select);
    optionsForm.insertBefore(input, buttons);
  });
}

function setMaybes() {
  let maybeOptions = [];
  let data = getData();
  maybeOptions.push(tables[data.table][data.row]);
  let selects = optionsModal.querySelectorAll("select");
  selects.forEach((select) => {
    maybeOptions.push(select.value);
    let table = select.getAttribute("data-table");
    let row = tables[table].indexOf(`${select.value}`);
    let player = data.player;

    // Change style of other options to "maybe"
    let selectBox = convertToSelectedOption(table, player, row);
    changeSelectStyle(selectBox, 2);

    // Set selection in player object for the other options
    setSelection({ table, player, row }, 2);
  });

  maybes[data.player].push(maybeOptions);

  localStorage.setItem("maybes", JSON.stringify(maybes));
}

function checkMaybes(data) {
  const name = identName(data);

  Object.values(maybes).forEach((arr) => {
    arr.forEach((maybe) => {
      maybe.forEach((item, index, arr) => {
        if (item === name) {
          arr.splice(index, 1);
        }
      });

      if (maybe.length === 1) {
        let arr = identMaybe(maybe[0]);
        let table = arr[0];
        let row = arr[1];
        setMaybeToYes(table, data.player, row);
        maybes[data.player] = maybes[data.player].filter(
          (maybe) => !maybe.includes(maybe[0])
        );
      }
    });
  });
  localStorage.setItem("maybes", JSON.stringify(maybes));
}

function changeMaybe(selectBox) {
  const data = convertToPlayerData(selectBox);
  const name = tables[data.table][data.row];

  if (selectBox.value === 1) {
    // When "no" is clicked on a maybe option, take maybe object and cut out the option
    maybes[data.player].forEach((maybe) => {
      maybe.forEach((item, index, arr) => {
        if (item === name) {
          arr.splice(index, 1);
        }
      });

      // If all other options are cancelled out, the player has to have the remaining one => scratch row
      if (maybe.length === 1) {
        let arr = identMaybe(maybe[0]);
        let table = arr[0];
        let row = arr[1];
        setMaybeToYes(table, data.player, row);
        maybes[data.player] = maybes[data.player].filter(
          (maybe) => !maybe.includes(maybe[0])
        );
      }
    });
  } else if (selectBox.value === 0) {
    // When "yes" is clicked on a maybe option, delete the corresponding array with options and reset their styles
    maybes[data.player].forEach((maybe) => {
      if (maybe.includes(name)) {
        let arr = maybe.filter((maybe) => maybe !== name);
        arr.forEach((selection) => {
          let option = identMaybe(selection);
          let obj = {
            table: option[0],
            row: option[1],
            player: data.player,
          };
          setSelection(obj, null);
          changeSelectStyle(
            convertToSelectedOption(obj.table, obj.player, obj.row),
            null
          );
        });
      }
    });
    maybes[data.player] = maybes[data.player].filter(
      (maybe) => !maybe.includes(name)
    );
  }
  localStorage.setItem("maybes", JSON.stringify(maybes));
}

function identMaybe(name) {
  let tableID;
  let row;
  Object.entries(tables).forEach((table) => {
    if (table[1].indexOf(name) >= 0) {
      tableID = table[0];
      row = table[1].indexOf(name);
    }
  });
  return [tableID, row];
}

function identName(data) {
  let table = document.getElementById(`${data.table}`);
  let name = table.querySelector(`.names > .row-${data.row} > h3`).innerText;
  return name;
}

function setMaybeToYes(table, player, row) {
  let selectBox = convertToSelectedOption(table, player, row);
  changeSelectStyle(selectBox, 0);
  setSelection({ table, player, row }, 0);
}

function anounceResult() {
  resultModal.classList.add("show-modal");
  const modalContent = resultModal.querySelector(".modal-content");
  modalContent.innerHTML = `
    <h2>Ergebnis:</h2>
    ${result
      .map(
        (item) => `
    <div>
        <img src="img/result/${item}.png"></img>
    </div>
    `
      )
      .join("")}`;
}

// Close maybe modal
function closeMaybeModal() {
  optionsModal.classList.remove("show-modal");
}

// Event listener: number of players is submitted
numBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const num = numInput.value;

  if (num >= 1 && num < 6) {
    gsap.to("#number-modal", { opacity: 0, zIndex: -3 });
    setPlayerNumber(num);
    openNamesModal(num);
    numInput.value = "";
  } else {
    numInput.classList.add("shake");
    numErr.classList.remove("hide");
    setTimeout(function () {
      numInput.classList.remove("shake");
    }, 1000);
  }
});

// Event listener: names of players are submitted
namesBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const inputs = document.querySelectorAll(".player-name");
  let names = [];

  inputs.forEach((input) => {
    if (input.value === "") {
      input.classList.add("shake");
      setTimeout(function () {
        input.classList.remove("shake");
      }, 1000);
    } else {
      names.push(input.value);
    }
  });

  if (names.length === inputs.length) {
    namesModal.classList.remove("show-modal");
    setPlayerNames(names);
    setupGame();

    // Delete the input fields
    const forms = namesModal.querySelectorAll(".form-group");
    forms.forEach((form) => namesForm.removeChild(form));
  }
});

// Event Listener for Open and Close Options Dropdown
document.addEventListener("click", (e) => {
  const clickedEl = e.target;

  if (clickedEl.classList.contains("selected-option")) {
    clickedEl.nextSibling.classList.toggle("hide");
    clickedEl.classList.toggle("dropdown-opened");
    if (clickedEl.classList.contains("maybe")) {
      isMaybe = true;
    }
  } else if (clickedEl.classList.contains("option")) {
    isMaybe ? changeMaybe(clickedEl) : false;
    changeSelection(clickedEl);
    isMaybe = false;
  } else if (clickedEl.classList.contains("show-close")) {
    const data = convertToPlayerData(clickedEl);
    resetRowStyle(data);
    resetYesEntry(data);

    clickedEl.classList.remove("show-close");
  } else {
    closeAllDropdowns();
  }
});

// Event Listener new game button
clearBtn.addEventListener("click", () => {
  resultModal.classList.remove("show-modal");
  const modalContent = resultModal.querySelector(".modal-content");
  modalContent.innerHTML = "";
  localStorage.clear();
  players = {};
  playerNum = null;
  playerNames = null;
  result = [];
  resetAnimation();
  init();
});

cancelBtn.addEventListener("click", () => {
  const data = getData();
  const selectBox = convertToSelectedOption(data.table, data.player, data.row);

  closeMaybeModal();

  setSelection(data, null);

  changeSelectStyle(selectBox, null);
});

optionsBtn.addEventListener("click", (e) => {
  e.preventDefault();

  setMaybes();

  closeMaybeModal();
});
