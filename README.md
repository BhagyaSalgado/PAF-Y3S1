# Skill Share Website

The **Skill Share Website** is a full-stack web application that allows users to share, discover, and learn new skills. The project includes both frontend and backend components, providing a comprehensive platform for educational content exchange.

---

## 🧰 Technologies Used

### Frontend
- HTML, CSS, JavaScript
- Node.js (package.json present)
- Vite (for frontend build tooling)
- Possibly React/Vue (based on Vite setup)

### Backend
- Java with Spring Boot (via `pom.xml`)
- Token-based Authentication (JWT)
- Maven (project build and dependency management)

---

## 📁 Project Structure

```
Skill Share Website/
├── backend/                      # Java backend (Spring Boot)
├── access-refresh-token-keys/   # JWT token keys
├── .vite/                       # Vite cache (frontend build)
├── .idea/                       # IDE config files (IntelliJ)
├── .vscode/                     # VS Code settings
├── package.json                 # Node.js frontend config
├── Stylish-navbar.txt           # Navbar styling notes/snippets
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js & npm
- Maven

### Backend Setup (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

```bash
npm install
npm run dev
```

> Make sure token keys in `access-refresh-token-keys/` are correctly linked in backend configuration.

---

## 🔐 Authentication

This project uses JWT-based authentication with **access** and **refresh** tokens. Keys are stored securely under `access-refresh-token-keys/`.

---

## 📦 Deployment

- You can deploy the frontend using Vite to services like Vercel or Netlify.
- Backend can be containerized or hosted on platforms like Heroku, Render, or AWS EC2.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests are welcome! Please make sure to update tests as appropriate.

---

## 📬 Contact

For issues or contributions, feel free to reach out or open an issue in the repository.
