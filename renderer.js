// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
  //Pour upload une image
  Function.prototype.namedParameters = function(type, list, error) {
    var params,
      callback = type,
      regex = /^(?:function *[a-zA-Z0-9_$]*)? *\(? *([a-zA-Z0-9_$, ]*) *\)?/g,
      functions = list || {};

    if (type instanceof Array) {
      callback = type.pop();
      params = type;
    } else {
      params = ((regex.exec(callback.toString()) || [1]).slice(1)[0] || "").split(',')
    }

    params = params.map(function(item) {
      var key = item.trim();
      if (functions.hasOwnProperty(key)) {
        return functions[key];
      } else {
        return (error && error(key)) || new Error('Named parameter `' + key + "` doesn't exist.");
      }
    });

    callback.apply(this, params);
  };

  /* Logic */

  (function() {
    function selectImage(afterSelectCallback) {
      var inputFile = document.createElement("input");
      inputFile.type = "file";
      inputFile.accept = "image/*";

      inputFile.addEventListener("change", function() {
        if (afterSelectCallback) {
          afterSelectCallback(inputFile);
        }
      });

      return inputFile;
    }
    function readImage(inputFile, callback) {
      var reader = new FileReader();

      reader.addEventListener("load", function() {
        var image = document.createElement("img");

        image.addEventListener("load", function() {
          if (callback) {
            callback(image, reader);
          }
        });

        image.src = reader.result;
      });

      reader.readAsDataURL(inputFile.files[0]);
    }

    function resizeWithSameRatio(options, callback) {
      var width = options.width || 0,
        height = options.height || 0,
        maxWidth = options.maxWidth || 800,
        maxHeight = options.maxHeight || 600

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      Function.namedParameters(callback, {
        width: width,
        height: height
      });
    }

    function thumbnailWithCanvas(options, callback) {
      var imageSource = options.imageSource || document.createElement("img"),
        width = options.width || 0,
        height = options.height || 0,
        canvas = document.createElement("canvas"),
        imageResult = document.createElement("img"),
        context;

      canvas.width = width;
      canvas.height = height;

      context = canvas.getContext("2d");
      context.drawImage(imageSource, 0, 0, width, height);

      imageResult.addEventListener("load", function() {
        Function.namedParameters(callback, {
          imageResult: imageResult,
          canvas: canvas
        });
      });

      imageResult.src = canvas.toDataURL("image/jpg", 0.8);
    }

    function reduceImage(imageSource, callback) {
      resizeWithSameRatio({
        height: imageSource.height,
        maxHeight: 600,
        width: imageSource.width,
        maxWidth: 800
      }, function(height, width) {
        thumbnailWithCanvas({
          imageSource: imageSource,
          width: width,
          height: height
        }, function(canvas, imageResult) {
          callback(imageResult, canvas);
        })
      });
    }

    function uploadImage(options, callback) {
      var xhttp = new XMLHttpRequest(),
        formData = new FormData();

      url = options.url || new Error("`options.url` parameter invalid for `uploadImage` function.");
      image = options.image || new Error("`options.image` parameter invalid for `uploadImage` function.");

      if (url instanceof Error) {
        throw url;
      }
      if (image instanceof Error) {
        throw image;
      }

      formData.append("image", image.src.substring("0", "100")); // Remove substring, it's just to allow mokup response to work.
      xhttp.open("POST", url, true);

      xhttp.addEventListener("load", function() {
        if (xhttp.status < 200 && xhttp.status >= 400) {
          return Function.namedParameters(callback, {
            error: new Error("XHR connection error for `uploadImage` function."),
            response: null
          });
        }
        Function.namedParameters(callback, {
          error: null,
          response: xhttp.responseText
        });
      });

      xhttp.addEventListener("error", function(test) {
        Function.namedParameters(callback, {
          error: new Error("XHR connection error for `uploadImage` function."),
          response: null
        });
      });

      xhttp.send(formData);
    }

    /* Exec */

    var body = document.getElementsByTagName("span")[0];
    body.appendChild(
      selectImage(function(inputFile) {
        readImage(inputFile, function(image) {
          reduceImage(image, function(imageResult) {
            uploadImage({
              url: "https://www.mocky.io/v2/5185415ba171ea3a00704eed",
              image: imageResult
            }, function(error, response) {
              var data = document.createElement("div");
              data.textContent = (error) ? error : response;

              body.appendChild(data);
              document.getElementById('show-img').appendChild(imageResult);
            });
          });
        });
      })
    );
  }());



  document.getElementById('range-bar').addEventListener("change", () => {
    var rangeValue = document.getElementById('range-bar').value;
    document.getElementById('display-h').value = rangeValue
    document.getElementById('display-w').value = rangeValue
    document.getElementById('cadre').style.height = `${rangeValue}px`
    document.getElementById('cadre').style.width = `${rangeValue}px`
  });

function changeBorderDroit() {
  document.getElementById('cadre').style.borderRadius = "0%"
}
function changeBorderArrondis() {
  document.getElementById('cadre').style.borderRadius = "5%"
}
function changeBorderRond() {
  document.getElementById('cadre').style.borderRadius = "50%"
}

document.getElementById('favcolor').addEventListener("change", () => {
  var color = document.getElementById('favcolor').value;
  document.getElementById('cadre').style.backgroundColor = color
});
