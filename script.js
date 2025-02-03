// Sticky Navigation Menu
let nav = document.querySelector("nav");
let scrollBtn = document.querySelector(".scroll-button a");

window.onscroll = function () {
  if (document.documentElement.scrollTop > 20) {
    nav.classList.add("sticky");
    scrollBtn.style.display = "block";
  } else {
    nav.classList.remove("sticky");
    scrollBtn.style.display = "none";
  }
};

// Navigation Menu Toggle
let navBar = document.querySelector(".navbar");
let menuBtn = document.querySelector(".menu-btn");
let cancelBtn = document.querySelector(".cancel-btn");
let body = document.querySelector("body");

menuBtn.onclick = function () {
  navBar.classList.add("active");
  menuBtn.style.display = "none";
  body.style.overflow = "hidden";
};

cancelBtn.onclick = function () {
  navBar.classList.remove("active");
  menuBtn.style.display = "block";
  body.style.overflow = "auto";
};

// Smooth Scroll for Links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Chatbot Interactivity
const chatbotIcon = document.getElementById("chatbot-icon");
const chatbot = document.getElementById("chatbot");
const closeChatbot = document.getElementById("close-chatbot");
const chatbotMessages = document.querySelector(".chatbot-messages");
const chatbotInput = document.getElementById("chatbot-input");

// Toggle chatbot visibility on icon click
chatbotIcon.addEventListener("click", () => {
  chatbot.classList.toggle("hidden");
});

// Close chatbot on close button click
closeChatbot.addEventListener("click", () => {
  chatbot.classList.add("hidden");
});

// Handle user input and responses
chatbotInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter" && chatbotInput.value.trim() !== "") {
    const userMessage = chatbotInput.value.trim();
    addMessage(userMessage, "user");
    chatbotInput.value = "";

    const botReply = await getBotReply(userMessage);
    addMessage(botReply, "bot");
  }
});

// Function to add messages to the chat interface
function addMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  if (sender === "bot") {
    messageDiv.innerHTML = message;
  } else {
    messageDiv.textContent = message;
  }

  chatbotMessages.appendChild(messageDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Function to send user input to Flask API
async function getBotReply(query) {
  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query }),
    });

    const data = await response.json();
    return data.reply || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("Error communicating with chatbot:", error);
    return "Sorry, I'm having trouble processing your request.";
  }
}

// Fetch GitHub projects dynamically
async function getProjects() {
  try {
    const response = await fetch("https://api.github.com/users/PaartHD03/repos");
    const projects = await response.json();

    if (projects.length === 0) {
      return "I couldn't fetch any projects from GitHub. Please check back later.";
    }

    let projectList = "<strong>My Projects:</strong><ul>";
    projects.forEach((project) => {
      projectList += `<li><a href="${project.html_url}" target="_blank">${project.name}</a></li>`;
    });
    projectList += "</ul>";
    return projectList;
  } catch (error) {
    console.error("Error fetching GitHub projects:", error);
    return "Couldn't load projects.";
  }
}
