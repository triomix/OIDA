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
            label:"first",
            url:"google.com",
            name:"ahou"
          },
          {
            label:"second",
            url:"google.com",
            name:"ahou"
          },
          {
            label:"third",
            url:"google.com",
            name:"ahou"
          },
          {
            label:"four",
            url:"google.com",
            name:"ahou"
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

          var audioSelect = document.querySelector('select#audioSource');
          var videoSelect = document.querySelector('select#videoSource');

          navigator.mediaDevices.enumerateDevices().then(this.gotDevices).catch(this.handleError);

          audioSelect.onchange = this.getStream;
          videoSelect.onchange = this.getStream;


        },
        handleError:function(error) {

          console.log('Error: ', error);
          document.querySelector('#text').innerText = error;

        },

        gotDevices:function(deviceInfos) {

          var audioSelect = document.querySelector('select#audioSource');
          var videoSelect = document.querySelector('select#videoSource');

          var nVideosCount = 0;
          for (var i = 0; i !== deviceInfos.length; ++i) {

            var deviceInfo = deviceInfos[i];
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;

            if (deviceInfo.kind === 'audioinput') {
              option.text = deviceInfo.label ||
                'microphone ' + (audioSelect.length + 1);
              audioSelect.appendChild(option);
            } else if (deviceInfo.kind === 'videoinput') {
              option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
              videoSelect.appendChild(option);

              if(nVideosCount == 1)
                this.videoSecondValue = option.value;

                nVideosCount ++;

            } else {
             // console.log('Found one other kind of source/device: ', deviceInfo);
            }
          }

          this.getStream();

        },

        getStream:function(){

          if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
              track.stop();
            });
          }
        
          var constraints = {
            
            video: {
              deviceId: {exact: this.videoSecondValue}
            }
          };

          document.querySelector('#text').innerText = "Asking permission";

          navigator.mediaDevices.getUserMedia(constraints).then(this.gotStream).catch(this.handleError);
  
          this.startClassifier();

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
          this.classifier.load("models/model.json", this.customModelLoaded);
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
            console.error(err);
          }
          if (results && results[0]) {
            console.log(results[0].label);
            document.querySelector('#text').innerText = "Result! " + results[0].label + " " + results[0].confidence;

            // show buttons
            document.getElementById("predict-container").style.display = "none";
            document.getElementById("results").style.visibility = "visible";

            var page = this.getPageForLabel(results[0].label);
            document.getElementById("result").innerText = "C'est un " + page.name;

            this.currentPage = page;


          }
        },

        getPageForLabel:function(label) {

          for(var i=0; i<this.pages.length; i++) {
            if(pages[i].label == label)
            return pages[i];
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