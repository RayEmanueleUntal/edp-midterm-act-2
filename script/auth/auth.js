// ------Helper functions
// Store data
function storeUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function storeCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// ------Exported functions
// Retrieve/Fetch data
export function retrieveUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Logout
export function logout() {
  localStorage.removeItem("currentUser");
}

// Login
export function login(email, password) {
  const users = retrieveUsers();

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    storeCurrentUser(user);
    return { success: true, user };
  }
  return { success: false, message: "Invalid email or password" };
}

// Signup
export function signup(username, email, password) {
  // Validation
  if (password.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters",
    };
  }
  if (!email.includes("@")) {
    return { success: false, message: "Invalid email!" };
  }

  const users = retrieveUsers();

  // Check for existing user
  if (users.some((user) => user.email === email)) {
    return { success: false, message: "User already exists!" };
  }

  // Save user
  const newUser = { username, email, password };
  storeUsers([...users, newUser]);

  return { success: true };
}
