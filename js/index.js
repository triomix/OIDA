const app = new Vue({
    el:'#app',
    data:{
        status:false,
        classifier: null,
        featureExtractor: null,
        isBrowser:false,
        videoSecondValue: "",
        currentPage:null,
        pages: [
          {
            label:"third",
            url:"gateau.html",
            name:"PLASTIQUE DUR"
          },
          {
            label:"first",
            url:"bouteille_verre.html",
            name:"BOUTEILLE EN VERRE"
          },
          {
            label:"four",
            url:"bouteille_PET.html",
            name:"BOUTEILLE PET"
          },
          {
            label:"second",
            url:"canette.html",
            name:"ALUMINIUM"
          }
        ]
    },
    methods:{

        init:function() {

            this.status = true;
            this.addButtonListeners();
            this.populateSources();

        },

        addButtonListeners:function() {

          document.querySelector('#predict').addEventListener("click", this.predict, false);
          document.querySelector('#retry').addEventListener("click", this.retry, false);
          document.querySelector("#result").addEventListener("click", this.showPage, false);

        },

        populateSources:function() {

          //var audioSelect = document.querySelector('select#audioSource');
          var videoSelect = document.querySelector('select#videoSource');
          videoSelect.onchange = this.startVideo;

          navigator.mediaDevices.enumerateDevices().then(this.gotDevices).catch(this.handleError);


        },
        handleError:function(error) {

          //log to console first
          console.log('Error: ', error);

          if (error.name == "NotFoundError" || error.name == "DevicesNotFoundError") {
              //required track is missing
          } else if (error.name == "NotReadableError" || error.name == "TrackStartError") {
              //webcam or mic are already in use
          } else if (error.name == "OverconstrainedError" || error.name == "ConstraintNotSatisfiedError") {
              //constraints can not be satisfied by avb. devices
              console.log('OverConstained Error, did you ask permissions ?');

          } else if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
              //permission denied in browser
          } else if (error.name == "TypeError" || error.name == "TypeError") {
              //empty constraints object
          } else {
              //other errors
          }

          document.querySelector('#text').innerText = error;

        },

        gotDevices:function(deviceInfos) {

          //var audioSelect = document.querySelector('select#audioSource');
          var videoSelect = document.querySelector('select#videoSource');

          var nVideosCount = 0;
          for (var i = 0; i !== deviceInfos.length; ++i) {

            var deviceInfo = deviceInfos[i];
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            console.log("Device Id : " + deviceInfo.deviceId);

            if (deviceInfo.kind === 'audioinput') {
            /*  option.text = deviceInfo.label ||
                'microphone ' + (audioSelect.length + 1);
              audioSelect.appendChild(option);

              console.log("Add audio source to choices : " + deviceInfo.label);
            */
            } else if (deviceInfo.kind === 'videoinput') {
              option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
              videoSelect.appendChild(option);

              if(nVideosCount == 1)
                this.videoSecondValue = option.value;

              nVideosCount ++;

              console.log("Add video source to choices : " + deviceInfo.label);

            } else {
             // console.log('Found one other kind of source/device: ', deviceInfo);
            }
          }

          this.getStream();

        },

        getStream:function(){

          var videoSelect = document.querySelector('select#videoSource');
/*
          if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
              track.stop();
            });
          }
*/
          var constraints = {
            audio: false,
            video: {
              deviceId: {exact: videoSelect.value}
            }
          };

          document.querySelector('#text').innerText = "Asking permission";

          navigator.mediaDevices.getUserMedia(constraints).then(this.gotStream).catch(this.handleError);
          console.log("Stream loaded");

          this.startClassifier();
          console.log("Classifier done !");

        },

        gotStream:function(stream) {

          window.stream = stream; // make stream available to console
          var video = document.getElementById('video');
          video.srcObject = stream;

        },

        startVideo:function() {
          this.getStream();
        },

        play:function() {
          var video = document.getElementById('video');
          video.play();

        },
        setVideoOptions:function(srcType) {

          let options = {
            // Some common settings are 20, 50, and 100
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.CAMERA,
            allowEdit: false,
            correctOrientation: true  //Corrects Android orientation quirks
          }
          return options;

        },
        startClassifier:function() {

          document.querySelector('#text').innerText = "Loading model";

          this.featureExtractor = ml5.featureExtractor('MobileNet', this.modelLoaded);
          this.featureExtractor.numClasses = 4;
          var video = document.getElementById('video');
          this.classifier = this.featureExtractor.classification(video, { epochs:30, learningRate: 0.001, numLabels: 4 }, this.videoReady);


        },
        modelLoaded:function() {
          console.log('Model loaded!');
          document.querySelector('#text').innerText = "Model loaded";
          this.classifier.load("www/models/model.json", this.customModelLoaded);
        },

        customModelLoaded:function() {

          console.log('Custom Model loaded!');
          document.querySelector('#text').innerText = "Custom loaded";
          // model is loaded so now show button
          document.getElementById("predict").style.visibility = "visible";


        },
        videoReady:function() {
          console.log("video ready");
        },

        train:function() {
          this.classifier.train(function(lossValue) {
            if (lossValue) {
              console.log('Loss: ' + lossValue);
              document.querySelector('#text').innerText = "lossValue! " + lossValue;
            } else {
              console.log('Done Training! Final Loss: ');
              document.querySelector('#text').innerText = "DONE";
            }
          });
        },
        predict:function() {
          document.querySelector('#text').innerText = "Predicting...";
          this.classifier.classify(this.gotResults);
        },

        gotResults:function(err, results) {
          // Display any error
          if (err) {
            //console.error(err);
            return;
          }
          if (results && results[0]) {

            console.log(results[0].label);
            document.querySelector('#text').innerText = "Result! " + results[0].label + " " + results[0].confidence;

            // show buttons
            document.getElementById("predict-container").style.display = "none";
            document.getElementById("results").style.visibility = "visible";

            var page = this.getPageForLabel(results[0].label);
            document.getElementById("result").innerText =  page.name;

            this.currentPage = page;


          }
        },

        getPageForLabel:function(label) {

          for(var i=0; i<this.pages.length; i++) {
            if(this.pages[i].label == label)
            return this.pages[i];
          }

        },

        retry:function () {

          this.currentPage = null;
          document.getElementById("predict-container").style.display = "grid";
          document.getElementById("results").style.visibility = "hidden";


        },

        showPage() {

          if(this.currentPage) {
            window.location = this.currentPage.url;
          }

        }
    }
})

app.init();
