

//api
const apiKey = 'shosetim';
const productApi = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/products`;
const cartApi = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/carts`;
const orderApi = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/orders`;


//dom 
const productList = document.querySelector('.merchandise__items');
const productSelect = document.querySelector('.merchandise__select');

const cartList = document.querySelector('.cart__table tbody');
const cartTotal = document.querySelector('.cart__total .price-total');
const cartTableContainer = document.querySelector('[data-cart-container]');

const orderForm = document.querySelector('.order__form');
const orderInputs = document.querySelectorAll('.order__input');
const sendOrderButton = document.querySelector('.send');

// 跑馬燈
const marqueeTitle = document.querySelector('.marquee-title');
const marqueeDiscount = document.querySelector('.marquee-discount');

// 首頁入場loading動畫
const indexLoading = document.querySelector('.index-loading');

//客服小幫手
const customerService = document.querySelector('.customerService');
const customerQuestion = document.querySelector('.customerService__questions');
const customerInput = document.querySelector('.customerService__input__search');
const customerSendButton = document.querySelector('.customerService__input .fa-share');
const customerResponse = document.querySelector('.customerService__questions__responses');
const customerResponseTemplate = document.querySelector('[data-customer-response]');
const customerCommonQuestions = document.querySelectorAll('.customerService__questions__list a');

//data
let productData = [];
let cartData = {
    cartList: [],
    finalTotal:0
}

//驗證條件
const constraints ={
    姓名:{
        presence:{
            message:"欄位必填"
        }
    },
    電話:{
        presence: {
            message: "欄位必填"
        },
        format: {
            pattern: "^[0-9]{10}$",
            message: "不是正確的格式"
        }
    },
    Email:{
        presence: {
            message: "欄位必填"
        },
        email:{
            message: "不是正確的格式"
        }
    },
    地址:{
        presence: {
            message: "欄位必填"
        }
    },
    交易方式:{
        presence: {
            message: "欄位必填"
        }
    }
}


//function

//取得產品列表
function getProductList(){  
    axios.get(productApi)
         .then(res=>{
             productData = res.data.products;
             renderProductList(productData);
             addProductSelect();
         })
         .catch(error=>{
             console.log(error);
         })
}
//渲染產品列表
function renderProductList(data){
    let str = "";
    data.forEach((item,index)=>{
        str += `<li class="merchandise__item">
                    <img src="${item.images}" alt="merchandise-${index + 1}">
                    <a href="#" class="add-button" data-id="${item.id}">加入購物車</a>
                    <h3 class="title">${item.title}</h3>
                    <p class="price-delete">NT$${item.origin_price}</p>
                    <p class="price">NT$${item.price}</p>
                    <span class="type">${item.category}</span>
                </li>`
    })
    productList.innerHTML = str;
}
//加入產品選單
function addProductSelect(){
    let types = productData.map(item=>{
        return item.category;
    })
    let noRepeatTypes = types.filter((item,index,ary)=>{
        return ary.indexOf(item) === index;
    })
    noRepeatTypes.forEach(item=>{
        let option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        productSelect.append(option);
    })
}
//產品列表選單
function selectProduct(e){
    let value = e.target.value;
    if(value === "全部商品"){
        renderProductList(productData);
    }else{
        let filterData = productData.filter(item => {
            return item.category === value;
        })
        renderProductList(filterData);
    }  
}

// 取得購物車列表
function getCartList(){
    axios.get(cartApi)
         .then(res=>{
             setCartData(res);
             renderCartList();
             setTimeout(function(){
                 indexLoading.classList.add('index-loading-fadeOut');
             },2000);
         })
         .catch(err=>{
             console.log(err);  
             setTimeout(function () {
                 indexLoading.classList.add('index-loading-fadeOut');
             },2000);
         })
}
// 渲染購物車列表

function setCartData(res){
    cartData.cartList = res.data.carts;
    cartData.finalTotal = res.data.finalTotal;
}
function renderCartList(){
    let str = "";
    cartData.cartList.forEach((item,index)=>{
        str += `
                <tr data-cart-item >
                    <td class="item-name">
                        <img class="cart__image" src="${item.product.images}" >
                    </td>
                    <td>${item.product.title}</td>
                    <td>${item.product.price}</td>
                    <td>
                        <select class="cart__select custom-select" >
                            <option value="${item.quantity}" selected disabled>${item.quantity}</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                        </select>
                    </td>
                    <td>${item.quantity * item.product.price}</td>
                    <td>
                        <a href="#">
                            <i class="fas fa-times" data-id="${item.id} "></i>
                        </a>
                    </td>
                </tr>`
    })
    cartList.innerHTML = str;
    cartTotal.innerText = `NT$${cartData.finalTotal}`;
}

// 加入購物車
function addToCart(e){
    e.preventDefault();
    if (e.target.matches('.add-button')){
        let id = e.target.dataset.id;
        let num = 0;
        cartData.cartList.forEach(item=>{
            if(item.product.id === id){
                num = item.quantity;
            }
        })
        addLoading();
        postProduct(id,num);
    }   
}
function postProduct(id,num){
    axios.post(cartApi,{
        data:{
            productId:id,
            quantity:num + 1
        }
    })
    .then(res=>{
        setCartData(res);
        renderCartList();
        removeLoading();
    })
    .catch(err=>{
        console.log(err);     
        removeLoading();
    })    
}

//刪除購物車
function deleteCart(e){ 
    e.preventDefault();
    //刪除單品
    if (e.target.matches('.fa-times')){
        addLoading();
        let id = e.target.dataset.id;
        deleteCartItem(id);
    }
    //刪除全部
    if (e.target.matches('[data-delete-all]')){
        if (cartData.cartList.length === 0){
            let text = {
                title: "購物車無商品",
                alert: "請先前往購買"
            }
            modalPop(text);
            return;
        }
        deleteCartAllItem();
    }
}
function deleteCartItem(id){
    axios.delete(`${cartApi}/${id}`)
         .then(res=>{ 
             setCartData(res);
             renderCartList();
             removeLoading();
         })
         .catch(err=>{
             console.log(err);   
             removeLoading();
         })
}

function deleteCartAllItem() {
    axios.delete(cartApi)
        .then(res => {
            setCartData(res);
            renderCartList();
            let text = {
                title: "購物車",
                alert: "已清空"
            }
            modalPop(text);
        })
        .catch(err => {
            console.log(err);
        })
}

//更改購物車數量
function changeItemNum(e){
    if (e.target.matches('.cart__select')){
        addLoading();
        let num = parseInt(e.target.value);
        let cartId = e.target.closest('[data-cart-item]').querySelector('.fa-times').dataset.id.trim();
        axios.patch(cartApi, {
            data: {
                id: cartId ,
                quantity: num
            }
        })
        .then(res => {
            setCartData(res);
            renderCartList();
            removeLoading();
        })
        .catch(err=>{
            console.log(err);
            removeLoading();
        })
    }
}

//送出訂單
function sendOrder(){
    //檢查購物車有無商品
    if (cartData.cartList.length === 0){
        let text = {
            title: "購物車無商品",
            alert: "請先前往購買"
        }
        modalPop(text)
        return;
    }
    //表單驗證
    let errors = orderValidate();
    if(errors){
        //按下送出按鈕後，再綁驗證的blur監聽
        orderInputs.forEach(item => {
            item.addEventListener('blur', orderValidate);
        })
        return;
    }
    //送出訂單資料
    let orderInfo = {};
    orderInputs.forEach(item=>{
        if (orderInfo[item.id] === undefined){
            orderInfo[item.id] = item.value.trim();
        }
    });

    addLoading();
    createOrder(orderInfo);
}

function orderValidate(){
    orderInputs.forEach(item=>{
        item.nextElementSibling.textContent = "";
    })
    let errors = validate(orderForm, constraints);
    if (errors) {
        orderInputs.forEach(item => {
            item.nextElementSibling.textContent = errors[item.name];
        })
    }
    return errors;
}

function createOrder(orderInfo){
    axios.post(orderApi,{
        data:{
            user: orderInfo
        }
    })
    .then(res=>{
        removeLoading();
        let text = {
                title: "訂單建立成功",
                alert: "感謝您的購買"
            }
        modalPop(text);
        cartData.cartList = [];
        cartData.finalTotal = 0;
        renderCartList();
        orderForm.reset();
    })
    .catch(err=>{
        console.log(err);  
        removeLoading();
    })
}

//初始化
function init(){
    getProductList();
    getCartList();
}
init();


//跑馬燈文字設置
function setMarquee(){
    let marqueeIndex = 0;
    setInterval(function(){
        if (marqueeIndex >= 0 && marqueeIndex < productData.length){
            marqueeIndex ++;
        }else{
            marqueeIndex = 0;
        }
        let title = productData[marqueeIndex].title;
        let discount = productData[marqueeIndex].price;
        let title2 = productData[marqueeIndex + 1].title;
        let discount2 = productData[marqueeIndex + 1].price;
        marqueeTitle.textContent = `${title} 限時特價 ${discount} 元`
        marqueeDiscount.textContent = `${title2} 限時特價 ${discount2} 元`;
    },15000);
}
setMarquee();

// 客服回應
function sendQuestion(){
    if (customerInput.value.trim() === ""){
        return;
    }
    const responseObj = {
        question: customerInput.value.trim(),
        response: "老師、助教辛苦了~~"
    }
    createResponse(responseObj);
    customerInput.value = "";
}

function createResponse(responseObj){
    const responseContainer = customerResponseTemplate.content.cloneNode(true);
    responseContainer.querySelector('[data-question]').innerText = responseObj.question;
    responseContainer.querySelector('[data-response]').innerText = responseObj.response;
    customerResponse.appendChild(responseContainer);
    customerResponse.scrollTo(0, customerResponse.scrollHeight);
}




// events listen
productSelect.addEventListener('change',selectProduct);
productList.addEventListener('click',addToCart);

cartTableContainer.addEventListener('click', deleteCart);
cartTableContainer.addEventListener('change',changeItemNum);
sendOrderButton.addEventListener('click',sendOrder);

//客服開關
customerService.addEventListener('click',function(e){
    if (e.target.classList.contains('customerService') ||
        e.target.classList.contains('fa-lightbulb')){
        customerQuestion.classList.toggle('active');
    }
})
customerSendButton.addEventListener('click',sendQuestion);
customerInput.addEventListener('keyup',function(e){
    if (e.keyCode === 13 && e.target.value.trim() !== ""){
        sendQuestion();
    } 
})
customerCommonQuestions.forEach(item=>{
    item.addEventListener('click',function(e){
        e.preventDefault();
        let type = e.target.dataset.type;
        const responses = {
            hours: "您好，本店營業時間為 8:00-21:00",
            payment: "您好，本店可接受現金、信用卡、轉帳等付款方式",
            member: "您好，完成第一筆交易後，即自動成為會員喔",
            check: "您可隨時點選商品賣場之「 加入購物車」，填寫完訂單資訊後，進入結帳系統。"
        }
        let responseObj = {
            question: e.target.textContent.trim(),
            response: responses[type]
        }
        createResponse(responseObj);
    })
})
