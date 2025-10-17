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
  items: { name: string; quantity: number; price: number; sku?: string }[];
  total: number;
}


// Fetches products from a Google Sheet Web App
export const fetchProducts = async (): Promise<Product[]> => {
  const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwQp95Xkwvzlu1a4NQpmPU5YO91m0IN0xLv1Ue_SVpKajbgm87ilInmAzZbdOMNn9i2/exec';

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
      lastOrderIdCounter++;
      const newOrderId = `FCT-${String(lastOrderIdCounter).padStart(5, '0')}`;

      // ✅ Use the real SKU from the cart item, not from the static mockProducts list.
      const confirmedOrder: ConfirmedOrder = {
        ...orderDetails,
        id: newOrderId,
        date: new Date().toISOString(),
        items: orderDetails.items.map(item => ({
          ...item,
          sku: item.sku || "غير متوفر" // Use SKU from the cart item which has the real data.
        })),
      };

      console.log(`Mock API: Order confirmed with ID ${confirmedOrder.id}, saved to Sheet.`);
      console.log("✅ Items with SKU:", confirmedOrder.items); // تحقق في الـ console من وجود sku

      resolve({ success: true, message: 'تم تأكيد طلبك بنجاح!', order: confirmedOrder });
    }, 1500);
  });
};


// Sends invoice data to the Google Apps Script endpoint
export async function sendInvoiceToGoogleScript(order: InvoicePayload) {
  try {
    // ✅ نضيف الـ SKU داخل كل منتج قبل الإرسال
    const orderWithSKU = {
      ...order,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        // FIX: Corrected property access to only use `item.sku` as `item.SKU` and `item.id` do not exist on the type.
        sku: item.sku || 'N/A'
      }))
    };

    await fetch(
      "https://script.google.com/macros/s/AKfycbw8tSvg2S1nyMSifcS4nBIBdw51kytcYjRbAOZQ7alTQfIqRgAX76g8p7BpScR3Q2vYnw/exec",
      {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ order: orderWithSKU }),
      }
    );

    console.log("✅ Invoice data (with SKU) sent to Google Apps Script.");
    alert("تم إرسال بيانات الفاتورة بنجاح. سيتم إرسال الفاتورة عبر البريد الإلكتروني.");

  } catch (error) {
    console.error("🚨 Network error:", error);
    alert("⚠️ فشل الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
  }
}


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