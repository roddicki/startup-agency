
let uploadImgList = [];
//let preloadedImages = ['https://picsum.photos/500/500?random=1','https://picsum.photos/500/500?random=2'];

// add existing image files
function addExistingImageFiles(preloadedImages){
  const imgContainer = document.querySelector('.upload__img-wrap');
  for (var i = 0; i < preloadedImages.length; i++) {
    preloadedImages[i]
    let html = "<div class='upload__img-box'><div style='background-image: url(" + preloadedImages[i] + ")' data-number='" + $(".upload__img-close").length + "' data-file='" + preloadedImages[i] + "' data-preloaded='true' class='img-bg'><div class='upload__img-close' onclick='closeThisImg(this)'></div></div></div>";
    imgContainer.innerHTML += html;
  }
  //console.log(maxLength, uploadImgList.length, preloadedImages.length);
}

// image uploader
function imageUploader(){
  let imgWrap = "";
  let maxLength = document.querySelector('.upload__box .image-upload').getAttribute('data-max_length');
  $('.upload__inputfile').each(function () {
    $(this).on('change', function (e) {
      imgWrap = $(this).closest('.upload__box').find('.upload__img-wrap');
      console.log(maxLength, uploadImgList.length, preloadedImages.length);

      let files = e.target.files;
      let filesArr = Array.prototype.slice.call(files);
      let iterator = 0;
      filesArr.forEach(function (f, index) {

        if (!f.type.match('image.*')) {
          return;
        }

        if (uploadImgList.length + preloadedImages.length >= maxLength || f.size > 1024000) {
          const invalid = document.querySelector('.invalid-feedback.upload-images');
          invalid.classList.add('d-block');
          console.log("too many images "+uploadImgList.length + preloadedImages.length+" or too big" + f.size);
          return;
        } 
        else {
          let len = 0;
          for (let i = 0; i < uploadImgList.length; i++) {
            if (uploadImgList[i] !== undefined) {
              len++;
            }
          }
          if (len > maxLength) {
            return false;
          } 
          else {
            uploadImgList.push(f);
            console.log(uploadImgList);
            let reader = new FileReader();
            reader.onload = function (e) {
              let html = "<div class='upload__img-box'><div style='background-image: url(" + e.target.result + ")' data-number='" + $(".upload__img-close").length + "' data-file='" + f.name + "' data-preloaded='false' class='img-bg'><div class='upload__img-close' onclick='closeThisImg(this)'></div></div></div>";
              imgWrap.append(html);
              iterator++;
            }
            reader.readAsDataURL(f);
          }
        }
      });
    });
  });
}




// close this image thumbnail
function closeThisImg(el) {
  let maxLength = document.querySelector('.upload__box .image-upload').getAttribute('data-max_length');
  console.log(maxLength, uploadImgList.length, preloadedImages.length);
  console.log($(el).parent().attr('data-preloaded'));
  // is preloadedImages remove from preloadedImages array // delete from db
  if ($(el).parent().attr('data-preloaded') == 'true') {
    const url = $(el).parent().attr('data-file');
    console.log("the index of the deleted image is", preloadedImages.indexOf(url));
    preloadedImages.splice(preloadedImages.indexOf(url),1);
  }
  
  if (uploadImgList.length + preloadedImages.length <= maxLength) {
    const invalid = document.querySelector('.invalid-feedback.upload-images');
    invalid.classList.remove('d-block');
  }
  let file = $(el).parent().data("file");
  for (let i = 0; i < uploadImgList.length; i++) {
    if (uploadImgList[i].name === file) {
      uploadImgList.splice(i, 1);
      break;
    }
  }
  $(el).parent().parent().remove();

  console.log("new lengths ", maxLength, uploadImgList.length, preloadedImages.length);
}

imageUploader();
//addExistingImageFiles(preloadedImages);