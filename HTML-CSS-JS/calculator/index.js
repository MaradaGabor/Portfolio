const userInput = document.getElementsByClassName(`userInput`)[0];

let result = "";

function press(num) {
  const lastChar = result[result.length - 1];
  const operator = ["+", "-", "*", "/", "."];
  if (operator.includes(lastChar) && operator.includes(num)) {
    result = result.slice(0, -1) + num;
  } else {
    // Otherwise, simply concatenate the new operator
    result += num;
  }

  userInput.value = result;
}

function equal() {
  try {
    userInput.value = eval(result);
    result = "";
  } catch (error) {
    userInput.value = "Error: Invalid expression";
  }
}

function erase() {
  result = "";
  userInput.value = result;
}
