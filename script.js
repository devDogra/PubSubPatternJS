/* ---------------------- EVENTS/PUBSUB/MEDIATOR MODULE --------------------- */
// with this, Person module doesnt have to be aware of all the other stuff that does smth when it changes (add/removes) a person. All it does it take care of what it has to do, then emit an event, and whoever finds is important can attach a listener for that event and handle it when they hear the emission!

// otherwise, Persons would have had to change the stuff in stats too any time addor remove person was run :(

// emit(eventName, eventObject)
// subscribe(eventName, eventHandler)
// unsubscribe(eventName, eventHandler)
let pubsub = (function () {
  let handlers = {}; // handlers[eventName] contains all the handlers for that event

  function emit(eventName, eventObject) {
    // if (!handlers[eventName]) {
    //   handlers[eventName] = [];
    // }
    handlers[eventName] = handlers[eventName] || [];

    // run each handler on eventName event
    handlers[eventName].forEach((handler) => {
      handler(eventObject);
    });
  }

  // starts listening to eventName by attaching eventHandler to
  // its list of handlers
  function subscribe(eventName, eventHandler) {
    // if (!handlers[eventName]) {
    //   handlers[eventName] = [];
    // }
    handlers[eventName] = handlers[eventName] || [];
    // add eventHandler to the list of handlers for this event
    handlers[eventName].push(eventHandler);
  }

  // turn off the event listener eventHandler for the event eventName
  function unsubscribe(eventName, eventHandler) {
    handlers[eventName].filter((handler) => handler != eventHandler);
  }

  return { subscribe, unsubscribe, emit };
})();

/* ------------------------------ STATS MODULE ------------------------------ */
// listened to events: personsChanged
// contains everything related to the stats of persons, and the stats box

let Stats = (function () {
  let numPeople = 0;

  // CACHE DOM
  let statsDiv = document.querySelector(".stats");
  let numPeopleSpan = document.querySelector(".num-people");

  renderPersonCount();

  // EVENT BINDINGS
  pubsub.subscribe("personsChanged", updatePersonCount);

  // private methods
  function updatePersonCount(eventObject) {
    // the eventObject that is emitted is 'persons'!
    // assigning eventObject to some random trash wont work,
    // but eventObject[0] = randomtrash would, cuz see notes: passvalorrefJS
    // so im gonna mofidy person module to only pass the length
    numPeople = eventObject;
    renderPersonCount(); // why not pass eventObj directly?
    // cuz we want updatePC to just modify the state

    // render will do all of the rendering and just the rendering
    // we wanna maintain seperation of concerns
  }

  function renderPersonCount() {
    numPeopleSpan.innerText = numPeople;
  }
})();

/* ------------------------------ PERSON MODULE ----------------------------- */
// events: persons changed
// contains everything related to persons, including caching DOM, binding events

let Person = (function () {
  let persons = [];

  // CACHE DOM
  let peopleDiv = document.querySelector(".people");
  let personTemplate = document.querySelector("#person-template");
  let addPersonBtn = document.querySelector("button.add-person");
  let inputName = document.querySelector("#add-person-name");
  let inputAge = document.querySelector("#add-person-age");

  // EVENT BINDINGS
  // click remove person btn
  document.addEventListener("click", (e) => {
    if (!e.target.matches("button.remove-person")) return;
    let posn = e.target.closest(".person").dataset.position;
    removePerson(persons[posn]);
  });

  // click add person btn
  addPersonBtn.addEventListener("click", (e) => {
    let newPerson = Person(inputName.value, inputAge.value);
    addPerson(newPerson);
  });

  // private methods
  function Person(name, age) {
    return { name, age };
  }

  function getPersonNode(person, idx) {
    let personTemplateClone = personTemplate.content.cloneNode(true);
    let personDiv = personTemplateClone.querySelector(".person");
    let personName = personTemplateClone.querySelector(".person-name");
    let personAge = personTemplateClone.querySelector(".person-age");

    personName.innerText = person.name;
    personAge.innerText = person.age;

    personDiv.dataset.position = idx;

    return personDiv;
  }

  function renderPersons() {
    peopleDiv.innerHTML = "";
    persons.forEach((person, idx) => {
      peopleDiv.appendChild(getPersonNode(person, idx));
    });
  }

  // public
  function addPerson(person) {
    persons.push(person);
    pubsub.emit("personsChanged", persons.length);
    renderPersons();
  }
  function removePerson(personToRemove) {
    console.log(personToRemove);
    persons = persons.filter((person) => person !== personToRemove);
    pubsub.emit("personsChanged", persons.length);
    renderPersons();
  }

  // exporting add person as API, so that other parts of program can also
  // use this feature, not just via the add person btn.
  // try it in console. p = {...}, add it. then do person.removeperson(p)

  return { addPerson, removePerson };
})();
