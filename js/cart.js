const mainContainer = document.getElementById("main-container");
const circle = document.getElementById("circle-step");
const summaryCart = document.getElementById("summary-card");

let departmentsData = [];
let totalToPay = 0;
const brandStyles = {
  Samsung: { backgroundColor: "#1428A0", textColor: "#FFFFFF" },
  Apple: { backgroundColor: "#A2AAAD", textColor: "#FFFFFF" },
  Google: { backgroundColor: "#4285F4", textColor: "#FFFFFF" },
  Xiaomi: { backgroundColor: "#FF6900", textColor: "#FFFFFF" },
  OnePlus: { backgroundColor: "#EB0028", textColor: "#FFFFFF" },
  Sony: { backgroundColor: "#000000", textColor: "#FFFFFF" },
  Motorola: { backgroundColor: "#5C92FA", textColor: "#FFFFFF" },
  Huawei: { backgroundColor: "#FF0000", textColor: "#FFFFFF" },
  Asus: { backgroundColor: "#00539B", textColor: "#FFFFFF" },
  Realme: { backgroundColor: "#FFCC00", textColor: "#4C4C00" },
  Vivo: { backgroundColor: "#4C8BF5", textColor: "#FFFFFF" },
  Oppo: { backgroundColor: "#00B140", textColor: "#FFFFFF" },
  Lenovo: { backgroundColor: "#E2231A", textColor: "#FFFFFF" },
  Nokia: { backgroundColor: "#124191", textColor: "#FFFFFF" },
  ZTE: { backgroundColor: "#0068B5", textColor: "#FFFFFF" }
};


// #region functions

const increaseProducts = (id) => {
  const input = document.getElementById(`amount-input-${id}`);
  const newValue = parseInt(input.value) + 1;
  const products = JSON.parse(localStorage.getItem("cart"));
  const productIndex = products.findIndex((product) => product.id == id);

  if (newValue > 1) {
    const decreaseButton = document.getElementById(`decrease-${id}`);
    decreaseButton.disabled = false;
    decreaseButton.classList.remove("disabled-button");

  }
  input.value = newValue;
  products[productIndex].quantity = newValue;
  localStorage.setItem("cart", JSON.stringify(products));

  loadProductsInCart();
}

const decreaseProducts = (id) => {
  const input = document.getElementById(`amount-input-${id}`);
  const newValue = parseInt(input.value) - 1;
  const products = JSON.parse(localStorage.getItem("cart"));
  const productIndex = products.findIndex((product) => product.id == id);

  if (newValue < 2) {
    const decreaseButton = document.getElementById(`decrease-${id}`);
    decreaseButton.disabled = true;
    decreaseButton.classList.add("disabled-button");
  }
  if (newValue < 1) {
    return;
  }
  input.value = newValue;
  products[productIndex].quantity = newValue;
  localStorage.setItem("cart", JSON.stringify(products));

  loadProductsInCart();
}

const removeProduct = (id) => {
  const products = JSON.parse(localStorage.getItem("cart"));
  const productIndex = products.findIndex((product) => product.id == id);
  products.splice(productIndex, 1);

  localStorage.setItem("cart", JSON.stringify(products));

  loadProductsInCart();
}

// #endregion

// #region View movimient

const goHome = () => {
  window.location.href = "products.html";
}

const moveToCart = () => {
  // Show list
  document.getElementById("container-list").classList.remove("hide-container");
  // Remove classes
  summaryCart.classList.remove("summary-card-relative");
  mainContainer.classList.remove("pay-page-step", "ship-page-step")
  circle.classList.remove("third-step-circle", "second-step-circle");
}

const moveToShip = () => {
  const existsProducts = true;

  if (!existsProducts) {
    Swal.fire({
      title: "Sin productos",
      text: "Debes de agregar al menos un producto para continuar con el proceso de compra",
      icon: "info",
    });
    return;
  }
  // Hide list
  document.getElementById("container-list").classList.add("hide-container");

  // Remove classes
  mainContainer.classList.remove("pay-page-step")
  circle.classList.remove("third-step-circle");

  // New classes
  mainContainer.classList.add("ship-page-step");
  circle.classList.add("second-step-circle");

  setTimeout(() => {
    summaryCart.classList.add("summary-card-relative");
  }, 1000);
}

const moveToPayment = () => {
  // Remove classes
  mainContainer.classList.remove("ship-page-step")
  circle.classList.remove("second-step-circle");

  // New classes
  mainContainer.classList.add("pay-page-step")
  circle.classList.add("third-step-circle");
}

const pay = () => {
  Swal.fire({
    title: "Confirmación de pago",
    html: `Estás a punto de realizar el pago por $${totalToPay} <br>¿Deseas continuar?`,
    confirmButtonText: "Si, pagar",
    denyButtonText: "No",
    showDenyButton: true,
    showLoaderOnConfirm: true,
    allowOutsideClick: false,
    showCancelButton: false,
    preConfirm: async () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        unit: "px"
      });

      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      try {
        const wallpaper = await loadImage("../assets/bill/fondo-factura.png");
        const logo = await loadImage("../assets/bill/logo.png");

        const productsInList = JSON.parse(localStorage.getItem("cart")).map((product) => {
          return [product.name, product.quantity, `$${product.price}`];
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.addImage(wallpaper, "png", 0, -50, pageWidth, pageHeight + 70);
        doc.addImage(logo, "png", 325, 20, 100, 100);

        doc.setFontSize(18);
        doc.text("Factura consumidor final", pageWidth / 2, 90, { align: "center" });
        doc.setFontSize(13);

        const clientName = localStorage.getItem("active-session") ?? "Cliente";
        doc.text(`Cliente: ${clientName}`, 30, 130);
        doc.text(`Fecha: ${dayjs().format("DD-MM-YYYY hh:mm:ss a")}`, 30, 145);

        // Set items
        doc.autoTable({
          startY: 180,
          head: [["Nombre del producto", "Cantidad", "Precio"]],
          body: productsInList,
          theme: "grid",
          headStyles: {
            fillColor: "#c40467",
            textColor: "#ffffff",
            fontSize: 12,
          },
          styles: {
            cellPadding: 5,
            fontSize: 10,
            lineWidth: 0.1,
            lineColor: "#FFFFFF",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
        });

        const finalY = doc.autoTable.previous.finalY;

        doc.text(`Total a pagar: $${totalToPay}`, 410, finalY + 30, { align: "right" });
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        // Clean cart
        localStorage.removeItem("cart");

        window.open(pdfUrl, "_blank");
      } catch (error) {
        Swal.showValidationMessage(`Error al generar la factura: ${error.message}`);
        return false;
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      location.href = "index.html";
    }
  });

}

// #endregion

const imageSection = (product) => {
  const imgSection = document.createElement("div");
  imgSection.classList.add("img-section-card");

  const image = document.createElement("img");
  image.src = product.image;
  image.classList.add("item-img");

  imgSection.appendChild(image);
  return imgSection;
}

const infoSection = (product) => {
  const section = document.createElement("div");
  section.classList.add("info-section-card");

  const title = document.createElement("h3");
  title.textContent = product.name;

  const description = document.createElement("p");
  description.textContent = product.description;

  const categoryBadge = document.createElement("span");
  categoryBadge.style.backgroundColor = brandStyles[product.category].backgroundColor;
  categoryBadge.style.color = brandStyles[product.category].textColor;
  categoryBadge.style.maxWidth = `${product.category.length * 12}px`
  categoryBadge.classList.add("badget");
  categoryBadge.textContent = product.category;

  const actionButtons = document.createElement("div");
  actionButtons.classList.add("action-section");

  const inputContainer = document.createElement("div");
  inputContainer.classList.add("amount-input");

  const decreaseButton = document.createElement("button");
  decreaseButton.textContent = "-";
  decreaseButton.id = `decrease-${product.id}`;
  decreaseButton.onclick = () => decreaseProducts(product.id);
  if (!product?.quantity || product.quantity < 2) {
    decreaseButton.disabled = false;
    decreaseButton.classList.add("disabled-button");
  }

  const increaseButton = document.createElement("button");
  increaseButton.textContent = "+";
  increaseButton.id = `increase-${product.id}`;
  increaseButton.onclick = () => increaseProducts(product.id);

  const amountInput = document.createElement("input");
  amountInput.type = "text";
  amountInput.value = product.quantity ?? 1;
  amountInput.id = `amount-input-${product.id}`;

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.onclick = () => removeProduct(product.id);
  deleteButton.appendChild(deleteSVG());

  // Complete input container
  inputContainer.appendChild(decreaseButton);
  inputContainer.appendChild(amountInput);
  inputContainer.appendChild(increaseButton);

  actionButtons.appendChild(inputContainer);
  actionButtons.appendChild(deleteButton);

  section.appendChild(title);
  section.appendChild(description);
  section.appendChild(categoryBadge);
  section.appendChild(actionButtons);
  return section;

}

const priceSection = (product) => {
  const section = document.createElement("div");
  section.classList.add("price-section-card");

  const h4 = document.createElement("h4");
  h4.textContent = "Precio";

  const h3 = document.createElement("h3");
  h3.textContent = `$${product.price.toFixed(2)}`;

  section.appendChild(h4);
  section.appendChild(h3);

  return section;
}

const deleteSVG = () => {
  const svgNamespace = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", "0 0 24 24");

  const path = document.createElementNS(svgNamespace, "path");
  path.setAttribute(
    "d",
    "M20.37,8.91L19.37,10.64L7.24,3.64L8.24,1.91L11.28,3.66L12.64,3.29L16.97,5.79L17.34,7.16L20.37,8.91M6,19V7H11.07L18,11V19A2,2 0 0,1 16,21H8A2,2 0 0,1 6,19Z"
  );

  svg.appendChild(path);

  return svg;

}

const loadProductsInCart = () => {
  const productsInCart = JSON.parse(localStorage.getItem("cart"));
  const cartList = document.getElementById("container-list");
  cartList.innerHTML = "";
  totalToPay = productsInCart.reduce((accumulator, value) => {
    return accumulator + parseFloat(value.price * value.quantity);
  }, 0).toFixed(2);
  const totalAmount = productsInCart.reduce((accumulator, value) => {
    if (value?.quantity) {
      return accumulator + value.quantity;
    }
    return accumulator + 1;
  }, 0)
  // Set totals
  document.getElementById("total-to-pay").textContent = `$${totalToPay}`;
  document.getElementById("total-amount").textContent = totalAmount;
  // Component design
  productsInCart.forEach((product, index) => {
    const itemCard = document.createElement("div");
    itemCard.classList.add("item-card");

    /**
     * Card sections
     */
    const imageSec = imageSection(product);
    const infoSec = infoSection(product, index);
    const priceSec = priceSection(product);

    itemCard.appendChild(imageSec);
    itemCard.appendChild(infoSec);
    itemCard.appendChild(priceSec);

    cartList.appendChild(itemCard);
  });
}

/**
 * Events
 */
// Check and pass from details to pay
document.getElementById("details-form").addEventListener("submit", (e) => {
  e.preventDefault();

  moveToPayment();
});

// Payment action
document.getElementById("payment-form").addEventListener("submit", (e) => {
  e.preventDefault();
  pay();
});

// Load municipalities
document.getElementById("departamento").addEventListener("change", () => {
  document.getElementById("municipio").innerHTML = "";
  const id = document.getElementById("departamento").value;
  const municipalities = departmentsData.find((department) => department.id == id).municipios;

  municipalities.forEach((municipality) => {
    const option = document.createElement("option");
    option.value = municipality.id_mun;
    option.textContent = municipality.nombre;
    document.getElementById("municipio").appendChild(option);
  });
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {

  loadProductsInCart();
  // Load departaments and municipalities
  fetch("https://api.npoint.io/253f0ee259ef1620a547/departamentos")
    .then((data) => data.json())
    .then((data) => {
      departmentsData = data;

      const option = document.createElement("option");
      option.selected = true;
      option.disabled = true;
      option.textContent = "Selecciona un departamento";
      document.getElementById("departamento").appendChild(option);

      data.forEach((department) => {
        const option = document.createElement("option");
        option.value = department.id;
        option.textContent = department.nombre;
        document.getElementById("departamento").appendChild(option);
      });

    });
});


window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop > 300) {
    summaryCart.classList.add("summary-card-scroll");
  } else {
    summaryCart.classList.remove("summary-card-scroll");
  }
});

/**
 * Masks
 */

IMask(document.getElementById("telefono"), { mask: "0000-0000" });