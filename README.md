*This project has been created as part of the 42 curriculum by kosipova, amonot, lvicino.*

# ft_transcendence

## Description

**ft_transcendence** is a web application where users can play Pong in real-time against other players. The goal of this project is to build a complete, single-page web application with a robust backend, real-time multiplayer capabilities, and a seamless user experience.

Key features include:
- Real-time multiplayer Pong game
- Live chat and direct messaging
- Friends management and user profiles
- Game customization
- Live notifications
- Multiple languages support (i18n)

---

## Instructions

### Requirements
- Docker and Docker Compose (v2 recommended)
- Web browser (Chrome, Firefox, Safari)

### Setup

1. Clone the repository.
2. Several `.env.example` files are provided across the repository in the root, `database/`, `auth-api/` directories and `root` . You must copy them to `.env` and configure your credentials.
   ```bash
   cp .env.example .env
      ```
3. Inside your root .env file:
```bash
  UID=1000 # Replace with the output of: id -u
  GID=1000 # Replace with the output of: id -g
   ```

### Run

To build and start the application, run the following command at the root of the project:

```bash
docker compose up --build
```

The application will be accessible. The default exposed port is 8443 via HTTPS (`https://localhost:8443`).

---

## Team Information

- **amonot** — Backend Developer, Technical Lead  
  *Responsibilities:* API design, game logic implementation, database architecture, WebSocket server configuration, and overall technical decisions.

- **lvicino** — Chat Developer, Product Owner  
  *Responsibilities:* Chat system architecture, direct messaging features, Integrated 42 API login in the auth-service, feature prioritization, and validation.
  
- **kosipova** — Frontend Developer, Project Manager  
  *Responsibilities:* UI/UX implementation, game rendering on the canvas, WebSocket client integration, project coordination, and task tracking.

---

## Project Management

- **Task Organization:** Work was organized feature by feature, with strict separation between frontend, backend, and chat services.
- **Tools Used:** GitHub was used for code hosting, version control, and Issue tracking to manage tasks.
- **Communication:** Discord was used for daily communication, meetings, and quick synchronization.

---

## Technical Stack

- **Frontend:** TypeScript, React 19, Tailwind CSS v4, Zustand  
  *Justification:* React provides fast UI development through reusable components. Zustand offers lightweight and simple state management compared to Redux. Tailwind speeds up styling.
- **Backend:** Fastify (Node.js)  
  *Justification:* Fastify was chosen for its high performance and low overhead, which is crucial for handling real-time requests.
- **Real-time Communication:** WebSockets  
  *Justification:* Essential for low-latency, bi-directional communication required by the live Pong game and chat.
- **Database:** PostgreSQL  
  *Justification:* A robust relational database chosen for its reliability in handling structured data (users, matches, relations) and complex queries.

---

## Database Schema

**Visual Description:**
The database relies on a relational model centered around the user.

**Tables and Key Fields:**
- `users`: 
  - `id` (UUID, Primary Key)
  - `username` (VARCHAR, Unique)
  - `avatar` (VARCHAR, URL to image)
- `matches`: 
  - `id` (UUID, Primary Key)
  - `player1_id` (UUID, Foreign Key -> users.id)
  - `player2_id` (UUID, Foreign Key -> users.id)
  - `score1` (INT)
  - `score2` (INT)
  - `status` (VARCHAR)
- `messages`: 
  - `id` (UUID, Primary Key)
  - `sender_id` (UUID, Foreign Key -> users.id)
  - `receiver_id` (UUID, Foreign Key -> users.id)
  - `content` (TEXT)
  - `timestamp` (TIMESTAMP)
- `friends`: 
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key -> users.id)
  - `friend_id` (UUID, Foreign Key -> users.id)

---

## Features List

- **Authentication and Profiles** (amonot, lvicino): Secure login via 42 OAuth. Users can update their avatar and view their match history.
- **Chat System** (lvicino): Real-time chat allowing users to send direct messages, block other users, and invite them to play.
- **Pong Game** (amonot, kosipova): The core gameplay loop, featuring server-authoritative physics and real-time client rendering.
- **Lobby System** (amonot, kosipova): Matchmaking system allowing users to find opponents or accept direct challenges.
- **Game Customization** (kosipova): Users can tweak visual settings of the game (e.g., board colors).
- **Notifications** (kosipova, lvicino): Live toast notifications for messages, friend requests, and game invites.
- **Multiple Languages** (kosipova): i18n implementation allowing users to switch between different languages dynamically.

---

## Modules

### Major Modules (6 × 2 = 12 points)

1. **Framework frontend + backend** *Justification:* Provides a structured architecture.  
   *Implementation:* Built using React for the SPA and Fastify for microservices.  
   *Team:* kosipova (Front), amonot (Back).
2. **Real-time features (WebSockets)** *Justification:* Required for multiplayer interactions.  
   *Implementation:* Native WebSockets implemented on Fastify, syncing 60 ticks per second.  
   *Team:* amonot, lvicino, kosipova.
3. **User interaction (chat, profile, friends)** *Justification:* Creates a social experience around the game.  
   *Implementation:* Dedicated chat-api microservice handling relations and live message broadcasting.  
   *Team:* lvicino.
4. **Web-based game (Pong)** *Justification:* The core feature of the subject.  
   *Implementation:* Custom 2D physics engine on the backend, rendered via HTML5 Canvas on the frontend.  
   *Team:* amonot, kosipova.
5. **Remote players** *Justification:* Allows users on different networks to play together.  
   *Implementation:* State synchronization handled via WebSockets with latency compensation.  
   *Team:* amonot.
6. **Backend as microservices** *Justification:* Separates domains for better scalability.  
   *Implementation:* Backend split into `auth-api`, `chat-api`, and `game-api`, routed through Traefik.  
   *Team:* amonot.

### Minor Modules (8 × 1 = 8 points)

1. **Design system:** Reusable UI components built with Tailwind CSS. (kosipova)
2. **Multiple languages:** Built using `react-i18next`. (kosipova)
3. **Game customization:** Alters canvas rendering. (kosipova)
4. **Notification system:** Global React context triggering toast components via WebSockets. (kosipova, lvicino)
5. **OAuth 2.0:** Integrated 42 API login in the auth-service. (amonot, lvicino)
6. **Additional browsers:** Ensuring compatibility across Chrome, Firefox, and Safari via standard web APIs. (kosipova)
7. **Frontend framework:** React 19 setup with Vite. (kosipova)
8. **Backend framework:** Fastify setup. (amonot, lvicino)

**Total:** 20 points

---

## Individual Contributions

### amonot
- **Contributions:** Designed the microservice architecture, built the Fastify backend, developed the server-side Pong physics engine, and configured Traefik.
- **Challenges:** Synchronizing the game state between two clients with different latencies was difficult.
- **Solution:** Implemented a server-authoritative model with a fixed tick rate to ensure both players see consistent physics.

### lvicino
- **Contributions:** Designed and implemented chat system, including the database schema for messages and relations, and the WebSocket message broker.
- **Challenges:** Handling edge cases like users blocking each other while currently in a chat or game.
- **Solution:** Added strict middleware checks on the WebSocket events to intercept and drop messages if a block relation exists in the database.

### kosipova
- **Contributions:** Set up the React 19 frontend, built the design system, implemented the game canvas rendering, and integrated the i18n language switcher.
- **Challenges:** Maintaining smooth 60fps rendering on the frontend without dropping frames when WebSocket updates arrived inconsistently.
- **Solution:** Implemented client-side interpolation to smooth out paddle movements between server ticks.

---

## Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Fastify Documentation](https://fastify.dev/docs/latest/)
- [MDN WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

## AI Usage

AI tools (like ChatGPT / Claude) were used during this project for:
- **Code Assistance:** Generating boilerplate code for React components and Fastify route schemas.
- **Debugging:** Helping identify race conditions in WebSocket connections and resolving Docker networking issues.
- **Documentation:** Assisting in formatting and translating this README.

*Note: All generated code was thoroughly reviewed, tested, and modified to fit our architecture before being integrated into the final project.*