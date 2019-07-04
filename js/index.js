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

function modelLoaded() {
    console.log('Model loaded!');
}
// Predict the current frame.
function predict() {
    classifier.predict(gotResults);
}



// Show the results
function gotResults(err, results) {
    // Display any error
    if (err) {
        console.error(err);
    }
    if (results && results[0]) {
        result.innerText = results[0].label;
        confidence.innerText = results[0].confidence;
        classifier.classify(gotResults);
        console.log(results[0].label);
    }
}

const app = new Vue({
    el:'#app',
    data:{
        status:false,
        classifier: null,
        featureExtractor: null
    },
    methods:{
        init:function() {

            this.status = true;
            this.addButtonListeners();
       
        },
                    
        addButtonListeners:function() {

          // video start
          //document.querySelector("#start-video").addEventListener("click", this.startVideo, false);
          document.querySelector("#start-video").addEventListener("touchend", this.startVideo, false);
          document.querySelector('#addone').addEventListener("click", this.addOne, false);
          document.querySelector('#train').addEventListener("click", this.train, false);
          document.querySelector('#predict').addEventListener("click", this.predict, false);

        },
        
        startVideo:function() {
                    
          console.log("Starting video capture");

          var srcType = Camera.PictureSourceType.CAMERA;
          var options = this.setVideoOptions(srcType);            
          navigator.camera.getPicture(this.onVideoSuccess, this.onVideoError, options);
          this.startClassifier();

        },
        setVideoOptions:function(srcType) {

          let options = {
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

        },

        onVideoSuccess:function(imageUri) {
            console.log("Video capture sucess");
            console.log("imageUri" + imageUri);
            this.displayImage(imageUri);
        },
        onVideoError:function() {
          console.log("Unable to obtain picture: " + error, "app");
        },
        displayImage:function(imgUri) {

          console.log("Display Image");
          let elem = document.getElementById('image');
          elem.src = imgUri;

          /*
          var canvas = document.getElementById("canvas");
          var ctx = canvas.getContext("2d");

          var image = new Image();
          image.onload = function() {
            ctx.drawImage(image, 0, 0);
          };
          i//mage.src = "data:image/jpg;base64,"+imgUri;
          image.src = imgUri;

          */

          /*
          this.classifier.addImage(image, 'one', function() {
            console.log("all done");
          });

          */

        },

        startClassifier:function() {

          this.featureExtractor = ml5.featureExtractor('MobileNet', modelLoaded);

          let video = document.getElementById('canvas');

         // let videosContainers = document.getElementsByClassName("cordova-camera-capture");

          this.classifier = this.featureExtractor.classification();

          //document.querySelector('#addone').addEventListener("click", this.addOne);


        },
        videoReady:function() {
          console.log("video ready");
        },

        train:function() {
          this.classifier.train(function(lossValue) {
            if (lossValue) {
              console.log('Loss: ' + totalLoss);
            } else {
              console.log('Done Training! Final Loss: ' + totalLoss);
            }
          });
        },
        predict:function() {
          this.classifier.classify(this.gotResults);
        },

        gotResults:function(err, results) {
          // Display any error
          if (err) {
            console.error(err);
          }
          if (results && results[0]) {
            console.log(results[0].label);
          //  confidence.innerText = results[0].confidence;
          this.classifier.classify(gotResults);
          }
        },

        addOne:function() {
          this.classifier.addImage('one');

        }
    }
})




/*
//----------- ML stuff
// Grab all the DOM elements
var video = document.getElementById('video');
var videoStatus = document.getElementById('videoStatus');
var loading = document.getElementById('loading');
var catButton = document.getElementById('catButton');
var dogButton = document.getElementById('dogButton');
var amountOfCatImages = document.getElementById('amountOfCatImages');
var amountOfDogImages = document.getElementById('amountOfDogImages');
var train = document.getElementById('train');
var loss = document.getElementById('loss');
var result = document.getElementById('result');
var confidence = document.getElementById('confidence');
var predict = document.getElementById('predict');

// A variable to store the total loss
let totalLoss = 0;

// Create a webcam capture
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })

// A function to be called when the model has been loaded
function modelLoaded() {
  loading.innerText = 'Model loaded!';
}



// Predict the current frame.
function predict() {
  classifier.predict(gotResults);
}

// A function to be called when the video is finished loading
function videoReady() {
  videoStatus.innerText = 'Video ready!';
}

// When the Cat button is pressed, add the current frame
// from the video with a label of cat to the classifier
catButton.onclick = function () {
  classifier.addImage('cat');
  amountOfCatImages.innerText = Number(amountOfCatImages.innerText) + 1;
}

// When the Cat button is pressed, add the current frame
// from the video with a label of cat to the classifier
dogButton.onclick = function () {
  classifier.addImage('dog');
  amountOfDogImages.innerText = Number(amountOfDogImages.innerText) + 1;
}

// When the train button is pressed, train the classifier
// With all the given cat and dog images
train.onclick = function () {
  classifier.train(function(lossValue) {
    if (lossValue) {
      totalLoss = lossValue;
      loss.innerHTML = 'Loss: ' + totalLoss;
    } else {
      loss.innerHTML = 'Done Training! Final Loss: ' + totalLoss;
    }
  });
}

// Show the results
function gotResults(err, results) {
  // Display any error
  if (err) {
    console.error(err);
  }
  if (results && results[0]) {
    result.innerText = results[0].label;
    confidence.innerText = results[0].confidence;
    classifier.classify(gotResults);
  }
}

// Start predicting when the predict button is clicked
predict.onclick = function () {
  classifier.classify(gotResults);
}

*/

document.addEventListener('deviceready', app.init);
