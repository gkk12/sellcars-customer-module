let btnLogin = document.querySelector<HTMLButtonElement>("#btn-login");
let username = document.querySelector<HTMLInputElement>("#txt-input-username");
let password = document.querySelector<HTMLInputElement>("#txt-input-password");

btnLogin?.addEventListener("click", clickHandler)

async function clickHandler() {

  const usernameValue = username?.value;
  const passwordValue = password?.value;

  const data = {username: usernameValue, password: passwordValue}
  const response = await fetch('http://localhost:3000/users/login', {
    method: "POST", 
    mode: "cors", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  const result = await response.json()
  console.log(result)

  if (result.status === "logged in") {
    window.location.href = "customerPage.html";
  }
};