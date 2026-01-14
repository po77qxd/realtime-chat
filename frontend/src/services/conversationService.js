import axios from "axios";

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/conversations/',
  withCredentials: true,
  headers: {
    "Accept": 'application/json',
    "Content-Type": 'application/json',
  },
})

async function getConversations() {
  return apiClient.get('/')
}

async function getMessagesByConvId(id) {
  return apiClient.get(`/${id}/messages`)
}

export default {
  getConversations,
  getMessagesByConvId
}