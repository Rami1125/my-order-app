// js/client_portal.js

const userPhone = localStorage.getItem("userPhone");
const userName = localStorage.getItem("userName");
const clientSites = JSON.parse(localStorage.getItem("clientSites") || '[]');

// פונקציה להצגת הודעות בתוך הפורטל
function showPortalMessage(message, type = 'info', containerId = 'order-message-container') {
  const messageContainer = document.getElementById(containerId);
  if (!messageContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `p-3 mt-4 rounded-lg text-center ${
    type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
  }`;
  messageDiv.textContent = message;

  messageContainer.innerHTML = '';
  messageContainer.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// פונקציה לטעינת מוצרים ל-dropdown
async function loadProducts() {
  try {
    const products = await apiFetchProducts();
    const select = document.getElementById('productList');
    products.forEach(prod => {
      const opt = document.createElement('option');
      opt.value = prod.name;
      opt.innerText = prod.name;
      select.appendChild(opt);
    });
  } catch (error) {
    console.error("שגיאה בטעינת מוצרים:", error);
    showPortalMessage("שגיאה בטעינת רשימת המוצרים.", "error");
  }
}

// פונקציה לטעינת אתרי עבודה ל-dropdown
function loadWorkSites() {
  const select = document.getElementById('workSite');
  clientSites.forEach(site => {
    const opt = document.createElement('option');
    opt.value = site;
    opt.innerText = site;
    select.appendChild(opt);
  });
}

// פונקציה לשליחת הזמנה
async function submitOrder() {
  const product = document.getElementById("productList").value;
  const quantity = document.getElementById("quantity").value;
  const deliveryType = document.getElementById("deliveryType").value;
  const workSite = document.getElementById("workSite").value;
  const notes = document.getElementById("notes").value;

  if (!product || !quantity || !deliveryType || !workSite) {
    showPortalMessage("אנא מלא את כל השדות הנדרשים (מוצר, כמות, סוג הובלה, אתר עבודה).", "error");
    return;
  }
  if (parseInt(quantity) <= 0) {
    showPortalMessage("הכמות חייבת להיות מספר חיובי.", "error");
    return;
  }

  const orderData = {
    clientName: userName,
    phone: userPhone,
    product: product,
    quantity: parseInt(quantity),
    deliveryType: deliveryType,
    workSite: workSite,
    notes: notes,
    status: "נשלחה", // סטטוס התחלתי
    orderDate: new Date().toLocaleString('he-IL') // תאריך ושעה מקומיים
  };

  try {
    const response = await apiSubmitOrder(orderData);
    if (response.status === 'success') {
      showPortalMessage("הזמנה נשלחה בהצלחה! מספר הזמנה: " + response.orderId, "success");
      // ניקוי טופס
      document.getElementById("productList").value = "";
      document.getElementById("quantity").value = "";
      document.getElementById("deliveryType").value = "";
      document.getElementById("workSite").value = "";
      document.getElementById("notes").value = "";

      // פתיחת וואטסאפ עם הודעה מוכנה
      openWhatsApp(orderData, response.orderId);
      loadRecentOrders(); // רענן רשימת הזמנות
    } else {
      showPortalMessage("שגיאה בשליחת ההזמנה: " + response.message, "error");
    }
  } catch (error) {
    console.error("שגיאה בשליחת הזמנה:", error);
    showPortalMessage("אירעה שגיאה בשרת בעת שליחת ההזמנה. נסה שוב מאוחר יותר.", "error");
  }
}

/**
 * פותח את וואטסאפ עם הודעה מוכנה.
 * @param {object} order - נתוני ההזמנה.
 * @param {string} orderId - מספר ההזמנה שהתקבל מהשרת.
 */
function openWhatsApp(order, orderId) {
  const adminPhoneNumber = "972501234567"; // מספר הטלפון של רמי/מנהל ההזמנות - יש לשנות למספר אמיתי
  const message = `
  הזמנה חדשה - ח. סבן חומרי בניין:
  מספר הזמנה: ${orderId}
  שם לקוח: ${order.clientName}
  טלפון: ${order.phone}
  מוצר: ${order.product}
  כמות: ${order.quantity}
  סוג הובלה: ${order.deliveryType}
  אתר עבודה: ${order.workSite}
  הערות: ${order.notes || 'אין'}
  תאריך: ${order.orderDate}
  `;
  const encodedMessage = encodeURIComponent(message.trim());
  window.open(`https://wa.me/${adminPhoneNumber}?text=${encodedMessage}`, '_blank');
}


// פונקציה לטעינת הזמנות אחרונות של הלקוח
async function loadRecentOrders() {
  const recentOrdersDiv = document.getElementById('recentOrders');
  recentOrdersDiv.innerHTML = '<p class="text-center text-gray-500">טוען הזמנות אחרונות...</p>';

  try {
    const orders = await apiFetchOrdersByPhone(userPhone);
    if (orders && orders.length > 0) {
      recentOrdersDiv.innerHTML = ''; // נקה הודעת טעינה

      // מיון הזמנות מהחדשה לישנה
      orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

      orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'bg-gray-50 p-4 rounded-lg shadow-md mb-4 border border-gray-200 text-right';
        orderCard.innerHTML = `
          <p><strong>מספר הזמנה:</strong> ${order.orderId}</p>
          <p><strong>מוצר:</strong> ${order.product}</p>
          <p><strong>כמות:</strong> ${order.quantity}</p>
          <p><strong>סוג הובלה:</strong> ${order.deliveryType}</p>
          <p><strong>אתר עבודה:</strong> ${order.workSite}</p>
          <p><strong>תאריך:</strong> ${order.orderDate}</p>
          <p><strong>סטטוס:</strong> <span class="${getOrderStatusClass(order.status)}">${order.status}</span></p>
          <p><strong>הערות:</strong> ${order.notes || 'אין'}</p>
        `;
        recentOrdersDiv.appendChild(orderCard);
      });
    } else {
      recentOrdersDiv.innerHTML = '<p class="text-center text-gray-500">לא נמצאו הזמנות קודמות.</p>';
    }
  } catch (error) {
    console.error("שגיאה בטעינת הזמנות אחרונות:", error);
    recentOrdersDiv.innerHTML = '<p class="text-center text-red-500">שגיאה בטעינת הזמנות. נסה שוב מאוחר יותר.</p>';
  }
}

// פונקציה לקבלת קלאס CSS לפי סטטוס ההזמנה
function getOrderStatusClass(status) {
  switch (status) {
    case 'נשלחה':
      return 'text-blue-600 font-semibold';
    case 'ממתינה':
      return 'text-yellow-600 font-semibold';
    case 'סופקה':
      return 'text-green-600 font-semibold';
    case 'בוטלה':
      return 'text-red-600 font-semibold';
    default:
      return 'text-gray-600';
  }
}

// בדיקה אם המשתמש מחובר בעת טעינת הדף
document.addEventListener('DOMContentLoaded', () => {
  if (!userPhone || !userName) {
    window.location.href = "index.html"; // הפנה חזרה לדף ההתחברות אם לא מחובר
    return;
  }
  document.getElementById('welcomeMessage').textContent = `ברוך הבא, ${userName}!`;
  loadProducts();
  loadWorkSites();
  loadRecentOrders();
});
