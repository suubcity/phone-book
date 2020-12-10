import React, { useState, useEffect, useDebugValue } from "react";
import noteService from "./services/notes";

const App = () => {
  const useStateWithLabel = (initialValue, name) => {
    const [value, setValue] = useState(initialValue);
    useDebugValue(`${name}: ${value}`);
    return [value, setValue];
  };

  const [persons, setPersons] = useStateWithLabel([], "persons");
  const [newName, setNewName] = useStateWithLabel("", "newName");
  const [newNumber, setNewNumber] = useStateWithLabel("", "newNumber");
  const [newSearch, setNewSearch] = useStateWithLabel("", "newSearch");
  const [notificationMessage, setNotificationMessage] = useStateWithLabel(
    null,
    "notificationMessage"
  );
  const [errorMessage, setErrorMessage] = useStateWithLabel(
    null,
    "errorMessage"
  );

  useEffect(() => {
    noteService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const updateNotificationMessage = (message) => {
    setNotificationMessage(message);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4000);
  };

  const updateErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 4000);
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleNumberChange = (e) => {
    setNewNumber(e.target.value);
  };

  const handleSearch = (e) => {
    setNewSearch(e.target.value);
  };

  const personAlreadyExists = () => {
    return persons.find((person) => person.name === newName);
  };

  const createNewObject = () => {
    return {
      name: newName,
      number: newNumber,
    };
  };

  const findIdFromName = () => {
    const currentPerson = persons.filter((person) => {
      return person.name === newName;
    });
    return currentPerson[0].id;
  };

  const userConfirmsNumberReplacement = () => {
    return window.confirm(
      `${newName} already exists, replace old number with new one?`
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (personAlreadyExists()) {
      if (userConfirmsNumberReplacement()) {
        noteService
          .update(findIdFromName(), createNewObject())
          .then(() => {
            updateNotificationMessage(
              `The number for ${newName} has been updated to ${newNumber}`
            );
          })
          .catch((error) => {
            updateErrorMessage(
              `${newName} has already been deleted from server`
            );
            noteService.getAll().then((updatedPersons) => {
              setPersons(updatedPersons);
            });
          });
      }
    } else {
      const newObject = createNewObject();
      noteService.create(newObject).then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
      });
      updateNotificationMessage(`${newName} has been added to the phonebook`);
    }
    setNewName("");
    setNewNumber("");
  };

  const handleDelete = (e) => {
    const { id, name } = e.target.dataset;
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      noteService.deleteEntry(id);

      noteService.getAll().then((updatedPersons) => {
        setPersons(updatedPersons);
      });
    }
  };

  const renderPersons = (array) => {
    return array.map((person) => {
      return (
        <p key={person.id}>
          {person.name} {person.number}{" "}
          <button
            data-id={person.id}
            data-name={person.name}
            onClick={handleDelete}
          >
            Delete
          </button>
        </p>
      );
    });
  };

  const returnSearchedNamesArray = () => {
    const regex = new RegExp(newSearch, "gi");
    return persons.filter((person) => person.name.match(regex));
  };

  const filterNameList = () => {
    if (newSearch === "") {
      return renderPersons(persons);
    } else {
      return renderPersons(returnSearchedNamesArray());
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notificationMessage={notificationMessage} />
      <ErrorMessage errorMessage={errorMessage} />
      <Search handleSearch={handleSearch} />
      <Form
        handleSubmit={handleSubmit}
        handleNameChange={handleNameChange}
        newName={newName}
        handleNumberChange={handleNumberChange}
        newNumber={newNumber}
      />
      <Numbers filterNameList={filterNameList} />
    </div>
  );
};

const Search = ({ handleSearch }) => {
  return (
    <div>
      filter shown with <input onChange={handleSearch}></input>
    </div>
  );
};

const Form = ({
  handleSubmit,
  handleNameChange,
  newName,
  handleNumberChange,
  newNumber,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        name: <input onChange={handleNameChange} value={newName} />
      </div>
      <div>
        number: <input onChange={handleNumberChange} value={newNumber} />
      </div>

      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Numbers = ({ filterNameList }) => {
  return (
    <>
      <h2>Numbers</h2>
      {filterNameList()}
    </>
  );
};

const Notification = ({ notificationMessage }) => {
  if (notificationMessage === null) {
    return null;
  }

  return (
    <>
      <div className="notificationMessage">{notificationMessage}</div>
    </>
  );
};

const ErrorMessage = ({ errorMessage }) => {
  if (errorMessage === null) {
    return null;
  }

  return (
    <>
      <div className="errorMessage">{errorMessage}</div>
    </>
  );
};

export default App;
