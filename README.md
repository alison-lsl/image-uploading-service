# image-uploading-service
A service to upload images built in NodeJs

Listed below are the APIs and their feature descriptions:

|Features | APIs |
|---------|------|
| Uploads a single image of all extensions | POST /upload-image 
| Search history for all images that have ever been uploaded | GET /show-history
| Search URL links to images by their names | GET /search-image-url
| Download a single image or zip image folder | GET /get-image
| Resets the image directory database table | DELETE /reset-history

## Environment Setup
1. This project uses NPM v8.3.0 and Node v17.3.1
2. Clone the repository with `git clone https://github.com/alison-lsl/image-uploading-service.git`
3. Install the packages with `npm install`

## Folder Structure

| Folders/Files | Description |
|--- | --- |
| middleware | Contains `functions.js` of helper functions
| uploads | Static folder for the express app and multer to save and access uploaded images
| models | Contains `database.js` to interact with the SQLite database table in `table.db`
| app.js | Main project file triggered upon `npm start`. Contains all the API routes

## Testing the APIs
Run the server with `npm start` and use Postman to test the APIs. You may test the APIs as shown below:

1. POST /upload-image
  - The multipart/form-data request accepts a `size_limit` Text field to set the maximum image size upload in bytes and `file` File field for the images.
  - `size_limit` must be between 105400 (100 KB) and 305400 (300 KB)
  - `file` only accepts image regardless of its extension. The default size limit is 100 KB.
  - Uploaded images will be stored in `uploads` folder and the `ImageDirectory` table. 
  - Omitting either `size_limit` or `file` would return error messages.
  - Setting `size_limit` outside its threshold or uploading an image larger than 100 KB will return error messages.
  - Limitations: `size_limit` could not change the default size limit.

  <img width="1014" alt="Screenshot 2022-02-03 at 3 03 47 PM" src="https://user-images.githubusercontent.com/86767979/152296471-1f462fcd-654f-42ae-b58b-9a7a9d775a4d.png">
  <img width="1012" alt="Screenshot 2022-02-03 at 3 22 47 PM" src="https://user-images.githubusercontent.com/86767979/152298756-2ebf0dc3-b5f9-4989-bb99-229bc866c119.png">

2. GET /show-history
  - The request is an empty body.
  - If there were image(s) uploaded prior to calling this request, an array of the image details will be returned.
  - Otherwise, it will return an empty array.

  <img width="1010" alt="Shows a history of uploaded image details" src="https://user-images.githubusercontent.com/86767979/152296754-4d800d5b-fde6-4529-b1ae-6c85f0c955cb.png">


3. GET /search-image-url
  - `image_name` takes an image keyword to search the database of uploaded images.
  - If the image record(s) exist(s), the `uploads` folder will be searched to retrieve the static image URLs, and returned.
  - Otherwise, no URLs will be returned.

  <img width="1007" alt="Retrieve URLs to uploaded static images" src="https://user-images.githubusercontent.com/86767979/152297034-0d8f9195-b001-4d42-a639-a13f9879a7d2.png">

4. GET /get-image
  - This multipart/form-data request accepts an `id` Text field. It accepts an array of objects with `id` key-value pairs. The `id` represents the unique identifier for each image record in the `ImageDirectory` table.
  - Passing a single `id` pair will return one image for download. Click on Postman's `Send and Download` to download the image to your local device.
  - Passing multiple `id` pairs will return a zip folder of images for download. Click on Postman's `Send and Download` to download the zip folder to your local device.
  - If the `id` doesn't exist in the table, no image for that record will be returned.
  - Limitations: Single image download requires the image exists in the `uploads` folder.
  - Limitations: Multiple image download takes the image data stored in the `ImageDirectory` table.

  <img width="1009" alt="" src="https://user-images.githubusercontent.com/86767979/152298272-f34bb17f-3a9d-4ea4-a8b8-2a5ae8ecde41.png">
  <img width="1000" alt="Download multiple images as a zip folder" src="https://user-images.githubusercontent.com/86767979/152297415-65736df2-334f-4978-946b-c02626eeb215.png">


5. DELETE /reset-history
  - The request is an empty body.
  - This API deletes all records in the `ImageDirectory` and resets the `id`'s AUTOINCREMENT property.
  <img width="1006" alt="Delete all records in the ImageDirectory table" src="https://user-images.githubusercontent.com/86767979/152297092-ae7433b1-6962-4bd4-ae0a-103d985c1091.png">

