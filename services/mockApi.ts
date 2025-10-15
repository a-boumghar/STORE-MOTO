import { Product, OrderDetails, CartItem, ConfirmedOrder } from '../types';

const mockProducts: Product[] = [
  { id: 1, name: 'فلتر زيت المحرك', price: 50, image: 'https://picsum.photos/seed/part1/400/400', category: 'فلاتر', piecesPerCarton: 100, sku: 'FLT-OIL-001' },
  { id: 2, name: 'سلسلة وجنزير', price: 250, image: 'https://picsum.photos/seed/part2/400/400', category: 'نظام الدفع', piecesPerCarton: 10, sku: 'DRV-CHN-002' },
  { id: 3, name: 'بطارية 12 فولت', price: 300, image: 'https://picsum.photos/seed/part3/400/400', category: 'كهرباء', piecesPerCarton: 4, sku: 'ELC-BAT-003' },
  { id: 4, name: 'مجموعة فرامل أمامية', price: 180, image: 'https://picsum.photos/seed/part4/400/400', category: 'فرامل', piecesPerCarton: 8, sku: 'BRK-FRT-004' },
  { id: 5, name: 'إطار رياضي', price: 450, image: 'https://picsum.photos/seed/part5/400/400', category: 'إطارات', sku: 'TIR-SPR-005' },
  { id: 6, name: 'مصباح أمامي LED', price: 120, image: 'https://picsum.photos/seed/part6/400/400', category: 'كهرباء', piecesPerCarton: 50, sku: 'ELC-LED-006' },
  { id: 7, name: 'زيت محرك 10W-40', price: 80, image: 'https://picsum.photos/seed/part7/400/400', category: 'زيوت وسوائل', piecesPerCarton: 12, sku: 'OIL-MOT-007' },
  { id: 8, name: 'فلتر هواء', price: 65, image: 'https://picsum.photos/seed/part8/400/400', category: 'فلاتر', piecesPerCarton: 80, sku: 'FLT-AIR-008' },
  { id: 9, name: 'وسادات فرامل خلفية', price: 90, image: 'https://picsum.photos/seed/part9/400/400', category: 'فرامل', piecesPerCarton: 20, sku: 'BRK-RAR-009' },
  { id: 10, name: 'مقبض يد رياضي', price: 75, image: 'https://picsum.photos/seed/part10/400/400', category: 'إكسسوارات', piecesPerCarton: 25, sku: 'ACC-GRP-010' },
  { id: 11, name: 'مرآة جانبية', price: 55, image: 'https://picsum.photos/seed/part11/400/400', category: 'إكسسوارات', piecesPerCarton: 30, sku: 'ACC-MIR-011' },
  { id: 12, name: 'شمعة احتراق (بوجيه)', price: 25, image: 'https://picsum.photos/seed/part12/400/400', category: 'كهرباء', piecesPerCarton: 200, sku: 'ELC-SPK-012' },
];

const mockPastOrders: ConfirmedOrder[] = [
    {
        id: 'FCT-00001',
        date: '2023-01-01T00:00:00.000Z',
        customerName: 'أحمد محمود',
        phone: '01012345678',
        address: '123 شارع النصر، القاهرة',
        items: [
            { ...mockProducts[0], quantity: 2 },
            { ...mockProducts[6], quantity: 1 },
        ],
        total: (mockProducts[0].price * 2) + mockProducts[6].price,
    },
    {
        id: 'FCT-00002',
        date: '2023-02-01T00:00:00.000Z',
        customerName: 'فاطمة علي',
        phone: '01198765432',
        address: '456 شارع الجمهورية، الإسكندرية',
        items: [
            { ...mockProducts[2], quantity: 1 },
            { ...mockProducts[5], quantity: 1 },
            { ...mockProducts[11], quantity: 2 },
        ],
        total: mockProducts[2].price + mockProducts[5].price + (mockProducts[11].price * 2),
    }
];

// This simulates a database sequence. It starts after the existing mock orders.
let lastOrderIdCounter = mockPastOrders.length;

// This type matches the sanitized order payload for the invoice script
export interface InvoicePayload {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}


// Fetches products from a Google Sheet Web App
export const fetchProducts = async (): Promise<Product[]> => {
  const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbx2xYsiALW3gBYxvWc4uBlELxmoKCI3H-BqgMTn2HdFAxmZjXtViYmaqaiBfKti2RGHfg/exec';

  console.log('API: Fetching products from Google Sheet...');
  
  try {
    const response = await fetch(GOOGLE_SHEET_API_URL);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('API: Products fetched successfully.');
    
    // Ensure data is an array and fields have correct types, as Google Sheets can be inconsistent.
    if (!Array.isArray(data)) {
        console.error("API Error: Expected an array of products but received:", data);
        return [];
    }

    return data.map((p: any) => ({
        id: Number(p.id),
        name: String(p.name || ''),
        price: Number(p.price),
        image: String(p.image || ''),
        category: String(p.category || 'غير مصنف'),
        piecesPerCarton: p.piecesPerCarton ? Number(p.piecesPerCarton) : undefined,
        sku: p.sku ? String(p.sku) : undefined,
    })).filter(p => p.id && p.name && p.price > 0); // Filter out any invalid or empty rows from the sheet
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error);
    // Fallback to an empty array to prevent the app from crashing.
    return []; 
  }
};


// Simulates confirming an order and saving to a sheet.
export const confirmOrder = (orderDetails: OrderDetails): Promise<{ success: boolean; message: string; order: ConfirmedOrder }> => {
  console.log('Mock API: Confirming order with details:', orderDetails);
  return new Promise(resolve => {
    setTimeout(() => {
      lastOrderIdCounter++; // Increment the order counter
      const newOrderId = `FCT-${String(lastOrderIdCounter).padStart(5, '0')}`; // Format to FCT-0000X

      const confirmedOrder: ConfirmedOrder = {
        ...orderDetails,
        id: newOrderId,
        date: new Date().toISOString(),
      };
      console.log(`Mock API: Order confirmed with ID ${confirmedOrder.id}, saved to Sheet.`);
      resolve({ success: true, message: 'تم تأكيد طلبك بنجاح!', order: confirmedOrder });
    }, 1500); // 1.5-second delay
  });
};

// Sends invoice data to the Google Apps Script endpoint
export async function sendInvoiceToGoogleScript(order: InvoicePayload) {
  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbwDdQ0R4TioMjRWVh_SWuIcOB0ACn3bbdzTUCmQZqueNu57_6S_G3kRPkMx0PqSms2log/exec",
      {
        method: "POST",
        // This is the key change. 'no-cors' allows sending the request without
        // being blocked by browser security (CORS), but it means we cannot read the response.
        // This is a "fire-and-forget" approach.
        mode: 'no-cors',
        body: JSON.stringify({ order }),
      }
    );

    // With 'no-cors', we cannot read the response. We fire-and-forget and assume success on the client.
    // The actual success/failure confirmation must be handled by the script itself (e.g., sending the confirmation email).
    console.log("✅ Invoice data sent to Google Apps Script. The script will handle processing and confirmation.");
    alert("تم إرسال بيانات الفاتورة بنجاح. سيتم إرسال الفاتورة عبر البريد الإلكتروني.");

  } catch (error) {
    // This will now only catch genuine network errors (e.g., no internet), not CORS errors.
    console.error("🚨 Network error:", error);
    alert("⚠️ فشل الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
  }
}


// Simulates sending an invoice via email
export const sendInvoiceByEmail = (order: ConfirmedOrder, recipientEmail: string): Promise<{ success: boolean; message: string }> => {
  console.log('Mock API: Sending invoice by email to:', recipientEmail, 'for order:', order);
  return new Promise((resolve, reject) => {
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setTimeout(() => reject({ success: false, message: 'عنوان البريد الإلكتروني غير صالح.' }), 500);
      return;
    }
    setTimeout(() => {
      console.log(`Mock API: Email sent to ${recipientEmail} for order ${order.id}.`);
      resolve({ success: true, message: 'تم إرسال الفاتورة بنجاح!' });
    }, 1500); // 1.5-second delay
  });
};

// Simulates fetching past orders
export const fetchOrderHistory = (): Promise<ConfirmedOrder[]> => {
  console.log('Mock API: Fetching order history...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Mock API: Order history fetched successfully.');
      resolve(mockPastOrders);
    }, 800);
  });
};

/*
// Example usage for sendInvoiceToGoogleScript:

const exampleOrder: InvoicePayload = {
  id: "2031",
  customerName: "Abdellah Boumghar",
  phone: "+212612345678",
  address: "Casablanca, Morocco",
  items: [
    { name: "Helmet", quantity: 1, price: 350 },
    { name: "Motor Oil", quantity: 2, price: 120 },
  ],
  total: 590,
};

// This function is called from the CartModal component upon order confirmation.
// sendInvoiceToGoogleScript(exampleOrder);

*/