"use strict";

const allStudents = [];
const expelledList = [];

// TODO: change filter to filterType, and value to filterBy
const HTML = { filter: "all", value: "all", searchInput: "", sortBy: "" };

const Student = {
  fullName: "",
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  house: "",
  image: "",
  gender: "",
  expelled: false,
  prefected: false,
};

window.addEventListener("DOMContentLoaded", init);

/*
 *
 *
 * Initial
 */
function init() {
  //Get json data
  loadJSON("https://petlatkea.dk/2021/hogwarts/students.json", cleanData);
}

/*
 *
 *
 * Fetch json
 */
async function loadJSON(url, callback) {
  const respons = await fetch(url);
  const jsonData = await respons.json();
  callback(jsonData);
}

/*
 *
 *
 * Cleaning data
 */
function cleanData(jsonData) {
  jsonData.forEach((jsonObject) => {
    let student = Object.create(Student);

    //Get nameparts
    const nameParts = separateNameParts(jsonObject.fullname);

    //clean other data
    student.house = jsonObject.house.trim();
    student.gender = jsonObject.gender.trim();
    student.nickName = nameParts.nickName.trim();

    //Capitalize nameparts
    student.firstName = capitalizeData(nameParts.firstName);
    student.middleName = capitalizeData(nameParts.middleName);
    student.lastName = capitalizeData(nameParts.lastName);
    student.house = capitalizeData(student.house);

    //Get full name
    student.fullName = getFullName(student);

    //get student image
    student.image = getImageName(student);

    allStudents.unshift(student);
  });
  prepareDisplaying(allStudents);
  manipulateListView();
}
function separateNameParts(name) {
  const firstSpace = name.trim().indexOf(" ");
  const lastSpace = name.trim().lastIndexOf(" ");

  const firstName = name.trim().substring(0, firstSpace);
  const lastName = name.trim().substring(lastSpace).trim();
  let middleName = name.substring(firstSpace, lastSpace).trim();
  let nickName = "";

  if (middleName.includes('"')) {
    nickName = middleName;
    middleName = "";
  }

  return { firstName, middleName, lastName, nickName };
}
function capitalizeData(namePart) {
  let result;

  if (namePart.includes("-")) {
    const iOfHyph = namePart.indexOf("-");
    result =
      namePart.substring(0, 1).toUpperCase() +
      namePart.substring(1, iOfHyph + 1).toLowerCase() +
      namePart.substring(iOfHyph + 1, iOfHyph + 2).toUpperCase() +
      namePart.substring(iOfHyph + 2).toLowerCase();
  } else {
    result = namePart.substring(0, 1).toUpperCase() + namePart.substring(1).toLowerCase();
  }

  return result;
}
function getFullName(student) {
  let fullName = `${student.firstName} ${student.middleName} ${student.nickName} ${student.lastName}`;

  while (fullName.includes("  ")) {
    fullName = fullName.replace("  ", " ");
  }

  return fullName;
}
function getImageName(student) {
  const result = student.lastName.toLowerCase() + "_" + student.firstName.substring(0, 1).toLowerCase() + ".png";
  return result;
}

/*
 *
 *
 * Prepare displaying
 */
function prepareDisplaying(students) {
  document.querySelector("#list tbody").innerHTML = "";
  students.forEach(displayStudent);
}

/*
 *
 *
 *
 * Display List
 */
function displayStudent(student) {
  // create clone
  const clone = document.querySelector("template#students").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=middleName]").textContent = student.middleName;
  clone.querySelector("[data-field=nickName]").textContent = student.nickName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("img").src = `imgs/${student.image}`;

  //add listener to the cloned option
  clone.querySelector("tr").addEventListener("click", closurePopup);

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);

  function closurePopup() {
    this.removeEventListener("click", closurePopup);

    showPopup(student);
  }
}

/*
 *
 *
 *
 * Popup
 */
function showPopup(student) {
  //Studen info
  document.querySelector("#popup #firstName").textContent = `First name: ${student.firstName}`;
  document.querySelector("#popup #middleName").textContent = `Middle name: ${student.middleName}`;
  document.querySelector("#popup #lastName").textContent = `Last name: ${student.lastName}`;
  document.querySelector("#popup #nickName").textContent = `Nick name: ${student.nickName}`;

  //Txt on buttons
  if (student.expelled === false) {
    document.querySelector("#popup #expellBtn").textContent = `Expel ${student.nickName}`;
  } else {
    document.querySelector("#popup #expellBtn").textContent = `welcome ${student.nickName} back`;
  }

  if (student.prefected === false) {
    document.querySelector("#popup #prefectBtn").textContent = `Prefect ${student.nickName}`;
  } else {
    document.querySelector("#popup #prefectBtn").textContent = `Remove prefect`;
  }

  //Make popup visible
  document.querySelector("#popup").classList.add("show");

  //listeners
  document.querySelector("#closePopup").addEventListener("click", closePopup);
  document.querySelector("#popup #expellBtn").addEventListener("click", expellStudent);
  document.querySelector("#popup #prefectBtn").addEventListener("click", prefectStudent);

  /*
   *
   *
   *CLOSURE FUNCTIONS -----
   *Expelling
   */

  function expellStudent() {
    closePopup();
    student.expelled = !student.expelled;
    buildList();
  }

  /*
   *
   *
   * Prefecting
   */
  function prefectStudent() {
    const conflictingStudent = allStudents.filter(checkGenderAndHouse);
    if (student.prefected === true) {
      togglePrefect(student);
      closePopup();
      buildList();
    } else if (conflictingStudent.length >= 1) {
      prefectConflict(conflictingStudent[0]);
    } else {
      togglePrefect(student);
      closePopup();
      buildList();
    }
  }

  function checkGenderAndHouse(compareStudent) {
    if (student.house === compareStudent.house && student.gender === compareStudent.gender && compareStudent.prefected === true) {
      return true;
    } else {
      return false;
    }
  }

  function prefectConflict(prefectedStudent) {
    //show the popup
    document.querySelector("#prefectConflict").classList.add("show");

    //insert info about the already prefected student
    document.querySelector("#prefectConflict .student1").textContent = prefectedStudent.fullName;

    //Eventlisteners for the 2 options
    document.querySelector("#remove1").addEventListener("click", removePrefect);
    document.querySelector("#closePrefect").addEventListener("click", closePrefectConflict);

    function removePrefect() {
      closePrefectConflict();
      togglePrefect(student);
      togglePrefect(prefectedStudent);
      closePopup();
      buildList();
    }

    function closePrefectConflict() {
      document.querySelector("#remove1").removeEventListener("click", removePrefect);
      document.querySelector("#closePrefect").removeEventListener("click", closePrefectConflict);
      document.querySelector("#prefectConflict").classList.remove("show");
    }
  }

  function togglePrefect(student) {
    student.prefected = !student.prefected;
  }

  /*
   *
   *
   *
   * Close popUp
   */
  function closePopup() {
    document.querySelector("#closePopup").removeEventListener("click", closePopup);
    document.querySelector("#popup #expellBtn").removeEventListener("click", expellStudent);
    document.querySelector("#popup #prefectBtn").removeEventListener("click", prefectStudent);
    document.querySelector("#popup").classList.remove("show");
  }
}

/*
 *
 *
 * listManipulation - eventlistner set up
 */
function manipulateListView() {
  document.querySelector("#filterSelector").addEventListener("change", selectFilter);

  const sortBtns = document.querySelectorAll(".sortButton");
  sortBtns.forEach((btn) => {
    btn.addEventListener("click", selectSorting);
  });

  document.querySelector("#searchBar").addEventListener("input", setSearch);
}

/*
 * Search field
 */

function setSearch() {
  HTML.searchInput = this.value;
  buildList();
}

function searchList(sortedList) {
  const searchResults = sortedList.filter(includingSearchChars);

  function includingSearchChars(student) {
    if (student.fullName.includes(HTML.searchInput) || student.fullName.toLowerCase().includes(HTML.searchInput)) {
      return true;
    } else {
      return false;
    }
  }

  return searchResults;
}

/*
 * filterList
 */

function selectFilter() {
  //Converts "true" -string to true -boolean
  let value = this.value;
  if (value === "true") {
    value = true;
  }
  //Returns dataset from the clicked option-tag, inside select-tag
  const filterType = getDataFromOption(this, "filtertype");
  setFilter(filterType, value);
}

function setFilter(filter, value) {
  HTML.filter = filter;
  HTML.value = value;
  buildList();
}

function filterList() {
  const chosenArray = getChosenArray();
  const filteredData = chosenArray.filter(theFilter);

  function theFilter(student) {
    //Unless filter === "expelled", expelled students isnt shown
    if (student[HTML.filter] === HTML.value || HTML.filter === "all") {
      return true;
    } else {
      return false;
    }
  }
  return filteredData;
}

function getChosenArray() {
  if (HTML.filter === "expelled") {
    return expelledList;
  } else {
    return allStudents;
  }
}

function getDataFromOption(selectTag, dataValue) {
  const options = selectTag.querySelectorAll("option");
  let result;
  options.forEach((option) => {
    if (option.selected === true) {
      result = option.dataset[dataValue];
    }
  });
  console.log(result);
  return result;
}

/*
 * sortList
 */

function selectSorting() {
  const sortBy = this.dataset.sort;
  let sortDirection = this.dataset.sortdir;

  // Remove .sortBy from the previous clicked sort btn
  const oldElement = document.querySelector(`[data-sort="${HTML.sortBy}"]`);
  if (oldElement !== null) {
    oldElement.classList.remove("sortBy");
  }

  // add .sortBy to the clicked sort btn
  this.classList.add("sortBy");

  if (sortDirection === "asc") {
    this.dataset.sortdir = "desc";
  } else {
    this.dataset.sortdir = "asc";
  }

  let direction;
  if (sortDirection === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  setSort(sortBy, direction);
}

function setSort(sortBy, direction) {
  HTML.sortBy = sortBy;
  HTML.direction = direction;
  buildList();
}

function sortList(currentList) {
  const sortedData = currentList.sort(compareElements);

  function compareElements(a, b) {
    if (a[HTML.sortBy] < b[HTML.sortBy]) {
      return -1 * HTML.direction;
    } else {
      return 1 * HTML.direction;
    }
  }

  return sortedData;
}

/*
 *
 */
function buildList() {
  const currentList = filterList();
  const sortedList = sortList(currentList);
  const searchedList = searchList(sortedList);

  prepareDisplaying(searchedList);
}
