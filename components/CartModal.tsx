import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../App';
import { OrderDetails, CartItem, ConfirmedOrder } from '../types';
import { CloseIcon, PrintIcon, PlusIcon, MinusIcon, TrashIcon, WhatsAppIcon } from './Icons';
import { confirmOrder as mockConfirmOrder, sendInvoiceByEmail as mockSendInvoiceByEmail } from '../services/mockApi';

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

          // Automatically send invoice email to the business owner
          mockSendInvoiceByEmail(result.order, 'stemotorino@gmail.com')
            .then(() => {
                console.log(`Invoice for order ${result.order.id} sent automatically to business owner.`);
            })
            .catch((error) => {
                console.error(`Failed to automatically send invoice email for order ${result.order.id}:`, error);
            });

        } else {
          alert(`حدث خطأ: ${result.message}`);
        }
    } catch (error) {
        console.error("Error confirming order:", error);
        alert('حدث خطأ غير متوقع عند تأكيد الطلب.');
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
      alert('السلة فارغة، لا يمكن طباعة فاتورة.');
      return;
    }
    
    const orderId = isPrintingConfirmed ? confirmedOrder.id : null;
    const orderDate = isPrintingConfirmed ? new Date(confirmedOrder.date) : new Date();

    const itemsHtml = printData.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${
                // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                item.price.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
            } درهم</td>
            <td>${
                // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition. Also corrected currency symbol.
                (item.price * item.quantity).toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
            } درهم</td>
        </tr>
    `).join('');

    const invoiceHtml = `
      <div class="invoice-box">
        <h1>فاتورة طلب ${orderId ? `#${orderId}` : ''}</h1>
        <div class="invoice-meta">
            <p><strong>رقم الطلب:</strong> ${orderId || 'غير مؤكد'}</p>
            <p><strong>التاريخ:</strong> ${
                // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                orderDate.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
            }</p>
        </div>
        <div class="customer-details">
            <h2>بيانات العميل</h2>
            <p><strong>الاسم:</strong> ${printData.customerName || 'N/A'}</p>
            <p><strong>الهاتف:</strong> ${printData.phone || 'N/A'}</p>
            <p><strong>العنوان:</strong> ${printData.address || 'N/A'}</p>
        </div>
        
        <h2>المنتجات</h2>
        <table>
            <thead>
                <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>سعر الوحدة</th>
                    <th>الإجمالي الفرعي</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div class="total-section">
            <h3>الإجمالي: ${
                // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition. Also corrected currency symbol.
                printData.total.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
            } درهم</h3>
        </div>
      </div>
    `;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) {
        alert('يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة.');
        return;
    }
    
    printWindow.document.write('<html><head><title>فاتورة الطلب</title>');
    printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com">');
    printWindow.document.write('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">');
    
    printWindow.document.write(`
        <style>
            body { 
                font-family: 'Cairo', sans-serif; 
                direction: rtl;
                margin: 0;
                padding: 20px;
                color: #333;
                background-color: #fff;
            }
            .invoice-box {
                max-width: 800px;
                margin: auto;
                padding: 30px;
                border: 1px solid #eee;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                font-size: 16px;
                line-height: 24px;
            }
            h1, h2, h3 {
                color: #000;
            }
            h1 {
              font-size: 2em;
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .invoice-meta {
              margin-bottom: 20px;
              font-size: 0.9em;
              color: #555;
            }
            h2 {
              font-size: 1.5em;
              margin-top: 30px;
              margin-bottom: 10px;
            }
            .customer-details p {
                margin: 5px 0;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
            }
            th, td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: right; 
            }
            th { 
                background-color: #f8f8f8; 
                font-weight: 700;
            }
            .total-section {
                margin-top: 30px;
                text-align: left;
                padding-top: 15px;
                border-top: 2px solid #eee;
            }
            .total-section h3 {
                font-size: 1.4em;
                font-weight: 700;
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

    // Enhanced text-based fallback for browsers that don't support file sharing
    const showTextFallback = () => {
      console.log('Web Share API for files not supported, using text fallback.');
      const itemsText = confirmedOrder.items.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
      const fallbackText = `*فاتورة طلب: ${confirmedOrder.id}*

*العميل:* ${confirmedOrder.customerName}
*الهاتف:* ${confirmedOrder.phone}

*المنتجات:*
${itemsText}

*الإجمالي: ${confirmedOrder.total.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)} درهم*

شكراً لتعاملكم معنا!
*MOTORINO*
      `.trim().replace(/\n/g, '%0A'); // URL-encode newlines
      const whatsappUrl = `https://wa.me/?text=${fallbackText}`;
      window.open(whatsappUrl, '_blank');
    };

    if (!navigator.canShare || !navigator.canShare({ files: [] })) {
      showTextFallback();
      return;
    }

    setIsProcessing(true);

    const printData = confirmedOrder;
    const orderId = printData.id;
    const orderDate = new Date(printData.date);

    const itemsHtml = printData.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)}</td>
        <td>${(item.price * item.quantity).toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)}</td>
      </tr>
    `).join('');

    const invoiceHtml = `
      <html>
      <head>
        <title>فاتورة الطلب ${orderId}</title>
        <meta charset="UTF-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cairo', sans-serif; direction: rtl; margin: 0; color: #333; background-color: #fff; -webkit-font-smoothing: antialiased; }
          .invoice-box { width: 750px; margin: auto; padding: 40px; border: 1px solid #eee; font-size: 16px; line-height: 1.6; }
          .brand-header { text-align: center; margin-bottom: 30px; }
          .brand-header h1 { font-size: 2.8em; font-weight: 900; color: #111; margin: 0; }
          .brand-header p { font-size: 1em; color: #666; margin: 5px 0 0; }
          .invoice-meta, .customer-details { margin-bottom: 30px; font-size: 0.95em; }
          .invoice-meta p, .customer-details p { margin: 4px 0; }
          .invoice-meta strong, .customer-details strong { color: #000; }
          h2 { font-size: 1.6em; margin: 40px 0 15px; border-bottom: 2px solid #eee; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f9f9f9; font-weight: 700; padding: 12px; border: 1px solid #ddd; text-align: right; }
          td { padding: 12px; border: 1px solid #ddd; text-align: right; }
          td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: center; }
          th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
          tr:nth-child(even) { background-color: #fcfcfc; }
          .total-section { margin-top: 30px; text-align: left; padding-top: 15px; border-top: 2px solid #eee; }
          .total-section h3 { font-size: 1.5em; font-weight: 700; color: #000; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="brand-header">
            <h1>MOTORINO</h1>
            <p>متجر قطع غيار الدراجات النارية</p>
          </div>
          <h2>فاتورة طلب #${orderId}</h2>
          <div class="invoice-meta">
            <p><strong>رقم الطلب:</strong> ${orderId}</p>
            <p><strong>التاريخ:</strong> ${orderDate.toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short', numberingSystem: 'latn' } as any)}</p>
          </div>
          <div class="customer-details">
            <p><strong>العميل:</strong> ${printData.customerName}</p>
            <p><strong>الهاتف:</strong> ${printData.phone}</p>
            <p><strong>العنوان:</strong> ${printData.address}</p>
          </div>
          <h2>المنتجات</h2>
          <table>
            <thead><tr><th>المنتج</th><th>الكمية</th><th>سعر الوحدة (درهم)</th><th>الإجمالي (درهم)</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="total-section">
            <h3>الإجمالي: ${printData.total.toLocaleString('ar-EG', { style: 'currency', currency: 'AED', numberingSystem: 'latn' } as any)}</h3>
          </div>
        </div>
      </body>
      </html>
    `;

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '-9999px';
    container.innerHTML = invoiceHtml;
    document.body.appendChild(container);

    const invoiceElement = container.querySelector<HTMLElement>('.invoice-box');
    if (!invoiceElement) {
        console.error('Invoice element not found');
        document.body.removeChild(container);
        setIsProcessing(false);
        return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Allow fonts to load

      const canvas = await html2canvas(invoiceElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const { jsPDF } = jspdf;
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let imgWidth = pdfWidth - 40; // 20px margin on each side
      let imgHeight = imgWidth / canvasAspectRatio;

      if (imgHeight > pdfHeight - 40) {
        imgHeight = pdfHeight - 40; // 20px margin top/bottom
        imgWidth = imgHeight * canvasAspectRatio;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = 20;

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], `Facture-${orderId}.pdf`, { type: 'application/pdf' });
      
      await navigator.share({
        title: `فاتورة طلب ${orderId}`,
        text: `مرفق فاتورة طلبك رقم ${orderId} من MOTORINO.`,
        files: [pdfFile],
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      // The navigator.share promise rejects if the user cancels.
      // We can alert the user that sharing failed.
      alert('تم إلغاء المشاركة أو حدث خطأ ما.');
    } finally {
      document.body.removeChild(container);
      setIsProcessing(false);
    }
  };
  
  const modalClasses = isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none';
  const contentClasses = isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0';

  return (
    <div className={`fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50 transition-opacity duration-300 ${modalClasses}`}>
      <div className={`bg-slate-800 text-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ${contentClasses}`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-amber-500">{orderSuccess ? 'تم تأكيد الطلب' : 'سلة التسوق'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors"><CloseIcon /></button>
        </div>

        {orderSuccess ? (
             <div className="p-8 text-center flex flex-col items-center gap-4">
                <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold">شكراً لك!</h3>
                <p className="text-slate-300">لقد تم استلام طلبك وسنتواصل معك قريباً. رقم طلبك هو: <span className="font-bold text-amber-400">{confirmedOrder?.id}</span></p>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-sm">
                   <button onClick={handlePrint} className="flex-1 bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-2">
                      <PrintIcon />
                      طباعة الفاتورة
                   </button>
                   <button onClick={handleSendWhatsApp} disabled={isProcessing} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed">
                      <WhatsAppIcon />
                      {isProcessing ? 'جاري التجهيز...' : 'إرسال عبر واتساب'}
                   </button>
                   <button onClick={onClose} className="flex-1 bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 transition-colors">إغلاق</button>
                </div>
            </div>
        ) : (
            <>
                <div className="flex-grow p-4 overflow-y-auto">
                    {cartItems.length === 0 ? (
                    <p className="text-center text-slate-400 py-10">سلتك فارغة.</p>
                    ) : (
                    <>
                        {/* Items */}
                        <div className="space-y-3">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4 bg-slate-700/50 p-2 rounded-lg">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-sm text-amber-400">{
                                        // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                                        item.price.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
                                    } درهم</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-slate-600 hover:bg-amber-500"><PlusIcon size={16}/></button>
                                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-slate-600 hover:bg-amber-500"><MinusIcon size={16}/></button>
                                </div>
                                <p className="w-24 text-start font-bold">{
                                    // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                                    (item.price * item.quantity).toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
                                } درهم</p>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 p-2"><TrashIcon /></button>
                                </div>
                            ))}
                        </div>
                        {/* Total */}
                        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
                            <p className="text-lg font-bold">الإجمالي:</p>
                            <p className="text-2xl font-black text-amber-500">{
                                // Fix: Cast Intl options to 'any' to allow 'numberingSystem' which is not in the default TS lib definition.
                                cartTotal.toLocaleString('ar-EG', { numberingSystem: 'latn' } as any)
                            } درهم</p>
                        </div>
                        {/* Customer Form */}
                        <div className="mt-6 pt-4 border-t border-slate-700 space-y-3">
                            <h3 className="font-bold text-lg">بيانات العميل</h3>
                            <div>
                                <label htmlFor="customerName" className="block text-sm font-medium text-slate-300 mb-1">الاسم</label>
                                <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">رقم الهاتف</label>
                                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-1">العنوان</label>
                                <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                        </div>
                    </>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="p-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                        <button onClick={handleConfirmOrder} disabled={isProcessing} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
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