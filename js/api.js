// js/api.js

// ** חשוב: החלף את זה בכתובת ה-URL של פריסת יישום האינטרנט שלך ב-Google Apps Script **
// You must replace "YOUR_APPS_SCRIPT_WEB_APP_URL" with the actual URL from your Google Apps Script deployment.
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxL3mKAxjXvfkyh9U94sJRebm-IKsLfSfSXai00CUs9BlWHPOnqLeITkpaXBwCArab2/exec";

/**
 * פונקציה כללית לביצוע בקשות GET ל-Google Apps Script.
 * General function for performing GET requests to Google Apps Script.
 * @param {string} action - הפעולה המבוקשת (לדוגמה: 'products', 'client', 'orders', 'reports', 'status').
 * The requested action (e.g., 'products', 'client', 'orders', 'reports', 'status').
 * @param {object} params - אובייקט של פרמטרים נוספים לבקשה.
 * An object of additional parameters for the request.
 * @returns {Promise<object>} - Promise עם הנתונים שהתקבלו.
 * A Promise with the received data.
 */
async function apiGet(action, params = {}) {
  const urlParams = new URLSearchParams({ action, ...params }).toString();
  const url = `${GOOGLE_APPS_SCRIPT_URL}?${urlParams}`;

  console.log(`[API] Sending GET request to: ${url}`); // לוג לבדיקה
  try {
    const response = await fetch(url);
    console.log(`[API] Received response status for GET ${action}: ${response.status}`); // לוג לבדיקה
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Server error for GET ${action}: ${response.status} - ${errorText}`); // לוג שגיאה
      throw new Error(`שגיאת רשת או שרת: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    if (data.error) {
      console.error(`[API] API returned error for GET ${action}:`, data.error); // לוג שגיאה מה-API
      throw new Error(data.error);
    }
    console.log(`[API] Successfully received data for GET ${action}:`, data); // לוג הצלחה
    return data;
  } catch (error) {
    console.error(`[API] Error in GET request for ${action}:`, error); // לוג שגיאה כללית
    throw error; // זרוק את השגיאה הלאה לטיפול בדף הקורא
  }
}

/**
 * פונקציה כללית לביצוע בקשות POST ל-Google Apps Script.
 * General function for performing POST requests to Google Apps Script.
 * @param {string} action - הפעולה המבוקשת (לדוגמה: 'submitOrder', 'updateStatus', 'deleteOrder').
 * The requested action (e.g., 'submitOrder', 'updateStatus', 'deleteOrder').
 * @param {object} payload - אובייקט הנתונים לשליחה ב-body.
 * The data object to send in the body.
 * @returns {Promise<object>} - Promise עם התגובה מהשרת.
 * A Promise with the response from the server.
 */
async function apiPost(action, payload = {}) {
  const requestBody = JSON.stringify({ action, ...payload });
  console.log(`[API] Sending POST request to: ${GOOGLE_APPS_SCRIPT_URL} with body:`, requestBody); // לוג לבדיקה
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log(`[API] Received response status for POST ${action}: ${response.status}`); // לוג לבדיקה
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Server error for POST ${action}: ${response.status} - ${errorText}`); // לוג שגיאה
      throw new Error(`שגיאת רשת או שרת: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    if (data.error) {
      console.error(`[API] API returned error for POST ${action}:`, data.error); // לוג שגיאה מה-API
      throw new Error(data.error);
    }
    console.log(`[API] Successfully received data for POST ${action}:`, data); // לוג הצלחה
    return data;
  } catch (error) {
    console.error(`[API] Error in POST request for ${action}:`, error); // לוג שגיאה כללית
    throw error;
  }
}

// --- פונקציות ספציפיות ל-API ---
// --- Specific API functions ---

/**
 * מאחזר רשימת מוצרים מגיליון המוצרים.
 * Retrieves a list of products from the Products sheet.
 * @returns {Promise<Array>} - מערך של אובייקטי מוצרים.
 * An array of product objects.
 */
async function apiFetchProducts() {
  return apiGet('products');
}

/**
 * מאחזר פרטי לקוח לפי מספר טלפון.
 * Retrieves client details by phone number.
 * @param {string} phone - מספר הטלפון של הלקוח.
 * The client's phone number.
 * @returns {Promise<object>} - אובייקט לקוח או null אם לא נמצא.
 * Client object or null if not found.
 */
async function apiFetchClientByPhone(phone) {
  return apiGet('client', { phone });
}

/**
 * שולח הזמנה חדשה לגיליון ההזמנות.
 * Sends a new order to the Orders sheet.
 * @param {object} orderData - אובייקט המכיל את פרטי ההזמנה.
 * An object containing the order details.
 * @returns {Promise<object>} - אובייקט עם סטטוס ההצלחה ומספר הזמנה.
 * An object with success status and order ID.
 */
async function apiSubmitOrder(orderData) {
  return apiPost('submitOrder', orderData);
}

/**
 * מאחזר סטטוס הזמנה/ות לפי מספר הזמנה או שם לקוח.
 * Retrieves order status(es) by order ID or client name.
 * @param {string} query - מספר הזמנה או שם לקוח.
 * Order ID or client name.
 * @returns {Promise<Array>} - מערך של אובייקטי הזמנות תואמים.
 * An array of matching order objects.
 */
async function apiCheckOrderStatus(query) {
  return apiGet('status', { query });
}

/**
 * מאחזר את כל ההזמנות עבור לוח הבקרה.
 * Retrieves all orders for the dashboard.
 * @returns {Promise<Array>} - מערך של כל אובייקטי ההזמנות.
 * An array of all order objects.
 */
async function apiFetchAllOrders() {
  return apiGet('allOrders');
}

/**
 * מעדכן סטטוס של הזמנה ספציפית.
 * Updates the status of a specific order.
 * @param {string} orderId - מספר ההזמנה לעדכון.
 * The order ID to update.
 * @param {string} newStatus - הסטטוס החדש.
 * The new status.
 * @returns {Promise<object>} - אובייקט עם סטטוס ההצלחה.
 * An object with success status.
 */
async function apiUpdateOrderStatus(orderId, newStatus) {
  return apiPost('updateStatus', { orderId, newStatus });
}

/**
 * מוחק הזמנה ספציפית.
 * Deletes a specific order.
 * @param {string} orderId - מספר ההזמנה למחיקה.
 * The order ID to delete.
 * @returns {Promise<object>} - אובייקט עם סטטוס ההצלחה.
 * An object with success status.
 */
async function apiDeleteOrder(orderId) {
  return apiPost('deleteOrder', { orderId });
}

/**
 * מאחזר את כל הדוחות והסיכומים.
 * Retrieves all reports and summaries.
 * @returns {Promise<object>} - אובייקט המכיל את נתוני הדוחות.
 * An object containing the report data.
 */
async function apiFetchReports() {
  return apiGet('reports');
}

/**
 * מאחזר הזמנות לפי מספר טלפון של לקוח.
 * Retrieves orders by client phone number.
 * @param {string} phone - מספר הטלפון של הלקוח.
 * The client's phone number.
 * @returns {Promise<Array>} - מערך של אובייקטי הזמנות של הלקוח.
 * An array of the client's order objects.
 */
async function apiFetchOrdersByPhone(phone) {
  return apiGet('ordersByPhone', { phone });
}
