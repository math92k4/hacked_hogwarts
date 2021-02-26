"use strict";

//Global arrays / lists
const allStudents = [];
const expelledList = [];
const bloodHistory = [];

let isHacked = false;

//Global variables
const HTML = { filter: "all", value: "all", searchInput: "", sortBy: "", direction: "" };

//prototype for student objects
const Student = {
  fullName: "",
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  house: "",
  image: "",
  gender: "",
  inqSquad: false,
  prefected: false,
  expelled: false,
};

window.addEventListener("DOMContentLoaded", init);

/*
 *
 *
 * Initial
 */
function init() {
  loadExternalData();
}

/*
 *
 *
 * loadExternalData -- race conditions
 */
function loadExternalData() {
  //set boolean for if blodd array is loaded
  let isBloodLoaded = false;

  //Load the arrays with URLs and callback functions
  loadJSON("https://petlatkea.dk/2021/hogwarts/families.json", setFamilyBloodStatus);
  loadJSON("https://petlatkea.dk/2021/hogwarts/students.json", isBloodStatusLoaded);

  /*
   * Fetch json
   */
  async function loadJSON(url, callback) {
    const respons = await fetch(url);
    const jsonData = await respons.json();
    callback(jsonData);
  }

  /*
   * families.json stored globally bloodHistory
   */
  function setFamilyBloodStatus(jsonData) {
    const half = jsonData.half;
    const pure = jsonData.pure;

    bloodHistory.half = half;
    bloodHistory.pure = pure;

    //Indicate that the array is loaded
    isBloodLoaded = true;
  }

  /*
   * Checks if isBloodLoaded. else it calls itself after 100ms
   */
  function isBloodStatusLoaded(jsonData) {
    if (isBloodLoaded) {
      prepareData(jsonData);
    } else {
      setTimeout(isBloodStatusLoaded(jsonData), 100);
    }
  }
}
/*
 *
 *
 * Prepare data - deviding in nameparts, cleaning, capitalizing, gets image name and blood status
 */
function prepareData(jsonData) {
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

    //get student bloodstatus
    student.bloodStatus = getBloodStatus(student);

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
function getBloodStatus(student) {
  if (bloodHistory.pure.includes(student.lastName)) {
    return "Pure";
  } else if (bloodHistory.half.includes(student.lastName)) {
    return "Half";
  } else {
    return "Muggle born";
  }
}

/*
 *
 *
 * Prepare displaying
 */
function prepareDisplaying(students) {
  document.querySelector("#list tbody").innerHTML = "";

  const studentCount = countStudents(students);
  displayCount(studentCount);
  students.forEach(displayStudent);
}

//returns object with the different counting results
function countStudents(students) {
  const result = { total: 0, displaying: 0, Gryffindor: 0, Hufflepuff: 0, Ravenclaw: 0, Slytherin: 0, expelled: 0 };

  allStudents.forEach((student) => {
    result[student.house]++;
  });

  result.expelled = expelledList.length;
  result.total = allStudents.length;
  result.displaying = students.length;

  return result;
}

function displayCount(studentCount) {
  document.querySelector("#countBar #totalCount").textContent = studentCount.total;
  document.querySelector("#countBar #gryffindorCount").textContent = studentCount.Gryffindor;
  document.querySelector("#countBar #hufflepuffCount").textContent = studentCount.Hufflepuff;
  document.querySelector("#countBar #ravenclawCount").textContent = studentCount.Ravenclaw;
  document.querySelector("#countBar #slytherinCount").textContent = studentCount.Slytherin;
  document.querySelector("#countBar #expelledCount").textContent = studentCount.expelled;
  document.querySelector("#countBar #displayingCount").textContent = studentCount.displaying;
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
  clone.querySelector("[data-field=fullName]").textContent = student.fullName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  if (student.expelled) {
    clone.querySelector("[data-field=house]").classList.add("expelled");
  }

  //set up badges and conditions
  clone.querySelector(".house").src = `imgs/${student.house}.png`;

  if (student.expelled) {
    clone.querySelector(".house").classList.add("transparent");
  }

  if (student.prefected === false) {
    clone.querySelector(".prefect").classList.add("transparent");
  }
  if (student.inqSquad === false) {
    clone.querySelector(".inq").classList.add("transparent");
  }

  //add listener to the cloned option
  if (!student.expelled) {
    clone.querySelector("tr").addEventListener("click", closurePopup);
  }

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
 * Popup -- large closure function, which includes expelling, prefecting and inq functionality
 */
function showPopup(student) {
  //set popUp style
  document.querySelector("#popupContainer").classList = student.house.toLowerCase();

  //Student info
  document.querySelector("#popup #firstName").textContent = `First name: ${student.firstName}`;
  document.querySelector("#popup #middleName").textContent = `Middle name: ${student.middleName}`;
  document.querySelector("#popup #lastName").textContent = `Last name: ${student.lastName}`;
  document.querySelector("#popup #nickName").textContent = `Nick name: ${student.nickName}`;
  document.querySelector("#popup #bloodStatus").textContent = `Blood status: ${student.bloodStatus}`;
  document.querySelector("#popup img").src = `imgs/${student.image}`;

  //Txt on buttons
  document.querySelector("#popup #expellBtn").textContent = `Expel ${student.lastName}`;
  if (student.prefected === false) {
    document.querySelector("#popup #prefectBtn").textContent = `Prefect ${student.lastName}`;
  } else {
    document.querySelector("#popup #prefectBtn").textContent = `Remove prefect`;
  }

  //set up badges/crests
  const inqimg = document.querySelector("#inqimg");
  if (student.inqSquad === true) {
    inqimg.classList = "";
  } else {
    inqimg.classList = "transparent";
  }

  const prefectImg = document.querySelector("#prefectimg");
  if (student.prefected === true) {
    prefectImg.classList = "";
  } else {
    prefectImg.classList = "transparent";
  }

  const houseImg = document.querySelector("#houseimg");
  houseImg.src = `imgs/${student.house}.png`;
  if (student.expelled === true) {
    houseImg.classList = "transparent";
  } else {
    houseImg.classList = "";
  }

  //listeners

  document.querySelector("#closePopup").addEventListener("click", closePopup);
  document.querySelector("#popup #expellBtn").addEventListener("click", expellStudent);
  document.querySelector("#popup #prefectBtn").addEventListener("click", prefectStudent);

  //only enables inqBtn if bloodstatus = pure && House = Slytherin ------ unless the student is expelled
  if (student.bloodStatus === "Pure" && student.house === "Slytherin") {
    document.querySelector("#inqBtn").classList = "";
    document.querySelector("#inqBtn").addEventListener("click", toggleInqSquad);
    if (student.inqSquad === false) {
      document.querySelector("#inqBtn").textContent = `Add to inq-squad`;
    } else {
      document.querySelector("#inqBtn").textContent = `Remove from inq-squad`;
    }
  } else {
    document.querySelector("#inqBtn").classList = "hide";
  }
  //Make popup visible
  document.querySelector("#popup").classList.add("show");

  /*
   *
   *
   * inqSquad
   */
  function toggleInqSquad() {
    document.querySelector("#inqBtn").removeEventListener("click", toggleInqSquad);

    student.inqSquad = !student.inqSquad;

    closePopup();
  }

  /*
   *
   *
   *CLOSURE FUNCTIONS -----
   *Expelling
   */

  function expellStudent() {
    student.expelled = !student.expelled;
    //gets index if sudent in the allStudents array, removes the object, and unshift it to the expelled array
    const iOfStudent = allStudents.indexOf(student);
    const expelledStudent = allStudents.splice(iOfStudent, 1);
    expelledList.unshift(expelledStudent[0]);

    closePopup();
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
    } else if (conflictingStudent.length >= 1) {
      prefectConflictPopup(conflictingStudent[0]);
    } else {
      togglePrefect(student);
      closePopup();
    }
  }

  function checkGenderAndHouse(compareStudent) {
    if (student.house === compareStudent.house && student.gender === compareStudent.gender && compareStudent.prefected === true) {
      return true;
    } else {
      return false;
    }
  }

  function prefectConflictPopup(prefectedStudent) {
    //show the popup
    document.querySelector("#prefectConflict").classList.add("show");

    //insert info about the already prefected student
    document.querySelector("#prefectConflict .student1").textContent = prefectedStudent.fullName;

    //Eventlisteners for the 2 options
    document.querySelector("#remove1").addEventListener("click", removePrefect);
    document.querySelector("#closePrefect").addEventListener("click", closePrefectConflict);

    function removePrefect() {
      closePrefectConflict();
      closePopup();
      togglePrefect(student);
      togglePrefect(prefectedStudent);
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

    //only removes inqBtn-funcionality if bloodstatus = pure && House = Slytherin

    document.querySelector("#popup").classList.remove("show");

    buildList();
  }
}

/*
 *
 *
 * listManipulation - eventlistner set up for filter, sort and searching
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
 * Search field: Collect and set the typed search-chars as a global varible
 */
function setSearch() {
  HTML.searchInput = this.value;
  buildList();
}
/*
 * filterList: Collect and set the clicked filter as a global varibles
 */
function selectFilter() {
  //Converts "true" -string to true -boolean
  let filterBy = this.value;
  if (filterBy === "true") {
    filterBy = true;
  } else if (filterBy === "false") {
    filterBy = false;
  }

  //Returns dataset from the clicked option-tag, inside select-tag
  const filterType = getDataFromOption(this, "filtertype");

  setFilter(filterType, filterBy);
}
function setFilter(filterType, filterBy) {
  HTML.filterType = filterType;
  HTML.filterBy = filterBy;
  buildList();
}
function getSelectedList() {
  if (HTML.filterType === "expelled") {
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
  return result;
}
/*
 * sortList: Collect and set the clicked sorting as a global varibles
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

  setSorting(sortBy, direction);
}
function setSorting(sortBy, direction) {
  HTML.sortBy = sortBy;
  HTML.direction = direction;
  buildList();
}

/*
 * buildList - builds list by the globally stored filter, sort and search settings / variables
 */
function buildList() {
  const selectedList = getSelectedList();
  const filteredList = selectedList.filter(filterList);
  const sortedList = filteredList.sort(sortList);
  const finalList = sortedList.filter(searchList);

  prepareDisplaying(finalList);
}
function filterList(student) {
  if (student[HTML.filterType] === HTML.filterBy || HTML.filterType === "all") {
    return true;
  } else {
    return false;
  }
}
function sortList(a, b) {
  if (a[HTML.sortBy] < b[HTML.sortBy]) {
    return -1 * HTML.direction;
  } else {
    return 1 * HTML.direction;
  }
}
function searchList(student) {
  if (student.fullName.includes(HTML.searchInput) || student.fullName.toLowerCase().includes(HTML.searchInput)) {
    return true;
  } else {
    return false;
  }
}

function hackTheSystem() {
  if (isHacked === false) {
    isHacked = true;
  } else {
    console.log("Nice try Peter..");
  }
}
