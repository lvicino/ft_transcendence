const ChatRepository = require('../repositories/chat.repository.js');

class ChatService {
  constructor() {
    this.connectedClients = new Map();
  }

  addClient(userId, username, socket) {
    this.connectedClients.set(userId, { socket, username });
    this.broadcastOnlineStatus();
  }

  removeClient(userId) {
    this.connectedClients.delete(userId);
    this.broadcastOnlineStatus();
  }

  getAllOnlineUsers() {
    const users = [];
    for (const [id, data] of this.connectedClients.entries()) {
      users.push({ id, username: data.username });
    }
    return users;
  }

  isUserOnline(userId) {
    return this.connectedClients.has(userId);
  }

  broadcastOnlineStatus() {
    const onlineUsers = this.getAllOnlineUsers();
    const payload = JSON.stringify({
      type: 'online_users',
      users: onlineUsers
    });

    for (const [_, data] of this.connectedClients.entries()) {
      data.socket.send(payload);
    }
  }

  async ensureUserExists(id, username) {
    await ChatRepository.ensureUserExists(id, username);
  }

  async addFriend(userId, friendId) {
    if (Number(friendId) === Number(userId)) {
      throw Object.assign(new Error('Cannot add yourself as a friend'), { code: 'SELF_ADD' });
    }

    const friendExists = await ChatRepository.userExists(friendId);

    if (!friendExists) {
      throw Object.assign(new Error('User does not exist or has never connected to the chat'), { code: 'USER_NOT_FOUND' });
    }

    await ChatRepository.addFriend(userId, friendId);
  }

  async removeFriend(userId, friendId) {
    await ChatRepository.removeFriend(userId, friendId);
  }

  async getFriends(userId) {
    const friends = await ChatRepository.getFriends(userId);
    return friends.map(f => ({
      ...f,
      online: this.isUserOnline(f.id)
    }));
  }

  async handleMessage(senderId, payloadStr) {
    try {
      const data = JSON.parse(payloadStr);
      if (data.type === 'message') {
        const receiverId = data.receiverId || null;

        // Grab the username directly from active memory
        const senderUsername = this.connectedClients.get(senderId)?.username || 'unknown';

        const messagePayload = JSON.stringify({
          type: 'new_message',
          message: {
            sender_id: senderId,
            receiver_id: receiverId,
            content: data.content,
            created_at: new Date().toISOString(),
            sender_username: senderUsername
          }
        });

        if (receiverId === null) {
          // Global message - broadcast to all
          for (const [_, clientData] of this.connectedClients.entries()) {
            clientData.socket.send(messagePayload);
          }
        } else {
          // Private message - send only to sender and receiver
          const senderData = this.connectedClients.get(senderId);
          if (senderData) senderData.socket.send(messagePayload);

          const receiverData = this.connectedClients.get(receiverId);
          if (receiverData && receiverId !== senderId) {
            receiverData.socket.send(messagePayload);
          }
        }
      }
    } catch(err) {
      console.error("Error handling message:", err);
    }
  }
}

module.exports = new ChatService();