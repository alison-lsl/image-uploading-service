# image-uploading-service
A service to upload images built in NodeJs

Listed below are the APIs and their feature descriptions:

|Features | APIs |
|---------|------|
| Uploads a single image of all extensions | POST /upload-image 
| Search history for all images that have ever been uploaded | GET /show-history
| Search URL links to images by their names | GET /search-image-url?image_name=abc
| Download a single image or zip image folder | GET /get-image
| Resets the image directory database table | DELETE /reset-history

## Setting up the environment
1. This project uses NPM v8.3.0 and Node v17.3.1
2. Clone the repository with `git clone `
