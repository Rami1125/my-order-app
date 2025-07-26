// js/dashboard.js

const ADMIN_PASSWORD = "admin123"; // סיסמת מנהל - יש לשנות לסיסמה חזקה יותר בסביבת ייצור

/**
 * מציג הודעה למשתמש בתוך אלמנט ייעודי.
 * @param {string} message - תוכן ההודעה.
 * @param {string} type - סוג ההודעה (לדוגמה: 'success', 'error').
 */
function showDashboardMessage(message, type = 'info') {
  const messageContainer = document.getElementById('dashboard-message-container');
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

/**
 * פונקציה לאימות סיסמה לפני הצגת לוח הבקרה.
 */
function authenticateAdmin() {
  let password = prompt("אנא הזן סיסמת מנהל:");
  if (password !== ADMIN_PASSWORD) {
    alert("סיסמה שגויה. הנך מופנה לדף הבית."); // שימוש ב-alert לצורך הדגמה, במערכת אמיתית יש להשתמש במודאל
    window.location.href = "index.html";
  }
}

/**
 * טוען את כל ההזמנות ומציג אותן בטבלה, עם אפשרות סינון.
 */
async function loadDashboardOrders() {
  const ordersTableBody = document.getElementById('ordersTableBody');
  const filterStatus = document.getElementById('filterStatus').value;
  const filterDeliveryType = document.getElementById('filterDeliveryType').value;

  ordersTableBody.innerHTML = '<tr><td colspan="11" class="py-3 px-6 text-center">טוען הזמנות...</td></tr>';

  try {
    const allOrders = await apiFetchAllOrders(); // פונקציה ב-api.js
    if (allOrders && allOrders.length > 0) {
      // סינון הזמנות
      const filteredOrders = allOrders.filter(order => {
        const matchesStatus = filterStatus ? order.status === filterStatus : true;
        const matchesDeliveryType = filterDeliveryType ? order.deliveryType === filterDeliveryType : true;
        return matchesStatus && matchesDeliveryType;
      });

      // מיון הזמנות מהחדשה לישנה
      filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));


      ordersTableBody.innerHTML = ''; // נקה הודעת טעינה

      if (filteredOrders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="11" class="py-3 px-6 text-center">לא נמצאו הזמנות התואמות לסינון.</td></tr>';
        return;
      }

      filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.orderId}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.clientName}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.phone}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.product}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.quantity}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.deliveryType}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.workSite}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.orderDate}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">
            <select class="p-2 border rounded-md ${getOrderStatusClass(order.status)}"
                    onchange="updateOrderStatus('${order.orderId}', this.value)">
              <option value="נשלחה" ${order.status === 'נשלחה' ? 'selected' : ''}>נשלחה</option>
              <option value="ממתינה" ${order.status === 'ממתינה' ? 'selected' : ''}>ממתינה</option>
              <option value="סופקה" ${order.status === 'סופקה' ? 'selected' : ''}>סופקה</option>
              <option value="בוטלה" ${order.status === 'בוטלה' ? 'selected' : ''}>בוטלה</option>
            </select>
          </td>
          <td class="py-3 px-6 text-right whitespace-nowrap">${order.notes || 'אין'}</td>
          <td class="py-3 px-6 text-right whitespace-nowrap">
            <button onclick="deleteOrder('${order.orderId}')" class="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">מחק</button>
          </td>
        `;
        ordersTableBody.appendChild(row);
      });
    } else {
      ordersTableBody.innerHTML = '<tr><td colspan="11" class="py-3 px-6 text-center">לא נמצאו הזמנות במערכת.</td></tr>';
    }
  } catch (error) {
    console.error("שגיאה בטעינת הזמנות ללוח הבקרה:", error);
    ordersTableBody.innerHTML = '<tr><td colspan="11" class="py-3 px-6 text-center text-red-500">שגיאה בטעינת הזמנות. נסה שוב מאוחר יותר.</td></tr>';
    showDashboardMessage("אירעה שגיאה בשרת בעת טעינת הזמנות.", "error");
  }
}

/**
 * מעדכן את סטטוס ההזמנה ב-Google Sheet.
 * @param {string} orderId - מספר ההזמנה לעדכון.
 * @param {string} newStatus - הסטטוס החדש.
 */
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await apiUpdateOrderStatus(orderId, newStatus); // פונקציה ב-api.js
    if (response.status === 'success') {
      showDashboardMessage(`סטטוס הזמנה ${orderId} עודכן ל: ${newStatus}`, "success");
      loadDashboardOrders(); // רענן את הטבלה
    } else {
      showDashboardMessage(`שגיאה בעדכון סטטוס הזמנה ${orderId}: ${response.message}`, "error");
    }
  } catch (error) {
    console.error("שגיאה בעדכון סטטוס הזמנה:", error);
    showDashboardMessage("אירעה שגיאה בשרת בעת עדכון הסטטוס.", "error");
  }
}

/**
 * מוחק הזמנה מה-Google Sheet.
 * @param {string} orderId - מספר ההזמנה למחיקה.
 */
async function deleteOrder(orderId) {
  if (confirm(`האם אתה בטוח שברצונך למחוק את הזמנה מספר ${orderId}?`)) { // שימוש ב-confirm לצורך הדגמה, במערכת אמיתית יש להשתמש במודאל
    try {
      const response = await apiDeleteOrder(orderId); // פונקציה ב-api.js
      if (response.status === 'success') {
        showDashboardMessage(`הזמנה מספר ${orderId} נמחקה בהצלחה.`, "success");
        loadDashboardOrders(); // רענן את הטבלה
      } else {
        showDashboardMessage(`שגיאה במחיקת הזמנה ${orderId}: ${response.message}`, "error");
      }
    } catch (error) {
      console.error("שגיאה במחיקת הזמנה:", error);
      showDashboardMessage("אירעה שגיאה בשרת בעת מחיקת ההזמנה.", "error");
    }
  }
}

// פונקציה לקבלת קלאס CSS לפי סטטוס ההזמנה
function getOrderStatusClass(status) {
  switch (status) {
    case 'נשלחה':
      return 'text-blue-600 border-blue-300';
    case 'ממתינה':
      return 'text-yellow-600 border-yellow-300';
    case 'סופקה':
      return 'text-green-600 border-green-300';
    case 'בוטלה':
      return 'text-red-600 border-red-300';
    default:
      return 'text-gray-600 border-gray-300';
  }
}

// אימות סיסמה וטעינת הזמנות בעת טעינת הדף
document.addEventListener('DOMContentLoaded', () => {
  authenticateAdmin();
  loadDashboardOrders();
});
