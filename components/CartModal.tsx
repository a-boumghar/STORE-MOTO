import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../App';
import { OrderDetails, CartItem, ConfirmedOrder } from '../types';
import { CloseIcon, PrintIcon, PlusIcon, MinusIcon, TrashIcon, WhatsAppIcon } from './Icons';
import { confirmOrder as mockConfirmOrder, sendInvoiceToGoogleScript } from '../services/mockApi';

// Declarations for CDN libraries
declare const html2canvas: any;
declare const jspdf: { jsPDF: any };

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const cartContext = useContext(CartContext);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);


  useEffect(() => {
    if (!isOpen) {
        // Reset state on close
        setTimeout(() => {
            setCustomerName('');
            setPhone('');
            setAddress('');
            setOrderSuccess(false);
            setIsProcessing(false);
            setConfirmedOrder(null);
        }, 300); // Delay to allow closing animation
    }
  }, [isOpen]);

  if (!cartContext) return null;
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = cartContext;

  const handleConfirmOrder = async () => {
    if (!customerName || !phone || !address || cartItems.length === 0) {
      alert('الرجاء تعبئة جميع الحقول وإضافة منتجات للسلة.');
      return;
    }
    setIsProcessing(true);
    const orderDetails: OrderDetails = { customerName, phone, address, items: cartItems, total: cartTotal };
    
    try {
        const result = await mockConfirmOrder(orderDetails);
        
        if (result.success) {
          setOrderSuccess(true);
          setConfirmedOrder(result.order);
          clearCart();

          // Sanitize order for the Apps Script payload
          const sanitizedOrder = {
              id: result.order.id,
              customerName: result.order.customerName,
              phone: result.order.phone,
              address: result.order.address,
              total: result.order.total,
              items: result.order.items.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
              }))
          };
          
          // Call the new, robust function to send the invoice.
          // This replaces the old, complex fetch block.
          await sendInvoiceToGoogleScript(sanitizedOrder);
          
        } else {
          alert(`An error occurred: ${result.message}`);
        }
    } catch (error) {
        console.error("Error confirming order:", error);
        alert('An unexpected error occurred while confirming the order.');
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handlePrint = () => {
    const isPrintingConfirmed = !!confirmedOrder;
    const printData = isPrintingConfirmed 
        ? confirmedOrder 
        : { items: cartItems, total: cartTotal, customerName, phone, address };

    if (printData.items.length === 0) {
      alert('The cart is empty, an invoice cannot be printed.');
      return;
    }
    
    const orderId = isPrintingConfirmed ? confirmedOrder.id : null;
    const orderDate = isPrintingConfirmed ? new Date(confirmedOrder.date) : new Date();

    const itemsHtml = printData.items.map(item => `
        <tr>
            <td>${item.name}${item.sku ? `<br><span style="font-size: 0.75rem; color: #64748b;">SKU: ${item.sku}</span>` : ''}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)}</td>
            <td>${(item.price * item.quantity).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)}</td>
        </tr>
    `).join('');

    const invoiceHtml = `
        <div class="invoice-container">
            <div class="invoice-header">
              <img src="https://i.ibb.co/XfBfNLv5/all-logo-brand-copy-png.png" alt="MOTORINO Logo" style="height: 50px; object-fit: contain;" />
            </div>
            <div class="invoice-title-container">
              <h2 class="invoice-title">فاتورة طلب</h2>
            </div>
            <div class="invoice-details">
              <div class="customer-info">
                <h3>بيانات العميل</h3>
                <p><strong>الاسم:</strong> ${printData.customerName || 'N/A'}</p>
                <p><strong>الهاتف:</strong> ${printData.phone || 'N/A'}</p>
                <p><strong>العنوان:</strong> ${printData.address || 'N/A'}</p>
              </div>
              <div class="order-info">
                <h3>بيانات الطلب</h3>
                <p><strong>رقم الطلب:</strong> ${orderId || 'غير مؤكد'}</p>
                <p><strong>التاريخ:</strong> ${orderDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' } as any)}</p>
              </div>
            </div>
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة (درهم)</th>
                  <th>الإجمالي الفرعي (درهم)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="invoice-total">
              <div class="invoice-total-label">الإجمالي:</div>
              <div class="invoice-total-value">${printData.total.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)} درهم</div>
            </div>
            <div class="invoice-footer">
              <p>شكراً لتعاملكم معنا!</p>
            </div>
        </div>
    `;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) {
        alert('Please allow pop-up windows to print the invoice.');
        return;
    }
    
    printWindow.document.write('<html><head><title>فاتورة الطلب</title>');
    printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com">');
    printWindow.document.write('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">');
    
    printWindow.document.write(`
        <style>
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
            body { 
              font-family: 'Cairo', sans-serif; 
              direction: rtl;
              margin: 0;
              color: #1a202c;
              background-color: #fff;
              -webkit-font-smoothing: antialiased;
            }
            .invoice-container {
                padding: 30px;
                background: #fff;
            }
            .invoice-header {
                display: flex;
                justify-content: center;
                align-items: center;
                border-bottom: 4px solid #CC0115;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .brand-name {
                font-size: 2.25rem;
                font-weight: 900;
                color: #1e293b;
            }
            .invoice-title-container {
                text-align: center;
                margin-bottom: 30px;
            }
            .invoice-title {
                font-size: 1.8rem;
                font-weight: 700;
                color: #1e293b;
            }
            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                font-size: 0.875rem;
            }
            .customer-info, .order-info {
                width: 48%;
            }
            .customer-info p, .order-info p {
                margin: 4px 0;
            }
            h3 {
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 8px;
                color: #0f172a;
            }
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                font-size: 0.875rem;
            }
            .invoice-table th, .invoice-table td {
                border-bottom: 1px solid #e2e8f0;
                padding: 12px 8px;
                text-align: right; 
            }
            .invoice-table th {
                background-color: #f1f5f9;
                font-weight: 700;
                color: #334155;
                text-transform: uppercase;
                font-size: 0.75rem;
            }
            .invoice-table tr:last-child td {
                border-bottom: none;
            }
            .invoice-total {
                display: flex;
                justify-content: flex-end;
                align-items: flex-start;
                padding-top: 15px;
                border-top: 2px solid #cbd5e1;
                margin-top: 20px;
            }
            .invoice-total-label {
                font-size: 1.125rem;
                font-weight: 700;
                margin-left: 20px;
                color: #475569;
            }
            .invoice-total-value {
                font-size: 1.5rem;
                font-weight: 900;
                color: #0f172a;
            }
            .invoice-footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 15px;
                border-top: 1px solid #e2e8f0;
                color: #64748b;
                font-size: 0.875rem;
            }
        </style>
    `);
    
    printWindow.document.write('</head><body>');
    printWindow.document.write(invoiceHtml);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
  };

  const handleSendWhatsApp = async () => {
    if (!confirmedOrder) return;

    const fallbackShare = () => {
        const fallbackText = `
فاتورة طلب #${confirmedOrder.id}
العميل: ${confirmedOrder.customerName}
الهاتف: ${confirmedOrder.phone}
---
المنتجات:
${confirmedOrder.items.map(item => `- ${item.name}${item.sku ? ` (SKU: ${item.sku})` : ''} (x${item.quantity})`).join('\n')}
---
الإجمالي: ${confirmedOrder.total.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)} درهم
شكراً لتعاملكم معنا!
        `.trim().replace(/^ +/gm, '');
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fallbackText)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    // Check for Web Share API support for files
    if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [new File([], 'test.pdf', { type: 'application/pdf' })] })) {
      fallbackShare();
      return;
    }

    setIsProcessing(true);

    const printData = confirmedOrder;
    const orderId = printData.id;
    const orderDate = new Date(printData.date);

    const itemsHtml = printData.items.map(item => `
        <tr>
            <td>${item.name}${item.sku ? `<br><span style="font-size: 0.75rem; color: #64748b;">SKU: ${item.sku}</span>` : ''}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)}</td>
            <td>${(item.price * item.quantity).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)}</td>
        </tr>
    `).join('');

    const invoiceHtml = `
      <html>
        <head>
          <title>فاتورة الطلب</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Cairo', sans-serif; 
              direction: rtl;
              margin: 0;
              color: #1a202c;
              background-color: #fff;
              -webkit-font-smoothing: antialiased;
            }
            .invoice-container {
                padding: 30px;
                background: #fff;
            }
            .invoice-header {
                display: flex;
                justify-content: center;
                align-items: center;
                border-bottom: 4px solid #CC0115; /* red-600 */
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .brand-name {
                font-size: 2.25rem;
                font-weight: 900;
                color: #1e293b; /* slate-800 */
            }
            .invoice-title-container {
                text-align: center;
                margin-bottom: 30px;
            }
            .invoice-title {
                font-size: 1.8rem;
                font-weight: 700;
                color: #1e293b; /* slate-800 */
            }
            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                font-size: 0.875rem;
            }
            .customer-info, .order-info {
                width: 48%;
            }
            .customer-info p, .order-info p {
                margin: 4px 0;
            }
            h3 {
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 8px;
                color: #0f172a; /* slate-900 */
            }
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                font-size: 0.875rem;
            }
            .invoice-table th, .invoice-table td {
                border-bottom: 1px solid #e2e8f0; /* slate-200 */
                padding: 12px 8px;
                text-align: right; 
            }
            .invoice-table th {
                background-color: #f1f5f9; /* slate-100 */
                font-weight: 700;
                color: #334155; /* slate-700 */
                text-transform: uppercase;
                font-size: 0.75rem;
            }
            .invoice-table tr:last-child td {
                border-bottom: none;
            }
            .invoice-total {
                display: flex;
                justify-content: flex-end;
                align-items: flex-start;
                padding-top: 15px;
                border-top: 2px solid #cbd5e1; /* slate-300 */
                margin-top: 20px;
            }
            .invoice-total-label {
                font-size: 1.125rem;
                font-weight: 700;
                margin-left: 20px;
                color: #475569; /* slate-600 */
            }
            .invoice-total-value {
                font-size: 1.5rem;
                font-weight: 900;
                color: #0f172a; /* slate-900 */
            }
            .invoice-footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 15px;
                border-top: 1px solid #e2e8f0; /* slate-200 */
                color: #64748b; /* slate-500 */
                font-size: 0.875rem;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <img src="https://i.ibb.co/XfBfNLv5/all-logo-brand-copy-png.png" alt="MOTORINO Logo" style="height: 50px; object-fit: contain;" />
            </div>
            <div class="invoice-title-container">
                <h2 class="invoice-title">فاتورة طلب</h2>
            </div>
            <div class="invoice-details">
              <div class="customer-info">
                <h3>بيانات العميل</h3>
                <p><strong>الاسم:</strong> ${printData.customerName}</p>
                <p><strong>الهاتف:</strong> ${printData.phone}</p>
                <p><strong>العنوان:</strong> ${printData.address}</p>
              </div>
              <div class="order-info">
                <h3>بيانات الطلب</h3>
                <p><strong>رقم الطلب:</strong> ${orderId}</p>
                <p><strong>التاريخ:</strong> ${orderDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' } as any)}</p>
              </div>
            </div>
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة (درهم)</th>
                  <th>الإجمالي الفرعي (درهم)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="invoice-total">
              <div class="invoice-total-label">الإجمالي:</div>
              <div class="invoice-total-value">${printData.total.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)} درهم</div>
            </div>
            <div class="invoice-footer">
              <p>شكراً لتعاملكم معنا!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const container = document.createElement('div');
    container.style.width = '794px';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.innerHTML = invoiceHtml;
    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const { jsPDF } = jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasAspectRatio = canvas.width / canvas.height;

        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / canvasAspectRatio;

        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = pdfHeight * canvasAspectRatio;
        }

        const xOffset = (pdfWidth - imgWidth) / 2;

        pdf.addImage(imgData, 'JPEG', xOffset, 0, imgWidth, imgHeight);

        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], `invoice-${orderId}.pdf`, { type: 'application/pdf' });
        
        await navigator.share({
            title: `فاتورة طلب ${orderId}`,
            text: `مرفق فاتورة طلبك رقم ${orderId}.`,
            files: [pdfFile],
        });

    } catch (error) {
        console.error('Error sharing PDF:', error);
        fallbackShare();
    } finally {
        document.body.removeChild(container);
        setIsProcessing(false);
    }
  };
  
  const modalClasses = isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none';
  const contentClasses = isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0';

  return (
    <div className={`fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50 transition-opacity duration-300 ${modalClasses}`}>
      <div className={`bg-white text-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ${contentClasses}`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-red-600">{orderSuccess ? 'تم تأكيد الطلب' : 'سلة التسوق'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><CloseIcon /></button>
        </div>

        {orderSuccess ? (
             <div className="p-8 text-center flex flex-col items-center gap-4">
                <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold">شكراً لك!</h3>
                <p className="text-slate-600">لقد تم استلام طلبك وسنتواصل معك قريباً. رقم طلبك هو: <span className="font-bold text-red-600">{confirmedOrder?.id}</span></p>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-sm">
                   <button onClick={handlePrint} className="flex-1 bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-2">
                      <PrintIcon />
                      طباعة الفاتورة
                   </button>
                   <button onClick={handleSendWhatsApp} disabled={isProcessing} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed">
                      <WhatsAppIcon />
                      {isProcessing ? 'جاري التجهيز...' : 'إرسال عبر واتساب'}
                   </button>
                   <button onClick={onClose} className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-500 transition-colors">إغلاق</button>
                </div>
            </div>
        ) : (
            <>
                <div className="flex-grow p-4 overflow-y-auto">
                    {cartItems.length === 0 ? (
                    <p className="text-center text-slate-500 py-10">سلتك فارغة.</p>
                    ) : (
                    <>
                        {/* Items */}
                        <div className="space-y-3">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-sm text-red-600">{
                                        item.price.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)
                                    } درهم</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-slate-200 hover:bg-red-600 hover:text-white transition-colors"><PlusIcon size={16}/></button>
                                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-slate-200 hover:bg-red-600 hover:text-white transition-colors"><MinusIcon size={16}/></button>
                                </div>
                                <p className="w-24 text-start font-bold">{
                                    (item.price * item.quantity).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)
                                } درهم</p>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 p-2 transition-colors"><TrashIcon /></button>
                                </div>
                            ))}
                        </div>
                        {/* Total */}
                        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
                            <p className="text-lg font-bold">الإجمالي:</p>
                            <p className="text-2xl font-black text-red-600">{
                                cartTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' } as any)
                            } درهم</p>
                        </div>
                        {/* Customer Form */}
                        <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                            <h3 className="font-bold text-lg">بيانات العميل</h3>
                            <div>
                                <label htmlFor="customerName" className="block text-sm font-medium text-slate-600 mb-1">الاسم</label>
                                <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-900" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">رقم الهاتف</label>
                                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-900" />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-1">العنوان</label>
                                <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 text-slate-900" />
                            </div>
                        </div>
                    </>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                        <button onClick={handleConfirmOrder} disabled={isProcessing} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isProcessing ? 'جاري التأكيد...' : 'تأكيد الطلب'}
                        </button>
                        <button onClick={handlePrint} className="flex-1 bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-2">
                            <PrintIcon />
                            طباعة
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default CartModal;