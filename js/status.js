// js/status.js

/**
 * מציג הודעה למשתמש בתוך אלמנט ייעודי.
 * @param {string} message - תוכן ההודעה.
 * @param {string} type - סוג ההודעה (לדוגמה: 'success', 'error').
 */
function showStatusMessage(message, type = 'info') {
  const messageContainer = document.getElementById('status-message-container');
  if (!messageContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `p-3 mt-4 rounded-lg text-center ${
    type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
  }`;
  messageDiv.textContent = message;

  messageContainer.innerHTML = '';
  messageContainer.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

/**
 * מטפל בבדיקת סטטוס הזמנה.
 * שולף את מספר ההזמנה או שם הלקוח, שולח ל-API ומציג את התוצאה.
 */
async function checkStatus() {
  const searchQuery = document.getElementById("searchQuery").value.trim();
  const statusResultDiv = document.getElementById("statusResult");

  if (!searchQuery) {
    showStatusMessage("אנא הזן מספר הזמנה או שם לקוח.", "error");
    statusResultDiv.innerHTML = '<p class="text-center text-gray-500">הזן מספר הזמנה או שם לקוח ובדוק סטטוס.</p>';
    return;
  }

  statusResultDiv.innerHTML = '<p class="text-center text-gray-500">טוען סטטוס...</p>';

  try {
    const data = await apiCheckOrderStatus(searchQuery); // פונקציה ב-api.js
    if (data && data.length > 0) {
      statusResultDiv.innerHTML = ''; // נקה הודעת טעינה
      data.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200 text-right';
        orderCard.innerHTML = `
          <p><strong>מספר הזמנה:</strong> ${order.orderId}</p>
          <p><strong>שם לקוח:</strong> ${order.clientName}</p>
          <p><strong>מוצר:</strong> ${order.product}</p>
          <p><strong>כמות:</strong> ${order.quantity}</p>
          <p><strong>סוג הובלה:</strong> ${order.deliveryType}</p>
          <p><strong>אתר עבודה:</strong> ${order.workSite}</p>
          <p><strong>תאריך:</strong> ${order.orderDate}</p>
          <p><strong>סטטוס:</strong> <span class="${getOrderStatusClass(order.status)}">${order.status}</span></p>
          <p><strong>הערות:</strong> ${order.notes || 'אין'}</p>
        `;
        statusResultDiv.appendChild(orderCard);
      });
      showStatusMessage("סטטוס הזמנה(ות) נמצאו.", "success");
    } else {
      statusResultDiv.innerHTML = '<p class="text-center text-gray-500">לא נמצאו הזמנות עבור החיפוש.</p>';
      showStatusMessage("לא נמצאו הזמנות עבור החיפוש.", "info");
    }
  } catch (error) {
    console.error("שגיאה בבדיקת סטטוס:", error);
    statusResultDiv.innerHTML = '<p class="text-center text-red-500">שגיאה בטעינת סטטוס. נסה שוב מאוחר יותר.</p>';
    showStatusMessage("אירעה שגיאה בשרת. נסה שוב מאוחר יותר.", "error");
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
