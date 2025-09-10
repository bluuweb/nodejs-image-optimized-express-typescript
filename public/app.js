// Configuración y elementos del DOM
const config = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  quality: 80,
};

const elements = {
  dropZone: document.getElementById("dropZone"),
  fileInput: document.getElementById("fileInput"),
  selectFileBtn: document.getElementById("selectFileBtn"),
  previewArea: document.getElementById("previewArea"),
  progressArea: document.getElementById("progressArea"),
  resultArea: document.getElementById("resultArea"),
  imagePreview: document.getElementById("imagePreview"),
  fileName: document.getElementById("fileName"),
  fileSize: document.getElementById("fileSize"),
  fileType: document.getElementById("fileType"),
  qualityRange: document.getElementById("qualityRange"),
  qualityValue: document.getElementById("qualityValue"),
  optimizeBtn: document.getElementById("optimizeBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  progressBar: document.getElementById("progressBar"),
  downloadBtn: document.getElementById("downloadBtn"),
  newImageBtn: document.getElementById("newImageBtn"),
  originalSize: document.getElementById("originalSize"),
  optimizedSize: document.getElementById("optimizedSize"),
  reduction: document.getElementById("reduction"),
};

let currentFile = null;

// Inicialización
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  setupDragAndDrop();
});

// Event listeners
function initializeEventListeners() {
  // Botón para seleccionar archivo
  elements.selectFileBtn.addEventListener("click", () => {
    elements.fileInput.click();
  });

  // Input file change
  elements.fileInput.addEventListener("change", handleFileSelect);

  // Control de calidad
  elements.qualityRange.addEventListener("input", (e) => {
    elements.qualityValue.textContent = e.target.value;
    config.quality = parseInt(e.target.value);
  });

  // Botones de acción
  elements.optimizeBtn.addEventListener("click", optimizeImage);
  elements.cancelBtn.addEventListener("click", resetInterface);
  elements.newImageBtn.addEventListener("click", resetInterface);

  // Click en la zona de drop
  elements.dropZone.addEventListener("click", (e) => {
    if (
      e.target === elements.dropZone ||
      e.target.closest(".drop-zone-content")
    ) {
      elements.fileInput.click();
    }
  });
}

// Configuración de drag and drop
function setupDragAndDrop() {
  // Prevenir comportamientos por defecto
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Efectos visuales para drag
  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, handleDragEnter, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, handleDragLeave, false);
  });

  // Manejar drop
  elements.dropZone.addEventListener("drop", handleDrop, false);
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDragEnter() {
  elements.dropZone.classList.add("drag-over");
}

function handleDragLeave(e) {
  // Solo remover la clase si realmente salimos del elemento
  if (!elements.dropZone.contains(e.relatedTarget)) {
    elements.dropZone.classList.remove("drag-over");
  }
}

function handleDrop(e) {
  elements.dropZone.classList.remove("drag-over");
  const files = e.dataTransfer.files;

  if (files.length > 0) {
    handleFile(files[0]);
  }
}

// Manejo de archivos
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
}

function handleFile(file) {
  // Validar archivo
  const validation = validateFile(file);
  if (!validation.valid) {
    showError(validation.message);
    return;
  }

  currentFile = file;
  showPreview(file);
}

function validateFile(file) {
  // Verificar tipo
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message:
        "Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y WebP.",
    };
  }

  // Verificar tamaño
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      message: `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(
        config.maxFileSize
      )}`,
    };
  }

  return { valid: true };
}

// Previsualización
function showPreview(file) {
  // Mostrar información del archivo
  elements.fileName.textContent = file.name;
  elements.fileSize.textContent = formatFileSize(file.size);
  elements.fileType.textContent = file.type;

  // Crear URL para previsualización
  const reader = new FileReader();
  reader.onload = function (e) {
    elements.imagePreview.src = e.target.result;
    elements.imagePreview.onload = function () {
      // Mostrar área de previsualización con animación
      elements.previewArea.classList.remove("d-none");
      elements.previewArea.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    };
  };
  reader.readAsDataURL(file);
}

// Optimización de imagen
async function optimizeImage() {
  if (!currentFile) {
    showError("No hay archivo seleccionado");
    return;
  }

  try {
    // Mostrar progreso
    showProgress();

    // Crear FormData
    const formData = new FormData();
    formData.append("image", currentFile);
    formData.append("quality", config.quality);

    // Simular progreso
    simulateProgress();

    // Enviar petición
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    // Verificar si la respuesta es JSON o blob
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      // Si es JSON, hay un error
      const result = await response.json();
      throw new Error(result.error || "Error desconocido");
    } else {
      // Si es blob, es la imagen optimizada
      const blob = await response.blob();
      const optimizedSize = blob.size;

      // Crear URL para descarga
      const downloadUrl = URL.createObjectURL(blob);

      // Mostrar resultado
      showResult(
        currentFile.size,
        optimizedSize,
        downloadUrl,
        currentFile.name
      );
    }
  } catch (error) {
    console.error("Error:", error);
    hideProgress();
    showError(`Error al optimizar la imagen: ${error.message}`);
  }
}

// Manejo de progreso
function showProgress() {
  elements.previewArea.classList.add("d-none");
  elements.progressArea.classList.remove("d-none");
  elements.progressBar.style.width = "0%";
}

function simulateProgress() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 90) progress = 90;

    elements.progressBar.style.width = progress + "%";

    if (progress >= 90) {
      clearInterval(interval);
    }
  }, 200);
}

function hideProgress() {
  elements.progressArea.classList.add("d-none");
}

// Mostrar resultado
function showResult(originalSize, optimizedSize, downloadUrl, fileName) {
  hideProgress();

  const reduction = Math.round((1 - optimizedSize / originalSize) * 100);

  elements.originalSize.textContent = formatFileSize(originalSize);
  elements.optimizedSize.textContent = formatFileSize(optimizedSize);
  elements.reduction.textContent = `${reduction}%`;

  // Configurar botón de descarga
  const optimizedFileName =
    fileName.replace(/\.[^/.]+$/, "") +
    "_optimized" +
    getFileExtension(fileName);
  elements.downloadBtn.href = downloadUrl;
  elements.downloadBtn.download = optimizedFileName;

  // Mostrar área de resultado
  elements.resultArea.classList.remove("d-none");
  elements.resultArea.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Completar barra de progreso
  elements.progressBar.style.width = "100%";

  // Limpiar la URL después de un tiempo para liberar memoria
  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 300000); // 5 minutos
}

// Reset de la interfaz
function resetInterface() {
  currentFile = null;
  elements.fileInput.value = "";
  elements.qualityRange.value = 80;
  elements.qualityValue.textContent = "80";
  config.quality = 80;

  // Ocultar todas las áreas
  elements.previewArea.classList.add("d-none");
  elements.progressArea.classList.add("d-none");
  elements.resultArea.classList.add("d-none");

  // Scroll al inicio
  elements.dropZone.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Utilidades
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

function showError(message) {
  // Crear o actualizar alerta de error
  let existingAlert = document.querySelector(".alert-danger");

  if (existingAlert) {
    existingAlert.remove();
  }

  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-danger alert-dismissible fade show mt-3";
  alertDiv.innerHTML = `
    <i class="fas fa-exclamation-circle me-2"></i>
    <strong>Error:</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  // Insertar después del área de upload
  const uploadContainer = document.querySelector(".upload-container");
  uploadContainer.insertAdjacentElement("afterend", alertDiv);

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    if (alertDiv && alertDiv.parentNode) {
      alertDiv.classList.remove("show");
      setTimeout(() => alertDiv.remove(), 300);
    }
  }, 5000);

  // Scroll al error
  alertDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Mejoras en la experiencia de usuario
document.addEventListener("paste", function (e) {
  const items = e.clipboardData.items;

  for (let item of items) {
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        handleFile(file);
        e.preventDefault();
      }
    }
  }
});

// Atajos de teclado
document.addEventListener("keydown", function (e) {
  // Escape para cancelar/reset
  if (e.key === "Escape") {
    if (
      !elements.previewArea.classList.contains("d-none") ||
      !elements.resultArea.classList.contains("d-none")
    ) {
      resetInterface();
    }
  }

  // Enter para optimizar (si hay imagen)
  if (
    e.key === "Enter" &&
    currentFile &&
    !elements.previewArea.classList.contains("d-none")
  ) {
    e.preventDefault();
    optimizeImage();
  }
});

// Prevenir navegación accidental
window.addEventListener("beforeunload", function (e) {
  if (currentFile && !elements.resultArea.classList.contains("d-none")) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// Debug para desarrollo
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  console.log("🚀 Image Optimizer App iniciada");
  console.log("📁 Configuración:", config);

  // Agregar algunos métodos globales para debug
  window.debugImageOptimizer = {
    config,
    elements,
    currentFile: () => currentFile,
    resetInterface,
    showError,
  };
}
