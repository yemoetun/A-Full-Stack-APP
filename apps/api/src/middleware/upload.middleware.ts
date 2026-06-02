import multer from "multer";
import { FILE_LIMITS } from "@projectflow/config";
import { Errors } from "../utils/errors";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_LIMITS.maxSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (FILE_LIMITS.allowedMimeTypes.includes(file.mimetype as never)) {
      cb(null, true);
    } else {
      cb(Errors.badRequest(`File type ${file.mimetype} is not allowed`) as unknown as null, false);
    }
  },
});
