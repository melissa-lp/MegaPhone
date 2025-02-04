//alert.js
const showAlert = (message, icon) => {
  Swal.fire({
    title: message,
    icon: icon,
    position: "top-end",
    timer: 3500,
    timerProgressBar: true,
    toast: true,
    showConfirmButton: false,
  });
}