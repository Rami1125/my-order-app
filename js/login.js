// js/login.js

/**
 * מציג הודעה למשתמש בתוך אלמנט ייעודי.
 * @param {string} message - תוכן ההודעה.
 * @param {string} type - סוג ההודעה (לדוגמה: 'success', 'error').
 */
function showMessage(message, type = 'info') {
  const messageContainer = document.getElementById('message-container');
  if (!messageContainer) return;

  // יצירת אלמנט הודעה
  const messageDiv = document.createElement('div');
  messageDiv.className = `p-3 mt-4 rounded-lg text-center ${
    type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
  }`;
  messageDiv.textContent = message;

  // ניקוי הודעות קודמות והוספת החדשה
  messageContainer.innerHTML = '';
  messageContainer.appendChild(messageDiv);

  // הסתרת ההודעה לאחר מספר שניות
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

/**
 * מטפל בלוגיקת ההתחברות של המשתמש.
 * שולף את מספר הטלפון, מאמת אותו מול ה-API, ושומר ב-localStorage.
 * מפנה לפורטל הלקוח או מציג שגיאה.
 */
async function login() {
  const phoneInput = document.getElementById("phone");
  const phone = phoneInput.value.trim(); // הסרת רווחים מיותרים

  if (!phone) {
    showMessage("אנא הזן מספר טלפון.", "error");
    return;
  }

  try {
    // קריאה ל-API כדי לאמת את מספר הטלפון ולקבל פרטי לקוח
    // ה-API יחזיר אובייקט לקוח אם הטלפון קיים, אחרת null/שגיאה.
    const clientData = await apiFetchClientByPhone(phone);

    if (clientData && clientData.name) { // ודא שהלקוח קיים ושיש לו שם
      localStorage.setItem("userPhone", phone); // שמירת מספר הטלפון ב-localStorage
      localStorage.setItem("userName", clientData.name); // שמירת שם הלקוח
      localStorage.setItem("clientSites", JSON.stringify(clientData.sites || [])); // שמירת אתרי הלקוח
      window.location.href = "client_portal.html"; // הפניה לדף פורטל הלקוח
    } else {
      showMessage("מספר טלפון שגוי או לקוח לא נמצא.", "error");
      phoneInput.value = ''; // ניקוי שדה הטלפון
    }
  } catch (error) {
    console.error("שגיאה בהתחברות:", error);
    showMessage("אירעה שגיאה בשרת. נסה שוב מאוחר יותר.", "error");
    phoneInput.value = ''; // ניקוי שדה הטלפון
  }
}
