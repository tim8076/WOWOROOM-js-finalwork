
//menu
const body = document.querySelector('body');
const menuToggle = document.querySelector('.header__toggle');
const menu = document.querySelector('.header__menu');
const menuLinks = document.querySelectorAll('.header__menu__link');
const sectionArea = document.querySelectorAll('section h2');
const alertBox = document.querySelector('.alert');


// modal
const modal = document.querySelector('.modal');
const modalBg = document.querySelector('.modal__bg');
const modalCloseButton = document.querySelector('.modal .fa-times-circle');

//loading
const loadingImage = document.querySelector('.loading');



/************
modal用法 填寫以下物件文字，作為參數傳入函式
        let text = {
                title: "購物車無商品",
                alert: "請先前往購買"
                } 
************/
function modalPop(textObj) {
    let modalBg = modal.querySelector('.modal__bg');
    let modalTxt = modal.querySelector('.modal__txt');
    modalTxt.querySelector('.sub-title').textContent = textObj.title;
    modalTxt.querySelector('.alert-text').textContent = textObj.alert;

    if (modalTxt.classList.contains('modal-text-popIn')) {
        modalBg.style.display = "none";
        modalBg.style.opacity = 0;
        modalTxt.classList.remove('modal-text-popIn');
        body.classList.remove('overflowY-hidden');
    } else {
        modalBg.style.display = "flex";
        modalBg.style.opacity = 0.5;
        modalTxt.classList.add('modal-text-popIn');
        body.classList.add('overflowY-hidden');
    }
}

function addLoading() {
    loadingImage.classList.add('active');
}
function removeLoading() {
    loadingImage.classList.remove('active');
}

/************
alert用法 填寫以下物件文字，作為參數傳入函式
        let alert = {
                success: true,
                alert: "商品成功加入購物車"
                }
************/
function alertPop(alert){
    if (alertBox.classList.contains('active')){
        return;
    }
    alertBox.classList.add('active');
    if (alert.success){
        alertBox.classList.add('success');
        alertBox.innerHTML = `<p>
                                <i class="fas fa-check-circle"></i>
                                ${alert.alert}
                              </p>`
    }else{
        alertBox.classList.add('fail');
        alertBox.innerHTML = `<p>
                                <i class="fas fa-times-circle"></i>
                                ${alert.alert}
                              </p>`
    }
    setTimeout(()=>{
        alertBox.classList.remove('active');
        alertBox.classList.remove('success');
        alertBox.classList.remove('fail');
    },2500)
}


//modal
modalCloseButton.addEventListener('click', modalPop);
modalBg.addEventListener('click', modalPop);



// 手機板漢堡選單收合
menuToggle.addEventListener('click', function () {
    menu.classList.toggle('active');
})

//點擊首頁選單，移動到該區塊
menuLinks.forEach(item=>{
    item.addEventListener('click',function(e){
        sectionArea.forEach(title=>{
            let linkText = e.target.textContent.trim();
            let titleText = title.textContent.trim();
            let titleSection = title.closest('section');
            if (linkText === titleText){
                scrollTo({
                    top: titleSection.offsetTop,
                    behavior: "smooth"
                });
            }
        })
    }) 
})
