import axios from "axios";
const baseUrl = "http://localhost:3001/persons/";

const getAll = () => {
  return axios.get(baseUrl).then((response) => response.data);
};

const create = (newObject) => {
  return axios.post(baseUrl, newObject).then((response) => response.data);
};

const update = (id, updatedObject) => {
  return axios.put(baseUrl + id, updatedObject);
};

const deleteEntry = (id) => {
  axios.delete(baseUrl + id).then((response) => response.data);
};

export default { getAll, create, deleteEntry, update };
