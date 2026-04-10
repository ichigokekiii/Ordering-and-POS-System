export const MAX_ADMIN_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_ADMIN_IMAGE_SIZE_LABEL = "2MB";
export const ALLOWED_ADMIN_IMAGE_TYPES = ["image/jpeg", "image/png"];
export const ALLOWED_ADMIN_IMAGE_NAME_REGEX = /\.(jpe?g|png)$/i;
export const ADMIN_IMAGE_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";

export const getFirstValidationErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.status === 422) {
    const serverErrors = error.response.data?.errors;

    if (serverErrors) {
      const firstKey = Object.keys(serverErrors)[0];
      if (firstKey && serverErrors[firstKey]?.[0]) {
        return serverErrors[firstKey][0];
      }
    }
  }

  return error?.response?.data?.error || error?.response?.data?.message || fallbackMessage;
};

export const validateAdminImageFile = (file) => {
  if (!(file instanceof File) || file.size === 0) {
    return "";
  }

  const hasValidMimeType = !file.type || ALLOWED_ADMIN_IMAGE_TYPES.includes(file.type);
  const hasValidExtension = ALLOWED_ADMIN_IMAGE_NAME_REGEX.test(file.name || "");

  if (!hasValidMimeType || !hasValidExtension) {
    return "Only JPG, JPEG, and PNG files are allowed.";
  }

  return "";
};

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be loaded."));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

const buildOptimizedImageName = (originalName, mimeType) => {
  const baseName = (originalName || "admin-image").replace(/\.[^.]+$/, "");
  const extension = mimeType === "image/png" ? ".png" : ".jpg";

  return `${baseName}-optimized${extension}`;
};

export const optimizeAdminImageForUpload = async (file) => {
  if (!(file instanceof File) || file.size === 0 || file.size <= MAX_ADMIN_IMAGE_SIZE_BYTES) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

  let scale = 1;
  let quality = mimeType === "image/jpeg" ? 0.9 : undefined;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, mimeType, quality);

    if (blob && blob.size <= MAX_ADMIN_IMAGE_SIZE_BYTES) {
      return new File([blob], buildOptimizedImageName(file.name, mimeType), {
        type: mimeType,
        lastModified: Date.now(),
      });
    }

    if (mimeType === "image/jpeg" && typeof quality === "number" && quality > 0.45) {
      quality = Number((quality - 0.12).toFixed(2));
    } else {
      scale *= 0.82;
    }
  }

  return null;
};

export const prepareAdminImageForUpload = async (file) => {
  if (!(file instanceof File) || file.size === 0) {
    return { file: null, error: "" };
  }

  const validationError = validateAdminImageFile(file);
  if (validationError) {
    return { file: null, error: validationError };
  }

  const optimizedImage = await optimizeAdminImageForUpload(file);
  if (!optimizedImage) {
    return {
      file: null,
      error: `Image must be ${MAX_ADMIN_IMAGE_SIZE_LABEL} or smaller. Try a smaller image.`,
    };
  }

  if (optimizedImage.size > MAX_ADMIN_IMAGE_SIZE_BYTES) {
    return {
      file: null,
      error: `Image must be ${MAX_ADMIN_IMAGE_SIZE_LABEL} or smaller.`,
    };
  }

  return { file: optimizedImage, error: "" };
};
