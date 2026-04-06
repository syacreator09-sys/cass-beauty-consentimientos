/**
 * cloudinary.js — Upload de PDF a Cloudinary
 * Usa unsigned upload preset (sin exponer API secret en cliente)
 *
 * SETUP REQUERIDO (1 sola vez):
 * 1. Entra a cloudinary.com → Settings → Upload Presets
 * 2. Click "Add upload preset"
 * 3. Signing mode: "Unsigned"
 * 4. Folder: "cass-beauty/consentimientos"
 * 5. Allowed formats: pdf, png
 * 6. Copia el nombre del preset y ponlo en UPLOAD_PRESET abajo
 */

const CLOUDINARY_CONFIG = {
  cloudName: 'dxohyqmji',
  uploadPreset: 'cass_beauty_consent', // ← Cambiar por tu preset real
  folder: 'cass-beauty/consentimientos'
};

async function subirPDFACloudinary(pdfBlob, nombreArchivo, procedimiento) {
  const fecha = new Date();
  const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  const carpeta = `${CLOUDINARY_CONFIG.folder}/${procedimiento}/${mesAno}`;

  const formData = new FormData();
  formData.append('file', pdfBlob, `${nombreArchivo}.pdf`);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', carpeta);
  formData.append('resource_type', 'raw');
  formData.append('public_id', nombreArchivo);
  formData.append('tags', `consentimiento,${procedimiento},cass-beauty,${mesAno}`);
  formData.append('context', `procedimiento=${procedimiento}|fecha=${fecha.toISOString()}`);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`;

  const respuesta = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(`Cloudinary error: ${error.error?.message || respuesta.statusText}`);
  }

  const resultado = await respuesta.json();
  return {
    url: resultado.secure_url,
    publicId: resultado.public_id,
    carpeta: resultado.folder,
    bytes: resultado.bytes,
    formato: resultado.format
  };
}

function nombreArchivoSeguro(nombre, folio) {
  // Sanitizar nombre para usar como nombre de archivo
  const nombreLimpio = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 40);

  return `${nombreLimpio}-${folio}`;
}
