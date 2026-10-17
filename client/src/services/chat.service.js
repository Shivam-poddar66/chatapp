import api from './api';

export const chatService = {
  async getContacts() {
    const response = await api.get('/users/contacts');
    return response.data.data.contacts;
  },

  async searchUsers(query) {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data.data.users;
  },

  async getOrCreateConversation(userId) {
    const response = await api.get(`/conversations/user/${userId}`);
    return response.data.data.conversation;
  },

  async getMessages(conversationId, { beforeId = null, limit = 30 } = {}) {
    let url = `/conversations/${conversationId}/messages?limit=${limit}`;
    if (beforeId) {
      url += `&beforeId=${beforeId}`;
    }
    const response = await api.get(url);
    return response.data.data.messages;
  },

  async markAsRead(conversationId, senderId) {
    const response = await api.post(`/conversations/${conversationId}/read`, { senderId });
    return response.data.data;
  }
};
