import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createContent,
  deleteContent,
  getAllContent,
  getContentById,
  updateContent,
} from '../utils/contentFirestore.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const MIME_BY_TYPE = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav'],
};

function inferContentType(mimetype) {
  if (!mimetype) return null;
  if (MIME_BY_TYPE.pdf.includes(mimetype)) return 'pdf';
  if (MIME_BY_TYPE.image.includes(mimetype)) return 'image';
  if (MIME_BY_TYPE.audio.includes(mimetype)) return 'audio';
  return null;
}

function cloudinaryResourceType(contentType) {
  if (contentType === 'image') return 'image';
  return 'raw';
}

function uploadBufferToCloudinary({ buffer, fileName, resourceType, folder }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        use_filename: true,
        unique_filename: true,
        filename_override: fileName,
      },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export const listContent = asyncHandler(async (req, res) => {
  const content = await getAllContent();
  res.json({ ok: true, content });
});

export const getContentDetails = asyncHandler(async (req, res) => {
  const item = await getContentById(req.params.id);
  res.json({ ok: true, content: item });
});

export const addContent = asyncHandler(async (req, res) => {
  const item = await createContent(req.body, { createdByUid: req.user?.uid });
  res.status(201).json({ ok: true, content: item });
});

export const editContent = asyncHandler(async (req, res) => {
  const item = await updateContent(req.params.id, req.body);
  res.json({ ok: true, content: item });
});

export const removeContent = asyncHandler(async (req, res) => {
  await deleteContent(req.params.id);
  res.json({ ok: true });
});

export const uploadContentFile = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    return res.status(500).json({
      ok: false,
      error: {
        message: 'Cloudinary is not configured on backend.',
        status: 500,
      },
    });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'File is required.',
        status: 400,
      },
    });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'File exceeds 20MB limit.',
        status: 400,
      },
    });
  }

  const contentType = inferContentType(file.mimetype);
  if (!contentType) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Unsupported file type. Use PDF, image, or audio.',
        status: 400,
      },
    });
  }

  const uploaded = await uploadBufferToCloudinary({
    buffer: file.buffer,
    fileName: file.originalname,
    resourceType: cloudinaryResourceType(contentType),
    folder: 'cpp-learning/content',
  });

  res.status(201).json({
    ok: true,
    file: {
      type: contentType,
      url: uploaded.secure_url,
      bytes: file.size,
      mime: file.mimetype,
      originalName: file.originalname,
    },
  });
});
