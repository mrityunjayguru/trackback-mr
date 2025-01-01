import { NextFunction, Request, Response } from "express";
import { uploadFile } from "../helper/awsS3"; 

const UploadtoCloud = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const foldername: string | "TRPRO" = req.headers.ProjectName as string; 
  const { file, files } = req;
  let nfiles: any = files;
  try {
    if (file) {
      const filename = file.originalname;
      const currdate = new Date();
      const newfilename = `${currdate.getDate()}${currdate.getTime()}${currdate.getSeconds()}_${filename}`;

      const fileObject = {
        file: file,
        filename: foldername ? `${foldername}/${newfilename}` : newfilename, // Handle undefined foldername
      };

      // Upload the file
      const result = await uploadFile(fileObject);
      req.body[file.fieldname] = result;
    } else if (nfiles) {
      // Handle multiple files
      const filedata = Array.isArray(files) ? files : Object.keys(nfiles);
      let filename: any;
      for (filename of filedata) {
        const arrayImagePath: string[] = []; // Typed as an array of strings

        for (const singleFile of nfiles[filename]) {
          const currdate = new Date();
          const newfilename = `${currdate.getDate()}${currdate.getTime()}${currdate.getSeconds()}_${
            singleFile.originalname
          }`;
 
          const fileObject: { file: Express.Multer.File; filename: string } = {
            file: singleFile,
            filename: foldername ? `${foldername}/${newfilename}` : newfilename, // Handle undefined foldername
          };

          // Upload the file
          const result: any = await uploadFile(fileObject);
          arrayImagePath.push(result); // Store the URL from the result
        }
        req.body[filename] =
          arrayImagePath.length <= 1 ? arrayImagePath[0] : arrayImagePath;
      }
    }

    // Proceed to the next middleware
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error writing files to cloud storage" });
  }
};

export default UploadtoCloud;
