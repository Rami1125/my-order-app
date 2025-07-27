// api.js

// 🔗 החלף כאן לכתובת האמיתית של ה-Web App שלך
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2rqBnscRML-yu2VjuWR8M6NFRGI9BhPs05adxfV9lvRBEw6X6_fhT5VnOzMr7npPL/exec";

/**
 * פונקציה כללית לשליחת בקשות GET ל-Google Apps Script
 * General GET function
 */
async function apiGet(action, params = {}) {
  const urlParams = new URLSearchParams({ action, ...params }).toString();
  const url = `${GOOGLE_APPS_SCRIPT_URL}?${urlParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error(`[GET] Error for action '${action}':`, error);
    throw error;
  }
}

/**
 * פונקציה כללית לשליחת בקשות POST ל-Google Apps Script
 * General POST function
 */
async function apiPost(action, payload = {}) {
  const requestBody = JSON.stringify({ action, ...payload });

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error(`[POST] Error for action '${action}':`, error);
    throw error;
  }
}

// ============================
// ✨ פונקציות ייעודיות (API Specific)
// ============================

/**
 * שליפת מוצרים
 */
async function apiFetchProducts() {
  return apiGet('products');
}

/**
 * שליפת פרטי לקוח לפי טלפון
 */
async function apiFetchClientByPhone(phone) {
  return apiGet('client', { phone });
}

/**
 * שליחת הזמנה חדשה
 */
async function apiSubmitOrder(orderData) {
  return apiPost('submitOrder', orderData);
}

/**
 * בדיקת סטטוס הזמנה לפי מזהה או שם
 */
async function apiCheckOrderStatus(query) {
  return apiGet('status', { query });
}

/**
 * שליפת כל ההזמנות
 */
async function apiFetchAllOrders() {
  return apiGet('allOrders');
}

/**
 * עדכון סטטוס להזמנה
 */
async function apiUpdateOrderStatus(orderId, newStatus) {
  return apiPost('updateStatus', { orderId, newStatus });
}

/**
 * מחיקת הזמנה לפי מזהה
 */
async function apiDeleteOrder(orderId) {
  return apiPost('deleteOrder', { orderId });
}

/**
 * שליפת דוחות
 */
async function apiFetchReports() {
  return apiGet('reports');
}

/**
 * שליפת הזמנות לפי טלפון
 */
async function apiFetchOrdersByPhone(phone) {
  return apiGet('ordersByPhone', { phone });
}
