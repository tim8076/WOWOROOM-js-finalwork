

//api
const apiKey = 'shosetim';
const token = 'q1qYVBiDx5XwAxAmz6ZK6gu5Y9Z2';
const orderUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${apiKey}/orders`;
const orderHeader = {
    headers: {
        'Authorization': token
    }
}
// data

let ordersData = [];

//dom
const orderTable = document.querySelector('.orders-table tbody');
const deleteAllOrdersButton = document.querySelector('.deleteAll .button');
const chart = document.querySelector('.chart__area');
const chartSelect = document.querySelector('.chart__select');


//order-list 訂單彈跳視窗
const orderListPop = document.querySelector('.order-list');
const orderListClose = document.querySelector('[data-close]');
const orderListTable = document.querySelector('.order-list tbody');
const orderListTotal = document.querySelector('.order-list .order-total');
const orderListTitle = document.querySelector('.order-list__title');



//function

//取得訂單列表
function getOrderList() {
    axios.get(orderUrl, orderHeader)
        .then(res => {
            console.log(res);
            ordersData = res.data.orders;
            renderOrders();
            renderC3("全產品類別營收比重");
        })
        .catch(err => {
            console.log(err);
        })
}

function renderOrders() {
    let str = "";
    ordersData.forEach(item => {
        let date = new Date(item.createdAt * 1000);
        str += `<tr data-id="${item.id}">
                    <td>${item.id}</td>
                    <td>${item.user.name}<br> ${item.user.tel}</td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td><a href="#" class="check-order">查看訂單</a></td>
                    <td>${displayDate(date)}</td>
                    <td class="${item.paid ? 'done' : 'unprocess'} status">
                       ${item.paid ? '已付款' : '未付款'}
                    </td>
                    <td>
                        <a href="#" class="button
                                    button--sm button--alert
                                    button--noRound" data-delete >
                            刪除
                        </a>
                    </td>
                </tr>`
    })
    orderTable.innerHTML = str;
}

function renderC3(type) {
    let orderTotal = {};
    if (type ==="全產品類別營收比重"){
        ordersData.forEach(item=>{
            item.products.forEach(product=>{
                if (orderTotal[product.category] === undefined) {
                    orderTotal[product.category] = product.price * product.quantity;
                } else {
                    orderTotal[product.category] += product.price * product.quantity;
                }
            })
        })
    } else if (type ==="全品項營收比重"){
        ordersData.forEach(item => {
            item.products.forEach(product => {
                if (orderTotal[product.title] === undefined) {
                    orderTotal[product.title] = product.price * product.quantity;
                } else {
                    orderTotal[product.title] += product.price * product.quantity;
                }
            })
        })
    }
    let orders = Object.entries(orderTotal);

    //依照營業額由高至低排序
    orders.sort((a, b) => b[1] - a[1]);

    //如果品項超過三種，第四種歸類於其他
    if (orders.length > 3) {
        let [a, b, c, ...others] = orders;
        let othersAry = ['其他品項'];
        let othersNum = others.map(item => {
            return item[1];
        })
        let othersTotal = othersNum.reduce((a, b) => {
            return a + b;
        })
        othersAry.push(othersTotal);
        orders = [a, b, c, othersAry];
        console.log(orders);
    }
    const chartPie = c3.generate({
        bindto: '.chart__area',
        data: {
            columns: orders,
            type: 'pie'
        },
        color: {
            pattern: ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFD']
        }
    })
}

function selectChart(e){
    console.log(e.target.value);
    if (e.target.value === "全品項營收比重"){
        renderC3("全品項營收比重");
    } else if (e.target.value === "全產品類別營收比重"){
        renderC3("全產品類別營收比重");
    }
}

// 偵聽訂單區域
function orderStatus(e) {
    e.preventDefault();
    // 刪除單一訂單
    if (e.target.matches('[data-delete]')) {
        addLoading();
        let id = e.target.closest('tr').dataset.id;
        deleteOrder(id);
    }
    // 修改訂單
    if (e.target.matches('.status')) {
        addLoading();
        let id = e.target.closest('tr').dataset.id;
        let paid = e.target.classList.contains('unprocess') ? true : false;
        modifyOrderStatus(id, paid);
    }
}
// 刪除單一訂單
function deleteOrder(id) {
    axios.delete(`${orderUrl}/${id}`, orderHeader)
        .then(res => {
            ordersData = res.data.orders;
            renderOrders();
            renderC3("全產品類別營收比重");
            removeLoading();
        })
        .catch(err => {
            console.log(err);
            removeLoading();
        })
}
// 刪除全部訂單
function deleteAllOrders() {
    axios.delete(orderUrl, orderHeader)
        .then(res => {
            ordersData = res.data.orders;
            renderOrders();
            renderC3("全產品類別營收比重");
            let text = {
                title: "訂單已清空",
                alert: "歡迎再度購買"
            }
            modalPop(text);
        })
        .catch(err => {
            console.log(err);
        })
}
// 修改訂單狀態
function modifyOrderStatus(id, paid) {
    axios.put(orderUrl, {
        data: {
            id: id,
            paid: paid
        }
    }, orderHeader)
        .then(res => {
            ordersData = res.data.orders;
            renderOrders();
            removeLoading();
        })
        .catch(err => {
            console.log(err);
            removeLoading();
        })
}

// 調整時間格式
function displayDate(date) {
    return date.toLocaleDateString(
        undefined,
        { day: 'numeric', month: 'numeric', year: 'numeric' }
    )
}

// 訂單彈跳視窗
function orderPop(e) {
    e.preventDefault();
    if (e.target.matches('.check-order')) {
        document.querySelector('body').classList.add('overflowY-hidden');
        orderListPop.classList.add('active');
        renderOrderListData(e);
    }
}
function renderOrderListData(e) {
    let orderId = e.target.closest('tr').dataset.id;
    let product = ordersData.find(item => {
        return item.id === orderId;
    })
    let str = '';
    let total = 0;
    product.products.forEach(item => {
        str += `<tr>
                    <td>${item.title}</td>
                    <td>${item.price}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price * item.quantity}</td>
                </tr> `
        total += item.price * item.quantity;
    })
    orderListTable.innerHTML = str;
    orderListTotal.textContent = `總計: NT$ ${total}`;
    orderListTitle.textContent = `訂單編號: ${product.id}`;
}

function closeOrderList(e) {
    e.preventDefault();
    document.querySelector('body').classList.remove('overflowY-hidden');
    orderListPop.classList.remove('active');
}

//defalut render
function init() {
    getOrderList();
}
init();




//events
chartSelect.addEventListener('change', selectChart);
orderTable.addEventListener('click', orderStatus);
deleteAllOrdersButton.addEventListener('click', deleteAllOrders);

//訂單彈跳視窗
orderTable.addEventListener('click', orderPop);
orderListClose.addEventListener('click', closeOrderList);
