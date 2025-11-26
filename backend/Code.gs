// ================================
// PhotoVault Backend (Google Apps Script)
// ================================

// โฟลเดอร์เก็บรูปภาพใน Google Drive (แก้ ID ตามของคุณ)
const IMAGE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID";

// รหัสผ่าน Admin
const ADMIN_PASSWORD = "admin123";

// ดึงไฟล์จาก Drive Folder
function getPhotos() {
  const folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
  const files = folder.getFiles();
  let photos = [];
  while(files.hasNext()) {
    const file = files.next();
    photos.push({
      name: file.getName(),
      url: "https://drive.google.com/uc?export=view&id=" + file.getId(),
      id: file.getId()
    });
  }
  return photos;
}

// โหลดอัลบั้ม (เก็บใน PropertiesService)
function getAlbums() {
  const props = PropertiesService.getScriptProperties();
  const albums = props.getProperty('albums');
  return albums ? JSON.parse(albums) : {};
}

// บันทึกอัลบั้ม
function saveAlbums(albums) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('albums', JSON.stringify(albums));
}

// ตรวจสอบ admin
function checkAdmin(password) {
  return password === ADMIN_PASSWORD;
}

// ================================
// Web App Entry Point
// ================================
function doGet(e) {
  const action = e.parameter.action;

  if(action === "getPhotos") {
    const photos = getPhotos();
    return ContentService.createTextOutput(JSON.stringify({status: "success", photos}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if(action === "getAlbums") {
    const albums = getAlbums();
    return ContentService.createTextOutput(JSON.stringify({status: "success", albums}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Invalid action"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  const password = e.parameter.password;

  if(!checkAdmin(password)) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Unauthorized"}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if(action === "upload") {
    const blob = e.postData.getBlob();
    const folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
    const file = folder.createFile(blob);
    return ContentService.createTextOutput(JSON.stringify({status: "success", fileId: file.getId()}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if(action === "delete") {
    const fileId = e.parameter.fileId;
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
      return ContentService.createTextOutput(JSON.stringify({status: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.message}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  if(action === "album") {
    let albums = getAlbums();
    const albumName = e.parameter.albumName;
    const type = e.parameter.type; // create/delete/addPhoto/removePhoto
    const photo = e.parameter.photo ? JSON.parse(e.parameter.photo) : null;
    const index = e.parameter.index ? parseInt(e.parameter.index) : null;

    if(type === "create") {
      if(!albums[albumName]) albums[albumName] = [];
    } else if(type === "delete") {
      delete albums[albumName];
    } else if(type === "addPhoto") {
      if(photo && albums[albumName]) albums[albumName].push(photo);
    } else if(type === "removePhoto") {
      if(albums[albumName] && index != null) albums[albumName].splice(index,1);
    }

    saveAlbums(albums);
    return ContentService.createTextOutput(JSON.stringify({status: "success", albums}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Invalid action"}))
    .setMimeType(ContentService.MimeType.JSON);
}

