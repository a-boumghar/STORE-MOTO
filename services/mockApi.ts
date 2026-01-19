
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

let lastOrderIdCounter = mockPastOrders.length;

export interface InvoicePayload {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number; price: number; sku?: string }[];
  total: number;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwQp95Xkwvzlu1a4NQpmPU5YO91m0IN0xLv1Ue_SVpKajbgm87ilInmAzZbdOMNn9i2/exec';
  try {
    const response = await fetch(GOOGLE_SHEET_API_URL);
    if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map((p: any) => ({
        id: Number(p.id),
        name: String(p.name || ''),
        price: Number(p.price),
        image: String(p.image || ''),
        category: String(p.category || 'غير مصنف'),
        piecesPerCarton: p.piecesPerCarton ? Number(p.piecesPerCarton) : undefined,
        sku: p.sku ? String(p.sku) : undefined,
    })).filter(p => p.id && p.name && p.price > 0);
  } catch (error) {
    console.error("Error fetching products from Google Sheet:", error);
    return []; 
  }
};

/**
 * Fetches a promotional image URL from a published Google Sheet CSV.
 * It assumes Column A contains the image URL and returns the first row's value.
 */
export const fetchPromoImage = async (): Promise<string | null> => {
    // Note: User must publish their sheet to the web as CSV
    // Example format: https://docs.google.com/spreadsheets/d/ID/pub?output=csv
    // Replace with your actual published CSV link.
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSQvYt7y-M8YvB_G_h5P5Z-8W9G3_Lp-qW6K4O8Y4H5G3_Lp-qW6K4O8Y4H/pub?output=csv';
    
    try {
        const response = await fetch(SHEET_CSV_URL);
        const text = await response.text();
        const rows = text.split('\n');
        if (rows.length > 0) {
            const firstRow = rows[0].split(',');
            const imageUrl = firstRow[0].trim();
            // Validate if it's a URL
            if (imageUrl.startsWith('http')) return imageUrl;
        }
        return null;
    } catch (error) {
        console.error("Error fetching promo image from Google Sheet:", error);
        // Fallback to a default promo image or null
        return 'https://picsum.photos/seed/promo/800/800'; 
    }
};

export const confirmOrder = (orderDetails: OrderDetails): Promise<{ success: boolean; message: string; order: ConfirmedOrder }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      lastOrderIdCounter++;
      const newOrderId = `FCT-${String(lastOrderIdCounter).padStart(5, '0')}`;
      const confirmedOrder: ConfirmedOrder = {
        ...orderDetails,
        id: newOrderId,
        date: new Date().toISOString(),
        items: orderDetails.items.map(item => ({
          ...item,
          sku: item.sku || "غير متوفر"
        })),
      };
      resolve({ success: true, message: 'تم تأكيد طلبك بنجاح!', order: confirmedOrder });
    }, 1500);
  });
};

export async function sendInvoiceToGoogleScript(order: InvoicePayload) {
  try {
    const orderWithSKU = {
      ...order,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku || 'N/A'
      }))
    };
    await fetch(
      "https://script.google.com/macros/s/AKfycbz2bZFlzcVn5oZxXDyPNrs5GRzmAAZU8M9gXXVTZnOFbMqKoJsMd4NWQ9XdjTZZgBWOgg/exec",
      {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ order: orderWithSKU }),
      }
    );
  } catch (error) {
    console.error("🚨 Network error sending invoice:", error);
  }
}

export const fetchOrderHistory = (): Promise<ConfirmedOrder[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockPastOrders);
    }, 800);
  });
};
