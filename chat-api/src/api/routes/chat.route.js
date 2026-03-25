const jwt = require('jsonwebtoken');
const chatService = require('../../services/chat.service.js');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function (fastify, opts) {

  async function verifyToken(request, reply) {
    const token = request.cookies.access_token;
    if (!token) {
      return reply.code(401).send({ error: "Unauthorized", message: "Missing token" });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      request.user = decoded;
    } catch (err) {
      return reply.code(401).send({ error: "Unauthorized", message: "Invalid token" });
    }
  }

  fastify.get('/friends', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const friends = await chatService.getFriends(request.user.id);
      return reply.code(200).send(friends);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.get('/friends/:userId', { preHandler: verifyToken }, async (request, reply) => {
    try {
      const targetUserId = request.params.userId;
      const friends = await chatService.getFriends(targetUserId);
      return reply.code(200).send(friends);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post('/friend', { preHandler: verifyToken }, async (request, reply) => {
    const { friendId } = request.body;
    if (!friendId) {
      return reply.code(400).send({ error: "Bad Request", message: "friendId required" });
    }
    try {
      // Ensure the requesting user is registered in the chat DB
      await chatService.ensureUserExists(request.user.id, request.user.username);
      await chatService.addFriend(request.user.id, friendId);
      return reply.code(201).send({ message: "Friend added successfully" });
    } catch (error) {
      if (error.code === 'SELF_ADD') {
        return reply.code(400).send({ error: "Bad Request", message: "You cannot add yourself as a friend" });
      }
      if (error.code === 'USER_NOT_FOUND') {
        return reply.code(404).send({ error: "Not Found", message: "User does not exist" });
      }
      request.log.error(error);
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.delete('/friend', { preHandler: verifyToken }, async (request, reply) => {
    const { friendId } = request.body;
    if (!friendId) {
      return reply.code(400).send({ error: "Bad Request", message: "friendId required" });
    }
    try {
      await chatService.removeFriend(request.user.id, friendId);
      return reply.code(200).send({ message: "Friend removed successfully" });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.get('/ws', { websocket: true, preHandler: verifyToken }, (connection, req) => {
    const user = req.user;

    chatService.ensureUserExists(user.id, user.username).catch(err => req.log.error(err));
    chatService.addClient(user.id, user.username, connection);

    connection.on('message', async (message) => {
      await chatService.handleMessage(user.id, message.toString());
    });

    connection.on('close', () => {
      chatService.removeClient(user.id);
    });

	connection.on('error', (err) => {
      req.log.error(err);
      chatService.removeClient(user.id);
    });
  });
}