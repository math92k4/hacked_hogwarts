"use strict";

//Global arrays / lists
const allStudents = [];
const expelledList = [];
const bloodHistory = [];

//Global variables
const HTML = { filter: "all", value: "all", searchInput: "", sortBy: "", direction: "" };
const count = { total: 0, Gryffindor: 0, Gufflepuff: 0, Ravenclaw: 0, Slytherin: 0 };

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
  prefected: false,
  expelled: false,
};

window.addEventListener("DOMContentLoaded", init);

/*
 *
 * TODO: take care of race conditions
 * Initial
 */
function init() {
  //Get json data families
  loadJSON("https://petlatkea.dk/2021/hogwarts/families.json", setFamilyBloodStatus);
  //Get json data students
  loadJSON("https://petlatkea.dk/2021/hogwarts/students.json", prepareData);
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
 * families.json stored globally bloodHistory
 */
function setFamilyBloodStatus(jsonData) {
  const half = jsonData.half;
  const pure = jsonData.pure;

  bloodHistory.half = half;
  bloodHistory.pure = pure;
}

/*
 *
 *
 * Prepare data
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
  students.forEach(displaySudent);
}

function countStudents(students) {
  const result = { total: 0, displaying: 0, Gryffindor: 0, Hufflepuff: 0, Ravenclaw: 0, Slytherin: 0 };

  allStudents.forEach((student) => {
    result[student.house]++;
    result.total++;
  });
  students.forEach((student) => {
    result.displaying++;
  });

  return result;
}
function displayCount(studentCount) {
  console.log(studentCount);
}

/*
 *
 *
 *
 * Display List
 */
function displaySudent(student) {
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
 * Popup -- large closure function
 */
function showPopup(student) {
  //Studen info
  document.querySelector("#popup #firstName").textContent = `First name: ${student.firstName}`;
  document.querySelector("#popup #middleName").textContent = `Middle name: ${student.middleName}`;
  document.querySelector("#popup #lastName").textContent = `Last name: ${student.lastName}`;
  document.querySelector("#popup #nickName").textContent = `Nick name: ${student.nickName}`;

  //Txt on buttons
  document.querySelector("#popup #expellBtn").textContent = `Expel ${student.nickName}`;

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
    student.expelled = !student.expelled;
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
      togglePrefect(student);
      togglePrefect(prefectedStudent);
      closePopup();
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

    buildList();

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
function searchList(student) {
  if (student.fullName.includes(HTML.searchInput) || student.fullName.toLowerCase().includes(HTML.searchInput)) {
    return true;
  } else {
    return false;
  }
}
/*
 * filterList
 */
function selectFilter() {
  //Converts "true" -string to true -boolean
  let filterBy = this.value;
  if (filterBy === "true") {
    filterBy = true;
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
function filterList(student) {
  if (student[HTML.filterType] === HTML.filterBy || HTML.filterType === "all") {
    return true;
  } else {
    return false;
  }
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

  setSorting(sortBy, direction);
}
function setSorting(sortBy, direction) {
  HTML.sortBy = sortBy;
  HTML.direction = direction;
  buildList();
}
function sortList(a, b) {
  if (a[HTML.sortBy] < b[HTML.sortBy]) {
    return -1 * HTML.direction;
  } else {
    return 1 * HTML.direction;
  }
}
/*
 * buildList
 */
function buildList() {
  const selectedList = getSelectedList();
  const filteredList = selectedList.filter(filterList);
  const sortedList = filteredList.sort(sortList);
  const finalList = sortedList.filter(searchList);

  prepareDisplaying(finalList);
}
