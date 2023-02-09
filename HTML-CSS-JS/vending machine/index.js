"use strict";

const display = document.getElementsByClassName(`display`)[0];
const coinLabel = document.getElementById("receivedCoin");
const productLabel = document.getElementById("receivedProduct");

let displayText = "";
let result = 0;
let intervalId;
let selectedProduct = "";
let productPrice = "";
let productName = "";
let selectedProductCode = "";

const coinsDropped = {
  200: 0,
  100: 0,
  50: 0,
  20: 0,
  10: 0,
  5: 0,
};
const sortedKeys = Object.keys(coinsDropped).sort((a, b) => b - a);

const machineInventory = {
  products: [
    {
      name: "Coca-cola",
      code: "01",
      value: 250,
      inventory: 2,
    },
    {
      name: "Sprite",
      code: "02",
      value: 240,
      inventory: 2,
    },
    {
      name: "Fanta",
      code: "03",
      value: 260,
      inventory: 2,
    },
    {
      name: "Szensavas",
      code: "44",
      value: 220,
      inventory: 2,
    },
    {
      name: "Enyhe",
      code: "45",
      value: 220,
      inventory: 2,
    },
    {
      name: "Mentes",
      code: "46",
      value: 200,
      inventory: 2,
    },
    {
      name: "Snickers",
      code: "57",
      value: 260,
      inventory: 2,
    },
    {
      name: "Mars",
      code: "58",
      value: 260,
      inventory: 2,
    },
    {
      name: "Bounty",
      code: "59",
      value: 260,
      inventory: 2,
    },
  ],
  change: {
    200: 3,
    100: 3,
    50: 3,
    20: 10,
    10: 10,
    5: 20,
  },
};

function populateProductInfo() {
  for (let i = 0; i < machineInventory.products.length; i++) {
    const product = machineInventory.products[i];
    const productElement = document.getElementById(`item--${i + 1}`);
    const textBackgroundElement =
      productElement.getElementsByClassName("text--background")[0];

    const productNumberElement = document.createElement("p");
    productNumberElement.innerHTML = `(${product.code})`;

    const productValueElement = document.createElement("p");
    productValueElement.innerHTML = `${product.value} Ft`;

    const productNameElement = document.createElement("p");
    productNameElement.innerHTML = product.name;

    textBackgroundElement.appendChild(productNumberElement);
    textBackgroundElement.appendChild(productValueElement);
    textBackgroundElement.appendChild(productNameElement);
  }
}
populateProductInfo();

function rememberSelectedProduct(code) {
  if (code !== 0) {
    const selectedProduct = machineInventory.products.find(
      (product) => product.code === code
    );
    // defines the product which needs to be paid out
    productPrice = selectedProduct.value;
    // defines the product's name which was selected
    productName = selectedProduct.name;
  } else {
    productPrice = "";
    productName = "";
  }
}

function press(num) {
  clearInterval(intervalId);
  if (display.value.length < 1) {
    display.value += num;
  } else if (display.value.length < 2) {
    display.value += num;

    if (validateCodeInventory(display.value)) {
      selectedProductCode = "";
      selectedProductCode = display.value;
      writOutPrice(display.value);

      intervalId = setInterval(function () {
        erase();
      }, 8000);

      rememberSelectedProduct(selectedProductCode);
    } else {
      writeOutText("ERROR");
    }
  }
}

const validateCodeInventory = function (number) {
  let product = machineInventory.products.find((p) => p.code === number);
  if (product && product.inventory) {
    return true;
  } else {
    return false;
  }
};

const writOutPrice = function (number) {
  let product = machineInventory.products.find((p) => p.code === number);
  display.value = `${product.value} HUF`;
};

const writeOutText = function (text) {
  display.value = text;
};

const decreasePriceOnDisplay = function (price, num) {
  display.value = `${price} HUF`;
};

// NE a display-ből fejtsem vissza hanem Object-ből - selectedProduct

function coinDroppedObjectFiller(moneyBack, coin) {
  console.log(moneyBack, coin);
  // Loop until there is inventory from that coin
  // and moneyback is greater than the coin
  while (moneyBack >= coin && machineInventory.change[coin] > 0) {
    // if the coin met the conditions, remove the coin's value from the moneyback value
    moneyBack -= coin;
    // ADD the coin to the "coinsDropped" object
    logCoinDropped(coin);
    // REMOVE the coin from the "logCoinToMachineInventory" object
    logCoinToMachineInventory(-1 * coin);
  }
  console.log(coinsDropped);
  return moneyBack;
}

function logCoinDropped(coin) {
  coin > 0 ? coinsDropped[coin]++ : coinsDropped[-1 * coin]--;
}

function logCoinToMachineInventory(coin) {
  coin > 0
    ? machineInventory.change[coin]++
    : machineInventory.change[-1 * coin]--;
}

function moneyInserted(coinAdded) {
  // Log the coin which has been added
  logCoinDropped(coinAdded);
  // should only answer to coins on display if product is selected
  if (display.value.slice(-3) === "HUF") {
    // resets timer
    clearInterval(intervalId);

    // IF the money that needs to be paid is MORE than the coin
    // Just accepts it and reduce the vakue that needs to be paid
    if (productPrice >= coinAdded) {
      // save in a memory how much coin has been added so far. So if wwe need to give back, we can read out from it
      result += coinAdded;
      // decrease the price left to be payed
      productPrice -= coinAdded;
      // decrease the price on the display
      decreasePriceOnDisplay(productPrice, coinAdded);
      // put the coin into the inventory and remove it from the coinsDropped memory obj
      logCoinDropped(-1 * coinAdded);
      logCoinToMachineInventory(coinAdded);
    } else {
      // Calculate how much change needs to be given back

      let moneyBack = coinAdded - productPrice;
      // Loop thru the possible coins, and call the check function

      for (const key of sortedKeys) {
        moneyBack = coinDroppedObjectFiller(moneyBack, key);
      }

      // If everything was successful, the moneyBack value should be 0
      if (moneyBack === 0) {
        // Put the last coin into the inventory and remove it from the memory
        logCoinDropped(-1 * coinAdded);
        logCoinToMachineInventory(coinAdded);
        // Print out to to display "DONE"
        writeOutText("DONE");
        // Remove qty 1 from the inventory of the product
        const selectedProduct = machineInventory.products.find(
          (product) => product.code === selectedProductCode
        );
        selectedProduct.inventory--;
        // Print out to the label the product name
        giveOutProduct(productName);
        // Print out the change which was given back
        giveBackCoins(coinsDropped);

        // Forget prev selection
        rememberSelectedProduct(0);
      } else {
        // Print out to the display "SOLD OUT"
        writeOutText("SOLD OUT");
        // Forget prev selection
        rememberSelectedProduct(0);
        // Erase info from labels
        erase();

        // Populate the memory object with the money already payed for the product
        for (const key of sortedKeys) {
          result = coinDroppedObjectFiller(result, key);
        }
        // Not enough coins in the vending machine, need to give back the money
        // Should give back what it is in the coinsDropped
        giveBackCoins(coinsDropped);
      }
    }
  } else {
    giveBackCoins(coinsDropped);
  }
}

const giveBackCoins = function (objectName) {
  displayText = "";
  Object.keys(objectName).forEach(function (coin) {
    if (objectName[coin] > 0) {
      displayText += `${coin}HUF - ${objectName[coin]} ** `;
      objectName[coin] = 0;
    }
  });
  for (let coin in coinsDropped) {
    coinsDropped[coin] = 0;
  }
  coinLabel.innerHTML = displayText;
  result = 0;
};

const giveOutProduct = function (productName) {
  displayText = "";
  displayText = productName;
  productLabel.innerHTML = displayText;
  coinLabel.innerHTML = displayText;
};

function del() {
  console.log(coinsDropped, result);
  // Forget prev selection
  rememberSelectedProduct(0);
  erase();
  for (const key of sortedKeys) {
    result = coinDroppedObjectFiller(result, key, "return");
  }
  // Not enough coins in the vending machine, need to give back the money
  // Should give back what it is in the coinsDropped
  giveBackCoins(coinsDropped);
}

function erase() {
  display.value = "";
  coinLabel.innerHTML = "Nothing";
  productLabel.innerHTML = "Nothing";
}
