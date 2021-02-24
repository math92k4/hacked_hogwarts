"use strict";

const allStudents = [];
const displayedStudents;

const Student = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  house: "",
};

window.addEventListener("DOMContentLoaded", init);

function init() {
  loadJSON();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      prepareObjects(jsonData);
    });
}

function prepareObjects(jsonData) {
  jsonData.forEach((jsonObject) => {
    const student = Object.create(Student);

    const firstSpace = jsonObject.fullname.trim().indexOf(" ");
    const lastSpace = jsonObject.fullname.trim().lastIndexOf(" ");

    // Separate data
    student.firstName = jsonObject.fullname.trim().substring(0, firstSpace);

    student.lastName = jsonObject.fullname.trim().substring(lastSpace).trim();
    student.middleName = jsonObject.fullname
      .substring(firstSpace, lastSpace)
      .trim();

    student.house = jsonObject.house.trim();
    if (student.middleName.includes('"')) {
      student.nickName = student.middleName;
      student.middleName = "";
    }

    //Clean data
    student.firstName =
      student.firstName.substring(0, 1).toUpperCase() +
      student.firstName.substring(1).toLowerCase();

    if (student.lastName.includes("-")) {
      const iOfHyph = student.lastName.indexOf("-");
      student.lastName =
        student.lastName.substring(0, 1).toUpperCase() +
        student.lastName.substring(1, iOfHyph + 1).toLowerCase() +
        student.lastName.substring(iOfHyph + 1, iOfHyph + 2).toUpperCase() +
        student.lastName.substring(iOfHyph + 2).toLowerCase();
    } else {
      student.lastName =
        student.lastName.substring(0, 1).toUpperCase() +
        student.lastName.substring(1).toLowerCase();
    }

    student.middleName =
      student.middleName.substring(0, 1).toUpperCase() +
      student.middleName.substring(1).toLowerCase();

    student.nickName =
      student.nickName.substring(0, 2).toUpperCase() +
      student.nickName.substring(2).toLowerCase();

    student.house =
      student.house.substring(0, 1).toUpperCase() +
      student.house.substring(1).toLowerCase();

    student.image =
      student.lastName.toLowerCase() +
      "_" +
      student.firstName.substring(0, 1).toLowerCase() +
      ".png";

    console.log(student.image);

    //Add object to array
    allStudents.unshift(student);
  });
  displayList();
}

function cleanData() {
  modifyArray();
}

function modifyArray() {}

function displayList() {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  allStudents.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document
    .querySelector("template#students")
    .content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=middleName]").textContent =
    student.middleName;
  clone.querySelector("[data-field=nickName]").textContent = student.nickName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("img").src = `imgs/${student.image}`;

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
