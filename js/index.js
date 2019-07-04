/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
const app = new Vue({
    el:'#app',
    data:{
        status:false
    },
    methods:{
        init:function() {

            this.status = true;

            document.querySelector("#takeVideo").addEventListener("touchend", function() {
               
                console.log("Take video");

                var srcType = Camera.PictureSourceType.CAMERA;
                var options = setOptions(srcType);
                var func = createNewFileEntry;
            
                navigator.camera.getPicture(function cameraSuccess(imageUri) {
            
                    displayImage(imageUri);
                    // You may choose to copy the picture, save it somewhere, or upload.
                   // func(imageUri);
            
                }, function cameraError(error) {
                    console.debug("Unable to obtain picture: " + error, "app");
            
                }, options);

            }, false);


            document.querySelector("#takeVideo").addEventListener("click", function() {
                console.log("Take video");

                var srcType = Camera.PictureSourceType.CAMERA;
                var options = setOptions(srcType);
                var func = createNewFileEntry;
            
                navigator.camera.getPicture(function cameraSuccess(imageUri) {
            
                    displayImage(imageUri);
                    // You may choose to copy the picture, save it somewhere, or upload.
                    func(imageUri);
            
                }, function cameraError(error) {
                    console.debug("Unable to obtain picture: " + error, "app");
            
                }, options);

            }, false);

        }
    }
})

function displayImage(imgUri) {

    var elem = document.getElementById('imageFile');
    elem.src = imgUri;
}

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}

function captureError(e) {
	console.log("capture error: "+JSON.stringify(e));
}

function captureSuccess(s) {
	console.log("Success");
	console.dir(s[0]);
	var v = "<video controls='controls'>";
	v += "<source src='" + s[0].fullPath + "' type='video/mp4'>";
	v += "</video>";
	document.querySelector("#videoArea").innerHTML = v;
}

function createNewFileEntry(imgUri) {
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {

            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            console.log("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

    }, onErrorResolveUrl);
}

document.addEventListener('deviceready', app.init);
