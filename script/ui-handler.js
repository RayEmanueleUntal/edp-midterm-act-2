import { signup, login } from "./auth.js";

const state = {
  formData: {
    username: "",
    email: "",
    password: "",
  },
  errors: {},
};

const handleInputChange = (event) => {
  const { name, value } = event.target;

  state.formData[name] = value;
};

const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");

if (loginForm) {
  loginForm.addEventListener("input", handleInputChange);
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = login(state.formData.email, state.formData.password);
    if (result.success) window.location.href = "./Home.html";
    else alert(result.message);
  });
}

if (signupForm) {
  signupForm.addEventListener("input", handleInputChange);
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const { username, email, password } = state.formData;
    const result = signup(username, email, password);

    if (result.success) {
      alert("Account created! Please login.");
      window.location.href = "./Login.html";
    } else {
      alert(result.message);
    }
  });
}
